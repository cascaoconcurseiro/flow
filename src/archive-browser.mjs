import {normalizeExport,normalizeSourcePackage,orderedNodes,activePath,interactionInventory,candidateCourseConversation,safeConversationFilename} from "./archive-core.mjs";
let all=[],selected=null,sourcePackage=null,showCode=false,filterCourse=true,query="";
const dom=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined&&text!==null)e.textContent=String(text);if(cls)e.className=cls;return e};
const append=(p,...items)=>{items.filter(Boolean).forEach(x=>p.append(x));return p};
const action=(text,fn,cls="btn")=>{const b=dom("button",text,cls);b.type="button";b.addEventListener("click",fn);return b};
function exportLocal(filename,object){
 const blob=new Blob([JSON.stringify(object,null,2)+"\n"],{type:"application/json;charset=utf-8"});
 const url=URL.createObjectURL(blob),a=dom("a");a.download=filename;a.href=url;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function panel(title){const e=dom("section",null,"panel");if(title)e.append(dom("h2",title));return e}
export function mountArchive(host,onBack){
 host.replaceChildren();
 const head=panel("Acervo privado — inspecionar fontes originais");
 head.append(dom("p","Selecione o conversations.json exportado da sua conta ou o pacote literal criado por npm run build:source-package. O arquivo será lido somente neste navegador; não será enviado à rede, armazenado em localStorage ou incluído no GitHub.","notice"));
 head.append(dom("p","O leitor exibe todas as ramificações da conversa presentes no JSON e permite baixar a conversa selecionada sem resumi-la. Isso não reconstrói automaticamente o estado temporário de botões nem recupera anexos ausentes.","muted"));
 head.append(action("← Voltar ao curso",onBack));
 const picker=dom("input");picker.type="file";picker.accept=".json,application/json";picker.setAttribute("aria-label","Selecionar conversations.json ou pacote literal para inspeção local");
 picker.addEventListener("change",async()=>{
  const f=picker.files?.[0];if(!f)return;
  all=[];selected=null;sourcePackage=null;
  try{
   if(f.size>200_000_000){throw new Error("Arquivo acima de 200 MB: use o importador de linha de comando para evitar esgotar a memória do navegador.")}
   const parsed=JSON.parse(await f.text());
   if(parsed?.package_type==="real_english_lossless_source_package"){
    sourcePackage=normalizeSourcePackage(parsed);renderSourcePackage(host);
   }else{
    all=normalizeExport(parsed);renderIndex(host,onBack);
   }
  }catch(error){head.append(dom("p","Falha ao ler arquivo: "+error.message,"notice"))}
 });
 head.append(dom("h3","Abrir arquivo local"),picker,dom("p","Arquivos ZIP precisam ser extraídos primeiro. Para preservar uma cópia integral com hash SHA-256 e manifesto, use o importador de linha de comando descrito no README.","subtle muted"));host.append(head);
 if(sourcePackage)renderSourcePackage(host);
 if(all.length)renderIndex(host,onBack);
}
function renderSourcePackage(host){
 host.querySelectorAll(".archive-index,.archive-detail,.source-package").forEach(x=>x.remove());
 const box=panel("Pacote literal recuperado");box.classList.add("source-package");
 const levels=sourcePackage.curriculum_snapshot?.volumes?.map(volume=>volume.level).join(" → ")||"currículo não informado";
 box.append(dom("p",levels+" · "+sourcePackage.sources.length+" fontes preservadas","status"));
 box.append(dom("p","O texto abaixo é exibido literalmente, página por página. Os intervalos apenas classificam a origem; não transformam planejamento em aula pronta.","notice"));
 for(const source of sourcePackage.sources){
  const section=dom("details",null,"module");
  section.append(dom("summary",source.source_id+" · "+source.page_count+" páginas"));
  const body=dom("div",null,"module-body");
  body.append(dom("p","Proveniência: "+source.provenance_status+" · SHA-256: "+source.sha256,"muted subtle"));
  if(source.notes)body.append(dom("p",source.notes,"muted"));
  const ranges=dom("div",null,"tile");ranges.append(dom("h3","Índice de conteúdo"));
  for(const range of source.ranges||[])ranges.append(dom("p",`Páginas ${range.start_page}–${range.end_page} · ${range.content_kind}${range.label?" · "+range.label:""}`,"subtle"));
  body.append(ranges);
  for(const page of source.pages){
   const pageBox=dom("details",null,"module");
   pageBox.append(dom("summary","Página "+page.page+" · "+page.sha256.slice(0,12)));
   pageBox.append(dom("pre",page.text,"archive-pre"));body.append(pageBox);
  }
  section.append(body);box.append(section);
 }
 host.append(box);
}
function renderIndex(host,onBack){
 host.querySelectorAll(".archive-index,.archive-detail").forEach(x=>x.remove());
 const box=panel("Conversas encontradas: "+all.length);box.classList.add("archive-index");
 const search=dom("input",null,"archive-search");search.type="search";search.placeholder="Buscar título ou identificador";search.setAttribute("aria-label","Buscar conversas");search.value=query;
 const only=dom("input");only.type="checkbox";only.checked=filterCourse;const label=append(dom("label",null,"option"),only,dom("span","Mostrar apenas possíveis conversas de inglês (filtro indicativo, não definitivo)"));
 const choices=dom("div"),count=dom("p",null,"muted");
 function paint(){
  choices.replaceChildren();
  const found=all.filter(c=>(!filterCourse||candidateCourseConversation(c))&&String(c.title??"").concat(" ",c.id??"").toLowerCase().includes(query.toLowerCase()));
  count.textContent=found.length+" conversas exibidas. Confira manualmente, pois a classificação automática por título pode omitir aulas reais.";
  for(const c of found.slice(0,180)){
   const row=dom("div",null,"lesson-row"),col=dom("div");
   col.append(dom("strong",c.title??"(sem título)"),dom("p","ID: "+(c.id??"(sem ID)"),"muted subtle"));
   row.append(col,action("Inspecionar",()=>{selected=c;showCode=false;renderDetail(host,onBack)},"btn small secondary"));choices.append(row)
  }
  if(found.length>180)choices.append(dom("p","Exibindo 180 resultados. Refine a busca para localizar outras conversas.","muted"));
 }
 search.addEventListener("input",()=>{query=search.value;paint()});
 only.addEventListener("change",()=>{filterCourse=only.checked;paint()});
 box.append(search,label,count,choices);host.append(box);paint();if(selected)renderDetail(host,onBack)
}
function renderDetail(host,onBack){
 host.querySelector(".archive-detail")?.remove();if(!selected)return;
 const p=panel("Conversa original: "+(selected.title??"(sem título)"));p.classList.add("archive-detail");
 const nodes=orderedNodes(selected),inventory=interactionInventory(selected),path=new Set(activePath(selected));
 p.append(dom("p","ID: "+(selected.id??"(sem ID)")+" · "+inventory.message_count+" mensagens mapeadas · "+inventory.node_count+" nós · "+inventory.active_path_count+" nós no caminho ativo","muted"));
 p.append(dom("p","Este leitor preserva todas as ramificações presentes no JSON. Ausência de um componente no inventário não significa que ele não existisse visualmente no ChatGPT.","notice"));
 const controls=dom("div",null,"toolbar");
 controls.append(action("Baixar conversa bruta selecionada",()=>exportLocal(safeConversationFilename(selected.id??"unknown"),selected),"btn primary"));
 controls.append(action("Exportar inventário",()=>exportLocal("real-english-interacoes-"+safeConversationFilename(selected.id??"unknown"),interactionInventory(selected))));
 controls.append(action(showCode?"Mostrar só leitura":"Mostrar fonte dos controles",()=>{showCode=!showCode;renderDetail(host,onBack)}));
 p.append(controls);
 const comps=dom("div",null,"tile");
 comps.append(dom("h3","Inventário de controles presentes no texto"));
 for(const [key,value] of Object.entries(inventory.component_occurrences)){if(value>0)comps.append(dom("span",key+": "+value,"pill"))}
 comps.append(dom("p","Blocos de estado declarados: "+inventory.hook_blocks+" · Ações registradas: "+inventory.host_actions+" · Partes não textuais: "+inventory.non_text_part_count,"muted subtle"));
 p.append(comps);
 const tabs=dom("div",null,"toolbar");const allBtn=action("Todas as mensagens e ramificações",()=>showNodes(false),"btn small"),activeBtn=action("Apenas caminho ativo",()=>showNodes(true),"btn small");tabs.append(allBtn,activeBtn);p.append(tabs);
 const messages=dom("div");p.append(messages);
 function showNodes(onlyActive){
  messages.replaceChildren();
  const displayed=nodes.filter(n=>n.message&&(!onlyActive||path.has(n.id)));
  for(const [i,n] of displayed.entries()){
   const section=dom("details",null,"module"),label=dom("summary",(i+1)+". "+n.role+" · "+n.id+(path.has(n.id)?" · caminho ativo":" · outra ramificação"));
   section.append(label);
   const body=dom("div",null,"module-body");
   const raw=n.text||(n.message?"[Sem texto simples; conteúdo bruto preservado no JSON]":"[Sem mensagem]");
   if(showCode){body.append(dom("pre",raw,"archive-pre"));const rawNode=dom("details");rawNode.append(dom("summary","Ver nó e metadados integrais em JSON"),dom("pre",JSON.stringify(n.raw_node,null,2),"archive-pre"));body.append(rawNode)}
   else body.append(dom("p",raw,"reading archive-pre"));
   section.append(body);messages.append(section)
  }
  if(!displayed.length)messages.append(dom("p","Nenhuma mensagem com conteúdo neste filtro."));
 }
 showNodes(false);
 host.append(p);p.scrollIntoView({block:"start",behavior:"auto"})
}
