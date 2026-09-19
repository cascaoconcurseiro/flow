#!/usr/bin/env node
/**
 * Cria índice privado e rastreável de TODAS as mensagens dos arquivos originais selecionados.
 * Nenhum conteúdo é resumido, publicado ou completado por IA. Ramificações permanecem
 * identificadas por message_id, parent, children e is_active_path.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import {orderedNodes,activePath,interactionInventory} from "../src/archive-core.mjs";
const sha=data=>crypto.createHash("sha256").update(data).digest("hex");
const flag=(name,defaultValue)=>{const p=process.argv.indexOf(name);return p<0?defaultValue:(process.argv[p+1]??defaultValue)};
function main(){
 const base=path.resolve(flag("--archive",".private/real-english-archive"));
 const manifestPath=path.join(base,"manifest.json");
 if(!fs.existsSync(manifestPath))throw Error("Manifesto privado não encontrado: "+manifestPath+". Use primeiro scripts/import-chatgpt-export.mjs.");
 const manifest=JSON.parse(fs.readFileSync(manifestPath,"utf8"));
 if(!Array.isArray(manifest.conversations))throw Error("Manifesto incompleto.");
 const output=path.resolve(flag("--out",path.join(base,"normalized-message-index.json")));
 const entries=[],overview=[];
 for(const item of manifest.conversations){
  const file=path.resolve(base,item.conversation_file),relative=path.relative(base,file);
  if(relative.startsWith("..")||path.isAbsolute(relative))throw Error("Caminho inseguro no manifesto.");
  const raw=fs.readFileSync(file);
  if(sha(raw)!==item.sha256)throw Error("Hash divergente; fonte não será usada: "+item.conversation_file);
  const source=JSON.parse(raw.toString("utf8")),nodes=orderedNodes(source),active=new Set(activePath(source));
  overview.push({conversation_id:source.id??item.id,title:source.title??null,source_file:item.conversation_file,source_sha256:item.sha256,...interactionInventory(source)});
  for(const n of nodes){
   // raw_node preserva todos os campos sem os interpretar; texto é somente índice para busca.
   entries.push({conversation_id:source.id??item.id,conversation_title:source.title??null,
     source_file:item.conversation_file,source_sha256:item.sha256,
     node_id:n.id,parent:n.parent,children:n.children,author_role:n.role,
     is_active_path:active.has(n.id),create_time:n.create_time,
     text_for_search:n.text,raw_node:n.raw_node});
  }
 }
 const payload={schema_version:"1.0.0",provenance:"original_conversations_selected_by_user",
  privacy:"PRIVATE: not for GitHub/public deployment; may include personal data.",
  generated_at:new Date().toISOString(),source_manifest_sha256:sha(fs.readFileSync(manifestPath)),
  conversations:overview,messages:entries,
  conditions:["Todos os nós presentes em cada mapping de origem foram incluídos.","Mensagem não textual permanece no raw_node; extração textual é apenas índice.","Estados efêmeros e assets ausentes no JSON exportado não podem ser reconstruídos.","Este índice não é uma aula normalizada nem executa controles antigos."]};
 fs.mkdirSync(path.dirname(output),{recursive:true,mode:0o700});
 if(fs.existsSync(output))throw Error("Arquivo de saída já existe; preserve versões e use --out com outro nome.");
 fs.writeFileSync(output,JSON.stringify(payload,null,2)+"\n",{mode:0o600});
 console.log("PASS: "+overview.length+" conversas e "+entries.length+" nós preservados em índice privado.");
 console.log("Arquivo: "+output+" | SHA-256: "+sha(fs.readFileSync(output)));
}
try{main()}catch(e){console.error("ERRO: "+e.message);process.exitCode=1}
