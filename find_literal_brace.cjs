const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\maity\\OneDrive\\Documents\\fashionApp2\\client\\src\\pages\\user\\ProductDetail.jsx', 'utf8');

const lines = content.split('\n');
lines.forEach((line, i) => {
  let inExpr = 0;
  for (let j = 0; j < line.length; j++) {
    if (line[j] === '{') inExpr++;
    if (line[j] === '}') {
      if (inExpr > 0) {
        inExpr--;
      } else {
        console.log(`Potential literal } at line ${i + 1}, column ${j + 1}: ${line.trim()}`);
      }
    }
  }
});
