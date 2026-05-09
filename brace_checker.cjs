const fs = require('fs');
const path = require('path');

const filePath = 'c:\\Users\\maity\\OneDrive\\Documents\\fashionApp2\\client\\src\\pages\\user\\ProductDetail.jsx';
const content = fs.readFileSync(filePath, 'utf8');

let braceCount = 0;
let parenCount = 0;
let bracketCount = 0;

for (let i = 0; i < content.length; i++) {
  const char = content[i];
  if (char === '{') braceCount++;
  if (char === '}') braceCount--;
  if (char === '(') parenCount++;
  if (char === ')') parenCount--;
  if (char === '[') bracketCount++;
  if (char === ']') bracketCount--;

  if (braceCount < 0) console.log(`Extra closing brace at position ${i} (Line roughly ${content.substring(0, i).split('\n').length})`);
  if (parenCount < 0) console.log(`Extra closing parenthesis at position ${i} (Line roughly ${content.substring(0, i).split('\n').length})`);
  if (bracketCount < 0) console.log(`Extra closing bracket at position ${i} (Line roughly ${content.substring(0, i).split('\n').length})`);
}

console.log('Final counts:', { braceCount, parenCount, bracketCount });
