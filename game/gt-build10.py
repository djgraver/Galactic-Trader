#!/usr/bin/env python3
"""Concatenate the Galactic Trader 10 parts into one self-contained HTML file.
Earlier versions are kept as frozen HTML files in this folder."""
import os
d = os.path.dirname(os.path.abspath(__file__))
rd = lambda n: open(os.path.join(d, n), encoding='utf8').read()
# engine parts (no DOM) come first, then art, then UI
ENGINE = ['gt-1-data.js', 'gt-2-market.js', 'gt-3-world.js', 'gt-4-social.js', 'gt-5-travel.js', 'gt-6-explore.js',
          'gt-7a-encounter.js', 'gt-7b-encounter.js', 'gt-10-extras.js', 'gt-31-smuggle.js', 'gt-32-stocks.js', 'gt-33-pax.js', 'gt-36-v7.js', 'gt-45-v10.js', 'gt-46-quests.js']
UI = ['gt-8-art.js', 'gt-11-chars.js', 'gt-11b-faces.js', 'gt-12-cast.js', 'gt-38-npc.js', 'gt-49-faces.js', 'gt-21-px.js', 'gt-27-vga.js', 'gt-22-street.js', 'gt-25-bldg.js', 'gt-25b-scene.js', 'gt-26-crowd.js', 'gt-23-rooms.js', 'gt-24-icons.js', 'gt-41-svga.js', 'gt-28-ships.js',
      'gt-14-ui.js', 'gt-15-pages.js', 'gt-34-pages2.js', 'gt-35-port.js', 'gt-37-v7ui.js', 'gt-40-3d.js', 'gt-16-start.js', 'gt-17-flight.js', 'gt-18-mg.js', 'gt-19-mg2.js', 'gt-19b-space.js', 'gt-29-mgvga.js', 'gt-42-v8ui.js', 'gt-43-town.js', 'gt-44-worlds.js', 'gt-47-v10ui.js', 'gt-48-flight.js', 'gt-50-bars.js', 'gt-51-mg10.js', 'gt-20-app.js']
parts = [p for p in ENGINE + UI if os.path.exists(os.path.join(d, p))]
css = ['gt-style2.css', 'gt-style3.css', 'gt-style4.css', 'gt-style5.css', 'gt-style-street.css', 'gt-style-pages.css', 'gt-style-port.css', 'gt-style6.css', 'gt-style7.css', 'gt-fonts8.css', 'gt-style8.css', 'gt-style10.css']
js = '\n'.join(rd(p) for p in parts)
assert '</script' not in js.lower(), 'script text would close the tag early'
head = '<title>Galactic Trader</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n'   # v8: fonts are embedded (gt-fonts8.css), nothing is fetched
import re
# v8 is a dark interface: the old sheets hard-code dark text colours for light panels, so map those to the new read-out colours as the sheets are joined
REMAP = {'#000': 'var(--fg)', '#000000': 'var(--fg)', '#00a': 'var(--cy)', '#a0a': 'var(--cy)', '#a00': 'var(--rd)', '#060': 'var(--gn)', '#0a0': 'var(--gn)', '#444': 'var(--dim)', '#555': 'var(--dim)', '#a50': 'var(--am)', '#550': 'var(--am)', '#005': 'var(--cy)', '#333': 'var(--dim)'}
def recolor(name, txt):
    if name in ('gt-style8.css', 'gt-fonts8.css', 'gt-style6.css', 'gt-style7.css', 'gt-style10.css'): return txt
    return re.sub(r'(?<![-\w])color:\s*(#[0-9a-fA-F]{3,6})\b', lambda m: 'color: ' + REMAP.get(m.group(1).lower(), m.group(1)), txt)
style = '<style>\n' + ''.join(recolor(c, rd(c)) for c in css if os.path.exists(os.path.join(d, c))) + '</style>\n'
body = rd('gt-body10.html') + '<script>\n' + js + '\n</script>\n'
html = head + style + body
# GT_OUT lets a helper build to its own file (default: galactic-trader-10.html and gtd-test.html next to the sources)
out = os.environ.get('GT_OUT') or os.path.join(d, 'galactic-trader-10.html')
test = (out[:-5] + '-test.html') if os.environ.get('GT_OUT') else os.path.join(d, 'gtd-test.html')
open(out, 'w', encoding='utf8').write(html)
open(test, 'w', encoding='utf8').write('<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">' + style.replace('<style>', '<style>body{margin:0}', 1) + body)
print(out, len(html), 'bytes')
