import test from "node:test";
import assert from "node:assert/strict";
import {buildSourcePackage} from "../src/source-package-core.mjs";

const curriculum={volumes:["A1","A2","B1","B2","C1"].map(level=>({level}))};
const demo={id:"DEMO-B1-COMMUNICATION",source_status:"technical_demo_not_original"};

test("pacote preserva cada página literalmente e registra sua integridade",()=>{
 const pages=[
  {page:1,text:"  texto com espaços  \nsegunda linha"},
  {page:2,text:"alternativa A\nalternativa B\nresposta: B"}
 ];
 const result=buildSourcePackage({
  curriculum,
  demo,
  sources:[{
   source_id:"pdf-original",
   source_kind:"user_supplied_pdf_text_extraction",
   provenance_status:"historical_original_unverified",
   pages,
   ranges:[{start_page:1,end_page:2,content_kind:"lesson_source"}]
  }]
 });

 assert.deepEqual(result.curriculum_snapshot,curriculum);
 assert.deepEqual(result.demonstration_snapshot,demo);
 assert.deepEqual(result.sources[0].pages.map(page=>({page:page.page,text:page.text})),pages);
 assert.equal(result.sources[0].page_count,2);
 assert.match(result.sources[0].sha256,/^[a-f0-9]{64}$/);
 assert.ok(result.sources[0].pages.every(page=>/^[a-f0-9]{64}$/.test(page.sha256)));
});

test("pacote recusa currículo incompleto e intervalos fora das páginas fornecidas",()=>{
 assert.throws(()=>buildSourcePackage({curriculum:{volumes:[{level:"A1"}]},demo,sources:[]}),/A1.*C1/);
 assert.throws(()=>buildSourcePackage({
  curriculum,
  demo,
  sources:[{
   source_id:"broken",
   source_kind:"test",
   provenance_status:"historical_original_unverified",
   pages:[{page:1,text:"one"}],
   ranges:[{start_page:1,end_page:2,content_kind:"lesson_source"}]
  }]
 }),/intervalo/i);
});
