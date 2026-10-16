// Draws a shareable card. NEVER includes the user's photo.
export function drawCard(r,cfg){
  const c=document.createElement("canvas");c.width=1080;c.height=1350;const x=c.getContext("2d");
  const g=x.createLinearGradient(0,0,1080,1350);g.addColorStop(0,"#2a0a4d");g.addColorStop(1,"#08030f");x.fillStyle=g;x.fillRect(0,0,1080,1350);
  x.fillStyle="#fff";x.textAlign="center";x.font="bold 64px sans-serif";x.fillText("MoodMirror AI",540,120);
  x.fillStyle="#00d4ff";x.font="30px sans-serif";x.fillText("Your Expression. Your Vibe. Your Character.",540,170);
  x.font="200px sans-serif";x.fillText(r.emoji,540,420);
  x.fillStyle="#ff2d95";x.font="bold 80px sans-serif";x.fillText(r.label.toUpperCase(),540,540);
  x.fillStyle="#fff";x.font="44px sans-serif";
  if(r.bolly)x.fillText("Bollywood vibe: "+r.bolly.name,540,700);
  if(r.anime)x.fillText("Anime vibe: "+r.anime.name,540,780);
  x.font="34px sans-serif";x.fillStyle="#ddd";x.fillText(r.rec,540,920);
  x.font="26px sans-serif";x.fillStyle="#999";x.fillText(`${cfg.event} · ${cfg.college}`,540,1240);
  x.fillText("Estimated expression, for entertainment only.",540,1290);return c;
}
export const summary=r=>`MoodMirror AI: my estimated expression is ${r.label}. ${r.bolly?"Bollywood vibe: "+r.bolly.name+". ":""}${r.anime?"Anime vibe: "+r.anime.name+" ("+r.anime.series+"). ":""}${r.rec}`;
export const caption=r=>`${r.emoji} ${r.label} mode • ${r.bolly?r.bolly.line:""} ${r.anime?r.anime.line:""} #MoodMirrorAI`;
export const copyText=t=>navigator.clipboard.writeText(t);
export function download(c){const a=document.createElement("a");a.download="moodmirror-result.png";a.href=c.toDataURL("image/png");a.click();}
export async function share(c,text){
  if(!navigator.share)throw new Error("Web Share isn't supported here — use Download or Copy instead.");
  const blob=await new Promise(r=>c.toBlob(r,"image/png"));const f=new File([blob],"moodmirror.png",{type:"image/png"});
  if(navigator.canShare&&navigator.canShare({files:[f]}))return navigator.share({files:[f],text});
  return navigator.share({text});
}
