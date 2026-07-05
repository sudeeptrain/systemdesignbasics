/* ============== System Design Lessons — canonical animation engine ==============
   Single source of truth. Inlined into every lesson by build.js.
   Topics call SD.run({steps:[{cap, dur, on?}], loop?}). Speed scales captions
   AND (via SD.rate) the per-topic simulation motion. */
(function(){
  const SPEEDS=[{n:'Slow',m:1.7},{n:'Normal',m:1.1},{n:'Fast',m:.7}]; // default = Slow
  const SD={steps:[],i:0,n:0,loop:true,playing:true,spd:0,timer:null,raf:null,els:{shows:[],ranges:[],actives:[],hides:[]},
    rate(){return SPEEDS[this.spd].m;},
    init(){this.cap=document.getElementById('cap');this.counter=document.getElementById('counter');this.dotsWrap=document.getElementById('dots');this.prog=document.getElementById('prog');this.btnPlay=document.getElementById('btnPlay');this.btnSpd=document.getElementById('btnSpd');this.btnLoop=document.getElementById('btnLoop');
      const S=document.querySelector('.scene');
      this.els.shows=[...S.querySelectorAll('[data-show]')].map(e=>[e,+e.dataset.show]);
      this.els.actives=[...S.querySelectorAll('[data-active]')].map(e=>[e,+e.dataset.active]);
      this.els.hides=[...S.querySelectorAll('[data-hide]')].map(e=>[e,+e.dataset.hide]);
      this.els.ranges=[...S.querySelectorAll('[data-show-range]')].map(e=>{const[a,b]=e.dataset.showRange.split('-').map(Number);return[e,a,b];});},
    run(cfg){this.steps=cfg.steps;this.n=this.steps.length;this.loop=cfg.loop!==false;
      const boot=()=>{this.init();this.buildDots();this.bind();this.go(0);};
      if(document.readyState==='loading')window.addEventListener('DOMContentLoaded',boot);else boot();},
    buildDots(){if(!this.dotsWrap)return;this.dotsWrap.innerHTML='';this.steps.forEach((_,k)=>{const d=document.createElement('button');d.className='dot-nav';d.setAttribute('aria-label','Step '+(k+1));d.onclick=()=>{this.pause();this.go(k);};this.dotsWrap.appendChild(d);});},
    bind(){this.btnPlay.onclick=()=>this.playing?this.pause():this.resume();
      this.btnSpd.onclick=()=>{this.spd=(this.spd+1)%SPEEDS.length;this.btnSpd.querySelector('.t').textContent=SPEEDS[this.spd].n;if(window.onRateChange)window.onRateChange(this.rate());if(this.playing){clearTimeout(this.timer);this.schedule();}};
      this.btnLoop.onclick=()=>{this.loop=!this.loop;this.btnLoop.classList.toggle('pri',this.loop);this.btnLoop.querySelector('.t').textContent='Loop '+(this.loop?'on':'off');};
      document.getElementById('btnReplay').onclick=()=>{this.resume();this.go(0);};},
    apply(k){document.body.dataset.step=k+1;
      this.els.shows.forEach(([e,s])=>e.classList.toggle('vis',(k+1)>=s));
      this.els.hides.forEach(([e,h])=>e.classList.toggle('vis',(k+1)<h));
      this.els.ranges.forEach(([e,a,b])=>e.classList.toggle('vis',(k+1)>=a&&(k+1)<=b));
      this.els.actives.forEach(([e,a])=>e.classList.toggle('active',(k+1)===a));
      if(this.dotsWrap)[...this.dotsWrap.children].forEach((d,idx)=>{d.classList.toggle('cur',idx===k);d.classList.toggle('done',idx<k);});},
    go(k){this.i=k;const st=this.steps[k];this.apply(k);this.cap.innerHTML=st.cap;this.counter.textContent=(k+1)+' / '+this.n;if(st.on)try{st.on();}catch(e){console.error('step on() error',e);}if(this.playing)this.schedule();},
    schedule(){clearTimeout(this.timer);const dur=(this.steps[this.i].dur||3000)*this.rate();this.animateProg(dur);this.timer=setTimeout(()=>this.advance(),dur);},
    advance(){if(this.i+1<this.n){this.go(this.i+1);}else if(this.loop){setTimeout(()=>{if(this.playing)this.go(0);},900);}else{this.pause();}},
    animateProg(dur){cancelAnimationFrame(this.raf);const start=performance.now();const tick=(t)=>{const p=Math.min(1,(t-start)/dur);this.prog.style.width=(p*100).toFixed(1)+'%';if(p<1&&this.playing)this.raf=requestAnimationFrame(tick);};this.raf=requestAnimationFrame(tick);},
    pause(){this.playing=false;clearTimeout(this.timer);cancelAnimationFrame(this.raf);this.btnPlay.querySelector('.t').textContent='Play';this.btnPlay.querySelector('.i').textContent='▶';},
    resume(){this.playing=true;this.btnPlay.querySelector('.t').textContent='Pause';this.btnPlay.querySelector('.i').textContent='⏸';this.schedule();},
  };
  window.SD=SD;
  /* shared helper for topic sims: effective motion rate (speed * MOTION calm factor) */
  window.MOTION=1.55;
  window.simRate=function(){ return ((window.SD&&SD.rate)?SD.rate():1)*window.MOTION; };
})();
