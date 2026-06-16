const { Jimp } = require("jimp");
const path = require("path");

async function main() {
  const filePath = path.join(__dirname, "public", "logo.png");
  console.log("Loading image from", filePath);
  
  try {
    const image = await Jimp.read(filePath);
    
    image.scan((x, y, idx) => {
      // The image is purely white with variable alpha.
      // We want to make it purely black with the same alpha.
      
      image.bitmap.data[idx + 0] = 31; // R (Dark slate/near black)
      image.bitmap.data[idx + 1] = 41; // G
      image.bitmap.data[idx + 2] = 55; // B
      // Alpha stays exactly the same as the original
    });

    const outPath = path.join(__dirname, "public", "logo_dark.png");
    await image.write(outPath);
    console.log("Successfully created dark logo at logo_dark.png");
  } catch (err) {
    console.error("Error processing image:", err);
  }
}

main();
