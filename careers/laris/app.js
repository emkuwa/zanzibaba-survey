'use strict';
(() => {
  const get = id => document.getElementById(id);
  const APP_URL = 'https://survey.zanzibaba.com/careers/laris/';
  const PROFILE_KEY = 'zanzibaba.laris.profile.v1';
  let activeStep = 1;
  let savedOnDevice = false;
  let savingTimer;
  let restoring = false;
  let installPrompt = null;
  let installed = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  function message(id, sw, en) { const text = document.documentElement.lang === 'en' ? en : sw; get(id).textContent = text; if (id === 'local-profile-status') get('form-profile-status').textContent = text; }
  function focusSection(el) { el.setAttribute('tabindex','-1'); el.focus({preventScroll:true}); el.scrollIntoView({block:'start'}); }
  function expandInvalidFields() {
    for (const input of get('applicant-form').querySelectorAll(':invalid')) {
      for (let parent = input.parentElement; parent && parent !== get('applicant-form'); parent = parent.parentElement) if (parent.tagName === 'DETAILS') parent.open = true;
    }
  }
  window.goStep = (step, focus = true) => {
    if (step === 2 && !get('cv-text').value.trim() && !get('letter-text').value.trim()) {
      window.goStep(1,false); expandInvalidFields(); get('applicant-form').requestSubmit(); return;
    }
    activeStep = step;
    get('share-help').hidden = true; get('install-help').hidden = true;
    get('my-profile').hidden = true;
    ['details','documents','apply'].forEach((id,index) => get(id).hidden = index+1 !== step);
    document.querySelectorAll('[data-step]').forEach(button => {
      if (Number(button.dataset.step) === step) button.setAttribute('aria-current','step'); else button.removeAttribute('aria-current');
    });
    const section = get(['details','documents','apply'][step-1]);
    history.replaceState(null,'','#'+section.id);
    if (focus) focusSection(section);
  };
  document.querySelectorAll('[data-step]').forEach(button => button.addEventListener('click',() => window.goStep(Number(button.dataset.step))));
  document.querySelectorAll('a[href="#details"],a[href="#documents"],a[href="#apply"]').forEach(link => link.addEventListener('click',event => { event.preventDefault(); window.goStep({'#details':1,'#documents':2,'#apply':3}[link.getAttribute('href')]); }));
  get('applicant-form').addEventListener('invalid',() => { if (activeStep !== 1) window.goStep(1,false); expandInvalidFields(); },true);
  document.querySelectorAll('[data-close-panel]').forEach(button => button.onclick = () => { get(button.dataset.closePanel).hidden = true; get(button.dataset.closePanel === 'share-help' ? 'share-app' : 'install-app').focus(); });
  get('open-profile').onclick = () => { get('my-profile').hidden = false; focusSection(get('my-profile')); };
  get('continue-profile').onclick = () => { window.goStep(1); get('name').focus(); };
  window.syncProfileView = () => {
    const name = get('name').value.trim();
    get('profile-name').textContent = name || (document.documentElement.lang === 'en' ? 'Start with your name below' : 'Anza kwa kujaza jina hapa chini');
    get('profile-avatar').textContent = name ? [...name][0].toUpperCase() : 'Z';
    get('delete-local-profile').hidden = !savedOnDevice;
  };
  function profileSnapshot() { return JSON.stringify(collectApplicantProfile()); }
  function saveProfile(explicit = false) {
    if (restoring) return;
    if (!get('name').value.trim() || !validPersonalData(values())) {
      if (explicit) { window.goStep(1); expandInvalidFields(); get('applicant-form').reportValidity(); message('local-profile-status','Jaza jina na hakiki tarehe au umri kwanza.','Enter your name and check the date of birth or age first.'); }
      else message('local-profile-status','Mabadiliko haya hayajahifadhiwa bado. Hakiki jina, tarehe au umri.','These changes are not saved yet. Check the name, birth date or age.');
      return;
    }
    try {
      localStorage.setItem(PROFILE_KEY,profileSnapshot()); savedOnDevice = true; window.syncProfileView();
      message('local-profile-status','Profile imehifadhiwa kwenye kifaa hiki. Mabadiliko yataendelea kuhifadhiwa yenyewe.','Profile saved on this device. Further changes will be saved automatically.');
    } catch { message('local-profile-status','Kifaa hakijaweza kuhifadhi profile. Tumia Pakua profile chini ya hatua ya 1 kuhifadhi nakala.','This device could not save the profile. Use Download profile under step 1 to keep a backup.'); }
  }
  function queueSave() { window.syncProfileView(); clearTimeout(savingTimer); if (savedOnDevice && !restoring) savingTimer = setTimeout(() => saveProfile(),350); }
  get('save-local-profile').onclick = () => saveProfile(true);
  get('save-profile-from-form').onclick = () => saveProfile(true);
  get('delete-local-profile').onclick = () => {
    if (!confirm(document.documentElement.lang === 'en' ? 'Remove the profile saved on this device? Downloaded files will remain.' : 'Ondoa profile iliyohifadhiwa kwenye kifaa hiki? Faili ulizopakua zitabaki.')) return;
    clearTimeout(savingTimer);
    try { localStorage.removeItem(PROFILE_KEY); savedOnDevice = false; window.syncProfileView(); message('local-profile-status','Profile ya kifaa imeondolewa. Taarifa zilizo kwenye fomu hazitahifadhiwa mpaka uchague Hifadhi tena.','Saved profile removed. Current form details will not be saved unless you choose Save again.'); }
    catch { message('local-profile-status','Profile haijaondolewa. Jaribu tena au futa data ya tovuti kwenye browser.','Profile could not be removed. Try again or clear this site’s browser data.'); }
  };
  for (const event of ['input','change','submit']) get('main').addEventListener(event,queueSave);
  get('documents').addEventListener('click',queueSave);
  get('ui-sw').addEventListener('click',queueSave); get('lang-toggle').addEventListener('click',queueSave);
  window.addEventListener('applicantprofilechanged',queueSave);
  window.addEventListener('applicantprofileloaded',queueSave);
  document.addEventListener('visibilitychange',() => { if (document.visibilityState === 'hidden' && savedOnDevice) { clearTimeout(savingTimer); saveProfile(); } });
  window.addEventListener('pagehide',() => { if (savedOnDevice) { clearTimeout(savingTimer); saveProfile(); } });

  function shareFallback() { get('share-help').hidden = false; focusSection(get('share-help')); }
  get('share-app').onclick = async () => {
    if (navigator.share) {
      try { await navigator.share({title:'Zanzibaba Career Assistant — LARIS',text:document.documentElement.lang === 'en' ? 'Prepare your LARIS CV and application letter with Zanzibaba.' : 'Andaa CV na barua ya maombi ya LARIS kupitia Zanzibaba.',url:APP_URL}); return; }
      catch (error) { if (error.name === 'AbortError') return; }
    }
    shareFallback();
  };
  get('copy-app-link').onclick = async () => {
    try { await navigator.clipboard.writeText(APP_URL); message('share-status','Link imenakiliwa. Unaweza kuituma kwa rafiki.','Link copied. You can send it to a friend.'); }
    catch { message('share-status','Gusa na ushikilie link hapa chini, kisha chagua Copy link.','Touch and hold the link below, then choose Copy link.'); }
  };
  function installState() {
    if (installed) { message('install-app','App imewekwa','App installed'); get('install-app').setAttribute('aria-label',document.documentElement.lang === 'en' ? 'App installed — view help' : 'App imewekwa — angalia maelekezo'); }
  }
  window.addEventListener('beforeinstallprompt',event => { event.preventDefault(); installPrompt = event; });
  window.addEventListener('appinstalled',() => { installed = true; installPrompt = null; installState(); message('install-status','App imewekwa. Unaweza kuifungua kwenye Home Screen.','App installed. You can open it from your home screen.'); });
  get('install-app').onclick = async () => {
    if (installPrompt && !installed) {
      const prompt = installPrompt; installPrompt = null;
      try { await prompt.prompt(); const choice = await prompt.userChoice; if (choice.outcome === 'accepted') message('app-status','Ombi la kuinstall limekubaliwa. Fuata maelekezo ya browser.','Installation request accepted. Follow the browser instructions.'); return; }
      catch { /* Fall through to manual instructions. */ }
    }
    get('install-help').hidden = false; focusSection(get('install-help'));
    if (installed) message('install-status','App tayari imefunguliwa kama app kwenye kifaa hiki.','The assistant is already running as an app on this device.');
  };
  let connected = navigator.onLine;
  function connectionState() { message('connection-status',connected ? 'Una intaneti' : 'Bila intaneti — unaweza kuandaa nyaraka; tuma email ukipata intaneti.',connected ? 'You are online' : 'Offline — prepare documents now; send email when connected.'); }
  async function checkConnection() {
    try { const response = await fetch('/careers/laris/manifest.webmanifest',{cache:'no-store'}); connected = response.ok && response.headers.get('X-Laris-Offline') !== '1'; } catch { connected = false; }
    connectionState();
  }
  window.addEventListener('online',checkConnection); window.addEventListener('offline',() => { connected = false; connectionState(); });
  for (const id of ['ui-sw','lang-toggle']) get(id).addEventListener('click',() => { connectionState(); installState(); window.syncProfileView(); });
  async function start() {
    window.syncProfileView(); connectionState(); installState();
    let raw;
    try { raw = localStorage.getItem(PROFILE_KEY); }
    catch { message('local-profile-status','Hifadhi ya browser haipatikani. Bado unaweza kuandaa nyaraka na kupakua profile.','Browser storage is unavailable. You can still prepare documents and download your profile.'); }
    if (raw) {
      restoring = true; get('main').inert = true;
      try {
        if (raw.length > 1200000) throw Error('size');
        await applyApplicantProfile(JSON.parse(raw)); savedOnDevice = true; window.syncProfileView();
        message('app-status','Karibu tena, '+get('name').value+'. Profile yako imerudishwa.','Welcome back, '+get('name').value+'. Your profile has been restored.');
        message('local-profile-status','Karibu tena. Profile yako imerudishwa kutoka kifaa hiki.','Welcome back. Your profile has been restored from this device.');
      } catch { savedOnDevice = true; window.syncProfileView(); message('local-profile-status','Profile iliyohifadhiwa haikufunguka. Unaweza kuondoa nakala ya kifaa au kurudisha faili la profile.','The saved profile could not be opened. Remove the device copy or import a profile backup.'); }
      finally { restoring = false; get('main').inert = false; }
    }
    const requested = {'#details':1,'#documents':2,'#apply':3}[location.hash] || 1;
    // Do not generate drafts automatically when an old bookmark opens step 2.
    window.goStep(requested === 2 && !get('cv-text').value.trim() ? 1 : requested,false);
    if ('serviceWorker' in navigator && window.isSecureContext) {
      try { await navigator.serviceWorker.register('/careers/laris/sw.js',{scope:'/careers/laris/',updateViaCache:'none'}); }
      catch { if (!navigator.serviceWorker.controller) message('app-status','Unaweza kutumia mfumo mtandaoni. Hali ya bila intaneti haikuwezeshwa kwenye browser hii.','You can use the assistant online. Offline mode could not be enabled in this browser.'); }
    }
    checkConnection();
  }
  start().catch(() => { get('main').inert = false; message('app-status','Tumia fomu hapa chini kuendelea.','Use the form below to continue.'); });
})();
