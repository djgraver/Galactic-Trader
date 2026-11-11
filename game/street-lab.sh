#!/bin/bash
# builds street-lab.html: engine data + art + street + crowd, no UI. Usage: ./street-lab.sh
cd "$(dirname "$0")"
{ echo '<!doctype html><html><head><meta charset="utf-8"><style>'
cat gt-style-street.css
echo 'body{margin:0;background:#222;color:#fff;font:12px monospace} .box{position:relative;display:inline-block;margin:4px}.scenebox{width:960px;height:540px;position:relative;border:3px solid #fff}.scene{position:relative;width:100%;height:100%}.scene>.bgimg{position:absolute;inset:0;width:100%;height:100%}.scene>svg.ov{position:absolute;inset:0;width:100%;height:100%;overflow:visible} .pxi{image-rendering:pixelated} .ov image{image-rendering:pixelated} :root{--display:monospace}'
echo '</style></head><body><div id="o"></div><script>'
for f in gt-1-data.js gt-2-market.js gt-3-world.js gt-4-social.js gt-5-travel.js gt-6-explore.js gt-7a-encounter.js gt-7b-encounter.js gt-8-art.js gt-10-extras.js gt-11-chars.js gt-12-cast.js gt-21-px.js gt-22-street.js gt-25-bldg.js gt-25b-scene.js gt-26-crowd.js; do [ -f $f ] && cat $f; echo; done
echo 'function reduced(){return false} var esc=GT.esc,fmt=GT.fmt; var S=null; var ui={px:null,SEATCOL:[],page:"hub"}; function $(i){return document.getElementById(i)}'
echo 'window.mk=function(i,night,multi){ GT.setRng(GT.seeded(5)); S=GT.newState("wayfarer","Gus",CH.fromName("Gus",0)); S.loc=i; S.visit.night=night; return S; };'
echo 'window.show=function(i,night){ var s=mk(i,night); var o=document.getElementById("o"); o.innerHTML="<div class=scenebox id=sb>"+SC.hub(s)+"</div>"; PX.apply && 0; };'
echo 'window.showPort=function(i,night){ var s=mk(i,night); var o=document.getElementById("o"); o.innerHTML="<div class=scenebox id=sb style=\"height:auto\">"+SC.spaceport(s)+"</div>"; };'
echo '</script></body></html>'
} > street-lab.html
