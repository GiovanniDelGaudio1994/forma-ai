// Feedback-guided deterministic adaptation: deliberately conservative, auditable and offline.
export const FEELINGS = [
  {id:'facile',label:'Troppo facile'}, {id:'giusto',label:'Giusto'},
  {id:'faticoso',label:'Molto faticoso'}
];
export function assessFeedback(entry={}){
  const rpe=Number(entry.rpe), recovery=Number(entry.recovery);
  if(!Number.isInteger(rpe)||rpe<1||rpe>10||!Number.isInteger(recovery)||recovery<1||recovery>5)
    throw new Error('RPE (1–10) e recupero (1–5) devono essere validi.');
  const pain=entry.pain===true;
  const hard=pain||rpe>=9||recovery<=2||entry.feeling==='faticoso';
  const easy=!hard&&rpe<=6&&recovery>=4&&entry.feeling==='facile';
  return {trend:pain?'pain':hard?'reduce':easy?'progress':'hold', rpe, recovery,
    message:pain?'Hai segnalato dolore: non aumentare il carico, interrompi i movimenti dolorosi e chiedi una valutazione professionale se necessario.'
      :hard?'Riduciamo leggermente il volume nel prossimo allenamento e aumentiamo il recupero.'
      :easy?'L’allenamento è sembrato gestibile: proponiamo una piccola progressione delle ripetizioni, senza aumentare automaticamente i pesi.'
      :'Il carico percepito sembra adeguato: manteniamo la progressione attuale.'};
}
export function adaptDay(plan,dayId,feedback){
  const assessment=assessFeedback(feedback);
  if(!plan?.days?.some(d=>d.id===dayId))throw new Error('Sessione non trovata nel piano.');
  const clone=structuredClone(plan);
  const day=clone.days.find(d=>d.id===dayId);
  const before=day.exercises.map(e=>({...e}));
  day.exercises=day.exercises.map(e=>{
    const next={...e};
    if(assessment.trend==='pain'){
      next.notes=`Dolore segnalato: non eseguire movimenti dolorosi; richiedi una valutazione se necessario. ${e.notes||''}`.slice(0,250);
    }else if(assessment.trend==='reduce'){
      next.sets=Math.max(1,Number(e.sets)-1);
      next.restSeconds=Math.min(240,Number(e.restSeconds)+30);
      next.notes=`Sessione da alleggerire. ${e.notes||''}`.slice(0,250);
    }else if(assessment.trend==='progress'){
      const match=String(e.reps).match(/^(\d+)[–-](\d+)$/);
      if(match){const lo=Math.min(20,Number(match[1])+1),hi=Math.min(25,Number(match[2])+1);next.reps=`${lo}–${hi}`;}
      next.notes=`Incremento graduale solo con tecnica stabile. ${e.notes||''}`.slice(0,250);
    }
    return next;
  });
  clone.id=plan.id; // preserve completed sessions and training logs
  clone.createdAt=new Date().toISOString();
  clone.source='feedback';
  clone.guidance=`${assessment.message} Registra il prossimo RPE e rivaluta. ${plan.guidance||''}`.slice(0,520);
  return {plan:clone,assessment,changed:before.some((e,i)=>JSON.stringify(e)!==JSON.stringify(day.exercises[i]))};
}
export function summarizeFeedback(entries=[]){
 return entries.slice(-4).map(x=>({day:x.day, rpe:x.rpe,recovery:x.recovery,feeling:x.feeling,pain:!!x.pain}));
}
