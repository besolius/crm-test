import { db } from '@/lib/db';
import { apply,createContact,Contact,today } from '@/lib/engine';
export const dynamic='force-dynamic';
export async function GET(){try{const rows=await db().prepare('SELECT payload FROM contacts ORDER BY updated_at DESC').all<{payload:string}>();return Response.json({contacts:rows.results.map(r=>JSON.parse(r.payload)),today:today()},{headers:{'Cache-Control':'no-store'}})}catch(e){console.error(e);return Response.json({error:'Contactele nu au putut fi încărcate. Reîncearcă în câteva momente.'},{status:503})}}
export async function POST(request:Request){try{
 const origin=request.headers.get('origin');if(origin&&new URL(origin).host!==new URL(request.url).host)return Response.json({error:'Cerere nepermisă.'},{status:403});
 const b:any=await request.json();if(!b.commandId||typeof b.commandId!=='string'||b.commandId.length>100)throw new Error('Identificator comandă invalid.');
 const hash=JSON.stringify([b.command,b.fields,b.direction]);let c:Contact;
 if(b.command==='create'){
  c=createContact(b.commandId,b.fields||{});c.receipts[b.commandId]=hash;
  await db().prepare('INSERT INTO contacts (id,version,payload,updated_at) VALUES (?,?,?,?) ON CONFLICT(id) DO NOTHING').bind(c.id,c.version,JSON.stringify(c),new Date().toISOString()).run();
  const row=await db().prepare('SELECT payload FROM contacts WHERE id=?').bind(c.id).first<{payload:string}>();c=JSON.parse(row!.payload);if(c.receipts[b.commandId]!==hash)throw new Error('Identificator reutilizat pentru o altă comandă.');
 }else{
  const row=await db().prepare('SELECT payload FROM contacts WHERE id=?').bind(b.id).first<{payload:string}>();if(!row)return Response.json({error:'Contactul nu a fost găsit.'},{status:404});c=JSON.parse(row.payload);
  if(c.receipts[b.commandId]){if(c.receipts[b.commandId]!==hash)throw new Error('Identificator reutilizat.');return Response.json({contact:c})}
  if(c.version!==b.version)return Response.json({error:'Contactul a fost actualizat pe alt dispozitiv. Datele curente au fost reîncărcate; verifică rezultatul înainte de salvare.'},{status:409});
  c=apply(c,b.command,b.fields||{},b.direction);c.version++;c.receipts[b.commandId]=hash;
  const out=await db().prepare('UPDATE contacts SET payload=?,version=?,updated_at=? WHERE id=? AND version=?').bind(JSON.stringify(c),c.version,new Date().toISOString(),c.id,b.version).run();
  if(!out.meta.changes){const latest=await db().prepare('SELECT payload FROM contacts WHERE id=?').bind(c.id).first<{payload:string}>();const doc=JSON.parse(latest!.payload);if(doc.receipts[b.commandId]===hash)return Response.json({contact:doc});return Response.json({error:'Conflict de actualizare. Reîncarcă datele contactului.'},{status:409})}
 }
 return Response.json({contact:c});
 }catch(e){console.error(e);return Response.json({error:e instanceof Error?e.message:'Salvarea a eșuat. Reîncearcă.'},{status:400})}}
