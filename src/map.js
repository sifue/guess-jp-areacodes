import { regions, regionOf } from "./quiz.js";
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
export function mapSvg(active = []) {
  return `<svg class="japan-map" viewBox="0 0 490 500" role="img" aria-label="日本の都道府県タイル概略図${active.length ? "：" + active.join("・") + "を強調" : ""}"><defs><pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#dce2d8"/></pattern></defs><rect width="490" height="500" fill="url(#dots)"/>${tiles
    .map(([name, x, y]) => {
      const on = !active.length || active.includes(name);
      return `<g opacity="${on ? 1 : 0.16}"><rect x="${x * 35 + 24}" y="${y * 33 + 16}" width="32" height="30" rx="5" fill="${regions[regionOf(name)].color}"/><text x="${x * 35 + 40}" y="${y * 33 + 35}" text-anchor="middle" fill="#fff" font-size="10" font-weight="600">${name === "北海道" ? "北海道" : name.slice(0, -1)}</text></g>`;
    })
    .join(
      "",
    )}<path d="M28 409l25-14m-25 20l25-14" stroke="#b0b9ae" fill="none"/><text x="165" y="470" fill="#778174" font-size="10">位置関係を示す概略図 · 縮尺・境界は実際と異なります</text></svg>`;
}
