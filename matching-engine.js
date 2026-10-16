import {BOLLY,ANIME} from "./character-data.js";
// pref: "m" | "f" | "any" (chosen by the user, never guessed from the face). "x" entries match anyone.
const ok=(x,e,pref)=>x.expr===e&&(pref==="any"||!pref||x.g===pref||x.g==="x");
const rnd=a=>a[Math.floor(Math.random()*a.length)];
export function match(list,expr,random=false,pref="any"){
  const p=list.filter(x=>ok(x,expr,pref));if(!p.length)return null;
  return random?rnd(p):p[0];
}
export const alts=(list,expr,cur,pref="any")=>list.filter(x=>ok(x,expr,pref)&&x!==cur);
export {BOLLY,ANIME};
