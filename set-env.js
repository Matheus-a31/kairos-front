const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';
const targetPath = isProduction
  ? './src/environments/environment.prod.ts'
  : './src/environments/environment.ts';

const envConfigFile = `export const environment = {
  production: ${isProduction},
  apiUrl: '${process.env.API_URL || ''}'
};
`;

fs.mkdirSync('./src/environments', { recursive: true });
fs.writeFileSync(targetPath, envConfigFile);
console.log(`Environment variables generated at ${targetPath}`);
