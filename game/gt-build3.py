#!/usr/bin/env python3
"""Concatenate the Galactic Trader 3 parts into one self-contained HTML file."""
import os
d = os.path.dirname(os.path.abspath(__file__))
rd = lambda n: open(os.path.join(d, n), encoding='utf8').read()
parts = ['gt-1-data.js', 'gt-2-market.js', 'gt-3-world.js', 'gt-4-social.js', 'gt-5-travel.js', 'gt-6-explore.js',
         'gt-7a-encounter.js', 'gt-7b-encounter.js', 'gt-10-extras.js', 'gt-8-art.js', 'gt-11-chars.js', 'gt-12-cast.js',
         'gt-21-px.js', 'gt-22-street.js', 'gt-23-rooms.js', 'gt-24-icons.js',
         'gt-14-ui.js', 'gt-15-pages.js', 'gt-16-start.js', 'gt-17-flight.js', 'gt-18-mg.js', 'gt-19-mg2.js', 'gt-20-app.js']
css = ['gt-style2.css', 'gt-style3.css', 'gt-style4.css']
js = '\n'.join(rd(p) for p in parts)
assert '</script' not in js.lower(), 'script text would close the tag early'
head = ('<title>Galactic Trader Deluxe</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n'
        '<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
        '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap">\n')
style = '<style>\n' + ''.join(rd(c) for c in css if os.path.exists(os.path.join(d, c))) + '</style>\n'
body = rd('gt-body3.html') + '<script>\n' + js + '\n</script>\n'
html = head + style + body
out = os.path.join(d, 'galactic-trader-3.html')
open(out, 'w', encoding='utf8').write(html)
open(os.path.join(d, 'gtd-test.html'), 'w', encoding='utf8').write('<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">' + style.replace('<style>', '<style>body{margin:0}', 1) + body)
print(out, len(html), 'bytes')
