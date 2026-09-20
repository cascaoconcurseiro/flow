import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {parseHistoricalLesson} from "../src/historical-parser.mjs";
const load=p=>JSON.parse(fs.readFileSync(p,"utf8"));
test("A1 Parte 01: apresentar capítulos reais, alternativas legíveis e nenhum código de estado como texto",()=>{
 const source=load("data/lessons/a1/part-01.json"),sections=parseHistoricalLesson(source.raw_markdown);
 assert(sections.length>10,"Capítulos insuficientes");
 assert(sections.some(s=>/AULA 1|Compreensão inicial/.test(s.title)),"Não encontrou capítulos históricos");
 assert(sections.some(s=>s.text.includes("I'm from Brazil")),"Texto de aula ausente");
 const qs=sections.flatMap(s=>s.questions);
 assert(qs.length>=2,"Alternativas originais não foram recuperadas");
 assert(qs.some(q=>q.options.some(o=>/Londres/.test(o))),"Alternativas do reading A1 faltando");
 assert(sections.every(s=>!s.text.includes("{@body")&&!s.text.includes("<radio-group")&&!s.text.includes("<button")),"Markup técnico não deve aparecer como conteúdo");
 assert.equal(source.raw_markdown.length,source.character_count);
});
test("B1 Parte 33: ler quiz dinâmico da fonte e preservar traduções atrás de revelação",()=>{
 const source=load("data/lessons/b1/part-33.json"),sections=parseHistoricalLesson(source.raw_markdown);
 assert(sections.length>=8,"Não encontrou etapas do B1");
 const questions=sections.flatMap(s=>s.questions);
 assert(questions.length>=16,"Questions declaradas em arrays não encontradas");
 assert(questions.some(q=>/Daniel|Emma|Alex/.test(q.stem)),"Reading questions ausentes");
 assert(questions.every(q=>q.options.length>=2&&Number.isInteger(q.answer)),"Alternativas ou gabaritos inválidos");
 assert(sections.some(s=>s.translation&&/Emma|Daniel/.test(s.translation)),"Tradução condicional não recuperada");
 assert(!sections.some(s=>s.text.includes("{@body")||s.text.includes("GenUI.issueNewTurn(")),"Código do chat visível na aula");
 assert.equal(source.raw_markdown.length,source.character_count);
});
test("parser não executa JavaScript da conversa nem exibe tradução antes de correção",()=>{
 const raw='# First lesson\n{@body const qa=[{q:"What is it?",o:["A","B","C"],a:1,why:"B"}]}\nEnglish text.\n{#if translation}\nTRADUÇÃO ESCONDIDA\n{/if}\n';
 const chapters=parseHistoricalLesson(raw);
 assert.equal(chapters[0].questions.length,1);
 assert.equal(chapters[0].questions[0].answer,1);
 assert(chapters[0].translation.includes("TRADUÇÃO ESCONDIDA"));
 assert(!chapters[0].text.includes("TRADUÇÃO ESCONDIDA"));
 assert(!chapters[0].text.includes("const qa"));
});
