import test from 'node:test';
import assert from 'node:assert/strict';
import {generateWithAI} from '../server/coach.mjs';
import {generateMeals,generateWorkout} from '../src/planner.js';
import {DEFAULT_PROFILE} from '../src/data.js';

const mock=(response,fn)=>{
 const old=global.fetch;let payload;
 global.fetch=async(_url,init)=>{payload=JSON.parse(init.body);return {ok:true,json:async()=>({output:[{content:[{type:'output_text',text:JSON.stringify(response)}]}]})};};
 return Promise.resolve().then(fn).then(x=>({x,payload})).finally(()=>{global.fetch=old;});
};
test('AI celiaci: accetta solo ricette consentite del catalogo',async()=>{
 const profile={...DEFAULT_PROFILE,celiac:true,allergyScreened:true};const menu=generateMeals(profile);
 const {x,payload}=await mock(menu,()=>generateWithAI('nutrition',profile,{}, {apiKey:'test-token'}));
 assert.equal(x.source,'ai');
 assert.ok(payload.instructions.includes('NON creare ricette'));
 assert.ok(payload.instructions.includes('Celiachia'));
 assert.ok(!payload.instructions.includes('id":"couscous"'));
});
test('AI celiaci: rifiuta un menu non sicuro anche se il modello lo restituisce',async()=>{
 const profile={...DEFAULT_PROFILE,celiac:true,allergyScreened:true};const menu=generateMeals(profile);
 menu.days[0].meals[1].recipeId='couscous';
 await assert.rejects(()=>mock(menu,()=>generateWithAI('nutrition',profile,{}, {apiKey:'test-token'})),/non conforme/);
});
test('AI blocca allergie dichiarate senza chiamare il provider',async()=>{
 const profile={...DEFAULT_PROFILE,allergies:'uova'};
 await assert.rejects(()=>generateWithAI('nutrition',profile,{}, {apiKey:'test-token'}),/allergie/i);
});
test('AI workout: rifiuta un esercizio non compatibile',async()=>{
 const profile={...DEFAULT_PROFILE,days:2,equipment:[]};const workout=generateWorkout(profile);
 workout.days[0].exercises[0].name='Back squat';
 await assert.rejects(()=>mock(workout,()=>generateWithAI('workout',profile,{}, {apiKey:'test-token'})),/non conforme/);
});
test('AI workout riceve il feedback recente esplicitamente fornito',async()=>{
 const profile={...DEFAULT_PROFILE,days:3};
 const workout=generateWorkout(profile), feedback=[{day:'Lunedì',rpe:9,recovery:2,feeling:'faticoso',pain:false}];
 const {payload}=await mock(workout,()=>generateWithAI('workout',profile,{feedback},{apiKey:'test-token'}));
 assert.equal(JSON.parse(payload.input).context.feedback[0].rpe,9);
 assert.ok(payload.instructions.includes('feedback recente'));
});
