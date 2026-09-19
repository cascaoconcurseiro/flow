import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("índice separa planejamento recuperado de aulas históricas",()=>{
 const index=JSON.parse(fs.readFileSync("data/recovered-source-index.json","utf8"));
 assert.deepEqual(Object.keys(index.levels),["A1","A2","B1","B2","C1"]);
 assert.equal(index.levels.A1.planning_variant.items.length,12);
 assert.equal(index.levels.A1.planning_variant.status,"planning_variant_not_historical_course");
 assert.equal(index.recovered_materials.find(item=>item.id==="SOURCE-A2-B1-PRESENT-PERFECT").status,"historical_original_unverified");
 assert.equal(index.recovered_materials.find(item=>item.id==="SOURCE-A1-FIRST-CONTACT").status,"historical_variant_unverified");
 assert.ok(index.levels.B2.curriculum_status.includes("planned_not_authored"));
 assert.ok(index.levels.C1.curriculum_status.includes("planned_not_authored"));
});
