/* BUVG vertical rail — simple 24-step train */
(function(){
  const train = document.getElementById('railTrain');
  const btnPrev = document.getElementById('railPrev');
  const btnNext = document.getElementById('railNext');
  const countEl = document.getElementById('railCount');
  const dirEl = document.getElementById('railDir');

  const numEl = document.getElementById('td-num');
  const stationEl = document.getElementById('td-station');
  const titleEl = document.getElementById('td-title');
  const featEl = document.getElementById('td-feat');
  const embedEl = document.getElementById('td-embed');

  if(!train || !btnPrev || !btnNext) return;

  // Track data — num, title, features, spotify track id, station label
  const tracks = [
    [1,'BRICKS','xantikvariāts · Kjuumanis · Jshawn · og montekarlo','4Gj7sgU5EV2BZPy8rDhIxu','PROSPEKTI HQ'],
    [2,'KOKA LAPĀ','xantikvariāts · og montekarlo · Flabbijs · HOTTE','1mP2M8RwydYv2byLJCyWC5','PIETURA 02'],
    [3,'VAI TU ZINI, KAS IR PROSPEKTI?','Flabbijs · Kjuumanis · og montekarlo','45sOFIYf0UUBnRnuTJQJsv','PIETURA 03'],
    [4,'DARBARĪKI','xantikvariāts · Jshawn · Lagans · og montekarlo · Kjuumanis · Klaids · Flabbijs','2iiunqIealXzeBWVMTkuvK','PIETURA 04'],
    [5,'VIENTUĻNIEKS','og montekarlo · Kjuumanis · xantikvariāts · Jshawn · Lagans · Flabbijs','24BH7PysbJkvrzpd8e6To3','PIETURA 05'],
    [6,'KARAVĪRS','xantikvariāts · og montekarlo · Flabbijs · edoo0','2pAlkvIUx1ocMUWX05OwGY','PIETURA 06'],
    [7,'RASTAKLĀDS','og montekarlo · Flabbijs · Jshawn · edoo0','5Q5eaAOEVHRSOlLc5ZAtS0','PIETURA 07'],
    [8,'ZEN G','HOTTE · xantikvariāts · Flabbijs · og montekarlo · Kjuumanis · Lagans','4ApGPsD0rw1ZA95gjUIY5W','PIETURA 08'],
    [9,'PASTARĀ TIESA','Jshawn · Lagans · Flabbijs · xantikvariāts · og montekarlo','1G5p66sJImTeABOGPxBAyZ','PIETURA 09'],
    [10,'PEREKLIKS','Kaizers · Jshawn · Lagans · Decs · Steps','3Q8ooDDqEnaYwtxZJZuOHe','PIETURA 10'],
    [11,'SIEVA DUSMĪGA','Kjuumanis · Klaids · edoo0 · Flabbijs','1AX30b1NfgGoDVwIB5hBHH','PIETURA 11'],
    [12,'ŠŅABIS UZ POHĀM','Decs · edoo0 · Kjuumanis · DJ PM2AM scratches','7dAlyUBRkpBYuqdtC3HVca','PIETURA 12'],
    [13,'PAJEBAĶ','Kjuumanis · Flabbijs · Decs · og montekarlo · Jshawn','1WUivpiaQLcjoC3ZAetYTb','PIETURA 13'],
    [14,'PILNA APTVERE','Decs · Lagans · edoo0 · og montekarlo · Flabbijs · Kjuumanis · Jshawn · Klaids','3YgLgejqy6sM00UTGVSGvF','PIETURA 14'],
    [15,'2121 KONSPEKTI','Klaids','02UNt4G25xuSlBp0dzR3SW','PIETURA 15'],
    [16,'PŪZNIS','Flabbijs · Jshawn · Kjuumanis · edoo0','38IZBhlDWGticyiUWixoKX','PIETURA 16'],
    [17,'KUR IR NAĻIKS?','Flabbijs · xantikvariāts · Kjuumanis · og montekarlo','68U0WjyfzSmiibOsCcr7Jh','PIETURA 17'],
    [18,'SHTIRĪ','Lagans · Jshawn · xantikvariāts · HOTTE','7drML0XZpf5ULv8i1StapW','PIETURA 18'],
    [19,'UZMANĪGI','Kaizers · Lagans · Jshawn · Kjuumanis · xantikvariāts · og montekarlo · Flabbijs','2I4RJd0Q9KydQeWVzD7jTZ','PIETURA 19'],
    [20,'SIENĀM ACIS UN AUSIS','Kjuumanis · xantikvariāts · edoo0 · Flabbijs','3W6Nnn31msbFwDP4PUPYlL','PIETURA 20'],
    [21,'KRĒJUMS SKĀBAIS','HOTTE · Kjuumanis · Jshawn · Lagans · xantikvariāts','5Fi7lpMd0J2DBEuiZoGLaF','PIETURA 21'],
    [22,'LAGANA CIRVIS','Lagans · Jshawn · Kjuumanis','3Afa3SITjTPFlJUbV5A7gi','PIETURA 22'],
    [23,'GAISMA TUMSĀ','edoo0','4bXimrvPFFIPmXKF0SuGWv','PIETURA 23'],
    [24,'POHUJ','Kaizers · oriģināls 2009','70TnJLbzPLachr7mAF77hw','GALA PIETURA'],
  ];

  const STEP = 12;        // px per stop
  const START_Y = 40;     // train start position (just below top endpoint)
  const MAX = tracks.length - 1;

  let idx = 0;

  function render(animate){
    const [num, title, feat, spotifyId, station] = tracks[idx];
    numEl.textContent = String(num).padStart(2,'0');
    stationEl.textContent = station;
    titleEl.textContent = title;
    featEl.textContent = feat;
    if(embedEl){
      const src = 'https://open.spotify.com/embed/track/' + spotifyId + '?utm_source=generator&theme=0';
      if(embedEl.getAttribute('src') !== src) embedEl.setAttribute('src', src);
    }

    train.style.top = (START_Y + idx * STEP) + 'px';

    if(animate){
      train.classList.remove('chugging');
      void train.offsetWidth;
      train.classList.add('chugging');
      setTimeout(() => train.classList.remove('chugging'), 850);
    }

    countEl.textContent = String(num).padStart(2,'0') + ' / 24';
    dirEl.textContent = idx === MAX ? 'GALA PIETURA' : (idx === 0 ? 'SĀKUMS' : 'UZ DIENVIDIEM');
    btnPrev.disabled = idx === 0;
    btnNext.disabled = idx === MAX;
  }

  btnPrev.addEventListener('click', () => { if(idx>0){ idx--; render(true); } });
  btnNext.addEventListener('click', () => { if(idx<MAX){ idx++; render(true); } });

  window.addEventListener('keydown', (e) => {
    const buvg = document.getElementById('buvg');
    if(!buvg) return;
    const r = buvg.getBoundingClientRect();
    if(r.top > window.innerHeight || r.bottom < 0) return;
    if(e.target && /input|textarea/i.test(e.target.tagName)) return;
    if(e.key === 'ArrowDown'){ e.preventDefault(); if(idx<MAX){ idx++; render(true); } }
    else if(e.key === 'ArrowUp'){ e.preventDefault(); if(idx>0){ idx--; render(true); } }
  });

  render(false);
})();
