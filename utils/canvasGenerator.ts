
/**
 * Helper to perform stepped downscaling.
 * Direct resizing from 8000px -> 1000px causes severe aliasing (jagged edges).
 * Resizing in steps (50%) allows the browser to use bi-linear interpolation effectively.
 */
const getSteppedScaledImage = (
  img: HTMLImageElement,
  targetWidth: number,
  targetHeight: number
): HTMLCanvasElement | HTMLImageElement => {
  // If image is not significantly larger than target, return original
  if (img.width < targetWidth * 2 && img.height < targetHeight * 2) {
    return img;
  }

  // Create an offscreen canvas for processing
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return img;

  // Start with half the original size
  let curWidth = img.width * 0.5;
  let curHeight = img.height * 0.5;

  canvas.width = curWidth;
  canvas.height = curHeight;

  // First draw
  ctx.drawImage(img, 0, 0, curWidth, curHeight);

  // While still more than 2x the target, keep halving
  while (curWidth > targetWidth * 2) {
    const newWidth = curWidth * 0.5;
    const newHeight = curHeight * 0.5;

    // Draw onto itself (this works in canvas)
    ctx.drawImage(canvas, 0, 0, curWidth, curHeight, 0, 0, newWidth, newHeight);

    curWidth = newWidth;
    curHeight = newHeight;
  }

  // Crop the canvas to the final stepped size to save memory
  const finalCanvas = document.createElement('canvas');
  finalCanvas.width = curWidth;
  finalCanvas.height = curHeight;
  const finalCtx = finalCanvas.getContext('2d');
  finalCtx?.drawImage(canvas, 0, 0, curWidth, curHeight, 0, 0, curWidth, curHeight);

  // Clean up intermediate canvas
  canvas.width = 0;
  canvas.height = 0;

  return finalCanvas;
};

/**
 * Generates a seamless noise pattern to simulate film grain.
 */
const createGrainPattern = (ctx: CanvasRenderingContext2D) => {
  const w = 512;
  const h = 512;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const nCtx = canvas.getContext('2d');
  if (!nCtx) return null;

  const imgData = nCtx.createImageData(w, h);
  const data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    // Generate grayscale noise
    const val = 100 + Math.random() * 55; // Mid-grey base (100-155)
    data[i] = val;     // R
    data[i + 1] = val; // G
    data[i + 2] = val; // B
    data[i + 3] = 255; // Alpha
  }

  nCtx.putImageData(imgData, 0, 0);
  return ctx.createPattern(canvas, 'repeat');
};

export const generatePolaroidImage = async (
  imageSrc: string,
  caption: string,
  date: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // 1. Setup High-Res Canvas (2400x3000 approx 8x10 @ 300DPI)
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { alpha: false }); // Optimize for no transparency
    if (!ctx) return reject('No canvas context');

    const width = 2400;
    const height = 3000;
    canvas.width = width;
    canvas.height = height;

    // 2. Draw Paper Background - Warm Ivory instead of Pure White
    ctx.fillStyle = '#FFFDF8';
    ctx.fillRect(0, 0, width, height);

    // 3. Load Image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        // Dimensions for photo area (Square with margins)
        const margin = 160;
        const photoSize = width - (margin * 2); // 2080x2080
        const photoY = margin;

        // --- IMAGE PROCESSING ---
        ctx.save();

        // Create clipping path
        ctx.beginPath();
        ctx.rect(margin, photoY, photoSize, photoSize);
        ctx.clip();

        // Calculate Scale (Object-fit: Cover)
        const scale = Math.max(photoSize / img.width, photoSize / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;

        // Top-anchored alignment (matches object-top)
        const x = margin + (photoSize - scaledWidth) / 2;
        const y = photoY;

        // Perform Stepped Downscaling
        const optimImage = getSteppedScaledImage(img, scaledWidth, scaledHeight);

        // Apply "Universal Analog" Filter Stack
        // 1. Flash Look: Boost brightness & contrast slightly to mimic direct flash
        // 2. Saturation: Boost slightly to counteract the fading effects added later
        // 3. NO SEPIA: We want natural colors, texture provides the vintage feel
        ctx.filter = 'contrast(1.1) brightness(1.1) saturate(1.1)';

        // Draw the optimized image
        ctx.drawImage(optimImage, x, y, scaledWidth, scaledHeight);

        // Reset filters for overlays
        ctx.filter = 'none';

        // Layer 1: Lifted Blacks (The "Fade")
        // Light cream overlay to wash out deep blacks -> dark grey
        ctx.fillStyle = 'rgba(255, 253, 248, 0.05)';
        ctx.globalCompositeOperation = 'screen';
        ctx.fillRect(margin, photoY, photoSize, photoSize);

        // Layer 2: Warm Lens Coating
        // Very subtle golden overlay to unify lighting
        ctx.fillStyle = 'rgba(255, 200, 50, 0.04)';
        ctx.globalCompositeOperation = 'overlay';
        ctx.fillRect(margin, photoY, photoSize, photoSize);

        // Layer 3: Vignette (Darker corners)
        const gradient = ctx.createRadialGradient(
          width / 2, photoY + photoSize / 2, photoSize * 0.4,
          width / 2, photoY + photoSize / 2, photoSize * 0.95
        );
        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(1, 'rgba(30,20,10,0.2)'); // Warm brown/black vignette

        ctx.fillStyle = gradient;
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillRect(margin, photoY, photoSize, photoSize);

        ctx.restore();

        // --- GLOBAL TEXTURE (FILM GRAIN) ---
        // We apply this over EVERYTHING (Photo + Paper Border)
        // This acts as the "glue" that makes it look like one physical object
        const grainPattern = createGrainPattern(ctx);
        if (grainPattern) {
          ctx.save();
          ctx.globalCompositeOperation = 'overlay';
          ctx.globalAlpha = 0.06; // 6% Strength
          ctx.fillStyle = grainPattern;
          ctx.fillRect(0, 0, width, height);
          ctx.restore();
        }

        // --- TYPOGRAPHY ---
        ctx.textAlign = 'center';
        // Reset composite operation to normal for text
        ctx.globalCompositeOperation = 'source-over';

        // Caption - "Great Vibes"
        ctx.fillStyle = '#2a2a2a'; // Soft Black (not pure black)
        ctx.font = '220px "Great Vibes"';

        const textCenterX = width / 2;
        const textAreaStart = photoY + photoSize;
        const captionY = textAreaStart + 350;
        ctx.fillText(caption, textCenterX, captionY);

        // Date - "Inter"
        ctx.fillStyle = '#888888'; // Grey
        ctx.font = '500 70px "Inter", sans-serif';

        const dateString = date.toUpperCase();
        const dateY = captionY + 120;

        ctx.save();
        ctx.fillText(dateString.split('').join(' '), textCenterX, dateY);
        ctx.restore();

        // --- EXPORT ---
        resolve(canvas.toDataURL('image/jpeg', 0.92));

        // Cleanup
        canvas.width = 0;
        canvas.height = 0;
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = (e) => {
      console.error("Canvas image load error", e);
      reject(e);
    };

    img.src = imageSrc;
  });
};
