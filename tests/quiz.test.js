import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  regions,
  label,
  makeOptions,
  shuffle,
  summarize,
  readHistory,
} from "../src/quiz.js";
const data = JSON.parse(
  readFileSync(new URL("../src/data.json", import.meta.url)),
);
test("全59パターンの先頭0・47都道府県・越境県を保持する", () => {
  assert.equal(data.length, 59);
  assert.equal(new Set(data.map((q) => q.code)).size, 59);
  assert.equal(new Set(data.flatMap((q) => q.prefectures)).size, 47);
  for (const q of data) {
    assert.match(q.code, /^0\d{1,2}$/);
    assert.ok(q.hint);
    for (const p of q.prefectures)
      assert.ok(regions.some((r) => r.names.split(" ").includes(p)));
  }
  assert.equal(
    label(data.find((q) => q.code === "042")),
    "東京都・神奈川県・埼玉県・山梨県",
  );
});
test("全問題で4択は重複せず、正解は一つで、県数から答えが漏れない", () => {
  for (let run = 0; run < 50; run++)
    for (const q of data) {
      const options = makeOptions(q);
      assert.equal(options.length, 4);
      assert.equal(new Set(options).size, 4);
      assert.equal(options.filter((o) => o === label(q)).length, 1);
      for (const o of options)
        assert.equal(o.split("・").length, q.prefectures.length);
    }
});
test("シャッフルは元データを変更せず全問を含む", () => {
  const shuffled = shuffle(data);
  assert.notEqual(shuffled, data);
  assert.deepEqual(
    [...shuffled].sort((a, b) => a.code.localeCompare(b.code)),
    [...data].sort((a, b) => a.code.localeCompare(b.code)),
  );
});
test("スコア・全評価境界と回答時間集計", () => {
  for (const [count, grade] of [
    [10, "S"],
    [9, "A"],
    [8, "B"],
    [7, "C"],
    [6, "D"],
    [5, "E"],
    [4, "F"],
    [0, "F"],
  ]) {
    const s = summarize(
      Array.from({ length: 10 }, (_, i) => ({
        correct: i < count,
        seconds: 2,
      })),
    );
    assert.equal(s.grade, grade);
    assert.equal(s.score, count * 100);
    assert.equal(s.duration, 20);
    assert.equal(s.average, 2);
  }
});
test("破損した保存データや利用不可のストレージでも読み込みを継続する", () => {
  for (const value of ["{", "null", "{}", "[null,1,{}]"])
    assert.deepEqual(readHistory({ getItem: () => value }), []);
  assert.deepEqual(
    readHistory({
      getItem() {
        throw Error("禁止");
      },
    }),
    [],
  );
});
