const KEY='forma-ai-v1';
const DB='forma-ai-private';
let databasePromise;
export const loadState=()=>{
  try {const raw=localStorage.getItem(KEY);return raw?JSON.parse(raw):{};}catch{return {};}
};
export const saveState=state=>{
  const copy=JSON.parse(JSON.stringify(state));
  // Un token di accesso non viene mai persistito sul dispositivo.
  if(copy.profile) delete copy.profile.coachToken;
  localStorage.setItem(KEY,JSON.stringify(copy));
};
export function resetState(){localStorage.removeItem(KEY);}
function db(){
  if(!('indexedDB' in globalThis)) return Promise.reject(new Error('IndexedDB non disponibile'));
  if(!databasePromise) databasePromise=new Promise((resolve,reject)=>{
    const req=indexedDB.open(DB,1);
    req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains('photos'))req.result.createObjectStore('photos');};
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error);
  });
  return databasePromise;
}
export async function storePhoto(key,blob){
  const d=await db();return new Promise((resolve,reject)=>{
    const tx=d.transaction('photos','readwrite');tx.objectStore('photos').put(blob,key);
    tx.oncomplete=()=>resolve(key);tx.onerror=()=>reject(tx.error);
  });
}
export async function getPhoto(key){
  const d=await db();return new Promise((resolve,reject)=>{
    const tx=d.transaction('photos','readonly');const req=tx.objectStore('photos').get(key);
    req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>reject(req.error);
  });
}
export async function deletePhoto(key){
  const d=await db();return new Promise((resolve,reject)=>{
    const tx=d.transaction('photos','readwrite');tx.objectStore('photos').delete(key);
    tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);
  });
}
export async function clearPhotos(){
  const d=await db();return new Promise((resolve,reject)=>{
    const tx=d.transaction('photos','readwrite');tx.objectStore('photos').clear();
    tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);
  });
}
export async function compressPhoto(file){
  if(!file.type.startsWith('image/'))throw new Error('Seleziona un file immagine');
  if(file.size>15_000_000)throw new Error('Immagine troppo grande (massimo 15 MB)');
  const img=await createImageBitmap(file);
  const limit=1200,scale=Math.min(1,limit/Math.max(img.width,img.height));
  const canvas=document.createElement('canvas');canvas.width=Math.round(img.width*scale);canvas.height=Math.round(img.height*scale);
  canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);img.close?.();
  return new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('Compressione fallita')),'image/jpeg',0.78));
}
export function downloadJson(state){
  const safe=structuredClone(state);
  if(safe.profile) delete safe.profile.coachToken;
  const blob=new Blob([JSON.stringify({version:1,exportedAt:new Date().toISOString(),data:safe},null,2)],{type:'application/json'});
  download(blob,`forma-ai-backup-${new Date().toISOString().slice(0,10)}.json`);
}
export function download(blob,name){
  const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export function calendarIcs(date,interval=14){
  const next=String(date).replaceAll('-','');const duration=Math.max(1,Math.min(90,Number(interval)||14));
  const ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//FORMA AI//Check reminder//IT','CALSCALE:GREGORIAN','BEGIN:VEVENT',
    `UID:forma-check-${next}@forma.local`,`DTSTAMP:${new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'')}`,
    `DTSTART:${next}T180000`,`DTEND:${next}T181500`,`RRULE:FREQ=DAILY;INTERVAL=${duration}`,
    'SUMMARY:FORMA AI - Check progressi','DESCRIPTION:Registra peso misurato, misure e foto progressi. Le foto restano sul dispositivo.',
    'BEGIN:VALARM','ACTION:DISPLAY','DESCRIPTION:È il momento del check progressi','TRIGGER:-PT1H','END:VALARM','END:VEVENT','END:VCALENDAR'].join('\r\n');
  download(new Blob([ics],{type:'text/calendar;charset=utf-8'}),'forma-ai-check.ics');
}
