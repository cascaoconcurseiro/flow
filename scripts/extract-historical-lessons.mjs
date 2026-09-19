import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const SOURCE_FILE = ".private/extracted/Curso de Gramática por Chunks.json";
if (!fs.existsSync(SOURCE_FILE)) {
  console.error("Arquivo fonte não encontrado:", SOURCE_FILE);
  process.exit(1);
}

const course = JSON.parse(fs.readFileSync(SOURCE_FILE, "utf8"));

const LESSON_MAPPING = [
  // A1: turns 6 to 11
  { turn: 6, level: "A1", part: 1 },
  { turn: 7, level: "A1", part: 2 },
  { turn: 8, level: "A1", part: 3 },
  { turn: 9, level: "A1", part: 4 },
  { turn: 10, level: "A1", part: 5 },
  { turn: 11, level: "A1", part: 6 },
  // A2: turns 12 to 20
  { turn: 12, level: "A2", part: 1 },
  { turn: 13, level: "A2", part: 2 },
  { turn: 14, level: "A2", part: 3 },
  { turn: 15, level: "A2", part: 4 },
  { turn: 16, level: "A2", part: 5 },
  { turn: 17, level: "A2", part: 6 },
  { turn: 18, level: "A2", part: 7 },
  { turn: 19, level: "A2", part: 8 },
  { turn: 20, level: "A2", part: 9 },
  // B1: turns 21 to 47 (parts 1 to 27)
  ...Array.from({ length: 27 }, (_, i) => ({ turn: 21 + i, level: "B1", part: i + 1 })),
  // B1: turns 50 to 55 (parts 28 to 33)
  { turn: 50, level: "B1", part: 28 },
  { turn: 51, level: "B1", part: 29 },
  { turn: 52, level: "B1", part: 30 },
  { turn: 53, level: "B1", part: 31 },
  { turn: 54, level: "B1", part: 32 },
  { turn: 55, level: "B1", part: 33 }
];

const sha256 = (str) => crypto.createHash("sha256").update(str, "utf8").digest("hex");

const outDir = path.resolve("data/lessons");
fs.mkdirSync(path.join(outDir, "a1"), { recursive: true });
fs.mkdirSync(path.join(outDir, "a2"), { recursive: true });
fs.mkdirSync(path.join(outDir, "b1"), { recursive: true });
fs.mkdirSync(path.join(outDir, "b2"), { recursive: true });
fs.mkdirSync(path.join(outDir, "c1"), { recursive: true });

const index = {
  schema_version: "1.0.0",
  course_title: course.conversation?.title || "REAL ENGLISH — Grammar Through Chunks",
  source_conversation_id: course.conversation?.source_id,
  generated_at: new Date().toISOString(),
  totals: {
    a1_lessons: 6,
    a2_lessons: 9,
    b1_lessons: 33,
    b2_planned: 40,
    c1_planned: 40
  },
  lessons: []
};

for (const item of LESSON_MAPPING) {
  const turn = course.turns[item.turn - 1];
  const userPrompt = turn.user?.content || "";
  const assist = turn.assistant?.segments?.map((s) => s.content).join("\n") || "";
  const headings = (turn.headings || []).map((h) => (typeof h === "string" ? h : h.text));

  // Determine Title
  let title = "";
  const aulaMatch = assist.match(/#+\s*(?:AULA\s+0?\d+\s*[—–-]\s*|PARTE\s+0?\d+\s*[—–-]\s*|ETAPA\s+1\s*[—–-]\s*)([^\n<]+)/i);
  if (aulaMatch) {
    title = aulaMatch[1].replace(/<[^>]+>/g, "").trim();
  } else if (headings[1]) {
    title = headings[1].replace(/<[^>]+>/g, "").trim();
  } else {
    title = `Parte ${item.part}`;
  }

  const lessonId = `${item.level.toLowerCase()}-part-${String(item.part).padStart(2, "0")}`;
  const relativePath = `data/lessons/${item.level.toLowerCase()}/part-${String(item.part).padStart(2, "0")}.json`;

  const lessonRecord = {
    id: lessonId,
    level: item.level,
    part: item.part,
    title,
    turn_ordinal: item.turn,
    source_message_id: turn.assistant?.segments?.[0]?.source_message_id,
    sha256: sha256(assist),
    character_count: assist.length,
    user_prompt: userPrompt,
    headings,
    raw_markdown: assist
  };

  fs.writeFileSync(path.join(outDir, `${item.level.toLowerCase()}/part-${String(item.part).padStart(2, "0")}.json`), JSON.stringify(lessonRecord, null, 2), "utf8");

  index.lessons.push({
    id: lessonId,
    level: item.level,
    part: item.part,
    title,
    turn_ordinal: item.turn,
    character_count: assist.length,
    file_path: relativePath
  });
}

// B2 & C1 plans
const b2Turn = course.turns[56];
const b2Content = b2Turn.assistant?.segments?.map((s) => s.content).join("\n") || "";
fs.writeFileSync(
  path.join(outDir, "b2/plan.json"),
  JSON.stringify(
    {
      level: "B2",
      turn_ordinal: 57,
      title: "Volume 4 · B2 — Upper-Intermediate (Planejamento 40 partes)",
      sha256: sha256(b2Content),
      character_count: b2Content.length,
      raw_markdown: b2Content
    },
    null,
    2
  ),
  "utf8"
);

const c1Turn = course.turns[57];
const c1Content = c1Turn.assistant?.segments?.map((s) => s.content).join("\n") || "";
fs.writeFileSync(
  path.join(outDir, "c1/plan.json"),
  JSON.stringify(
    {
      level: "C1",
      turn_ordinal: 58,
      title: "Volume 5 · C1 — Advanced (Planejamento 40 partes)",
      sha256: sha256(c1Content),
      character_count: c1Content.length,
      raw_markdown: c1Content
    },
    null,
    2
  ),
  "utf8"
);

fs.writeFileSync("data/course-lessons-index.json", JSON.stringify(index, null, 2), "utf8");

console.log(`Extração concluída com sucesso!`);
console.log(`A1: 6 lições extraídas.`);
console.log(`A2: 9 lições extraídas.`);
console.log(`B1: 33 lições extraídas.`);
console.log(`B2 & C1: Planejamentos preservados.`);
console.log(`Índice gravado em data/course-lessons-index.json.`);
