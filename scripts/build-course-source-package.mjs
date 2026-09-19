#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {buildSourcePackage} from "../src/source-package-core.mjs";

const readJson=filename=>JSON.parse(fs.readFileSync(filename,"utf8"));
const output=path.resolve(process.argv[2]||".private/source-archives/real-english-course-package.json");
const originalPages=readJson("tmp/pdfs/course_pages.json");
const updatedPages=readJson("tmp/pdfs/updated-20260919-1654/pages.json");
const curriculum=readJson("curriculum/real_english_curriculum.json");
const demo=readJson("data/demo-lesson.json");

const packageData=buildSourcePackage({
 curriculum,
 demo,
 sources:[
  {
   source_id:"curso-gramatica-por-chunks-pdf-78-pages",
   source_kind:"user_supplied_pdf_text_extraction",
   provenance_status:"historical_original_unverified",
   notes:"Extração preservada do PDF anterior. Inclui uma aula A2–B1, propostas de currículo/interface, uma unidade demonstrativa A1 e especificações do sistema.",
   pages:originalPages,
   ranges:[
    {start_page:1,end_page:23,content_kind:"document_lead_in_or_blank"},
    {start_page:24,end_page:42,content_kind:"historical_lesson_source",label:"Have you ever...? — Present Perfect — Experiências de vida"},
    {start_page:43,end_page:49,content_kind:"product_and_curriculum_planning"},
    {start_page:50,end_page:67,content_kind:"system_prompt_and_technical_specification"},
    {start_page:68,end_page:69,content_kind:"historical_variant",label:"Primeiro contato com o inglês — demonstração A1"},
    {start_page:70,end_page:78,content_kind:"curriculum_and_system_instructions"}
   ]
  },
  {
   source_id:"curso-gramatica-por-chunks-pdf-updated-9-pages",
   source_kind:"user_supplied_pdf_text_extraction",
   provenance_status:"current_user_supplied_source",
   notes:"PDF atualizado lido integralmente. Registra a auditoria do GitHub e os limites de cobertura do acervo histórico.",
   pages:updatedPages,
   ranges:[
    {start_page:1,end_page:2,content_kind:"document_lead_in_or_blank"},
    {start_page:3,end_page:3,content_kind:"reasoning_marker"},
    {start_page:4,end_page:9,content_kind:"repository_audit_and_migration_status"}
   ]
  }
 ]
});

fs.mkdirSync(path.dirname(output),{recursive:true});
fs.writeFileSync(output,JSON.stringify(packageData,null,2)+"\n",{encoding:"utf8",flag:"wx"});
console.log("Pacote privado criado: "+output);
for(const source of packageData.sources)console.log(`${source.source_id}: ${source.page_count} páginas · SHA-256 ${source.sha256}`);

