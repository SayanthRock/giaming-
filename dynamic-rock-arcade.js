(() => {
  'use strict';

  const root = document.documentElement;
  const crosshair = document.getElementById('crosshair');
  const damage = document.getElementById('damage');
  const fire = document.getElementById('fire');
  const score = document.getElementById('score');
  const wave = document.getElementById('wave');
  const hpText = document.getElementById('hpText');
  const weapons = document.getElementById('weapons');
  const toast = document.getElementById('toast');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');

  root.dataset.rockStyle = 'dynamic';
  const style = document.createElement('style');
  style.textContent = `
    :root[data-rock-phase="cruise"] .panel{backdrop-filter:blur(var(--rock-glass));-webkit-backdrop-filter:blur(var(--rock-glass))}
    :root[data-rock-phase="combat"] .panel{backdrop-filter:blur(calc(var(--rock-glass) + 4px));-webkit-backdrop-filter:blur(calc(var(--rock-glass) + 4px));box-shadow:0 16px 44px rgba(0,0,0,.34),inset 0 1px rgba(255,255,255,.08)}
    :root[data-rock-mobile="true"] .weapon{min-height:58px}
    :root[data-rock-mobile="false"] .hud{transform:scale(var(--rock-ui-scale));transform-origin:bottom center}
    .rock-react{will-change:transform}
  `;
  document.head.appendChild(style);

  const state = {
    intensity: .30,
    combatTimer: 0,
    hitTimer: 0,
    lastScore: Number(score?.textContent || 0),
    lastWave: Number(wave?.textContent || 1),
    lastHp: Number(hpText?.textContent || 100),
    lastWeapon: null
  };

  const DynamicStyleController = {
    update() {
      const mobile = innerWidth <= 600;
      const hp = Number(hpText?.textContent || 100);
      const pressure = Math.max(0, 1 - hp / 100);
      const target = state.combatTimer > 0 ? .62 + pressure * .25 : .30 + pressure * .18;
      state.intensity += (target - state.intensity) * .08;
      root.style.setProperty('--rock-intensity', state.intensity.toFixed(3));
      root.style.setProperty('--rock-glass', mobile ? '14px' : '18px');
      root.style.setProperty('--rock-ui-scale', mobile ? '1' : '.96');
      root.dataset.rockPhase = state.combatTimer > 0 ? 'combat' : 'cruise';
      root.dataset.rockMobile = String(mobile);
    }
  };

  const RockMotionController = {
    animate(el, keyframes, duration) {
      if (!el || reduced.matches) return;
      el.animate(keyframes, { duration, easing: 'cubic-bezier(.2,.8,.2,1)' });
    },
    weapon(el) {
      el?.classList.add('rock-react');
      this.animate(el, [
        { transform: 'translateY(5px) scale(.96)' },
        { transform: 'translateY(-5px) scale(1.04)' },
        { transform: 'translateY(-4px) scale(1.03)' }
      ], 190);
    },
    fire() {
      if (!fire) return;
      const name = document.querySelector('.weapon.active')?.textContent || '';
      const heavy = /ROCKET|GRENADE|SHOTGUN/.test(name);
      this.animate(fire, [
        { transform: 'scale(1)' },
        { transform: `scale(${heavy ? .87 : .93})` },
        { transform: 'scale(1)' }
      ], heavy ? 180 : 105);
    },
    hit() {
      state.hitTimer = 150;
      if (!crosshair) return;
      crosshair.classList.add('hit');
      this.animate(crosshair, [
        { transform: 'translate(-50%,-50%) scale(.8)' },
        { transform: 'translate(-50%,-50%) scale(1.18)' },
        { transform: 'translate(-50%,-50%) scale(1)' }
      ], 170);
    },
    wave() {
      this.animate(toast, [
        { opacity: 0, transform: 'translate(-50%,-10px) scale(.96)' },
        { opacity: 1, transform: 'translate(-50%,0) scale(1.04)' },
        { opacity: 1, transform: 'translate(-50%,0) scale(1)' }
      ], 260);
    },
    damage() {
      this.animate(damage, [{ opacity: 0 }, { opacity: .9 }, { opacity: 0 }], 360);
    }
  };

  const CombatFeedbackController = {
    check() {
      const nextScore = Number(score?.textContent || 0);
      const nextWave = Number(wave?.textContent || 1);
      const nextHp = Number(hpText?.textContent || 100);
      const active = document.querySelector('.weapon.active');
      state.combatTimer = Math.max(state.combatTimer, nextHp < 100 ? 450 : 0);

      if (active && active !== state.lastWeapon) {
        state.lastWeapon = active;
        state.combatTimer = 500;
        RockMotionController.weapon(active);
      }
      if (nextScore > state.lastScore) {
        state.combatTimer = 420;
        RockMotionController.hit();
      }
      if (nextWave > state.lastWave) {
        state.combatTimer = 900;
        RockMotionController.wave();
      }
      if (nextHp < state.lastHp) {
        state.combatTimer = 700;
        RockMotionController.damage();
      }
      state.lastScore = nextScore;
      state.lastWave = nextWave;
      state.lastHp = nextHp;
    }
  };

  fire?.addEventListener('pointerdown', () => {
    state.combatTimer = 500;
    RockMotionController.fire();
  }, { passive: true });

  weapons?.addEventListener('click', e => {
    const button = e.target.closest('.weapon');
    if (button) {
      state.combatTimer = 450;
      RockMotionController.weapon(button);
    }
  });

  const observer = new MutationObserver(() => CombatFeedbackController.check());
  [score, wave, hpText, weapons, damage].filter(Boolean).forEach(el => observer.observe(el, {
    childList: true,
    characterData: true,
    attributes: el === damage || el === weapons
  }));

  let last = performance.now();
  function frame(now) {
    const dt = now - last;
    last = now;
    state.combatTimer = Math.max(0, state.combatTimer - dt);
    state.hitTimer -= dt;
    if (state.hitTimer <= 0) crosshair?.classList.remove('hit');
    DynamicStyleController.update();
    requestAnimationFrame(frame);
  }

  addEventListener('resize', DynamicStyleController.update, { passive: true });
  reduced.addEventListener?.('change', DynamicStyleController.update);
  requestAnimationFrame(frame);
})();
