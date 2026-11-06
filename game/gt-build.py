#!/usr/bin/env python3
"""Concatenate the Galactic Trader parts into one self-contained HTML file."""
import os, sys
d = os.path.dirname(os.path.abspath(__file__))
rd = lambda n: open(os.path.join(d, n), encoding='utf8').read()
parts = ['gt-1-data.js', 'gt-2-market.js', 'gt-3-world.js', 'gt-4-social.js', 'gt-5-travel.js', 'gt-6-explore.js',
         'gt-7a-encounter.js', 'gt-7b-encounter.js', 'gt-8-art.js', 'gt-9a-render.js', 'gt-9b-actions.js']
js = '\n'.join(rd(p) for p in parts)
assert '</script' not in js.lower(), 'script text would close the tag early'
html = ('<title>Galactic Trader</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n'
        '<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
        '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&family=Unbounded:wght@700;800&display=swap">\n'
        '<style>\n' + rd('gt-style.css') + '</style>\n' + rd('gt-body.html') + '<script>\n' + js + '\n</script>\n')
out = os.path.join(d, 'galactic-trader.html')
open(out, 'w', encoding='utf8').write(html)
# test copy carries the viewport meta that the publish step normally adds
open(os.path.join(d, 'galactic-trader-test.html'), 'w', encoding='utf8').write('<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><style>:root{color-scheme:light}body{margin:0}</style>' + html)
print(out, len(html), 'bytes')
