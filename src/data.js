export const GOALS = [
  {id:'dimagrimento',label:'Dimagrimento',icon:'↘',summary:'Costanza, forza e attività cardiovascolare moderata'},
  {id:'definizione',label:'Definizione',icon:'◈',summary:'Preservare la forza e seguire progressi sostenibili'},
  {id:'mantenimento',label:'Mantenimento',icon:'◎',summary:'Restare attivo e mantenere i risultati'},
  {id:'massa_forza',label:'Massa + forza',icon:'↗',summary:'Progressione, tecnica e recupero'}
];
export const EQUIPMENT = [
  {id:'dumbbell',label:'Manubri'}, {id:'barbell',label:'Bilanciere'}, {id:'rack',label:'Rack'},
  {id:'bench',label:'Panca'}, {id:'pullup',label:'Sbarra trazioni'}, {id:'bands',label:'Elastici'},
  {id:'kettlebell',label:'Kettlebell'}, {id:'cable',label:'Cavi / macchine'},
  {id:'bike',label:'Cyclette'}, {id:'treadmill',label:'Tapis roulant'}
];
// Ognuno dei pattern ha alternative realmente eseguibili a corpo libero.
export const EXERCISES = {
  squat: [
    {id:'back-squat',name:'Back squat',equipment:['barbell','rack']},
    {id:'goblet-squat',name:'Goblet squat',equipment:['dumbbell']},
    {id:'kb-squat',name:'Kettlebell goblet squat',equipment:['kettlebell']},
    {id:'air-squat',name:'Squat a corpo libero',equipment:[]}
  ],
  hinge: [
    {id:'rdl',name:'Stacco rumeno',equipment:['barbell']},
    {id:'dumbbell-rdl',name:'Stacco rumeno con manubri',equipment:['dumbbell']},
    {id:'kb-deadlift',name:'Stacco con kettlebell',equipment:['kettlebell']},
    {id:'glute-bridge',name:'Ponte glutei',equipment:[]}
  ],
  push: [
    {id:'bench-press',name:'Panca piana bilanciere',equipment:['barbell','bench']},
    {id:'db-bench',name:'Distensioni manubri su panca',equipment:['dumbbell','bench']},
    {id:'db-floor',name:'Floor press con manubri',equipment:['dumbbell']},
    {id:'pushup',name:'Push-up',equipment:[]}
  ],
  pull: [
    {id:'pullup',name:'Trazioni alla sbarra',equipment:['pullup']},
    {id:'db-row',name:'Rematore con manubrio',equipment:['dumbbell']},
    {id:'bar-row',name:'Rematore bilanciere',equipment:['barbell']},
    {id:'band-row',name:'Rematore con elastico',equipment:['bands']},
    {id:'prone-snow',name:'Reverse snow angel a terra',equipment:[]}
  ],
  shoulder: [
    {id:'ohp',name:'Military press',equipment:['barbell']},
    {id:'db-shoulder',name:'Shoulder press manubri',equipment:['dumbbell']},
    {id:'band-press',name:'Shoulder press elastico',equipment:['bands']},
    {id:'pike-pushup',name:'Pike push-up',equipment:[]}
  ],
  single: [
    {id:'db-lunges',name:'Affondi con manubri',equipment:['dumbbell']},
    {id:'kb-lunges',name:'Affondi con kettlebell',equipment:['kettlebell']},
    {id:'reverse-lunge',name:'Affondi indietro',equipment:[]}
  ],
  core: [{id:'plank',name:'Plank',equipment:[]},{id:'dead-bug',name:'Dead bug',equipment:[]}]
};

// Ingredienti e calorie sono orientativi. 'gf' indica che la ricetta si può preparare
// senza glutine SOLO dopo verifica etichette, utensili e contaminazione.
export const RECIPES = [
  {id:'yogurt-frutta',slot:'Colazione',name:'Yogurt greco, frutta e noci',emoji:'🥣',minutes:5,gf:true,kcal:350,protein:24,
    ingredients:['170 g yogurt greco bianco','1 banana','20 g noci','cannella pura'],steps:['Versa lo yogurt in una ciotola pulita.','Taglia la banana e disponila sopra.','Aggiungi noci e cannella; servi.'],tags:['Vegetariano','Proteico']},
  {id:'uova-pane-gf',slot:'Colazione',name:'Uova e toast senza glutine',emoji:'🍳',minutes:12,gf:true,kcal:410,protein:23,
    ingredients:['2 uova','2 fette pane confezionato con dicitura «senza glutine»','1 pomodoro','1 cucchiaino olio extravergine'],steps:['Usa padella e tostapane non contaminati da pane con glutine.','Cuoci le uova in padella con poco olio.','Tosta il pane senza glutine su superficie pulita e servi con il pomodoro.'],tags:['Senza glutine','Semplice']},
  {id:'ricotta-frutti',slot:'Colazione',name:'Ricotta con frutti di bosco',emoji:'🫐',minutes:5,gf:true,kcal:330,protein:19,
    ingredients:['150 g ricotta fresca semplice','120 g frutti di bosco','20 g mandorle'],steps:['Lava la frutta.','Distribuisci la ricotta in una coppetta.','Completa con frutti di bosco e mandorle.'],tags:['Vegetariano']},
  {id:'banana-burro',slot:'Spuntino',name:'Banana e crema di arachidi',emoji:'🍌',minutes:3,gf:true,kcal:220,protein:6,
    ingredients:['1 banana','20 g crema 100% arachidi (verificare etichetta)'],steps:['Sbuccia la banana.','Accompagna con la crema di arachidi usando utensili puliti.'],tags:['Veloce']},
  {id:'yogurt-mandorle',slot:'Spuntino',name:'Yogurt e mandorle',emoji:'🥛',minutes:3,gf:true,kcal:220,protein:15,
    ingredients:['150 g yogurt bianco semplice','20 g mandorle'],steps:['Mescola yogurt e mandorle.','Servi fresco.'],tags:['Proteico']},
  {id:'mela-formaggio',slot:'Spuntino',name:'Mela e Parmigiano',emoji:'🍎',minutes:3,gf:true,kcal:230,protein:12,
    ingredients:['1 mela','35 g Parmigiano Reggiano'],steps:['Lava e taglia la mela.','Accompagna con scaglie di Parmigiano.'],tags:['Salato e dolce']},
  {id:'riso-pollo',slot:'Pranzo',name:'Bowl di riso, pollo e zucchine',emoji:'🍚',minutes:30,gf:true,kcal:580,protein:42,
    ingredients:['90 g riso crudo','150 g petto di pollo','1 zucchina','10 g olio extravergine','limone ed erbe pure'],steps:['Cuoci il riso in acqua salata.','Taglia il pollo e cuocilo bene in padella pulita.','Salta le zucchine con olio e poca acqua.','Componi la bowl con limone ed erbe verificate.'],tags:['Meal prep','Senza glutine']},
  {id:'quinoa-ceci',slot:'Pranzo',name:'Quinoa, ceci e verdure',emoji:'🥗',minutes:25,gf:true,kcal:530,protein:19,
    ingredients:['75 g quinoa verificata senza glutine','150 g ceci cotti al naturale','pomodorini','carote','10 g olio extravergine'],steps:['Sciacqua e cuoci la quinoa seguendo la confezione.','Scola i ceci e lava le verdure.','Mescola e condisci con olio e limone.'],tags:['Vegetariano','Fibra']},
  {id:'pasta-gf-tonno',slot:'Pranzo',name:'Pasta senza glutine con tonno',emoji:'🍝',minutes:20,gf:true,kcal:560,protein:35,
    ingredients:['90 g pasta con dicitura «senza glutine»','100 g tonno al naturale verificato','passata di pomodoro semplice','10 g olio extravergine'],steps:['Usa acqua, pentola e scolapasta non contaminati da pasta tradizionale.','Cuoci la pasta senza glutine.','Scalda la passata, aggiungi il tonno e mescola alla pasta.'],tags:['Senza glutine']},
  {id:'patate-salmone',slot:'Cena',name:'Salmone al forno con patate',emoji:'🐟',minutes:35,gf:true,kcal:610,protein:39,
    ingredients:['160 g salmone fresco','260 g patate','insalata mista','10 g olio extravergine','limone'],steps:['Preriscalda il forno a 190 °C.','Taglia le patate e cuocile per circa 25–30 minuti.','Aggiungi il salmone e prosegui finché è ben cotto.','Servi con insalata fresca e limone.'],tags:['Omega-3']},
  {id:'frittata-verdure',slot:'Cena',name:'Frittata con verdure e patate',emoji:'🥚',minutes:25,gf:true,kcal:490,protein:27,
    ingredients:['3 uova','200 g patate','spinaci freschi','10 g olio extravergine'],steps:['Cuoci le patate a cubetti in padella con acqua e poco olio.','Aggiungi gli spinaci finché appassiscono.','Versa le uova sbattute e cuoci completamente su entrambi i lati.'],tags:['Vegetariano']},
  {id:'tacchino-riso',slot:'Cena',name:'Tacchino, riso e broccoli',emoji:'🥦',minutes:30,gf:true,kcal:520,protein:43,
    ingredients:['150 g petto di tacchino','75 g riso crudo','broccoli','10 g olio extravergine','spezie pure verificate'],steps:['Cuoci il riso.','Cuoci al vapore i broccoli.','Rosola il tacchino e portalo a completa cottura.','Condisci con olio e spezie verificate.'],tags:['Proteico']},
  {id:'couscous',slot:'Pranzo',name:'Cous cous integrale con pollo',emoji:'🍲',minutes:20,gf:false,kcal:560,protein:34,
    ingredients:['90 g cous cous di frumento','130 g pollo','verdure','olio extravergine'],steps:['Cuoci il cous cous secondo la confezione.','Cuoci il pollo e le verdure in padella.','Mescola e condisci.'],tags:['Contiene glutine']},
  {id:'pane-hummus',slot:'Spuntino',name:'Pane integrale e hummus',emoji:'🥪',minutes:5,gf:false,kcal:260,protein:9,
    ingredients:['2 fette pane integrale di frumento','50 g hummus'],steps:['Spalma hummus sul pane integrale.'],tags:['Contiene glutine']}
];
export const WEEK_DAYS = ['Lunedì','Martedì','Mercoledì','Giovedì','Venerdì','Sabato','Domenica'];
export const SLOTS = ['Colazione','Pranzo','Spuntino','Cena'];
export const DEFAULT_PROFILE = {
  nickname:'Atleta',goal:'massa_forza',experience:'intermedio',days:4,duration:60,
  equipment:['dumbbell','bench','bands'],celiac:false,allergies:'',allergenGroups:[],allergyScreened:false,activityLevel:'moderato',limitations:'',
  weight:'',bf:'',height:'',age:'',checkEvery:14,shareProgressAI:false,backendUrl:'',
  coachToken:'',notes:''
};
