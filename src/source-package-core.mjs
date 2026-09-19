import {createHash} from "node:crypto";

const sha256=value=>createHash("sha256").update(value,"utf8").digest("hex");

function assert(condition,message){
 if(!condition)throw new Error(message);
}

export function buildSourcePackage({curriculum,demo,sources,generatedAt=new Date().toISOString()}){
 const levels=curriculum?.volumes?.map(volume=>volume.level).join(",");
 assert(levels==="A1,A2,B1,B2,C1","O currículo precisa conter A1 até C1, nessa ordem.");
 assert(demo?.source_status==="technical_demo_not_original","A demonstração precisa continuar identificada como não original.");
 assert(Array.isArray(sources),"Sources precisa ser uma lista.");

 const sourceIds=new Set();
 const preservedSources=sources.map(source=>{
  assert(source?.source_id&&!sourceIds.has(source.source_id),"source_id ausente ou repetido.");
  sourceIds.add(source.source_id);
  assert(Array.isArray(source.pages)&&source.pages.length>0,"Cada fonte precisa conter páginas.");
  const pageNumbers=new Set();
  const pages=source.pages.map(page=>{
   assert(Number.isInteger(page.page)&&page.page>0&&!pageNumbers.has(page.page),"Número de página inválido ou repetido.");
   assert(typeof page.text==="string","O texto de cada página precisa ser preservado como string.");
   pageNumbers.add(page.page);
   return {page:page.page,text:page.text,sha256:sha256(page.text)};
  });
  for(const range of source.ranges||[]){
   assert(Number.isInteger(range.start_page)&&Number.isInteger(range.end_page)&&range.start_page<=range.end_page,"Intervalo de páginas inválido.");
   for(let page=range.start_page;page<=range.end_page;page++)assert(pageNumbers.has(page),"Intervalo aponta para página ausente: "+page);
  }
  const exactPayload=JSON.stringify(source.pages.map(page=>({page:page.page,text:page.text})));
  return {
   source_id:source.source_id,
   source_kind:source.source_kind,
   provenance_status:source.provenance_status,
   notes:source.notes||null,
   page_count:pages.length,
   sha256:sha256(exactPayload),
   ranges:structuredClone(source.ranges||[]),
   pages
  };
 });

 return {
  schema_version:"1.0.0",
  package_type:"real_english_lossless_source_package",
  generated_at:generatedAt,
  integrity_policy:"Page text is copied verbatim. Planning is not authored lesson content. Missing historical material is never generated silently.",
  curriculum_snapshot:structuredClone(curriculum),
  demonstration_snapshot:structuredClone(demo),
  sources:preservedSources
 };
}

