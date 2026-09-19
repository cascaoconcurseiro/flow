import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeExport,extractMessageText,orderedNodes,activePath,
  interactionInventory,candidateCourseConversation,safeConversationFilename
} from "../src/archive-core.mjs";
const conversation={
 id:"real-english-01",title:"REAL ENGLISH — Parte 32",
 current_node:"assistant2",
 mapping:{
  root:{id:"root",parent:null,children:["assistant1","alternative"],message:{author:{role:"user"},create_time:1,content:{parts:["Continuar a aula."]}}},
  assistant1:{id:"assistant1",parent:"root",children:["assistant2"],message:{author:{role:"assistant"},create_time:2,content:{parts:["<button onClick={...}>Revelar</button> <radio-group><radio value=\"a\">A</radio></radio-group> {@body ...}"]}}},
  assistant2:{id:"assistant2",parent:"assistant1",children:[],message:{author:{role:"assistant"},create_time:3,content:{parts:["GenUI.issueNewTurn('corrigir'); <WritingBlock>escreva</WritingBlock>"]}}},
  alternative:{id:"alternative",parent:"root",children:[],message:{author:{role:"assistant"},create_time:2.5,content:{parts:[{text:"<checkbox>opção</checkbox>"}]}}
 }
};
test("normaliza formato do ChatGPT sem modificar conteúdo",()=>{
 assert.deepEqual(normalizeExport([conversation]),[conversation]);
 assert.deepEqual(normalizeExport({conversations:[conversation]}),[conversation]);
 assert.throws(()=>normalizeExport({mapping:conversation.mapping}),/Formato inválido/);
});
test("preserva mensagens de TODAS as ramificações e caminho ativo separado",()=>{
 const nodes=orderedNodes(conversation);
 assert.equal(nodes.length,4);
 assert(nodes.some(n=>n.id==="alternative"&&n.text.includes("checkbox")));
 assert.deepEqual(activePath(conversation),["root","assistant1","assistant2"]);
 assert.equal(nodes.find(n=>n.id==="assistant1").text,conversation.mapping.assistant1.message.content.parts[0]);
});
test("inventaria marcações de interface sem assumir que código pode ser executado",()=>{
 const report=interactionInventory(conversation);
 assert.equal(report.node_count,4);
 assert.equal(report.message_count,4);
 assert.equal(report.all_branches_included,true);
 assert.equal(report.component_occurrences.button,1);
 assert.equal(report.component_occurrences["radio-group"],1);
 assert.equal(report.component_occurrences.radio,1);
 assert.equal(report.component_occurrences.checkbox,1);
 assert.equal(report.component_occurrences.WritingBlock,1);
 assert.equal(report.hook_blocks,1);
 assert.equal(report.host_actions,1);
 assert.equal(report.widget_runtime_state_in_export,"not_assured");
});
test("preserva elementos não textuais no bruto sem fingir extração fiel de mídia",()=>{
 const msg={content:{parts:["texto",{asset_pointer:"opaque",content_type:"image"}]}};
 assert(extractMessageText(msg).includes("PARTE NÃO TEXTUAL"));
 assert.equal(candidateCourseConversation(conversation),true);
 assert.match(safeConversationFilename("../Real English?"),/^real-english-conversation-[A-Za-z0-9_-]+\.json$/);
});
