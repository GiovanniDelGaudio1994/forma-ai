export async function callCoach(task,profile,context={},signal){
  const origin=String(profile.backendUrl||'').trim().replace(/\/+$/,'');
  const endpoint=`${origin}/api/coach`;
  const headers={'Content-Type':'application/json'};
  if(profile.coachToken)headers.Authorization=`Bearer ${profile.coachToken}`;
  // Minimizzazione dati: al backend arrivano soltanto i campi necessari.
  const safeProfile={goal:profile.goal,days:profile.days,duration:profile.duration,experience:profile.experience,equipment:profile.equipment,celiac:!!profile.celiac,allergies:profile.allergies||'',allergenGroups:profile.allergenGroups||[],allergyScreened:!!profile.allergyScreened,weight:profile.weight||'',height:profile.height||'',age:profile.age||'',activityLevel:profile.activityLevel||'moderato',limitations:profile.limitations||''};
  const payload={task,profile:safeProfile,context};
  let response;
  try {response=await fetch(endpoint,{method:'POST',headers,body:JSON.stringify(payload),signal});}
  catch {throw new Error('Coach AI non raggiungibile. Avvia il server oppure usa il piano offline.');}
  let json={};try{json=await response.json();}catch{}
  if(!response.ok)throw new Error(json.error||`Errore server AI (${response.status})`);
  return json.result;
}
