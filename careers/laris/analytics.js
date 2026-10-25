'use strict';
(async () => {
 await window.larisAppReady;
 const config = globalThis.LARIS_METRICS;
 const get = id => document.getElementById(id);
 const KEYS = {token:'zanzibaba.laris.metrics.token.v1',prefs:'zanzibaba.laris.metrics.preferences.v1',queue:'zanzibaba.laris.metrics.queue.v1'};
 const kinds = new Set(['visit','profile_saved','cv_generated','letter_generated','print_cv_opened','print_letter_opened','email_clicked','share_clicked','app_installed']);
 function read(key,fallback) { try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback; } catch { return fallback; } }
 function write(key,value) { try { localStorage.setItem(key,JSON.stringify(value)); } catch { /* Core document tools remain available without analytics storage. */ } }
 let prefs = read(KEYS.prefs,{enabled:true,nameConsent:false,identityDirty:true});
 if (!prefs || typeof prefs.enabled !== 'boolean' || typeof prefs.nameConsent !== 'boolean') prefs = {enabled:true,nameConsent:false,identityDirty:true};
 let token = read(KEYS.token,'');
 if (typeof token !== 'string' || !/^[0-9a-f]{64}$/.test(token)) { const bytes = new Uint8Array(32); crypto.getRandomValues(bytes); token = [...bytes].map(b=>b.toString(16).padStart(2,'0')).join(''); write(KEYS.token,token); }
 let queue = read(KEYS.queue,[]);
 if (!Array.isArray(queue)) queue = [];
 queue = queue.filter(x=>x && kinds.has(x.eventType) && typeof x.eventId === 'string' && ['sw','en'].includes(x.documentLanguage) && ['mobile','tablet','desktop'].includes(x.deviceType)).slice(-200);
 if (!prefs.enabled) queue = [];
 if (!get('name').value.trim() && prefs.nameConsent) { prefs.nameConsent = false; prefs.identityDirty = true; }
 get('usage-analytics').checked = prefs.enabled; get('name-analytics').checked = prefs.nameConsent;
 let busy = false, retryTimer, delay = 2000, identityRevision = 0;
 function notice(sw,en) { get('analytics-status').textContent = document.documentElement.lang === 'en' ? en : sw; }
 function persist() { write(KEYS.prefs,prefs); write(KEYS.queue,queue); }
 async function send(body) {
  const controller = new AbortController(); const timeout = setTimeout(()=>controller.abort(),8000);
  try {
   const response = await fetch(config.endpoint,{method:'POST',mode:'cors',cache:'no-store',headers:{'Authorization':'Bearer '+config.key,'apikey':config.key,'Content-Type':'application/json'},body:JSON.stringify(body),signal:controller.signal});
   if (!response.ok) { const error = new Error('Analytics unavailable'); error.permanent = response.status === 400 || response.status === 413; throw error; }
  } finally { clearTimeout(timeout); }
 }
 async function flush() {
  if (busy) return; clearTimeout(retryTimer); retryTimer = undefined; busy = true;
  try {
   if (prefs.identityDirty) {
    const revision = identityRevision; const consent = prefs.enabled && prefs.nameConsent && !!get('name').value.trim();
    await send({action:'consent',visitorToken:token,consent,name:consent ? get('name').value.trim() : null});
    if (revision === identityRevision) prefs.identityDirty = false;
    persist();
   }
   while (prefs.enabled && queue.length) {
    const event = queue[0];
    try { await send({...event,action:'record',visitorToken:token}); }
    catch (error) { if (error.permanent) { queue.shift(); persist(); continue; } throw error; }
    // Opt-out can clear the queue while the request is in flight.
    queue = queue.filter(item=>item.eventId !== event.eventId); persist();
   }
   delay = 2000;
  } catch { clearTimeout(retryTimer); retryTimer = setTimeout(flush,delay); delay = Math.min(delay*2,60000); }
  finally { busy = false; if (prefs.identityDirty && !retryTimer) retryTimer = setTimeout(flush,500); }
 }
 function track(eventType) {
  if (!prefs.enabled || !kinds.has(eventType)) return;
  queue.push({eventId:crypto.randomUUID(),eventType,documentLanguage:typeof documentLanguage === 'string' ? documentLanguage : document.documentElement.lang === 'en' ? 'en' : 'sw',deviceType:window.innerWidth < 600 ? 'mobile' : window.innerWidth < 1000 ? 'tablet' : 'desktop'});
  queue = queue.slice(-200); persist(); flush();
 }
 window.larisTrack = track;
 window.addEventListener('laris:event',event=>track(event.detail.event));
 function consentChanged() {
  prefs.enabled = get('usage-analytics').checked;
  prefs.nameConsent = prefs.enabled && get('name-analytics').checked;
  if (prefs.nameConsent && !get('name').value.trim()) { prefs.nameConsent = false; notice('Jaza jina lako kwanza, kisha chagua ridhaa ya jina.','Enter your name first, then choose name consent.'); }
  if (!prefs.enabled) { queue = []; prefs.nameConsent = false; }
  get('name-analytics').checked = prefs.nameConsent;
  prefs.identityDirty = true; identityRevision++; persist(); clearTimeout(retryTimer); retryTimer = undefined; flush();
  if (!prefs.nameConsent) notice('Jina lako halitaonyeshwa kwenye dashboard. Ukiwa bila intaneti, kuondoa jina kutakamilika ukirudi mtandaoni.','Your name will not appear in the dashboard. If offline, name removal completes when you reconnect.');
  else notice('Umekubali kushiriki jina na hatua za matumizi. Nyaraka na mawasiliano yako havitumwi.','You agreed to share your name and usage steps. Documents and contact details are not sent.');
 }
 get('usage-analytics').onchange = consentChanged; get('name-analytics').onchange = consentChanged;
 let nameTimer;
 get('name').addEventListener('input',()=>{ if (prefs.nameConsent) { prefs.identityDirty = true; identityRevision++; persist(); clearTimeout(nameTimer); nameTimer = setTimeout(flush,700); } });
 window.addEventListener('applicantprofileloaded',()=>{ prefs.nameConsent = false; get('name-analytics').checked = false; prefs.identityDirty = true; identityRevision++; persist(); flush(); });
 window.addEventListener('online',()=>{clearTimeout(retryTimer);retryTimer=undefined;flush()});
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')flush()});
 let visited = false;
 try { visited = sessionStorage.getItem('zanzibaba.laris.metrics.visit.v1') === '1'; if (!visited) sessionStorage.setItem('zanzibaba.laris.metrics.visit.v1','1'); } catch { /* One visit for this page instance. */ }
 persist(); if (!visited) track('visit'); else flush();
})().catch(()=>{/* Analytics must never prevent applications or profile use. */});
