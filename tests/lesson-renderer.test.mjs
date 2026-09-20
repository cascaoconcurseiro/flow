import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {extractLessonData} from "../src/lesson-renderer.mjs";

test("extrai datasets estruturados das aulas históricas sem erros", () => {
  const lesson = JSON.parse(fs.readFileSync("data/lessons/a1/part-01.json", "utf8"));
  const data = extractLessonData(lesson.raw_markdown);

  assert.ok(data.deck && data.deck.length === 15, "Deve conter 15 flashcards");
  assert.ok(data.exam && data.exam.length === 15, "Deve conter 15 questões de avaliação");
  assert.ok(data.activePractice && data.activePractice.length === 10, "Deve conter 10 práticas ativas");
  assert.ok(data.subjects && data.descriptions, "Deve conter dados do explorador de frases");
  assert.ok(data.greetings && data.greetings.length === 5, "Deve conter 5 cumprimentos reais");
});
