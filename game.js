/* Axe-throwing mini-game — hard mode
 * - 5 throws per round
 * - Moving target (drifts left/right)
 * - Wind affects trajectory
 * - 4s timer per throw; time out = penalty throw (auto-miss)
 * - Scoring: X=10, 9, 8, 7, 0 (miss)
 */
(function(){
  const stage = document.getElementById('range');
  if(!stage) return;
  const targetWrap = document.getElementById('targetWrap');
  const target = document.getElementById('target');
  const scoreEl = document.getElementById('game-score');
  const bestEl = document.getElementById('game-best');
  const throwsEl = document.getElementById('game-throws');
  const lastEl = document.getElementById('game-last');
  const roundEl = document.getElementById('game-round');
  const resetBtn = document.getElementById('game-reset');
  const msgEl = document.getElementById('game-msg');
  const windVal = document.getElementById('wind-val');
  const windArrow = document.getElementById('wind-arrow');
  const timerFill = document.getElementById('timer-fill');

  const MAX_THROWS = 5;
  const THROW_MS = 4000;

  const KEY_BESTROUND = 'prospekti.axe.bestround.v2';
  let bestRound = parseInt(localStorage.getItem(KEY_BESTROUND)||'0',10);
  let roundScore = 0;
  let throws = 0;
  let roundOver = false;
  let animFrame = 0;
  let wind = 0;          // pixels lateral offset
  let targetDrift = 0;
  let targetBaseLeft = 0;
  let timerStart = 0;
  let timerTimeout = 0;

  bestEl.textContent = String(bestRound).padStart(3,'0');
  scoreEl.textContent = '000';
  throwsEl.textContent = '0/'+MAX_THROWS;
  lastEl.textContent = '—';
  roundEl.textContent = 'RAUNDS 1';

  // ===== scoring based on elliptical distance =====
  function scoreFromPoint(x, y, tgtRect, stageRect){
    const cx = tgtRect.left - stageRect.left + tgtRect.width/2;
    const cy = tgtRect.top - stageRect.top + tgtRect.height/2;
    const rx = tgtRect.width/2;
    const ry = tgtRect.height/2;
    const nx = (x - cx) / rx;
    const ny = (y - cy) / ry;
    const n = Math.hypot(nx, ny);
    // X core ring is r=18/100 ~ 0.18 in normalized; 9-ring = 0.48; 8 = 0.72; 7 = 0.96
    if(n <= 0.20) return 10; // X
    if(n <= 0.48) return 9;
    if(n <= 0.72) return 8;
    if(n <= 0.96) return 7;
    return 0;
  }

  function buildAxe(){
    const el = document.createElement('div');
    el.className = 'flying-axe';
    const img = document.createElement('img');
    img.src = 'assets/axe.png';
    img.alt = '';
    img.draggable = false;
    el.appendChild(img);
    const drip = document.createElement('div');
    drip.className = 'axe-drip';
    el.appendChild(drip);
    return el;
  }

  function flash(text, color){
    msgEl.textContent = text;
    msgEl.style.color = color || '#fff';
    msgEl.classList.remove('pulse');
    void msgEl.offsetWidth;
    msgEl.classList.add('pulse');
  }

  // ===== moving target + wind =====
  function updateTargetMotion(t){
    if(roundOver) return;
    const stageRect = stage.getBoundingClientRect();
    const amplitude = Math.min(180, stageRect.width * 0.14);
    const speed = 0.0012 + (throws * 0.00015); // gets faster as round progresses
    targetDrift = Math.sin(t * speed) * amplitude + Math.sin(t * speed * 1.7) * amplitude * 0.25;
    targetWrap.style.transform = `translateY(-50%) translateX(${targetDrift}px)`;
    animFrame = requestAnimationFrame(updateTargetMotion);
  }
  animFrame = requestAnimationFrame(updateTargetMotion);

  function randomizeWind(){
    wind = (Math.random() * 2 - 1) * 90; // -90..+90 px
    const label = wind === 0 ? '0' : (wind > 0 ? '→ ' : '← ') + Math.round(Math.abs(wind));
    windVal.textContent = label;
    windArrow.style.transform = `scaleX(${wind >= 0 ? 1 : -1})`;
    windArrow.style.opacity = String(0.35 + Math.min(0.65, Math.abs(wind)/100));
  }
  randomizeWind();

  // ===== per-throw timer (disabled) =====
  function startTimer(){}
  function resetTimerBar(){}
  function forcedMiss(){}

  function performThrow(x, y, forced){
    const stageRect = stage.getBoundingClientRect();
    const tgtRect = target.getBoundingClientRect();

    // apply wind to impact
    const windedX = x + wind * 0.5;
    const windedY = y;

    const s = scoreFromPoint(windedX, windedY, tgtRect, stageRect);

    // if we hit the target, compute offset relative to target center so axe can stick to it
    const cx = tgtRect.left - stageRect.left + tgtRect.width/2;
    const cy = tgtRect.top - stageRect.top + tgtRect.height/2;
    const offX = windedX - cx;
    const offY = windedY - cy;
    const stuckToTarget = s > 0;

    // spawn axe
    const startX = -60;
    const startY = stageRect.height + 40;
    const axe = buildAxe();
    axe.style.left = startX + 'px';
    axe.style.top = startY + 'px';
    stage.appendChild(axe);

    const duration = 520;
    const midX = (startX + windedX) / 2 + wind * 0.3;
    const midY = Math.min(startY, windedY) - 240;
    const anim = axe.animate([
      { transform: `translate(-50%,-50%) rotate(-35deg)`, offset: 0 },
      { transform: `translate(${midX-startX}px, ${midY-startY}px) translate(-50%,-50%) rotate(${-35 + 540}deg)`, offset: 0.5 },
      { transform: `translate(${windedX-startX}px, ${windedY-startY}px) translate(-50%,-50%) rotate(${-35 + 1080}deg)`, offset: 1 }
    ], { duration, easing: 'cubic-bezier(.3,.1,.8,.4)' });

    anim.onfinish = () => {
      const landAngle = s > 0 ? -22 : 18;

      if(stuckToTarget){
        // move axe into targetWrap so it drifts with it
        targetWrap.appendChild(axe);
        // position relative to target center; targetWrap width = 240, height = 240 (or 200 on mobile)
        const tw = targetWrap.getBoundingClientRect();
        const relX = (tw.width/2) + offX;
        const relY = (tw.height/2) + offY;
        axe.style.left = relX + 'px';
        axe.style.top = relY + 'px';
        axe.classList.add('stuck','on-target');
        axe.style.transform = `translate(-50%,-55%) rotate(${landAngle}deg)`;
      } else {
        axe.style.left = windedX + 'px';
        axe.style.top = windedY + 'px';
        axe.style.transform = `translate(-50%,-55%) rotate(${landAngle}deg)`;
        axe.classList.add('stuck');
      }

      if(s > 0){
        targetWrap.classList.remove('hit');
        void targetWrap.offsetWidth;
        targetWrap.classList.add('hit');
      }

      const burst = document.createElement('div');
      burst.className = 'hit-burst ' + (s>0 ? 'in' : 'out');
      burst.style.left = windedX + 'px';
      burst.style.top = windedY + 'px';
      stage.appendChild(burst);
      setTimeout(()=>burst.remove(), 600);

      throws += 1;
      roundScore += s;

      scoreEl.textContent = String(roundScore).padStart(3,'0');
      throwsEl.textContent = throws + '/' + MAX_THROWS;
      lastEl.textContent = s === 0 ? 'MISS' : '+' + s;

      if(s === 10) flash('X · BULLSEYE · +10', '#ff4d5e');
      else if(s === 9) flash('9 · +9', '#ff8c42');
      else if(s === 8) flash('8 · +8', '#ffd166');
      else if(s === 7) flash('7 · +7', '#e8e8e8');
      else flash('GARĀM · 0', '#6a6a6a');

      if(throws >= MAX_THROWS){
        endRound();
      } else {
        randomizeWind();
      }
    };
  }

  function endRound(){
    roundOver = true;
    cancelAnimationFrame(animFrame);
    if(roundScore > bestRound){
      bestRound = roundScore;
      localStorage.setItem(KEY_BESTROUND, bestRound);
      bestEl.textContent = String(bestRound).padStart(3,'0');
      setTimeout(()=>flash('⚡ JAUNS REKORDS · ' + roundScore, '#ffd166'), 700);
    } else {
      setTimeout(()=>flash('RAUNDS BEIDZIES · ' + roundScore + '/50', '#e8e8e8'), 700);
    }
    setTimeout(startNewRound, 2800);
  }

  function startNewRound(){
    roundScore = 0;
    throws = 0;
    roundOver = false;
    scoreEl.textContent = '000';
    throwsEl.textContent = '0/'+MAX_THROWS;
    lastEl.textContent = '—';
    stage.querySelectorAll('.flying-axe').forEach(a=>a.remove());
    targetWrap.querySelectorAll('.flying-axe').forEach(a=>a.remove());
    const prev = parseInt((roundEl.textContent.match(/\d+/)||[1])[0],10);
    roundEl.textContent = 'RAUNDS ' + (prev+1);
    flash('JAUNS RAUNDS · 5 METIENI', '#9aa0a6');
    randomizeWind();
    animFrame = requestAnimationFrame(updateTargetMotion);
  }

  function onClick(e){
    if(roundOver) return;
    if(e.target.closest('.game-ui')) return;
    if(e.target.closest('.target-label')) return;
    const stageRect = stage.getBoundingClientRect();
    const x = e.clientX - stageRect.left;
    const y = e.clientY - stageRect.top;
    performThrow(x, y, false);
  }

  stage.addEventListener('click', onClick);

  resetBtn.addEventListener('click', ()=>{
    cancelAnimationFrame(animFrame);
    roundScore = 0; throws = 0; roundOver = false;
    scoreEl.textContent = '000';
    throwsEl.textContent = '0/'+MAX_THROWS;
    lastEl.textContent = '—';
    roundEl.textContent = 'RAUNDS 1';
    stage.querySelectorAll('.flying-axe').forEach(a=>a.remove());
    targetWrap.querySelectorAll('.flying-axe').forEach(a=>a.remove());
    flash('RESET', '#9aa0a6');
    randomizeWind();
    animFrame = requestAnimationFrame(updateTargetMotion);
  });

  // kick off
  flash('X = 10 · VĒJŠ · METI CIRVI!', '#e8e8e8');
})();
