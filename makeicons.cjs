const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

[192, 512].forEach(size => {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, size, size);
  
  ctx.fillStyle = '#00e676';
  ctx.beginPath();
  ctx.roundRect(size*0.1, size*0.1, size*0.8, size*0.8, size*0.15);
  ctx.fill();
  
  ctx.fillStyle = '#0a0a0a';
  ctx.font = 'bold ' + Math.floor(size*0.35) + 'px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('WS', size/2, size/2);
  
  const outPath = path.join(__dirname, 'public', 'icons', 'icon-' + size + '.png');
  fs.writeFileSync(outPath, canvas.toBuffer('image/png'));
  console.log('Created ' + outPath);
});