import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {execFileSync} from "node:child_process";
const importer=path.resolve("scripts/import-chatgpt-export.mjs");
test("importador preserva objeto completo e nunca extrai conversas não selecionadas",()=>{
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),"real-english-test-"));
 try{
  const selected={id:"course-1",title:"REAL ENGLISH — Parte 32",mapping:{root:{id:"root",parent:null,message:{author:{role:"assistant"},content:{parts:["Texto integral <button>Revelar tradução</button>","const options=[{id:'a',text:'hello'}]"]}}}},current_node:"root",private_unknown_field:{keep:"unchanged"}};
  const unrelated={id:"private-2",title:"Conversa pessoal não relacionada",mapping:{m:{id:"m",message:{content:{parts:["DO NOT ARCHIVE"]}}}}};
  const original=path.join(temp,"conversations.json");fs.writeFileSync(original,JSON.stringify([selected,unrelated]));
  const out=path.join(temp,".private","archive");
  execFileSync(process.execPath,[importer,"--source",original,"--ids","course-1","--out",out],{encoding:"utf8"});
  const manifest=JSON.parse(fs.readFileSync(path.join(out,"manifest.json"),"utf8"));
  assert.equal(manifest.selected_count,1);
  assert.equal(manifest.source_conversation_count,2);
  const archived=JSON.parse(fs.readFileSync(path.join(out,manifest.conversations[0].conversation_file),"utf8"));
  assert.deepEqual(archived,selected);
  assert.equal(archived.mapping.root.message.content.parts[1],"const options=[{id:'a',text:'hello'}]");
  assert.equal(fs.readdirSync(out).length,2,"apenas conversa selecionada e manifesto");
  assert.equal(fs.readFileSync(original,"utf8"),JSON.stringify([selected,unrelated]),"original permanece intacto");
 }finally{fs.rmSync(temp,{recursive:true,force:true})}
});
test("importador exige seleção explícita e não arquiva automaticamente",()=>{
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),"real-english-test-"));
 try{
  const original=path.join(temp,"conversations.json");fs.writeFileSync(original,JSON.stringify([{id:"course",title:"REAL ENGLISH"}]));
  assert.throws(()=>execFileSync(process.execPath,[importer,"--source",original],{encoding:"utf8",stdio:"pipe"}),/Importação bloqueada/);
  assert.deepEqual(fs.readdirSync(temp),["conversations.json"]);
 }finally{fs.rmSync(temp,{recursive:true,force:true})}
});
