import {mountArchive} from "./archive-browser.mjs";
const PATHS={curriculum:"./curriculum/real_english_curriculum.json",demo:"./data/demo-lesson.json",pdfLesson:"./data/pdf-a0-aula-01.json",pdfPlan:"./data/pdf-initial-curriculum.json"};
const STORE_KEY="real-english-technical-demo-v1";
const root=document.getElementById("view");
const nav=document.getElementById("level-nav");
const status=document.getElementById("announcements");
document.getElementById("open-pdf-lesson").addEventListener("click",gotoPdfLesson);
document.getElementById("open-pdf-plan").addEventListener("click",()=>{route="pdf-plan";render();document.getElementById("main").focus()});
document.getElementById("open-private-archive").addEventListener("click",()=>{route="archive";render();document.getElementById("main").focus()});
let curriculum=null,demo=null,originalDemo=null,pdfLesson=null,pdfPlan=null,level="A1",route="catalog",cardIndex=0,activeStoreKey=STORE_KEY;
const emptyProgress=()=>({answers:{},checked:false,translation:false,grades:{},cardBack:false,dialogueIndex:0,dialogueHistory:[],writing:{},checks:{},transformations:{},shownModels:{},explorerChoice:"problem",explorerTranslation:false});
let progress=loadProgress();
function loadProgress(){try{return {...emptyProgress(),...JSON.parse(localStorage.getItem(activeStoreKey)||"{}")}}catch{return emptyProgress()}}
function save(){try{localStorage.setItem(activeStoreKey,JSON.stringify(progress))}catch{announce("Não foi possível salvar o progresso neste navegador.")}}
function announce(message){status.textContent=message}
function node(tag,text,cls){const n=document.createElement(tag);if(text!==undefined&&text!==null)n.textContent=String(text);if(cls)n.className=cls;return n}
function add(parent,...children){for(const x of children){if(x)parent.append(x)}return parent}
function button(text,fn,cls="btn"){const b=node("button",text,cls);b.type="button";b.addEventListener("click",fn);return b}
function panel(title){const p=node("section",null,"panel");if(title)p.append(node("h2",title));return p}
function pill(text,cls=""){return node("span",text,"pill "+cls)}
function para(text,cls=""){return node("p",text,cls)}
function divider(){return node("hr",null,"divider")}
function toolbar(...nodes){return add(node("div",null,"toolbar"),...nodes)}
function gotoDemo(){demo=originalDemo;activeStoreKey=STORE_KEY;progress=loadProgress();route="demo";cardIndex=0;render();document.getElementById("main").focus()}
function gotoPdfLesson(){demo=pdfLesson;activeStoreKey="real-english-pdf-a0-aula-01-v1";progress=loadProgress();route="pdf-lesson";cardIndex=0;render();document.getElementById("main").focus()}
function gotoCatalog(next){level=next;route="catalog";render();document.getElementById("main").focus()}
function renderNav(){nav.replaceChildren();for(const v of curriculum.volumes){const b=button(v.level,()=>gotoCatalog(v.level));b.setAttribute("aria-current",String(v.level===level));nav.append(b)}}
function render(){renderNav();root.replaceChildren();if(route==="archive")mountArchive(root,()=>gotoCatalog(level));else if(route==="pdf-plan")renderPdfPlan();else if(route==="demo"||route==="pdf-lesson")renderDemo();else renderCatalog()}
function renderCatalog(){
const v=curriculum.volumes.find(x=>x.level===level);const overview=panel(level+" · "+v.title);
const count=v.planned_lesson_count===null?"Quantidade original ainda não recuperada":v.planned_lesson_count+" posições no catálogo";
overview.append(pill(count),para(v.notes,"muted"));
if(level==="B1")overview.append(add(node("div",null,"notice"),node("strong","Demonstração técnica disponível"),para("A demonstração abaixo exercita perguntas, tradução revelável, cards, diálogos e escrita. Não é a aula integral original."),button("Abrir aula-piloto funcional",gotoDemo,"btn primary")));
root.append(overview);
if(!v.modules.length&&!v.lesson_records.length){root.append(add(panel("Fontes históricas pendentes"),para("Este nível ainda precisa de extração integral das conversas do curso. Não foram inventados títulos ou conteúdos para preencher as lacunas.")));return}
if(v.lesson_records.length){const p=panel("Aulas catalogadas");for(const l of v.lesson_records){const row=node("div",null,"lesson-row");const left=node("div");left.append(node("strong",String(l.number).padStart(2,"0")+" · "+(l.title||"Título original ainda não recuperado")),para(l.status.replaceAll("_"," "),"muted"));row.append(left);if(l.number===32)row.append(button("Testar componentes",gotoDemo,"btn small secondary"));else row.append(pill("Acervo original pendente","warning"));p.append(row)}root.append(p)}
for(const m of v.modules){const d=node("details",null,"module");d.append(node("summary",m.number+" · "+m.title+" · "+m.lessons.length+" partes"));const body=node("div",null,"module-body");for(const l of m.lessons){const row=node("div",null,"lesson-row"),left=node("div");left.append(node("strong",String(l.number).padStart(2,"0")+" · "+l.title),para(l.objective,"muted"));row.append(left,pill("Planejada; ainda não redigida","warning"));body.append(row)}d.append(body);root.append(d)}
}
function renderDemo(){
const heading=panel(demo.title);heading.append(pill(route==="pdf-lesson"?"EXEMPLO ORIGINAL DO PDF · ATIVIDADES NOVAS":"PILOTO · NÃO É O ORIGINAL",route==="pdf-lesson"?"good":"warning"),para(demo.subtitle),toolbar(button("← Voltar ao currículo",()=>gotoCatalog(route==="pdf-lesson"?"A1":"B1"))));root.append(heading);
const intro=panel("Objetivos");for(const objective of demo.objectives)intro.append(para("• "+objective));root.append(intro);
renderReading();renderExplanation();renderTransformations();renderExplorer();renderCards();renderDialogue();renderWriting();renderPronunciation();renderReview();if(route==="pdf-lesson")renderPdfOriginal();
}
function renderPdfOriginal(){
 const p=panel("Texto de referência · páginas 6–10 do PDF");
 if(!progress.checked){p.append(para("Após corrigir as questões da Parte 1, você poderá consultar a transcrição das seções originais do PDF, incluindo as traduções. Ela é apresentada separadamente das novas atividades criadas para esta versão web.","notice"));root.append(p);return}
 p.append(para("Estas seções transcrevem os exemplos e as explicações da aula demonstrativa do PDF. Exercícios, opções e diálogo adicionados ao app NÃO constam do original; confira a página indicada para cada seção.","notice"));
 for(const section of demo.sourceSections){
  const details=node("details",null,"module");details.append(node("summary","Página "+section.page+" — "+section.heading));
  const body=node("div",null,"module-body");body.append(para(section.lines.join("\n"),"reading"));details.append(body);p.append(details)
 }
 root.append(p)
}
function renderPdfPlan(){
 const p=panel("Planejamento inicial encontrado no PDF");
 p.append(pill("FONTE: PDF pp. 3–6 e 11–14"),para("Este planejamento original A0–B2 é uma proposta inicial, não o índice completo das aulas já redigidas. B2/C1 possuem planejamentos posteriores separados no catálogo atual.","notice"));
 p.append(toolbar(button("Abrir Aula 01 (PDF)",gotoPdfLesson,"btn primary"),button("← Voltar ao currículo",()=>gotoCatalog("A1"))));root.append(p);
 for(const level of pdfPlan.levels){
  const part=panel(level.level+" · "+level.title);part.append(pill("Páginas "+level.pages.join(", ")),para(level.objective),node("h3","Conteúdos previstos"),para(level.topics.join(" · "),"muted"),node("h3","Chunks documentados no PDF"));
  for(const chunk of level.chunks){const tile=node("div",null,"tile");tile.append(node("strong",chunk[0]),para(chunk[1]));part.append(tile)}
  root.append(part)
 }
 const m=panel("Unidade TO BE · mapa de 12 capítulos previstos");m.append(pill("PDF pp. 5–6"),para(pdfPlan.to_be_map.note));for(const [i,title] of pdfPlan.to_be_map.chapters.entries())m.append(para(String(i+1).padStart(2,"0")+" · "+title));root.append(m);
 const stages=panel("As oito etapas da aula");stages.append(pill("PDF p. 11"));for(const [i,label] of pdfPlan.lesson_stages.items.entries())stages.append(para((i+1)+". "+label));root.append(stages);
 const b=panel("Índice inicial de estruturas B2");b.append(pill("PDF p. 13"),para(pdfPlan.initial_b2_topics.note));for(const [i,title] of pdfPlan.initial_b2_topics.items.entries())b.append(para((i+1)+". "+title));root.append(b);
 const r=panel("Revisão por chunks e modalidades");r.append(pill("PDF p. 12"),para(pdfPlan.review_policy.rule),para("Card exemplar: "+pdfPlan.review_policy.front));root.append(r)
}
function renderReading(){
const r=demo.reading,p=panel("1 · Reading first: "+r.title);
p.append(pill("Leia em inglês antes da tradução"),para(r.english,"reading"));
const completed=r.questions.every(q=>progress.answers[q.id]);
p.append(node("h3","Check your understanding"));
for(const [i,q] of r.questions.entries()){const item=node("fieldset",null,"exercise");item.append(node("legend",String(i+1)+". "+q.stem));const opts=node("div",null,"options");
for(const o of q.options){const lab=node("label",null,"option"),radio=document.createElement("input");radio.type="radio";radio.name=q.id;radio.value=o.id;radio.checked=progress.answers[q.id]===o.id;radio.addEventListener("change",()=>{progress.answers[q.id]=o.id;progress.checked=false;progress.translation=false;save();render()});lab.append(radio,node("span",o.text));opts.append(lab)}item.append(opts);
if(progress.checked){const ok=progress.answers[q.id]===q.correct_option_id;item.append(add(node("div",null,"feedback"+(ok?"":" wrong")),pill(ok?"Correto":"Resposta: "+q.options.find(o=>o.id===q.correct_option_id).text,ok?"good":"warning"),para(q.explanation)))}
p.append(item)}
const actions=toolbar(button("Corrigir compreensão",()=>{progress.checked=true;save();render();announce("Questões de compreensão corrigidas.")},"btn primary"));actions.firstChild.disabled=!completed;p.append(actions);
if(progress.checked){const points=r.questions.filter(q=>progress.answers[q.id]===q.correct_option_id).length;p.append(para("Resultado de compreensão escrita: "+points+"/"+r.questions.length+". Este teste não avalia escuta ou fala.","status"));p.append(button(progress.translation?"Ocultar tradução":"Revelar tradução",()=>{progress.translation=!progress.translation;save();render()},"btn secondary"));if(progress.translation)p.append(para(r.translation_pt_br,"reading"))}
root.append(p)}
function renderExplanation(){const p=panel("2 · Explicações e contrastes");for(const item of demo.explanation){const x=node("div",null,"tile");x.append(node("h3",item.title),para(item.body));p.append(x)}root.append(p)}
function renderTransformations(){
 const p=panel("3 · Transformações com respostas reveláveis");
 p.append(para("Escreva sua versão antes de revelar o modelo. Respostas diferentes podem ser igualmente naturais; a comparação aqui é sua, não uma correção automática.","muted"));
 for(const task of demo.transformations){
  const box=node("div",null,"exercise");box.append(node("h3",task.prompt));
  const field=node("textarea",null,"input-area");field.setAttribute("aria-label",task.prompt);field.value=progress.transformations?.[task.id]||"";field.addEventListener("input",()=>{progress.transformations??={};progress.transformations[task.id]=field.value;save()});box.append(field);
  const shown=!!progress.shownModels?.[task.id];box.append(button(shown?"Ocultar modelo":"Revelar modelo e explicação",()=>{progress.shownModels??={};progress.shownModels[task.id]=!shown;save();render()},"btn secondary"));
  if(shown)box.append(add(node("div",null,"feedback"),para("Resposta-modelo: "+task.model_answer),para(task.explanation)));p.append(box)
 }
 root.append(p)}
function renderExplorer(){
 const data=demo.explorer,p=panel("4 · Explorador: "+data.title),label=node("label","Escolha a necessidade comunicativa","status"),select=node("select",null,"btn");
 select.setAttribute("aria-label","Necessidade comunicativa");
 for(const item of data.choices){const opt=node("option",item.label);opt.value=item.id;select.append(opt)}
 select.value=progress.explorerChoice||data.choices[0].id;
 select.addEventListener("change",()=>{progress.explorerChoice=select.value;progress.explorerTranslation=false;save();render()});
 const active=data.choices.find(x=>x.id===select.value)||data.choices[0],sample=node("div",null,"tile");
 sample.append(node("h3",active.english),para(active.note,"muted"));
 if(progress.explorerTranslation)sample.append(para(active.translation_pt_br));
 p.append(label,select,sample,button(progress.explorerTranslation?"Ocultar tradução":"Revelar tradução",()=>{progress.explorerTranslation=!progress.explorerTranslation;save();render()},"btn secondary"));
 root.append(p)}
function renderPronunciation(){
 const p=panel("8 · Pronúncia conectada: notas de estudo");
 p.append(para("Estas notas ajudam a reconhecer os chunks. Não há áudio integrado nesta demonstração e a leitura delas não permite avaliar pronúncia nem escuta.","muted"));
 for(const item of demo.pronunciation){const box=node("div",null,"tile");box.append(node("h3",item.phrase),para(item.note));p.append(box)}
 root.append(p)}
function renderCards(){
const p=panel("5 · Flashcards com autoavaliação"),c=demo.chunks[cardIndex];p.append(para("Frente em inglês. Tente compreender antes de virar o card.","muted"));
p.append(pill("Card "+(cardIndex+1)+"/"+demo.chunks.length));
const face=node("div",null,"flashcard");face.append(node("strong",c.front));if(progress.cardBack){face.append(para(c.back_pt),para(c.function,"muted"),para(c.usage,"muted"))}else face.append(para("Tente identificar o sentido e a função do chunk.","muted"));p.append(face);
p.append(toolbar(button(progress.cardBack?"Ocultar verso":"Revelar verso",()=>{progress.cardBack=!progress.cardBack;save();render()},"btn primary"),
button("← Anterior",()=>{cardIndex=Math.max(0,cardIndex-1);progress.cardBack=false;save();render()}),
button("Próximo →",()=>{cardIndex=Math.min(demo.chunks.length-1,cardIndex+1);progress.cardBack=false;save();render()})));
if(progress.cardBack){const actions=toolbar();for(const grade of ["Errei","Difícil","Fácil"]){actions.append(button(grade,()=>{progress.grades[c.id]=grade;cardIndex=Math.min(cardIndex+1,demo.chunks.length-1);progress.cardBack=false;save();render();announce("Card avaliado como "+grade+".")},"btn small"))}p.append(actions)}
p.append(para("Avaliados: "+Object.keys(progress.grades).length+"/"+demo.chunks.length+" · Errei: "+Object.values(progress.grades).filter(v=>v==="Errei").length+" · Difícil: "+Object.values(progress.grades).filter(v=>v==="Difícil").length,"subtle muted"));root.append(p)}
function renderDialogue(){
const d=demo.dialogue,p=panel("6 · Diálogo interativo: "+d.title);p.append(para("Escolha a próxima fala em inglês. O diálogo é linear, com feedback por opção.","muted"));
for(const [i,h] of progress.dialogueHistory.entries()){const item=node("div",null,"dialogue-turn");item.append(para((i+1)+". "+h.prompt),para("YOU: "+h.response),pill(h.correct?"Escolha adequada":"Precisa de revisão",h.correct?"good":"warning"),para(h.feedback,"muted"));p.append(item)}
const t=d.turns[progress.dialogueIndex];if(t){p.append(node("h3",(progress.dialogueIndex+1)+". "+t.speaker+": "+t.prompt));for(const o of t.options)p.append(button(o.text,()=>{progress.dialogueHistory.push({prompt:t.prompt,response:o.text,feedback:o.feedback,correct:o.correct});progress.dialogueIndex++;save();render();announce(o.feedback)},"btn full"))}else{const points=progress.dialogueHistory.filter(h=>h.correct).length;p.append(para("Diálogo finalizado: "+points+"/"+d.turns.length+" respostas adequadas ao cenário. Agora tente reconstruir a conversa sem alternativas.","status"))}
p.append(toolbar(button("Reiniciar diálogo",()=>{progress.dialogueIndex=0;progress.dialogueHistory=[];save();render()},"btn small")));root.append(p)}
function renderWriting(){
const p=panel("7 · Produção escrita independente");p.append(para("As respostas ficam neste navegador. A correção por IA ainda não foi integrada: o aplicativo não inventará feedback para texto livre.","notice"));
for(const task of demo.writing_tasks){const box=node("div",null,"exercise");box.append(node("h3",task.title),para(task.prompt));const area=node("textarea",null,"input-area");area.value=progress.writing[task.id]||"";area.setAttribute("aria-label",task.title);area.placeholder="Write your answer in English…";const counter=para(wordCount(area.value)+" palavras","muted subtle");area.addEventListener("input",()=>{progress.writing[task.id]=area.value;counter.textContent=wordCount(area.value)+" palavras";save()});box.append(area,counter,para("Critérios: "+task.suggested_criteria.join("; ")+".","muted subtle"));p.append(box)}
p.append(button("Exportar minhas respostas em JSON",()=>{const contents={export_type:"real_english_demo_writing",lesson_id:demo.id,created_at:new Date().toISOString(),answers:demo.writing_tasks.map(t=>({task_id:t.id,prompt:t.prompt,answer:progress.writing[t.id]||""}))};downloadJson("real-english-minhas-respostas.json",contents);announce("Arquivo de respostas criado localmente.")},"btn secondary"));
p.append(para("O arquivo exportado contém somente as respostas da demonstração. A decisão de compartilhar esse material com qualquer serviço externo é sua.","subtle muted"));root.append(p)}
function wordCount(s){return s.trim()?s.trim().split(/\s+/).length:0}
function downloadJson(filename,value){const file=new Blob([JSON.stringify(value,null,2)],{type:"application/json;charset=utf-8"}),url=URL.createObjectURL(file),a=node("a");a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000)}
function renderReview(){
const p=panel("9 · Autoavaliação e revisão direcionada");
for(const [i,goal] of demo.objectives.entries()){const lab=node("label",null,"option"),c=node("input");c.type="checkbox";c.checked=!!progress.checks[i];c.addEventListener("change",()=>{progress.checks[i]=c.checked;save()});lab.append(c,node("span",goal));p.append(lab)}
const misses=demo.reading.questions.filter(q=>progress.checked&&progress.answers[q.id]!==q.correct_option_id).map(q=>q.explanation);
if(progress.checked)p.append(para(misses.length?"Revise estes contrastes: "+misses.join(" "):"Questões de leitura corretas. Confirme a habilidade na escrita independente.","muted"));
p.append(para(route==="pdf-lesson"?"O PDF apresenta esta Aula 01 como exemplo inicial do nível A0. Os exercícios criados para o site não são os exercícios originais; concluí-los não certifica proficiência.":"Concluir a demonstração não significa concluir a aula original, o volume B1 ou uma certificação CEFR.","subtle muted"));
p.append(button("Reiniciar somente o progresso desta aula",()=>{if(confirm("Apagar respostas e avaliações locais apenas desta aula?")){progress=emptyProgress();cardIndex=0;save();render()}},"btn small"));root.append(p)}
(async()=>{try{const [c,l,p,s]=await Promise.all([fetch(PATHS.curriculum),fetch(PATHS.demo),fetch(PATHS.pdfLesson),fetch(PATHS.pdfPlan)]);if(!c.ok||!l.ok||!p.ok||!s.ok)throw new Error("Falha ao carregar os arquivos JSON");curriculum=await c.json();originalDemo=await l.json();pdfLesson=await p.json();pdfPlan=await s.json();demo=originalDemo;render()}catch(e){root.replaceChildren(add(panel("Não foi possível carregar o curso"),para(e.message),para("Sirva a pasta por um servidor local (por exemplo: npm run dev). Abrir index.html diretamente como arquivo pode bloquear a leitura dos JSON.")))}})();
