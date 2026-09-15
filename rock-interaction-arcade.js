(()=>{
'use strict';
const root=document.documentElement;
root.dataset.rockInteraction='arcade';
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const fire=$('#fire'), score=$('#score'), wave=$('#wave'), hp=$('#hpText'), crosshair=$('#crosshair'), play=$('#play'), restart=$('#restart');
const moveButtons=$$('.move button');
if(!fire)return;
const style=document.createElement('style');
style.textContent=`
:root[data-rock-interaction="arcade"]{--rock-press:1;--rock-impact:0}
.rock-button-press{transform:translateY(3px) scale(.93)!important;filter:brightness(1.14) saturate(1.12)!important}
#fire.rock-button-press{transform:translateY(5px) scale(.88)!important;filter:brightness(1.2) saturate(1.2)!important}
.move button{position:relative;overflow:hidden;touch-action:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;transition:transform .09s cubic-bezier(.2,.8,.2,1),filter .09s,background .09s,box-shadow .12s}
.move button::after{content:"";position:absolute;inset:5px;border:2px solid currentColor;border-radius:14px;opacity:0;transform:scale(.78);pointer-events:none}
.move button.rock-move-held{transform:translateY(4px) scale(.9)!important;filter:brightness(1.18) saturate(1.15)!important;background:#fff3!important;box-shadow:inset 0 5px 0 #0003,0 3px 0 #0005!important}
.move button.rock-move-held::after{opacity:.35;transform:scale(1);transition:opacity .12s,transform .12s}
.move button.rock-move-return{animation:rockMoveReturn .18s ease-out}
.move button.rock-move-tap::before{content:"";position:absolute;left:50%;top:50%;width:12px;height:12px;border:2px solid currentColor;border-radius:50%;transform:translate(-50%,-50%) scale(.4);opacity:.65;animation:rockMoveRipple .28s ease-out}
.rock-hit-flash{animation:rockHitFlash .18s ease-out}
.rock-score-pop{animation:rockScorePop .28s cubic-bezier(.2,.9,.2,1)}
.rock-wave-pop{animation:rockWavePop .42s cubic-bezier(.2,1.35,.3,1)}
.rock-game-shake{animation:rockGameShake .24s ease-out}
.rock-fire-ripple{position:absolute;inset:-10px;border:3px solid currentColor;border-radius:50%;pointer-events:none;opacity:.8;animation:rockFireRipple .32s ease-out forwards}
.weapon.rock-selected-punch{animation:rockWeaponPunch .3s cubic-bezier(.2,1.3,.3,1)}
@keyframes rockMoveReturn{0%{transform:translateY(4px) scale(.9)}55%{transform:translateY(-1px) scale(1.02)}100%{transform:none}}
@keyframes rockMoveRipple{to{transform:translate(-50%,-50%) scale(2.5);opacity:0}}
@keyframes rockHitFlash{0%{transform:translate(-50%,-50%) scale(.82);opacity:.7}100%{transform:translate(-50%,-50%) scale(1.22);opacity:0}}
@keyframes rockScorePop{0%{transform:scale(.85)}55%{transform:scale(1.22)}100%{transform:scale(1)}}
@keyframes rockWavePop{0%{transform:scale(.8)}55%{transform:scale(1.16)}100%{transform:scale(1)}}
@keyframes rockGameShake{0%,100%{transform:translate3d(0,0,0)}25%{transform:translate3d(-3px,2px,0)}50%{transform:translate3d(3px,-2px,0)}75%{transform:translate3d(-2px,-1px,0)}}
@keyframes rockFireRipple{from{transform:scale(.65);opacity:.85}to{transform:scale(1.35);opacity:0}}
@keyframes rockWeaponPunch{0%{transform:translateY(-4px) scale(1.03)}45%{transform:translateY(-7px) scale(1.09)}100%{transform:translateY(-4px) scale(1.03)}}
@media(max-width:600px){.rock-fire-ripple{inset:-7px}.move button.rock-move-held{transform:translateY(3px) scale(.92)!important}}
@media(prefers-reduced-motion:reduce){.rock-button-press{transform:none!important}.rock-fire-ripple{display:none}.move button.rock-move-held{transform:none!important}.move button.rock-move-return,.move button.rock-move-tap{animation:none!important}}
`;
document.head.appendChild(style);
function press(el){if(!el)return;el.classList.add('rock-button-press');clearTimeout(el._rockPress);el._rockPress=setTimeout(()=>el.classList.remove('rock-button-press'),130)}
function ripple(){if(reduced)return;const wrap=fire.parentElement;if(!wrap)return;const r=document.createElement('span');r.className='rock-fire-ripple';wrap.appendChild(r);setTimeout(()=>r.remove(),340)}
function moveFeedback(button,held){
 if(!button)return;
 if(held){button.classList.remove('rock-move-return');button.classList.add('rock-move-held');}
 else{button.classList.remove('rock-move-held');if(!reduced){button.classList.remove('rock-move-return');void button.offsetWidth;button.classList.add('rock-move-return');button.classList.add('rock-move-tap');setTimeout(()=>button.classList.remove('rock-move-tap'),300);}}
}
moveButtons.forEach(button=>{
 button.addEventListener('contextmenu',e=>e.preventDefault());
 const release=()=>moveFeedback(button,false);
 button.addEventListener('pointerdown',e=>{
  e.preventDefault();
  try{button.setPointerCapture(e.pointerId)}catch{}
  moveFeedback(button,true);
 },{passive:false});
 button.addEventListener('pointerup',e=>{e.preventDefault();release();},{passive:false});
 button.addEventListener('pointercancel',release);
 button.addEventListener('lostpointercapture',release);
});
function fireFeedback(){
 press(fire);ripple();
 if(crosshair&&!reduced){crosshair.classList.remove('rock-hit-flash');void crosshair.offsetWidth;crosshair.classList.add('rock-hit-flash');}
 document.body.classList.remove('rock-game-shake');
 if(!reduced){void document.body.offsetWidth;document.body.classList.add('rock-game-shake');}
 window.dispatchEvent(new CustomEvent('rock:fire',{detail:{weapon:$$('.weapon').findIndex(x=>x.classList.contains('active'))}}));
}
fire.addEventListener('pointerdown',fireFeedback,{passive:true});
fire.addEventListener('click',()=>window.dispatchEvent(new Event('rock:fire-confirmed')));
$$('.icon,.primary').forEach(b=>b.addEventListener('pointerdown',()=>press(b),{passive:true}));
function weaponFeedback(b){
 if(!b)return;
 $$('.weapon').forEach(x=>x.classList.remove('rock-selected-punch'));
 if(!reduced){void b.offsetWidth;b.classList.add('rock-selected-punch');}
 window.dispatchEvent(new CustomEvent('rock:weapon-change',{detail:{name:b.textContent.trim()}}));
}
new MutationObserver(muts=>{
 for(const m of muts){
  if(m.type!=='attributes'||m.attributeName!=='class')continue;
  const b=m.target;
  if(b.classList.contains('weapon')&&b.classList.contains('active'))weaponFeedback(b);
 }
}).observe($('#weapons')||document.body,{subtree:true,attributes:true,attributeFilter:['class']});
let lastScore=score?.textContent,lastWave=wave?.textContent,lastHp=hp?.textContent;
const hud=new MutationObserver(()=>{
 const s=score?.textContent,w=wave?.textContent,h=hp?.textContent;
 if(score&&s!==lastScore){score.classList.remove('rock-score-pop');if(!reduced){void score.offsetWidth;score.classList.add('rock-score-pop')}lastScore=s;}
 if(wave&&w!==lastWave){wave.classList.remove('rock-wave-pop');if(!reduced){void wave.offsetWidth;wave.classList.add('rock-wave-pop')}lastWave=w;}
 if(hp&&h!==lastHp){if(Number(h)<Number(lastHp||h)&&!reduced){document.body.classList.remove('rock-game-shake');void document.body.offsetWidth;document.body.classList.add('rock-game-shake')}lastHp=h;}
});
if(score||wave||hp)hud.observe(document.body,{subtree:true,childList:true,characterData:true});
[play,restart].filter(Boolean).forEach(b=>b.addEventListener('click',()=>window.dispatchEvent(new Event('rock:game-transition'))));
})();
