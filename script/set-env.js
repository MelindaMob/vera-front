const fs = require('fs');
const path = require('path');

const dirPath = path.join(__dirname, '..', 'src', 'environments');
const targetPath = path.join(dirPath, 'environment.ts');


const apiUrl = process.env.API_URL || '';
const socketUrl = process.env.SOCKET_URL || '';
const production = process.env.NODE_ENV === 'production';

const envConfigFile = `
export const environment = {
  production: ${production},
  apiUrl: '${apiUrl}',
  socketUrl: '${socketUrl}'
};
`;

if (!fs.existsSync(dirPath)) {
  fs.mkdirSync(dirPath, { recursive: true });
}

fs.writeFile(targetPath, envConfigFile, function (err) {
  if (err) {
    console.log(err);
  }
  console.log(`Fichier environment.ts généré correctement à ${targetPath}`);
});