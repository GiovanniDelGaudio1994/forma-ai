import {EXERCISES, RECIPES, SLOTS, WEEK_DAYS} from './data.js';

const TEMPLATES = {
  2: [['Full body A',['squat','push','pull','hinge','core']],['Full body B',['hinge','shoulder','single','pull','core']]],
  3: [['Full body A',['squat','push','pull','core']],['Full body B',['hinge','shoulder','single','core']],['Full body C',['squat','pull','push','hinge']]],
  4: [['Upper A',['push','pull','shoulder','core']],['Lower A',['squat','hinge','single','core']],['Upper B',['pull','push','shoulder','core']],['Lower B',['hinge','squat','single','core']]],
  5: [['Upper A',['push','pull','shoulder']],['Lower A',['squat','hinge','core']],['Full body',['squat','push','pull']],['Upper B',['pull','shoulder','push']],['Lower B',['hinge','single','core']]],
  6: [['Push A',['push','shoulder','core']],['Pull A',['pull','hinge','core']],['Legs A',['squat','single','core']],['Push B',['shoulder','push','core']],['Pull B',['pull','hinge','core']],['Legs B',['hinge','squat','single']]]
};
const DAY_MAP = {2:[0,3],3:[0,2,4],4:[0,1,3,4],5:[0,1,2,3,4],6:[0,1,2,3,4,5]};
const finite = n => Number.isFinite(Number(n)) && String(n).trim()!=='';
export function chooseExercise(pattern, equipment=[], variant=0){
  const set = new Set(equipment);
  const eligible = EXERCISES[pattern].filter(e=>e.equipment.every(id=>set.has(id)));
  return eligible[variant % eligible.length];
}
export function generateWorkout(profile){
  const count = Math.min(6,Math.max(2,Math.round(Number(profile.days)||3)));
  const goal = profile.goal || 'mantenimento';
  const experienced = profile.experience === 'avanzato';
  const novice = profile.experience === 'principiante';
  const sets = novice || profile.activityLevel==='sedentario' ? 2 : experienced ? 4 : 3;
  const strength = goal==='massa_forza';
  const reps = strength ? '5–8' : goal==='mantenimento' ? '8–12' : '10–15';
  const restSeconds = strength ? 120 : 75;
  const schedule = TEMPLATES[count].map(([focus,patterns],index)=>({
    id:`day-${index+1}`,day:WEEK_DAYS[DAY_MAP[count][index]],focus,done:false,
    exercises:patterns.map((pattern,idx)=>{
      const exercise = chooseExercise(pattern,profile.equipment||[],index % 2 === 1 ? 1 : 0);
      return {id:`${index}-${idx}-${exercise.id}`,name:exercise.name,sets:pattern==='core'?2:sets,
        reps:pattern==='core'?'30–45 sec':reps,restSeconds:pattern==='core'?45:restSeconds,
        notes: strength?'Mantieni 1–3 ripetizioni di margine; cura la tecnica.':'Esegui il movimento in controllo, senza dolore.'};
    })
  }));
  return {
    id:`plan-${Date.now()}`,source:'offline',goal,createdAt:new Date().toISOString(),
    title:strength?'Strength & Build':goal==='dimagrimento'?'Active & Strong':goal==='definizione'?'Lean & Strong':'Balanced Performance',
    summary:`${count} allenamenti/settimana · ${Number(profile.duration)||60} min indicativi · attrezzatura disponibile`,
    guidance:'Riscaldati 5–10 minuti. Aumenta il carico gradualmente solo mantenendo la tecnica; recupera almeno 1 giorno quando necessario.',
    days:schedule
  };
}
export function availableRecipes(profile){
  const allergies=String(profile.allergies||'').toLocaleLowerCase('it');
  if(profile.allergyScreened!==true||profile.allergenGroups?.length)return [];
  // Conservativo: per allergie dichiarate non generiamo piatti automaticamente:
  // un filtro testuale non sa riconoscere ingredienti derivati o contaminazioni.
  if(allergies.trim()) return [];
  return RECIPES.filter(r=>!profile.celiac || r.gf);
}
export function generateMeals(profile){
  const recipes=availableRecipes(profile);
  const days=WEEK_DAYS.map((day,index)=>({day,meals:SLOTS.map((slot,idx)=>{
    const pool=recipes.filter(r=>r.slot===slot);
    if(!pool.length) return {slot,recipeId:null};
    return {slot,recipeId:pool[(index+idx)%pool.length].id};
  })}));
  return {id:`meals-${Date.now()}`,source:'offline',createdAt:new Date().toISOString(),
    title:'Menu settimanale indicativo',days,
    guidance: (profile.allergyScreened!==true||profile.allergenGroups?.length||profile.allergies?.trim())
      ? 'Screening alimentare incompleto o allergie/intolleranze segnalate: menu sospeso. In presenza di allergie rivolgiti a un dietista/allergologo.'
      : 'Esempi di pasti, NON una prescrizione nutrizionale. Verifica porzioni, fabbisogni, allergeni e ingredienti con un professionista.',
    celiac:!!profile.celiac};
}
export function validateMealsPlan(plan,profile){
  if(!plan || !Array.isArray(plan.days) || plan.days.length!==7) return false;
  const recipes=availableRecipes(profile);
  const allowed=new Map(recipes.map(r=>[r.id,r]));
  if(!allowed.size) return false;
  return plan.days.every((d,i)=>d.day===WEEK_DAYS[i]&&Array.isArray(d.meals)&&d.meals.length===SLOTS.length&&d.meals.every((m,j)=>m.slot===SLOTS[j]&&allowed.get(m.recipeId)?.slot===m.slot));
}
export function nextCheckDate(checks,intervalDays=14){
  if(!checks?.length){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
  const last=checks.reduce((a,b)=>a.date>b.date?a:b).date;
  const time=new Date(`${last}T12:00:00Z`);
  time.setUTCDate(time.getUTCDate()+Math.max(1,Math.min(90,Number(intervalDays)||14)));
  return time.toISOString().slice(0,10);
}
export function formatDate(date){
  if(!date) return '—';
  return new Date(`${String(date).slice(0,10)}T12:00:00Z`).toLocaleDateString('it-IT',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'});
}
export function stats(checks=[],sessions=[]){
  const byDate=[...checks].sort((a,b)=>a.date.localeCompare(b.date));
  const first=byDate[0],last=byDate.at(-1);
  const delta=first&&last&&finite(first.weight)&&finite(last.weight) ? Math.round((Number(last.weight)-Number(first.weight))*10)/10 : null;
  return {totalChecks:checks.length,totalSessions:sessions.length,weight:last?.weight||null,bf:last?.bf||null,delta};
}
