import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {timingSafeEqual} from 'node:crypto';
import {generateWithAI} from './coach.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
if(existsSync(path.join(ROOT,'.env')))process.loadEnvFile(path.join(ROOT,'.env'));
const HOST=process.env.HOST||'127.0.0.1';const PORT=Number(process.env.PORT)||8787;
const ALLOWED=(process.env.ALLOWED_ORIGINS||'').split(',').map(x=>x.trim()).filter(Boolean);
const TOKEN=process.env.COACH_ACCESS_TOKEN||'';
if(HOST!=='127.0.0.1'&&HOST!=='localhost'&&!TOKEN){
  console.error('Per esporre il server sulla rete devi impostare COACH_ACCESS_TOKEN nel file .env.');process.exit(1);
}
const MIME={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.json':'application/json','.webmanifest':'application/manifest+json','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon'};
const usage=new Map();
function respond(res,status,data,headers={}){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',...headers});res.end(JSON.stringify(data));}
function allowedOrigin(origin,req){
  if(!origin)return true; // richieste native / curl / server-side
  try{return new URL(origin).host===req.headers.host||ALLOWED.includes(origin);}catch{return false;}
}
function authorized(value){
 if(!TOKEN)return true;const provided=value?.replace(/^Bearer\s+/i,'')||'';
 const a=Buffer.from(TOKEN),b=Buffer.from(provided);
 return a.length===b.length&&timingSafeEqual(a,b);
}
async function readBody(req){
 let text='';for await(const chunk of req){text+=chunk;if(text.length>32000)throw Object.assign(new Error('Richiesta troppo grande'),{status:413});}
 try{return JSON.parse(text);}catch{throw Object.assign(new Error('JSON non valido'),{status:400});}
}
export function createServer(){return http.createServer(async(req,res)=>{
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');
  const origin=req.headers.origin;
  if(!allowedOrigin(origin,req)){respond(res,403,{error:'Origine non autorizzata'});return;}
  if(origin){res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Vary','Origin');}
  if(req.method==='OPTIONS'&&req.url?.startsWith('/api/')){
    res.writeHead(204,{'Access-Control-Allow-Methods':'POST, GET, OPTIONS','Access-Control-Allow-Headers':'Content-Type, Authorization','Access-Control-Max-Age':'600'});res.end();return;
  }
  const url=new URL(req.url||'/',`http://${req.headers.host||'localhost'}`);
  if(url.pathname==='/api/health'&&req.method==='GET'){respond(res,200,{ok:true,aiConfigured:!!process.env.OPENAI_API_KEY});return;}
  if(url.pathname==='/api/coach'&&req.method==='POST'){
    if(!authorized(req.headers.authorization)){respond(res,401,{error:'Token di accesso non valido'});return;}
    const ip=req.socket.remoteAddress||'unknown';const now=Date.now();const rec=usage.get(ip)||[];const current=rec.filter(t=>now-t<60_000);
    if(current.length>=10){respond(res,429,{error:'Limite di richieste: riprova fra un minuto'});return;}current.push(now);usage.set(ip,current);
    try{const body=await readBody(req);
      const result=await generateWithAI(body.task,body.profile,body.context);
      respond(res,200,{result});
    }catch(err){console.error('[coach]',err.message);respond(res,err.status||500,{error:err.status?err.message:'Errore interno del server AI.'});}
    return;
  }
  if(req.method!=='GET'&&req.method!=='HEAD'){respond(res,405,{error:'Metodo non consentito'});return;}
  let requestPath;
  try{requestPath=decodeURIComponent(url.pathname);}
  catch{respond(res,400,{error:'Percorso URL non valido'});return;}
  const file=path.resolve(ROOT,`.${requestPath==='/'?'/index.html':requestPath}`);
  if(!file.startsWith(ROOT+path.sep)||file.split(path.sep).some(x=>x.startsWith('.'))&&file!==path.join(ROOT,'.well-known')||file.includes(`${path.sep}server${path.sep}`)||file.includes(`${path.sep}tests${path.sep}`)||file.endsWith('.env')){
    respond(res,404,{error:'Non trovato'});return;
  }
  try{const s=await stat(file);if(!s.isFile())throw Error('non file');
    res.setHeader('Content-Type',MIME[path.extname(file)]||'application/octet-stream');
    res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self' https://cdn.jsdelivr.net 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' https: http://localhost:* http://127.0.0.1:*; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'");
    res.writeHead(200);if(req.method==='HEAD'){res.end();return;}res.end(await readFile(file));
  }catch{respond(res,404,{error:'Risorsa non trovata'});}
});}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const server=createServer();server.listen(PORT,HOST,()=>console.log(`FORMA AI disponibile su http://${HOST}:${PORT}\nCoach AI: ${process.env.OPENAI_API_KEY?'configurato':'offline (OPENAI_API_KEY assente)'}`));
}
