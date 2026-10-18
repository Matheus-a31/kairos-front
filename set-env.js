const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const apiUrl = process.env.API_URL || '';
const isProduction = process.env.NODE_ENV === 'production';

const envConfigFile = (prod) => `export const environment = {
  production: ${prod},
  apiUrl: '${apiUrl}'
};
`;

fs.mkdirSync('./src/environments', { recursive: true });

// Always write both environment.ts and environment.prod.ts to guarantee apiUrl is loaded
fs.writeFileSync('./src/environments/environment.ts', envConfigFile(false));
fs.writeFileSync('./src/environments/environment.prod.ts', envConfigFile(true));

console.log(`Environment variables generated: API_URL='${apiUrl}'`);
