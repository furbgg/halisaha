const { Jimp } = require("jimp");
const path = require("path");

async function main() {
  const filePath = path.join(__dirname, "public", "logo.png");
  console.log("Loading image from", filePath);
  
  try {
    const image = await Jimp.read(filePath);
    
    image.scan((x, y, idx) => {
      // Get RGBA values
      const red = image.bitmap.data[idx + 0];
      const green = image.bitmap.data[idx + 1];
      const blue = image.bitmap.data[idx + 2];
      const alpha = image.bitmap.data[idx + 3];

      // Calculate brightness (0-255)
      const brightness = Math.round((red + green + blue) / 3);

      // We want to make the image purely white.
      // And the alpha channel is determined by the brightness.
      // So dark pixels become transparent, bright pixels stay white & opaque.
      
      image.bitmap.data[idx + 0] = 255; // R
      image.bitmap.data[idx + 1] = 255; // G
      image.bitmap.data[idx + 2] = 255; // B

      // If the original alpha was already low (it was partially transparent), 
      // we combine it with the brightness.
      const originalAlphaFrac = alpha / 255;
      const brightnessAlphaFrac = brightness / 255;
      
      const newAlphaFrac = originalAlphaFrac * brightnessAlphaFrac;
      image.bitmap.data[idx + 3] = Math.round(newAlphaFrac * 255); // A
    });

    const outPath = path.join(__dirname, "public", "logo_clean.png");
    await image.write(outPath);
    console.log("Successfully cleaned and saved to logo_clean.png");
  } catch (err) {
    console.error("Error processing image:", err);
  }
}

main();
