// Dev helper: render pixel scenes to PNG without a browser. Usage: node gt-dev-render.js street <planetIndex> <day|night> <out.png> [scale]
const fs = require('fs'), zlib = require('zlib'), path = require('path');
global.document = { documentElement: {}, createElement: () => ({ getContext: () => ({}) }) }; global.MutationObserver = function () { this.observe = () => {}; };
const load = (...fs2) => fs2.map(f => fs.readFileSync(path.join(__dirname, f), 'utf8')).join('\n');
const src = load('gt-1-data.js', 'gt-2-market.js', 'gt-3-world.js', 'gt-4-social.js', 'gt-5-travel.js', 'gt-6-explore.js', 'gt-7a-encounter.js', 'gt-7b-encounter.js', 'gt-10-extras.js');
const GT = new Function(src + '\nreturn GT;')(); global.GT = GT;
global.CH = { hash: s => { let h = 2166136261 >>> 0; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h >>> 0; } };
global.SC = {}; global.UI = {}; global.NP = {};
const extra = (process.env.PARTS || 'gt-21-px.js,gt-22-street.js').split(',');
const all = extra.map(f => fs.readFileSync(path.join(__dirname, f), 'utf8')).join('\n');
new Function('PX_EXPORT', all + '\nglobalThis.PX = PX; globalThis.PIX = typeof PIX !== "undefined" ? PIX : null;').call(null);
function crc(buf) { let c, t = crc.t || (crc.t = Array.from({ length: 256 }, (_, n) => { c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; })); c = 0xffffffff; for (const b of buf) c = t[(c ^ b) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
function chunk(type, data) { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type), data]); const cr = Buffer.alloc(4); cr.writeUInt32BE(crc(td)); return Buffer.concat([len, td, cr]); }
global.writePNG = function (buf, out, scale, night) {
  scale = scale || 3; const W = buf.w * scale, H = buf.h * scale, raw = Buffer.alloc((W * 4 + 1) * H), N = night ? PX.NM : null;
  for (let y = 0; y < H; y++) { raw[y * (W * 4 + 1)] = 0; for (let x = 0; x < W; x++) { const sx = Math.floor(x / scale), sy = Math.floor(y / scale); let v = buf.d[sy * buf.w + sx], o = y * (W * 4 + 1) + 1 + x * 4; if (v === 255) { raw[o + 3] = 0; continue; } if (v >= 16) v -= 16; else if (N) v = N[v]; const p = PX.PAL[v]; raw[o] = p[0]; raw[o + 1] = p[1]; raw[o + 2] = p[2]; raw[o + 3] = 255; } }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4); ihdr[8] = 8; ihdr[9] = 6;
  fs.writeFileSync(out, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]));
};
global.resolve = function (buf, night) { const o = new PX.Buf(buf.w, buf.h), N = night ? PX.NM : null; for (let y = 0; y < buf.h; y++) for (let x = 0; x < buf.w; x++) { let v = buf.d[y * buf.w + x]; if (v === 255) continue; if (v >= 16) v -= 16; else if (N) v = N[v]; o.d[y * buf.w + x] = v; } return o; };
if (require.main === module) {
  if (process.argv[2] === 'sheet') { const ids = process.argv[3].split(','), out = process.argv[4]; const M = new PX.Buf(640, Math.ceil(ids.length / 2) * 200); ids.forEach((id, q) => { const [pi, tod] = id.split(':'); const p = GT.PLANETS[+pi], night = tod === 'n'; const r = SC.street(p, { night, closed: { yard: !p.upgrades.length, fuel: !p.fuelSold }, offer: false }); M.blit(resolve(r.buf, night), (q % 2) * 320, Math.floor(q / 2) * 200); }); writePNG(M, out, 2, false); console.log('sheet', out); process.exit(0); }
  const [mode, idx, tod, out, sc] = process.argv.slice(2);
  if (mode === 'street') { const p = GT.PLANETS[+idx]; const night = tod === 'night'; const r = SC.street(p, { night, closed: { yard: !p.upgrades.length, fuel: !p.fuelSold }, offer: false }); writePNG(r.buf, out, +sc || 3, night); console.log('wrote', out, r.order.join(',')); }
}
