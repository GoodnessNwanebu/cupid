import smartcrop from 'smartcrop';

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
  if (img.width < targetWidth * 2 && img.height < targetHeight * 2) {
    return img;
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return img;

  let curWidth = img.width * 0.5;
  let curHeight = img.height * 0.5;

  canvas.width = curWidth;
  canvas.height = curHeight;
  ctx.drawImage(img, 0, 0, curWidth, curHeight);

  while (curWidth > targetWidth * 2) {
    const newWidth = curWidth * 0.5;
    const newHeight = curHeight * 0.5;
    ctx.drawImage(canvas, 0, 0, curWidth, curHeight, 0, 0, newWidth, newHeight);
    curWidth = newWidth;
    curHeight = newHeight;
  }

  const finalCanvas = document.createElement('canvas');
  finalCanvas.width = curWidth;
  finalCanvas.height = curHeight;
  const finalCtx = finalCanvas.getContext('2d');
  finalCtx?.drawImage(canvas, 0, 0, curWidth, curHeight, 0, 0, curWidth, curHeight);

  canvas.width = 0;
  canvas.height = 0;

  return finalCanvas;
};

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
    const val = 100 + Math.random() * 55;
    data[i] = val;
    data[i + 1] = val;
    data[i + 2] = val;
    data[i + 3] = 255;
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
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return reject('No canvas context');

    const width = 2400;
    const height = 3000;
    canvas.width = width;
    canvas.height = height;

    ctx.fillStyle = '#FFFDF8';
    ctx.fillRect(0, 0, width, height);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = async () => {
      try {
        const margin = 160;
        const photoWidth = width - (margin * 2); // 2080
        const photoHeight = Math.floor(photoWidth * 1.25); // 2600 (4:5 ratio)
        const photoY = margin;

        const cropResult = await smartcrop.crop(img, { width: photoWidth, height: photoHeight });
        const crop = cropResult.topCrop;

        ctx.save();
        ctx.beginPath();
        ctx.rect(margin, photoY, photoWidth, photoHeight);
        ctx.clip();

        // Optimized image for drawing
        const optimImage = getSteppedScaledImage(img, crop.width, crop.height);

        ctx.filter = 'contrast(1.1) brightness(1.1) saturate(1.1)';
        ctx.drawImage(
          img,
          crop.x, crop.y, crop.width, crop.height,
          margin, photoY, photoWidth, photoHeight
        );
        ctx.filter = 'none';

        ctx.fillStyle = 'rgba(255, 253, 248, 0.05)';
        ctx.globalCompositeOperation = 'screen';
        ctx.fillRect(margin, photoY, photoWidth, photoHeight);

        ctx.fillStyle = 'rgba(255, 200, 50, 0.04)';
        ctx.globalCompositeOperation = 'overlay';
        ctx.fillRect(margin, photoY, photoWidth, photoHeight);

        const gradient = ctx.createRadialGradient(
          width / 2, photoY + photoHeight / 2, photoWidth * 0.4,
          width / 2, photoY + photoHeight / 2, photoWidth * 0.95
        );
        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(1, 'rgba(30,20,10,0.2)');
        ctx.fillStyle = gradient;
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillRect(margin, photoY, photoWidth, photoHeight);
        ctx.restore();

        const grainPattern = createGrainPattern(ctx);
        if (grainPattern) {
          ctx.save();
          ctx.globalCompositeOperation = 'overlay';
          ctx.globalAlpha = 0.06;
          ctx.fillStyle = grainPattern;
          ctx.fillRect(0, 0, width, height);
          ctx.restore();
        }

        ctx.textAlign = 'center';
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = '#2a2a2a';
        ctx.font = '220px "Great Vibes"';

        const textCenterX = width / 2;
        const textAreaStart = photoY + photoHeight;
        const captionY = textAreaStart + 120; 
        ctx.fillText(caption, textCenterX, captionY);

        ctx.fillStyle = '#888888';
        ctx.font = '500 70px "Inter", sans-serif';
        const dateString = date.toUpperCase();
        const dateY = captionY + 80;
        ctx.save();
        ctx.fillText(dateString.split('').join(' '), textCenterX, dateY);
        ctx.restore();

        resolve(canvas.toDataURL('image/jpeg', 0.92));
        canvas.width = 0;
        canvas.height = 0;
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = (e) => reject(e);
    img.src = imageSrc;
  });
};
