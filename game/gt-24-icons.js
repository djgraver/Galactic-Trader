/* Galactic Trader 3. Part 24: pixel versions of the portraits, ship pictures, item icons and little HUD icons.
   The vector drawings are kept as the source art. PX.svg() shrinks each one and snaps it to the 16 EGA colours with an ordered dither. */
UI.ST = function (w) { return ' stroke="#000" stroke-width="' + (w || 4) + '" stroke-linejoin="round" stroke-linecap="round"'; };
PX.hydrate = function () {};
/* a captain or shopkeeper, 48 x 78 pixels, shown at 2x */
UI.portrait = function (t, extra) { return PX.svg(CH.portrait(t, extra), 48, 78, 'portrait ' + (extra || ''), 2, 46); };
/* a ship, w x h pixels at the given scale */
UI.shipPic = function (id, hue, w, h, scale, cls) { return PX.svg(UI.shipSVG(id, hue), w || 64, h || 40, 'shippic ' + (cls || ''), scale || 2, 40); };
UI.itemSVG = function (i) {
  var s = UI.ST(3), b = '';
  if (i === 0) b = '<rect x="9" y="12" width="30" height="28" rx="5" fill="#d8dfe8"' + s + '/><rect x="9" y="20" width="30" height="14" fill="#ff5a4f"' + s + '/><ellipse cx="24" cy="12" rx="15" ry="5" fill="#f4f7fb"' + s + '/>';
  else if (i === 1) b = '<polygon points="6,38 42,38 36,26 12,26" fill="#aab4c4"' + s + '/><polygon points="12,26 36,26 32,14 16,14" fill="#c8d0dc"' + s + '/><line x1="16" y1="31" x2="26" y2="31" stroke="#fff" stroke-width="3"/>';
  else if (i === 2) b = '<rect x="6" y="12" width="36" height="28" rx="5" fill="#fff"' + s + '/><rect x="19" y="18" width="10" height="16" fill="#e0263f"/><rect x="16" y="21" width="16" height="10" fill="#e0263f"/><rect x="16" y="6" width="16" height="8" rx="3" fill="#7bd957"' + s + '/>';
  else if (i === 3) b = '<rect x="12" y="8" width="24" height="8" rx="3" fill="#8a5a2a"' + s + '/><path d="M10,16 L38,16 L36,40 L12,40Z" fill="#ff8a1f"' + s + '/><circle cx="20" cy="28" r="3" fill="#ffd23d"/><circle cx="29" cy="32" r="3" fill="#fff3cf"/><circle cx="27" cy="23" r="2.5" fill="#ffd23d"/>';
  else if (i === 4) b = '<rect x="10" y="10" width="28" height="28" rx="4" fill="#2faa5a"' + s + '/><rect x="17" y="17" width="14" height="14" rx="2" fill="#1d0f33"/><path d="M4,16 h6 M4,24 h6 M4,32 h6 M38,16 h6 M38,24 h6 M38,32 h6" stroke="' + '#000' + '" stroke-width="3"/><circle cx="24" cy="24" r="3" fill="#ffd23d"/>';
  else if (i === 5) b = '<circle cx="24" cy="25" r="16" fill="#6a2ca0"' + s + '/><path d="M12,24 Q24,10 36,24 Q24,38 12,24Z" fill="#c08aff"/><circle cx="24" cy="24" r="5" fill="#1d0f33"/><circle cx="38" cy="8" r="2.5" fill="#fff"/><circle cx="8" cy="12" r="2" fill="#ffe14a"/>';
  else b = '<path d="M14,8 h20 l-3,10 q10,6 4,18 q-2,6 -11,6 q-9,0 -11,-6 q-6,-12 4,-18z" fill="#ffd23d"' + s + '/><circle cx="24" cy="26" r="5" fill="#e0263f"' + s + '/><path d="M16,13 h16" stroke="#fff" stroke-width="2.5" opacity=".7"/>';
  return '<svg viewBox="0 0 48 48">' + b + '</svg>';
};
UI.iconSVG = function (k) {
  var s = UI.ST(3);
  return '<svg viewBox="0 0 24 24">' + ({
    coin: '<circle cx="12" cy="12" r="9" fill="#ffd23d"' + s + '/><path d="M15,9.5 A4,4 0 1,0 15,14.5" fill="none" stroke="#000" stroke-width="2.4"/>',
    fuel: '<rect x="4" y="5" width="11" height="16" rx="2" fill="#ff8a1f"' + s + '/><rect x="6.5" y="8" width="6" height="4" fill="#fff"/><path d="M15,10 L19,10 L19,17" fill="none"' + s + '/>',
    crate: '<rect x="3" y="6" width="18" height="15" rx="2" fill="#c8884a"' + s + '/><path d="M3,13 H21 M12,6 V21" stroke="' + '#000' + '" stroke-width="2"/>',
    star: '<polygon points="12,2 15,9 22,9.5 16.5,14.5 18,22 12,18 6,22 7.5,14.5 2,9.5 9,9" fill="#ffd23d"' + s + '/>'
  })[k] + '</svg>';
};


UI.itemIcon = function (i, cls) { return PX.svg(UI.itemSVG(i), 24, 24, 'itemicon ' + (cls || ''), 2, 36); };
UI.icon = function (k) { return PX.svg(UI.iconSVG(k), 12, 12, 'ico', 2, 30); };

/* snap a canvas to the 16 EGA colours (no dither), using a 5-bit lookup. Used on every frame of the warp and the mini-games. */
PX.LUT = null;
PX.snap = function (cx, w, h) {
  if (!PX.LUT) { PX.LUT = new Uint8Array(32768); for (var r = 0; r < 32; r++) for (var g = 0; g < 32; g++) for (var b = 0; b < 32; b++) { var best = 0, bd = 1e9; for (var k = 0; k < 16; k++) { var q = PX.RGB[k], dr = r * 8 + 4 - q[0], dg = g * 8 + 4 - q[1], db = b * 8 + 4 - q[2], dd = dr * dr * 0.3 + dg * dg * 0.59 + db * db * 0.11; if (dd < bd) { bd = dd; best = k; } } PX.LUT[(r << 10) | (g << 5) | b] = best; } }
  var im = cx.getImageData(0, 0, w, h), d = im.data, i, c, L = PX.LUT, R = PX.RGB;
  for (i = 0; i < d.length; i += 4) { c = R[L[((d[i] >> 3) << 10) | ((d[i + 1] >> 3) << 5) | (d[i + 2] >> 3)]]; d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = 255; }
  cx.putImageData(im, 0, 0);
};
