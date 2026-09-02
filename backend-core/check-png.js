import fs from 'fs';

function checkPng(filePath) {
  const buf = fs.readFileSync(filePath);
  // Verify PNG signature
  if (buf[0] !== 0x89 || buf[1] !== 0x50 || buf[2] !== 0x4E || buf[3] !== 0x47) {
    console.log('Not a PNG file.');
    return;
  }
  
  // IHDR chunk starts at byte 12 (length: 4, type: 4, data: 13)
  // Color type is at byte 25 (12 + 4 + 4 + 5)
  const colorType = buf[25];
  console.log('PNG Color Type:', colorType);
  
  // Color types:
  // 0: Grayscale
  // 2: Truecolor (RGB)
  // 3: Indexed color
  // 4: Grayscale + Alpha
  // 6: Truecolor + Alpha (RGBA)
  if (colorType === 4 || colorType === 6) {
    console.log('Image has an ALPHA channel (transparency).');
  } else {
    console.log('Image does NOT have an alpha channel.');
  }
}

checkPng('./public/uploads/prescription-1782398211650-867752288.png');
