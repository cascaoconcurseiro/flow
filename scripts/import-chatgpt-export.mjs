#!/usr/bin/env node
/**
 * Importador conservador de conversas do ChatGPT.
 * - Arquivo original permanece intacto no local escolhido pelo usuário.
 * - Lista conversas sem extrair nenhuma automaticamente.
 * - Exporta SOMENTE IDs explicitamente selecionados para pasta local .private/.
 * - Guarda o objeto integral de cada conversa e a ordem navegável do caminho ativo
 *   para que texto, código de interações e metadados não se percam por resumo.
 * - Não há rede, IA nem commit automático.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import process from "node:process";
const usage=`Uso:
  node scripts/import-chatgpt-export.mjs --list /caminho/conversations.json
  node scripts/import-chatgpt-export.mjs --source /caminho/conversations.json --ids-file .private/selected-ids.txt
  node scripts/import-chatgpt-export.mjs --source /caminho/conversations.json --ids "id-1,id-2"

A lista e os arquivos importados podem conter dados pessoais. Revise manualmente os IDs.
Não inclua a exportação integral ou a pasta .private no GitHub público.`;
function flag(name){const i=process.argv.indexOf(name);return i<0?null:(process.argv[i+1]??null)}
function hash(bytes){return crypto.createHash("sha256").update(bytes).digest("hex")}
function writeJson(filename,data){fs.writeFileSync(filename,JSON.stringify(data,null,2)+"\n",{mode:0o600})}
function messagesInActivePath(conv){
 const m=conv.mapping;if(!m||typeof m!=="object")return [];
 let id=conv.current_node,seen=new Set(),nodes=[];
 while(id&&m[id]&&!seen.has(id)){seen.add(id);nodes.push(m[id]);id=m[id].parent}
 return nodes.reverse().map(node=>({node_id:node.id??null,parent:node.parent??null,message:node.message??null})).filter(node=>node.message);
}
function main(){
 if(process.argv.includes("--help")||process.argv.length<3){process.stdout.write(usage+"\n");return}
 const file=flag("--list")??flag("--source");
 if(!file)throw new Error("Informe --list ou --source com o arquivo conversations.json");
 const original=fs.readFileSync(file),data=JSON.parse(original.toString("utf8"));
 if(!Array.isArray(data))throw new Error("Formato inesperado: conversations.json deve ser um array de conversas.");
 const sourceSha=hash(original);
 if(process.argv.includes("--list")){
  process.stdout.write("Conversas encontradas: "+data.length+"; SHA-256 do JSON: "+sourceSha+"\n");
  for(const conv of data){const t=conv.title??"(sem título)";const probable=/real english|grammar through chunks|ingl[eê]s|\b(?:a1|a2|b1|b2|c1)\b/i.test(t);process.stdout.write([probable?"POSSÍVEL CURSO":"REVISAR",conv.id??"(sem id)",t].join(" | ")+"\n")}
  process.stdout.write("A marca POSSÍVEL CURSO é apenas filtro pelo título: selecione os IDs manualmente.\n");return
 }
 let ids=[];
 const idsFile=flag("--ids-file");
 if(idsFile){ids=fs.readFileSync(idsFile,"utf8").split(/\r?\n/).map(s=>s.trim()).filter(s=>s&&!s.startsWith("#"))}
 if(flag("--ids"))ids.push(...flag("--ids").split(",").map(s=>s.trim()).filter(Boolean));
 ids=[...new Set(ids)];
 if(!ids.length)throw new Error("Importação bloqueada: informe IDs exatos com --ids-file ou --ids.");
 const byId=new Map(data.map(c=>[String(c.id),c]));
 const missing=ids.filter(id=>!byId.has(id));if(missing.length)throw new Error("IDs não encontrados: "+missing.join(", "));
 const output=path.resolve(flag("--out")??".private/real-english-archive");
 const root=path.resolve(process.cwd());
 if(output===root||output===path.parse(output).root)throw new Error("Escolha uma pasta privada dedicada, não a raiz do projeto/disco.");
 fs.mkdirSync(output,{recursive:true,mode:0o700});
 const entries=[];
 for(const id of ids){
  const conv=byId.get(id),full=Buffer.from(JSON.stringify(conv,null,2)+"\n");
  const filename="conversation-"+hash(Buffer.from(id)).slice(0,16)+".json";
  const destination=path.join(output,filename);
  if(fs.existsSync(destination)&&hash(fs.readFileSync(destination))!==hash(full))throw new Error("Arquivo de destino com conteúdo diferente: "+destination+"; preservado sem sobrescrita.");
  if(!fs.existsSync(destination))fs.writeFileSync(destination,full,{mode:0o600});
  const active=messagesInActivePath(conv);
  entries.push({id,title:conv.title??null,created_at:conv.create_time??null,conversation_file:filename,sha256:hash(full),mapping_node_count:conv.mapping?Object.keys(conv.mapping).length:null,active_path_message_count:active.length,current_node:conv.current_node??null});
 }
 writeJson(path.join(output,"manifest.json"),{format:"real-english-private-chatgpt-archive-v1",generated_at:new Date().toISOString(),source_file:path.basename(file),source_sha256:sourceSha,source_conversation_count:data.length,selected_count:entries.length,conversations:entries,limitations:["O objeto integral da conversa é preservado; estado transitório dos widgets pode não constar no JSON.","Arquivos anexos e outras mídias podem exigir cópia separada.","A seleção foi feita pelo usuário; conferir manualmente se todas as conversas do curso foram incluídas."]});
 process.stdout.write("Arquivadas "+entries.length+" conversas selecionadas em "+output+".\nManifesto e hashes gerados. Nada foi enviado à rede ou ao GitHub.\n");
}
try{main()}catch(error){process.stderr.write("ERRO: "+error.message+"\n");process.exitCode=1}
