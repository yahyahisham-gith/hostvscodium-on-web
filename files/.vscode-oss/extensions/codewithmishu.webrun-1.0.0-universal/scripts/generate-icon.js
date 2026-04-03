const fs = require('fs');
const path = require('path');

// Create images directory if it doesn't exist
const imagesDir = path.join(__dirname, '..', 'images');
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
}

console.log('Please create a 128x128 PNG icon manually at: images/icon.png');
console.log('You can use tools like:');
console.log('- Canva: https://www.canva.com/');
console.log('- Figma: https://www.figma.com/');
console.log('- GIMP: https://www.gimp.org/');
console.log('\nIcon suggestions:');
console.log('- Use ▶️ play symbol');
console.log('- Use colors: #007ACC (VS Code blue) or #00D084 (green)');
console.log('- Keep it simple and recognizable');