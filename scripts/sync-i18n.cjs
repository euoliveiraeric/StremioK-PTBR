const fs = require('fs'), path = require('path');
const root = path.resolve(__dirname, '..');
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'locales/pt-BR.json'), 'utf8'));
const file = path.join(root, 'js/i18n.js');
const source = fs.readFileSync(file, 'utf8');
if (!/var PT = [\s\S]*?;\n    try/.test(source)) throw new Error('Catalogue boundary not found');
fs.writeFileSync(file, source.replace(/var PT = [\s\S]*?;\n    try/, 'var PT = ' + JSON.stringify(catalog, null, 4) + ';\n    try'));
console.log('Updated ' + Object.keys(catalog).length + ' interface keys');
