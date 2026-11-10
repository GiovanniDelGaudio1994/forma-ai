import {GOALS,EQUIPMENT,RECIPES,SLOTS,DEFAULT_PROFILE,WEEK_DAYS} from './data.js';
import {generateWorkout,generateMeals,validateMealsPlan,nextCheckDate,formatDate,stats} from './planner.js';
import {loadState,saveState,storePhoto,getPhoto,deletePhoto,clearPhotos,compressPhoto,downloadJson,calendarIcs} from './storage.js';
import {callCoach} from './ai.js';
import {adaptDay,assessFeedback,summarizeFeedback} from './adaptive.js';
import {guideForExercise,offlineTechniqueAnswer} from './technique.js';
import {inspectVideo} from './motion.js';

const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
const dateLong=()=>new Date().toLocaleDateString('it-IT',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
const num=(v,unit='')=>v!==null&&v!==undefined&&String(v)!==''?`${esc(v)}${unit}`:'—';
const rById=id=>RECIPES.find(r=>r.id===id);
const weekKey=(date=today())=>{const d=new Date(`${date}T12:00:00Z`);d.setUTCDate(d.getUTCDate()-(d.getUTCDay()+6)%7);return d.toISOString().slice(0,10);};
const isDone=day=>state.sessions.some(s=>s.planId===state.workout.id&&s.dayId===day.id&&(s.week||weekKey(s.date))===weekKey());
const lastLoad=name=>[...state.exerciseLogs].reverse().find(log=>log.exerciseName===name);
const NAV=[['dashboard','Panoramica','home'],['workouts','Scheda AI','dumbbell'],['nutrition','Alimentazione','food'],['checks','Check & progressi','chart'],['motion','Video Lab','camera'],['coach','Coach AI','sparkle'],['settings','Impostazioni','settings']];
const ICONS={
 home:'<rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="8" rx="2"/><rect x="3" y="13" width="8" height="8" rx="2"/><rect x="13" y="13" width="8" height="8" rx="2"/>',
 dumbbell:'<path d="m6.5 6.5 11 11M4 9l5-5M15 20l5-5M3 12l9-9M12 21l9-9"/>',
 food:'<path d="M4 3v7a4 4 0 0 0 8 0V3M8 3v18M19 3c-3 3-4 7-4 11h5v7M19 3v11"/>',
 chart:'<path d="M3 3v18h18M7 16l4-5 3 2 6-7"/><path d="M17 6h3v3"/>',
 sparkle:'<path d="m12 3 1.9 6.1L20 11l-6.1 1.9L12 19l-1.9-6.1L4 11l6.1-1.9L12 3ZM19 17l.5 1.5L21 19l-1.5.5L19 21l-.5-1.5L17 19l1.5-.5L19 17Z"/>',
 settings:'<path d="M4 7h16M4 17h16M9 4v6M15 14v6"/><circle cx="9" cy="7" r="2" fill="currentColor" stroke="none"/><circle cx="15" cy="17" r="2" fill="currentColor" stroke="none"/>',
 arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',
 shield:'<path d="m12 2 8 4v6c0 5-4 8-8 10-4-2-8-5-8-10V6l8-4Z"/><path d="m9 12 2 2 4-4"/>',
 calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/>',
 weight:'<path d="M6 7h12l3 14H3L6 7Z"/><path d="M10 7a2 2 0 1 1 4 0"/>',
 activity:'<path d="M3 12h4l3-7 4 14 3-7h4"/>',
 camera:'<rect x="3" y="6" width="18" height="15" rx="3"/><path d="m8 6 1.5-3h5L16 6"/><circle cx="12" cy="13" r="4"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 bolt:'<path d="m13 2-9 11h7l-1 9 10-12h-7l1-8Z"/>',
 target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
 chevron:'<path d="m9 18 6-6-6-6"/>'
};
function ic(name,cls=''){return `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]||ICONS.sparkle}</svg>`;}

const raw=loadState();
let state={profile:{...DEFAULT_PROFILE,...(raw.profile||{}),coachToken:''},
  workout:raw.workout||null,meals:raw.meals||null,checks:Array.isArray(raw.checks)?raw.checks:[],
  sessions:Array.isArray(raw.sessions)?raw.sessions:[],exerciseLogs:Array.isArray(raw.exerciseLogs)?raw.exerciseLogs:[],chat:Array.isArray(raw.chat)?raw.chat:[],feedback:Array.isArray(raw.feedback)?raw.feedback:[]};
if(!state.workout)state.workout=generateWorkout(state.profile);
if(!state.meals||state.meals.celiac!==!!state.profile.celiac||!validateMealsPlan(state.meals,state.profile))state.meals=generateMeals(state.profile);
let page='dashboard';let chosenDay=0;let pending=false;let toastTimer;let activeUrls=[];let modalOpen=false;
let motionUrl=null, motionStream=null, motionRecorder=null,motionParts=[],motionReport=null,motionBusy=false,discardMotionCapture=false;
const persist=()=>saveState(state);
persist();

function navHtml(mobile=false){return NAV.filter(([id])=>!mobile||id!=='settings').map(([id,label,icon])=>`<button class="${mobile?'mobile-link':'nav-link'} ${id===page?'active':''}" data-page="${id}" aria-label="${esc(label)}" ${id===page?'aria-current="page"':''}><span class="nav-icon">${ic(icon)}</span><span class="nav-text">${mobile?(id==='workouts'?'Scheda':id==='nutrition'?'Pasti':id==='checks'?'Check':id==='motion'?'Video':id==='coach'?'Coach':esc(label)):esc(label)}</span>${!mobile&&id===page?'<span class="nav-active-dot"></span>':''}</button>`).join('');}
function shell(content){
 const nick=esc(state.profile.nickname?.trim()||'Atleta');
 const pageLabel=NAV.find(n=>n[0]===page)?.[1]||'Panoramica';
 return `<div class="shell"><aside class="sidebar"><div class="brand"><div class="brand-icon">F<span>·</span></div><div class="brand-copy">FORMA<span class="brand-ai">AI</span><small>YOUR TRAINING LAB</small></div></div>
 <div class="nav-label">WORKSPACE <span>01 / 06</span></div><nav class="nav" aria-label="Menu principale">${navHtml()}</nav><div class="sidebar-end"><div class="home-card"><div class="home-card-decor">${ic('bolt')}</div><span class="tinycaps">IL TUO SETUP</span><strong><span class="status-dot"></span>Home Gym attiva</strong><p>Un training lab costruito intorno a te, non il contrario.</p><button class="side-setup" data-page="settings">Gestisci attrezzatura ${ic('arrow')}</button></div><div class="side-footer"><span>FORMA AI <b>v0.2.0</b></span><span>Local-first · Privacy by design</span></div></div></aside>
 <main class="main"><header class="topbar"><div class="topbar-left"><span class="breadcrumb-home">FORMA / WORKSPACE</span><span class="breadcrumb-divider">/</span><strong>${esc(pageLabel)}</strong></div><div class="mobile-brand"><span class="brand-icon">F<span>·</span></span><b>FORMA<span> AI</span></b></div><div class="topbar-right"><span class="topbar-date">${esc(dateLong())}</span><span class="top-pill">${ic('shield')} <span>Privato, sul tuo dispositivo</span></span><button class="avatar" data-page="settings" aria-label="Apri impostazioni profilo" title="Il tuo profilo">${nick.slice(0,1).toUpperCase()}</button></div></header>
 ${content}<footer class="footer"><span>© ${new Date().getFullYear()} FORMA AI · Made for real progress</span><span>Allenamento e nutrizione: indicazioni generali, non sostituiscono professionisti qualificati.</span></footer></main></div>
 <nav class="mobile-nav" aria-label="Navigazione mobile">${navHtml(true)}</nav><div id="modal-root"></div><div id="toast-root" role="status" aria-live="polite"></div>`;
}
function header(kicker,title,lead){return `<div class="page-intro"><div class="eyebrow"><span class="eyebrow-line"></span>${esc(kicker)}</div><h1 class="page-title">${title}</h1>${lead?`<p class="lead">${lead}</p>`:''}</div>`;}
const goal=()=>GOALS.find(g=>g.id===state.profile.goal)||GOALS[2];
function weekActivity(){
 const monday=new Date(weekKey()+'T12:00:00Z');const todayKey=today();
 return Array.from({length:7},(_,i)=>{const d=new Date(monday);d.setUTCDate(d.getUTCDate()+i);const key=d.toISOString().slice(0,10),done=state.sessions.some(s=>s.date===key);return `<div class="week-day ${done?'done':''} ${key===todayKey?'today':''}" title="${esc(formatDate(key))}: ${done?'allenamento registrato':'nessuna sessione registrata'}"><span>${['L','M','M','G','V','S','D'][i]}</span><i>${done?'✓':key===todayKey?'•':''}</i></div>`;}).join('');
}
function dashboard(){
 const st=stats(state.checks,state.sessions),next=nextCheckDate(state.checks,state.profile.checkEvery);
 const firstDay=state.workout.days.find(d=>!isDone(d))||state.workout.days[0];
 const count=state.workout.days.filter(d=>isDone(d)).length,weeklyGoal=state.workout.days.length;
 const progress=Math.round(Math.min(100,count/Math.max(1,weeklyGoal)*100));
 return `${header('IL TUO CENTRO DI CONTROLLO',`Bentornato, ${esc(state.profile.nickname||'Atleta')}<span class="hello-dot">.</span>`,"Un piccolo passo, ogni giorno. Tutto il tuo percorso, in un unico spazio.")}
 <section class="glass hero mt-24"><div class="hero-content"><div class="hero-overline"><span class="signal-dot"></span> YOUR TRAINING INTELLIGENCE <span class="hero-line"></span> 01</div><h2>Il tuo potenziale<br/>non ha <em>limiti.</em></h2><p>Allenamenti intelligenti, progressi reali. Ogni sessione è un altro passo verso la tua versione più forte.</p><div class="hero-action"><button class="btn primary" data-page="workouts">Inizia ad allenarti ${ic('arrow')}</button><button class="btn hero-outline" data-page="coach">${ic('sparkle')} Parla col coach</button></div><div class="hero-footnote">${ic('shield')} Dati e foto rimangono sul tuo dispositivo</div></div>
 <div class="hero-visual" aria-label="${count} allenamenti completati su ${weeklyGoal} questa settimana"><div class="hero-glow"></div><div class="hero-visual-caption">WEEKLY ACTIVITY <span>· LIVE</span></div><div class="activity-ring" style="--progress:${progress}%"><div class="activity-ring-inner"><span class="activity-ring-label">WEEK / ${esc(weekKey().slice(5).replace('-','.'))}</span><strong>${count}<i>/${weeklyGoal}</i></strong><span class="activity-ring-sub">SESSIONI COMPLETATE</span></div></div><div class="hero-live-chip">${ic('activity')} <span>${progress}% del tuo obiettivo settimanale</span></div></div></section>
 <div class="metrics"><div class="glass soft metric"><div class="metric-top"><span>ALLENAMENTI</span><span class="metric-icon">${ic('activity')}</span></div><div class="metric-num">${st.totalSessions.toString().padStart(2,'0')}</div><div class="metric-sub">Sessioni registrate <span class="metric-arrow">↗</span></div></div>
 <div class="glass soft metric"><div class="metric-top"><span>PESO ATTUALE</span><span class="metric-icon">${ic('weight')}</span></div><div class="metric-num">${num(st.weight||state.profile.weight)} <small>kg</small></div><div class="metric-sub">${st.delta===null?'Dal primo check puoi tracciare il trend':`${st.delta>0?'+':''}${st.delta} kg dal primo check`}</div></div>
 <div class="glass soft metric"><div class="metric-top"><span>CHECK SALVATI</span><span class="metric-icon">${ic('camera')}</span></div><div class="metric-num">${String(st.totalChecks).padStart(2,'0')}</div><div class="metric-sub">Le tue misure, private</div></div>
 <div class="glass soft metric"><div class="metric-top"><span>PROSSIMO CHECK</span><span class="metric-icon">${ic('calendar')}</span></div><div class="metric-num metric-date">${esc(formatDate(next).split(' ').slice(0,2).join(' '))}</div><div class="metric-sub">Ogni ${esc(state.profile.checkEvery)} giorni</div></div></div>
 <div class="section-heading"><div><span class="section-overline">YOUR DAILY FLOW</span><h2>Oggi conta.</h2></div><small>Obiettivo attivo · ${esc(goal().label)}</small></div>
 <div class="dashboard-grid"><section class="glass p-24 today-workout"><div class="subcard-head"><div><div class="tinycaps">NEXT SESSION</div><h3>Il tuo prossimo allenamento</h3></div><span class="pill">${esc(state.workout.source==='ai'?'AI COACH':state.workout.source==='feedback'?'COACH ADATTIVO':'PIANO OFFLINE')}</span></div>
 <div class="featured-workout"><div class="featured-index">${String(Math.max(1,state.workout.days.indexOf(firstDay)+1)).padStart(2,'0')}</div><div><span class="eyebrow">${esc(firstDay.day.toUpperCase())} · ${firstDay.exercises.length} ESERCIZI</span><h3>${esc(firstDay.focus)}</h3><p>${esc(state.profile.duration)} min indicativi · Piano personalizzato</p></div><div class="featured-arrow">${ic('arrow')}</div></div>
 <div class="workout-preview-list">${firstDay.exercises.slice(0,3).map((e,i)=>`<div class="workout-preview"><div class="inline-flex"><span class="exercise-index">${String(i+1).padStart(2,'0')}</span><div><b>${esc(e.name)}</b><p>${esc(e.sets)} serie · ${esc(e.reps)} ripetizioni</p></div></div><span class="exercise-mini-mark">${ic('chevron')}</span></div>`).join('')}</div><button class="btn secondary mt-16" data-page="workouts">Visualizza il programma ${ic('arrow')}</button></section>
 <section class="glass p-24 check-promo"><div class="subcard-head"><div><div class="tinycaps">KEEP THE MOMENTUM</div><h3>La costanza si costruisce.</h3></div><span class="pill purple">THIS WEEK</span></div><div class="consistency-visual"><div class="consistency-head"><strong>${count}<span> / ${weeklyGoal}</span></strong><span>sessioni questa settimana</span></div><div class="mini-progress"><span style="width:${progress}%"></span></div><div class="week-days">${weekActivity()}</div></div><div class="check-promo-footer"><div class="check-cta-icon">${ic('camera')}</div><div><b>Il prossimo check ti aspetta</b><p>Foto, misure e risultati nel tempo.</p></div><button data-page="checks" class="circle-action" aria-label="Apri i progressi">${ic('arrow')}</button></div></section></div>`;
}
function workouts(){const p=state.workout;
 return `${header('TRAINING ENGINE','Allenati con <span style="color:var(--accent)">intenzione.</span>','Una scheda che parte dalla tua esperienza, dagli attrezzi che possiedi e dall’obiettivo scelto. Modificala quando cambia la tua routine.')}
 <div class="toolbar"><div class="inline-flex"><span class="pill">${esc(goal().label)}</span><span class="pill gray">${p.days.length} giorni / settimana</span><span class="pill ${p.source==='ai'?'purple':'gray'}">${p.source==='ai'?'✦ Generata con AI':p.source==='feedback'?'↗ Adattata con feedback':'◉ Generata offline'}</span></div>
 <div class="toolbar-actions"><button class="btn" data-action="generate-workout">↻ Nuova scheda offline</button><button class="btn primary" data-action="ai-workout" ${pending?'disabled':''}>✦ ${pending?'Generazione in corso…':'Genera con AI'}</button></div></div>
 <div class="glass p-24"><div class="subcard-head"><h3>${esc(p.title)}</h3><span class="muted-tiny">${esc(formatDate(p.createdAt.slice(0,10)))}</span></div><p class="lead" style="margin-bottom:0">${esc(p.summary)}</p><div class="note mb-0">${esc(p.guidance)}</div></div>
 <div class="section-heading"><h2>Programma settimanale</h2><small>Recupero e progressione graduale</small></div><div class="weekly-grid">
 ${p.days.map((d,i)=>`<article class="glass soft workout-card"><div class="day-head"><div><div class="eyebrow">GIORNO ${String(i+1).padStart(2,'0')} · ${esc(d.day.toUpperCase())}</div><h3>${esc(d.focus)}</h3><span class="muted-tiny">${d.exercises.length} esercizi · ${esc(state.profile.duration)} min indicativi</span></div><span class="pill ${isDone(d)?'':'gray'}">${isDone(d)?'✓ Completato':'Da fare'}</span></div>
 <div class="mt-16">${d.exercises.map((e,j)=>{const previous=lastLoad(e.name);return `<div class="exercise-line"><div><b>${esc(e.name)}</b><small>${esc(e.notes)}</small>${previous?`<small style="color:var(--accent)">Ultimo log: ${esc(previous.kg)} kg × ${esc(previous.reps)} rip.</small>`:''}</div><div class="exercise-actions"><span>${esc(e.sets)} × ${esc(e.reps)}</span><button class="btn small" data-action="technique" data-name="${esc(e.name)}">Guida</button><button class="btn small" data-action="log-exercise" data-day="${i}" data-exercise="${j}" aria-label="Registra carico ${esc(e.name)}">＋ Log</button></div></div>`;}).join('')}</div><div class="workout-card-footer"><small>Recupero ${esc(d.exercises[0]?.restSeconds||90)}s indicativo</small><button class="btn small" data-action="feedback-workout" data-index="${i}">Feedback</button><button class="btn small ${isDone(d)?'':'secondary'}" data-action="complete-workout" data-index="${i}">${isDone(d)?'↺ Ripristina':'✓ Segna completato'}</button></div></article>`).join('')}
 </div><div class="coach-feature-banner"><span class="spark-icon">✦</span><div><strong>Il coach impara dal tuo feedback</strong><p>Dopo ogni allenamento registra RPE, recupero e difficoltà: FORMA propone aggiustamenti conservativi della scheda. Con l’AI configurata, anche la generazione considera i feedback più recenti.</p></div><button class="btn secondary" data-page="coach">Parla col coach ↗</button></div><div class="note">Per avere una vera scheda personalizzata dall'AI, avvia il server locale con la tua chiave API e seleziona “Genera con AI”. Nessuna foto di progresso viene inviata al coach.</div>`;
}
function nutrition(){const p=state.meals,d=p.days[chosenDay]||p.days[0],restricted=!state.profile.allergyScreened||state.profile.allergies?.trim()||state.profile.allergenGroups?.length;
 return `${header('NUTRITION STUDIO','Mangia bene. <span style="color:var(--accent)">Vivi forte.</span>','Sette giorni di idee per i pasti, con preparazioni passo passo. La tua alimentazione deve essere sostenibile, non una punizione.')}
 <div class="toolbar"><div class="inline-flex"><span class="pill ${state.profile.celiac?'':'gray'}">${state.profile.celiac?'✓ Modalità celiachia attiva':'Alimentazione generale'}</span><span class="pill ${p.source==='ai'?'purple':'gray'}">${p.source==='ai'?'✦ Menu scelto dall’AI':'◉ Menu offline'}</span></div><div class="toolbar-actions"><button class="btn" data-action="generate-meals">↻ Menu offline</button><button class="btn primary" data-action="ai-meals" ${pending||restricted?'disabled':''}>✦ ${pending?'Generazione…':'Menu con AI'}</button></div></div>
 <div class="diet-banner ${restricted?'warning':''}"><span class="symbol">${restricted?'⚠':'✦'}</span><div><strong>${restricted?'Screening allergeni necessario / menu sospeso':state.profile.celiac?'Celiachia: attenzione alla contaminazione':'Nutrizione consapevole, senza estremismi'}</strong><div>${restricted?'Prima dei menu, compila il questionario allergeni nel profilo. Se segnali allergie o intolleranze, sospendiamo la generazione automatica: rivolgiti a un dietista o allergologo per le indicazioni appropriate.':state.profile.celiac?'Le ricette proposte evitano ingredienti con glutine, ma non possono certificare la sicurezza dei prodotti reali. Verifica sempre etichette «senza glutine» per quelli a rischio, piani di lavoro, stoviglie e contaminazioni.':'Le ricette e i valori nutrizionali sono esempi indicativi; porzioni e fabbisogni vanno adattati alla persona e, se necessario, con un dietista.'}</div></div></div>
 ${restricted?'<div class="screening-cta"><div><strong>🛡 Prima di mangiare, mettiamo la sicurezza al primo posto.</strong><p>Il questionario alimentare è obbligatorio per sbloccare i suggerimenti generali. Non sostituisce una visita nutrizionale.</p></div><button class="btn primary" data-page="settings">Compila il questionario ↗</button></div>':''}<div class="section-heading"><h2>La tua settimana a tavola</h2><small>${esc(p.title)}</small></div><div class="days-tabs" role="tablist" aria-label="Seleziona il giorno">${p.days.map((day,i)=>`<button class="day-tab ${chosenDay===i?'active':''}" data-action="choose-meal-day" data-index="${i}" role="tab" aria-selected="${chosenDay===i}">${esc(day.day.slice(0,3))}</button>`).join('')}</div>
 <div class="meal-grid">${d.meals.map(m=>{const r=rById(m.recipeId);
 return r?`<article class="glass soft meal-card"><div class="meal-emoji">${r.emoji}</div><div style="min-width:0;flex:1"><span class="tinycaps">${esc(m.slot)}</span><h3>${esc(r.name)}</h3><div class="micro">◷ ${r.minutes} min · ~${r.kcal} kcal · ~${r.protein}g proteine</div><div class="tag-row"><span class="pill gray">${r.gf?'Possibile senza glutine':'Contiene glutine'}</span></div><button class="btn small secondary" data-action="recipe" data-id="${r.id}">Apri ricetta ↗</button></div></article>`:
 `<article class="glass soft meal-card"><div><span class="tinycaps">${esc(m.slot)}</span><h3>Da valutare con uno specialista</h3><p class="caption">Nessuna ricetta assegnata in presenza di allergie dichiarate.</p></div></article>`;}).join('')}</div>
 <p class="caption mt-24">I valori sono approssimativi, non una dieta prescritta. In presenza di celiachia, confronta sempre prodotti e preparazione con le indicazioni aggiornate dell’<a href="https://www.celiachia.it/etichettatura/" target="_blank" rel="noopener noreferrer">Associazione Italiana Celiachia</a>.</p>`;
}
function chart(checks){const rows=checks.filter(c=>Number(c.weight)>0).sort((a,b)=>a.date.localeCompare(b.date));if(rows.length<2)return '<div class="empty">Inserisci almeno due check con peso per visualizzare il trend.</div>';
 const values=rows.map(c=>Number(c.weight)),min=Math.floor(Math.min(...values)-1),max=Math.ceil(Math.max(...values)+1),diff=Math.max(1,max-min);
 const points=values.map((v,i)=>[30+(i*(440/Math.max(1,values.length-1))),165-(v-min)/diff*125]);
 const line=points.map(([x,y],i)=>`${i?'L':'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
 const area=line+` L${points.at(-1)[0]} 165 L30 165 Z`;
 return `<svg class="progress-chart" viewBox="0 0 500 200" role="img" aria-label="Andamento del peso nel tempo"><line x1="30" y1="40" x2="470" y2="40" class="grid-line"/><line x1="30" y1="101" x2="470" y2="101" class="grid-line"/><line x1="30" y1="165" x2="470" y2="165" class="grid-line"/><text x="2" y="44">${max}</text><text x="2" y="170">${min}</text><path d="${area}" class="area"/><path d="${line}" class="line"/>${points.map(([x,y])=>`<circle cx="${x}" cy="${y}" r="5"/>`).join('')}<text x="30" y="190">${esc(formatDate(rows[0].date))}</text><text x="395" y="190">${esc(formatDate(rows.at(-1).date))}</text></svg>`;
}
function checks(){const next=nextCheckDate(state.checks,state.profile.checkEvery),st=stats(state.checks,state.sessions);
 return `${header('PROGRESS TRACKER','Non guardare solo <span style="color:var(--accent)">la bilancia.</span>','Tieni traccia dei cambiamenti nel tempo con peso, BF stimata, circonferenze e foto. Tutto resta privato, nel tuo browser.')}
 <div class="toolbar"><div class="inline-flex"><span class="pill">${state.checks.length} check registrati</span><span class="pill gray">Prossimo: ${esc(formatDate(next))}</span></div><button class="btn secondary" data-action="calendar">▦ Aggiungi promemoria al calendario</button></div>
 <div class="check-top"><section class="glass p-28"><h2 class="settings-subtitle">Nuovo check progressi</h2><form id="check-form"><div class="form-grid">
 <label class="form-field">Data <input type="date" name="date" value="${today()}" max="${today()}" required></label>
 <label class="form-field">Peso (kg) <input type="number" name="weight" step="0.1" min="20" max="400" placeholder="Es. 76.5" value="${esc(st.weight||state.profile.weight||'')}" required></label>
 <label class="form-field">BF stimata (%) <input type="number" name="bf" step="0.1" min="2" max="75" placeholder="Facoltativo"></label>
 <label class="form-field">Vita (cm) <input type="number" name="waist" step="0.1" min="20" max="300" placeholder="Facoltativo"></label>
 <label class="form-field">Petto (cm) <input type="number" name="chest" step="0.1" min="20" max="300" placeholder="Facoltativo"></label>
 <label class="form-field">Fianchi (cm) <input type="number" name="hips" step="0.1" min="20" max="300" placeholder="Facoltativo"></label>
 <label class="form-field">Braccio (cm) <input type="number" name="arm" step="0.1" min="20" max="300" placeholder="Facoltativo"></label>
 <label class="form-field">Coscia (cm) <input type="number" name="thigh" step="0.1" min="20" max="300" placeholder="Facoltativo"></label>
 <label class="form-field span-2">Note <input name="notes" maxlength="300" placeholder="Energia, recupero, osservazioni…"></label>
 <div class="form-field full"><span>Check Photo <small>Facoltative · JPEG compresse e salvate localmente</small></span><div class="photo-inputs"><label class="photo-label">Frontale <input type="file" name="front" accept="image/*"></label><label class="photo-label">Laterale <input type="file" name="side" accept="image/*"></label><label class="photo-label">Posteriore <input type="file" name="back" accept="image/*"></label></div></div></div>
 <div class="form-actions"><button class="btn primary" type="submit" ${pending?'disabled':''}>▧ Salva il check</button></div></form><p class="caption">La BF viene inserita manualmente: non viene calcolata da una foto. Per confronti affidabili, scatta con luce, posa e distanza simili.</p></section>
 <section class="glass p-28"><div class="subcard-head"><h2 class="settings-subtitle" style="margin:0">Trend del peso</h2><span class="pill purple">PRIVATE</span></div>${chart(state.checks)}<div class="separator"></div><h3 style="font-size:16px">Promemoria intelligenti</h3><p class="lead">Il prossimo check sarà il <b style="color:#d7e6e1">${esc(formatDate(next))}</b>. Puoi importare nel calendario un evento ricorrente ogni ${esc(state.profile.checkEvery)} giorni: riceverai gli avvisi anche quando l'app è chiusa, secondo le impostazioni del tuo calendario.</p><button class="btn small" data-action="notifications">Abilita avvisi quando l'app è aperta</button></section></div>
 ${comparison()}
 <div class="section-heading"><h2>Storico dei progressi</h2><small>Solo su questo dispositivo</small></div><section class="glass soft p-24">${state.checks.length?([...state.checks].sort((a,b)=>b.date.localeCompare(a.date)).map(c=>`<article class="check-item"><div class="number-badge">▧</div><div class="check-item-main"><b>${esc(formatDate(c.date))}</b><p>${esc(c.weight)} kg ${c.bf?`· BF ${esc(c.bf)}%`:''} ${c.waist?`· Vita ${esc(c.waist)} cm`:''} ${c.notes?`· ${esc(c.notes)}`:''}</p><div class="check-image-strip">${Object.values(c.photos||{}).filter(Boolean).map(key=>`<img data-photo-id="${esc(key)}" alt="Foto privata del check ${esc(c.date)}" />`).join('')}</div></div><button class="btn danger small" data-action="delete-check" data-id="${esc(c.id)}" title="Elimina check">Elimina</button></article>`).join('')):'<p class="empty">Nessun check salvato. Il tuo percorso inizia dal primo dato registrato.</p>'}</section>`;
}
function comparison(){
 const withPhotos=[...state.checks].filter(c=>Object.keys(c.photos||{}).length>0).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,2);
 if(withPhotos.length!==2)return '';
 return `<div class="section-heading"><h2>Confronta le tue foto</h2><small>Stessa luce e stessa posa aiutano a valutare il trend</small></div><div class="comparison-grid">${withPhotos.reverse().map(c=>`<section class="glass soft p-24"><div class="subcard-head"><h3>${esc(formatDate(c.date))}</h3><span class="pill gray">${esc(c.weight)} kg</span></div><div class="compare-images">${['front','side','back'].map(k=>c.photos[k]?`<div><img data-photo-id="${esc(c.photos[k])}" alt="${k} ${esc(c.date)}"><small>${{front:'Frontale',side:'Laterale',back:'Posteriore'}[k]}</small></div>`:'').join('')}</div></section>`).join('')}</div>`;
}
function coachReplyOffline(message){const text=message.toLocaleLowerCase('it');
 if(/come (esegu|faccio|si fa)|tecnica|esecuzione|squat|stacco|rematore|trazioni|panca|affond|plank|push.up/.test(text)){const all=state.workout.days.flatMap(d=>d.exercises);const hit=all.find(e=>text.includes(e.name.toLowerCase()))||all.find(e=>['squat','stacco','panca','trazioni','rematore','affond','plank'].some(x=>text.includes(x)&&e.name.toLowerCase().includes(x)));return offlineTechniqueAnswer(hit?.name||text);}
 if(/feedback|rpe|troppo faticoso|troppo facile/.test(text))return state.feedback.length?`Dal tuo ultimo feedback: ${assessFeedback(state.feedback.at(-1)).message} Puoi registrare RPE e recupero nella Scheda AI. Per una nuova scheda generativa, premi Genera con AI.`:'Dopo un allenamento apri Scheda AI → Feedback. Indica RPE, recupero e eventuale dolore: proporrò un adattamento conservativo, senza aumentare automaticamente i pesi.';
 if(/celiac|glutine|alimenti|ricett|dieta|mangi/.test(text))return 'Per l’alimentazione puoi consultare la sezione Pasti. Se hai attivato la modalità celiachia, vengono proposte solo ricette del catalogo compatibili con ingredienti senza glutine. Controlla comunque le etichette dei prodotti a rischio, gli utensili e le contaminazioni; per una dieta personalizzata rivolgiti a un dietista.';
 if(/check|foto|peso|misur|bf/.test(text))return `Per confrontare i progressi nel tempo, registra un check ogni ${state.profile.checkEvery} giorni, possibilmente in condizioni simili. La BF stimata non è una misura precisa: considera il trend di peso, circonferenze e performance. Il prossimo check è il ${formatDate(nextCheckDate(state.checks,state.profile.checkEvery))}.`;
 if(/recuper|dolor|stanc|riposo/.test(text))return 'Il recupero è parte dell’allenamento. Mantieni giorni di riposo adeguati, gestisci i carichi gradualmente e interrompi gli esercizi che provocano dolore. In caso di sintomi persistenti consulta un professionista sanitario.';
 return `Stai lavorando sull’obiettivo “${goal().label}” con ${state.profile.days} allenamenti alla settimana. Parti dalla scheda, registra le sessioni e aumenta gradualmente il carico senza compromettere la tecnica. Per risposte realmente generate e contestuali, attiva il server AI nelle Impostazioni.`;
}
function coach(){const greetings={role:'coach',source:'offline',text:`Benvenuto in FORMA ✦ Sono la tua guida in-app. Per iniziare posso aiutarti a organizzare l'allenamento, capire come registrare i progressi o scegliere una ricetta. Per risposte AI generative configura il backend nelle Impostazioni.`};
 const messages=state.chat.length?state.chat:[greetings];
 return `${header('FORMA COACH','La tua costanza ha <span style="color:var(--accent)">una voce.</span>','Chiedi un consiglio pratico al coach. La modalità offline usa suggerimenti predefiniti; quella AI genera risposte personalizzate quando attivi il backend.')}
 <div class="coach-context glass soft"><div class="coach-icon-big">✦</div><div><span class="tinycaps">ATHLETE INTELLIGENCE</span><h3>${esc(goal().label)} · ${esc(state.profile.experience)}</h3><p>${esc(state.profile.days)} allenamenti/settimana · ${esc(state.profile.activityLevel||'moderato')} · ${state.feedback.length} feedback registrati</p><small>Le risposte AI considerano il profilo che hai salvato; le misure dei check sono inviate solo con consenso.</small></div><button class="btn small" data-page="settings">Modifica profilo</button></div><div class="toolbar"><span class="pill ${state.profile.backendUrl?'purple':'gray'}">${state.profile.backendUrl?'✦ Backend esterno impostato':'◉ Modalità offline · AI opzionale'}</span><button class="btn small" data-page="settings">⚙ Configura AI</button></div>
 <div class="chat-layout"><section class="glass chat-panel"><div class="messages" id="chat-messages">${messages.map(m=>`<div class="msg ${m.role==='user'?'user':''}">${esc(m.text)}<small>${m.role==='user'?'Tu':m.source==='ai'?'✦ Risposta generata dall’AI':'◉ Guida offline'}</small></div>`).join('')}${pending?'<div class="msg">✦ Sto elaborando la risposta…</div>':''}</div>
 <form id="chat-form" class="chat-input"><input name="message" maxlength="700" autocomplete="off" placeholder="Es. Come organizzo il recupero?" aria-label="Messaggio al coach" required><button class="btn primary" type="submit" ${pending?'disabled':''}>Invia ↗</button></form></section>
 <aside class="glass sidebar-help"><h3>💡 Chiedimi qualcosa</h3><p>Inizia con una domanda. Puoi ottenere consigli di base offline o attivare il coach AI completo.</p><div class="suggestions"><button class="suggestion" data-action="suggest" data-message="Come posso progredire con i manubri?">Come posso progredire con i manubri? ↗</button><button class="suggestion" data-action="suggest" data-message="Come gestire il recupero?">Come gestire il recupero? ↗</button><button class="suggestion" data-action="suggest" data-message="Quali ricette senza glutine posso cucinare?">Quali ricette senza glutine posso cucinare? ↗</button><button class="suggestion" data-action="suggest" data-message="Ogni quanto faccio il check?">Ogni quanto faccio il check? ↗</button></div><div class="note" style="margin-top:22px">Il coach non sostituisce diagnosi o indicazioni cliniche di professionisti.</div></aside></div>`;
}
function motion(){return `${header('MOTION STUDIO','La tecnica, sotto <span style="color:var(--accent)">una nuova luce.</span>','Registra una breve esecuzione o carica un video. L’analisi sperimentale osserva le posizioni dei gomiti, non la forza né il peso effettivo sui due arti.')}
 <div class="motion-layout"><section class="glass p-28"><div class="subcard-head"><div><span class="tinycaps">LOCAL VIDEO WORKSPACE</span><h3>Registra. Rivedi. Migliora.</h3></div><span class="pill">SUL DISPOSITIVO</span></div>
 <div class="motion-stage"><video id="motion-video" controls playsinline preload="metadata" ${motionUrl?`src="${esc(motionUrl)}"`:''}></video>${!motionUrl?'<div class="motion-placeholder"><span>◎</span><strong>Il tuo video parte da qui</strong><small>Durata consigliata 5–30 secondi · Inquadra tutto il corpo in buona luce</small></div>':''}</div>
 <div class="motion-tools"><label class="btn secondary motion-upload">⬆ Carica video <input type="file" id="motion-upload" accept="video/*" hidden></label><button class="btn" data-action="motion-start">● Avvia videocamera</button><button class="btn" data-action="motion-stop">■ Ferma</button></div>
 <div class="motion-permission"><label><input id="motion-consent" type="checkbox"> Acconsento a scaricare i componenti MediaPipe per eseguire l’analisi automatica sul dispositivo. Il video non viene inviato al server; la libreria può trattare dati tecnici di utilizzo secondo la propria informativa.</label></div>
 <button class="btn primary motion-analyze" data-action="motion-analyze" ${!motionUrl||motionBusy?'disabled':''}>${motionBusy?'Analisi in corso…':'✦ Analizza movimento (beta)'}</button><div id="motion-status" class="caption">L’analisi richiede Internet al primo utilizzo per scaricare libreria e modello. È sperimentale, non una valutazione clinica.</div>
 </section><aside class="glass p-28 motion-insight"><span class="tinycaps">COME FUNZIONA</span><h3>Occhio alla simmetria visiva.</h3><p>In una ripresa frontale, il sistema confronta l’angolo apparente dei gomiti in alcuni fotogrammi. Se rileva differenze ripetute, propone di rivedere la ripresa.</p>
 <div class="motion-diagram"><div class="human-figure">◉<span>╱│╲</span><span>╱ ╲</span></div><div><b>Da verificare</b><small>Illuminazione · Inquadratura · Sincronizzazione</small></div></div>
 ${motionReport?`<div class="motion-result ${motionReport.report.level}"><strong>${motionReport.report.level==='review'?'Possibile differenza visiva':motionReport.report.level==='neutral'?'Nessuna differenza marcata':'Analisi inconcludente'}</strong><p>${esc(motionReport.report.text)}</p><small>${esc(motionReport.observed)}/${esc(motionReport.total)} fotogrammi validi. ${esc(motionReport.note)}</small></div>`:'<div class="note">Nessun video è salvato nel profilo o caricato online. Il file rimane temporaneamente nel browser finché resti nella sezione.</div>'}
 <div class="note warning">Non può rilevare un sovraccarico del braccio destro o sinistro, fare diagnosi, stimare il rischio di infortunio o garantire la correttezza della tecnica. Per dolore o dubbi rivolgiti a un professionista qualificato.</div></aside></div>`;}
const input=(label,name,value,opts={})=>`<label class="form-field ${opts.full?'full':''}">${esc(label)}${opts.help?` <small>${esc(opts.help)}</small>`:''}<input name="${name}" type="${opts.type||'text'}" value="${esc(value)}" ${opts.min!==undefined?`min="${opts.min}"`:''} ${opts.max!==undefined?`max="${opts.max}"`:''} ${opts.step!==undefined?`step="${opts.step}"`:''} ${opts.placeholder?`placeholder="${esc(opts.placeholder)}"`:''} /></label>`;
function select(label,name,options,value){return `<label class="form-field">${esc(label)}<select name="${name}">${options.map(o=>`<option value="${esc(o.id)}" ${String(o.id)===String(value)?'selected':''}>${esc(o.label)}</option>`).join('')}</select></label>`;}
function settings(){const p=state.profile;
 return `${header('YOUR PROFILE','Costruiamo la tua <span style="color:var(--accent)">versione migliore.</span>','Inserisci le tue preferenze. La scheda offline e il catalogo di pasti verranno aggiornati quando salvi il profilo.')}
 <form id="profile-form"><div class="profile-grid mt-24"><section class="glass p-28"><h2 class="settings-subtitle">01 / Profilo atleta</h2><div class="form-grid">
 ${input('Come ti chiami?','nickname',p.nickname,{placeholder:'Atleta'})}
 ${select('Obiettivo','goal',GOALS.map(g=>({id:g.id,label:g.label})),p.goal)}
 ${select('Livello di attività quotidiana','activityLevel',[{id:'sedentario',label:'Prevalentemente sedentario'},{id:'leggero',label:'Leggermente attivo'},{id:'moderato',label:'Moderatamente attivo'},{id:'alto',label:'Molto attivo'}],p.activityLevel||'moderato')}
 ${select('Esperienza','experience',[{id:'principiante',label:'Principiante'},{id:'intermedio',label:'Intermedio'},{id:'avanzato',label:'Avanzato'}],p.experience)}
 ${select('Allenamenti / settimana','days',[2,3,4,5,6].map(id=>({id,label:`${id} giorni`})),p.days)}
 ${select('Durata indicativa','duration',[30,45,60,75,90].map(id=>({id,label:`${id} minuti`})),p.duration)}
 ${input('Peso di riferimento (kg)','weight',p.weight,{type:'number',step:'0.1',min:20,max:400})}
 ${input('Altezza (cm) · opzionale','height',p.height,{type:'number',min:100,max:240})}
 ${input('Età · opzionale','age',p.age,{type:'number',min:18,max:100})}
 ${input('Limitazioni / fastidi da segnalare al coach','limitations',p.limitations,{full:true,placeholder:'Facoltativo. Non usare l’app per allenarti nel dolore.'})}
 ${select('Check progressi ogni','checkEvery',[7,14,21,28,30].map(id=>({id,label:`${id} giorni`})),p.checkEvery)}</div>
 <div class="separator"></div><div class="switch-row"><input type="checkbox" id="celiac" name="celiac" ${p.celiac?'checked':''}><label for="celiac">Ho necessità di pasti senza glutine / celiachia<small>Il catalogo escluderà le ricette con ingredienti contenenti glutine. Le etichette reali restano da verificare.</small></label></div>
 <div class="separator"></div><div class="allergen-check"><div class="subcard-head"><h3>Screening allergeni (prima dei pasti)</h3><span class="pill warning">IMPORTANTE</span></div><p class="lead">Seleziona tutte le allergie e intolleranze note. In caso di risposta positiva, i menu automatici vengono bloccati: un filtro non può gestire contaminazioni o soglie individuali.</p>
 <div class="allergen-grid">${['Cereali con glutine','Crostacei','Uova','Pesce','Arachidi','Soia','Latte','Frutta a guscio','Sedano','Senape','Sesamo','Anidride solforosa/solfiti','Lupini','Molluschi'].map(x=>`<label class="equip-check"><input type="checkbox" name="allergenGroups" value="${esc(x)}" ${(p.allergenGroups||[]).includes(x)?'checked':''}><span>${esc(x)}</span></label>`).join('')}</div>
 ${input('Altre allergie o intolleranze','allergies',p.allergies,{full:true,placeholder:'Descrivile qui, se presenti'})}
 <div class="switch-row"><input type="checkbox" id="allergyScreened" name="allergyScreened" ${p.allergyScreened?'checked':''}><label for="allergyScreened">Confermo di aver esaminato l’elenco e di aver indicato le mie allergie/intolleranze note.<small>Questo questionario non sostituisce la valutazione di dietista o allergologo.</small></label></div></div></section>
 <section class="glass p-28"><h2 class="settings-subtitle">02 / La tua Home Gym</h2><p class="lead">Seleziona solamente ciò che hai davvero a disposizione. Il generatore utilizza alternative a corpo libero quando serve.</p><div class="equipment-options">${EQUIPMENT.map(e=>`<label class="equip-check"><input type="checkbox" name="equipment" value="${e.id}" ${(p.equipment||[]).includes(e.id)?'checked':''}><span>${esc(e.label)}</span></label>`).join('')}</div>
 <div class="separator"></div><h2 class="settings-subtitle">03 / Coach AI</h2><p class="lead">La chiave OpenAI non va mai inserita nel sito o su GitHub. Configurala solo nel server locale o protetto.</p>
 <div class="form-grid">${input('URL server AI (facoltativo)','backendUrl',p.backendUrl,{full:true,placeholder:'Vuoto = server corrente / locale'})}${input('Token di accesso (solo in memoria)','coachToken',p.coachToken,{full:true,type:'password',placeholder:'Solo se il server lo richiede'})}</div>
 <div class="switch-row"><input type="checkbox" id="shareProgressAI" name="shareProgressAI" ${p.shareProgressAI?'checked':''}><label for="shareProgressAI">Consenti all'AI di considerare i trend dei check<small>Opzionale: invia solo riepilogo numerico di peso, BF, vita e sessioni. Mai le fotografie.</small></label></div>
 <div class="note">Premendo “Genera con AI” o inviando un messaggio al coach, invierai al backend obiettivo, esperienza, attrezzi, peso, altezza, età, attività quotidiana, limitazioni dichiarate, celiachia ed eventuali allergie; per i piani di allenamento saranno inviati anche i feedback recenti. Solo se attivi il consenso qui sopra, invierai anche un riepilogo dei progressi.</div></section></div>
 <div class="form-actions"><button class="btn primary" type="submit">✓ Salva profilo e aggiorna programmi</button></div></form>
 <div class="section-heading"><h2>Privacy e dati</h2></div><div class="glass soft p-24"><div class="inline-flex"><button class="btn" data-action="export">⬇ Esporta dati JSON</button><button class="btn danger" data-action="reset">✕ Cancella tutti i dati locali</button></div><p class="caption">L'esportazione include profilo, sessioni e misure, ma <b>non le foto</b>, che restano archiviate in IndexedDB su questo dispositivo. Non pubblicare backup o fotografie in repository pubblici.</p></div>`;
}
const PAGES={dashboard,workouts,nutrition,checks,motion,coach,settings};
function render(){for(const u of activeUrls)URL.revokeObjectURL(u);activeUrls=[];
 $('#app').innerHTML=shell(PAGES[page]());
 document.title=`${NAV.find(n=>n[0]===page)?.[1]} · FORMA AI`;
 if(page==='checks')loadPhotos();
 if(page==='coach'){const box=$('#chat-messages');if(box)box.scrollTop=box.scrollHeight;}
}
async function loadPhotos(){for(const img of document.querySelectorAll('[data-photo-id]')){
 try{const blob=await getPhoto(img.dataset.photoId);if(blob&&img.isConnected){const url=URL.createObjectURL(blob);activeUrls.push(url);img.src=url;}}catch{}
}}
function toast(message,error=false){const root=$('#toast-root');if(!root)return;root.innerHTML=`<div class="toast ${error?'error':''}">${esc(message)}</div>`;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{if($('#toast-root'))$('#toast-root').innerHTML='';},5500);}
function showRecipe(id){const r=rById(id);if(!r)return;
 const root=$('#modal-root');modalOpen=true;root.innerHTML=`<div class="modal-backdrop"><section class="modal" role="dialog" aria-modal="true" aria-label="Ricetta ${esc(r.name)}"><div class="modal-header"><div><div class="eyebrow">${r.emoji} ${esc(r.slot)} · ${r.minutes} min</div><h2>${esc(r.name)}</h2></div><button class="modal-close" data-action="close-modal" aria-label="Chiudi">✕</button></div><p>Valori indicativi per porzione: ~${r.kcal} kcal · ~${r.protein}g proteine</p><div class="separator"></div><h3>Ingredienti</h3><ul>${r.ingredients.map(i=>`<li>${esc(i)}</li>`).join('')}</ul><h3>Preparazione</h3><ol>${r.steps.map(s=>`<li>${esc(s)}</li>`).join('')}</ol><div class="note warning">${state.profile.celiac?'Celiachia: usa ingredienti idonei verificando la dicitura «senza glutine» sui prodotti a rischio e prepara tutto su superfici e utensili non contaminati.':'Controlla ingredienti e allergeni prima di preparare il pasto.'}</div><button class="btn primary" data-action="close-modal">Ho letto la ricetta</button></section></div>`;
}
function showTechnique(name){const g=guideForExercise(name);modalOpen=true;
 $('#modal-root').innerHTML=`<div class="modal-backdrop"><section class="modal" role="dialog" aria-modal="true" aria-label="Guida esercizio"><div class="modal-header"><div><div class="eyebrow">GUIDA TECNICA · EDUCATIVA</div><h2>${esc(name)}</h2></div><button class="modal-close" data-action="close-modal">✕</button></div><h3>Preparazione</h3><p>${esc(g.setup)}</p><h3>Passo per passo</h3><ol>${g.steps.map(x=>`<li>${esc(x)}</li>`).join('')}</ol><h3>Come capire se funziona</h3><ul>${g.checks.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><div class="note warning">${esc(g.avoid)} I risultati si valutano nel tempo, non da un singolo video.</div><button class="btn primary" data-action="close-modal">Ho capito</button></section></div>`;
}
function showFeedbackModal(dayIndex){const d=state.workout.days[dayIndex];if(!d)return;modalOpen=true;
 $('#modal-root').innerHTML=`<div class="modal-backdrop"><section class="modal" role="dialog" aria-modal="true" aria-label="Feedback allenamento"><div class="modal-header"><div><div class="eyebrow">SESSION REVIEW · ${esc(d.day)}</div><h2>Com'è andato l’allenamento?</h2></div><button class="modal-close" data-action="close-modal">✕</button></div><p>I tuoi dati aiutano il coach ad adattare il piano senza inventare percentuali di forza o suggerire carichi azzardati.</p><form id="feedback-form" data-day="${dayIndex}"><div class="form-grid">${select('Sforzo RPE (1 facile — 10 massimo)','rpe',Array.from({length:10},(_,i)=>({id:i+1,label:`${i+1} / 10`})),7)}${select('Recupero percepito (1 scarso — 5 ottimo)','recovery',Array.from({length:5},(_,i)=>({id:i+1,label:`${i+1} / 5`})),3)}${select('Sensazione generale','feeling',[{id:'facile',label:'Troppo facile'},{id:'giusto',label:'Adeguato'},{id:'faticoso',label:'Troppo faticoso'}],'giusto')}</div><div class="switch-row"><input type="checkbox" id="feedback-pain" name="pain"><label for="feedback-pain">Ho avvertito dolore durante l'allenamento<small>Se il movimento provoca dolore, interrompilo. Il coach non effettua diagnosi.</small></label></div><div class="switch-row"><input type="checkbox" id="feedback-adapt" name="adapt" checked><label for="feedback-adapt">Proponi e applica una modifica prudente alla giornata</label></div><button class="btn primary" type="submit">✓ Salva feedback e aggiorna</button></form></section></div>`;
}
function saveFeedback(form){const day=state.workout.days[Number(form.dataset.day)];if(!day)return;const f=new FormData(form);
 const entry={id:crypto.randomUUID(),date:today(),day:day.day,dayId:day.id,planId:state.workout.id,rpe:Number(f.get('rpe')),recovery:Number(f.get('recovery')),feeling:String(f.get('feeling')),pain:f.has('pain')};
 let assessment;try{assessment=assessFeedback(entry);if(f.has('adapt'))state.workout=adaptDay(state.workout,day.id,entry).plan;}catch(err){toast(err.message,true);return;}
 state.feedback.push(entry);const ses=state.sessions.findLast(s=>s.dayId===day.id&&s.planId===entry.planId);if(ses)ses.feedbackId=entry.id;
 persist();render();toast(assessment.message);}
function showExerciseLog(dayIndex,exerciseIndex){
 const day=state.workout.days[dayIndex],e=day?.exercises[exerciseIndex];if(!e)return;
 const previous=lastLoad(e.name);modalOpen=true;
 $('#modal-root').innerHTML=`<div class="modal-backdrop"><section class="modal" role="dialog" aria-modal="true" aria-label="Registra carico"><div class="modal-header"><div><div class="eyebrow">TRAINING LOG · ${esc(day.focus)}</div><h2>${esc(e.name)}</h2></div><button class="modal-close" data-action="close-modal">✕</button></div><p>Registra una serie rappresentativa della tua sessione. Il carico storico resta consultabile anche quando generi una nuova scheda.</p>
 ${previous?`<div class="note">Ultimo allenamento: <strong>${esc(previous.kg)} kg × ${esc(previous.reps)} ripetizioni</strong> · ${esc(formatDate(previous.date))}. Aumenta il carico solo se tecnica e recupero lo consentono.</div>`:''}
 <form id="exercise-log-form" data-day="${dayIndex}" data-exercise="${exerciseIndex}"><div class="form-grid">${input('Carico (kg, 0 = corpo libero)','kg',previous?.kg??0,{type:'number',min:0,max:500,step:'0.5'})}${input('Ripetizioni eseguite','reps',previous?.reps??8,{type:'number',min:1,max:100})}${select('Sforzo percepito (RPE)','rpe',Array.from({length:7},(_,i)=>({id:i+4,label:`${i+4} / 10`})),previous?.rpe??7)}</div>
 <div class="form-actions"><button class="btn primary" type="submit">✓ Registra serie</button></div></form></section></div>`;
}
function saveExerciseLog(form){
 const day=state.workout.days[Number(form.dataset.day)],e=day?.exercises[Number(form.dataset.exercise)];if(!e)return;
 const f=new FormData(form),kg=Number(f.get('kg')),reps=Number(f.get('reps')),rpe=Number(f.get('rpe'));
 if(!Number.isFinite(kg)||kg<0||kg>500||!Number.isInteger(reps)||reps<1||reps>100){toast('Inserisci carico e ripetizioni validi.',true);return;}
 state.exerciseLogs.push({id:crypto.randomUUID(),date:today(),exerciseName:e.name,kg,reps,rpe,planId:state.workout.id});
 persist();render();toast(`Serie registrata: ${e.name} ✓`);
}
function closeModal(){modalOpen=false;const el=$('#modal-root');if(el)el.innerHTML='';}
async function saveCheck(form){if(pending)return;
 const f=new FormData(form),id=crypto.randomUUID(),photoKeys={};const weight=Number(f.get('weight'));
 if(!Number.isFinite(weight)||weight<20||weight>400){toast('Inserisci un peso valido',true);return;}
 const numeric={};for(const key of ['bf','waist','chest','hips','arm','thigh']){
  const x=String(f.get(key)||'').trim();numeric[key]=x?Number(x):'';
  if(x&&(!Number.isFinite(numeric[key])||numeric[key]<2||numeric[key]>300)){toast(`Controlla il valore: ${key}`,true);return;}
 }
 pending=true;
 try{
  for(const part of ['front','side','back']){
    const file=f.get(part);if(file instanceof File&&file.size){const key=`${id}-${part}`;await storePhoto(key,await compressPhoto(file));photoKeys[part]=key;}
  }
  state.checks.unshift({id,date:String(f.get('date')),weight, ...numeric,notes:String(f.get('notes')||'').slice(0,300),photos:photoKeys});
  state.profile.weight=weight;persist();render();toast('Check salvato sul dispositivo ✓');
 }catch(err){for(const key of Object.values(photoKeys))await deletePhoto(key).catch(()=>{});toast(`Check non salvato: ${err.message}`,true);}finally{pending=false;}
}
async function saveChat(message){const t=String(message||'').trim().slice(0,700);if(!t||pending)return;
 state.chat.push({role:'user',text:t});pending=true;persist();render();
 try{
  let response,source='offline';
  // Su frontend statico, il backend assente restituisce errore trasparente;
  // la modalità offline NON viene presentata come contenuto AI generato.
  if(state.profile.backendUrl || location.hostname==='localhost'||location.hostname==='127.0.0.1'){
    try{const r=await callCoach('message',state.profile,{message:t,feedback:summarizeFeedback(state.feedback),...progressForAI()});response=r.reply;source='ai';}
    catch(err){response=`${coachReplyOffline(t)}\n\n[AI non disponibile: ${err.message}]`;}
  }else response=coachReplyOffline(t);
  state.chat.push({role:'coach',text:response,source});persist();
 }finally{pending=false;render();}
}
function saveProfile(form){const data=new FormData(form);const oldCeliac=state.profile.celiac;
 const p={...state.profile};for(const key of ['nickname','goal','experience','weight','height','age','activityLevel','limitations','allergies','backendUrl','coachToken'])p[key]=String(data.get(key)||'').trim();
 p.nickname=p.nickname.slice(0,45)||'Atleta';p.allergies=p.allergies.slice(0,200);
 p.days=Number(data.get('days'));p.duration=Number(data.get('duration'));p.checkEvery=Number(data.get('checkEvery'));
 p.celiac=data.has('celiac');p.allergenGroups=data.getAll('allergenGroups');p.allergyScreened=data.has('allergyScreened');p.limitations=p.limitations.slice(0,180);p.shareProgressAI=data.has('shareProgressAI');p.equipment=data.getAll('equipment').filter(id=>EQUIPMENT.some(e=>e.id===id));
 if(p.backendUrl&&(!/^https:\/\//.test(p.backendUrl)&&!/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(p.backendUrl))){toast('Usa HTTPS per server remoti o HTTP localhost per sviluppo.',true);return;}
 if(p.celiac!==oldCeliac || p.allergies!==state.profile.allergies || p.allergyScreened!==state.profile.allergyScreened || JSON.stringify(p.allergenGroups)!==JSON.stringify(state.profile.allergenGroups))chosenDay=0;
 state.profile=p;state.workout=generateWorkout(p);state.meals=generateMeals(p);persist();page='dashboard';render();toast('Profilo aggiornato: nuovi programmi disponibili ✓');
}
function progressForAI(){
 if(!state.profile.shareProgressAI||!state.checks.length)return {};
 const ordered=[...state.checks].sort((a,b)=>a.date.localeCompare(b.date));
 const first=ordered[0],last=ordered.at(-1);
 return {progress:{latestWeightKg:Number(last.weight),weightTrendKg:Math.round((Number(last.weight)-Number(first.weight))*10)/10,
  latestBodyFatPct:last.bf!==''?Number(last.bf):null,latestWaistCm:last.waist!==''?Number(last.waist):null,
  completedSessionsLast30Days:state.sessions.filter(s=>Date.now()-new Date(`${s.date}T12:00:00Z`).getTime()<30*864e5).length}};
}
async function aiGenerate(task){if(pending)return;
 if(task==='nutrition'&&(!state.profile.allergyScreened||state.profile.allergies.trim()||state.profile.allergenGroups.length)){toast('Allergie dichiarate: serve un piano verificato da un professionista.',true);return;}
 pending=true;render();
 try{const r=await callCoach(task,state.profile,{...progressForAI(),feedback:summarizeFeedback(state.feedback)});
  if(task==='nutrition'){if(!validateMealsPlan(r,state.profile))throw Error('Menu AI non conforme al catalogo');state.meals=r;}
  else state.workout=r;
  persist();toast('Piano generato con il coach AI ✓');
 }catch(err){toast(err.message,true);}finally{pending=false;render();}
}
function maybeNotify(){
 if(!('Notification' in window)||Notification.permission!=='granted'||!state.checks.length)return;
 const due=nextCheckDate(state.checks,state.profile.checkEvery),k='forma-notified-'+due;
 if(today()>=due&&localStorage.getItem(k)!=='yes'){
   try{new Notification('FORMA · È il momento del check',{body:'Registra peso, misure e foto dei progressi nella tua Home Gym.',icon:'./assets/icon.svg'});localStorage.setItem(k,'yes');}catch{}
 }
}
async function handleAction(el){const type=el.dataset.action;
 switch(type){
 case 'generate-workout':state.workout=generateWorkout(state.profile);persist();render();toast('Nuova scheda offline creata');break;
 case 'generate-meals':if(!state.profile.allergyScreened||state.profile.allergenGroups.length||state.profile.allergies.trim()){page='settings';render();toast('Completa screening allergeni o richiedi indicazioni professionali.',true);break;}state.meals=generateMeals(state.profile);persist();render();toast('Menu offline aggiornato');break;
 case 'ai-workout':await aiGenerate('workout');break;
 case 'ai-meals':await aiGenerate('nutrition');break;
 case 'choose-meal-day':chosenDay=Number(el.dataset.index);render();break;
 case 'recipe':showRecipe(el.dataset.id);break;
 case 'technique':showTechnique(el.dataset.name);break;
 case 'feedback-workout':showFeedbackModal(Number(el.dataset.index));break;
 case 'motion-start':await startMotionRecording();break;
 case 'motion-stop':stopMotionRecording();break;
 case 'motion-analyze':await analyzeMotion();break;
 case 'log-exercise':showExerciseLog(Number(el.dataset.day),Number(el.dataset.exercise));break;
 case 'close-modal':closeModal();break;
 case 'complete-workout':{
  const d=state.workout.days[Number(el.dataset.index)];if(!d)return;
  const completed=isDone(d);
  if(completed){const i=state.sessions.findIndex(s=>s.planId===state.workout.id&&s.dayId===d.id&&(s.week||weekKey(s.date))===weekKey());if(i>=0)state.sessions.splice(i,1);}
  else{state.sessions.push({id:crypto.randomUUID(),planId:state.workout.id,dayId:d.id,focus:d.focus,date:today(),week:weekKey()});}
  persist();render();toast(completed?'Sessione ripristinata':'Sessione registrata ✓');if(!completed)showFeedbackModal(Number(el.dataset.index));break;
 }
 case 'delete-check':{
  const check=state.checks.find(c=>c.id===el.dataset.id);if(!check)return;
  if(!confirm(`Eliminare definitivamente il check del ${formatDate(check.date)} e le sue foto?`))return;
  for(const key of Object.values(check.photos||{}))await deletePhoto(key).catch(()=>{});
  state.checks=state.checks.filter(c=>c.id!==check.id);persist();render();toast('Check eliminato');break;
 }
 case 'calendar':calendarIcs(nextCheckDate(state.checks,state.profile.checkEvery),state.profile.checkEvery);toast('Calendario scaricato: apri il file .ics e importa gli avvisi.');break;
 case 'notifications':{
  if(!('Notification' in window)){toast('Questo browser non supporta notifiche locali.',true);break;}
  const result=await Notification.requestPermission();toast(result==='granted'?'Notifiche abilitate quando l’app è aperta':'Permesso notifiche non concesso',result!=='granted');maybeNotify();break;
 }
 case 'export':downloadJson(state);toast('Backup JSON scaricato (foto escluse)');break;
 case 'reset':{
  if(!confirm('Eliminare tutti i dati e tutte le foto presenti su questo dispositivo? Operazione irreversibile.'))return;
  await clearPhotos().catch(()=>{});localStorage.removeItem('forma-ai-v1');state={profile:{...DEFAULT_PROFILE},workout:generateWorkout(DEFAULT_PROFILE),meals:generateMeals(DEFAULT_PROFILE),checks:[],sessions:[],exerciseLogs:[],chat:[],feedback:[]};page='dashboard';persist();render();toast('Dati locali cancellati');break;
 }
 case 'suggest':await saveChat(el.dataset.message);break;
 }
}
document.addEventListener('click',e=>{
 const nav=e.target.closest('[data-page]');if(nav){if(page==='motion'&&nav.dataset.page!=='motion')cleanupMotion();page=nav.dataset.page;if(!PAGES[page])page='dashboard';window.scrollTo({top:0,behavior:'instant'});render();return;}
 const action=e.target.closest('[data-action]');if(action){void handleAction(action);return;}
 if(e.target.classList.contains('modal-backdrop'))closeModal();
});
document.addEventListener('submit',e=>{
 if(e.target.id==='profile-form'){e.preventDefault();saveProfile(e.target);}
 else if(e.target.id==='check-form'){e.preventDefault();void saveCheck(e.target);}
 else if(e.target.id==='chat-form'){e.preventDefault();const t=new FormData(e.target).get('message');void saveChat(t);}
 else if(e.target.id==='exercise-log-form'){e.preventDefault();saveExerciseLog(e.target);}
 else if(e.target.id==='feedback-form'){e.preventDefault();saveFeedback(e.target);}
});
document.addEventListener('change',e=>{if(e.target.id==='motion-upload')loadMotionFile(e.target.files?.[0]);});
function cleanupMotion(){discardMotionCapture=true;if(motionStream)motionStream.getTracks().forEach(t=>t.stop());motionStream=null;if(motionRecorder?.state==='recording')motionRecorder.stop();if(motionUrl)URL.revokeObjectURL(motionUrl);motionUrl=null;motionReport=null;}
function loadMotionFile(file){if(!file)return;if(!file.type.startsWith('video/')||file.size>100_000_000){toast('Usa un video fino a 100 MB.',true);return;}if(motionUrl)URL.revokeObjectURL(motionUrl);motionUrl=URL.createObjectURL(file);motionReport=null;render();toast('Video caricato solo nel browser ✓');}
async function startMotionRecording(){if(motionStream||motionRecorder?.state==='recording')return;
 if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder){toast('Browser non compatibile con la registrazione video.',true);return;}
 try{motionStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:960},height:{ideal:720}},audio:false});
 motionParts=[];discardMotionCapture=false;motionRecorder=new MediaRecorder(motionStream);const stream=motionStream;
 motionRecorder.addEventListener('dataavailable',e=>{if(e.data.size)motionParts.push(e.data);});
 motionRecorder.addEventListener('stop',()=>{const blob=new Blob(motionParts,{type:motionRecorder.mimeType||'video/webm'});stream.getTracks().forEach(t=>t.stop());if(motionStream===stream)motionStream=null;if(blob.size&&!discardMotionCapture&&page==='motion')loadMotionFile(blob);});
 const view=$('#motion-video');if(view){view.srcObject=stream;view.muted=true;view.play().catch(()=>{});}const placeholder=document.querySelector('.motion-placeholder');if(placeholder)placeholder.remove();
 motionRecorder.start();toast('Registrazione avviata. Premi Ferma per salvare temporaneamente il video.');
 }catch(err){motionStream?.getTracks().forEach(t=>t.stop());motionStream=null;toast('Permesso videocamera negato o dispositivo non disponibile.',true);}
}
function stopMotionRecording(){if(motionRecorder?.state==='recording'){motionRecorder.stop();toast('Registrazione terminata.');}else toast('Nessuna registrazione in corso.',true);}
async function analyzeMotion(){if(motionBusy||!motionUrl)return;const video=$('#motion-video');if(!video)return;
 if(!$('#motion-consent')?.checked){toast('Serve il consenso esplicito per scaricare il modello di analisi.',true);return;}
 if(motionStream){toast('Ferma prima la registrazione.',true);return;}
 motionBusy=true;const btn=document.querySelector('[data-action="motion-analyze"]');if(btn){btn.disabled=true;btn.textContent='Analisi in corso…';}const status=$('#motion-status');
 try{motionReport=await inspectVideo(video,p=>{if(status)status.textContent=`Elaborazione locale: ${p}%`;});render();toast('Analisi sperimentale completata.');}
 catch(err){if(status)status.textContent='Analisi non riuscita: verifica connessione e formato del video.';toast(`Analisi non disponibile: ${err.message}`,true);}
 finally{motionBusy=false;if(btn&&btn.isConnected){btn.disabled=false;btn.textContent='✦ Analizza movimento (beta)';}}
}
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modalOpen)closeModal();});
render();maybeNotify();
if('serviceWorker' in navigator && (location.protocol==='https:'||location.hostname==='localhost'||location.hostname==='127.0.0.1'))navigator.serviceWorker.register('./sw.js').catch(()=>{});
