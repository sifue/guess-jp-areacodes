import entries from "./data.json";

// 県境の入り組みを、代表地域の位置と同じ番号の反復表示で示す自作模式図。
// 2桁で完結する04・03・06は、先頭3桁の学習パターンと区別する。
const colors = [
  "#355f9b",
  "#397d78",
  "#976b26",
  "#b35e3b",
  "#8d517b",
  "#655399",
  "#536f31",
  "#8a5234",
];
const definitions = [
  {
    id: "kanto",
    prefix: "04",
    title: "04系：首都圏の市外局番",
    description:
      "東京03を基準に、西側の042、北側の048・049、神奈川の044〜046、千葉の043・047を配置。049は東京都の島しょ部にもあります。",
    height: 760,
    nodes: [
      ["049", "埼玉西部", "川越 049・秩父 0494", 240, 55],
      ["048", "埼玉東部・北部", "浦和・熊谷 048", 480, 55],
      ["04", "所沢", "正式な市外局番は2桁", 10, 55, true],
      ["04", "柏", "正式な市外局番は2桁", 730, 55, true],
      ["042", "多摩・相模原・飯能方面", "八王子・相模原・飯能 042", 100, 235],
      ["03", "東京23区", "位置の基準", 460, 235, true],
      ["047", "千葉北西部・東部", "船橋 047・銚子 0479", 730, 235],
      ["046", "神奈川西部・南部", "厚木・横須賀 046", 50, 420],
      ["045", "横浜", "横浜 045", 280, 420],
      ["044", "川崎", "川崎 044", 510, 365],
      ["043", "千葉・市原・木更津方面", "千葉 043・市原 0436", 740, 420],
      ["049", "東京都の島しょ部（別枠）", "大島 04992・小笠原 04998", 100, 620],
      ["04", "鴨川", "正式な市外局番は2桁", 500, 620, true],
      ["047", "千葉南部", "館山・大原 0470", 740, 620],
    ],
    guides: [
      ["埼玉方面", 480, 30],
      ["東京湾", 600, 555],
      ["太平洋", 780, 590],
    ],
    connections: [
      ["M480 145 L460 225"],
      ["M450 285 L320 285"],
      ["M510 470 L510 515 L490 515"],
      ["M720 285 L680 285"],
      ["M850 335 L850 410"],
    ],
    notes: [
      [
        "042",
        "東京都・神奈川県・埼玉県・山梨県にまたがる先頭桁。東京だけに限定しない。",
      ],
      ["047", "千葉が中心。0479は茨城県側にもまたがる。"],
      ["049", "埼玉西部と東京都の島しょ部。0499xを別枠で区別する。"],
      [
        "04",
        "柏・所沢・鴨川では市外局番自体が04。元の59問の学習表には独立した行がないため、補足として掲載。",
      ],
    ],
    source:
      "https://www.ntt-east.co.jp/info-st/mutial/suburbs/numlist/pdf/ma_area4.pdf",
    sourceLabel: "NTT東日本：04から始まる市外局番",
  },
  {
    id: "kinki",
    prefix: "07",
    title: "07系：近畿・北陸の市外局番",
    description:
      "大阪06を基準に、神戸078と兵庫079、京都075、奈良・滋賀074を配置。北陸の076と、福井・京都・滋賀に分かれる077を区別します。",
    height: 950,
    nodes: [
      ["076", "石川", "金沢 076・小松 0761", 500, 50],
      ["076", "富山", "富山 076・高岡 0766", 740, 50],
      ["077", "福井", "福井 0776・敦賀 0770", 500, 205],
      ["079", "兵庫（神戸以外の広い範囲）", "先頭079の地域", 30, 360],
      ["077", "京都北部・中部", "舞鶴 0773・亀岡 0771", 270, 360],
      ["074", "滋賀北部・東部・湖西", "彦根 0749・今津 0740", 740, 360],
      ["078", "神戸", "神戸 078", 30, 515],
      ["06", "大阪・尼崎", "位置の基準", 270, 515, true],
      ["075", "京都市周辺", "大阪府島本町にもまたがる", 505, 480],
      ["077", "滋賀南部・京都南部", "大津 077・宇治 0774", 740, 515],
      ["072", "大阪郊外・兵庫の一部", "堺・池田・茨木 072", 270, 670],
      ["074", "奈良", "奈良 0742・大和郡山 0743", 505, 670],
      ["073", "和歌山", "和歌山 073・田辺 0739", 270, 825],
      ["073", "新宮・三重県境方面", "新宮 0735", 740, 825],
    ],
    guides: [
      ["北陸", 790, 30],
      ["琵琶湖", 800, 485],
      ["紀伊半島", 600, 815],
    ],
    connections: [
      ["M610 145 L610 195"],
      ["M590 305 L590 335 L490 400"],
      ["M860 460 L860 505"],
      ["M380 610 L380 660"],
      ["M615 580 L615 660"],
      ["M500 720 L490 720"],
      ["M380 765 L380 815"],
    ],
    notes: [
      ["074", "奈良と滋賀に分布。先頭074には京都府・大阪府への越境も含む。"],
      [
        "077",
        "福井・京都・滋賀の3府県。京都市075と京都府内の077系を区別する。",
      ],
      ["072", "大阪郊外だけでなく、兵庫県の川西・伊丹方面にも分布。"],
      ["073", "和歌山が中心。0735は三重県側にもまたがる。"],
    ],
    source:
      "https://www.ntt-west.co.jp/open/tani_ryoukin_0509/pdf/areapay3.pdf",
    sourceLabel: "NTT西日本：単位料金区域別市外局番等一覧表（2022年3月1日）",
  },
];
function codeColor(code, prefix) {
  const index = entries
    .filter((entry) => entry.code.startsWith(prefix))
    .findIndex((entry) => entry.code === code);
  return index < 0 ? "#596558" : colors[index % colors.length];
}
export function regionalMaps(prefix) {
  return definitions
    .filter((region) => !prefix || region.prefix === prefix)
    .map((region) => {
      const patterns = entries.filter((entry) =>
        entry.code.startsWith(region.prefix),
      );
      return `<section class="hokkaido-panel regional-panel" data-regional-map="${region.prefix}" aria-labelledby="${region.id}-title"><div class="hokkaido-heading"><h2 id="${region.id}-title">${region.title}</h2><span>番号と地域の位置関係</span></div><p class="regional-description">${region.description}</p><div class="regional-legend">${patterns.map((entry) => `<span style="--code-color:${codeColor(entry.code, region.prefix)}"><b>${entry.code}</b>系</span>`).join("")}<span class="context-legend">破線枠：2桁の番号・位置の基準</span></div><div class="regional-scroll" tabindex="0" role="region" aria-label="${region.title}の図。左右にスクロールできます"><svg class="regional-svg" viewBox="0 0 1000 ${region.height}" role="img" aria-labelledby="${region.id}-svg-title ${region.id}-svg-desc"><title id="${region.id}-svg-title">${region.title}の模式図</title><desc id="${region.id}-svg-desc">同じ先頭桁は同じ色。${region.description}線は近い地域の位置関係を示し、番号区域の境界や連続性は示しません。</desc><rect x="5" y="5" width="990" height="${region.height - 10}" rx="12" fill="#e8eddf"/><g fill="none" stroke="#a7b29c" stroke-width="2" stroke-dasharray="5 6">${region.connections.map(([d]) => `<path d="${d}"/>`).join("")}</g><g fill="#53644b" font-size="15">${region.guides.map(([text, x, y]) => `<text x="${x}" y="${y}" text-anchor="middle">${text}</text>`).join("")}<text x="40" y="35">北 ↑</text></g>${region.nodes.map(([code, area, example, x, y, context]) => `<g data-region-code="${code}"><rect x="${x}" y="${y}" width="220" height="100" rx="8" fill="#fffefa" stroke="${codeColor(code, region.prefix)}" stroke-width="2" ${context ? 'stroke-dasharray="6 4"' : ""}/><text x="${x + 14}" y="${y + 34}" fill="${codeColor(code, region.prefix)}" font-family="Arial, sans-serif" font-size="32" font-weight="700">${code}<tspan font-size="14">${context ? "" : " 系"}</tspan></text><text x="${x + 14}" y="${y + 62}" fill="#243b30" font-size="14" font-weight="600">${area}</text><text x="${x + 14}" y="${y + 85}" fill="#58674f" font-size="12">${example}</text></g>`).join("")}</svg></div><div class="regional-notes">${region.notes.map(([code, note]) => `<p><b style="color:${codeColor(code, region.prefix)}">${code}</b><span>${note}</span></p>`).join("")}</div><details class="regional-table"><summary>番号ごとの対応都道府県を表示</summary><div class="table-wrap"><table><thead><tr><th>先頭桁</th><th>対応都道府県（提供資料）</th></tr></thead><tbody>${patterns.map((entry) => `<tr><th>${entry.code}</th><td>${entry.prefectures.join("・")}</td></tr>`).join("")}</tbody></table></div></details><p class="hokkaido-source">位置関係を整理した自作模式図です。地域の形状・縮尺・番号区域の境界は表現していません。同じ先頭桁を複数の場所に表示しています。<br>地域の対応：JP_AREACODES.md ／ 番号例：<a href="${region.source}" target="_blank" rel="noopener noreferrer">${region.sourceLabel}</a><br>関連図：<a href="https://www.plonkit.net/images/japan/jp_areacodes_darkmode.png" target="_blank" rel="noopener noreferrer">Plonk It 日本の市外局番図</a></p></section>`;
    })
    .join("");
}
