import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Read the HTML file
const htmlFilePath = path.join(__dirname, '..', 'index.html');
const tsFilePath = path.join(__dirname, '..', 'src', 'form.ts');

fs.readFile(htmlFilePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }

  // Escape backticks and template literal placeholders
  const escapedData = data.replace(/`/g, '\\`').replace(/\$\{/g, '\\${');

  // Create the TypeScript content with template literals
  const tsContent = `export default \`${escapedData}\`;`;

  // Write the .ts file
  fs.writeFile(tsFilePath, tsContent, (err) => {
    if (err) {
      console.error('Error writing file:', err);
      return;
    }

    console.log('File saved as:', tsFilePath);
  });
});
