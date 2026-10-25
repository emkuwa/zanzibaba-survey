'use strict';
(() => {
 const get = id => document.getElementById(id), config = globalThis.LARIS_METRICS;
 let language = 'sw', adminKey = '', report = null, offset = 0, loading = false;
 const translations = [...document.querySelectorAll('[data-en]')].map(el=>[el,el.textContent,el.dataset.en]);
 const t = (sw,en) => language === 'sw' ? sw : en;
 function node(tag,text,className) { const el = document.createElement(tag); el.textContent = text; if (className) el.className=className; return el; }
 const number = value => new Intl.NumberFormat(language === 'sw' ? 'sw-TZ' : 'en-GB').format(Number(value||0));
 const date = value => value ? new Intl.DateTimeFormat(language === 'sw' ? 'sw-TZ' : 'en-GB',{dateStyle:'medium',timeStyle:'short',timeZone:'Africa/Dar_es_Salaam'}).format(new Date(value)) : '—';
 function setLanguage(lang) { language=lang; document.documentElement.lang=lang;translations.forEach(([el,sw,en])=>el.textContent=t(sw,en));get('sw').setAttribute('aria-pressed',String(lang==='sw'));get('en').setAttribute('aria-pressed',String(lang==='en'));if(report)render(); }
 get('sw').onclick=()=>setLanguage('sw');get('en').onclick=()=>setLanguage('en');
 function render() {
  const totals = Object.fromEntries(report.totals.map(row=>[row.event_type,row]));
  const cards = [
   [t('Vifaa vilivyotumia','Devices that used it'),report.devices,t('Makadirio ya browser tofauti','Estimated distinct browsers')],
   [t('CV zilizotengenezwa','CVs generated'),totals.cv_generated?.actions,t('Vifaa: ','Devices: ')+number(totals.cv_generated?.devices)],
   [t('Barua zilizotengenezwa','Letters generated'),totals.letter_generated?.actions,t('Vifaa: ','Devices: ')+number(totals.letter_generated?.devices)],
   [t('Hifadhi za profile','Profile save actions'),totals.profile_saved?.actions,t('Hifadhi zilizobonyezwa; si autosave','Explicit saves; excludes autosave')],
   [t('Fungua Print / PDF','Print / PDF opens'),Number(totals.print_cv_opened?.actions||0)+Number(totals.print_letter_opened?.actions||0),t('CV na barua; si uthibitisho wa download','CV and letter; not verified downloads')],
   [t('Bofya email','Email clicks'),totals.email_clicked?.actions,t('Si maombi yaliyothibitishwa kutumwa','Not verified applications sent')],
   [t('Bofya kushare','Share clicks'),totals.share_clicked?.actions,t('Kitufe cha kushare kilibonyezwa','Share button was tapped')],
   [t('App zilizowekwa','App installations reported'),totals.app_installed?.actions,t('Zinazoripotiwa na browser inayounga mkono','Reported by supporting browsers')]
  ];
  get('metrics').replaceChildren(...cards.map(([title,value,note])=>{const el=node('div','','metric');el.append(node('span',title),node('strong',number(value)),node('small',note));return el}));
  get('updated').textContent=t('Imesasishwa: ','Updated: ')+date(report.generated_at);
  get('started').textContent=t('Taarifa ya kwanza iliyopokelewa: ','First report received: ')+date(report.started_at);
  get('people-count').textContent=number(report.named_count)+t(' wenye ridhaa kwenye kipindi hiki.',' consenting people/devices in this period.');
  get('people').replaceChildren(...report.people.map(person=>{const row=document.createElement('tr');row.append(node('td',person.display_name,'name'),node('td',number(person.cvs)),node('td',number(person.letters)),node('td',number(person.profiles)),node('td',number(Number(person.cv_prints)+Number(person.letter_prints))),node('td',number(person.email_clicks)),node('td',date(person.last_report),'time'));return row}));
  get('empty-people').hidden=report.people.length>0;
  get('page-info').textContent=report.named_count ? number(offset+1)+'–'+number(offset+report.people.length)+' / '+number(report.named_count) : '0';
  get('previous').disabled=offset===0;get('next').disabled=offset+50>=report.named_count;get('export-csv').disabled=report.people.length===0;
  const peak=Math.max(1,...report.daily.map(row=>Number(row.devices)));
  get('daily').replaceChildren(...report.daily.map(day=>{const row=document.createElement('tr');const count=node('td',number(day.devices));const bar=node('span','','daily-bar');bar.style.width=(Number(day.devices)/peak*100)+'%';count.append(bar);row.append(node('td',day.day),count,node('td',number(day.cvs)),node('td',number(day.letters)));return row}));
 }
 async function load() {
  if(loading)return false;loading=true;get('login-button').disabled=true;get('dashboard').setAttribute('aria-busy','true');get('refresh').disabled=true;
  get('login-status').textContent='';get('report-status').textContent=t('Inapakia…','Loading…');
  try {
   const response=await fetch(config.endpoint,{method:'POST',cache:'no-store',headers:{'apikey':config.key,'Authorization':'Bearer '+config.key,'Content-Type':'application/json'},body:JSON.stringify({action:'dashboard',adminKey,days:Number(get('days').value),offset}),signal:AbortSignal.timeout(15000)});
   if(response.status===401){logout();throw Error(t('Msimbo si sahihi.','The access code is incorrect.'))}
   if(!response.ok)throw Error(t('Takwimu hazijapatikana. Jaribu tena ukiwa na intaneti.','Could not load statistics. Retry when connected.'));
   report=await response.json();render();get('login').hidden=true;get('dashboard').hidden=false;get('report-status').textContent='';return true;
  }catch(error){const message=error.name==='TimeoutError'?t('Muunganisho umechukua muda mrefu. Jaribu tena.','Connection timed out. Try again.'):error.message;get(get('login').hidden?'report-status':'login-status').textContent=message;return false}
  finally{loading=false;get('login-button').disabled=false;get('refresh').disabled=false;get('dashboard').setAttribute('aria-busy','false')}
 }
 function logout(){adminKey='';report=null;offset=0;get('admin-code').value='';get('people').replaceChildren();get('daily').replaceChildren();get('metrics').replaceChildren();get('dashboard').hidden=true;get('login').hidden=false;get('admin-code').focus()}
 get('login-form').onsubmit=async event=>{event.preventDefault();adminKey=get('admin-code').value.trim();get('admin-code').value='';offset=0;await load()};
 get('logout').onclick=logout;get('refresh').onclick=load;get('days').onchange=()=>{offset=0;load()};get('previous').onclick=()=>{offset=Math.max(0,offset-50);load()};get('next').onclick=()=>{offset+=50;load()};
 get('export-csv').onclick=()=>{
  if(!report)return;
  const cell=value=>{let text=String(value??'');if(/^[=+@\-\t\r]/.test(text))text="'"+text;return '"'+text.replaceAll('"','""')+'"'};
  const rows=[['Name (unverified)','CV generated','Letter generated','Profile saved','CV print opened','Letter print opened','Email clicked','Last report UTC'],...report.people.map(p=>[p.display_name,p.cvs,p.letters,p.profiles,p.cv_prints,p.letter_prints,p.email_clicks,p.last_report])];
  const url=URL.createObjectURL(new Blob(['\ufeff'+rows.map(row=>row.map(cell).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download='laris-consented-usage.csv';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
})();
