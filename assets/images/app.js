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
function imageCandidates(){
  var out=[];
  var i,n;
  for(i=1;i<=50;i++){ n=('0'+i).slice(-2); out.push('assets/images/image-'+n+'.jpg'); }
  for(i=1;i<=50;i++){ n=('0'+i).slice(-2); out.push('assets/images/image-'+n+'.jpeg'); out.push('assets/images/image-'+n+'.png'); out.push('assets/images/image-'+n+'.webp'); }
  return out;
}
function getRandomImage(){
  var i,n,dozens=[];
  for(i=1;i<=50;i++){ n=('0'+i).slice(-2); dozens.push('assets/images/image-'+n+'.jpg'); }
  var pick=dozens[Math.floor(Math.random()*dozens.length)];
  if(pick===S.lastImage) pick=dozens[Math.floor(Math.random()*dozens.length)];
  S.lastImage=pick; try{save();}catch(e){}
  return './'+pick;
}
window.__imgRetry=function(el){
  var t=(parseInt(el.getAttribute('data-t')||'0',10))+1;
  if(t>20){ el.remove(); return; }
  el.setAttribute('data-t',t);
  el.src=getRandomImage();
};
function heroImage(caption){
  const src=getRandomImage();
  const cap=caption||['London evenings','New York mornings','Los Angeles light'][Math.floor(Math.random()*3)];
  return `<div class="hero-img fallback"><img src="${src}" alt="" loading="lazy" data-t="0" onload="this.parentElement.classList.remove('fallback')" onerror="__imgRetry(this)"><div class="cap">${esc(cap)}</div></div>`;
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
  {id:'home',icon:'✦',label:'Home',hash:'#/home'},
  {id:'learn',icon:'❥',label:'Words',hash:'#/vocabulary'},
  {id:'cal',icon:'◐',label:'Calendar',hash:'#/calendar'},
  {id:'journal',icon:'✎',label:'Journal',hash:'#/journal'},
  {id:'more',icon:'☰',label:'More',hash:''},
];
function renderNav(route){
  $('#bottomNav').innerHTML=TABS.map(t=>
    `<button class="navbtn ${route===t.id?'on':''}" data-tab="${t.id}"><span class="ic">${t.icon}</span>${t.label}</button>`).join('');
  document.querySelectorAll('.navbtn').forEach(b=>b.onclick=()=>{
    if(b.dataset.tab==='more') openMore();
    else location.hash=TABS.find(t=>t.id===b.dataset.tab).hash;
  });
  $('#topDate').textContent=new Date().toLocaleDateString('en-GB',{day:'numeric',month:'short'});
}
const ALL_LINKS=[
  ['MY ENGLISH WORLD',[['Home','#/home'],['Calendar','#/calendar'],['Progress','#/progress'],['Journal','#/journal'],['Weekly Review','#/review']]],
  ['ACTIVITIES',[['Podcasts','#/podcasts'],['Lessons + Grammar','#/lessons'],['Words','#/words'],['How to Speak','#/speak'],['Shadowing','#/shadowing'],['Talk with GPT','#/talk'],['Write with GPT','#/write'],['Quizlet','#/quizlet']]],
  ['LEARN',[['Vocabulary','#/vocabulary'],['Flashcards','#/flashcards'],['Grammar','#/grammar']]],
  ['RESOURCES',[['Resources','#/resources'],['Export / Import','#/settings']]],
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
function openModal(html){modalBox.innerHTML=html;modal.classList.add('open')}
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
  const R={home:'home',vocabulary:'learn',flashcards:'learn',calendar:'cal',journal:'journal',progress:'home'};
  renderNav(R[h]||'home');
  ({home:pHome,calendar:pCal,progress:pProgress,journal:pJournal,review:pReview,
    podcasts:pPodcasts,lessons:pLessons,words:pWords,speak:pSpeak,shadowing:pShadow,
    talk:pTalk,write:pWrite,quizlet:pQuizlet,vocabulary:pVocab,flashcards:pFlash,
    grammar:pGrammar,resources:pRes,settings:pSettings}[h]||pHome)();
}

/* ---------- HOME ---------- */
function pHome(){
  const q=QUOTES[Math.floor(Math.random()*QUOTES.length)];
  const done=todaySessions().length;
  const total=S.vocabulary.length;
  const known=S.vocabulary.filter(w=>w.status==='KNOWN').length;
  app.innerHTML=`
    <div class="eyebrow">My English World</div>
    <h1 class="hero">${greeting()},<br><em>Natalia.</em></h1>
    <p class="subtitle">Let's make your English a little better today.</p>
    ${heroImage('This is my English world')}
    <div class="quote-card"><div class="quote-src">Quote of the day</div>
      <blockquote>“${esc(q.t)}”</blockquote><div class="quote-src">${esc(q.s)}</div><br>
      <button class="link-btn" onclick="location.reload()">Next quote</button></div>
    <div class="eyebrow">Today</div>
    <h2 class="big">${esc(fmtDate(todayStr()))}</h2>
    <div class="card"><div class="kv"><span>Sessions today</span><b>${done}</b></div>
      <div class="kv"><span>Words collected</span><b>${total}</b></div>
      <div class="small" style="margin-top:12px">${done?`You showed up ${done} time${done>1?'s':''} today. Beautiful.`:'A soft start is still a start. One small session counts.'}</div>
      <div class="chiprow">
        <button class="chip" data-log="Podcasts">♫ Podcast</button>
        <button class="chip" data-log="Words">✦ Words</button>
        <button class="chip" data-log="Speaking">◌ Speak</button>
        <button class="chip" data-log="Writing">✎ Write</button>
      </div></div>
    <div class="eyebrow">Progress</div>
    <div class="row2">
      <div class="stat"><b>${total}</b><span>vocabulary</span></div>
      <div class="stat"><b>${known}</b><span>known</span></div>
    </div>
    <div class="card naked"><button class="btn ghost" onclick="location.hash='#/progress'">Open progress →</button></div>
    ${heroImage('Evening in Soho')}`;
  app.querySelectorAll('[data-log]').forEach(b=>b.onclick=()=>{logSession(b.dataset.log,15);save();toast('Logged ♡');route()});
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
  app.innerHTML=`<div class="eyebrow">Study journal</div><h1 class="hero">Calendar</h1>
  <p class="subtitle">Tap a day: ♡ learning · ☁ rest · tap again to clear.</p>
  <div class="card"><div style="display:flex;justify-content:space-between;align-items:center">
    <button class="chip" id="pm">←</button><b style="font-family:var(--font-serif);font-size:24px">${calCursor.toLocaleString('en',{month:'long',year:'numeric'})}</b>
    <button class="chip" id="nm">→</button></div>
  <div class="cal-grid">${['M','T','W','T','F','S','S'].map(d=>`<div class="cal-dow">${d}</div>`).join('')}
  ${cells.map(d=>{if(!d)return'<div></div>';
    const k=`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const v=S.calendar[k]; const isT=k===todayStr();
    return `<button class="cal-day ${isT?'today':''}" data-day="${k}">${d}<span class="m">${v==='study'?'♡':v==='rest'?'☁':''}</span></button>`}).join('')}
  </div></div>${heroImage('Spring season')}`;
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
function activityShell(title,sub,imgCap,body,extLink,extLabel){
  app.innerHTML=`<div class="eyebrow">Activity</div><h1 class="hero">${title}</h1><p class="subtitle">${sub}</p>
  ${heroImage(imgCap)}
  ${extLink?`<a class="btn rose" href="${extLink}" target="_blank" rel="noopener">${extLabel}</a><div style="height:12px"></div>`:''}
  <button class="btn ghost" id="addW">+ Add word to Vocabulary</button><div style="height:6px"></div>${body||''}`;
  $('#addW').onclick=()=>vocabForm(title);
}
function wordListHTML(filterFn){
  const list=S.vocabulary.filter(filterFn||(()=>true)).slice(0,3);
  if(!list.length)return'';
  return `<div class="eyebrow">Recent words</div>`+list.map(w=>`<div class="item"><h3>${esc(w.en)}</h3><p>${esc(w.ru||'')}</p><div class="meta">${esc(w.source||'')} · ${esc(w.status||'')}</div></div>`).join('');
}
function pPodcasts(){
  activityShell('Podcasts','English Cactus — listen like a magazine.','City lights & headphones',`
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
  activityShell('Lessons','Grammar in real life. Keep it light.','Notebook & latte',`
    <div class="card"><button class="btn" id="addL">+ New lesson note</button></div>
    ${list.map(l=>`<div class="item"><h3>${esc(l.title||'Lesson')}</h3><p>${esc(l.grammar||'')}</p><div class="meta">${esc(l.date||'')} · understood: ${esc(l.understood||'—')}</div></div>`).join('')}`,
    null);
  $('#addL').onclick=()=>{
    openModal(`<h2 class="big">Lesson</h2><form id="lf">${field('Lesson','title')}${field('Grammar topic','grammar')}${field('What I understood','understood')}${field('What was difficult','difficult')}<label class="lbl">Notes</label><textarea name="notes"></textarea><button class="btn" style="margin-top:12px">Save + log session</button></form>`);
    $('#lf').onsubmit=e=>{e.preventDefault();const o=Object.fromEntries(new FormData(e.target));o.id=uid();o.date=todayStr();S.lessons.unshift(o);logSession('Lessons',25);save();route();toast('Logged ♡')};
  };
}
function pWords(){
  const list=[...S.wordsLessons].reverse().slice(0,8);
  activityShell('Words','Бебрис · 5000 words, step by step.','Glow up era',`
    <div class="card"><button class="btn" id="addW2">+ Log words lesson</button></div>
    ${list.map(l=>`<div class="item"><h3>Lesson ${esc(l.number||'')} — ${esc(l.title||'')}</h3><p>${esc((l.wordsText||'').slice(0,140))}</p><div class="meta">${esc(l.date||'')}</div></div>`).join('')}`,
    'https://youtube.com/playlist?list=PLD6SPjEPomauo4F7ejH8BOhJq0LUzDoiT&si=5EcOE9Dj0CSbyKcU','▶ OPEN 5000 WORDS');
  $('#addW2').onclick=()=>{
    openModal(`<h2 class="big">Words lesson</h2><form id="wf">${field('Lesson number','number','', '', 'number')}${field('Lesson title','title')}<label class="lbl">Words encountered</label><textarea name="wordsText" placeholder="paste words here"></textarea><button class="btn" style="margin-top:12px">Save</button></form>`);
    $('#wf').onsubmit=e=>{e.preventDefault();const o=Object.fromEntries(new FormData(e.target));o.id=uid();o.date=todayStr();S.wordsLessons.unshift(o);logSession('Words',20);save();route()};
  };
}
function pSpeak(){
  activityShell('How to Speak','Patterns you can steal for real life.','Manhattan street style',wordListHTML(w=>w.source==='How to Speak'),
    'https://youtube.com/playlist?list=PLD6SPjEPomatoOVGOzBcAYYNgSGyC0NK2&si=AmNy7_zpvZrdiqFv','▶ OPEN PLAYLIST');
}
function pShadow(){
  activityShell('Shadowing','Repeat · shadow · own it.','Sunset in LA',wordListHTML(w=>w.source==='Shadowing'),'https://shadowing.tech','▶ OPEN SHADOWING');
}
function pTalk(){
  activityShell('Talk with GPT','Speak freely. Save what shines.','Café notes',`
    <div class="card"><div class="quote-src">Prompt idea</div><p class="small">“Talk to me like a friend in London. Correct me softly, give me 3 new phrases.”</p>
    <button class="btn light" id="logT">✓ Log talking session</button></div>`+wordListHTML(w=>w.source==='Talk with GPT'),null);
  $('#logT').onclick=()=>{logSession('Speaking',15);save();toast('Logged ♡');route()};
}
function pWrite(){
  activityShell('Write with GPT','One paragraph. Then polish.','Editorial desk',`
    <div class="card"><div class="quote-src">Prompt idea</div><p class="small">“Here is my paragraph. Fix it gently and give me a more native version.”</p>
    <button class="btn light" id="logW">✓ Log writing session</button></div>`+wordListHTML(w=>w.source==='Write with GPT'),null);
  $('#logW').onclick=()=>{logSession('Writing',15);save();toast('Logged ♡');route()};
}
function pQuizlet(){
  app.innerHTML=`<div class="eyebrow">Activity</div><h1 class="hero">Quizlet</h1><p class="subtitle">Your cards live in Flashcards.</p>
  ${heroImage('Study girl')}
  <button class="btn" onclick="location.hash='#/flashcards'">Open Flashcards →</button>
  <div style="height:12px"></div><button class="btn ghost" id="qAdd">+ Add word</button>`;
  $('#qAdd').onclick=()=>vocabForm('Quizlet');
}

/* ---------- VOCABULARY ---------- */
let vQ='',vStatus='',vSource='';
function pVocab(){
  const sources=[...new Set(S.vocabulary.map(w=>w.source).filter(Boolean))];
  let list=[...S.vocabulary];
  if(vQ)list=list.filter(w=>(w.en+w.ru+(w.example||'')).toLowerCase().includes(vQ.toLowerCase()));
  if(vStatus)list=list.filter(w=>w.status===vStatus);
  if(vSource)list=list.filter(w=>w.source===vSource);
  app.innerHTML=`<div class="eyebrow">Dictionary of me</div><h1 class="hero">Vocabulary</h1>
  <p class="subtitle">${S.vocabulary.length} words collected.</p>
  ${heroImage('Pink notebook')}
  <div class="card"><input id="vq" placeholder="Search words…" value="${esc(vQ)}">
    <div class="chiprow">${['','NEW','LEARNING','KNOWN','DIFFICULT'].map(s=>`<button class="chip ${vStatus===s?'on':''}" data-st="${s}">${s||'All'}</button>`).join('')}</div>
    ${sources.length?`<div class="chiprow"><button class="chip ${!vSource?'on':''}" data-so="">All sources</button>${sources.map(s=>`<button class="chip ${vSource===s?'on':''}" data-so="${esc(s)}">${esc(s)}</button>`).join('')}</div>`:''}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:8px">
      <button class="btn" data-add>+ Add</button><button class="btn ghost" onclick="location.hash='#/flashcards'">Cards →</button>
    </div></div>
  ${list.slice(0,30).map(w=>`<div class="item"><h3>${esc(w.en)}</h3><p>${esc(w.ru||'')}</p>
    ${w.example?`<p class="small"><i>${esc(w.example)}</i></p>`:''}
    <div class="meta"><span class="tag">${esc(w.status||'NEW')}</span> ${esc(w.source||'')} · ${esc(w.date||'')}</div>
    <div class="chiprow"><button class="chip" data-kn="${w.id}">${w.status==='KNOWN'?'♡ Known':'♡ Mark known'}</button><button class="chip" data-del="${w.id}">Delete</button></div>
  </div>`).join('')||'<p class="small">No words yet. Add your first beautiful word.</p>'}`;
  $('#vq').oninput=e=>{vQ=e.target.value;clearTimeout(window._vq);window._vq=setTimeout(pVocab,450)};
  app.querySelectorAll('[data-st]').forEach(b=>b.onclick=()=>{vStatus=b.dataset.st;pVocab()});
  app.querySelectorAll('[data-so]').forEach(b=>b.onclick=()=>{vSource=b.dataset.so;pVocab()});
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
  app.innerHTML=`<div class="eyebrow">Structure</div><h1 class="hero">Grammar</h1>
  ${need.length?`<div class="card" style="border-color:var(--dusty)"><div class="quote-src">Need to review</div>${need.map(g=>`<div class="kv"><span>${esc(g.topic)}</span><span class="tag">${esc(g.status)}</span></div>`).join('')}</div>`:''}
  <div class="card"><button class="btn" data-add>+ New topic</button></div>
  ${[...S.grammar].reverse().map(g=>`<div class="item"><h3>${esc(g.topic)}</h3><div class="meta">${esc(g.date||'')} · <span class="tag">${esc(g.status||'STUDYING')}</span></div>
  ${g.understood?`<p>✓ ${esc(g.understood)}</p>`:''}${g.difficult?`<p class="small">? ${esc(g.difficult)}</p>`:''}
  <div class="chiprow"><button class="chip" data-cy="${g.id}">Cycle status</button><button class="chip" data-del="${g.id}">Delete</button></div></div>`).join('')||'<p class="small">No topics yet.</p>'}
  ${heroImage('Library mood')}`;
  app.querySelector('[data-add]').onclick=()=>{
    openModal(`<h2 class="big">Grammar</h2><form id="gf">${field('Topic','topic','','e.g. Present Perfect')}${field('Date studied','date',todayStr(),'','date')}${field('What I understood','understood')}${field('What was difficult','difficult')}<label class="lbl">Notes</label><textarea name="notes"></textarea><label class="lbl">Status</label><select name="status"><option>STUDYING</option><option>NOT STUDIED</option><option>KNOW</option><option>REVIEW</option></select><button class="btn" style="margin-top:12px">Save</button></form>`);
    $('#gf').onsubmit=e=>{e.preventDefault();const o=Object.fromEntries(new FormData(e.target));o.id=uid();S.grammar.unshift(o);logSession('Grammar',20);save();route()};
  };
  app.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{S.grammar=S.grammar.filter(x=>x.id!==b.dataset.del);save();route()});
  app.querySelectorAll('[data-cy]').forEach(b=>b.onclick=()=>{const g=S.grammar.find(x=>x.id===b.dataset.cy);const order=['NOT STUDIED','STUDYING','REVIEW','KNOW'];g.status=order[(order.indexOf(g.status)+1)%order.length]||'STUDYING';save();route()});
}

/* ---------- RESOURCES ---------- */
function pRes(){
  app.innerHTML=`<div class="eyebrow">Library</div><h1 class="hero">Resources</h1><p class="subtitle">Only favourites. Nothing extra.</p>
  ${heroImage('My shelf')}
  <div class="card"><button class="btn" data-add>+ Add resource</button></div>
  ${S.resources.map(r=>`<div class="item"><h3>${esc(r.name)}</h3><p>${esc(r.category||'')} ${r.notes?'· '+esc(r.notes):''}</p><div class="meta"><a href="${esc(r.link)}" target="_blank" rel="noopener">Open link ↗</a> · <a href="#" data-del="${r.id}">delete</a></div></div>`).join('')}`;
  app.querySelector('[data-add]').onclick=()=>{
    openModal(`<h2 class="big">Resource</h2><form id="rf2">${field('Name','name')}${field('Category','category','','Podcast / Words / …')}${field('Link','link')}<label class="lbl">Notes</label><textarea name="notes"></textarea><button class="btn" style="margin-top:12px">Save</button></form>`);
    $('#rf2').onsubmit=e=>{e.preventDefault();const o=Object.fromEntries(new FormData(e.target));o.id=uid();S.resources.push(o);save();route()};
  };
  app.querySelectorAll('[data-del]').forEach(a=>a.onclick=e=>{e.preventDefault();S.resources=S.resources.filter(x=>x.id!==a.dataset.del);save();route()});
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
