import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from '../server/index.mjs';

let server,origin;
test.before(async()=>{
 server=createServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));origin=`http://127.0.0.1:${server.address().port}`;
});
test.after(async()=>{if(server)await new Promise(resolve=>server.close(resolve));});
test('server serva homepage',async()=>{
 const r=await fetch(origin+'/');assert.equal(r.status,200);assert.match(await r.text(),/FORMA/);
 assert.match(r.headers.get('content-security-policy'),/object-src/);
});
test('server non espone segreti o source backend',async()=>{
 for(const p of ['/.env','/.env.example','/server/index.mjs','/../.env','/%2e%2e/%2eenv']){
  const r=await fetch(origin+p);assert.equal(r.status,404,p);
 }
});
test('health segnala lo stato configurazione',async()=>{
 const r=await fetch(origin+'/api/health');assert.equal(r.status,200);assert.equal((await r.json()).ok,true);
});
test('senza credenziali AI endpoint ritorna messaggio trasparente',async()=>{
 const r=await fetch(origin+'/api/coach',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({task:'message',profile:{},context:{message:'ciao'}})});
 assert.equal(r.status,503);assert.match((await r.json()).error,/non configurato/);
});
test('CORS non autorizzato viene bloccato',async()=>{
 const r=await fetch(origin+'/api/health',{headers:{origin:'https://evil.example'}});assert.equal(r.status,403);
});

test('server rifiuta un URL malformato senza interrompersi',async()=>{
 const r=await fetch(origin+'/%EF%ZZ').catch(()=>null);
 // Il client Fetch può normalizzare parte degli URL; in entrambi i casi il server resta online.
 assert.ok(r===null || [400,404].includes(r.status));
 const healthy=await fetch(origin+'/api/health');assert.equal(healthy.status,200);
});
