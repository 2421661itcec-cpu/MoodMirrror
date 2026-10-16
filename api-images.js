// Image sources, tried in order. Bollywood: TMDB (if key) -> Wikipedia. Anime: Wikipedia -> Jikan -> AniList.
// Each request has a 6s timeout + 1 retry. Portraits are NOT expression-specific. Cached in localStorage.
const K="mm_img_cache3",cache=JSON.parse(localStorage.getItem(K)||"{}");
let chain=Promise.resolve();
export const imgLog=[];
const note=(n,s,e)=>{imgLog.push(`${n} via ${s}: ${e}`);console.warn("[MoodMirror image]",n,"via",s,"-",e);};
// Characters with no Wikipedia page of their own fall back to their series page (series artwork).
const ALT={"Levi Ackerman":"Attack on Titan","Mikasa Ackerman":"Attack on Titan","Gojo Satoru":"Jujutsu Kaisen","Nezuko Kamado":"Demon Slayer: Kimetsu no Yaiba","Hinata Hyuga":"Naruto","Tanjiro Kamado":"Demon Slayer: Kimetsu no Yaiba","Sailor Moon":"Sailor Moon","Goku":"Goku"};
async function f(u,o){const c=new AbortController(),t=setTimeout(()=>c.abort(),6000);
  try{const r=await fetch(u,{...o,signal:c.signal});if(!r.ok)throw new Error("HTTP "+r.status);return await r.json();}
  catch(e){throw new Error(e.name==="AbortError"?"timed out":e.message);}finally{clearTimeout(t);}}
const wikiOne=async t=>{const j=await f("https://en.wikipedia.org/api/rest_v1/page/summary/"+encodeURIComponent(t.replace(/ /g,"_")));return j.thumbnail&&j.thumbnail.source||null;};
const SRC={
  async tmdb(n,key){if(!key)throw new Error("no key");const j=await f(`https://api.themoviedb.org/3/search/person?api_key=${encodeURIComponent(key)}&query=${encodeURIComponent(n)}`);
    const p=j.results&&j.results[0];return p&&p.profile_path?"https://image.tmdb.org/t/p/w500"+p.profile_path:null;},
  async wiki(n){let u=await wikiOne(n).catch(()=>null);if(!u&&ALT[n])u=await wikiOne(ALT[n]);return u;},
  async jikan(n){const j=await f(`https://api.jikan.moe/v4/characters?q=${encodeURIComponent(n)}&limit=1`);return j.data&&j.data[0]&&j.data[0].images.jpg.image_url||null;},
  async anilist(n){const j=await f("https://graphql.anilist.co",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({query:"query($s:String){Character(search:$s){image{large}}}",variables:{s:n}})});
    return j.data&&j.data.Character&&j.data.Character.image.large||null;}
};
export function apiImage(name,series,key){
  if(cache[name])return Promise.resolve(cache[name]);
  const job=chain.then(()=>run(name,series,key));
  chain=job.then(()=>new Promise(r=>setTimeout(r,300)),()=>{});return job;
}
async function run(name,series,key){
  const order=series==="Bollywood"?["tmdb","wiki"]:["wiki","jikan","anilist"];
  for(const s of order)for(let a=0;a<2;a++){
    try{const u=await SRC[s](name,key);if(u){cache[name]=u;localStorage.setItem(K,JSON.stringify(cache));return u;}note(name,s,"no image");break;}
    catch(e){if(e.message==="no key")break;note(name,s,e.message);}
  }
  return null;
}
