const URL_BASE = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const allowedOrigins = new Set(['https://survey.zanzibaba.com','https://zanzibaba-survey.vercel.app','http://127.0.0.1:8765']);
const kinds = new Set(['visit','profile_saved','cv_generated','letter_generated','print_cv_opened','print_letter_opened','email_clicked','share_clicked','app_installed']);
async function digest(value: string) { return [...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))].map(x=>x.toString(16).padStart(2,'0')).join(''); }
async function rpc(name: string, args: Record<string,unknown>) {
 const response = await fetch(URL_BASE+'/rest/v1/rpc/'+name,{method:'POST',headers:{'apikey':SERVICE_KEY,'Authorization':'Bearer '+SERVICE_KEY,'Content-Type':'application/json'},body:JSON.stringify(args)});
 const data = await response.json();
 if (!response.ok) { const error = new Error(data.code === '28000' ? 'unauthorized' : 'database'); throw error; }
 return data;
}
Deno.serve(async request => {
 const origin = request.headers.get('Origin') || '';
 const headers = {'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'authorization,apikey,content-type','Access-Control-Allow-Methods':'POST,OPTIONS','Vary':'Origin','Cache-Control':'no-store','Content-Type':'application/json; charset=utf-8'};
 const answer = (status: number, data: unknown) => new Response(JSON.stringify(data),{status,headers});
 if (!allowedOrigins.has(origin)) return new Response('Forbidden',{status:403});
 if (request.method === 'OPTIONS') return new Response(null,{status:204,headers});
 if (request.method !== 'POST') return answer(405,{error:'Method not allowed'});
 try {
  if (Number(request.headers.get('Content-Length') || '0') > 4096) return answer(413,{error:'Request too large'});
  const raw = await request.text(); if (new TextEncoder().encode(raw).length > 4096) return answer(413,{error:'Request too large'});
  const body = JSON.parse(raw);
  if (!body || typeof body !== 'object' || Array.isArray(body)) return answer(400,{error:'Invalid request'});
  if (body.action === 'dashboard') {
   if (Object.keys(body).some(k=>!['action','adminKey','days','offset'].includes(k))) return answer(400,{error:'Unexpected fields'});
   if (typeof body.adminKey !== 'string' || body.adminKey.length < 40 || body.adminKey.length > 100) return answer(401,{error:'Unauthorized'});
   if (![1,7,30,90,365].includes(body.days) || !Number.isInteger(body.offset) || body.offset < 0 || body.offset > 100000) return answer(400,{error:'Invalid range'});
   return answer(200,await rpc('laris_usage_dashboard',{p_key_hash:await digest(body.adminKey),p_days:body.days,p_offset:body.offset}));
  }
  if (typeof body.visitorToken !== 'string' || !/^[0-9a-f]{64}$/.test(body.visitorToken)) return answer(400,{error:'Invalid device token'});
  const visitor = await digest(body.visitorToken);
  if (body.action === 'consent') {
   if (Object.keys(body).some(k=>!['action','visitorToken','consent','name'].includes(k))) return answer(400,{error:'Unexpected fields'});
   if (typeof body.consent !== 'boolean' || (body.consent && (typeof body.name !== 'string' || !body.name.trim() || body.name.trim().length > 200)) || (!body.consent && body.name != null)) return answer(400,{error:'Invalid consent'});
   await rpc('laris_set_name_consent',{p_visitor:visitor,p_consent:body.consent,p_name:body.consent ? body.name.trim() : null});
   return answer(200,{ok:true});
  }
  if (body.action !== 'record' || Object.keys(body).some(k=>!['action','visitorToken','eventId','eventType','documentLanguage','deviceType'].includes(k))) return answer(400,{error:'Unexpected fields'});
  if (!kinds.has(body.eventType) || typeof body.eventId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.eventId) || !['sw','en'].includes(body.documentLanguage) || !['mobile','tablet','desktop'].includes(body.deviceType)) return answer(400,{error:'Invalid event'});
  const ok = await rpc('laris_record_usage',{p_visitor:visitor,p_event:body.eventId,p_kind:body.eventType,p_language:body.documentLanguage,p_device:body.deviceType});
  return answer(ok ? 200 : 429,{ok});
 } catch (error) { return answer(error instanceof Error && error.message === 'unauthorized' ? 401 : error instanceof SyntaxError ? 400 : 503,{error:error instanceof Error && error.message === 'unauthorized' ? 'Unauthorized' : 'Request could not be processed'}); }
});
