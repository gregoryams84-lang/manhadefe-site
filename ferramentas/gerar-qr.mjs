// Gera os códigos QR de impressão, um por origem: qr/<origem>.svg e qr/<origem>.png
// Uso (na pasta do site):  node ferramentas/gerar-qr.mjs
// Todos apontam para /baixar/, que manda o iPhone para a App Store e o Android
// para o Google Play. Trocar a loja depois não exige reimprimir nada.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://manhadefe.com.br';
const ORIGENS = ['santinho', 'impresso', 'facebook', 'instagram', 'tiktok', 'youtube', 'whatsapp'];
const ESCURO = [0x22, 0x1d, 0x18];   // tinta do app
const CLARO = [0xfb, 0xf6, 0xec];    // creme do app
const PX = 20;                       // pixels por módulo no PNG
const MARGEM = 4;                    // zona de silêncio exigida pelo padrão QR

// carrega js/qrcode.js (o mesmo que o site usa)
const ctx = {};
vm.runInNewContext(fs.readFileSync(path.join(raiz, 'js/qrcode.js'), 'utf8') + '\nthis.qrcode = qrcode;', ctx);
const qrcode = ctx.qrcode;

const tabelaCrc = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = tabelaCrc[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function bloco(tipo, dados) {
  const t = Buffer.from(tipo, 'ascii');
  const tam = Buffer.alloc(4); tam.writeUInt32BE(dados.length);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([t, dados])));
  return Buffer.concat([tam, t, dados, crc]);
}
function png(q) {
  const n = q.getModuleCount(), total = (n + MARGEM * 2) * PX;
  const linhas = Buffer.alloc(total * (total * 3 + 1));
  for (let y = 0; y < total; y++) {
    const inicio = y * (total * 3 + 1);
    linhas[inicio] = 0;
    const my = Math.floor(y / PX) - MARGEM;
    for (let x = 0; x < total; x++) {
      const mx = Math.floor(x / PX) - MARGEM;
      const escuro = my >= 0 && my < n && mx >= 0 && mx < n && q.isDark(my, mx);
      const cor = escuro ? ESCURO : CLARO;
      linhas.set(cor, inicio + 1 + x * 3);
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(total, 0); ihdr.writeUInt32BE(total, 4);
  ihdr[8] = 8; ihdr[9] = 2; // 8 bits, RGB
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    bloco('IHDR', ihdr), bloco('IDAT', zlib.deflateSync(linhas, { level: 9 })), bloco('IEND', Buffer.alloc(0))
  ]);
}
function svg(q) {
  const n = q.getModuleCount(), t = n + MARGEM * 2;
  let d = '';
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) d += `M${c + MARGEM} ${r + MARGEM}h1v1h-1z`;
  const hex = a => '#' + a.map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase();
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${t} ${t}" shape-rendering="crispEdges"><rect width="${t}" height="${t}" fill="${hex(CLARO)}"/><path fill="${hex(ESCURO)}" d="${d}"/></svg>\n`;
}

fs.mkdirSync(path.join(raiz, 'qr'), { recursive: true });
const indice = [];
for (const o of ORIGENS) {
  const url = `${SITE}/baixar/?origem=${o}&meio=qr`;
  const q = qrcode(0, 'M');
  q.addData(url);
  q.make();
  fs.writeFileSync(path.join(raiz, 'qr', `${o}.svg`), svg(q));
  fs.writeFileSync(path.join(raiz, 'qr', `${o}.png`), png(q));
  indice.push(`${o}\t${url}\t${q.getModuleCount()} módulos`);
}
fs.writeFileSync(path.join(raiz, 'qr', 'LEIA-ME.txt'),
  'Códigos QR de impressão do Manhã de Fé (gerados por ferramentas/gerar-qr.mjs)\n' +
  'Tamanho mínimo impresso: 2,5 cm de lado, contando a borda clara. Não corte a borda.\n\n' +
  indice.join('\n') + '\n');
console.log(indice.join('\n'));
