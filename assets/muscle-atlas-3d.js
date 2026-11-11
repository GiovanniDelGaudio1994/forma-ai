import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

const groups=[
 {id:'chest',name:'Pettorali',color:0xd04cf9,description:'Area muscolare anteriore del torace, coinvolta soprattutto nei movimenti di spinta.',exercise:'Push-up facilitato',instruction:'Spinta a corpo libero con difficoltà adattabile. Movimento indicativo, non un programma individuale.',area:'Parte superiore'},
 {id:'shoulders',name:'Spalle',color:0x7c74ff,description:'Area deltoidea e articolazioni della spalla, coinvolte nel sollevamento e nel controllo delle braccia.',exercise:'Alzate laterali leggere',instruction:'Esempio di elevazione laterale controllata con carico gestibile.',area:'Parte superiore'},
 {id:'arms',name:'Braccia',color:0xff68bc,description:'Insieme semplificato dei muscoli anteriori e posteriori del braccio che partecipano alla flessione e all’estensione del gomito.',exercise:'Curl con manubri',instruction:'Esempio di flessione del gomito, senza indicazioni personalizzate di peso o volume.',area:'Parte superiore'},
 {id:'core',name:'Addome',color:0x42b9f8,description:'Muscolatura del tronco coinvolta nella stabilizzazione, nel controllo della postura e nei movimenti del busto.',exercise:'Dead bug semplificato',instruction:'Esempio di esercizio di controllo del tronco, da adattare alle proprie capacità.',area:'Core'},
 {id:'back',name:'Dorsali',color:0x9656ff,description:'Ampia area muscolare posteriore del tronco, coinvolta nei movimenti di trazione.',exercise:'Rematore con manubrio',instruction:'Esempio di movimento di trazione con attenzione al controllo del busto.',area:'Parte superiore'},
 {id:'glutes',name:'Glutei',color:0xff7c96,description:'Muscolatura posteriore del bacino coinvolta nell’estensione e stabilizzazione dell’anca.',exercise:'Ponte glutei',instruction:'Esempio di sollevamento controllato del bacino da posizione supina.',area:'Parte inferiore'},
 {id:'legs',name:'Gambe',color:0x7b88ff,description:'Vista semplificata di quadricipiti, posteriori della coscia e polpacci, coinvolti nel movimento delle gambe.',exercise:'Squat a corpo libero',instruction:'Esempio di piegamento e risalita con ampiezza e difficoltà adeguate alle capacità.',area:'Parte inferiore'}
];
const stage=document.getElementById('stage');
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.55;
stage.appendChild(renderer.domElement);
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(37,1,.1,100);
camera.position.set(0,1.28,8.4);
const controls=new OrbitControls(camera,renderer.domElement);
controls.enableDamping=true;controls.dampingFactor=.065;
controls.enablePan=false;controls.minDistance=5;controls.maxDistance=11;
controls.minPolarAngle=.3;controls.maxPolarAngle=Math.PI-.3;
controls.target.set(0,.15,0);
scene.add(new THREE.HemisphereLight(0xcad3ff,0x1c1c56,2.1));
const key=new THREE.DirectionalLight(0xe9c1ff,3.4);key.position.set(3,6,5);scene.add(key);
const blue=new THREE.PointLight(0x527aff,65,12);blue.position.set(-3,-1,2);scene.add(blue);
const rim=new THREE.PointLight(0xae55ff,50,12);rim.position.set(3,2,-4);scene.add(rim);
const body=new THREE.Group();scene.add(body);
const baseMat=new THREE.MeshStandardMaterial({color:0x435276,metalness:.25,roughness:.44});
const jointMat=new THREE.MeshStandardMaterial({color:0x304066,metalness:.28,roughness:.42});
const muscles=[];
function part(x,y,z,sx,sy,sz,group=null,rot=0){
 const material=group?new THREE.MeshStandardMaterial({color:0x3e466c,metalness:.28,roughness:.4,emissive:0x080816,emissiveIntensity:.24}):baseMat;
 const mesh=new THREE.Mesh(new THREE.SphereGeometry(1,24,16),material);
 mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);mesh.rotation.z=rot;
 mesh.castShadow=false;mesh.userData.group=group;body.add(mesh);
 if(group)muscles.push(mesh);
 return mesh;
}
function bone(x,y,z,sx,sy,sz,rot=0){const mesh=new THREE.Mesh(new THREE.SphereGeometry(1,20,14),jointMat);mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);mesh.rotation.z=rot;body.add(mesh);return mesh;}
part(0,2.12,0,.38,.43,.34); // head
bone(0,1.68,0,.17,.18,.16);
part(0,.85,0,.65,.91,.37); // upper torso
part(0,-.15,0,.49,.39,.36); // pelvis
for(const sign of [-1,1]){
 part(sign*.32,1.21,.26,.34,.38,.17,'chest',sign*.1);
 part(sign*.68,1.39,.05,.29,.25,.3,'shoulders');
 part(sign*.82,.87,.05,.20,.44,.21,'arms',sign*.12);
 part(sign*.92,.14,.07,.18,.39,.18,'arms',-sign*.1);
 bone(sign*.95,-.18,.07,.15,.15,.15);
 bone(sign*1,-.32,.07,.14,.18,.14);
 part(sign*.33,-.72,0,.29,.53,.29,'legs',-sign*.06);
 bone(sign*.33,-1.25,.01,.23,.23,.24);
 part(sign*.32,-1.69,.03,.20,.46,.21,'legs',sign*.03);
 part(sign*.34,-2.15,.19,.22,.12,.39);
 part(sign*.26,-.18,-.33,.27,.32,.14,'glutes');
 part(sign*.35,.55,-.32,.29,.65,.14,'back',sign*.04);
}
for(let i=0;i<3;i++){
 for(const sign of [-1,1])part(sign*.19,.92-i*.31,.33,.17,.135,.085,'core');
}
part(0,-.05,.31,.3,.18,.13,'core');
const floor=new THREE.Mesh(new THREE.RingGeometry(1.16,1.19,90),new THREE.MeshBasicMaterial({color:0x7957f9,transparent:true,opacity:.5,side:THREE.DoubleSide}));
floor.rotation.x=-Math.PI/2;floor.position.y=-2.42;scene.add(floor);
const floor2=new THREE.Mesh(new THREE.CircleGeometry(1.08,90),new THREE.MeshBasicMaterial({color:0x46248a,transparent:true,opacity:.09,side:THREE.DoubleSide}));
floor2.rotation.x=-Math.PI/2;floor2.position.y=-2.43;scene.add(floor2);
const raycaster=new THREE.Raycaster();const pointer=new THREE.Vector2();
let active='chest',rotating=false,previous={x:0,y:0},drag=false,raf=0;
const buttonHolder=document.getElementById('muscles');
for(const group of groups){
 const button=document.createElement('button');button.type='button';button.className='muscle';button.dataset.group=group.id;button.textContent=group.name;
 button.addEventListener('click',()=>setActive(group.id));buttonHolder.appendChild(button);
}
function setActive(id){
 active=id;const g=groups.find(x=>x.id===id)||groups[0];
 document.getElementById('muscle-name').textContent=g.name;
 document.getElementById('muscle-description').textContent=g.description;
 document.getElementById('exercise-title').textContent=g.exercise;
 document.getElementById('exercise-description').textContent=g.instruction;
 document.getElementById('exercise-area').textContent=g.area;
 buttonHolder.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.group===id));
 muscles.forEach(mesh=>{
  const selected=mesh.userData.group===id;
  mesh.material.color.setHex(selected?g.color:0x354161);
  mesh.material.emissive.setHex(selected?g.color:0x070a18);
  mesh.material.emissiveIntensity=selected?.28:.12;
  mesh.material.metalness=selected?.15:.33;
 });
}
setActive('chest');
stage.addEventListener('pointerdown',e=>{previous={x:e.clientX,y:e.clientY};drag=false});
stage.addEventListener('pointermove',e=>{if(Math.abs(e.clientX-previous.x)>5||Math.abs(e.clientY-previous.y)>5)drag=true});
stage.addEventListener('click',event=>{
 if(drag)return;
 const rect=renderer.domElement.getBoundingClientRect();
 pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);
 raycaster.setFromCamera(pointer,camera);
 const hit=raycaster.intersectObjects(muscles,false)[0];
 if(hit?.object.userData.group)setActive(hit.object.userData.group);
});
document.getElementById('front').addEventListener('click',()=>{rotating=false;syncSpin();body.rotation.y=0;controls.reset()});
document.getElementById('back').addEventListener('click',()=>{rotating=false;syncSpin();body.rotation.y=Math.PI;controls.reset()});
document.getElementById('reset').addEventListener('click',()=>{body.rotation.y=0;rotating=false;syncSpin();controls.reset();setActive('chest')});
document.getElementById('spin').addEventListener('click',()=>{rotating=!rotating;syncSpin()});
function syncSpin(){document.getElementById('spin').setAttribute('aria-pressed',String(rotating));}
const size=new ResizeObserver(()=>{const w=stage.clientWidth||700,h=stage.clientHeight||600;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false)});
size.observe(stage);
const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let last=performance.now();
function draw(time){
 raf=requestAnimationFrame(draw);
 const dt=Math.min((time-last)/1000,.05);last=time;
 if(rotating&&!reduceMotion)body.rotation.y+=dt*.44;
 controls.update();renderer.render(scene,camera);
}
raf=requestAnimationFrame(draw);
window.addEventListener('pagehide',()=>{cancelAnimationFrame(raf);size.disconnect();controls.dispose();renderer.dispose()},{once:true});
