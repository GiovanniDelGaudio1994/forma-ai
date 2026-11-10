// Educational cues, not video diagnoses or individual biomechanical prescriptions.
export const GUIDES={
 squat:{title:'Squat',setup:'Piedi in posizione stabile, busto controllato, attrezzatura preparata.',steps:['Inizia con carico che consenta controllo e range confortevole.','Piega anche e ginocchia senza rimbalzare; tieni i piedi appoggiati.','Risalendo mantieni la traiettoria stabile e respira in modo naturale.'],checks:['Il movimento è ripetibile senza dolore?','Mantieni il controllo senza collassare in avanti?'],avoid:'Non forzare profondità o peso se provochi dolore.'},
 hinge:{title:'Stacco rumeno / hip hinge',setup:'Posizionati stabile, carico vicino al corpo.',steps:['Porta il bacino indietro mantenendo la schiena in posizione controllata.','Scendi fino a un range gestibile senza perdere controllo.','Ritorna in piedi spingendo il pavimento e contraendo glutei.'],checks:['Il carico resta vicino al corpo?','Senti un movimento controllato, senza dolore lombare?'],avoid:'Evita iperestensione e carichi che alterano il movimento.'},
 push:{title:'Panca / push-up',setup:'Polsi e spalle in una posizione comoda e stabile.',steps:['Prepara appoggi e attrezzatura.','Abbassa con controllo nel range di movimento tollerato.','Spingi senza bloccare bruscamente e senza perdere stabilità.'],checks:['Mantieni un ritmo simile nelle ripetizioni?','Le spalle restano stabili e senza dolore?'],avoid:'Per panca pesante usa supporti adeguati e, quando possibile, uno spotter.'},
 pull:{title:'Rematore / trazioni',setup:'Organizza presa e appoggio stabili.',steps:['Parti da una posizione ben controllata.','Tira senza strappi, mantenendo spalle e tronco relativamente stabili.','Ritorna lentamente senza perdere il controllo.'],checks:['Eviti slanci del busto?','Mantieni un’escursione ripetibile senza dolore?'],avoid:'Non inseguire il carico a scapito del controllo.'},
 shoulder:{title:'Spinte sopra la testa',setup:'Piedi stabili e addome attivo.',steps:['Inizia con una posizione confortevole delle braccia.','Spingi in alto con movimento lento e controllato.','Ritorna senza perdere allineamento e controllo.'],checks:['Riesci a mantenere il busto stabile?','Non compare dolore alla spalla?'],avoid:'Non forzare la mobilità o un carico eccessivo.'},
 single:{title:'Affondi',setup:'Scegli una falcata stabile.',steps:['Scendi lentamente con equilibrio.','Mantieni un appoggio completo e controllo del tronco.','Risalendo spingi con il piede e ripeti dall’altro lato.'],checks:['Il movimento è gestibile su entrambi i lati?','Rimani stabile?'],avoid:'In caso di instabilità utilizza un appoggio o riduci il carico.'},
 core:{title:'Plank e stabilità',setup:'Appoggia bene gomiti o mani.',steps:['Allinea tronco e bacino in modo confortevole.','Respira senza trattenere eccessivamente.','Interrompi quando perdi il controllo della posizione.'],checks:['Riesci a respirare regolarmente?','La posizione resta controllata?'],avoid:'Non mantenere una posizione dolorosa.'}
};
export function guideForExercise(name=''){
 const n=String(name).toLowerCase();
 const key=/squat/.test(n)?'squat':/stacc|deadlift|rumen|ponte|bridge/.test(n)?'hinge':/panc|press|push|floor/.test(n)&&!/shoulder|military|overhead|pike/.test(n)?'push':/trazion|remator|row|pull|snow/.test(n)?'pull':/shoulder|military|pike/.test(n)?'shoulder':/affond|lunge/.test(n)?'single':'core';
 return GUIDES[key];
}
export function offlineTechniqueAnswer(name){
 const g=guideForExercise(name);
 return `${g.title}. Preparazione: ${g.setup} Passaggi: ${g.steps.join(' ')} Come capire se stai lavorando bene: ${g.checks.join(' ')} Nota: ${g.avoid}`;
}
