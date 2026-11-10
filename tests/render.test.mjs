import test from 'node:test';
import assert from 'node:assert/strict';

// Smoke-test views without a browser, because the app intentionally has no frontend dependencies.
const events=new Map();const nodes=new Map();
const app={innerHTML:''};nodes.set('#app',app);
globalThis.document={
 querySelector:s=>nodes.get(s)||null,
 querySelectorAll:()=>[],
 addEventListener:(name,fn)=>events.set(name,fn)
};
globalThis.localStorage={_map:new Map(),getItem(k){return this._map.get(k)||null;},setItem(k,v){this._map.set(k,v);},removeItem(k){this._map.delete(k);}};
globalThis.window={scrollTo(){},addEventListener(){}};
Object.defineProperty(globalThis,'navigator',{value:{},configurable:true});
globalThis.location={protocol:'http:',hostname:'other.example'};
await import('../src/app.js');
test('prima pagina viene renderizzata senza eccezioni',()=>{
 assert.match(app.innerHTML,/Bentornato/);
 assert.match(app.innerHTML,/forma-ai|FORMA/i);
});
for(const [page,expected] of [
 ['workouts','Programma settimanale'],['nutrition','Screening allergeni'],['checks','Nuovo check progressi'],
 ['motion','Registra. Rivedi. Migliora.'],['coach','ATHLETE INTELLIGENCE'],['settings','Screening allergeni']
]){
 test(`la sezione ${page} si apre`,()=>{
  const element={dataset:{page},closest(s){return s==='[data-page]'?this:null;}};
  events.get('click')({target:element});
  assert.ok(app.innerHTML.includes(expected));
 });
}
