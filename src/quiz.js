export const regions = [
  {
    name: "北海道・東北",
    color: "#7485ad",
    names: "北海道 青森県 岩手県 宮城県 秋田県 山形県 福島県",
  },
  {
    name: "関東",
    color: "#6b9c85",
    names: "茨城県 栃木県 群馬県 埼玉県 千葉県 東京都 神奈川県",
  },
  {
    name: "中部",
    color: "#b9a367",
    names: "新潟県 富山県 石川県 福井県 山梨県 長野県 岐阜県 静岡県 愛知県",
  },
  {
    name: "近畿",
    color: "#c99173",
    names: "三重県 滋賀県 京都府 大阪府 兵庫県 奈良県 和歌山県",
  },
  {
    name: "中国・四国",
    color: "#929d67",
    names: "鳥取県 島根県 岡山県 広島県 山口県 徳島県 香川県 愛媛県 高知県",
  },
  {
    name: "九州・沖縄",
    color: "#b58b9b",
    names: "福岡県 佐賀県 長崎県 熊本県 大分県 宮崎県 鹿児島県 沖縄県",
  },
];
export const regionOf = (name) =>
  regions.findIndex((r) => r.names.split(" ").includes(name));
export const label = (entry) => entry.prefectures.join("・");
export function shuffle(items, random = Math.random) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
// 正解と同じ地方の県を優先し、複数県の問題には同じ県数の紛らわしい組を作る。
export function makeOptions(entry, random = Math.random) {
  const correct = label(entry),
    count = entry.prefectures.length;
  const near = regions.flatMap((r, i) =>
    r.names.split(" ").map((name) => ({
      name,
      distance: Math.min(
        ...entry.prefectures.map((p) => Math.abs(regionOf(p) - i)),
      ),
    })),
  );
  const pool = shuffle(near, random)
    .sort((a, b) => a.distance - b.distance)
    .map((p) => p.name);
  const options = [correct];
  for (const name of pool) {
    if (entry.prefectures.includes(name)) continue;
    const wrong = [...entry.prefectures];
    wrong[count - 1] = name;
    const value = wrong.join("・");
    if (!options.includes(value)) options.push(value);
    if (options.length === 4) break;
  }
  return shuffle(options, random);
}
export function summarize(answers) {
  const correct = answers.filter((a) => a.correct).length;
  const duration = answers.reduce((sum, a) => sum + a.seconds, 0);
  const score = Math.round((correct / answers.length) * 1000);
  const grade =
    score === 1000
      ? "S"
      : score >= 900
        ? "A"
        : score >= 800
          ? "B"
          : score >= 700
            ? "C"
            : score >= 600
              ? "D"
              : score >= 500
                ? "E"
                : "F";
  return {
    correct,
    total: answers.length,
    duration,
    average: duration / answers.length,
    score,
    rate: Math.round((correct / answers.length) * 100),
    grade,
  };
}
export function readHistory(storage) {
  try {
    const data = JSON.parse(storage.getItem("kyokuban-history-v1") || "[]");
    return Array.isArray(data)
      ? data
          .filter(
            (r) =>
              r &&
              ["ten", "all", "review"].includes(r.mode) &&
              typeof r.date === "string" &&
              Number.isFinite(Date.parse(r.date)) &&
              Number.isFinite(r.score) &&
              r.score >= 0 &&
              r.score <= 1000 &&
              Number.isFinite(r.duration) &&
              r.duration >= 0,
          )
          .slice(-100)
      : [];
  } catch {
    return [];
  }
}
