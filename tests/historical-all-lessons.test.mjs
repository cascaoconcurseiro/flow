import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {parseHistoricalLesson} from "../src/historical-parser.mjs";
const index=JSON.parse(fs.readFileSync("data/course-lessons-index.json","utf8"));
test("todas as 48 partes históricas A1–B1 geram capítulos legíveis sem JSON bruto exposto",()=>{
 assert.equal(index.lessons.length,48);
 const failures=[],counts={A1:0,A2:0,B1:0};
 for(const meta of index.lessons){
  const lesson=JSON.parse(fs.readFileSync(meta.file_path,"utf8"));
  const raw=lesson.raw_markdown,parts=parseHistoricalLesson(raw);
  counts[meta.level]++;
  if(parts.length<3)failures.push(meta.file_path+": menos de três seções legíveis");
  if(parts.reduce((n,p)=>n+p.text.length,0)<200)failures.push(meta.file_path+": menos de 200 caracteres apresentados");
  if(parts.some(p=>p.text.includes("{@body")||p.text.includes("<radio-group")||p.text.includes("<button")))failures.push(meta.file_path+": código técnico visível");
  if(raw!==lesson.raw_markdown)failures.push(meta.file_path+": fonte original alterada");
 }
 assert.deepEqual(counts,{A1:6,A2:9,B1:33});
 assert.deepEqual(failures,[],failures.join("\n"));
});
