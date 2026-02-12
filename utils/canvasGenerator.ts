import smartcrop from 'smartcrop';
import { CollageStyle } from '../types';
import { COLLAGE_CONFIGS } from './layoutConstants';

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
    const val = 80 + Math.random() * 100;
    data[i] = val;
    data[i + 1] = val;
    data[i + 2] = val;
    data[i + 3] = 255;
  }
  nCtx.putImageData(imgData, 0, 0);
  return ctx.createPattern(canvas, 'repeat');
};

const drawDustSpecks = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
  const count = 15 + Math.floor(Math.random() * 15);
  ctx.save();
  for (let i = 0; i < count; i++) {
    const dx = x + Math.random() * w;
    const dy = y + Math.random() * h;
    const size = 1 + Math.random() * 2.5;
    const opacity = 0.08 + Math.random() * 0.15;

    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
    ctx.beginPath();
    ctx.arc(dx, dy, size, 0, Math.PI * 2);
    ctx.fill();

    if (Math.random() > 0.6) {
      ctx.fillStyle = `rgba(0, 0, 0, ${opacity * 0.6})`;
      ctx.beginPath();
      ctx.arc(dx + 1, dy + 1, size * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
};

const applyLightLeak = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
  ctx.save();
  const corner = Math.floor(Math.random() * 4);
  let lx = x, ly = y;

  if (corner === 1) lx = x + w;
  if (corner === 2) ly = y + h;
  if (corner === 3) { lx = x + w; ly = y + h; }

  const radius = w * (0.5 + Math.random() * 0.5);
  const gradient = ctx.createRadialGradient(lx, ly, 0, lx, ly, radius);

  // Warm vintage light leak colors
  const opacity = 0.08 + Math.random() * 0.08;
  gradient.addColorStop(0, `rgba(255, 80, 20, ${opacity})`);
  gradient.addColorStop(0.4, `rgba(255, 120, 40, ${opacity * 0.6})`);
  gradient.addColorStop(1, 'rgba(255, 100, 50, 0)');

  ctx.globalCompositeOperation = 'screen';
  ctx.fillStyle = gradient;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
};

const drawGrainStreaks = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
  const streakCount = 1 + Math.floor(Math.random() * 2); // 1-2 subtle streaks
  ctx.save();
  ctx.lineWidth = 4 + Math.random() * 4; // Thicker for 3400px canvas
  ctx.globalAlpha = 0.08 + Math.random() * 0.07; // Slightly more visible

  for (let i = 0; i < streakCount; i++) {
    const sx = x + Math.random() * w;
    ctx.strokeStyle = Math.random() > 0.5 ? '#FFFFFF' : '#000000';
    ctx.beginPath();
    ctx.moveTo(sx, y);
    ctx.lineTo(sx + (Math.random() * 15 - 7.5), y + h); // Natural slant
    ctx.stroke();
  }
  ctx.restore();
};

const drawSimpleDoodles = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
  ctx.save();
  ctx.strokeStyle = '#D1C4B9'; // Subtle pencil/ink color
  ctx.lineWidth = 3;
  ctx.globalAlpha = 0.4;

  // Draw a few subtle hearts and stars
  const symbols = ['heart', 'star', 'swirl'];
  for (let i = 0; i < 8; i++) {
    const sx = x + 100 + Math.random() * (w - 200);
    const sy = y + 100 + Math.random() * (h - 200);
    const size = 30 + Math.random() * 40;
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];

    ctx.beginPath();
    if (symbol === 'heart') {
      ctx.moveTo(sx, sy + size / 4);
      ctx.quadraticCurveTo(sx, sy, sx - size / 2, sy);
      ctx.quadraticCurveTo(sx - size, sy, sx - size, sy + size / 2);
      ctx.quadraticCurveTo(sx - size, sy + size, sx, sy + size * 1.5);
      ctx.quadraticCurveTo(sx + size, sy + size, sx + size, sy + size / 2);
      ctx.quadraticCurveTo(sx + size, sy, sx + size / 2, sy);
      ctx.quadraticCurveTo(sx, sy, sx, sy + size / 4);
    } else if (symbol === 'star') {
      for (let j = 0; j < 5; j++) {
        ctx.lineTo(Math.cos((18 + j * 72) / 180 * Math.PI) * size + sx,
          -Math.sin((18 + j * 72) / 180 * Math.PI) * size + sy);
        ctx.lineTo(Math.cos((54 + j * 72) / 180 * Math.PI) * (size / 2) + sx,
          -Math.sin((54 + j * 72) / 180 * Math.PI) * (size / 2) + sy);
      }
      ctx.closePath();
    } else {
      ctx.arc(sx, sy, size / 2, 0, Math.PI * 1.5);
    }
    ctx.stroke();
  }
  ctx.restore();
};

export const generatePolaroidImage = async (
  imageSrc: string,
  caption: string,
  date: string,
  options: { noFrame?: boolean, offset?: { x: number, y: number } } = {}
): Promise<string> => {
  const { noFrame, offset = { x: 0.5, y: 0.5 } } = options;
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return reject('No canvas context');

    const width = noFrame ? 2080 : 2400;
    const height = noFrame ? 2600 : 3400;
    canvas.width = width;
    canvas.height = height;

    if (!noFrame) {
      ctx.fillStyle = '#FAF9F6'; // Creamier Ivory
      ctx.fillRect(0, 0, width, height);
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = async () => {
      try {
        const margin = noFrame ? 0 : 160;
        const photoWidth = noFrame ? width : width - (margin * 2); // 2080
        const photoHeight = noFrame ? height : Math.floor(photoWidth * 1.25); // 2600 (4:5 ratio)
        const photoY = noFrame ? 0 : margin;

        const cropResult = await smartcrop.crop(img, { width: photoWidth, height: photoHeight });
        let crop = cropResult.topCrop;

        // Apply manual offset
        const maxSx = img.width - crop.width;
        const maxSy = img.height - crop.height;
        crop.x = maxSx * offset.x;
        crop.y = maxSy * offset.y;

        ctx.save();
        ctx.beginPath();
        ctx.rect(margin, photoY, photoWidth, photoHeight);
        ctx.clip();

        // Optimized image for drawing
        const optimImage = getSteppedScaledImage(img, crop.width, crop.height);

        ctx.filter = 'contrast(1.05) brightness(1.05) saturate(1.2) sepia(0.25)';
        ctx.drawImage(
          img,
          crop.x, crop.y, crop.width, crop.height,
          margin, photoY, photoWidth, photoHeight
        );
        ctx.filter = 'none';

        ctx.fillStyle = 'rgba(255, 253, 248, 0.1)';
        ctx.globalCompositeOperation = 'screen';
        ctx.fillRect(margin, photoY, photoWidth, photoHeight);

        ctx.fillStyle = 'rgba(255, 180, 50, 0.12)';
        ctx.globalCompositeOperation = 'overlay';
        ctx.fillRect(margin, photoY, photoWidth, photoHeight);

        const gradient = ctx.createRadialGradient(
          width / 2, photoY + photoHeight / 2, photoWidth * 0.4,
          width / 2, photoY + photoHeight / 2, photoWidth * 0.95
        );
        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(1, 'rgba(30,20,10,0.25)');
        ctx.fillStyle = gradient;
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillRect(margin, photoY, photoWidth, photoHeight);

        // --- NEW SIGNATURE ANALOG STACKS ---

        // 1. Film Fade (Shadow Lift) - Map blacks to deep charcoal
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = 'rgba(20, 20, 35, 0.15)';
        ctx.fillRect(margin, photoY, photoWidth, photoHeight);

        // 2. Warm Light Leak
        applyLightLeak(ctx, margin, photoY, photoWidth, photoHeight);

        // 3. Procedural Dust & Streaks
        drawDustSpecks(ctx, margin, photoY, photoWidth, photoHeight);
        drawGrainStreaks(ctx, margin, photoY, photoWidth, photoHeight);

        ctx.restore();

        const grainPattern = createGrainPattern(ctx);
        if (grainPattern) {
          ctx.save();
          ctx.globalCompositeOperation = 'overlay';
          ctx.globalAlpha = 0.25;
          ctx.fillStyle = grainPattern;
          ctx.fillRect(0, 0, width, height);
          ctx.restore();
        }

        if (!noFrame) {
          ctx.textAlign = 'center';
          ctx.globalCompositeOperation = 'source-over';
          ctx.fillStyle = '#2a2a2a';
          ctx.font = '220px "Great Vibes"';

          const textCenterX = width / 2;
          const textAreaStart = photoY + photoHeight;
          const captionY = textAreaStart + 300;
          ctx.fillText(caption, textCenterX, captionY);

          ctx.fillStyle = '#888888';
          ctx.font = '500 70px "Inter", sans-serif';
          const dateString = date.toUpperCase();
          const dateY = captionY + 120;
          ctx.save();
          ctx.fillText(dateString.split('').join(' '), textCenterX, dateY);
          ctx.restore();
        }

        resolve(canvas.toDataURL('image/jpeg', noFrame ? 0.8 : 0.92));
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

export const generateCollagePolaroid = async (
  images: string[],
  caption: string,
  date: string,
  style: CollageStyle = CollageStyle.GRID,
  options: { noFrame?: boolean, offsets?: { x: number, y: number }[] } = {}
): Promise<string> => {
  const { noFrame, offsets } = options;
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return reject('No canvas context');

    const width = noFrame ? 2080 : 2400;
    const height = noFrame ? 2600 : 3400;
    canvas.width = width;
    canvas.height = height;

    if (!noFrame) {
      ctx.fillStyle = '#FAF9F6'; // Creamier Ivory
      ctx.fillRect(0, 0, width, height);
    }

    const margin = noFrame ? 0 : 160;
    const collageWidth = noFrame ? width : width - (margin * 2); // 2080
    const collageHeight = noFrame ? height : Math.floor(collageWidth * 1.25); // 2600 (4:5 ratio)
    const collageY = noFrame ? 0 : margin;

    const loadImages = images.map(src => {
      return new Promise<HTMLImageElement>((res, rej) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => res(img);
        img.onerror = rej;
        img.src = src;
      });
    });

    Promise.all(loadImages).then(async (loadedImgs) => {
      try {
        const slots: { x: number, y: number, w: number, h: number, rotation?: number }[] = [];
        const count = loadedImgs.length;

        const areaWidth = collageWidth - (2 * COLLAGE_CONFIGS.GRID.MARGIN * collageWidth);
        const areaHeight = collageHeight - (2 * COLLAGE_CONFIGS.GRID.MARGIN * collageHeight);
        const gutterSize = COLLAGE_CONFIGS.GRID.GUTTER * collageWidth;
        const gridX = margin + (COLLAGE_CONFIGS.GRID.MARGIN * collageWidth);
        const gridY = collageY + (COLLAGE_CONFIGS.GRID.MARGIN * collageHeight);

        if (style === CollageStyle.GRID) {
          if (count === 2) {
            const h = (areaHeight - gutterSize) / 2;
            slots.push(
              { x: gridX, y: gridY, w: areaWidth, h: h },
              { x: gridX, y: gridY + h + gutterSize, w: areaWidth, h: h }
            );
          } else if (count === 3) {
            const hTop = areaHeight * 0.55;
            const hBottom = areaHeight - hTop - gutterSize;
            const wBottom = (areaWidth - gutterSize) / 2;
            slots.push(
              { x: gridX, y: gridY, w: areaWidth, h: hTop },
              { x: gridX, y: gridY + hTop + gutterSize, w: wBottom, h: hBottom },
              { x: gridX + wBottom + gutterSize, y: gridY + hTop + gutterSize, w: wBottom, h: hBottom }
            );
          } else {
            const w = (areaWidth - gutterSize) / 2;
            const h = (areaHeight - gutterSize) / 2;
            slots.push(
              { x: gridX, y: gridY, w: w, h: h },
              { x: gridX + w + gutterSize, y: gridY, w: w, h: h },
              { x: gridX, y: gridY + h + gutterSize, w: w, h: h },
              { x: gridX + w + gutterSize, y: gridY + h + gutterSize, w: w, h: h }
            );
          }
        } else { // SCRAPBOOK
          const layout = COLLAGE_CONFIGS.SCRAPBOOK.layouts[count as keyof typeof COLLAGE_CONFIGS.SCRAPBOOK.layouts] || COLLAGE_CONFIGS.SCRAPBOOK.layouts[2];

          layout.forEach(slot => {
            slots.push({
              x: margin + (slot.x * collageWidth),
              y: collageY + (slot.y * collageHeight),
              w: slot.w * collageWidth,
              h: slot.h * collageHeight,
              rotation: slot.rotation
            });
          });

          if (!noFrame) {
            drawSimpleDoodles(ctx, margin, collageY, collageWidth, collageHeight);
          }
        }

        ctx.save();
        // Clip to collage area
        ctx.beginPath();
        ctx.rect(margin, collageY, collageWidth, collageHeight);
        ctx.clip();

        // Draw each image in its slot
        for (let i = 0; i < Math.min(loadedImgs.length, slots.length); i++) {
          const img = loadedImgs[i];
          const slot = slots[i];
          const offset = offsets?.[i] || { x: 0.5, y: 0.5 };

          const cropResult = await smartcrop.crop(img, { width: slot.w, height: slot.h });
          let crop = cropResult.topCrop;

          // Adjust crop based on manual offset if provided (simple version: use offset to slide crop)
          // focal point 0.0 -> left/top, 1.0 -> right/bottom. 0.5 is middle.
          // sw/sh of crop are fixed by the aspect ratio of the slot.
          const maxSx = img.width - crop.width;
          const maxSy = img.height - crop.height;

          if (offsets?.[i]) {
            crop.x = maxSx * offset.x;
            crop.y = maxSy * offset.y;
          }

          ctx.save();
          if (slot.rotation) {
            ctx.translate(slot.x + slot.w / 2, slot.y + slot.h / 2);
            ctx.rotate((slot.rotation * Math.PI) / 180);

            // Draw White Mini-Polaroid Frame
            const framePadding = slot.w * 0.08;
            const bottomPadding = slot.w * 0.25;

            // Outer Frame (White)
            ctx.shadowColor = 'rgba(0,0,0,0.15)';
            ctx.shadowBlur = 30;
            ctx.shadowOffsetX = 5;
            ctx.shadowOffsetY = 10;
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(
              -slot.w / 2 - framePadding,
              -slot.h / 2 - framePadding,
              slot.w + framePadding * 2,
              slot.h + framePadding + bottomPadding
            );

            // Reset shadows for image
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;

            ctx.drawImage(
              img,
              crop.x, crop.y, crop.width, crop.height,
              -slot.w / 2, -slot.h / 2, slot.w, slot.h
            );

            // Inner edge detail
            ctx.strokeStyle = 'rgba(0,0,0,0.05)';
            ctx.lineWidth = 2;
            ctx.strokeRect(-slot.w / 2, -slot.h / 2, slot.w, slot.h);
          } else {
            ctx.drawImage(
              img,
              crop.x, crop.y, crop.width, crop.height,
              slot.x, slot.y, slot.w, slot.h
            );
          }
          ctx.restore();
        }

        // --- GLOBAL ANALOG EFFECTS ---
        ctx.filter = 'contrast(1.05) brightness(1.05) saturate(1.1) sepia(0.2)';
        ctx.globalCompositeOperation = 'overlay';
        ctx.fillStyle = 'rgba(255, 180, 50, 0.08)';
        ctx.fillRect(margin, collageY, collageWidth, collageHeight);
        ctx.filter = 'none';

        const gradient = ctx.createRadialGradient(
          width / 2, collageY + collageHeight / 2, collageWidth * 0.4,
          width / 2, collageY + collageHeight / 2, collageWidth * 0.95
        );
        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(1, 'rgba(30,20,10,0.2)');
        ctx.fillStyle = gradient;
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillRect(margin, collageY, collageWidth, collageHeight);

        // Film Fade
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = 'rgba(20, 20, 35, 0.12)';
        ctx.fillRect(margin, collageY, collageWidth, collageHeight);

        // Leaks & Dust
        applyLightLeak(ctx, margin, collageY, collageWidth, collageHeight);
        drawDustSpecks(ctx, margin, collageY, collageWidth, collageHeight);
        drawGrainStreaks(ctx, margin, collageY, collageWidth, collageHeight);

        ctx.restore();

        const grainPattern = createGrainPattern(ctx);
        if (grainPattern) {
          ctx.save();
          ctx.globalCompositeOperation = 'overlay';
          ctx.globalAlpha = 0.2;
          ctx.fillStyle = grainPattern;
          ctx.fillRect(0, 0, width, height);
          ctx.restore();
        }

        if (!noFrame && style !== CollageStyle.SCRAPBOOK) {
          // Text (Only for Grid)
          ctx.textAlign = 'center';
          ctx.globalCompositeOperation = 'source-over';
          ctx.fillStyle = '#2a2a2a';
          ctx.font = '220px "Great Vibes"';

          const textCenterX = width / 2;
          const textAreaStart = collageY + collageHeight;
          const captionY = textAreaStart + 300;
          ctx.fillText(caption, textCenterX, captionY);

          ctx.fillStyle = '#888888';
          ctx.font = '500 70px "Inter", sans-serif';
          const dateString = date.toUpperCase();
          const dateY = captionY + 120;
          ctx.fillText(dateString.split('').join(' '), textCenterX, dateY);
        }

        resolve(canvas.toDataURL('image/jpeg', noFrame ? 0.8 : 0.9));
        canvas.width = 0;
        canvas.height = 0;
      } catch (err) {
        reject(err);
      }
    }).catch(reject);
  });
};
