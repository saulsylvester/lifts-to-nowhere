// @ts-nocheck
export class Sound {
  muted: boolean;
  constructor(muted = false) { this.muted = muted; this.ctx = null; this.stepAt = 0; }
  unlock() {
    if (!this.ctx) {
      const Context = globalThis.AudioContext || globalThis.webkitAudioContext;
      if (Context) try { this.ctx = new Context(); } catch { /* Silent play is supported. */ }
    }
    this.ctx?.resume().catch(() => {});
  }
  tone(freq, duration = .12, type = 'sine', volume = .04, delay = 0) {
    if (this.muted || !this.ctx || this.ctx.state !== 'running') return;
    const t = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
    osc.type = type; osc.frequency.value = freq;
    gain.gain.setValueAtTime(0,t); gain.gain.linearRampToValueAtTime(volume,t+.01); gain.gain.exponentialRampToValueAtTime(.0001,t+duration);
    osc.connect(gain); gain.connect(this.ctx.destination); osc.start(t); osc.stop(t+duration+.02);
  }
  noise(duration=.2,volume=.025,delay=0) {
    if(this.muted||!this.ctx||this.ctx.state!=='running')return;
    const t=this.ctx.currentTime+delay,buffer=this.ctx.createBuffer(1,Math.ceil(this.ctx.sampleRate*duration),this.ctx.sampleRate),data=buffer.getChannelData(0);
    for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*(1-i/data.length);
    const source=this.ctx.createBufferSource(),gain=this.ctx.createGain(),filter=this.ctx.createBiquadFilter();
    source.buffer=buffer;filter.type='lowpass';filter.frequency.value=900;gain.gain.setValueAtTime(volume,t);gain.gain.exponentialRampToValueAtTime(.0001,t+duration);
    source.connect(filter);filter.connect(gain);gain.connect(this.ctx.destination);source.start(t);source.stop(t+duration+.02);
  }
  play(name, floor = 0) {
    if(name==='room-flip'){[147,196,262,196,98].forEach((f,i)=>this.tone(f,.16,'triangle',.026,i*.1));this.noise(.25,.016,.36);}
    if(name==='plant-growing')[62,78,98,131].forEach((f,i)=>this.tone(f,.28,'sawtooth',.025,i*.16));
    if(name==='plant-grabbing'){this.tone(186,.25,'triangle',.045);this.tone(93,.24,'square',.023,.1);}
    if(name==='plant-swallowing'){this.tone(65,.22,'sawtooth',.07);this.tone(42,.35,'triangle',.065,.08);this.noise(.18,.045,.12);}
    if(name==='plant-chewing')for(let i=0;i<3;i++){this.tone(i%2?73:57,.18,'triangle',.052,i*.37);this.noise(.11,.025,i*.37+.07);}
    if(name==='plant-burst'){this.noise(.65,.055);[156,117,78].forEach((f,i)=>this.tone(f,.19,'sawtooth',.034,i*.13));this.noise(.18,.026,.7);}
    if(name==='plant-aftermath'){this.tone(76,.3,'triangle',.03);this.tone(392,.12,'sine',.02,.4);}
    if(name==='gameover') [330,294,247,165,82].forEach((f,i)=>this.tone(f,.45,'triangle',.055,i*.2));
    if (name === 'step') {
      const now = performance.now(); if (now - this.stepAt < 190) return; this.stepAt = now;
      this.tone(100+Math.random()*35,.04,'triangle',.012); return;
    }
    if (name === 'button') this.tone(540,.07,'square',.017);
    if (name === 'door') { this.tone(90,.3,'triangle',.035); this.tone(130,.22,'triangle',.025,.15); }
    if (name === 'travel') { this.tone(65,1.8,'sine',.06); this.tone(98,1.8,'triangle',.016); }
    if (name === 'arrival') { this.tone(660,.5,'sine',.07); this.tone(880,.7,'sine',.05,.18); }
    if (name === 'discovery') [392,494,587,784].forEach((f,i)=>this.tone(f,.28,'triangle',.065,i*.11));
    if (name === 'effect') {
      const notes = floor === 42 || floor === 88 ? [262,330,392,330,440,392,523,392] : [220+floor*2,330+floor*2,440+floor*2];
      notes.forEach((f,i)=>this.tone(f,.18,'triangle',.04,i*.17));
    }
    if (name === 'complete') [262,330,392,523,392,523,659,784].forEach((f,i)=>this.tone(f,.35,'triangle',.07,i*.16));
  }
}
