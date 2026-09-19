/**
 * Helpers puros para inspecionar um JSON de exportação de conversas SEM perder ramificações.
 * Executáveis tanto no navegador como em Node. Nunca fazem rede, eval ou escrita.
 */
export function normalizeExport(value) {
  const conversations=Array.isArray(value)?value:Array.isArray(value?.conversations)?value.conversations:null;
  if(!conversations)throw new Error("Formato inválido: era esperado um array de conversas do ChatGPT.");
  return conversations.filter(v=>v&&typeof v==="object");
}
export function normalizeSourcePackage(value){
  if(value?.package_type!=="real_english_lossless_source_package"||!Array.isArray(value.sources)){
    throw new Error("Formato inválido: era esperado um pacote literal de fontes do REAL ENGLISH.");
  }
  for(const source of value.sources){
    if(!source?.source_id||!Array.isArray(source.pages)||source.pages.some(page=>!Number.isInteger(page?.page)||typeof page?.text!=="string")){
      throw new Error("Pacote de fontes incompleto ou inválido.");
    }
  }
  return value;
}
export function extractMessageText(message){
  const content=message?.content;
  if(!content)return "";
  const parts=content.parts;
  if(Array.isArray(parts)){
    return parts.map(p=>{
      if(typeof p==="string")return p;
      if(p&&typeof p.text==="string")return p.text;
      if(p&&typeof p.content==="string")return p.content;
      if(p===null||p===undefined)return "";
      return "[PARTE NÃO TEXTUAL PRESERVADA NO JSON BRUTO: "+(typeof p==="object"?Object.keys(p).join(", "):typeof p)+"]";
    }).join("\n");
  }
  if(typeof content.text==="string")return content.text;
  if(typeof content.result==="string")return content.result;
  if(typeof content==="string")return content;
  return "";
}
export function orderedNodes(conversation){
  const mapping=conversation?.mapping;
  if(!mapping||typeof mapping!=="object")return [];
  const nodes=Object.entries(mapping).filter(([,v])=>v&&typeof v==="object").map(([id,node])=>({
    id:String(node.id??id),
    parent:node.parent??null,
    children:Array.isArray(node.children)?node.children:[],
    role:node.message?.author?.role??"unknown",
    create_time:node.message?.create_time??node.create_time??0,
    text:extractMessageText(node.message),
    message:node.message??null,
    raw_node:node
  }));
  // Ordenação estável; não remove branches alternativas. node.id permite conferir a fonte.
  nodes.sort((a,b)=>(Number(a.create_time)||0)-(Number(b.create_time)||0)||a.id.localeCompare(b.id));
  return nodes;
}
export function activePath(conversation){
  const map=conversation?.mapping??{};
  let id=conversation?.current_node,seen=new Set(),path=[];
  while(id&&map[id]&&!seen.has(id)){seen.add(id);const n=map[id];path.push(String(n.id??id));id=n.parent}
  return path.reverse();
}
const COMPONENTS=["button","radio-group","radio","checkbox","textarea","input","select","slider","date-picker","segmented-control","pressable","popover","WritingBlock","CodeBlock","AsyncImage"];
export function interactionInventory(conversation){
 const messages=orderedNodes(conversation),counts={};
 for(const key of COMPONENTS)counts[key]=0;
 let hook_blocks=0,host_actions=0,question_signs=0;
 for(const entry of messages){
  const raw=entry.text;
  for(const tag of COMPONENTS){
    const escaped=tag.replace(/[.*+?^$\x7b\x7d()|[\]\\]/g,"\\$&");
    counts[tag]+=(raw.match(new RegExp("<"+escaped+"(?=[\\s/>])","g"))??[]).length;
  }
  hook_blocks+=(raw.match(/\{\@body\b/g)??[]).length;
  host_actions+=(raw.match(/GenUI\.(?:issueNewTurn|copy|openUrl)\b/g)??[]).length;
  question_signs+=(raw.match(/\?/g)??[]).length;
 }
 return {node_count:Object.keys(conversation?.mapping??{}).length,message_count:messages.filter(n=>n.message).length,non_text_part_count:messages.reduce((sum,n)=>sum+(n.message?.content?.parts??[]).filter(p=>typeof p!=="string").length,0),all_branches_included:true,active_path_count:activePath(conversation).length,component_occurrences:counts,hook_blocks,host_actions,question_marks:question_signs,widget_runtime_state_in_export:"not_assured",source_hash:"compute separately if preserving original bytes",limitations:["Occurrence counts are NOT proof that widgets can run outside ChatGPT.","All mapping branches preserved in raw source, even when active_path_count is smaller.","Answer keys/options stored as JavaScript expressions require separate parsing and manual validation; never infer keys from counts."]};
}
export function candidateCourseConversation(conversation){
 const title=String(conversation?.title??"");
 const n=orderedNodes(conversation);
 const first=n.map(m=>m.text).filter(Boolean).slice(0,3).join(" ").slice(0,2000);
 return /REAL\s*ENGLISH|Grammar Through Chunks/i.test(title+" "+first)||/\b(?:A1|A2|B1|B2|C1)\b/i.test(title)&&/ingl[eê]s|grammar|volume|curso/i.test(title+" "+first);
}
export function safeConversationFilename(id){return "real-english-conversation-"+String(id).replace(/[^a-zA-Z0-9_-]/g,"_").slice(0,85)+".json"}
