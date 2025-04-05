import fs from 'fs';
import path from 'path';

const directoryPath = path.join(__dirname, '..', 'public', 'static', 'panorama', 'images', 'econ', 'default_generated');
const outputDir = path.join(__dirname, '..', 'static');
const outputPath = path.join(outputDir, 'default_generated.json');

try {
  if (!fs.existsSync(directoryPath)) {
    console.error('❌ Diretório não encontrado:', directoryPath);
    process.exit(1);
  }

  const files: string[] = fs.readdirSync(directoryPath);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(files, null, 2));
  console.log('✅ Arquivo default_generated.json criado com sucesso!');
} catch (err) {
  console.error('Erro:', err instanceof Error ? err.message : err);
}
