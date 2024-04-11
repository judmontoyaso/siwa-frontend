// /app/test/page.jsx
import fs from 'fs';
import path from 'path';

export default function InnerHtml() {
  const filePath = path.join(process.cwd(), 'public', 'test.html');
  const fileContent = fs.readFileSync(filePath, 'utf8');

  return <div dangerouslySetInnerHTML={{ __html: fileContent }} />;
}