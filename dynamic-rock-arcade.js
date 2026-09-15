(() => {
  'use strict';

  // Dynamic Rock Arcade is intentionally internal: players get one signature style,
  // while these controllers adapt intensity to the current gameplay state.
  const root = document.documentElement;
  const hud = document.querySelector('.hud');
  const crosshair = document.getElementById('crosshair');
  const damage = document.getElementById('damage');
  const fire = document.getElementById('fire');
  const score = document.getElementById('score');
  const wave = document.getElementById('wave');
  const hpText = document.getElementById('hpText');
  const weapons = document.getElementById('weapons');
  const toast = document.getElementById('toast');
  const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

  root.dataset.rockStyle = 'dynamic';

  const state = {
    intensity: 0.35,
    combat: false,
    lastScore: Number(score?.textContent || 0),
    lastWave: Number(wave?.textContent || 1),
    lastHp: Number(hpText?.textContent || 100),
    lastWeapon: null,
    hitTimer: 0,
    flashTimer: 0
  };

  const DynamicStyleController = {
    update() {
      const mobile = innerWidth <= 600;
      const pressure = Math.max(0, 1 - state.lastHp / 100);
      const target = state.combat ? 0.62 + pressure * 0.25 : 0.30 + pressure * 0.18;
      state.intensity += (target - state.intensity) * 0.08;
      root.style.setProperty('--rock-intensity', state.intensity.toFixed(3));
      root.style.setProperty('--rock-glass', mobile ? '14px' : '18px');
      root.style.setProperty('--rock-ui-scale', mobile ? '1' : '0.96');
      root.dataset.rockPhase = state.combat ? 'combat' : 'cruise';
    }
  };

  const RockMotionController = {
    pulse(el, scale = 1.04, duration = 140) {
      if (!el || prefersReducedMotion.matches) return;
      el.animate(
        [{ transform: 'scale(1)' }, { transform: `scale(${scale})` }, { transform: 'scale(1)' }],
        { duration, easing: 'cubic-bezier(.2,.8,.2,1)' }
      );
    },
    weapon(el) {
      if (!el || prefersReducedMotion.matches) return;
      el.animate(
        [{ transform: 'translateY(5px) scale(.96)' }, { transform: 'translateY(-5px) scale(1.04)' }, { transform: 'translateY(-4px) scale(1.03)' }],
        { duration: 190, easing: 'cubic-bezier(.2,.8,.2,1)' }
      );
    },
    fire() {
      if (!fire || prefersReducedMotion.matches) return;
      const heavy = /ROCKET|GRENADE|SHOTGUN/.test((document.querySelector('.weapon.active')?.textContent || ''));
      fire.animate(
        [{ transform: 'scale(1)' }, { transform: `scale(${heavy ? .87 : .93})` }, { transform: 'scale(1)' }],
        { duration: heavy ? 180 : 105, easing: 'cubic-bezier(.2,.9,.2,1)' }
      );
      root.animate(
        [{ transform: 'translate3d(0,0,0)' }, { transform: `translate3d(${heavy ? -2 : -1}px,${heavy ? 2 : 1}px,0)` }, { transform: 'translate3d(0,0,0)' }],
        { duration: heavy ? 150 : 90 }
      );
    },
    hit() {
      state.hitTimer = 120;
      if (!crosshair || prefersReducedMotion.matches) return;
      crosshair.classList.add('hit');
      crosshair.animate(
        [{ transform: 'translate(-50%,-50%) scale(.8)' }, { transform: 'translate(-50%,-50%) scale(1.18)' }, { transform: 'translate(-50%,-50%) scale(1)' }],
        { duration: 170, easing: 'cubic-bezier(.2,.9,.2,1)' }
      );
    },
    wave() {
      if (!toast || prefersReducedMotion.matches) return;
      toast.animate(
        [{ opacity: 0, transform: 'translate(-50%,-10px) scale(.96)' }, { opacity: 1, transform: 'translate(-50%,0) scale(1.04)' }, { opacity: 1, transform: 'translate(-50%,0) scale(1)' }],
        { duration: 260, easing: 'cubic-bezier(.2,.8,.2,1)' }
      );
    }
  };

  const CombatFeedbackController = {
    check() {
      const nextScore = Number(score?.textContent || 0);
      const nextWave = Number(wave?.textContent || 1);
      const nextHp = Number(hpText?.textContent || 100);
      const activeWeapon = document.querySelector('.weapon.active');

      if (activeWeapon && activeWeapon !== state.lastWeapon) {
        state.lastWeapon = activeWeapon;
        RockMotionController.weapon(activeWeapon);
      }
      if (nextScore > state.lastScore) RockMotionController.hit();
      if (nextWave > state.lastWave) RockMotionController.wave();
      if (nextHp < state.lastHp && damage) {
        state.combat = true;
        state.flashTimer = 380;
        if (!prefersReducedMotion.matches) {
          damage.animate(
            [{ opacity: 0 }, { opacity: .9 }, { opacity: 0 }],
            { duration: 360, easing: 'ease-out' }
          );
        }
      }
      state.lastScore = nextScore;
      state.lastWave = nextWave;
      state.lastHp = nextHp;
      state.combat = nextHp < 100 || nextScore > 0;
    }
  };

  fire?.addEventListener('pointerdown', () => {
    state.combat = true;
    RockMotionController.fire();
  }, { passive: true });

  weapons?.addEventListener('click', event => {
    const button = event.target.closest('.weapon');
    if (button) RockMotionController.weapon(button);
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
    if (state.hitTimer > 0) state.hitTimer -= dt;
    if (state.flashTimer > 0) state.flashTimer -= dt;
    if (state.flashTimer <= 0 && Number(hpText?.textContent || 100) >= 100) state.combat = false;
    DynamicStyleController.update();
    requestAnimationFrame(frame);
  }

  addEventListener('resize', DynamicStyleController.update, { passive: true });
  prefersReducedMotion.addEventListener?.('change', DynamicStyleController.update);
  requestAnimationFrame(frame);
})();
