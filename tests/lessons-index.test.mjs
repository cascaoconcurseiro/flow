import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("índice de aulas históricas contém todas as 48 lições e 2 planejamentos", () => {
  const index = JSON.parse(fs.readFileSync("data/course-lessons-index.json", "utf8"));
  assert.equal(index.totals.a1_lessons, 6);
  assert.equal(index.totals.a2_lessons, 9);
  assert.equal(index.totals.b1_lessons, 33);
  assert.equal(index.lessons.length, 48);

  for (const lesson of index.lessons) {
    assert.ok(lesson.id, "ID da lição ausente");
    assert.ok(lesson.title, "Título da lição ausente: " + lesson.id);
    assert.ok(fs.existsSync(lesson.file_path), "Arquivo não encontrado: " + lesson.file_path);
    const data = JSON.parse(fs.readFileSync(lesson.file_path, "utf8"));
    assert.equal(data.id, lesson.id);
    assert.equal(data.character_count, lesson.character_count);
    assert.ok(data.raw_markdown?.length > 1000, "Markdown muito curto em " + lesson.id);
  }

  assert.ok(fs.existsSync("data/lessons/b2/plan.json"));
  assert.ok(fs.existsSync("data/lessons/c1/plan.json"));
});
