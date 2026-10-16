// Synthesized sounds (Web Audio) — no audio files needed. Starts only after a user click (browser rule).
let ctx=null,on=localStorage.getItem("mm_snd")!=="0",timer=null,step=0;
const AC=()=>ctx||(ctx=new(window.AudioContext||window.webkitAudioContext)());
function tone(f,t0,d,type="sine",v=.12){const c=AC(),t=c.currentTime+t0,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.value=f;
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(v,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+d+.05);}
export const isOn=()=>on;
export function setOn(v){on=v;localStorage.setItem("mm_snd",v?"1":"0");if(!v)stopMusic();}
export function sfx(n){if(!on)return;try{
  if(n==="click")tone(880,0,.06,"square",.04);
  if(n==="scan")for(let i=0;i<9;i++)tone(300+i*90,i*.13,.16,"sawtooth",.04);
  if(n==="reveal")[523,659,784,1047].forEach((f,i)=>tone(f,i*.12,.4,"triangle",.1));
  if(n==="win")[523,659,784,1047,1319].forEach((f,i)=>tone(f,i*.1,.5,"triangle",.12));
}catch(e){}}
const PROG=[[220,261.6,329.6],[174.6,220,261.6],[261.6,329.6,392],[196,246.9,293.7]];
export function startMusic(){if(!on||timer)return;try{AC().resume();}catch(e){}
  timer=setInterval(()=>{const ch=PROG[Math.floor(step/6)%4];tone(ch[step%3]*(step%6>=3?2:1),0,.55,"triangle",.03);step++;},320);}
export function stopMusic(){clearInterval(timer);timer=null;}
