/* My English World — single-file app, no build, localStorage only */
const LS_KEY='english-world-v1';
const $=s=>document.querySelector(s);
const app=$('#app'), modal=$('#modal'), modalBox=$('#modalBox'), toastEl=$('#toast');

const uid=()=>Math.random().toString(36).slice(2,9)+Date.now().toString(36).slice(-3);
const todayStr=(d=new Date())=>d.toISOString().slice(0,10);
const fmtDate=s=>{try{return new Date(s+'T12:00').toLocaleDateString('en-GB',{day:'numeric',month:'long',weekday:'long'})}catch(e){return s}};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* ---------- store ---------- */
const defaults=()=>({
  vocabulary:[], lessons:[], podcasts:[
    {id:uid(),name:'English Cactus',link:'https://youtube.com/@englishcactusfy?si=fNi7n7mLt683z6lt',notes:'Main listening source.',date:todayStr()}
  ],
  wordsLessons:[], grammar:[], journal:[], reviews:[],
  resources:[
    {id:uid(),name:'English Cactus',category:'Podcast',link:'https://youtube.com/@englishcactusfy?si=fNi7n7mLt683z6lt',notes:'Listening'},
    {id:uid(),name:'Бебрис — 5000 слов',category:'Words',link:'https://youtube.com/playlist?list=PLD6SPjEPomauo4F7ejH8BOhJq0LUzDoiT&si=5EcOE9Dj0CSbyKcU',notes:'Core words'},
    {id:uid(),name:'How to Speak',category:'Speaking',link:'https://youtube.com/playlist?list=PLD6SPjEPomatoOVGOzBcAYYNgSGyC0NK2&si=AmNy7_zpvZrdiqFv',notes:'Speaking patterns'},
    {id:uid(),name:'Shadowing',category:'Speaking',link:'https://shadowing.tech',notes:'Shadowing practice'}
  ],
  calendar:{}, sessions:[], lastImage:'', quoteIdx:0,
  flash:{} // wordId -> {level, next}
});
let S;
try{S=Object.assign(defaults(),JSON.parse(localStorage.getItem(LS_KEY)||'{}'))}catch(e){S=defaults()}
const save=()=>localStorage.setItem(LS_KEY,JSON.stringify(S));
function logSession(activity,minutes=15){
  S.sessions.push({id:uid(),date:todayStr(),activity,minutes});
  if(!S.calendar[todayStr()]) S.calendar[todayStr()]='study';
  save();
}
function toast(m){toastEl.textContent=m;toastEl.style.display='block';clearTimeout(toastEl._t);toastEl._t=setTimeout(()=>toastEl.style.display='none',2200)}

/* ---------- global image library ---------- */
function jpgName(i){ return 'assets/images/image-'+('0'+i).slice(-2)+'.jpg'; }
function imageCandidates(){
  var out=[], i;
  for(i=1;i<=50;i++){ out.push(jpgName(i)); }
  for(i=1;i<=50;i++){ var n=('0'+i).slice(-2); out.push('assets/images/image-'+n+'.jpeg'); out.push('assets/images/image-'+n+'.png'); out.push('assets/images/image-'+n+'.webp'); }
  return out;
}
function badMap(){ if(!S.imgBad) S.imgBad={}; return S.imgBad; }
function getRandomImage(tried){
  tried=tried||[];
  var bad=badMap(), pool=[], i, p;
  for(i=1;i<=50;i++){ p=jpgName(i); if(!bad[p] && tried.indexOf(p)===-1 && tried.indexOf('./'+p)===-1) pool.push(p); }
  if(!pool.length){ for(i=1;i<=50;i++){ p=jpgName(i); if(tried.indexOf(p)===-1) pool.push(p); } }
  if(!pool.length) pool.push(jpgName(1+Math.floor(Math.random()*50)));
  var pick=pool[Math.floor(Math.random()*pool.length)];
  if(pick===S.lastImage && pool.length>1) pick=pool[(pool.indexOf(pick)+1)%pool.length];
  S.lastImage=pick; try{save();}catch(e){}
  return './'+pick;
}
function markImg(url,ok){
  var k=String(url||'').split('?')[0].replace(/^\.\//,'');
  if(k.indexOf('assets/images/')!==0) return;
  var bad=badMap();
  if(ok){ if(bad[k]){ delete bad[k]; try{save();}catch(e){} } }
  else { if(!bad[k]){ bad[k]=1; try{save();}catch(e){} } }
}
window.__imgRetry=function(el){
  markImg(el.getAttribute('src'),false);
  var t=(parseInt(el.getAttribute('data-t')||'0',10))+1;
  if(t>25){ el.remove(); return; }
  el.setAttribute('data-t',t);
  var seen=(el.getAttribute('data-seen')||'').split('|').filter(Boolean);
  seen.push(el.getAttribute('src'));
  el.setAttribute('data-seen',seen.join('|'));
  el.src=getRandomImage(seen);
};
window.__imgFit=function(el){
  try{el.style.objectFit='cover';}catch(e){}
};
window.__imgOk=function(el){
  window.__imgFit(el);
  markImg(el.getAttribute('src'),true);
  if(el.parentElement) el.parentElement.classList.remove('fallback');
};
function heroImage(){
  const src=getRandomImage();
  return `<div class="hero-img fallback"><img src="${src}" alt="" loading="lazy" data-t="0" data-seen="" onload="__imgOk(this)" onerror="__imgRetry(this)"></div>`;
}
function sqImage(){
  const src=getRandomImage();
  return `<div class="tsq"><img src="${src}" alt="" loading="lazy" data-t="0" data-seen="" onload="__imgFit(this)" onerror="__imgRetry(this)"></div>`;
}
function titleRow(titleHtml,sub){
  return `<div class="trow">${sqImage()}<div><h1 class="hero sm">${titleHtml}</h1>${sub?`<p class="subtitle">${sub}</p>`:''}</div></div>`;
}

/* ---------- quotes (short excerpts only) ---------- */
const QUOTES=[
  {t:'I am in my glow-up era.',s:'Journal note'},
  {t:'Small steps create big dreams.',s:'Pinned note'},
  {t:'Stay soft, stay strong.',s:'Editorial mood'},
  {t:'Elegance is an attitude.',s:'After Lagerfeld'},
  {t:'The best is yet to come.',s:'Notebook margin'},
  {t:'Key to any goal is consistency.',s:'Gentle reminder'},
  {t:'I deserve good things.',s:'Morning page'},
  {t:'Make it happen, girl.',s:'Pop culture'},
  {t:'Less, but better.',s:'Design rule'},
  {t:'My English, my world.',s:'Natalia'},
  {t:'Not perfect, just present.',s:'Study journal'},
  {t:'Confidence looks good on you.',s:'Mirror note'},
  {t:'Romanticize your study life.',s:'Pinterest mood'},
  {t:'One word a day keeps doubt away.',s:'Vocabulary club'},
  {t:'Speak softly, carry great vocabulary.',s:'Playful'},
];

/* ---------- nav ---------- */
const TABS=[
  {id:'cal',icon:'◐',label:'Calendar',hash:'#/calendar'},
  {id:'learn',icon:'❥',label:'Words',hash:'#/vocabulary'},
  {id:'home',icon:'✦',label:'Home',hash:'#/home'},
  {id:'cards',icon:'♡',label:'Cards',hash:'#/flashcards'},
  {id:'more',icon:'☰',label:'More',hash:''},
];
function renderNav(route){
  $('#bottomNav').innerHTML=TABS.map(t=>
    `<button class="navbtn ${route===t.id?'on':''}" data-tab="${t.id}"><span class="ic">${t.icon}</span>${t.label}</button>`).join('');
  document.querySelectorAll('.navbtn').forEach(b=>b.onclick=()=>{
    if(b.dataset.tab==='more') openMore();
    else location.hash=TABS.find(t=>t.id===b.dataset.tab).hash;
  });
  $('#topDate').textContent=new Date().toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'long'});
}
const ALL_LINKS=[
  ['ACTIVITIES',[['Podcasts','#/podcasts'],['Lessons + Grammar','#/lessons'],['Words','#/words'],['How to Speak','#/speak'],['Shadowing','#/shadowing'],['Talk with GPT','#/talk'],['Write with GPT','#/write']]],
  ['MY ENGLISH WORLD',[['Progress','#/progress'],['Journal','#/journal']]],
  ['RESOURCES',[['Resources','#/resources'],['Export / Import','#/settings'],['Reset stats','#/reset']]],
];
function openMore(){
  $('#moreBox').innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center"><h2 class="big">Menu</h2><button class="chip" data-close>Close</button></div>`+
    ALL_LINKS.map(([g,ls])=>`<div class="group-t">${g}</div>`+ls.map(([n,h])=>`<a class="biglink" href="${h}">${n}<span>→</span></a>`).join('')).join('');
  $('#moreSheet').classList.add('open');
  $('#moreBox').querySelectorAll('[data-close]').forEach(b=>b.onclick=closeSheets);
  $('#moreBox').querySelectorAll('a').forEach(a=>a.onclick=closeSheets);
}
function closeSheets(){$('#moreSheet').classList.remove('open');modal.classList.remove('open')}
document.addEventListener('click',e=>{if(e.target.hasAttribute('data-close'))closeSheets()});
$('#fabAdd').onclick=()=>{
  const r=(location.hash||'#/home').replace('#/','');
  const map={vocabulary:'#/vocabulary',journal:'#/journal',grammar:'#/grammar',calendar:'#/calendar',podcasts:'#/podcasts',lessons:'#/lessons',words:'#/words'};
  location.hash=map[r]||'#/vocabulary';
  setTimeout(()=>{const b=document.querySelector('[data-add]');if(b)b.click()},300);
};

/* ---------- shared bits ---------- */
function greeting(){
  const h=new Date().getHours();
  if(h<5)return'Good night';
  if(h<12)return'Good morning';
  if(h<18)return'Good afternoon';
  return'Good evening';
}
function openModal(html){modalBox.innerHTML=`<button class="mx" aria-label="Close" onclick="document.querySelector('#modal').classList.remove('open')">×</button>`+html;modal.classList.add('open')}
function field(lbl,name,val='',ph='',type='text'){
  return `<label class="lbl">${lbl}</label><input name="${name}" type="${type}" value="${esc(val)}" placeholder="${esc(ph)}">`;
}
function vocabForm(src='Manual'){
  openModal(`<h2 class="big">New word</h2><p class="small">From ${esc(src)}. Less, but better — one word at a time.</p>
  <form id="vf">${field('English','en','','e.g. glow up')}${field('Translation','ru','','перевод')}
  <label class="lbl">Example</label><textarea name="ex" placeholder="A short sentence"></textarea>
  <input type="hidden" name="source" value="${esc(src)}">
  <div style="display:flex;gap:10px;margin-top:16px"><button class="btn" type="submit">Save word</button></div></form>`);
  $('#vf').onsubmit=e=>{e.preventDefault();
    const f=new FormData(e.target);
    if(!f.get('en'))return toast('Add English word');
    S.vocabulary.unshift({id:uid(),en:f.get('en'),ru:f.get('ru'),example:f.get('ex'),source:f.get('source'),date:todayStr(),status:'NEW',notes:''});
    logSession('Vocabulary',5); save(); closeSheets(); toast('Saved ♡'); route();
  };
}
function todaySessions(){return S.sessions.filter(s=>s.date===todayStr())}

/* ---------- router ---------- */
function route(){
  const h=(location.hash||'#/home').replace('#/','').split('?')[0]||'home';
  closeSheets(); window.scrollTo({top:0});
  const R={home:'home',vocabulary:'learn',flashcards:'cards',calendar:'cal'};
  renderNav(R[h]||'home');
  ({home:pHome,calendar:pCal,progress:pProgress,journal:pJournal,
    podcasts:pPodcasts,lessons:pLessons,words:pWords,speak:pSpeak,shadowing:pShadow,
    talk:pTalk,write:pWrite,quizlet:pQuizlet,vocabulary:pVocab,flashcards:pFlash,
    resources:pRes,settings:pSettings,reset:pReset}[h]||pHome)();
}

/* ---------- HOME ---------- */
function pHome(){
  const q=QUOTES[Math.floor(Math.random()*QUOTES.length)];
  const week=[...Array(7)].map((_,i)=>{const d=new Date();d.setDate(d.getDate()-(6-i));return todayStr(d)});
  const wkCount=S.sessions.filter(s=>week.includes(s.date)).length;
  const total=S.vocabulary.length;
  const known=S.vocabulary.filter(w=>w.status==='KNOWN').length;
  app.innerHTML=`
    <div class="trow">${sqImage()}<div><h1 class="hero sm">${greeting()},<br><em>Natalia.</em></h1></div></div>
    <div class="quote-card small"><div class="quote-src">Quote of the day</div>
      <blockquote>“${esc(q.t)}”</blockquote><div class="quote-src">${esc(q.s)}</div></div>
    <div class="ministats">
      <div><b>${total}</b><span>words</span></div>
      <div><b>${known}</b><span>known</span></div>
      <div><b>${wkCount}</b><span>sessions</span></div>
    </div>
    ${heroImage()}
    <div class="card"><div class="quote-src">Progress</div>
      <div style="font-family:var(--font-serif);font-size:26px;margin:8px 0">You showed up ${wkCount} time${wkCount===1?'':'s'} this week.</div>
      <button class="btn" onclick="location.hash='#/progress'">Open progress →</button></div>`;
}

/* ---------- CALENDAR ---------- */
let calCursor=new Date();
function pCal(){
  const y=calCursor.getFullYear(),m=calCursor.getMonth();
  const first=new Date(y,m,1); let start=(first.getDay()+6)%7;
  const days=new Date(y,m+1,0).getDate();
  const cells=[];
  for(let i=0;i<start;i++)cells.push('');
  for(let d=1;d<=days;d++)cells.push(d);
  app.innerHTML=`${titleRow('Calendar')}
  <p class="subtitle">★ — learning day · ☁ — rest day.</p>
  <div class="card"><div style="display:flex;justify-content:space-between;align-items:center">
    <button class="chip" id="pm">←</button><b style="font-family:var(--font-serif);font-size:24px">${calCursor.toLocaleString('en',{month:'long',year:'numeric'})}</b>
    <button class="chip" id="nm">→</button></div>
  <div class="cal-grid">${['M','T','W','T','F','S','S'].map(d=>`<div class="cal-dow">${d}</div>`).join('')}
  ${cells.map(d=>{if(!d)return'<div></div>';
    const k=`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const v=S.calendar[k]; const isT=k===todayStr();
    const inner=v==='study'
      ? `<span class="hwrap"><span class="str">★︎</span><span class="hnum">${d}</span></span>`
      : `${d}${v==='rest'?'<span class="cloud">☁</span>':''}`;
    return `<button class="cal-day ${isT?'today':''}" data-day="${k}">${inner}</button>`}).join('')}
  </div></div>
  <div class="card"><div class="quote-src">This month</div>
    <div class="kv"><span>Learning days ★</span><b>${Object.values(S.calendar).filter(v=>v==='study').length}</b></div>
    <div class="kv"><span>Rest days ☁</span><b>${Object.values(S.calendar).filter(v=>v==='rest').length}</b></div>
    <div class="kv"><span>Sessions</span><b>${S.sessions.length}</b></div>
    <div class="divider"></div>
    <div class="quote-src">Level progress · smart estimate</div>
    <div style="font-family:var(--font-serif);font-size:22px;margin:6px 0">B1 → B2 · ${levelPct()}%</div>
    <div class="lvlbar"><i style="width:${levelPct()}%"></i></div>
    <div class="small">${levelMsg(levelPct())}</div>
  </div>`;
  $('#pm').onclick=()=>{calCursor=new Date(y,m-1,1);pCal()};
  $('#nm').onclick=()=>{calCursor=new Date(y,m+1,1);pCal()};
  app.querySelectorAll('[data-day]').forEach(b=>b.onclick=()=>{
    const k=b.dataset.day, cur=S.calendar[k];
    if(!cur)S.calendar[k]='study'; else if(cur==='study')S.calendar[k]='rest'; else delete S.calendar[k];
    save(); pCal();
  });
}

/* ---------- PROGRESS ---------- */
function pProgress(){
  const sess=S.sessions.length, rest=Object.values(S.calendar).filter(v=>v==='rest').length;
  const mins=S.sessions.reduce((a,s)=>a+(+s.minutes||15),0);
  const words=S.vocabulary.length, gram=S.grammar.length;
  const week=[...Array(7)].map((_,i)=>{const d=new Date();d.setDate(d.getDate()-(6-i));return todayStr(d)});
  const counts=week.map(k=>S.sessions.filter(s=>s.date===k).length);
  const max=Math.max(1,...counts);
  const acts={}; S.sessions.forEach(s=>acts[s.activity]=(acts[s.activity]||0)+1);
  const wkCount=S.sessions.filter(s=>week.includes(s.date)).length;
  app.innerHTML=`<div class="eyebrow">Kind progress</div><h1 class="hero">You showed up<br><em>${wkCount} time${wkCount===1?'':'s'}</em> this week.</h1>
  ${heroImage('Glow up era')}
  <div class="row2"><div class="stat"><b>${sess}</b><span>sessions</span></div><div class="stat"><b>${Math.round(mins/60*10)/10}h</b><span>study time</span></div></div>
  <div class="row2"><div class="stat"><b>${words}</b><span>words</span></div><div class="stat"><b>${gram}</b><span>grammar</span></div></div>
  <div class="card"><div class="quote-src">Weekly activity</div>
    <div class="bars">${counts.map(c=>`<div class="bar" style="flex:1"><i style="height:${Math.round(c/max*100)}%"></i></div>`).join('')}</div>
    <div class="small">${week.map(k=>k.slice(8)).join(' · ')}</div></div>
  <div class="card"><div class="quote-src">Activity balance</div>
    ${Object.keys(acts).length?Object.entries(acts).map(([k,v])=>`<div class="kv"><span>${esc(k)}</span><b>${v}</b></div>`).join(''):'<p class="small">No sessions yet — start with one podcast today.</p>'}
    <div class="divider"></div><div class="small">Rest days ☁ — ${rest}. Rest is part of the routine.</div></div>`;
}

/* ---------- JOURNAL ---------- */
let jQ='';
function pJournal(){
  const list=S.journal.filter(j=>(j.text||'').toLowerCase().includes(jQ.toLowerCase())).sort((a,b)=>b.date.localeCompare(a.date));
  app.innerHTML=`<div class="eyebrow">Dear diary</div><h1 class="hero">My English<br><em>Journal</em></h1>
  <div class="card"><input id="jq" placeholder="Search entries…" value="${esc(jQ)}">
  <button class="btn" data-add>+ New entry</button></div>
  ${list.map(j=>`<div class="item"><h3>${esc(fmtDate(j.date))}</h3><p>${esc(j.text)}</p>
    <div class="meta">${esc(j.date)} · <a href="#" data-del="${j.id}">delete</a></div></div>`).join('')||'<p class="small">No entries yet. Write one soft paragraph.</p>'}
  ${heroImage('Morning routine')}`;
  $('#jq').oninput=e=>{jQ=e.target.value;clearTimeout(window._jq);window._jq=setTimeout(()=>{const v=e.target.value,pos=e.target.selectionStart;pJournal();const n=$('#jq');n.focus();n.setSelectionRange(pos,pos)},400)};
  app.querySelector('[data-add]').onclick=()=>{
    openModal(`<h2 class="big">New entry</h2><form id="jf"><label class="lbl">Date</label><input type="date" name="date" value="${todayStr()}"><label class="lbl">Text</label><textarea name="text" placeholder="Today my English felt…"></textarea><button class="btn" style="margin-top:14px">Save</button></form>`);
    $('#jf').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);
      S.journal.unshift({id:uid(),date:f.get('date')||todayStr(),text:f.get('text')});logSession('Journal',10);save();route();toast('Saved ♡')};
  };
  app.querySelectorAll('[data-del]').forEach(a=>a.onclick=e=>{e.preventDefault();S.journal=S.journal.filter(x=>x.id!==a.dataset.del);save();route()});
}

/* ---------- WEEKLY REVIEW ---------- */
function pReview(){
  const list=[...S.reviews].reverse().slice(0,6);
  app.innerHTML=`<div class="eyebrow">Slow Sunday</div><h1 class="hero">Weekly<br><em>Review</em></h1>
  <p class="subtitle">Calm, honest, no grades.</p>
  <div class="card"><button class="btn" data-add>+ New review</button></div>
  ${list.map(r=>`<div class="item"><h3>${esc(r.week||r.date)}</h3>
    <p>This week in English: ${esc(r.highlight||'—')}</p>
    <div class="meta">${r.sessions||0} sessions · ${r.newWords||0} words · felt: ${esc(r.feeling||'—')}</div></div>`).join('')||'<p class="small">No reviews yet.</p>'}`;
  app.querySelector('[data-add]').onclick=()=>{
    openModal(`<h2 class="big">This week</h2><form id="rf">
    ${field('Week','week','','e.g. 6–12 Oct')}${field('Sessions','sessions','','e.g. 4')}${field('Favorite activity','fav','','What felt good?')}${field('Most difficult','difficult','','')}${field('New words','newWords','','')}${field('Grammar topics','grammar','','')}${field('Needs review','reviewNeeded','','')}${field('Next week I want','improve','','')}${field('How I felt','feeling','','')}
    <label class="lbl">This week in English</label><textarea name="highlight" placeholder="One beautiful sentence"></textarea>
    <button class="btn" style="margin-top:14px">Save review</button></form>`);
    $('#rf').onsubmit=e=>{e.preventDefault();const o=Object.fromEntries(new FormData(e.target));o.id=uid();o.date=todayStr();
      S.reviews.push(o);logSession('Review',10);save();route();toast('Saved ♡')};
  };
}

/* ---------- generic activity pages ---------- */
function activityShell(title,sub,body,extLink,extLabel){
  app.innerHTML=`${titleRow(title,sub)}
  ${extLink?`<div style="height:14px"></div><a class="btn rose" href="${extLink}" target="_blank" rel="noopener">${extLabel}</a><div style="height:12px"></div>`:''}
  <button class="btn ghost" id="addW">+ Add word to Vocabulary</button><div style="height:6px"></div>${body||''}`;
  $('#addW').onclick=()=>vocabForm(title);
}
function wordListHTML(filterFn){
  const list=S.vocabulary.filter(filterFn||(()=>true)).slice(0,3);
  if(!list.length)return'';
  return `<div class="eyebrow">Recent words</div>`+list.map(w=>`<div class="item"><h3>${esc(w.en)}</h3><p>${esc(w.ru||'')}</p><div class="meta">${esc(w.source||'')} · ${esc(w.status||'')}</div></div>`).join('');
}
function pPodcasts(){
  activityShell('Podcasts','English Cactus — listen like a magazine.',`
    <div class="card"><div class="quote-src">My podcasts</div>
    ${S.podcasts.map(p=>`<div class="kv"><span><b>${esc(p.name)}</b><br><span class="small">${esc(p.notes||'')}</span></span><a href="${esc(p.link)}" target="_blank" rel="noopener">↗</a></div>`).join('')}
    <button class="chip" id="addP" style="margin-top:10px">+ Add podcast</button></div>
    ${wordListHTML(w=>w.source==='Podcasts')}`,
    'https://youtube.com/@englishcactusfy?si=fNi7n7mLt683z6lt','▶ OPEN ENGLISH CACTUS');
  $('#addP').onclick=()=>{
    openModal(`<h2 class="big">Podcast</h2><form id="pf">${field('Name','name')}${field('Link','link')}<label class="lbl">Notes</label><textarea name="notes"></textarea><button class="btn" style="margin-top:12px">Save</button></form>`);
    $('#pf').onsubmit=e=>{e.preventDefault();const o=Object.fromEntries(new FormData(e.target));o.id=uid();o.date=todayStr();S.podcasts.push(o);logSession('Podcasts',20);save();route()};
  };
}
function pLessons(){
  const list=[...S.lessons].reverse().slice(0,8);
  activityShell('Lessons','Grammar in real life. Keep it light.',`
    <div class="card"><button class="btn" id="addL">+ New lesson note</button></div>
    ${list.map(l=>`<div class="item"><h3>${esc(l.title||'Lesson')}</h3><p>${esc(l.grammar||'')}</p><div class="meta">${esc(l.date||'')} · understood: ${esc(l.understood||'—')}</div>
    <div style="display:flex;gap:10px;margin-top:12px;align-items:center;justify-content:flex-end">
      <button class="iconbtn" data-edit="${l.id}" aria-label="Edit">${PENCIL}</button>
      <button class="iconbtn" data-del="${l.id}" aria-label="Delete">${TRASH}</button>
    </div></div>`).join('')}`,
    null);
  $('#addL').onclick=()=>lessonForm(null);
  app.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>lessonForm(S.lessons.find(x=>x.id===b.dataset.edit)));
  app.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{S.lessons=S.lessons.filter(x=>x.id!==b.dataset.del);save();route()});
}
function lessonForm(l){
  openModal(`<h2 class="big">${l?'Edit':'New'} lesson</h2><form id="lf">${field('Lesson','title',l?l.title:'')}${field('Grammar topic','grammar',l?l.grammar:'')}${field('What I understood','understood',l?l.understood:'')}${field('What was difficult','difficult',l?l.difficult:'')}<label class="lbl">Notes</label><textarea name="notes">${esc(l?l.notes:'')}</textarea><button class="btn" style="margin-top:12px">Save</button></form>`);
  $('#lf').onsubmit=e=>{e.preventDefault();const o=Object.fromEntries(new FormData(e.target));
    if(l){Object.assign(l,o)}else{o.id=uid();o.date=todayStr();S.lessons.unshift(o);logSession('Lessons',25)}
    save();closeSheets();route();toast('Saved ♡')};
}
function pWords(){
  activityShell('Words','Go girl! Step by step!',wordListHTML(w=>w.source==='Words'),
    'https://youtube.com/playlist?list=PLD6SPjEPomauo4F7ejH8BOhJq0LUzDoiT&si=5EcOE9Dj0CSbyKcU','▶ OPEN 5000 WORDS');
}
function pSpeak(){
  activityShell('How to Speak','Patterns you can steal for real life.',wordListHTML(w=>w.source==='How to Speak'),
    'https://youtube.com/playlist?list=PLD6SPjEPomatoOVGOzBcAYYNgSGyC0NK2&si=AmNy7_zpvZrdiqFv','▶ OPEN PLAYLIST');
}
function pShadow(){
  activityShell('Shadowing','Repeat · shadow · own it.',wordListHTML(w=>w.source==='Shadowing'),'https://shadowing.tech','▶ OPEN SHADOWING');
}
const TALK_PROMPTS=[
  "Pretend we are two friends having matcha in a Manhattan cafe. Chat with me and correct me softly.",
  "Describe your dream fashion evening in Soho, London. Where do we go, what do we wear?",
  "Talk to me about an LA sunset with palm trees. How was your day, glow girl?",
  "Let's chat about street style in New York like girlfriends. Ask me questions.",
  "Pretend you are a glossy magazine editor. Interview me about my English glow-up era.",
  "Tell me about your perfect cozy evening: a cafe, city lights, good music. I'll do the same.",
];
const WRITE_PROMPTS=[
  "Here is my paragraph. Fix it gently and give me a more native, magazine-like version.",
  "Write a short editorial paragraph about a fashionable London evening. Then ask for corrections.",
  "Describe your dream NYC morning in 6 sentences, like a lifestyle blogger.",
  "Write about your favourite beauty ritual as if for a glossy magazine.",
  "Describe an LA sunset scene: light, palms, mood. Make it cinematic.",
  "Write a mini review of a film or series you love, in English.",
];
function pTalk(){
  const p=TALK_PROMPTS[Math.floor(Math.random()*TALK_PROMPTS.length)];
  activityShell('Talk with GPT','Speak freely. Save what shines.',`
    <div class="card"><div class="quote-src">Prompt idea</div><p class="small">${esc(p)}</p>
    <button class="btn light" id="logT">Log talking session</button></div>`
    +wordListHTML(w=>w.source==='Talk with GPT'),null);
  $('#logT').onclick=()=>{logSession('Speaking',15);save();toast('Saved');route()};
}
function pWrite(){
  const p=WRITE_PROMPTS[Math.floor(Math.random()*WRITE_PROMPTS.length)];
  activityShell('Write with GPT','One paragraph. Then polish.',`
    <div class="card"><div class="quote-src">Prompt idea</div><p class="small">${esc(p)}</p>
    <button class="btn light" id="logW">Log writing session</button></div>`
    +wordListHTML(w=>w.source==='Write with GPT'),null);
  $('#logW').onclick=()=>{logSession('Writing',15);save();toast('Saved');route()};
}
function pQuizlet(){ location.hash='#/flashcards'; }

/* ---------- VOCABULARY ---------- */
let vQ='',vStatus='';
const TRASH='<svg viewBox="0 0 24 24"><path d="M4 7h16"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/><path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13"/><path d="M10 11v6M14 11v6"/></svg>';
const PENCIL='<svg viewBox="0 0 24 24"><path d="M4 20l4-1 11-11a2.1 2.1 0 0 0-3-3L5 16l-1 4z"/><path d="M13.5 6.5l3 3"/></svg>';
function askConfirm(title,text,onYes){
  openModal(`<h2 class="big">${esc(title)}</h2><p class="small">${esc(text)}</p>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:18px">
  <button class="btn" id="cfY">Yes</button><button class="btn ghost" id="cfN">No</button></div>`);
  $('#cfY').onclick=()=>{closeSheets();onYes()};
  $('#cfN').onclick=()=>closeSheets();
}
function levelPct(){
  const knownN=S.vocabulary.filter(w=>w.status==='KNOWN').length;
  const sessN=S.sessions.length;
  const studyN=Object.values(S.calendar).filter(v=>v==='study').length;
  return Math.min(97,Math.round(Math.min(knownN,120)/120*55+Math.min(sessN,60)/60*30+Math.min(studyN,30)/30*15));
}
function levelMsg(p){
  if(p<25)return'Fresh start on the B1 to B2 road. Every word counts.';
  if(p<50)return'Good pace. Keep collecting words and study days.';
  if(p<75)return'Strong progress. B2 is getting closer.';
  return'Almost there. Polish speaking and hard words.';
}
function pReset(){
  askConfirm('Reset stats?','Sessions, calendar marks and card progress will be cleared. Words, lessons and journal stay.',()=>{
    S.sessions=[];S.calendar={};S.flash={};save();toast('Stats reset');location.hash='#/progress';
  });
}
function pVocab(){
  let list=[...S.vocabulary];
  if(vQ)list=list.filter(w=>(w.en+w.ru+(w.example||'')).toLowerCase().includes(vQ.toLowerCase()));
  if(vStatus)list=list.filter(w=>w.status===vStatus);
  app.innerHTML=`${titleRow('Vocabulary',S.vocabulary.length+' words collected.')}
  <div class="card"><input id="vq" placeholder="Search words…" value="${esc(vQ)}">
    <div class="chiprow" style="justify-content:flex-end;margin-top:10px">${['','NEW','LEARNING','KNOWN','DIFFICULT'].map(s=>`<button class="chip sm ${vStatus===s?'on':''}" data-st="${s}" style="padding:6px 10px;font-size:11px;min-height:32px">${s==='NEW'?'new':s==='LEARNING'?'learning':s==='KNOWN'?'known':s==='DIFFICULT'?'difficult':'all'}</button>`).join('')}</div>
    <button class="btn" data-add style="margin-top:10px">+ Add</button></div>
  ${list.slice(0,30).map(w=>`<div class="item"><span class="tag corner ${w.status==='KNOWN'?'known':''}">${esc(w.status||'NEW')}</span><h3>${esc(w.en)}</h3><p>${esc(w.ru||'')}</p>
    ${w.example?`<p class="small"><i>${esc(w.example)}</i></p>`:''}
    <div style="display:flex;gap:10px;margin-top:12px;align-items:center">
      <button class="chip sm" data-kn="${w.id}" style="flex:1">${w.status==='KNOWN'?'♡ Known':'♡ Mark known'}</button>
      <button class="iconbtn" data-del="${w.id}" aria-label="Delete">${TRASH}</button>
    </div>
  </div>`).join('')||'<p class="small">No words yet. Add your first beautiful word.</p>'}`;
  $('#vq').oninput=e=>{vQ=e.target.value;clearTimeout(window._vq);window._vq=setTimeout(pVocab,450)};
  app.querySelectorAll('[data-st]').forEach(b=>b.onclick=()=>{vStatus=b.dataset.st;pVocab()});
  app.querySelector('[data-add]').onclick=()=>vocabForm('Manual');
  app.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{S.vocabulary=S.vocabulary.filter(x=>x.id!==b.dataset.del);save();pVocab()});
  app.querySelectorAll('[data-kn]').forEach(b=>b.onclick=()=>{const w=S.vocabulary.find(x=>x.id===b.dataset.kn);w.status=w.status==='KNOWN'?'LEARNING':'KNOWN';save();pVocab()});
}

/* ---------- FLASHCARDS ---------- */
let deck=[],di=0,flipped=false;
function buildDeck(){
  deck=[...S.vocabulary].sort((a,b)=>{
    const la=(S.flash[a.id]&&S.flash[a.id].level)||0, lb=(S.flash[b.id]&&S.flash[b.id].level)||0;
    if(a.status==='DIFFICULT')return -1; if(b.status==='DIFFICULT')return 1;
    return la-lb;
  }).slice(0,30);
  if(!deck.length)deck=[];
  di=0;flipped=false;
}
function pFlash(){
  if(!deck.length||di>=deck.length)buildDeck();
  if(!deck.length){app.innerHTML=`<div class="eyebrow">Cards</div><h1 class="hero">Flashcards</h1><div class="card"><p>Add some words first.</p><button class="btn" id="fv">+ Add word</button></div>`;$('#fv').onclick=()=>vocabForm('Flashcards');return}
  const w=deck[di];
  app.innerHTML=`<div class="eyebrow">Flashcards · ${di+1} / ${deck.length}</div><h1 class="hero">Cards</h1>
  <div class="flash"><div class="flash-inner" id="fc">
    ${!flipped?`<div class="flash-en">${esc(w.en)}</div><div class="small">tap to flip</div>`:`<div class="flash-en" style="font-size:32px">${esc(w.ru||'—')}</div>${w.example?`<div class="flash-ex">${esc(w.example)}</div>`:''}<div class="small">${esc(w.en)}</div>`}
  </div></div>
  ${flipped?`<div class="sr-row"><button data-g="0">Again</button><button data-g="1">Hard</button><button data-g="2">Good</button><button data-g="3">Easy</button></div>`:`<button class="btn ghost" id="show">Show answer</button>`}`;
  const flip=()=>{flipped=true;pFlash()};
  const fc=$('#fc'); if(fc)fc.onclick=flip;
  const sh=$('#show'); if(sh)sh.onclick=flip;
  app.querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>{
    const g=+b.dataset.g, f=S.flash[w.id]||{level:0};
    f.level=g===0?0:g===1?Math.max(0,f.level):g===2?f.level+1:f.level+2;
    if(g===0)w.status='DIFFICULT'; if(g===3)w.status='KNOWN';
    S.flash[w.id]=f; save(); di++; flipped=false;
    if(di>=deck.length){app.innerHTML=`<div class="eyebrow">Done</div><h1 class="hero">Lovely<br><em>work.</em></h1>${heroImage('Done for today')}<button class="btn" onclick="location.hash='#/vocabulary'">Back to words</button>`;logSession('Flashcards',10);save();return}
    pFlash();
  });
}

/* ---------- GRAMMAR ---------- */
function pGrammar(){
  const need=S.grammar.filter(g=>g.status==='REVIEW'||g.status==='STUDYING');
  app.innerHTML=`${titleRow('Grammar')}
  ${need.length?`<div class="card" style="border-color:var(--dusty)"><div class="quote-src">Need to review</div>${need.map(g=>`<div class="kv"><span>${esc(g.topic)}</span><span class="tag">${esc(g.status)}</span></div>`).join('')}</div>`:''}
  <div class="card"><button class="btn" data-add>+ New topic</button></div>
  ${[...S.grammar].reverse().map(g=>`<div class="item"><h3>${esc(g.topic)}</h3><div class="meta">${esc(g.date||'')} · <span class="tag">${esc(g.status||'STUDYING')}</span></div>
  ${g.understood?`<p>✓ ${esc(g.understood)}</p>`:''}${g.difficult?`<p class="small">? ${esc(g.difficult)}</p>`:''}
  <div class="chiprow"><button class="chip sm" data-cy="${g.id}">Cycle status</button><button class="chip sm" data-del="${g.id}">Delete</button></div></div>`).join('')||'<p class="small">No topics yet.</p>'}`;
  app.querySelector('[data-add]').onclick=()=>{
    openModal(`<h2 class="big">Grammar</h2><form id="gf">${field('Topic','topic','','e.g. Present Perfect')}${field('Date studied','date',todayStr(),'','date')}${field('What I understood','understood')}${field('What was difficult','difficult')}<label class="lbl">Notes</label><textarea name="notes"></textarea><label class="lbl">Status</label><select name="status"><option>STUDYING</option><option>NOT STUDIED</option><option>KNOW</option><option>REVIEW</option></select><button class="btn" style="margin-top:12px">Save</button></form>`);
    $('#gf').onsubmit=e=>{e.preventDefault();const o=Object.fromEntries(new FormData(e.target));o.id=uid();S.grammar.unshift(o);logSession('Grammar',20);save();route()};
  };
  app.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{S.grammar=S.grammar.filter(x=>x.id!==b.dataset.del);save();route()});
  app.querySelectorAll('[data-cy]').forEach(b=>b.onclick=()=>{const g=S.grammar.find(x=>x.id===b.dataset.cy);const order=['NOT STUDIED','STUDYING','REVIEW','KNOW'];g.status=order[(order.indexOf(g.status)+1)%order.length]||'STUDYING';save();route()});
}

/* ---------- RESOURCES ---------- */
function pRes(){
  app.innerHTML=`${titleRow('Resources','Only favourites. Nothing extra.')}
  <div class="card"><button class="btn" data-add>+ Add resource</button></div>
  ${S.resources.map(r=>`<div class="item"><h3>${esc(r.name)}</h3><p>${esc(r.category||'')} ${r.notes?'· '+esc(r.notes):''}</p><div class="meta"><a href="${esc(r.link)}" target="_blank" rel="noopener">Open link ↗</a></div><div style="display:flex;gap:10px;margin-top:12px;justify-content:flex-end"><button class="iconbtn" data-edit="${r.id}" aria-label="Edit">${PENCIL}</button><button class="iconbtn" data-del="${r.id}" aria-label="Delete">${TRASH}</button></div></div>`).join('')}`;
  app.querySelector('[data-add]').onclick=()=>{
    openModal(`<h2 class="big">Resource</h2><form id="rf2">${field('Name','name')}${field('Category','category','','Podcast / Words / …')}${field('Link','link')}<label class="lbl">Notes</label><textarea name="notes"></textarea><button class="btn" style="margin-top:12px">Save</button></form>`);
    $('#rf2').onsubmit=e=>{e.preventDefault();const o=Object.fromEntries(new FormData(e.target));o.id=uid();S.resources.push(o);save();route()};
  };
  app.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>resForm(S.resources.find(x=>x.id===b.dataset.edit)));
  app.querySelectorAll('[data-del]').forEach(a=>a.onclick=e=>{e.preventDefault();S.resources=S.resources.filter(x=>x.id!==a.dataset.del);save();route()});
}
function resForm(r){
  openModal(`<h2 class="big">${r?'Edit':'New'} resource</h2><form id="rf2">${field('Name','name',r?r.name:'')}${field('Category','category',r?r.category:'','Podcast / Words / ...')}${field('Link','link',r?r.link:'')}<label class="lbl">Notes</label><textarea name="notes">${esc(r?r.notes:'')}</textarea><button class="btn" style="margin-top:12px">Save</button></form>`);
  $('#rf2').onsubmit=e=>{e.preventDefault();const o=Object.fromEntries(new FormData(e.target));
    if(r){Object.assign(r,o)}else{o.id=uid();S.resources.push(o)}
    save();closeSheets();route();toast('Saved')};
}

/* ---------- SETTINGS ---------- */
function pSettings(){
  app.innerHTML=`<div class="eyebrow">Care</div><h1 class="hero">Backup</h1><p class="subtitle">Your data lives on this phone.</p>
  <div class="card"><button class="btn" id="exp">↓ Export data (JSON)</button><div style="height:10px"></div>
  <label class="btn ghost" style="cursor:pointer">↑ Import data<input type="file" id="imp" accept=".json" hidden></label>
  <div class="divider"></div><div class="small">${S.vocabulary.length} words · ${S.sessions.length} sessions · ${S.journal.length} journal entries</div>
  <div style="height:10px"></div><button class="chip" id="wipe">Reset everything</button></div>
  ${heroImage('Soft evening')}`;
  $('#exp').onclick=()=>{
    const blob=new Blob([JSON.stringify(S,null,2)],{type:'application/json'});
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='english-world-backup.json';a.click();
  };
  $('#imp').onchange=e=>{
    const f=e.target.files[0]; if(!f)return;
    const r=new FileReader();r.onload=function(){try{S=Object.assign(defaults(),JSON.parse(r.result));save();toast('Restored ♡');route()}catch(e){toast('Invalid file')}};r.readAsText(f);
  };
  $('#wipe').onclick=()=>{if(confirm('Delete all local data?')){S=defaults();save();route()}};
}

window.addEventListener('hashchange',route);
route();
