import test from 'node:test';
import assert from 'node:assert/strict';
import {DEFAULT_PROFILE} from '../src/data.js';
import {generateWorkout,availableRecipes,generateMeals,validateMealsPlan} from '../src/planner.js';
import {assessFeedback,adaptDay} from '../src/adaptive.js';
import {compareArms,interpretArms} from '../src/motion.js';
import {guideForExercise} from '../src/technique.js';

const sample={rpe:6,recovery:5,feeling:'facile',pain:false};
test('feedback facile aumenta solo ripetizioni, mantenendo ID e carico storico',()=>{
 const p=generateWorkout(DEFAULT_PROFILE),before=p.days[0].exercises[0];
 const next=adaptDay(p,p.days[0].id,sample);
 assert.equal(next.assessment.trend,'progress');
 assert.equal(next.plan.id,p.id);
 assert.notEqual(next.plan.days[0].exercises[0].reps,before.reps);
 assert.equal(next.plan.days[0].exercises[0].sets,before.sets);
 assert.equal(p.days[0].exercises[0].reps,before.reps);
});
test('fatica o scarso recupero riducono volume, senza intensificare',()=>{
 const p=generateWorkout(DEFAULT_PROFILE),e=p.days[0].exercises[0];
 const {plan,assessment}=adaptDay(p,p.days[0].id,{rpe:10,recovery:1,feeling:'faticoso',pain:false});
 assert.equal(assessment.trend,'reduce');
 assert.ok(plan.days[0].exercises[0].sets<=e.sets);
 assert.ok(plan.days[0].exercises[0].restSeconds>=e.restSeconds);
});
test('segnalazione dolore produce regola cautelativa',()=>{
 assert.equal(assessFeedback({...sample,pain:true}).trend,'pain');
 assert.match(assessFeedback({...sample,pain:true}).message,/dolore/i);
});
test('RPE non valido è rifiutato',()=>assert.throws(()=>assessFeedback({...sample,rpe:12}),/RPE/));
test('screening allergeni prima di ricette',()=>{
 const p={...DEFAULT_PROFILE};assert.equal(availableRecipes(p).length,0);
 const q={...p,allergyScreened:true,allergenGroups:[]};assert.ok(availableRecipes(q).length>0);
 assert.ok(validateMealsPlan(generateMeals(q),q));
});
test('14 gruppi: con allergia dichiarata il piano è bloccato',()=>{
 const p={...DEFAULT_PROFILE,allergyScreened:true,allergenGroups:['Soia']};
 assert.equal(availableRecipes(p).length,0);
 assert.ok(generateMeals(p).days.every(d=>d.meals.every(m=>m.recipeId===null)));
});
test('guida tecnica per squat e rematore',()=>{
 assert.equal(guideForExercise('Goblet squat').title,'Squat');
 assert.match(guideForExercise('Rematore con manubrio').title,/Rematore/);
});
test('pose: landmark assenti generano risultato incerto',()=>{
 assert.equal(compareArms([]),null);
 assert.equal(interpretArms([null,null]).level,'uncertain');
});
test('pose: differenze costanti negli angoli producono richiesta di revisione non diagnosi',()=>{
 const report=interpretArms(Array.from({length:8},()=>({difference:30})));
 assert.equal(report.level,'review');assert.match(report.text,/Non è possibile dedurre/);
});
test('dolore: nessuna progressione e avviso su ogni esercizio',()=>{
 const p=generateWorkout(DEFAULT_PROFILE);
 const next=adaptDay(p,p.days[0].id,{...sample,pain:true});
 assert.equal(next.assessment.trend,'pain');
 assert.equal(next.plan.days[0].exercises[0].sets,p.days[0].exercises[0].sets);
 assert.match(next.plan.days[0].exercises[0].notes,/non eseguire movimenti dolorosi/i);
});
