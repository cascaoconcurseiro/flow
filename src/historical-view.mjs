import {parseHistoricalLesson} from "./historical-parser.mjs";
const make=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined&&text!==null)e.textContent=String(text);if(cls)e.className=cls;return e};
const button=(text,fn,cls="btn")=>{const b=make("button",text,cls);b.type="button";b.addEventListener("click",fn);return b};
function format(target,source){
 for(const block of source.split(/\n\s*\n/).map(s=>s.trim()).filter(Boolean)){
  const lines=block.split("\n").map(s=>s.trim()).filter(Boolean);
  if(lines.every(s=>/^[-•]\s/.test(s))){const ul=make("ul");for(const line of lines)ul.append(make("li",line.replace(/^[-•]\s*/,"")));target.append(ul);continue}
  if(lines.every(s=>s.includes("  |  "))){const box=make("div",null,"study-table");for(const line of lines)box.append(make("div",line,"study-table-row"));target.append(box);continue}
  const p=make("p",null,/^(CHUNK|FRENTE|VERSO|AFIRMAÇÃO|PERGUNTA|NEGAÇÃO)/i.test(block)?"study-callout":"study-paragraph");
  for(const [i,line] of lines.entries()){
   if(i)p.append(document.createElement("br"));
   const re=/\*\*([^*\n]+)\*\*/g;let m,pos=0;
   while((m=re.exec(line))){if(m.index>pos)p.append(document.createTextNode(line.slice(pos,m.index)));p.append(make("strong",m[1]));pos=re.lastIndex}
   if(pos<line.length)p.append(document.createTextNode(line.slice(pos)));
  }
  target.append(p);
 }
}
export function mountHistoricalLesson(host,lesson,onBack){
 const chapters=parseHistoricalLesson(lesson.raw_markdown),key="real-english-study-v2-"+lesson.id;
 const blank=()=>({chapter:0,visited:[],answers:{},checked:{},revealed:{},completed:false});
 let state;try{state={...blank(),...JSON.parse(localStorage.getItem(key)||"{}")}}catch{state=blank()}
 state.chapter=Math.max(0,Math.min(chapters.length-1,state.chapter||0));
 const save=()=>{try{localStorage.setItem(key,JSON.stringify(state))}catch{}};
 const navigate=i=>{state.chapter=Math.max(0,Math.min(chapters.length-1,i));if(!state.visited.includes(state.chapter))state.visited.push(state.chapter);save();render();document.getElementById("main")?.focus()};
 function render(){
  const c=chapters[state.chapter],id=String(state.chapter),answers=state.answers[id]||{};
  host.replaceChildren();
  const head=make("header",null,"study-hero");
  const top=make("div",null,"study-hero-top");
  top.append(button("← Meu curso",onBack,"btn study-back"),make("span",lesson.level+" · Parte "+String(lesson.part).padStart(2,"0"),"study-tag"));
  head.append(top,make("h1",lesson.title),make("p",chapters.length+" seções · retomada automática neste navegador","study-muted"));
  const track=make("div",null,"study-progress-track"),fill=make("div",null,"study-progress-fill");
  fill.style.width=Math.round(100*new Set(state.visited).size/Math.max(1,chapters.length))+"%";track.append(fill);head.append(track);
  head.append(make("p",new Set(state.visited).size+" de "+chapters.length+" seções visitadas"+(state.completed?" · percurso concluído":""),"study-muted"));host.append(head);
  const nav=make("nav",null,"study-chapter-nav");nav.setAttribute("aria-label","Índice das seções da aula");
  for(const [i,ch] of chapters.entries()){const b=button(String(i+1).padStart(2,"0")+" · "+ch.title,()=>navigate(i),"study-chapter-link"+(i===state.chapter?" active":""));if(i===state.chapter)b.setAttribute("aria-current","step");nav.append(b)}
  host.append(nav);
  const article=make("article",null,"study-chapter");
  article.append(make("div","ETAPA "+String(state.chapter+1).padStart(2,"0")+" / "+chapters.length,"study-eyebrow"),make("h2",c.title));
  if(c.text)format(article,c.text);else article.append(make("p","Esta seção contém controles históricos que precisam de conversão adicional.","study-muted"));
  if(c.questions.length){
   const quiz=make("section",null,"study-questions");quiz.append(make("h3","Check your understanding"),make("p","Escolha uma opção por pergunta. O feedback aparece somente depois da correção.","study-muted"));
   for(const [i,q] of c.questions.entries()){
    const field=make("fieldset",null,"study-question"),legend=make("legend",null,"study-question-title");
    legend.append(make("span",String(i+1).padStart(2,"0"),"study-number"),document.createTextNode(q.stem));field.append(legend);
    const opts=make("div",null,"study-options");
    for(const [j,opt] of q.options.entries()){
     const label=make("label",null,"study-option"+(answers[q.id]===j?" selected":"")),radio=make("input");
     radio.type="radio";radio.name="historical-"+state.chapter+"-"+i;radio.value=String(j);radio.checked=answers[q.id]===j;
     radio.addEventListener("change",()=>{
      state.answers[id]??={};state.answers[id][q.id]=j;delete state.checked[id];delete state.revealed[id];save();
      if(quiz.querySelector(".study-results")||quiz.querySelector(".study-feedback"))render();
      else opts.querySelectorAll(".study-option").forEach(x=>x.classList.toggle("selected",x.querySelector("input")?.checked));
     });
     label.append(radio,make("span",String.fromCharCode(65+j),"study-choice-letter"),make("span",opt,"study-choice-text"));opts.append(label);
    }
    field.append(opts);
    if(state.checked[id]){
     const known=q.answer>=0,correct=known&&answers[q.id]===q.answer;
     const fb=make("div",null,"study-feedback "+(!known?"neutral":correct?"correct":"incorrect"));
     fb.append(make("strong",!known?"Resposta registrada":correct?"Correto!":"Vamos revisar"));
     if(known&&!correct)fb.append(make("p","Resposta indicada: "+q.options[q.answer]));
     fb.append(make("p",q.explanation||"Confira a explicação da seção."));field.append(fb);
    }
    quiz.append(field);
   }
   const check=button(state.checked[id]?"Corrigir novamente":"Corrigir minhas respostas",()=>{state.checked[id]=true;save();render()},"btn primary");
   check.disabled=c.questions.some(q=>answers[q.id]===undefined);quiz.append(check);
   if(state.checked[id]){
    const known=c.questions.filter(q=>q.answer>=0),correct=known.filter(q=>answers[q.id]===q.answer).length;
    quiz.append(make("p",known.length?correct+" / "+known.length+" com gabarito identificado":"Respostas registradas; este bloco precisa de revisão do gabarito original.","study-results"));
   }
   article.append(quiz);
  }
  if(c.translation){
   const gated=c.questions.length>0&&!state.checked[id];article.append(make("h3","Tradução contextual"));
   if(gated)article.append(make("p","Corrija as questões desta seção antes de revelar a tradução.","study-muted"));
   const b=button(state.revealed[id]?"Ocultar tradução":"Revelar tradução",()=>{state.revealed[id]=!state.revealed[id];save();render()},"btn secondary");b.disabled=gated;article.append(b);
   if(state.revealed[id]){const t=make("div",null,"study-translation");format(t,c.translation);article.append(t)}
  }
  if(c.hasOriginalControls)article.append(make("aside","Alguns seletores, diálogos e controles da conversa original ainda exigem conversão específica. O texto original está preservado abaixo para conferência; nenhum código importado é executado.","study-source-note"));
  const original=make("details",null,"study-original");
  const sourceGated=c.questions.length>0&&!state.checked[id];
  if(sourceGated)original.append(make("summary","Fonte histórica disponível depois da correção das questões"),make("p","Para manter a compreensão em inglês primeiro, confira o código e o gabarito da fonte somente depois de enviar suas respostas.","study-muted"));
  else original.append(make("summary","Conferir fonte histórica desta seção"),make("pre",c.source,"study-source-code"));
  if(sourceGated)original.addEventListener("toggle",()=>{if(original.open)original.open=false});
  article.append(original);
  const foot=make("div",null,"study-bottom-nav");
  const prev=button("← Seção anterior",()=>navigate(state.chapter-1));prev.disabled=state.chapter===0;foot.append(prev);
  if(state.chapter<chapters.length-1)foot.append(button("Continuar →",()=>navigate(state.chapter+1),"btn primary"));
  else foot.append(button(state.completed?"Conclusão registrada ✓":"Concluir percurso desta aula",()=>{state.completed=true;save();render()},"btn primary"));
  article.append(foot);
  if(state.completed&&state.chapter===chapters.length-1)article.append(make("p","Percurso registrado. Isso não representa certificação CEFR; atividades abertas podem precisar de correção.","study-complete"));
  host.append(article);
 }
 if(!state.visited.includes(state.chapter))state.visited.push(state.chapter);save();render();
}
