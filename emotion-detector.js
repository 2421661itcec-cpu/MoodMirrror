// Expression estimation via MediaPipe Face Landmarker blendshapes + transparent rule-based mapping (runs on-device).
import {FaceLandmarker,FilesetResolver} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs";
let lm=null;
export async function loadModel(){
  if(lm)return;
  const fs=await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm");
  lm=await FaceLandmarker.createFromOptions(fs,{baseOptions:{modelAssetPath:"https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task"},runningMode:"IMAGE",numFaces:2,outputFaceBlendshapes:true});
}
const avg=(b,...k)=>k.reduce((s,x)=>s+(b[x]||0),0)/k.length;
export function classify(b){
  const s={
    happy:avg(b,"mouthSmileLeft","mouthSmileRight")*1.2,
    surprised:(avg(b,"eyeWideLeft","eyeWideRight")+(b.browInnerUp||0)+(b.jawOpen||0))/3*1.3,
    sad:(avg(b,"mouthFrownLeft","mouthFrownRight")+(b.browInnerUp||0)*.6+avg(b,"mouthPressLeft","mouthPressRight")*.3)/2,
    angry:(avg(b,"browDownLeft","browDownRight")+avg(b,"eyeSquintLeft","eyeSquintRight")*.5+avg(b,"mouthPressLeft","mouthPressRight")*.5)/2*1.2,
    disgusted:avg(b,"noseSneerLeft","noseSneerRight")*1.3+avg(b,"mouthUpperUpLeft","mouthUpperUpRight")*.3,
    fearful:(avg(b,"eyeWideLeft","eyeWideRight")+(b.browInnerUp||0)+(b.mouthStretchLeft||0))/3*(1-(b.jawOpen||0)),
  };
  for(const k in s)s[k]=Math.min(1,s[k]);
  let top=Object.entries(s).sort((a,c)=>c[1]-a[1])[0];
  const label=top[1]<0.25?"neutral":top[0];
  return {label,scores:s};
}
const CUES={mouthSmileLeft:"smile",browInnerUp:"raised inner eyebrows",eyeWideLeft:"wide eyes",jawOpen:"open mouth",browDownLeft:"lowered brows",mouthFrownLeft:"downturned mouth",noseSneerLeft:"wrinkled nose"};
export function analyze(el){
  if(!lm)throw new Error("Model not loaded");
  const r=lm.detect(el),n=r.faceLandmarks.length;
  if(!n)return {status:"none"};
  if(n>1)return {status:"multi"};
  const b={};r.faceBlendshapes[0].categories.forEach(c=>b[c.categoryName]=c.score);
  const c=classify(b);
  const cues=Object.keys(CUES).filter(k=>b[k]>.3).map(k=>CUES[k]);
  return {status:"ok",...c,cues,landmarks:r.faceLandmarks[0]};
}
