// Experimental device-side pose screening. Never infers injury, actual load, or clinical diagnoses.
const VERSION='0.10.22';
const PACKAGE=`https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${VERSION}`;
const MODEL='https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';
const angle=(a,b,c)=>{
 const u=[a.x-b.x,a.y-b.y],v=[c.x-b.x,c.y-b.y];
 const dot=u[0]*v[0]+u[1]*v[1],mag=Math.hypot(...u)*Math.hypot(...v);
 return mag>0?Math.acos(Math.max(-1,Math.min(1,dot/mag)))*180/Math.PI:NaN;
};
export function compareArms(landmarks){
 if(!Array.isArray(landmarks)||landmarks.length<17)return null;
 const confident=[11,12,13,14,15,16].every(i=>(landmarks[i].visibility??1)>.6);
 if(!confident)return null;
 const left=angle(landmarks[11],landmarks[13],landmarks[15]);
 const right=angle(landmarks[12],landmarks[14],landmarks[16]);
 if(!Number.isFinite(left)||!Number.isFinite(right))return null;
 return {left:Math.round(left),right:Math.round(right),difference:Math.abs(left-right)};
}
export function interpretArms(rows){
 const eligible=rows.filter(Boolean);
 if(eligible.length<5)return {level:'uncertain',text:'Non ci sono abbastanza fotogrammi con entrambe le braccia visibili. Prova con luce uniforme, camera stabile e inquadratura frontale completa.'};
 const larger=eligible.filter(r=>r.difference>=22).length;
 if(larger>=Math.ceil(eligible.length*.65))return {level:'review',text:'In diversi fotogrammi i due gomiti mostrano angoli differenti. Potrebbero incidere prospettiva, fase del movimento e occlusioni: ripeti la ripresa di fronte con entrambi i lati visibili e valuta con un professionista se hai dubbi. Non è possibile dedurre quale braccio sostiene più peso.'};
 return {level:'neutral',text:'Non emergono differenze ampie e persistenti negli angoli dei gomiti nei fotogrammi osservabili. Questo non certifica una tecnica corretta: controlla ritmo, stabilità e comfort.'};
}
async function seek(video,time){
 if(Math.abs(video.currentTime-time)<.03)return;
 await new Promise((resolve,reject)=>{const timeout=setTimeout(()=>{cleanup();reject(new Error('Impossibile leggere i fotogrammi del video.'));},6000);
  const done=()=>{cleanup();resolve();};const cleanup=()=>{clearTimeout(timeout);video.removeEventListener('seeked',done);video.removeEventListener('error',error);};
  const error=()=>{cleanup();reject(new Error('Video non leggibile.'));};video.addEventListener('seeked',done,{once:true});video.addEventListener('error',error,{once:true});video.currentTime=time;});
}
export async function inspectVideo(video,onProgress=()=>{}){
 if(!Number.isFinite(video.duration)||video.duration<=0)throw new Error('Attendi il caricamento del video.');
 const {FilesetResolver,PoseLandmarker}=await import(`${PACKAGE}/+esm`);
 const vision=await FilesetResolver.forVisionTasks(`${PACKAGE}/wasm`);
 const landmarker=await PoseLandmarker.createFromOptions(vision,{baseOptions:{modelAssetPath:MODEL,delegate:'CPU'},runningMode:'IMAGE',numPoses:1});
 const samples=[];const duration=Math.min(30,video.duration);
 try{
  video.pause();for(let i=0;i<12;i++){
    await seek(video,Math.min(video.duration-.02,duration*(.08+.84*i/11)));
    const result=landmarker.detect(video);samples.push(compareArms(result.landmarks?.[0]));onProgress(Math.round((i+1)/12*100));
  }
 }finally{landmarker.close?.();}
 return {observed:samples.filter(Boolean).length,total:samples.length,report:interpretArms(samples),note:'Stima sperimentale da landmark 2D, senza misure dei carichi. Non è una valutazione biomeccanica o medica.'};
}
