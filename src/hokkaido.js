// 道内の位置関係を模式化した自作図。矢印は番号順であり利用区域の境界ではない。
const groups = [
  {
    code: "011",
    area: "札幌",
    examples: "札幌 011",
    color: "#355f9b",
    x: 265,
    y: 270,
  },
  {
    code: "012",
    area: "空知・千歳",
    examples: "岩見沢 0126 ／ 千歳 0123",
    color: "#397d78",
    x: 280,
    y: 125,
  },
  {
    code: "013",
    area: "小樽・函館方面",
    examples: "小樽 0134 ／ 函館 0138",
    color: "#976b26",
    x: 70,
    y: 350,
  },
  {
    code: "014",
    area: "室蘭・苫小牧・日高",
    examples: "室蘭 0143 ／ 苫小牧 0144",
    color: "#b35e3b",
    x: 310,
    y: 460,
  },
  {
    code: "015",
    area: "道東",
    examples: "帯広 0155 ／ 釧路 0154 ／ 網走 0152",
    color: "#8d517b",
    x: 565,
    y: 290,
  },
  {
    code: "016",
    area: "道北・旭川方面",
    examples: "旭川 0166 ／ 稚内 0162",
    color: "#655399",
    x: 515,
    y: 35,
  },
];
export function hokkaidoMap() {
  return `<section class="hokkaido-panel" aria-labelledby="hokkaido-title"><div class="hokkaido-heading"><h2 id="hokkaido-title">北海道の市外局番 011〜016</h2><span>先頭3桁の補足図</span></div><p class="hokkaido-caption">札幌011を起点に、012 → 013 → 014 → 015 → 016の順に配置。矢印は番号順を示します。</p><div class="hokkaido-layout"><div class="hokkaido-scroll" tabindex="0" role="region" aria-label="北海道の番号順の模式図。小画面では左右にスクロールできます"><svg class="hokkaido-svg" viewBox="0 0 790 610" role="img" aria-labelledby="hokkaido-svg-title hokkaido-svg-desc"><title id="hokkaido-svg-title">北海道の市外局番の番号順と位置関係</title><desc id="hokkaido-svg-desc">011札幌から012空知・千歳、013小樽・函館方面、014室蘭・苫小牧・日高、015道東、016道北・旭川方面へ進む渦巻き状の模式図。地域の範囲や地形は正確な地図ではありません。</desc><defs><marker id="hokkaido-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="#82917b"/></marker></defs><path d="M435 45 L465 107 L520 155 L583 184 L659 174 L624 221 L681 263 L730 270 L667 305 L615 340 L555 359 L508 397 L458 467 L423 426 L368 400 L320 414 L276 397 L240 425 L246 467 L214 490 L180 465 L149 498 L118 472 L154 438 L140 397 L172 364 L182 321 L222 303 L270 288 L307 273 L330 224 L362 179 L370 128 L406 81 Z" fill="#e8eddf" stroke="#c7d1bc" stroke-width="2"/><g fill="none" stroke="#82917b" stroke-width="3" stroke-dasharray="7 6" marker-end="url(#hokkaido-arrow)"><path d="M345 265 Q340 245 355 216"/><path d="M273 164 C130 140 108 248 144 340"/><path d="M158 438 C173 523 247 532 302 504"/><path d="M478 507 C599 504 672 462 656 382"/><path d="M657 285 C730 184 720 90 683 80"/></g><g fill="#516448" font-family="sans-serif" font-size="14"><text x="35" y="45">位置関係の模式図</text><path d="M735 92V40m-7 10l7-10 7 10" fill="none" stroke="#516448" stroke-width="2"/><text x="727" y="28">北</text><text x="26" y="585">西</text><text x="748" y="585">東</text></g>${groups.map((g, i) => `<g data-hokkaido-code="${g.code}"><rect x="${g.x}" y="${g.y}" width="165" height="82" rx="9" fill="#fffefa" stroke="${g.color}" stroke-width="2"/><circle cx="${g.x + 20}" cy="${g.y + 22}" r="12" fill="${g.color}"/><text x="${g.x + 20}" y="${g.y + 27}" text-anchor="middle" fill="white" font-size="14" font-family="Arial">${i + 1}</text><text x="${g.x + 45}" y="${g.y + 37}" fill="${g.color}" font-size="32" font-weight="700" font-family="Arial">${g.code}</text><text x="${g.x + 82}" y="${g.y + 65}" text-anchor="middle" fill="#243b30" font-size="14">${g.area}</text></g>`).join("")}</svg></div><ol class="hokkaido-key">${groups.map((g) => `<li style="--hokkaido-color:${g.color}"><b>${g.code}</b><div><strong>${g.area}</strong><p>${g.examples}</p></div></li>`).join("")}</ol></div><p class="hokkaido-source">先頭3桁でまとめた概略です。矢印は学習用の番号順で、連続した利用区域・移動経路・正確な境界を示しません。0120などの着信課金番号は対象外です。<br>番号例の出典：<a href="https://www.ntt-east.co.jp/info-st/mutial/suburbs/numlist/pdf/ma_area1.pdf" target="_blank" rel="noopener noreferrer">NTT東日本「単位料金区域別市外局番等一覧表（01）」</a></p></section>`;
}
