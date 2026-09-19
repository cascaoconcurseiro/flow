import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import {execFileSync} from "node:child_process";
const script=path.resolve("scripts/index-private-archive.mjs");
const hash=data=>crypto.createHash("sha256").update(data).digest("hex");
test("índice privado preserva todas as mensagens, ramificações e nó bruto",()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),"real-english-index-"));
 try{
  const source={id:"c1",title:"REAL ENGLISH A1",current_node:"final",mapping:{
   u:{id:"u",parent:null,children:["final","alternative"],message:{author:{role:"user"},create_time:1,content:{parts:["Original user prompt"]}}},
   final:{id:"final",parent:"u",children:[],message:{author:{role:"assistant"},create_time:3,content:{parts:["<button>Revelar</button>","ANSWER_KEY_UNMODIFIED"]}}},
   alternative:{id:"alternative",parent:"u",children:[],message:{author:{role:"assistant"},create_time:2,content:{parts:[{asset_pointer:"opaque"},{text:"<radio-group>Choice</radio-group>"}]}}}
  }};
  const raw=Buffer.from(JSON.stringify(source,null,2)+"\n"),fn="conversation-original.json";
  fs.writeFileSync(path.join(dir,fn),raw);
  const manifest={conversations:[{id:"c1",conversation_file:fn,sha256:hash(raw)}]};
  fs.writeFileSync(path.join(dir,"manifest.json"),JSON.stringify(manifest));
  const result=execFileSync(process.execPath,[script,"--archive",dir],{encoding:"utf8"});
  assert.match(result,/PASS: 1 conversas e 3 nós/);
  const index=JSON.parse(fs.readFileSync(path.join(dir,"normalized-message-index.json"),"utf8"));
  assert.equal(index.messages.length,3);
  assert(index.messages.some(m=>m.node_id==="alternative"&&!m.is_active_path));
  assert(index.messages.some(m=>m.node_id==="final"&&m.text_for_search.includes("ANSWER_KEY_UNMODIFIED")));
  assert.deepEqual(index.messages.find(m=>m.node_id==="alternative").raw_node,source.mapping.alternative);
  assert.equal(index.conversations[0].component_occurrences["radio-group"],1);
  assert.equal(fs.readFileSync(path.join(dir,fn)).equals(raw),true);
  assert.throws(()=>execFileSync(process.execPath,[script,"--archive",dir],{stdio:"pipe"}),/Arquivo de saída já existe/);
 }finally{fs.rmSync(dir,{recursive:true,force:true})}
});
test("recusa manifesto com hash divergente",()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),"real-english-index-"));
 try{
  fs.writeFileSync(path.join(dir,"conversation.json"),"{}");
  fs.writeFileSync(path.join(dir,"manifest.json"),JSON.stringify({conversations:[{id:"bad",conversation_file:"conversation.json",sha256:"wrong"}]}));
  assert.throws(()=>execFileSync(process.execPath,[script,"--archive",dir],{stdio:"pipe"}),/Hash divergente/);
  assert.equal(fs.existsSync(path.join(dir,"normalized-message-index.json")),false);
 }finally{fs.rmSync(dir,{recursive:true,force:true})}
});
