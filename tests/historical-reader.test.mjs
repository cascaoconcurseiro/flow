import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {parseHistoricalLesson,safeLessonProgressKey} from "../src/historical-reader.mjs";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
test("A1 Parte 01: transforma alternativas originais em questões reais sem revelar o gabarito",()=>{
 const l=read("data/lessons/a1/part-01.json"),view=parseHistoricalLesson(l.raw_markdown);
 assert(view.segments.length>25,"Conteúdo visível insuficiente");
 assert(view.questions.length>=2,"Questões do primeiro reading ausentes");
 assert.match(view.questions[0].question,/Emma|origem|Londres|Brasil/i);
 assert.deepEqual(view.questions[0].options.map(x=>x.id),["a","b","c"]);
 assert(view.questions[0].options.some(x=>x.text.includes("Londres")));
 assert(view.questions.every(x=>x.verified_key===null),"Não inventar gabaritos");
 assert(view.segments.some(x=>/AULA|Compreensão|Grammar/i.test(x.text)));
 assert(view.segments.every(x=>!x.text.includes("<radio-group")&&!x.text.includes("<button")&&!x.text.includes("{@body")));
});
test("A2 e B1: renderizador aceita versões extensas e preserva o original intacto",()=>{
 for(const p of ["data/lessons/a2/part-01.json","data/lessons/b1/part-01.json"]){
  const l=read(p),raw=l.raw_markdown,parsed=parseHistoricalLesson(raw);
  assert(parsed.segments.length>20,p+": estrutura de seções não encontrada");
  assert(parsed.source_length===raw.length,p+": a fonte foi alterada");
  assert(!parsed.segments.some(x=>/<(?:box|radio|title|text)\b/i.test(x.text)),p+": markup visível");
  assert(Array.isArray(parsed.questions),p+": inventário de alternativas deve existir mesmo se o original usar botões ou escrita livre");
  assert(safeLessonProgressKey(l).includes(l.source_message_id.replace(/[^a-zA-Z0-9_-]/g,"_")));
 }
});
test("parser não executa código histórico, não exibe blocos condicionais ocultos",()=>{
 const raw='# Aula\n\nTexto original.\n{@body const [x,setX]=DIL.useState(false)}\n{#if x}\nTRADUÇÃO OCULTA\n{/if}\n<radio-group value={x}><radio value="a">A opção</radio><radio value="b">B opção</radio></radio-group>';
 const v=parseHistoricalLesson(raw);
 assert(!v.segments.some(x=>/TRADUÇÃO OCULTA|DIL\.useState|radio-group/.test(x.text)));
 assert.equal(v.questions.length,1);
 assert.equal(v.questions[0].options.length,2);
 assert.equal(v.questions[0].verified_key,null);
});
