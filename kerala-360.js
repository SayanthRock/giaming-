(() => {
  'use strict';

  const style = document.createElement('style');
  style.textContent = `
    #kerala360{position:fixed;inset:0;z-index:24;display:none;overflow:hidden;background:#07110e;color:#f4fff9;font-family:Inter,system-ui,sans-serif;touch-action:none;user-select:none}
    #kerala360.open{display:block}
    #kerala360 .viewport{position:absolute;inset:0;overflow:hidden;perspective:900px;background:#07110e}
    #kerala360 .scene{position:absolute;inset:-10% -55%;width:210%;background:linear-gradient(180deg,#8ed7f0 0%,#c8eddf 44%,#4f9d67 45%,#173e2b 100%);transform:translate3d(0,0,0) scale(1.08);will-change:transform;backface-visibility:hidden}
    #kerala360 .scene:before{content:"";position:absolute;inset:0;background:radial-gradient(ellipse at 50% 42%,transparent 0 22%,#10261a22 48%,#02080688 100%),linear-gradient(90deg,#07140d88,transparent 22%,transparent 78%,#07140d88)}
    #kerala360 .mountains{position:absolute;left:0;right:0;bottom:38%;height:31%;background:linear-gradient(135deg,transparent 0 16%,#24583d 17% 27%,transparent 28%),linear-gradient(45deg,transparent 0 32%,#347451 33% 47%,transparent 48%),linear-gradient(135deg,transparent 0 55%,#1c4b35 56% 70%,transparent 71%);filter:blur(1px)}
    #kerala360 .palms{position:absolute;left:0;right:0;bottom:25%;height:40%;opacity:.92;background:radial-gradient(ellipse at 9% 72%,#123b28 0 8%,transparent 8.5%),radial-gradient(ellipse at 20% 52%,#17472f 0 7%,transparent 7.5%),radial-gradient(ellipse at 39% 78%,#123b28 0 10%,transparent 10.5%),radial-gradient(ellipse at 61% 55%,#17472f 0 8%,transparent 8.5%),radial-gradient(ellipse at 83% 72%,#123b28 0 10%,transparent 10.5%)}
    #kerala360 .water{position:absolute;left:0;right:0;bottom:0;height:29%;background:repeating-linear-gradient(0deg,#164b46 0 3px,#286b61 4px 6px,#1b594f 7px 9px);opacity:.92}
    #kerala360 .hud{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none}
    #kerala360 .title{position:absolute;top:max(18px,env(safe-area-inset-top));left:18px;padding:10px 14px;border:1px solid #ffffff2b;border-radius:16px;background:#07130dcc;backdrop-filter:blur(16px);font-weight:800;letter-spacing:.03em}
    #kerala360 .angle{position:absolute;top:max(18px,env(safe-area-inset-top));left:50%;transform:translateX(-50%);padding:8px 12px;border:1px solid #ffffff26;border-radius:14px;background:#07130dcc;backdrop-filter:blur(16px);font:700 11px ui-monospace,monospace;letter-spacing:.08em}
    #kerala360 .hint{position:absolute;bottom:max(24px,env(safe-area-inset-bottom));left:50%;transform:translateX(-50%);padding:10px 15px;border:1px solid #ffffff26;border-radius:15px;background:#07130dcc;backdrop-filter:blur(16px);font-size:12px;white-space:nowrap}
    #kerala360 .close{position:absolute;right:18px;top:max(18px,env(safe-area-inset-top));width:44px;height:44px;border:1px solid #ffffff2b;border-radius:15px;background:#07130dcc;color:#fff;font-size:20px;pointer-events:auto}
    #kerala360 .place{position:absolute;left:50%;top:calc(max(18px,env(safe-area-inset-top)) + 58px);transform:translateX(-50%);padding:8px 13px;border:1px solid #ffffff26;border-radius:14px;background:#07130dcc;backdrop-filter:blur(16px);font-size:12px;font-weight:800;white-space:nowrap}
    #kerala360 .pin{position:absolute;padding:7px 10px;border-radius:12px;background:#07130dcc;border:1px solid #ffffff24;backdrop-filter:blur(12px);font-size:11px;font-weight:700;transform:translate(-50%,-50%);pointer-events:auto;cursor:pointer;color:#fff}
    #kerala360 .pin:nth-of-type(1){left:14%;top:55%}.pin:nth-of-type(2){left:36%;top:48%}.pin:nth-of-type(3){left:58%;top:56%}.pin:nth-of-type(4){left:80%;top:46%}
    @media(max-width:600px){#kerala360 .hint{font-size:11px;max-width:82vw;text-align:center;white-space:normal}#kerala360 .title{left:12px}#kerala360 .close{right:12px}}
  `;
  document.head.appendChild(style);

  const root = document.createElement('section');
  root.id = 'kerala360';
  root.setAttribute('aria-label', 'കേരളം 360 കാഴ്ച');
  root.innerHTML = `<div class="viewport"><div class="scene"><div class="mountains"></div><div class="palms"></div><div class="water"></div></div></div><div class="hud"><div class="title">കേരളം · 360°</div><div class="angle">000°</div><div class="place">കൊച്ചി</div><button class="close" aria-label="അടയ്ക്കുക">×</button><button class="pin" data-place="കാസർഗോഡ്">കാസർഗോഡ്</button><button class="pin" data-place="കോഴിക്കോട്">കോഴിക്കോട്</button><button class="pin" data-place="കൊച്ചി">കൊച്ചി</button><button class="pin" data-place="ആലപ്പുഴ">ആലപ്പുഴ</button><div class="hint">വലത്തോട്ടോ ഇടത്തോട്ടോ ഡ്രാഗ് ചെയ്യുക · 360° കാഴ്ച</div></div>`;
  document.body.appendChild(root);

  const scene = root.querySelector('.scene');
  const close = root.querySelector('.close');
  const angleLabel = root.querySelector('.angle');
  const placeLabel = root.querySelector('.place');
  let dragging = false;
  let lastX = 0;
  let rotation = 0;
  let velocity = 0;
  let animationFrame = 0;

  const places = {
    'കാസർഗോഡ്': 0,
    'കോഴിക്കോട്': 90,
    'കൊച്ചി': 180,
    'ആലപ്പുഴ': 270
  };

  const normalize = value => ((value % 360) + 360) % 360;
  const render = () => {
    const degrees = normalize(rotation);
    const offset = (rotation / 360) * window.innerWidth;
    scene.style.transform = `translate3d(${-offset}px,0,0) scale(1.08)`;
    angleLabel.textContent = `${String(Math.round(degrees)).padStart(3, '0')}°`;
  };

  const stopInertia = () => {
    if (animationFrame) cancelAnimationFrame(animationFrame);
    animationFrame = 0;
  };

  const inertia = () => {
    if (dragging || Math.abs(velocity) < 0.01) { velocity = 0; animationFrame = 0; return; }
    rotation += velocity;
    velocity *= 0.94;
    render();
    animationFrame = requestAnimationFrame(inertia);
  };

  const goToPlace = place => {
    stopInertia();
    dragging = false;
    placeLabel.textContent = place;
    rotation = places[place] ?? 0;
    velocity = 0;
    render();
  };

  root.addEventListener('pointerdown', e => {
    if (e.target === close || e.target.classList.contains('pin')) return;
    stopInertia();
    dragging = true;
    lastX = e.clientX;
    root.setPointerCapture?.(e.pointerId);
  });

  root.addEventListener('pointermove', e => {
    if (!dragging) return;
    const delta = e.clientX - lastX;
    lastX = e.clientX;
    velocity = delta * 0.18;
    rotation += delta * 0.22;
    render();
  });

  const release = () => {
    if (!dragging) return;
    dragging = false;
    animationFrame = requestAnimationFrame(inertia);
  };
  root.addEventListener('pointerup', release);
  root.addEventListener('pointercancel', release);
  root.addEventListener('pointerleave', () => { if (dragging) release(); });
  close.addEventListener('click', () => { stopInertia(); dragging = false; root.classList.remove('open'); });
  root.querySelectorAll('.pin').forEach(pin => pin.addEventListener('click', () => goToPlace(pin.dataset.place)));

  const button = document.createElement('button');
  button.id = 'kerala360Button';
  button.className = 'icon';
  button.type = 'button';
  button.textContent = '360°';
  button.title = 'കേരളം 360° കാഴ്ച';
  button.setAttribute('aria-label', 'കേരളം 360° കാഴ്ച തുറക്കുക');
  document.querySelector('.actions')?.appendChild(button);
  button.addEventListener('click', () => {
    root.classList.add('open');
    goToPlace('കൊച്ചി');
  });
})();
