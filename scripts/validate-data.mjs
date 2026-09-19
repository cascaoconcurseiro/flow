#!/usr/bin/env node
import fs from "node:fs";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
function assert(cond,msg){if(!cond)throw new Error(msg)}
const c=read("curriculum/real_english_curriculum.json"),d=read("data/demo-lesson.json");
assert(c.volumes.length===5,"Esperados cinco níveis A1–C1");
assert(c.volumes.map(v=>v.level).join(",")==="A1,A2,B1,B2,C1","Níveis fora de ordem");
const ids=[];
for(const v of c.volumes){
 const lessons=[...v.lesson_records,...v.modules.flatMap(m=>m.lessons)];
 ids.push(...lessons.map(l=>l.id));
 if(["B2","C1"].includes(v.level)){
  assert(v.planned_lesson_count===40&&v.modules.length===8&&v.modules.every(m=>m.lessons.length===5),v.level+": planejamento deve conter 8 módulos × 5 partes");
  assert(lessons.every(l=>l.status==="planned_not_authored"),v.level+": planos não podem ser tratados como aulas já criadas");
 }
 if(["A1","A2"].includes(v.level))assert(v.planned_lesson_count===null&&lessons.length===0,v.level+": não inventar currículo histórico");
 if(v.level==="B1")assert(lessons.length===33&&v.planned_lesson_count===33,"B1 deve conter 33 posições");
}
assert(ids.length===new Set(ids).size,"IDs de aula repetidos");
assert(d.source_status==="technical_demo_not_original"&&d.id.startsWith("DEMO-"),"Piloto não pode se passar pela aula original");
assert(d.reading.english&&d.reading.translation_pt_br&&d.reading.translation_policy==="after_comprehension_submission","Reading/tradução ausente ou revelação incorreta");
const right=[];
for(const q of d.reading.questions){
 assert(q.stem&&q.options?.length>=2&&q.explanation,"Questão incompleta: "+q.id);
 const ids=q.options.map(o=>o.id);
 assert(ids.includes(q.correct_option_id)&&new Set(ids).size===ids.length,"Gabarito ou alternativas inválidos: "+q.id);
 right.push(ids.indexOf(q.correct_option_id));
}
assert(new Set(right).size>=2,"Posição uniforme do gabarito na demonstração");
assert(d.chunks.length>0&&d.chunks.every(x=>x.front&&x.back_pt&&x.function),"Flashcard incompleto");
assert(d.dialogue.turns.length>0&&d.dialogue.turns.every(t=>t.options.length>=2&&t.options.filter(o=>o.correct).length===1&&t.options.every(o=>o.text&&o.feedback)),"Diálogo incompleto");
assert(d.writing_tasks.length>0&&d.writing_tasks.every(w=>w.prompt&&w.suggested_criteria?.length),"Tarefa escrita incompleta");
assert(d.transformations.length>0&&d.transformations.every(t=>t.prompt&&t.model_answer&&t.explanation),"Transformações/revelações incompletas");
assert(d.explorer?.choices.length>=2&&d.explorer.choices.every(x=>x.id&&x.english&&x.translation_pt_br&&x.note),"Explorador incompleto");
assert(d.pronunciation?.length>0&&d.pronunciation.every(x=>x.phrase&&x.note),"Notas de pronúncia ausentes");
const pdf=read("data/pdf-a0-aula-01.json"),plan=read("data/pdf-initial-curriculum.json");
assert(pdf.id==="PDF-A0-U01-A01"&&pdf.level==="A0"&&pdf.source_status==="pdf_original_example_with_new_interactions","Aula PDF deve preservar o estado de EXEMPLO A0, não A1 original completo");
assert(pdf.source.total_pages===526&&pdf.source.lesson_pages.join(",")==="6,7,8,9,10","Proveniência do PDF inválida");
assert(pdf.sourceSections.length===5&&pdf.sourceSections.every((s,i)=>s.page===i+6&&s.lines.length>0),"Transcrição das cinco páginas da aula ausente");
assert(pdf.sourceSections[0].lines.includes("A0 • Unidade 01 • Aula 01")&&pdf.sourceSections[0].lines.includes("I'm from Brazil."),"Início real da aula não preservado");
assert(pdf.sourceSections.some(s=>s.lines.includes("Yes, I am. / No, I'm not.")),"Respostas curtas originais ausentes");
assert(pdf.reading.translation_policy==="after_comprehension_submission"&&pdf.reading.questions.length===4,"Interação de compreensão PDF inválida");
assert(new Set(pdf.reading.questions.map(q=>q.options.findIndex(o=>o.id===q.correct_option_id))).size>1,"Alternativas PDF não distribuem posições de gabarito");
assert(pdf.chunks.length===3&&pdf.chunks.every(c=>c.front&&c.back_pt&&c.function),"Chunks PDF incompletos");
assert(pdf.transformations.length===2&&pdf.dialogue.turns.length===2&&pdf.writing_tasks.length===1,"Interações NOVAS do PDF devem ser identificadas e completas");
assert(plan.levels.map(x=>x.level).join(",")==="A0,A1,A2,B1,B2"&&plan.to_be_map.chapters.length===12&&plan.lesson_stages.items.length===8,"Planejamento inicial do PDF incompleto");
assert(plan.initial_b2_topics.items.length===12,"Índice inicial B2 no PDF incompleto");
console.log("PASS: PDF auditado — Aula 01 é EXEMPLO A0 com transcrição pp. 6–10, 3 chunks, 4 questões NOVAS, 12 tópicos iniciais B2 e 8 etapas.");
console.log("PASS: catálogo A1–C1 íntegro, 33 posições B1, 40 B2, 40 C1, IDs únicos, piloto com texto/tradução/questões/transformações/explorador/cards/diálogo/escrita/pronúncia.");
console.log("LIMITE: testes de dados não atestam importação histórica nem proficiência do aluno.");
