#!/usr/bin/env python3
"""Concatenate the Galactic Trader Deluxe parts into one self-contained HTML file."""
import os
d = os.path.dirname(os.path.abspath(__file__))
rd = lambda n: open(os.path.join(d, n), encoding='utf8').read()
parts = ['gt-1-data.js', 'gt-2-market.js', 'gt-3-world.js', 'gt-4-social.js', 'gt-5-travel.js', 'gt-6-explore.js',
         'gt-7a-encounter.js', 'gt-7b-encounter.js', 'gt-10-extras.js', 'gt-8-art.js', 'gt-11-chars.js', 'gt-12-cast.js', 'gt-13-scenes.js',
         'gt-14-ui.js', 'gt-15-pages.js', 'gt-16-start.js', 'gt-17-flight.js', 'gt-18-mg.js', 'gt-19-mg2.js', 'gt-20-app.js']
js = '\n'.join(rd(p) for p in parts)
assert '</script' not in js.lower(), 'script text would close the tag early'
html = ('<title>Galactic Trader Deluxe</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n'
        '<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
        '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bangers&family=Fredoka:wght@400;500;600;700&family=VT323&display=swap">\n'
        '<style>\n' + rd('gt-style2.css') + rd('gt-style3.css') + '</style>\n' + rd('gt-body2.html') + '<script>\n' + js + '\n</script>\n')
out = os.path.join(d, 'galactic-trader-deluxe.html')
open(out, 'w', encoding='utf8').write(html)
open(os.path.join(d, 'gtd-test.html'), 'w', encoding='utf8').write('<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><style>body{margin:0}</style>' + html)
print(out, len(html), 'bytes')
