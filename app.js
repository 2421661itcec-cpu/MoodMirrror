import {loadModel,analyze} from "./emotion-detector.js";
import {BOLLY,ANIME,RECS,EMOJI} from "./character-data.js";
import {match,alts} from "./matching-engine.js";
import {sfx,startMusic,stopMusic,isOn,setOn} from "./sound.js";
import {apiImage,imgLog} from "./api-images.js";
import {drawCard,summary,caption,copyText,download,share} from "./result-card.js";
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
let gender=localStorage.getItem("mm_g")||"any",stream=null,devs=[],ci=0,src=null,res=null,mode="both",random=false,idleT=null,kiosk=false;
let cfg={college:"Your College",event:"Career Fest",idle:60,...JSON.parse(localStorage.getItem("mm")||"{}")};
const show=id=>["landing","studio","results"].forEach(s=>$("#"+s).classList.toggle("hidden",s!==id));
function err(m,retry){$("#errMsg").textContent=m;$("#err").classList.remove("hidden");const r=$("#errRetry");r.classList.toggle("hidden",!retry);r.onclick=()=>{$("#err").classList.add("hidden");retry&&retry()};}
const status=t=>$("#camStatus").textContent=t;
function showEl(which){["video","snap","prev"].forEach(i=>$("#"+i).classList.toggle("hidden",i!==which));}
async function camOn(){
  if(!navigator.mediaDevices?.getUserMedia)return err("Your browser doesn't support camera access. Try Chrome/Edge/Safari, or upload a photo.");
  camOff();status("Requesting permission…");
  try{
    stream=await navigator.mediaDevices.getUserMedia({video:devs[ci]?{deviceId:{exact:devs[ci].deviceId}}:{facingMode:"user"}});
    $("#video").srcObject=stream;await $("#video").play();showEl("video");status("Camera on ✔");
    devs=(await navigator.mediaDevices.enumerateDevices()).filter(d=>d.kind==="videoinput");
  }catch(e){status("Camera unavailable.");
    err(e.name==="NotAllowedError"?"Camera permission denied. Allow it in your browser's site settings, or upload a photo.":e.name==="NotFoundError"?"No camera found. You can upload a photo instead.":"Couldn't start camera: "+e.message);}
}
function camOff(){stream?.getTracks().forEach(t=>t.stop());stream=null;$("#video").srcObject=null;status("Camera is off.");}
addEventListener("pagehide",camOff);
$("#camOn").onclick=camOn;$("#camOff").onclick=camOff;
$("#switchCam").onclick=()=>{if(devs.length<2)return err("Only one camera found.");ci=(ci+1)%devs.length;camOn();};
$("#capBtn").onclick=()=>{const v=$("#video");if(!stream||!v.videoWidth)return err("Start the camera first.");
  const c=$("#snap");c.width=v.videoWidth;c.height=v.videoHeight;c.getContext("2d").drawImage(v,0,0);src=c;showEl("snap");status("Photo captured.");};
const onFile=e=>{const f=e.target.files[0];if(!f)return;
  if(!["image/jpeg","image/png","image/webp"].includes(f.type))return err("Please choose a JPG, PNG or WebP image.");
  if(f.size>8*1024*1024)return err("Image is too large (max 8 MB).");
  const im=$("#prev");im.onload=()=>{src=im;showEl("prev");status("Photo ready — press Analyze.");};im.onerror=()=>err("That image couldn't be read.");im.src=URL.createObjectURL(f);};
$("#file").onchange=onFile;$("#file2").onchange=onFile;
function clearPhoto(){src=null;$("#prev").removeAttribute("src");$("#file").value="";$("#file2").value="";const c=$("#snap");c.getContext("2d").clearRect(0,0,c.width,c.height);stream?showEl("video"):showEl("");}
$("#retakeBtn").onclick=()=>{clearPhoto();if(!stream)camOn();};$("#removeBtn").onclick=clearPhoto;
async function runAnalyze(){
  if(!src)return err("Capture or upload a photo first.");
  sfx("scan");$("#scan").classList.remove("hidden");status("Loading model (first time needs internet)…");
  try{await loadModel();}catch(e){$("#scan").classList.add("hidden");return err("Model failed to load (check internet/CDN). No result was generated.",runAnalyze);}
  await new Promise(r=>setTimeout(r,1200));
  let r;try{r=analyze(src);}catch(e){$("#scan").classList.add("hidden");return err("Analysis failed: "+e.message,runAnalyze);}
  $("#scan").classList.add("hidden");
  if(r.status==="none")return err("No clear face found. Try better lighting and face the camera.");
  if(r.status==="multi")return err("Multiple faces detected. Please use a photo with just one person.");
  res=r;random=false;mode="both";render();show("results");record(res.label);confetti();sfx("reveal");
}
$("#analyzeBtn").onclick=runAnalyze;
function ph(e,sz){return `<div class="ph">${EMOJI[e.expr]}</div>`;}
function card(e){if(!e)return `<p class="muted">No labeled entry for this expression yet. Add one in character-data.js.</p>`;
  return `<div class="mc"><img src="${e.img}" data-name="${e.name}" data-series="${e.series}" data-expr="${e.expr}" alt=""><h2>${e.name}</h2><div class="muted">${e.series} · ${e.expr} expression</div><p>${e.line}</p></div>`;}
function render(){
  const e=res.label;
  res.bolly=mode==="anime"?null:match(BOLLY,e,random,gender);res.anime=mode==="bolly"?null:match(ANIME,e,random,gender);
  res.rec=RECS[e][Math.floor(Math.random()*RECS[e].length)];res.emoji=EMOJI[e];
  $("#bollyBox").classList.toggle("hidden",mode==="anime");$("#animeBox").classList.toggle("hidden",mode==="bolly");
  $("#label").textContent=EMOJI[e]+" "+e;
  $("#cues").textContent=res.cues.length?"Visible cues: "+res.cues.join(", "):"No strong cues — looks neutral.";
  $("#bars").innerHTML=Object.entries(res.scores).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div class="bar"><span>${k}</span><i style="width:${Math.round(v*100)}%"></i></div>`).join("");
  $("#bolly").innerHTML=card(res.bolly);$("#anime").innerHTML=card(res.anime);$("#rec").innerHTML="💡 "+res.rec;
  const t=$("#thumb");t.width=src.videoWidth||src.naturalWidth||src.width;t.height=src.naturalHeight||src.height;t.getContext("2d").drawImage(src,0,0,t.width,t.height);drawLM();
  const g=[...alts(BOLLY,e,res.bolly,gender),...alts(ANIME,e,res.anime,gender)];
  $("#gallery").innerHTML=g.length?g.map(x=>`<div>${card(x).replace(/<h2>.*?<\/h2>|<p>.*?<\/p>/g,"")}<b>${x.name}</b></div>`).join(""):"<span class=muted>No alternates labeled for this expression yet.</span>";
}
function drawLM(){const t=$("#thumb"),x=t.getContext("2d");if(!$("#lmToggle").checked)return;x.fillStyle="#00d4ff";res.landmarks.forEach(p=>x.fillRect(p.x*t.width-1.5,p.y*t.height-1.5,3,3));}
$("#lmToggle").onchange=()=>{const t=$("#thumb");t.getContext("2d").drawImage(src,0,0,t.width,t.height);drawLM();};
$$("[data-mode]").forEach(b=>b.onclick=()=>{random=b.dataset.mode==="surprise";mode=random?"both":b.dataset.mode;render();});
const cardCanvas=()=>drawCard(res,cfg);
$("#dl").onclick=()=>download(cardCanvas());
$("#shareBtn").onclick=()=>share(cardCanvas(),summary(res)).catch(e=>e.name!=="AbortError"&&err(e.message));
$("#cpCap").onclick=()=>copyText(caption(res)).then(()=>err("Caption copied!")).catch(()=>err("Copy failed."));
$("#cpSum").onclick=()=>copyText(summary(res)).then(()=>err("Summary copied!")).catch(()=>err("Copy failed."));
$("#again").onclick=()=>{res=null;clearPhoto();show("studio");};
function nextVisitor(){camOff();clearPhoto();res=null;$("#thumb").getContext("2d").clearRect(0,0,9999,9999);show(kiosk?"landing":"landing");}
$("#next").onclick=nextVisitor;
$("#startBtn").onclick=()=>show("studio");
// Settings & exhibition mode
const evLabel=()=>$("#event").textContent=`${cfg.event} · ${cfg.college}`;evLabel();
$("#setBtn").onclick=()=>{sCol.value=cfg.college;sEv.value=cfg.event;sIdle.value=cfg.idle;sTmdb.value=cfg.tmdb||"";dlg.showModal();};
$("#sSave").onclick=()=>{cfg={college:sCol.value,event:sEv.value,idle:+sIdle.value||60,tmdb:sTmdb.value.trim()};localStorage.setItem("mm",JSON.stringify(cfg));evLabel();dlg.close();};
$("#kioskBtn").onclick=async()=>{kiosk=true;document.body.classList.add("kiosk");$("#next").classList.remove("hidden");try{await document.documentElement.requestFullscreen();}catch{}startMusic();resetIdle();};
function resetIdle(){clearTimeout(idleT);if(!kiosk)return;idleT=setTimeout(nextVisitor,cfg.idle*1000);} // idle returns to landing; never starts the camera
["click","keydown","touchstart","mousemove"].forEach(ev=>addEventListener(ev,resetIdle));
document.addEventListener("fullscreenchange",()=>{if(!document.fullscreenElement){kiosk=false;document.body.classList.remove("kiosk");$("#next").classList.add("hidden");stopMusic();}});
// Particles
const bg=$("#bg"),bx=bg.getContext("2d");let ps=[];function rs(){bg.width=innerWidth;bg.height=innerHeight;ps=Array.from({length:60},()=>({x:Math.random()*bg.width,y:Math.random()*bg.height,v:.2+Math.random()*.6,c:Math.random()<.5?"#00d4ff":"#ff2d95"}));}
rs();addEventListener("resize",rs);(function f(){bx.clearRect(0,0,bg.width,bg.height);ps.forEach(p=>{p.y-=p.v;if(p.y<0)p.y=bg.height;bx.fillStyle=p.c;bx.globalAlpha=.5;bx.fillRect(p.x,p.y,2,2);});requestAnimationFrame(f);})();

// Image fallback chain: local file -> API (Jikan/TMDB) -> emoji placeholder
document.addEventListener("error",async ev=>{
  const i=ev.target;if(i.tagName!=="IMG"||!i.dataset.name)return;
  let warned=window.__mmw;const ph=()=>{if(!warned){window.__mmw=1;err("Couldn't load some character pictures (internet/blocked site?). Press F12 → Console for details: "+(imgLog[imgLog.length-1]||"unknown"));}i.replaceWith(Object.assign(document.createElement("div"),{className:"ph",textContent:EMOJI[i.dataset.expr]}));};
  if(i.dataset.tried)return ph();
  i.dataset.tried=1;const u=await apiImage(i.dataset.name,i.dataset.series,cfg.tmdb);
  u?i.src=u:ph();
},true);

$$(".gsel").forEach(sel=>{sel.value=gender;sel.onchange=()=>{gender=sel.value;localStorage.setItem("mm_g",gender);$$(".gsel").forEach(x=>x.value=gender);if(res)render();};});

// ---- Fun extras: confetti, badges, challenge game (all local; no photos saved) ----
function confetti(){const c=document.createElement("canvas");Object.assign(c.style,{position:"fixed",inset:0,pointerEvents:"none",zIndex:20});c.width=innerWidth;c.height=innerHeight;document.body.append(c);
  const x=c.getContext("2d"),cols=["#00d4ff","#ff2d95","#7b2ff7","#ffd23f"],p=Array.from({length:120},()=>({x:Math.random()*c.width,y:-Math.random()*300,v:2+Math.random()*4,c:cols[Math.floor(Math.random()*4)]}));let t=0;
  (function f(){x.clearRect(0,0,c.width,c.height);p.forEach(q=>{q.y+=q.v;q.x+=Math.sin(q.y/30);x.fillStyle=q.c;x.fillRect(q.x,q.y,6,10);});++t<180?requestAnimationFrame(f):c.remove();})();}
const BADGES=[["☀️ Sunshine",s=>(s.happy||0)>=3],["🌀 Plot Twist",s=>(s.surprised||0)>=2],["😎 Cool Customer",s=>(s.neutral||0)>=2],["🔥 Fire Mode",s=>(s.angry||0)>=2],["🧭 Expression Explorer",s=>["happy","sad","angry","surprised","neutral","fearful","disgusted"].every(k=>s[k])]];
function record(label){const s=JSON.parse(localStorage.getItem("mm_stats")||"{}");s[label]=(s[label]||0)+1;localStorage.setItem("mm_stats",JSON.stringify(s));
  const got=BADGES.filter(b=>b[1](s)).map(b=>`<span class="badge">${b[0]}</span>`).join("");
  $("#badges").innerHTML=got?"🏅 Your badges (this device): "+got:"🏅 Keep trying different expressions to unlock badges!";}
const TARGETS=["happy","surprised","angry","sad","disgusted","fearful"];let target="happy";
const lb=()=>JSON.parse(localStorage.getItem("mm_lb")||"[]");
function newTarget(){target=TARGETS[Math.floor(Math.random()*TARGETS.length)];$("#tgt").textContent=EMOJI[target]+" Show me: "+target.toUpperCase()+"!";$("#cres").textContent="";}
function drawLb(){const l=$("#lb");l.innerHTML="";const L=lb();if(!L.length){l.innerHTML="<li class=muted>No scores yet</li>";return;}
  L.forEach(r=>{const li=document.createElement("li");li.textContent=`${r.n} — ${r.s} pts (${r.e})`;l.append(li);});}
$("#chalBtn").onclick=()=>{$("#chal").classList.toggle("hidden");newTarget();drawLb();};
$("#newT").onclick=newTarget;
$("#clearLb").onclick=()=>{localStorage.removeItem("mm_lb");drawLb();};
$("#scoreBtn").onclick=async()=>{
  const v=$("#video");if(!stream||!v.videoWidth)return err("Start the camera first, then press Score Me.");
  try{await loadModel();}catch(e){return err("Model failed to load (check internet). No score given.");}
  const c=document.createElement("canvas");c.width=v.videoWidth;c.height=v.videoHeight;c.getContext("2d").drawImage(v,0,0);
  let r;try{r=analyze(c);}catch(e){return err("Scoring failed: "+e.message);}
  if(r.status==="none")return err("No clear face found. Face the camera with good light.");
  if(r.status==="multi")return err("Multiple faces — one player at a time please!");
  const pts=Math.round(Math.min(1,r.scores[target]/0.6)*100);
  $("#cres").textContent=`Vibe Score: ${pts}/100 ${pts>=70?"🔥":pts>=40?"👍":"😅 try again!"}`;
  const n=($("#nick").value.trim().replace(/[<>&"]/g,"")||"Player").slice(0,16);
  const L=lb();L.push({n,s:pts,e:target});L.sort((a,b)=>b.s-a.s);localStorage.setItem("mm_lb",JSON.stringify(L.slice(0,5)));drawLb();
  if(pts>=70){confetti();sfx("win");}};

// ---- Sound toggle + click sounds ----
const snd=()=>$("#sndBtn").textContent=isOn()?"🔊":"🔇";snd();
$("#sndBtn").onclick=()=>{setOn(!isOn());snd();if(isOn()&&kiosk)startMusic();};
document.addEventListener("click",e=>{if(e.target.closest("button,.btn")&&e.target.id!=="sndBtn")sfx("click");});
// ---- QR code ----
function qrMake(){const u=$("#qrUrl").value.trim();if(!/^https?:\/\//.test(u))return err("Enter a full address starting with http:// or https://");
  if(typeof qrcode==="undefined")return err("QR library missing (vendor/qrcode.js).");
  try{const q=qrcode(0,"M");q.addData(u);q.make();$("#qrimg").innerHTML=q.createImgTag(6);}catch(e){return err("QR failed: "+e.message);}
  cfg.url=u;localStorage.setItem("mm",JSON.stringify(cfg));
  const local=/\/\/(localhost|127\.)/.test(u);
  $("#qrNote").textContent=local?"localhost only works on THIS computer. Use your laptop's Wi-Fi address (e.g. http://192.168.1.5:8000) so phones on the same Wi-Fi can open it.":u.startsWith("http:")?"Phones block live camera on plain http. Visitors can still tap 'Take Selfie' or 'Upload Photo'. Use an https link for full camera access.":"Scan with a phone camera.";}
$$(".qrb").forEach(b=>b.onclick=()=>{$("#qrUrl").value=cfg.url||location.href;$("#qrimg").innerHTML="";$("#qrNote").textContent="";qrd.showModal();qrMake();});
$("#qrGen").onclick=qrMake;
