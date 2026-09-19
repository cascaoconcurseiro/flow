/*
 * Leitor seguro para conteúdo DIL/Markdown salvo em aulas históricas.
 * Nunca executa scripts do curso; gabaritos não são inferidos de texto solto.
 */
function balanced(input,start,open,close){
 let depth=0,quote="",escaped=false;
 for(let i=start;i<input.length;i++){
  const c=input[i];
  if(quote){if(escaped){escaped=false;continue}if(c==="\\"){escaped=true;continue}if(c===quote)quote="";continue}
  if(c==='"'||c==="'"){quote=c;continue}
  if(c===open)depth++;
  if(c===close&&--depth===0)return i+1;
 }
 return -1;
}
function bodiesAndText(source){
 const bodies=[];let text="",offset=0;
 while(true){
  const start=source.indexOf("{@body",offset);
  if(start<0){text+=source.slice(offset);break}
  text+=source.slice(offset,start);
  const end=balanced(source,start,"{","}");
  if(end<0){text+=source.slice(start);break}
  bodies.push(source.slice(start+6,end-1));text+="\n";offset=end;
 }
 return {bodies,text};
}
function questionsFromBodies(bodies){
 const banks=[];const names=new Set();
 for(const code of bodies){
  const re=/\b(?:const|let)\s+([A-Za-z_$][\w$]*)\s*=\s*\[/g;let m;
  while((m=re.exec(code))){
   const start=code.indexOf("[",m.index),end=balanced(code,start,"[","]");
   if(end<0||names.has(m[1]))continue;
   const js=code.slice(start,end).replace(/([{,]\s*)([A-Za-z_$][\w$]*)\s*:/g,'$1"$2":');
   let rows;try{rows=JSON.parse(js)}catch{continue}
   if(!Array.isArray(rows)||!rows.length||!rows.every(q=>q&&typeof q.q==="string"&&Array.isArray(q.o)&&q.o.every(x=>typeof x==="string")&&Number.isInteger(q.a)&&q.a>=0&&q.a<q.o.length))continue;
   names.add(m[1]);banks.push(...rows.map((q,i)=>({id:m[1]+"-"+i,stem:q.q,options:q.o,answer:q.a,explanation:q.why||"",topic:q.topic||""})));
  }
 }
 return banks;
}
function conditions(source){
 let text="",translations=[],stack=[],last=0,m;const re=/\{#if\s+([^}]+)\}|\{:else(?:\s+if\s+[^}]*)?\}|\{\/if\}/g;
 const push=(s)=>{if(!stack.length)text+=s;else if(stack.every(x=>x.translation&&!x.elseBranch))translations.push(s)};
 while((m=re.exec(source))){
  push(source.slice(last,m.index));
  if(m[0].startsWith("{#if"))stack.push({translation:/translat|tradu/i.test(m[1]),elseBranch:false});
  else if(m[0]==="{/if}")stack.pop();
  else if(stack.length)stack[stack.length-1].elseBranch=true;
  last=re.lastIndex;
 }
 push(source.slice(last));return {text,translation:translations.join("\n")};
}
function clean(source){
 return source
 .replace(/<title\b[^>]*>/g,"\n\n@@TITLE@@ ")
 .replace(/<badge\b[^>]*>/g,"\n\n@@BADGE@@ ")
 .replace(/<\/(?:title|badge)>/g,"\n\n")
 .replace(/<radio-group\b[^>]*>[\s\S]*?<\/radio-group>/g,"\n")
 .replace(/<button\b[^>]*>[\s\S]*?<\/button>/g,"\n")
 .replace(/<textarea\b[^>]*\/>/g,"\n")
 .replace(/\{#each[^}]*\}|\{\/each\}/g,"")
 .replace(/<table-cell\b[^>]*>/g,"  |  ")
 .replace(/<\/(?:table-row|list-item|title|text|box|card|row|col|grid|badge|caption|table-cell)>/g,"\n")
 .replace(/<[^>]+>/g,"")
 .replace(/\{(?:[A-Za-z_$][^{}\n]*)\}/g,"")
 .replace(/\n[ \t]+/g,"\n")
 .replace(/\n{4,}/g,"\n\n").trim();
}
function staticQuestions(source){
 const result=[],re=/<radio-group\b[^>]*>([\s\S]*?)<\/radio-group>/g;let m;
 while((m=re.exec(source))){
  const options=[...m[1].matchAll(/<radio\b[^>]*value="([^"]+)"[^>]*>([\s\S]*?)<\/radio>/g)].map(x=>({id:x[1],text:clean(x[2])}));
  if(options.length<2)continue;
  const before=source.slice(Math.max(0,m.index-350),m.index);
  const texts=[...before.matchAll(/<text\b[^>]*>([\s\S]*?)<\/text>/g)];
  const stem=clean(texts.at(-1)?.[1]||"Escolha a alternativa");
  const match=m[0].match(/value=\{([A-Za-z_$][\w$]*)\[(\d+)\]\}/);
  const escaped=match?.[1]?.replace(/[.*+?^$()|[\]{}\\]/g,"\\$&");
  const key=match&&new RegExp(escaped+"\\["+match[2]+"\\]\\s*===?\\s*\"([a-zA-Z0-9_-]+)\"").exec(source);
  const answer=key?options.findIndex(x=>x.id===key[1]):-1;
  result.push({id:"original-"+result.length,stem,options:options.map(x=>x.text),answer,explanation:answer>=0?"Gabarito identificado em comparação explícita no código da aula.":"Gabarito não extraído automaticamente. Confira a explicação original."});
 }
 return result;
}
export function parseHistoricalLesson(source){
 let part={title:"Introdução",raw:"",depth:1};const sections=[];
 for(const line of source.split("\n")){
  const heading=/^(#{1,3})\s+(.+)$/.exec(line);
  if(heading){if(part.raw.trim())sections.push(part);part={title:heading[2],raw:"",depth:heading[1].length}}
  else part.raw+=line+"\n";
 }
 if(part.raw.trim())sections.push(part);
 return sections.map((section,i)=>{
  const extracted=bodiesAndText(section.raw),conditional=conditions(extracted.text);
  return {id:i,title:section.title,depth:section.depth,text:clean(conditional.text),
   translation:clean(conditional.translation),questions:[...questionsFromBodies(extracted.bodies),...staticQuestions(conditional.text)],
   source:section.raw,hasOriginalControls:/\{@body|<radio-group|<button|<checkbox|<textarea/.test(section.raw)};
 });
}
