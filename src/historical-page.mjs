import {parseHistoricalLesson,safeLessonProgressKey} from "./historical-reader.mjs";
const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined&&text!==null)n.textContent=String(text);if(cls)n.className=cls;return n};
const push=(parent,...children)=>{for(const n of children)if(n)parent.append(n);return parent};
function btn(text,fn,cls="btn"){const b=el("button",text,cls);b.type="button";b.addEventListener("click",fn);return b}
const para=(text,cls)=>el("p",text,cls);
function groupSections(segments){
 const groups=[];let current={title:"Introdução e objetivos",blocks:[]};
 for(const part of segments){
  if(part.type==="heading"&&part.level<=2){
   if(current.blocks.length||groups.length){groups.push(current)}
   current={title:part.text,blocks:[]};
  }else current.blocks.push(part);
 }
 if(current.blocks.length||!groups.length)groups.push(current);
 return groups.filter(g=>g.title||g.blocks.length);
}
function load(key){try{const value=JSON.parse(localStorage.getItem(key)||"{}");return typeof value==="object"&&value?value:{}}catch{return {}}}
export function renderHistoricalLessonPage(root,lesson,onBack){
 const parsed=parseHistoricalLesson(lesson.raw_markdown);
 const groups=groupSections(parsed.segments);
 const key=safeLessonProgressKey(lesson);
 const previous=load(key);
 let step=Number.isInteger(previous.step)?Math.min(Math.max(previous.step,0),groups.length):0;
 let answers=previous.answers&&typeof previous.answers==="object"?previous.answers:{};
 let sourceOpen=false;
 const total=groups.length+1;
 const save=()=>{try{localStorage.setItem(key,JSON.stringify({step,answers}))}catch{announce("Este navegador não conseguiu guardar o progresso local.")}};
 root.replaceChildren();
 const notice=el("div",null,"historical-notice");
 notice.append(el("span","CONTEÚDO ORIGINAL · APRESENTAÇÃO RECONSTRUÍDA","pill good"),
  para("Os textos são recuperados da mensagem histórica. O código interativo original não pode ser executado diretamente no site. Questões reconhecidas aparecem em cartões; onde o gabarito original não foi verificado, a interface registra sua escolha, mas não atribui uma nota fictícia.","muted subtle"));
 root.append(notice);
 const header=el("section",null,"historical-hero");
 push(header,el("p",lesson.level+" · Parte "+String(lesson.part).padStart(2,"0"),"historical-eyebrow"),
  el("h1",lesson.title),para("Leia e pratique no seu ritmo. A aula permanece dividida em capítulos, e sua posição fica salva neste navegador.","muted"));
 const progressLabel=el("p",null,"historical-progress-label"),track=el("div",null,"historical-progress"),bar=el("div",null,"historical-progress-bar");
 track.setAttribute("role","progressbar");track.setAttribute("aria-valuemin","0");track.setAttribute("aria-valuemax",String(total));
 track.append(bar);header.append(progressLabel,track);root.append(header);
 const layout=el("div",null,"historical-layout"),toc=el("nav",null,"historical-toc"),main=el("div",null,"historical-main");
 toc.setAttribute("aria-label","Capítulos da aula");
 layout.append(toc,main);root.append(layout);
 const alert=el("p",null,"historical-alert");alert.setAttribute("role","status");root.prepend(alert);
 function announce(s){alert.textContent=s}
 function renderToc(){
  toc.replaceChildren(el("h2","Nesta aula"));
  for(let i=0;i<groups.length;i++){
   const b=btn((i+1)+". "+groups[i].title,()=>navigate(i),"historical-toc-btn");
   if(i===step){b.setAttribute("aria-current","step");b.classList.add("active")}
   toc.append(b);
  }
  const b=btn("Prática · "+parsed.questions.length+" questões",()=>navigate(groups.length),"historical-toc-btn");
  if(step===groups.length){b.setAttribute("aria-current","step");b.classList.add("active")}
  toc.append(b);
 }
 function renderBlocks(group,container){
  let list=null;
  for(const part of group.blocks){
   if(part.type==="heading"){list=null;container.append(el(part.level<=3?"h3":"h4",part.text,"historical-subtitle"));continue}
   if(part.type==="label"){list=null;container.append(el("h4",part.text,"historical-label"));continue}
   if(part.type==="list"){
    if(!list){list=el("ul",null,"historical-list");container.append(list)}
    list.append(el("li",part.text.replace(/^(?:•|\d+[\.)])\s*/,"")));continue
   }
   list=null;
   if(!part.text)continue;
   const isCode=/^\s*(?:<|onClick|onChange|=>|DIL\.)/.test(part.text);
   if(isCode)continue;
   const p=para(part.text,/^(?:[A-Za-z][\w\s']{0,45}:|I'm |Are you |Have you |I was |I have |I went )/.test(part.text)?"historical-chunk":"historical-paragraph");
   container.append(p);
  }
 }
 function renderPractice(){
  const p=el("section",null,"historical-section");
  push(p,el("span","PRÁTICA · ALTERNATIVAS RECUPERADAS","pill"),
    el("h2","Teste sua compreensão"),
    para("Estas alternativas foram identificadas no código original. A seleção funciona e fica salva; correção automática só será exibida após conferência individual do gabarito original.","muted"));
  if(!parsed.questions.length){p.append(para("Nenhuma questão de múltipla escolha com alternativas literais foi identificada nesta parte. Outras atividades podem estar presentes no texto integral.","notice"))}
  for(const [i,q] of parsed.questions.entries()){
   const field=el("fieldset",null,"historical-question");
   const legend=el("legend",null,"historical-question-title");
   push(legend,el("span",String(i+1).padStart(2,"0"),"historical-question-num"),el("span",q.question));
   field.append(legend);
   const options=el("div",null,"historical-options");
   const selected=el("p",answers[q.id]?"Resposta registrada.":"Selecione uma alternativa.","historical-selection");
   for(const opt of q.options){
    const label=el("label",null,"historical-option");
    const radio=el("input");radio.type="radio";radio.name=q.id;radio.value=opt.id;
    radio.checked=answers[q.id]===opt.id;
    const letter=el("span",opt.id.toUpperCase(),"historical-option-letter");
    radio.addEventListener("change",()=>{answers[q.id]=opt.id;save();selected.textContent="Resposta registrada. A correção desta questão ainda precisa de conferência com a fonte original.";for(const option of options.querySelectorAll(".historical-option"))option.classList.toggle("selected",option.querySelector("input").checked)});
    if(radio.checked)label.classList.add("selected");
    label.append(radio,letter,el("span",opt.text));options.append(label);
   }
   field.append(options,selected);p.append(field);
  }
  const count=Object.keys(answers).filter(id=>parsed.questions.some(q=>q.id===id)).length;
  p.append(para(count+" de "+parsed.questions.length+" questões com escolha registrada.","muted subtle"));
  const source=el("details",null,"historical-source");const summary=el("summary","Ver texto e código integrais da aula (para auditoria)");
  const description=para("A fonte integral permanece disponível, inclusive expressões e estados de componentes que ainda não foram convertidos. Sua visualização não executa códigos da conversa.","muted subtle");
  const raw=el("pre",lesson.raw_markdown,"historical-raw");
  source.append(summary,description,raw);p.append(source);
  return p;
 }
 function renderBody(){
  main.replaceChildren();
  if(step<groups.length){
   const group=groups[step],section=el("section",null,"historical-section");
   push(section,el("span","CAPÍTULO "+(step+1)+" DE "+groups.length,"pill"),el("h2",group.title));
   renderBlocks(group,section);
   section.append(para("Nota: blocos cuja apresentação dependia de código interativo permanecem disponíveis na fonte integral, ao final da seção de prática.","muted subtle"));
   main.append(section);
  }else main.append(renderPractice());
  const controls=el("div",null,"historical-controls");
  const prev=btn("← Anterior",()=>navigate(Math.max(step-1,0)),"btn");
  prev.disabled=step===0;
  const next=btn(step===total-1?"Concluir leitura":"Próxima etapa →",()=>{
   if(step===total-1){announce("Leitura percorrida. Questões ainda sem gabarito validado não são contadas como corrigidas.");main.scrollIntoView({block:"start"});return}
   navigate(step+1)
  },"btn primary");
  controls.append(prev,btn("Voltar ao curso",onBack,"btn secondary"),next);
  main.append(controls);
  progressLabel.textContent="Etapa "+(step+1)+" de "+total+" · "+Math.round(100*(step+1)/total)+"% do percurso de leitura";
  track.setAttribute("aria-valuenow",String(step+1));
  bar.style.width=(100*(step+1)/total)+"%";
  renderToc();
 }
 function navigate(n){step=n;save();renderBody();main.scrollIntoView({behavior:"auto",block:"start"})}
 renderBody();
}
