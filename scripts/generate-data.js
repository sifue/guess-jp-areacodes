import { readFileSync, writeFileSync } from "node:fs";
// 元資料の強調記号だけを除去し、先頭の0と越境する都道府県を保持する。
const entries = readFileSync("JP_AREACODES.md", "utf8")
  .split("\n")
  .filter((line) => /^\|\s*\*?\*?0/.test(line))
  .map((line) => {
    const [code, names, hint] = line
      .split("|")
      .slice(1, 4)
      .map((s) => s.replaceAll("**", "").trim());
    return { code, prefectures: names.split("・"), hint };
  });
writeFileSync("src/data.json", JSON.stringify(entries, null, 2) + "\n");
console.log(`${entries.length}件の学習パターンを生成しました`);

writeFileSync("public/JP_AREACODES.md", readFileSync("JP_AREACODES.md"));
