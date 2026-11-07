#!/bin/bash
# builds street-test.html from the engine + art parts for a quick visual check
cd "$(dirname "$0")"
{ echo '<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;background:#222;color:#fff;font:12px monospace} .c{display:inline-block;margin:4px} canvas,img{image-rendering:pixelated;width:640px;height:400px}</style></head><body><div id="o"></div><script>'
for f in gt-1-data.js gt-2-market.js gt-3-world.js gt-4-social.js gt-5-travel.js gt-8-art.js gt-10-extras.js gt-11-chars.js gt-12-cast.js gt-21-px.js gt-13-scenes.js gt-13b-street.js; do cat $f; echo; done
echo 'function reduced(){return false} var esc=GT.esc,fmt=GT.fmt; var S=null;'
echo 'window.run=function(night){ var o=document.getElementById("o"); o.innerHTML=""; GT.PLANETS.forEach(function(p,i){ GT.setRng(GT.seeded(5)); S=GT.newState("wayfarer","Gus",CH.fromName("Gus",0)); S.loc=i; S.night=night; var P=SC.paint(S); var d=document.createElement("div"); d.className="c"; d.innerHTML=p.name+"<br><img src=\""+P.url+"\">"; o.appendChild(d); }); };'
echo 'run(false);</script></body></html>'
} > street-test.html
