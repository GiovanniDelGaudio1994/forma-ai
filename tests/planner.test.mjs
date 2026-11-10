import test from 'node:test';
import assert from 'node:assert/strict';
import {EXERCISES,RECIPES,DEFAULT_PROFILE,WEEK_DAYS} from '../src/data.js';
import {chooseExercise,generateWorkout,generateMeals,validateMealsPlan,nextCheckDate,stats,availableRecipes} from '../src/planner.js';
import {validateWorkout} from '../server/coach.mjs';

for(const days of [2,3,4,5,6]){
 test(`scheda offline con ${days} giorni, compatibile con attrezzatura reale`,()=>{
  const p={...DEFAULT_PROFILE,days,equipment:['bands']};
  const plan=generateWorkout(p);
  assert.equal(plan.days.length,days);
  for(const day of plan.days){
   assert.ok(day.exercises.length>=3);
   for(const ex of day.exercises){
     const source=Object.values(EXERCISES).flat().find(x=>x.name===ex.name);
     assert.ok(source,`Esercizio sconosciuto: ${ex.name}`);
     assert.ok(source.equipment.every(e=>p.equipment.includes(e)),`Attrezzo mancante per: ${ex.name}`);
   }
  }
 });
}
test('assenza attrezzi: progressione a corpo libero',()=>{
 const p={...DEFAULT_PROFILE,equipment:[],days:3};
 const plan=generateWorkout(p);
 for(const d of plan.days)for(const e of d.exercises){
   const match=Object.values(EXERCISES).flat().find(x=>x.name===e.name);
   assert.deepEqual(match.equipment,[]);
 }
});
test('obiettivo massa e forza: ripetizioni e recupero coerenti',()=>{
 const p={...DEFAULT_PROFILE,goal:'massa_forza',days:4};const plan=generateWorkout(p);
 assert.equal(plan.days[0].exercises[0].reps,'5–8');
 assert.equal(plan.days[0].exercises[0].restSeconds,120);
});
test('celiachia: nessuna ricetta con glutine nelle 28 scelte',()=>{
 const p={...DEFAULT_PROFILE,celiac:true,allergyScreened:true};const plan=generateMeals(p);
 assert.equal(plan.days.length,7);assert.equal(plan.days.flatMap(d=>d.meals).length,28);
 assert.ok(validateMealsPlan(plan,p));
 for(const day of plan.days)for(const meal of day.meals){
   const r=RECIPES.find(r=>r.id===meal.recipeId);assert.equal(r?.gf,true);
 }
});
test('validazione rifiuta ricetta contenente glutine per celiaci',()=>{
 const p={...DEFAULT_PROFILE,celiac:true,allergyScreened:true},plan=generateMeals(p);
 plan.days[0].meals[1].recipeId='couscous';
 assert.equal(validateMealsPlan(plan,p),false);
});
test('validazione rifiuta ricetta inserita nello slot sbagliato',()=>{
 const p={...DEFAULT_PROFILE,allergyScreened:true},plan=generateMeals(p);
 plan.days[0].meals[0].recipeId='riso-pollo';
 assert.equal(validateMealsPlan(plan,p),false);
});
test('allergie dichiarate bloccano la generazione pasti automatica',()=>{
 const p={...DEFAULT_PROFILE,allergies:'arachidi'};
 assert.deepEqual(availableRecipes(p),[]);
 assert.ok(generateMeals(p).days.every(d=>d.meals.every(m=>m.recipeId===null)));
});
test('data check successivo con roll-over mese e nessun check',()=>{
 assert.equal(nextCheckDate([{date:'2026-11-30'}],14),'2026-12-14');
 assert.match(nextCheckDate([],14),/^\d{4}-\d{2}-\d{2}$/);
});
test('delta peso quando check multipli',()=>{
 assert.equal(stats([{date:'2026-11-01',weight:80},{date:'2026-11-10',weight:79.2}],[]).delta,-0.8);
 assert.equal(stats([],[]).delta,null);
});
test('validatore server AI rifiuta esercizio con attrezzi non posseduti',()=>{
 const p={...DEFAULT_PROFILE,days:2,equipment:[]};
 const fake={days:[0,1].map((i)=>({day:WEEK_DAYS[i],focus:'Full body',exercises:Array.from({length:3},()=>({name:'Back squat',sets:3,reps:'8',restSeconds:90,notes:'Tecnica'}))}))};
 assert.equal(validateWorkout(fake,p),false);
});
