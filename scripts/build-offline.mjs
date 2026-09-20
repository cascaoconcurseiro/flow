#!/usr/bin/env node
/** Build one HTML file that works on file:// without network or server. */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
const required=[
 "curriculum/real_english_curriculum.json",
 "data/course-lessons-index.json",
 "data/demo-lesson.json",
 "data/pdf-a0-aula-01.json",
 "data/pdf-initial-curriculum.json",
 "data/recovered-source-index.json",
 "curriculum/prompt_mestre_professor_interativo.md"
];
const index=JSON.parse(fs.readFileSync("data/course-lessons-index.json","utf8"));
const count={A1:0,A2:0,B1:0};
const names=[...required];
for(const item of index.lessons){
 if(!Object.hasOwn(count,item.level))throw Error("Unexpected level: "+item.level);
 if(!/^data\/lessons\/(?:a1|a2|b1)\/part-\d{2}\.json$/.test(item.file_path))throw Error("Invalid lesson path: "+item.file_path);
 count[item.level]++;
 names.push(item.file_path);
}
names.push("data/lessons/b2/plan.json","data/lessons/c1/plan.json");
if(count.A1!==6||count.A2!==9||count.B1!==33||new Set(names).size!==names.length)throw Error("Expected exactly 6 A1, 9 A2 and 33 B1, with no duplicate paths.");
const resources={},files=[];
for(const name of names){
 const bytes=fs.readFileSync(name),text=bytes.toString("utf8");
 if(name.endsWith(".json"))JSON.parse(text);
 resources[name]=text;
 files.push({path:name,bytes:bytes.length,sha256:crypto.createHash("sha256").update(bytes).digest("hex")});
}
const html=fs.readFileSync("index.html","utf8"),css=fs.readFileSync("src/styles.css","utf8"),js=fs.readFileSync("dist/app.bundle.js","utf8");
const styleTag='<link rel="stylesheet" href="./src/styles.css">';
const scriptTag='<script type="module" src="./src/app.js"></script>';
if(!html.includes(styleTag)||!html.includes(scriptTag))throw Error("HTML entry points changed. Update the offline builder.");
if(/<\/script/i.test(js))throw Error("Unsafe inline script content in bundle.");
const data=JSON.stringify(resources).replace(/</g,"\\u003c").replace(/>/g,"\\u003e").replace(/&/g,"\\u0026").replace(/\u2028/g,"\\u2028").replace(/\u2029/g,"\\u2029");
const shim=[
 "(function(){",
 "const source=JSON.parse(document.getElementById('offline-resources').textContent);",
 "window.__REAL_ENGLISH_OFFLINE__=true;",
 "window.fetch=function(resource){",
 " const key=String(typeof resource==='string'?resource:resource?.url).split('?')[0].replace(/^(\\.\\/)+/,'');",
 " if(!Object.prototype.hasOwnProperty.call(source,key))return Promise.resolve(new Response('Recurso ausente do pacote offline',{status:404}));",
 " return Promise.resolve(new Response(source[key],{status:200,headers:{'Content-Type':key.endsWith('.json')?'application/json; charset=utf-8':'text/plain; charset=utf-8'}}));",
 "};",
 "})();"
].join("\n");
// Use callback replacements: passing the JS bundle as a replacement string
// expands its literal const standalone=html.replace(styleTag,()=>"<style>\n"+css+"\n</style>")
 .replace(scriptTag,()=>'<script type="application/json" id="offline-resources">'+data+'</script>\n<script>'+shim+'</script>')
 .replace('</body>',()=>'<script>'+js+'</script>\n</body>');
if(standalone.includes(scriptTag))throw Error("Offline HTML still contains external script tag.");
fs.mkdirSync("dist/offline",{recursive:true});
fs.writeFileSync("dist/offline/REAL_ENGLISH_OFFLINE.html",standalone,"utf8");
fs.writeFileSync("dist/offline/MANIFESTO_DE_INTEGRIDADE.json",JSON.stringify({
 package_version:"1.0.0",generated_at:new Date().toISOString(),source_count:files.length,
 historical_lesson_counts:count,planned_not_authored:{B2:40,C1:40},files,
 limitations:[
  "HTML independente com fontes integrais recuperadas A1/A2/B1 incorporadas, além de mapas B2/C1.",
  "Planejamentos B2/C1 não são aulas redigidas.",
  "Controles dinâmicos que ainda não foram convertidos não são reproduções idênticas ao ChatGPT.",
  "Progresso depende de armazenamento local do navegador; modo file:// pode impor restrições.",
  "O pacote não inclui IA, conta, sincronização ou mídias ausentes da fonte."
 ]
},null,2)+"\n");
fs.writeFileSync("dist/offline/LEIA-ME.txt",[
 "REAL ENGLISH — ESTUDE SEM INTERNET",
 "1. Extraia este ZIP no seu computador.",
 "2. Abra REAL_ENGLISH_OFFLINE.html no Chrome, Edge ou Firefox com duplo clique.",
 "3. A1 (6 partes), A2 (9 partes) e B1 (33 partes) incluem fontes integrais recuperadas.",
 "4. B2 e C1 incluem o planejamento de 40 partes cada, não aulas completas.",
 "5. Algumas interações antigas continuam pendentes de conversão. A tela não deve inventar acertos ou comportamentos.",
 "6. Para continuar no Codex, abra a pasta PROJETO_CODEX, leia AGENTS.md e MASTER_BLUEPRINT.md.",
 "7. O progresso fica no navegador quando o armazenamento local for permitido. Não limpe os dados de navegação.",
 "8. A pasta de fontes contém os arquivos JSON históricos para conferência e implementação futura."
].join("\n")+"\n");
console.log(JSON.stringify({status:"PASS",html_bytes:Buffer.byteLength(standalone),historical_lessons:count,planned:{B2:40,C1:40},bundled_sources:names.length},null,2));
