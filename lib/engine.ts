export type Direction = 'Business' | 'Produse';
export const TIMEZONE = 'Europe/Bucharest';
export const platforms = ['Facebook','Instagram','TikTok','LinkedIn'];
export const reasons = ['Conținut despre produs','Grup comun','Indiciu observat în profil','Altul'];
export const states: Record<string,string> = {
 P_INITIAL:'Primul mesaj Produse',P_INFO:'Informații Produse trimise',P_CLARIFY:'Clarificare Produse',P_PRICE:'Preț și expediere',P_PAID:'Plată confirmată',P_DELIVERED:'Livrat',P_FEEDBACK:'Feedback în așteptare',P_ISSUE:'Problemă în rezolvare',P_POST:'Clarificare post-livrare',P_CLIENT:'Client fără termen',P_PAUSE:'Pauză Produse',
 B_INITIAL:'Business conversațional',B_NATURAL:'Conversație naturală',B_OPPORTUNITY:'Oportunitate Business',B_INTEREST:'Interes Business',B_PRESENTATION:'Prezentare trimisă',B_PROPOSE:'Propunere întâlnire',B_MEETING:'Întâlnire programată',B_MISSED:'Întâlnire ratată',B_HELD:'Întâlnire efectuată',B_DECISION:'Decizie în așteptare',B_ENROLL:'Înscriere în așteptare',B_FINAL:'Ultima întâlnire de decizie',B_CLOSED:'Business închis',B_PARTNER:'Înscriere finalizată · Partener',B_AGREED:'Amânare convenită',P3R:'Pauză Business · revenire în 3 luni',P2R:'Pauză Business · revenire în 2 luni',P2M:'Pauză Business · observare Produse',PINF:'Pauză Business fără termen',PINFB:'Pauză fără termen · prioritate Business'
};
export type Action = {id:string; kind:string; label:string; due:string; dueAt?:string; source:string; step:number; channelId:string; first?:boolean; status:'OPEN'|'COMPLETED'|'CANCELLED'; cancelReason?:string; completedAt?:string};
export type Track = {state:string; action?:Action; pauseId?:string; source?:string; observation?:boolean; solution?:string; issue?:string};
export type Contact = {id:string; version:number; name:string; platform:string; url:string; channelId:string; phone:string; city:string; address:string; createdAt:string; connectionConfirmedAt:string; intake:'INCOMPLETE'|'COMPLETE'; origin?:string; originPlatform?:string; reason?:string; reasonOther?:string; approach?:string; analysis?:boolean; blocked?:boolean; blockedReason?:string; tracks:Partial<Record<Direction,Track>>; history:any[]; notes:any[]; actions:Action[]; messages:any[]; pauses:any[]; signals:any[]; meetings:any[]; receipts:Record<string,string>};
export type Field = {key:string; label:string; type?:string; options?:string[]; optional?:boolean};
export type Option = {id:string; label:string; fields?:Field[]; incoming?:boolean};
export function today(now = new Date()){return new Intl.DateTimeFormat('en-CA',{timeZone:TIMEZONE,year:'numeric',month:'2-digit',day:'2-digit'}).format(now)}
export function addDays(date:string,n:number){const d=new Date(date+'T12:00:00Z'); d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)}
export function addMonths(date:string,n:number){const d=new Date(date+'T12:00:00Z'),day=d.getUTCDate();d.setUTCDate(1);d.setUTCMonth(d.getUTCMonth()+n);const last=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,0)).getUTCDate();d.setUTCDate(Math.min(day,last));return d.toISOString().slice(0,10)}
export function localInstant(date:string,time:string){const desired=Date.parse(date+'T'+time+':00Z');let candidate=desired;for(let i=0;i<3;i++){const p=new Intl.DateTimeFormat('sv-SE',{timeZone:TIMEZONE,dateStyle:'short',timeStyle:'medium'}).format(new Date(candidate));candidate+=desired-Date.parse(p.replace(' ','T')+'Z')}return new Date(candidate).toISOString()}
export function bucket(a:Action,now=new Date()){if(a.dueAt)return new Date(a.dueAt)<now?'overdue':a.due===today(now)?'today':'future';return a.due<today(now)?'overdue':a.due===today(now)?'today':'future'}
function req(x:any,m:string):asserts x {if(!x)throw new Error(m)}
const field=(key:string,label:string,type='text',options?:string[]):Field=>({key,label,type,options});
const dateField=field('date','Data convenită','date');
const meetingFields=[dateField,field('time','Ora convenită','time'),field('channel','Unde are loc întâlnirea?')];
const O=(id:string,label:string,fields:Field[]=[],incoming=true):Option=>({id,label,fields,incoming});
const refusal=O('refuse','Nu mai dorește / refuz explicit');
const questions=O('questions','Are întrebări');
const meet=O('meeting','Acceptă întâlnirea',meetingFields);
const info=O('info','Cere informații / prezentarea');
const no=O('silence','Nu a răspuns',[{...field('seen','Vizibilitatea mesajului (dacă este observabilă)','select',['Văzut','Nevăzut','Nu pot determina']),optional:true}],false);
const postpone=O('postpone','Amână până la o dată convenită',[dateField,field('context','Motiv / context')]);
function responseOptions(s:string):Option[]{
 switch(s){
 case 'P_INITIAL':return [O('info','Dorește detalii despre produs'),refusal];
 case 'P_INFO':case 'P_CLARIFY':return [questions,O('buy','Dorește produsul'),refusal];
 case 'P_PRICE':return [O('cod_refused','Excepție: colet ramburs refuzat',[field('context','Motivul blocării definitive')]),O('paid','Plata a fost încasată',[field('payment','Confirmare plată și expediere')]),refusal];
 case 'P_FEEDBACK':return [O('positive','Totul este în regulă, fără alte nevoi'),questions,O('issue','Problemă / feedback negativ',[field('context','Problema concretă')])];
 case 'B_INITIAL':return [O('natural','A început o conversație naturală'),O('interested','A exprimat interes Business'),refusal];
 case 'B_OPPORTUNITY':return [O('interested','Este interesat de Business'),refusal];
 case 'B_INTEREST':return [info,meet,refusal];
 case 'B_PRESENTATION':case 'B_PROPOSE':return [questions,O('ack','Confirmă, fără întrebări'),meet,refusal];
 case 'B_MISSED':return [meet,O('reschedule','Nu poate momentan · reprogramare',meetingFields),refusal];
 case 'B_HELD':return [O('thinking','Se mai gândește'),O('enroll','Dorește să se înscrie',[dateField]),refusal];
 case 'B_DECISION':return [O('enroll','A decis să se înscrie',[dateField]),O('thinking_date','Încă se gândește',[dateField]),refusal];
 case 'B_ENROLL':return [O('email','Înscriere confirmată prin email Forever',[field('proof','Referința emailului Forever')]),O('enroll_date','Continuă · termen concret',[dateField,field('context','Blocajul clarificat / soluția convenită')]),O('no_date','Refuză orice termen concret'),refusal,O('pattern','Declară pattern repetat de amânare',[field('context','Contextul pattern-ului observat')])];
 case 'B_AGREED':return [info,meet,O('interested','Confirmă interesul'),postpone,refusal];
 default:return [];
 }
}
export function options(c:Contact,dir:Direction,now=new Date()):Option[]{
 if(c.blocked||c.intake!=='COMPLETE')return []; const t=c.tracks[dir];if(!t)return dir==='Produse'?[O('context','Inițiază contactare Produse',[field('context','Contextul concret al contactării')],false)]:[];
 const a=t.action,s=t.state;
 if(s==='B_PARTNER')return [];
 if(s==='B_CLOSED')return [O('direct_return','Persoana revine hotărâtă să se înscrie',[field('context','Inițiativa persoanei'),dateField])];
 if(['P_CLIENT','P_PAUSE','PINF','PINFB'].includes(s)&&!a)return [O('context','Inițiază contactare contextuală',[field('context','Contextul concret al contactării')],false),...responseOptions(s==='P_CLIENT'?'P_FEEDBACK':t.source||(dir==='Produse'?'P_INITIAL':'B_OPPORTUNITY'))];
 if(s==='P2M'&&!a){const p=c.pauses.find(x=>x.id===t.pauseId);return [O('signal','Înregistrează un semnal',[field('signal','Tipul semnalului','select',['Story văzut','Like','Comentariu','Mesaj primit','Altul']),{...field('context','Context (obligatoriu pentru Altul)'),optional:true}],false),...(p?.until<=today(now)?c.signals.filter(x=>x.pauseId===p.id&&x.evaluation===undefined).map(x=>O('evaluate:'+x.id,'Evaluează: '+x.type,[field('evaluation','Semnal suficient de puternic?','select',['Da','Nu']),{...field('decision','Consideri potrivită o invitație Business?','select',['Da','Nu']),optional:true}],false)):[]),...responseOptions(t.source||'B_OPPORTUNITY')]}
 if(['P3R','P2R'].includes(s)&&a?.kind==='reactivate')return [O('sent','Mesaj de reactivare trimis',[],false),...responseOptions(t.source||'B_INTEREST')];
 if(a?.kind==='reactivation_wait')return [info,meet,O('interested','Răspunde pozitiv · interes Business'),postpone,O('no_date','„Revin eu”, fără dată'),refusal,no];
 if(a?.kind==='send')return [O('sent',a.first?'Primul mesaj a fost trimis':'Mesaj trimis',a.first?[field('message','Textul exact al primului mesaj','textarea')]:a.source==='P_PRICE'?[field('shipping','Prețul și detaliile expedierii')]:[],false),...(!a.first&&['B_ENROLL','B_DECISION','B_AGREED','B_MISSED'].includes(a.source)?responseOptions(a.source):[])];
 if(a?.kind==='followup')return [O('sent','Follow-up trimis',[],false),...responseOptions(a.source)];
 if(a?.kind==='followup_wait'||a?.kind==='wait')return [...responseOptions(a.source),no];
 if(s==='B_NATURAL')return [O('continue','Conversația continuă',[],false),O('end','Conversația s-a încheiat',[],false),O('interested','A exprimat interes Business')];
 if(s==='B_MEETING') {const m=c.meetings.find(x=>x.status==='Scheduled'||x.status==='Confirmed');return [O('reschedule','Reprogramează întâlnirea',meetingFields),...(m&&m.at<=now.toISOString()?[O('held','Întâlnirea a avut loc',[],false),O('missed','Întâlnirea nu a avut loc',[],false)]:a?.kind==='meeting'?[O('confirmed','A confirmat întâlnirea'),O('unconfirmed','Nu a răspuns la reconfirmare',[],false)]:a?.kind==='meeting_final'?[O('confirmed','A confirmat întâlnirea'),O('final_reminder','Am trimis reconfirmarea finală',[],false)]:[]),refusal]}
 if(s==='P_PAID')return [O('delivered','Produsul a fost livrat',[field('date','Data livrării','date')],false),O('cod_refused','Excepție: colet ramburs refuzat',[field('context','Motivul blocării definitive')],false)];
 if(s==='P_ISSUE')return [O('solution','Stabilește soluția',[field('solution','Tipul soluției','select',['Remediere','Produs nou','Refund']),field('context','Cauza și soluția concretă'),{...dateField,optional:true}],false),...(t.solution?[O('resolved','Problema a fost rezolvată',[field('context','Cum a fost rezolvată?')],false)]:[])];
 if(s==='P_POST')return [O('clarified','Informațiile au fost clarificate',[],false),O('issue','A apărut o problemă',[field('context','Problema concretă')])];
 if(s==='B_FINAL')return [O('final_meeting','Programează ultima întâlnire de decizie',meetingFields,false),...(c.meetings.some(m=>m.final&&m.status==='Scheduled'&&m.at<=now.toISOString())?[O('yes','Decizie DA · se înscrie',[dateField]),O('no','Decizie NU · închide Business')]:[])];
 return responseOptions(s);
}
function history(c:Contact,label:string,metadata:any={},dir?:Direction){c.history.push({id:crypto.randomUUID(),at:new Date().toISOString(),label,direction:dir,...metadata})}
function action(c:Contact,dir:Direction,kind:string,label:string,due:string,source?:string,step=0,first=false,dueAt?:string){const t=c.tracks[dir]!;req(!t.action,'Există deja o acțiune deschisă pe această direcție.');t.action={id:crypto.randomUUID(),kind,label,due,source:source||t.state,step,first,channelId:c.channelId,status:'OPEN',dueAt}}
function close(c:Contact,dir:Direction,cancelReason?:string){const t=c.tracks[dir];if(t?.action){c.actions.push({...t.action,status:cancelReason?'CANCELLED':'COMPLETED',cancelReason,completedAt:new Date().toISOString()});delete t.action}}
function move(c:Contact,dir:Direction,s:string,kind?:string,label?:string,due=today(),source?:string){const t=c.tracks[dir]||{state:s};c.tracks[dir]=t;if(['P_CLIENT','P_PAUSE'].includes(s)&&t.state!==s)t.source=t.state;t.state=s;if(kind)action(c,dir,kind,label||states[s],due,source||s)}
function pause(c:Contact,dir:Direction,s:string,now=new Date()){const t=c.tracks[dir]!;const source=t.state;const id=crypto.randomUUID();const until=['P3R','P2R','P2M'].includes(s)?addMonths(today(now),s==='P3R'?3:2):undefined;t.source=source;t.state=s;t.pauseId=id;t.observation=true;c.pauses.push({id,direction:dir,code:s,startedAt:now.toISOString(),until,source});if(s==='P3R'||s==='P2R')action(c,dir,'reactivate','Reia conversația Business',until!,source)}
function finishPause(c:Contact,t:Track,reason:string){if(t.pauseId){const p=c.pauses.find(x=>x.id===t.pauseId);if(p&&!p.endedAt){p.endedAt=new Date().toISOString();p.endReason=reason}delete t.pauseId}}
function scheduleMeeting(c:Contact,f:any,final=false){const at=localInstant(f.date,f.time);req(at>new Date().toISOString(),'Alege o dată și o oră viitoare.');for(const m of c.meetings){if(['Scheduled','Confirmed'].includes(m.status)){m.status='Rescheduled';m.rescheduledAt=new Date().toISOString()}}const m={id:crypto.randomUUID(),at,timezone:TIMEZONE,channel:f.channel,status:'Scheduled',final};c.meetings.push(m);move(c,'Business',final?'B_FINAL':'B_MEETING');const dueAt=new Date(Date.parse(at)-3600000).toISOString();action(c,'Business',final?'final_meeting':'meeting',final?'Ultima întâlnire de decizie':'Reconfirmă întâlnirea',today(new Date(dueAt)),final?'B_FINAL':'B_MEETING',0,false,dueAt)}
export function validateUrl(url:string){try{const u=new URL(url);return ['https:','http:'].includes(u.protocol)}catch{return false}}
export function createContact(id:string,f:any):Contact{req(f.name?.trim(),'Numele este obligatoriu.');req(platforms.includes(f.platform),'Alege platforma.');req(validateUrl(f.url),'Introdu un link complet și utilizabil (https://…).');req(f.connected===true,'Confirmă conectarea reciprocă.');const now=new Date().toISOString();const c:Contact={id,version:1,name:f.name.trim(),platform:f.platform,url:f.url.trim(),phone:f.phone||'',city:f.city||'',address:f.address||'',channelId:crypto.randomUUID(),createdAt:now,connectionConfirmedAt:now,intake:'INCOMPLETE',tracks:{},history:[],notes:[],actions:[],messages:[],pauses:[],signals:[],meetings:[],receipts:{}};history(c,'Persoană adăugată · configurare incompletă');return c}
export function apply(c:Contact,command:string,f:any,dir?:Direction,now=new Date()):Contact{
 const date=today(now);
 if(command==='intake'){req(c.intake==='INCOMPLETE','Configurarea este deja încheiată.');req(platforms.includes(f.originPlatform)&&f.origin?.trim(),'Completează platforma și contextul originii.');req(f.analysis===true,'Confirmă analiza profilului.');req(reasons.includes(f.reason),'Alege motivul.');if(f.reason==='Altul')req(f.reasonOther?.trim(),'Descrie motivul.');const approach=f.reason===reasons[0]?'Produse':f.approach;req(['Produse','Business direct','Business conversațional'].includes(approach)&& (f.reason===reasons[0]||approach!=='Produse'),'Alege abordarea Business.');Object.assign(c,{intake:'COMPLETE',originPlatform:f.originPlatform,origin:f.origin,reason:f.reason,reasonOther:f.reasonOther,approach,analysis:true});if(f.analysisNote?.trim())c.notes.push({id:crypto.randomUUID(),at:now.toISOString(),text:f.analysisNote,scope:'Analiză profil'});const d:Direction=approach==='Produse'?'Produse':'Business';const s=approach==='Produse'?'P_INITIAL':approach==='Business direct'?'B_OPPORTUNITY':'B_INITIAL';move(c,d,s);action(c,d,'send',approach==='Produse'?'Trimite primul mesaj Produse':approach==='Business direct'?'Trimite oportunitatea Business':'Trimite deschiderea conversațională',date,s,0,true);history(c,'Origine și abordare completate',{approach},d);return c}
 if(command==='note'){req(f.text?.trim(),'Scrie nota înainte de salvare.');c.notes.push({id:crypto.randomUUID(),at:now.toISOString(),text:f.text.trim(),direction:dir,state:dir?c.tracks[dir]?.state:undefined,actionId:dir?c.tracks[dir]?.action?.id:undefined});history(c,'Notă adăugată',{},dir);return c}
 if(command==='edit'){req(f.name?.trim(),'Numele este obligatoriu.');Object.assign(c,{name:f.name.trim(),phone:f.phone||'',city:f.city||'',address:f.address||''});history(c,'Date personale actualizate');return c}
 req(dir==='Business'||dir==='Produse','Alege direcția conversației.');
 const opt=options(c,dir,now).find(x=>x.id===command);req(opt,'Rezultatul nu este valid în starea curentă.');for(const ff of opt!.fields||[]){if(!ff.optional)req(typeof f[ff.key]==='string'&&f[ff.key].trim(),`Completează: ${ff.label}`);if(ff.options&&f[ff.key])req(ff.options.includes(f[ff.key]),'Opțiune invalidă.');if(ff.type==='date'&&f[ff.key])req(/^\d{4}-\d{2}-\d{2}$/.test(f[ff.key])&&!isNaN(Date.parse(f[ff.key]+'T12:00Z')),'Dată invalidă.')}
 if(f.date&&command!=='delivered')req(f.date>=date,'Termenul convenit nu poate fi în trecut.');
 let t=c.tracks[dir];const before=t?.state;const old=t?.action;
 if(old&&!opt!.incoming&&bucket(old,now)==='future')throw new Error('Acțiunea nu este încă scadentă. Poți înregistra un răspuns primit înainte de termen.');
 if(command==='signal'){if(f.signal==='Altul')req(f.context?.trim(),'Contextul este obligatoriu pentru Altul.');c.signals.push({id:crypto.randomUUID(),pauseId:t!.pauseId,type:f.signal,context:f.context,observedAt:now.toISOString()});history(c,opt!.label,{type:f.signal,context:f.context},dir);return c}
 if(command.startsWith('evaluate:')){const sig=c.signals.find(x=>x.id===command.slice(9)&&x.pauseId===t!.pauseId);req(sig&&sig.evaluation===undefined,'Semnal deja evaluat sau episod expirat.');if(f.evaluation==='Da')req(['Da','Nu'].includes(f.decision),'Decide explicit dacă invitația este potrivită.');sig.evaluation=f.evaluation;sig.evaluatedAt=now.toISOString();sig.decision=f.decision;history(c,opt!.label,{evaluation:f.evaluation,decision:f.decision,signalId:sig.id},dir);if(f.evaluation==='Da'&&f.decision==='Da'){action(c,dir,'send','Trimite invitația Business',date,'B_OPPORTUNITY');}return c}
 if(command==='continue'){history(c,opt!.label,{},dir);return c}
 close(c,dir,command==='reschedule'?'rescheduled':opt!.incoming&&old&&['wait','followup','followup_wait','reactivate'].includes(old.kind)?'response_received':undefined);
 if(!t){t={state:'P_PAUSE'};c.tracks[dir]=t}
 if(opt!.incoming&&!['refuse','no_date'].includes(command))finishPause(c,t,'response_received');
 if(command==='context'){req(!c.blocked,'Contact blocat.');action(c,dir,'send',dir==='Produse'?'Trimite mesajul contextual Produse':'Trimite oportunitatea Business',date,dir==='Produse'?'P_INITIAL':'B_OPPORTUNITY');}
 else if(command==='sent'){
  req(old,'Acțiunea nu mai este deschisă.');const s=old!.source;
  if(old!.first)c.messages.push({id:crypto.randomUUID(),actionId:old!.id,channelId:old!.channelId,text:f.message,sentAt:now.toISOString(),first:true,reason:c.reason,approach:c.approach});
  if(old!.kind==='reactivate')action(c,dir,'reactivation_wait','Verifică răspunsul la reactivare',addDays(date,1),s);
  else if(old!.kind==='followup'){const delay=s==='B_INITIAL'?7:['B_PRESENTATION','B_PROPOSE'].includes(s)&&old!.step===1?2:1;action(c,dir,'followup_wait','Verifică răspunsul după follow-up',addDays(date,delay),s,old!.step)}
  else {finishPause(c,t,'invitation_sent');t.state=s;const delay=dir==='Produse'||s==='B_MISSED'?1:2;if(s==='P_FEEDBACK')action(c,dir,'wait','Înregistrează feedbackul primit',date,s);else action(c,dir,'wait','Verifică răspunsul',addDays(date,delay),s);}
 }
 else if(command==='silence'){
  req(old&&bucket(old,now)!=='future','Termenul de așteptare nu a expirat.');const s=old!.source;
  if(old!.kind==='reactivation_wait')pause(c,dir,'PINF',now);
  else if(s==='P_FEEDBACK')move(c,dir,'P_CLIENT');
  else if(old!.kind==='followup_wait'){
   if(dir==='Produse')move(c,dir,'P_PAUSE');
   else if(s==='B_INITIAL')move(c,dir,'B_OPPORTUNITY','send','Trimite oportunitatea Business',date);
   else if(s==='B_OPPORTUNITY')pause(c,dir,'P3R',now);
   else if(['B_PRESENTATION','B_PROPOSE'].includes(s)&&old!.step===1)action(c,dir,'followup','Trimite al doilea follow-up',date,s,2);
   else if(['B_PRESENTATION','B_PROPOSE'].includes(s))pause(c,dir,'P2R',now);
   else if(s==='B_AGREED')pause(c,dir,'PINF',now);
   else pause(c,dir,'P2M',now);
  }else if(s==='B_MISSED')pause(c,dir,'P2M',now);
  else action(c,dir,'followup','Trimite follow-up contextual',date,s,1);
 }
 else if(command==='refuse'){for(const m of c.meetings)if(dir==='Business'&&['Scheduled','Confirmed'].includes(m.status))m.status='Cancelled';if(dir==='Produse')move(c,dir,'P_PAUSE');else pause(c,dir,old?.kind==='reactivation_wait'?'PINF':'P2M',now)}
 else if(command==='info'){const s=dir==='Produse'?'P_INFO':'B_PRESENTATION';action(c,dir,'send',dir==='Produse'?'Trimite informațiile despre produs':'Trimite prezentarea Business',date,s)}
 else if(command==='questions'){if(dir==='Produse'){if(['P_FEEDBACK','P_CLIENT'].includes(t.state))move(c,dir,'P_POST','work','Clarifică informațiile post-livrare');else move(c,dir,'P_CLARIFY','send','Răspunde întrebărilor despre produs',date)}else move(c,dir,'B_PROPOSE','send','Propune o întâlnire pentru clarificări',date)}
 else if(command==='buy')action(c,dir,'send','Comunică prețul și stabilește expedierea',date,'P_PRICE');
 else if(command==='paid')move(c,dir,'P_PAID','delivery','Confirmă livrarea când produsul ajunge',date);
 else if(command==='delivered'){req(f.date<=date,'Livrarea nu poate fi în viitor.');move(c,dir,'P_DELIVERED','send','Cere feedback despre produs',addDays(f.date,3),'P_FEEDBACK')}
 else if(command==='positive'||command==='clarified'||command==='resolved')move(c,dir,'P_CLIENT');
 else if(command==='issue'){move(c,dir,'P_ISSUE','work','Identifică și soluționează problema',date);t.issue=f.context;delete t.solution}
 else if(command==='solution'){t.solution=f.solution;t.issue=f.context;action(c,dir,'work','Aplică soluția și confirmă rezolvarea',f.date||date)}
 else if(command==='cod_refused'){c.blocked=true;c.blockedReason=f.context;close(c,'Business','blocked');close(c,'Produse','blocked');for(const m of c.meetings)if(['Scheduled','Confirmed'].includes(m.status))m.status='Cancelled'}
 else if(command==='natural')move(c,dir,'B_NATURAL','work','Continuă conversația naturală');
 else if(command==='end')move(c,dir,'B_OPPORTUNITY','send','Trimite oportunitatea Business',addDays(date,7));
 else if(command==='interested')move(c,dir,'B_INTEREST','work','Clarifică: prezentare sau întâlnire');
 else if(command==='ack')move(c,dir,'B_PROPOSE','send','Propune întâlnirea / clarifică',date);
 else if(command==='meeting'||command==='reschedule'||command==='final_meeting')scheduleMeeting(c,f,command==='final_meeting');
 else if(command==='confirmed'||command==='unconfirmed'||command==='final_reminder'){const m=c.meetings.find(x=>['Scheduled','Confirmed'].includes(x.status));req(m,'Întâlnire negăsită.');if(command==='confirmed')m.status='Confirmed';action(c,dir,command==='unconfirmed'?'meeting_final':'meeting_outcome',command==='unconfirmed'?'Reconfirmare finală · cu câteva minute înainte':'Confirmă rezultatul întâlnirii',today(new Date(m.at)),'B_MEETING',0,false,command==='unconfirmed'?undefined:m.at)}
 else if(command==='held'||command==='missed'){const m=c.meetings.find(x=>['Scheduled','Confirmed'].includes(x.status));req(m&&m.at<=now.toISOString(),'Confirmarea este disponibilă după ora întâlnirii.');m.status=command==='held'?'Completed':'Missed';move(c,dir,command==='held'?'B_HELD':'B_MISSED',command==='held'?'work':'send',command==='held'?'Înregistrează concluzia întâlnirii':'Revino după întâlnirea ratată',command==='held'?date:addDays(date,1))}
 else if(command==='thinking')move(c,dir,'B_DECISION','send','Revino pentru decizie',addDays(date,2));
 else if(command==='thinking_date')move(c,dir,'B_DECISION','send','Revino la termenul convenit',f.date);
 else if(['enroll','enroll_date','yes','direct_return'].includes(command)){if(command==='yes')for(const m of c.meetings)if(m.final&&m.status==='Scheduled')m.status='Completed';move(c,dir,'B_ENROLL','send','Verifică înscrierea / clarifică blocajul',f.date);}
 else if(command==='email')move(c,dir,'B_PARTNER');
 else if(command==='postpone')move(c,dir,'B_AGREED','send','Revino la data convenită',f.date);
 else if(command==='no_date')pause(c,dir,old?.kind==='reactivation_wait'?'PINFB':'P2M',now);
 else if(command==='pattern')move(c,dir,'B_FINAL','work','Stabilește ultima întâlnire de decizie');
 else if(command==='no'){move(c,dir,'B_CLOSED');t.observation=true;for(const m of c.meetings)if(m.final&&m.status==='Scheduled')m.status='Completed'}
 else throw new Error('Acțiune neimplementată.');
 history(c,opt!.label,{before,after:t.state,fields:f,actionId:old?.id},dir);return c;
}
export function stage(t:Track){if(t.action?.kind==='followup'||t.action?.kind==='followup_wait')return t.action.source.startsWith('P_')?'Follow-up Produse':t.action.source==='B_INITIAL'?'Follow-up conversațional':'Follow-up Business';if(t.action?.kind==='reactivate'||t.action?.kind==='reactivation_wait')return 'Reactivare Business';return states[t.state]||t.state}
