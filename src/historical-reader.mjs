/** Renderização estática segura; nunca executa o código original do chat. */
const sourceAttr=/\bvalue\s*=\s*["']([^"']+)["']/;
const cleanInline=s=>String(s||"").replace(/<[^>]*>/g,"").replace(/\*\*(.*?)\*\*/g,"$1").replace(/\{[^\n{}]*\}/g,"").replace(/[ \t]+/g," ").trim();
function extractQuestions(raw){
 const out=[],pattern=/<radio-group\b[\s\S]*?<\/radio-group\s*>/gi;
 for(const m of raw.matchAll(pattern)){
  const options=[...m[0].matchAll(/<radio(?=[\s>])([^>]*)>([\s\S]*?)<\/radio\s*>/gi)]
    .map(x=>({id:x[1].match(sourceAttr)?.[1]??"",text:cleanInline(x[2])})).filter(x=>x.id&&x.text);
  if(options.length<2)continue;
  const prior=raw.slice(Math.max(0,m.index-850),m.index);
  const texts=[...prior.matchAll(/<(?:text|title|label)\b[^>]*>([\s\S]*?)<\/(?:text|title|label)\s*>/gi)]
    .map(x=>cleanInline(x[1])).filter(Boolean);
  const ranked=texts.filter(t=>/^(?:\d+[\.)]\s*|(?:what|why|how|where|when|which|who|do|does|did|is|are|was|were|have|has|can|could|should)\b)/i.test(t));
  out.push({offset:m.index,end:m.index+m[0].length,question:ranked.at(-1)??texts.at(-1)??"Escolha uma opção para a pergunta apresentada na fonte.",options});
 }
 return out;
}
export function parseHistoricalLesson(raw){
 if(typeof raw!=="string")throw Error("Conteúdo histórico indisponível");
 const qs=extractQuestions(raw),segments=[],lines=raw.split("\n");let offset=0,skip=0;
 for(const line of lines){
  const from=offset;offset+=line.length+1;const s=line.trim();
  if(s.startsWith("{@body")||s.startsWith("{@module"))continue;
  if(/\{#(?:if|each|await)\b/.test(s)){skip++;continue}
  if(/\{\/(?:if|each|await)\}/.test(s)){skip=Math.max(0,skip-1);continue}
  if(skip>0||/^\{:(?:else|then|catch)\b/.test(s))continue;
  if(qs.some(q=>from>=q.offset&&from<q.end))continue;
  if(/^<\/?(?:radio-group|radio|button|checkbox|textarea|input|select|slider|segmented-control|date-picker|pressable|popover|WritingBlock|AppBlock)\b/i.test(s))continue;
  if(!s)continue;
  const heading=s.match(/^(#{1,5})\s+(.+)$/);
  if(heading){segments.push({type:"heading",level:heading[1].length,text:cleanInline(heading[2])});continue}
  if(/^(?:---+|<divider\b|<\/(?:box|col|row|grid|grid-item|flow|flow-item|table|table-row|table-cell|list|list-item|card|carousel|carousel-item)>\s*$)/i.test(s))continue;
  if(/^<\/?[A-Za-z][^>]*>\s*$/.test(s))continue;
  const text=cleanInline(s);
  if(!text||/^(?:\{|\}|=>|const |let |return |onClick=|onChange=)/.test(text))continue;
  if(text.length>1000&&/[{};]/.test(text))continue;
  const type=/^(?:[-*]|\d+[\.)])\s+/.test(text)?"list":/^(?:CHUNK\s*\d+|AULA\s*\d+)/i.test(text)?"label":"paragraph";
  if(text===segments.at(-1)?.text&&type!=="heading")continue;
  segments.push({type,text:type==="list"?text.replace(/^[-*]\s+/,"• "):text});
 }
 return {segments,questions:qs.map((q,i)=>({...q,id:"original-q-"+(i+1),verified_key:null,origin:"source_radio_group"})),source_length:raw.length};
}
export function safeLessonProgressKey(lesson){return "real-english-historical-reading-v2-"+String(lesson.source_message_id??lesson.id).replace(/[^a-zA-Z0-9_-]/g,"_")}
