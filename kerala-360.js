(() => {
  'use strict';

  const style = document.createElement('style');
  style.textContent = `
    #kerala360{position:fixed;inset:0;z-index:24;display:none;overflow:hidden;background:#07110e;color:#f4fff9;font-family:Inter,system-ui,sans-serif;touch-action:none}
    #kerala360.open{display:block}
    #kerala360 .scene{position:absolute;inset:-8%;background:linear-gradient(180deg,#8ed7f0 0%,#c8eddf 44%,#4f9d67 45%,#173e2b 100%);transform:scale(1.08);will-change:transform}
    #kerala360 .scene:before{content:"";position:absolute;inset:0;background:radial-gradient(ellipse at 50% 42%,transparent 0 22%,#10261a22 48%,#02080688 100%),linear-gradient(90deg,#07140d88,transparent 22%,transparent 78%,#07140d88)}
    #kerala360 .mountains{position:absolute;left:-10%;right:-10%;bottom:38%;height:31%;background:linear-gradient(135deg,transparent 0 16%,#24583d 17% 27%,transparent 28%),linear-gradient(45deg,transparent 0 32%,#347451 33% 47%,transparent 48%),linear-gradient(135deg,transparent 0 55%,#1c4b35 56% 70%,transparent 71%);filter:blur(1px)}
    #kerala360 .palms{position:absolute;left:-5%;right:-5%;bottom:25%;height:40%;opacity:.92;background:radial-gradient(ellipse at 9% 72%,#123b28 0 8%,transparent 8.5%),radial-gradient(ellipse at 20% 52%,#17472f 0 7%,transparent 7.5%),radial-gradient(ellipse at 39% 78%,#123b28 0 10%,transparent 10.5%),radial-gradient(ellipse at 61% 55%,#17472f 0 8%,transparent 8.5%),radial-gradient(ellipse at 83% 72%,#123b28 0 10%,transparent 10.5%)}
    #kerala360 .water{position:absolute;left:-10%;right:-10%;bottom:0;height:29%;background:repeating-linear-gradient(0deg,#164b46 0 3px,#286b61 4px 6px,#1b594f 7px 9px);opacity:.92}
    #kerala360 .hud{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none}
    #kerala360 .title{position:absolute;top:max(18px,env(safe-area-inset-top));left:18px;padding:10px 14px;border:1px solid #ffffff2b;border-radius:16px;background:#07130dcc;backdrop-filter:blur(16px);font-weight:800;letter-spacing:.03em}
    #kerala360 .hint{position:absolute;bottom:max(24px,env(safe-area-inset-bottom));left:50%;transform:translateX(-50%);padding:10px 15px;border:1px solid #ffffff26;border-radius:15px;background:#07130dcc;backdrop-filter:blur(16px);font-size:12px;white-space:nowrap}
    #kerala360 .close{position:absolute;right:18px;top:max(18px,env(safe-area-inset-top));width:44px;height:44px;border:1px solid #ffffff2b;border-radius:15px;background:#07130dcc;color:#fff;font-size:20px;pointer-events:auto}
    #kerala360 .pin{position:absolute;padding:7px 10px;border-radius:12px;background:#07130dcc;border:1px solid #ffffff24;backdrop-filter:blur(12px);font-size:11px;font-weight:700;transform:translate(-50%,-50%)}
    #kerala360 .pin:nth-of-type(1){left:27%;top:54%}.pin:nth-of-type(2){left:50%;top:47%}.pin:nth-of-type(3){left:73%;top:58%}
    @media(max-width:600px){#kerala360 .hint{font-size:11px;max-width:82vw;text-align:center;white-space:normal}}
  `;
  document.head.appendChild(style);

  const root = document.createElement('section');
  root.id = 'kerala360';
  root.setAttribute('aria-label', 'കേരളം 360 കാഴ്ച');
  root.innerHTML = `<div class="scene"><div class="mountains"></div><div class="palms"></div><div class="water"></div></div><div class="hud"><div class="title">കേരളം · 360°</div><button class="close" aria-label="അടയ്ക്കുക">×</button><div class="pin">കൊച്ചി</div><div class="pin">ആലപ്പുഴ</div><div class="pin">മുന്നാർ</div><div class="hint">വലത്തോട്ടോ ഇടത്തോട്ടോ ഡ്രാഗ് ചെയ്യുക · 360° കാഴ്ച</div></div>`;
  document.body.appendChild(root);

  const scene = root.querySelector('.scene');
  const close = root.querySelector('.close');
  let dragging = false, lastX = 0, rotation = 0;

  const render = () => { scene.style.transform = `scale(1.08) translateX(${rotation}px)`; };
  root.addEventListener('pointerdown', e => { if (e.target === close) return; dragging = true; lastX = e.clientX; root.setPointerCapture?.(e.pointerId); });
  root.addEventListener('pointermove', e => { if (!dragging) return; rotation = Math.max(-180, Math.min(180, rotation + (e.clientX - lastX) * .72)); lastX = e.clientX; render(); });
  root.addEventListener('pointerup', () => { dragging = false; });
  root.addEventListener('pointercancel', () => { dragging = false; });
  close.addEventListener('click', () => root.classList.remove('open'));

  const button = document.createElement('button');
  button.id = 'kerala360Button';
  button.className = 'icon';
  button.type = 'button';
  button.textContent = '360°';
  button.title = 'കേരളം 360° കാഴ്ച';
  button.setAttribute('aria-label', 'കേരളം 360° കാഴ്ച തുറക്കുക');
  document.querySelector('.actions')?.appendChild(button);
  button.addEventListener('click', () => { rotation = 0; render(); root.classList.add('open'); });
})();
