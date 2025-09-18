import { GoogleGenAI, Modality } from "@google/genai";
import type { Point } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

async function createInpaintedImage(
    originalImageSrc: string, 
    points: Point[], 
    canvasDimensions: { width: number, height: number }
): Promise<{maskedImageBase64: string, mimeType: string}> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return reject(new Error('Could not get canvas context'));
      }

      // Draw the full original image first
      ctx.drawImage(img, 0, 0);

      // Prepare to punch a hole in the image
      ctx.globalCompositeOperation = 'destination-out';
      
      const scaleX = img.naturalWidth / canvasDimensions.width;
      const scaleY = img.naturalHeight / canvasDimensions.height;

      // Draw the lasso path
      ctx.beginPath();
      ctx.moveTo(points[0].x * scaleX, points[0].y * scaleY);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x * scaleX, points[i].y * scaleY);
      }
      ctx.closePath();
      ctx.fillStyle = '#000'; // Any color will do for punching a hole
      ctx.fill();

      // Get the mime type from the original source
      const mimeType = originalImageSrc.substring(originalImageSrc.indexOf(':') + 1, originalImageSrc.indexOf(';'));
      const maskedImageBase64 = canvas.toDataURL(mimeType).split(',')[1];
      
      resolve({ maskedImageBase64, mimeType });
    };
    img.onerror = (err) => {
      reject(err);
    };
    img.src = originalImageSrc;
  });
}

export async function callGeminiImageEditor(
    originalImageSrc: string, 
    points: Point[], 
    canvasDimensions: { width: number; height: number }, 
    prompt: string
): Promise<string> {
    const { maskedImageBase64, mimeType } = await createInpaintedImage(originalImageSrc, points, canvasDimensions);
    
    if (!maskedImageBase64) {
        throw new Error("Failed to create masked image.");
    }
    
    const fullPrompt = `You are an expert photo editor. Your task is to edit the image only within the transparent masked area. Do not change any other part of the image. The user's request for the masked area is: "${prompt}"`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: {
            parts: [
                {
                    inlineData: {
                        data: maskedImageBase64,
                        mimeType: mimeType,
                    },
                },
                {
                    text: fullPrompt,
                },
            ],
        },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });

    const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

    if (imagePart && imagePart.inlineData) {
        return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
    } else {
        const textPart = response.candidates?.[0]?.content?.parts?.find(part => part.text)?.text;
        throw new Error(`API did not return an image. Response: ${textPart || 'No text response found.'}`);
    }
}