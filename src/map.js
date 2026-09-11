import entries from "./data.json";
// 自作のタイル概略図。位置関係を覚えるための図で、行政境界は表現しない。
const tiles = [
  ["北海道", 10, 0],
  ["青森県", 10, 2],
  ["秋田県", 9, 3],
  ["岩手県", 10, 3],
  ["山形県", 9, 4],
  ["宮城県", 10, 4],
  ["福島県", 10, 5],
  ["新潟県", 8, 5],
  ["富山県", 7, 5],
  ["石川県", 6, 5],
  ["福井県", 6, 6],
  ["長野県", 8, 6],
  ["群馬県", 9, 6],
  ["栃木県", 10, 6],
  ["茨城県", 11, 6],
  ["埼玉県", 10, 7],
  ["千葉県", 11, 8],
  ["東京都", 10, 8],
  ["神奈川県", 9, 8],
  ["山梨県", 9, 7],
  ["岐阜県", 7, 6],
  ["静岡県", 8, 8],
  ["愛知県", 8, 7],
  ["滋賀県", 7, 7],
  ["三重県", 7, 8],
  ["京都府", 6, 7],
  ["大阪府", 6, 8],
  ["奈良県", 6, 9],
  ["和歌山県", 5, 9],
  ["兵庫県", 5, 7],
  ["鳥取県", 4, 7],
  ["岡山県", 4, 8],
  ["島根県", 3, 7],
  ["広島県", 3, 8],
  ["山口県", 2, 8],
  ["香川県", 4, 10],
  ["徳島県", 5, 10],
  ["愛媛県", 3, 10],
  ["高知県", 4, 11],
  ["福岡県", 1, 9],
  ["佐賀県", 0, 9],
  ["長崎県", 0, 10],
  ["大分県", 2, 9],
  ["熊本県", 1, 10],
  ["宮崎県", 2, 11],
  ["鹿児島県", 1, 11],
  ["沖縄県", 0, 13],
];
// トップの全国図だけを詰める。海の空白を省き、文字の大きさを保ったまま12列から10列へ減らす。
const compactPositions = {
  北海道: [10, 1],
  群馬県: [9, 5],
  栃木県: [9, 6],
  茨城県: [10, 6],
  千葉県: [10, 9],
};
const kyushuNames = new Set([
  "福岡県",
  "佐賀県",
  "長崎県",
  "熊本県",
  "大分県",
  "宮崎県",
  "鹿児島県",
  "沖縄県",
]);
const compactTiles = tiles.map(([name, x, y]) => {
  const [column, row] = compactPositions[name] || [
    x + (kyushuNames.has(name) ? 1 : 0),
    y,
  ];
  // 左端と上端に残る空列・空行も除く。
  return [name, column - 1, row - 1];
});
// 先頭2桁の所属は元資料から導出し、県単位の複数所属を省略しない。
export const prefixGroups = [
  { code: "01", color: "#496ca5" },
  { code: "02", color: "#39888c" },
  { code: "03", color: "#9b5076" },
  { code: "04", color: "#4e814b" },
  { code: "05", color: "#a87922" },
  { code: "06", color: "#b44e46" },
  { code: "07", color: "#785ca5" },
  { code: "08", color: "#737c2d" },
  { code: "09", color: "#9c6035" },
];
export const prefixColor = (code) =>
  prefixGroups.find((group) => group.code === code).color;
export function prefixesFor(name) {
  return [
    ...new Set(
      entries
        .filter((entry) => entry.prefectures.includes(name))
        .map((entry) => entry.code.slice(0, 2)),
    ),
  ].sort();
}
export function codesFor(name) {
  return entries
    .filter((entry) => entry.prefectures.includes(name))
    .map((entry) => entry.code);
}
// トップの全国図は学習パターンを省略せず、最大6件を3列2段に配置する。
function fullCodeMapSvg(active) {
  return `<svg class="japan-map prefix-svg full-code-svg" viewBox="0 0 1210 1180" role="img" aria-label="市外局番の全学習パターンと都道府県の対応図">${compactTiles
    .map(([name, x, y]) => {
      const codes = codesFor(name),
        left = x * 120 + 5,
        top = y * 90 + 5;
      return `<g class="prefecture-tile" data-prefecture="${name}" opacity="${!active.length || active.includes(name) ? 1 : 0.12}"><title>${name}：${codes.join("・")}</title><rect x="${left}" y="${top}" width="114" height="84" rx="6" fill="#fffefa" stroke="#c4cdbf"/><text x="${left + 57}" y="${top + 22}" text-anchor="middle" fill="#243b30" font-size="18" font-weight="600">${name}</text>${codes
        .map((code, i) => {
          const count = Math.min(3, codes.length - Math.floor(i / 3) * 3);
          const badgeX = left + (114 - count * 36) / 2 + (i % 3) * 36,
            badgeY = top + 32 + Math.floor(i / 3) * 25;
          return `<rect x="${badgeX}" y="${badgeY}" width="34" height="22" rx="3" fill="${prefixColor(code.slice(0, 2))}"/><text data-map-code="${code}" x="${badgeX + 17}" y="${badgeY + 17}" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="700" font-size="18">${code}</text>`;
        })
        .join("")}</g>`;
    })
    .join("")}</svg>`;
}
export function mapSvg(active = [], fullCodes = false) {
  if (fullCodes) return fullCodeMapSvg(active);
  return `<svg class="japan-map prefix-svg" viewBox="0 0 864 950" role="img" aria-label="市外局番の先頭2桁と都道府県の対応図${active.length ? "：" + active.join("・") + "を強調" : ""}">${tiles
    .map(([name, x, y]) => {
      const prefixes = prefixesFor(name),
        left = x * 70 + 10,
        top = y * 66 + 10;
      return `<g class="prefecture-tile" data-prefecture="${name}" opacity="${!active.length || active.includes(name) ? 1 : 0.12}"><title>${name}：${prefixes.join("・")}</title><rect x="${left}" y="${top}" width="66" height="61" rx="5" fill="#fffefa" stroke="#c4cdbf"/><text x="${left + 33}" y="${top + 21}" text-anchor="middle" fill="#243b30" font-size="15" font-weight="600">${name === "北海道" ? name : name.slice(0, -1)}</text>${prefixes.map((prefix, i) => `<rect x="${left + 3 + (i * 60) / prefixes.length}" y="${top + 32}" width="${60 / prefixes.length - 1}" height="24" rx="2" fill="${prefixColor(prefix)}"/><text x="${left + 3 + ((i + 0.5) * 60) / prefixes.length - 0.5}" y="${top + 49}" text-anchor="middle" fill="white" font-size="${prefixes.length > 2 ? 12 : 15}" font-family="Arial, sans-serif" font-weight="700">${prefix}</text>`).join("")}</g>`;
    })
    .join(
      "",
    )}<path d="M12 842l40-18m-40 26l40-18" stroke="#899580" fill="none"/></svg>`;
}
export function prefixMap(detailed = false, selected = "all") {
  const active =
    selected === "all"
      ? []
      : [
          ...new Set(
            entries
              .filter((entry) => entry.code.startsWith(selected))
              .flatMap((entry) => entry.prefectures),
          ),
        ];
  const groups = prefixGroups.filter(
    (group) => selected === "all" || group.code === selected,
  );
  return `<section class="map-panel prefix-map ${detailed ? "detailed-map" : ""}" data-detailed="${detailed}"><div class="map-heading"><h2>${detailed ? "市外局番 先頭2桁マップ" : "市外局番・都道府県マップ"}</h2><span>${detailed ? "01–09" : "全59パターン · 色は先頭2桁"}</span></div><div class="prefix-layout"><div class="prefix-visual" tabindex="0" role="region" aria-label="全国図。小画面では左右にスクロールできます">${mapSvg(active, !detailed)}</div><div class="prefix-info"><div class="prefix-legend" role="group" aria-label="先頭2桁で地図を絞り込む"><button data-prefix="all" aria-pressed="${selected === "all"}">すべて</button>${prefixGroups.map((group) => `<button data-prefix="${group.code}" aria-pressed="${selected === group.code}" style="--prefix:${group.color}"><span></span>${group.code}</button>`).join("")}</div><p class="map-instruction">${detailed ? "番号を選択すると対応する県を強調表示します。県内の色付き番号は、その県にある番号帯です。" : "各県に対応する学習パターンをすべて表示しています。色は先頭2桁に対応します。下の色付き番号を選択すると対応する県を強調表示します。"}</p><div class="prefix-correspondence" aria-live="polite">${detailed || selected !== "all" ? groups.map((group) => `<div><b style="--prefix:${group.color}">${group.code}</b><span>${[...new Set(entries.filter((entry) => entry.code.startsWith(group.code)).flatMap((entry) => entry.prefectures))].join("・")}</span></div>`).join("") : ""}</div></div></div><p class="map-source">提供資料の59パターンに基づく対応図。県境をまたぐ番号も含みます。県内の利用区域・地形・縮尺を示す図ではありません。</p></section>`;
}
