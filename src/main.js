import "./style.css";
import entries from "./data.json";
import { regionalMaps } from "./regional-maps.js";
import { hokkaidoMap } from "./hokkaido.js";
import { version } from "../package.json";
import {
  regions,
  regionOf,
  label,
  shuffle,
  makeOptions,
  summarize,
  readHistory,
} from "./quiz.js";
import { prefixColor, prefixMap, mapSvg } from "./map.js";
const QUESTION_SECONDS = 10;
let countdownId;
const app = document.querySelector("#app");
const state = {
  page: "home",
  mode: "ten",
  questions: [],
  answers: [],
  index: 0,
  selection: null,
  options: [],
  started: 0,
  hidden: new Set(),
  filter: "",
  region: "all",
  history: [],
  storageError: false,
};
try {
  state.history = readHistory(localStorage);
} catch {
  state.storageError = true;
}
const escapeHtml = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const time = (s) =>
  s < 60
    ? `${s.toFixed(1)}秒`
    : `${Math.floor(s / 60)}分${Math.floor(s % 60)}秒`;
const modeName = (mode) =>
  ({ ten: "10問モード", all: "全市外局番モード", review: "復習モード" })[mode];
function shell(content) {
  app.innerHTML = `<header class="header"><a class="brand" href="#home"><span class="brand-icon">局</span>市外局番ノート<span class="brand-sub">日本の市外局番をおぼえる</span></a><nav aria-label="メインナビゲーション"><a href="#home" ${state.page === "home" ? 'aria-current="page"' : ""}>ホーム</a><a href="#study" ${state.page === "study" ? 'aria-current="page"' : ""}>暗記ノート</a><a href="#history" ${state.page === "history" ? 'aria-current="page"' : ""}>学習記録</a></nav></header><main id="main" tabindex="-1">${content}</main><footer><a class="footer-brand" href="#home">市外局番ノート </a><div><a href="#about">使い方・出典</a><a href="https://github.com/sifue/guess-jp-areacodes">GitHub</a><span>© ${new Date().getFullYear()} Soichiro Yoshimura <a href="https://github.com/sifue">@sifue</a></span><span>v${version}</span></div></footer>`;
}
function home() {
  shell(
    `<section class="hero"><div class="hero-copy"><div class="eyebrow"><span></span> GEOGUESSR 日本マップ向け</div><h1>数字から、<br>日本を<span class="underline">思い出す。</span></h1><p class="intro">市外局番の先頭2〜3桁から都道府県を答える4択クイズ。<br class="desktop">1問10秒。全59パターンを収録。</p><button class="primary" data-start="ten">まずは10問、挑戦する <span>↗</span></button><div class="hero-caption">登録不要 <i>·</i> 1回 約2分 <i>·</i> スマートフォン対応</div><div class="hero-facts"><div><strong>47<span>都道府県</span></strong><small>全国対応</small></div><div><strong>${entries.length}<span>パターン</span></strong><small>先頭2〜3桁で学ぶ</small></div><div><strong>3<span>つのモード</span></strong><small>1問10秒</small></div></div></div>${prefixMap()}${hokkaidoMap()}${regionalMaps()}</section><section class="mode-section"><div class="section-heading"><div><span class="eyebrow">LET’S PRACTICE</span><h2>モード選択</h2></div></div><div class="mode-grid"><button class="mode-card recommended" data-start="ten"><span class="recommend">はじめての方におすすめ</span><span class="card-top"><span class="mode-icon">10</span><span class="card-index">01 / QUICK QUIZ</span></span><h3>市外局番10問モード</h3><p>59パターンからランダムに10問出題。<br>回答後に正解と覚え方を表示。</p><span class="card-bottom"><span>10問 <i>·</i> 4択 <i>·</i> 約2分</span><b>→</b></span></button><button class="mode-card" data-start="all"><span class="card-top"><span class="mode-icon ochre">全</span><span class="card-index">02 / FULL CHALLENGE</span></span><h3>全市外局番モード</h3><p>全${entries.length}パターンを重複なしで出題。<br>終了後に全問の回答結果を表示。</p><span class="card-bottom"><span>${entries.length}問 <i>·</i> 4択 <i>·</i> 1問10秒</span><b>→</b></span></button><a class="mode-card" href="#study"><span class="card-top"><span class="mode-icon blue">▤</span><span class="card-index">03 / MEMORY NOTE</span></span><h3>全暗記モード</h3><p>番号と都道府県の対応図・一覧。<br>県名と覚え方を個別・一括で非表示。</p><span class="card-bottom"><span>一覧 <i>·</i> 覚え方 <i>·</i> 表示／非表示</span><b>→</b></span></a></div></section><p class="scope-note">学習対象は資料の先頭2〜3桁です。複数の都道府県にまたがる番号は、県の組み合わせで出題します。正式な全市外局番の網羅一覧ではありません。</p>`,
  );
}
function start(mode, questions) {
  state.mode = mode;
  state.questions = shuffle(questions || entries).slice(
    0,
    mode === "ten" ? 10 : undefined,
  );
  state.answers = [];
  state.index = 0;
  state.page = "quiz";
  history.pushState(null, "", "#quiz");
  prepare();
  render();
  window.scrollTo(0, 0);
}
function prepare() {
  clearInterval(countdownId);
  state.selection = null;
  state.options = makeOptions(state.questions[state.index]);
  state.started = performance.now();
  countdownId = setInterval(updateCountdown, 50);
}
function updateCountdown() {
  if (state.page !== "quiz" || state.selection !== null) return;
  const remaining = Math.max(
    0,
    QUESTION_SECONDS - (performance.now() - state.started) / 1000,
  );
  const output = document.querySelector("[data-countdown]");
  if (output) {
    output.textContent = remaining.toFixed(1);
    output.parentElement.classList.toggle("urgent", remaining <= 3);
  }
  if (remaining === 0) answer(null);
}
function quiz() {
  const q = state.questions[state.index];
  if (!q) {
    go("home");
    return;
  }
  const answered = state.selection !== null;
  const correct = state.selection === label(q);
  shell(
    `<div class="narrow"><div class="page-top"><a href="#home">← モード選択へ</a><span>${modeName(state.mode)}</span></div><div class="quiz-progress"><strong>問題 ${state.index + 1}<span> / ${state.questions.length}</span></strong><span>${state.answers.filter((a) => a.correct).length}問正解</span></div><progress value="${state.index + (answered ? 1 : 0)}" max="${state.questions.length}" aria-label="回答済みの問題数"></progress><section class="question-card"><div class="countdown" role="timer" aria-label="残り時間"><span>残り</span><b data-countdown>10.0</b><span>秒</span></div><span class="eyebrow">この市外局番はどの都道府県ですか？</span><div class="question-number">${q.code}</div><p class="muted">先頭${q.code.length}桁${q.prefectures.length > 1 ? " · 該当する" + q.prefectures.length + "都道府県の組み合わせを選択" : " · 該当する都道府県を選択"}</p><div class="choices">${state.options.map((option, i) => `<button data-answer="${i}" ${answered ? "disabled" : ""} class="choice ${answered && option === label(q) ? "correct" : ""} ${answered && option === state.selection && !correct ? "incorrect" : ""}"><span class="choice-key">${i + 1}</span><span>${option}</span>${answered && option === label(q) ? "<b>✓</b>" : ""}${answered && option === state.selection && !correct ? "<b>×</b>" : ""}</button>`).join("")}</div>${answered ? `<div class="feedback ${correct ? "" : "wrong"}" role="status"><strong>${correct ? "✓ 正解" : state.selection === "時間切れ" ? "時間切れ" : "× 不正解"}</strong><p>正解：${label(q)}</p><div class="memory-hint"><span>覚え方</span>${q.hint}</div><details><summary>地図で場所を確認</summary>${mapSvg(q.prefectures)}</details></div><button class="primary next" data-next>${state.index + 1 === state.questions.length ? "結果を見る" : "次の問題へ"} →</button>` : '<p class="keyboard-hint">選択肢をタップして回答 <span>／ キーボード 1〜4</span></p>'}</section></div>`,
  );
}
function answer(index) {
  if (state.selection !== null) return;
  const expired =
    (performance.now() - state.started) / 1000 >= QUESTION_SECONDS;
  const selected = expired ? "時間切れ" : state.options[index];
  if (!selected) return;
  const q = state.questions[state.index];
  clearInterval(countdownId);
  state.selection = selected;
  state.answers.push({
    code: q.code,
    expected: label(q),
    selected,
    correct: selected === label(q),
    seconds: Math.min(
      QUESTION_SECONDS,
      (performance.now() - state.started) / 1000,
    ),
  });
  render();
  const output = document.querySelector("[data-countdown]");
  if (output)
    output.textContent = Math.max(
      0,
      QUESTION_SECONDS - state.answers.at(-1).seconds,
    ).toFixed(1);
  document.querySelector("[data-next]")?.focus({ preventScroll: true });
}
function finish() {
  const result = {
    ...summarize(state.answers),
    mode: state.mode,
    date: new Date().toISOString(),
  };
  state.history.push(result);
  state.history = state.history.slice(-100);
  try {
    localStorage.setItem("kyokuban-history-v1", JSON.stringify(state.history));
  } catch {
    state.storageError = true;
  }
  go("result");
}
function historyPanel(mode) {
  const records = state.history.filter((r) => r.mode === mode);
  const best = records.length ? Math.max(...records.map((r) => r.score)) : 0;
  const fastest = records
    .filter((r) => r.score === best)
    .sort((a, b) => a.duration - b.duration)[0];
  const recent = records.slice(-20);
  return `<div class="stats"><div><small>プレイ回数</small><strong>${records.length}<span>回</span></strong></div><div><small>最高スコア</small><strong>${best}<span>pt</span></strong></div><div><small>最高スコア最速タイム</small><strong>${fastest ? time(fastest.duration) : "—"}</strong></div></div>${
    records.length
      ? `<div class="history-chart"><h3>スコアの推移 <small>直近20回・1,000点満点</small></h3><svg viewBox="0 0 640 170" role="img" aria-label="直近のスコア：${recent.map((r) => r.score).join("、")}"><path d="M35 15V140H620 M35 77H620" stroke="#dce3d9" fill="none"/><text x="0" y="20" font-size="10" fill="#6d786f">1000</text><text x="16" y="142" font-size="10" fill="#6d786f">0</text><polyline points="${recent.map((r, i) => `${45 + (i * 560) / Math.max(1, recent.length - 1)},${140 - r.score * 0.12}`).join(" ")}" fill="none" stroke="#296349" stroke-width="3"/>${recent.map((r, i) => `<circle cx="${45 + (i * 560) / Math.max(1, recent.length - 1)}" cy="${140 - r.score * 0.12}" r="4" fill="#296349"><title>${escapeHtml(new Date(r.date).toLocaleString("ja-JP"))}：${r.score}点</title></circle>`).join("")}<text x="35" y="163" font-size="10" fill="#6d786f">過去</text><text x="595" y="163" font-size="10" fill="#6d786f">最新</text></svg></div><div class="table-wrap"><table><thead><tr><th>プレイ日時</th><th>スコア</th><th>回答時間</th></tr></thead><tbody>${[
          ...records,
        ]
          .reverse()
          .map(
            (r) =>
              `<tr><td>${escapeHtml(new Date(r.date).toLocaleString("ja-JP"))}</td><td>${r.score} pt</td><td>${time(r.duration)}</td></tr>`,
          )
          .join("")}</tbody></table></div>`
      : '<div class="empty">まだ学習記録がありません。</div>'
  }`;
}
function result() {
  if (!state.answers.length) {
    go("history");
    return;
  }
  const r = summarize(state.answers),
    missed = state.answers.filter((a) => !a.correct);
  shell(
    `<section class="result-page"><div class="page-title"><span class="eyebrow">SESSION COMPLETE</span><h1>クイズ結果</h1><p>${modeName(state.mode)}</p></div><div class="result-summary"><div class="grade"><small>今回の評価</small><b>${r.grade}</b></div><div class="score"><strong>${r.score}<span> / 1,000 pt</span></strong><p>正解数 ${r.correct} / ${r.total}問　 ·　 正答率 ${r.rate}%</p></div><div class="result-time"><small>所要時間（回答中の合計）</small><b>${time(r.duration)}</b><small>平均回答時間 ${time(r.average)}</small></div></div><div class="actions"><button class="primary" data-start="${state.mode === "review" ? "ten" : state.mode}">もう一度プレイ →</button>${missed.length ? '<button class="secondary" data-review>間違えた問題を復習</button>' : ""}<a class="secondary" href="#home">モード選択へ</a></div><h2>今回の答え合わせ <span class="muted">${r.total}問</span></h2><div class="review-list">${state.answers.map((a, i) => `<details class="review-row"><summary><span class="${a.correct ? "good" : "bad"}">${a.correct ? "✓" : "×"}</span><span class="muted">${i + 1}.</span><b>${a.code}</b><span>${a.expected}</span><small>${time(a.seconds)}　⌄</small></summary><div><p>あなたの回答：${a.selected}</p><p class="memory-hint">${entries.find((q) => q.code === a.code).hint}</p></div></details>`).join("")}</div><h2>これまでの学習記録 <span class="muted">${modeName(state.mode)}</span></h2>${historyPanel(state.mode)}${storageNotice()}</section>`,
  );
}
function storageNotice() {
  return `<p class="scope-note">${state.storageError ? "記録を端末に保存できませんでした。この画面を閉じると今回の記録が失われる場合があります。" : "学習記録はこのブラウザーに最新100件まで保存します。端末間での同期はありません。"}</p>`;
}
function study() {
  shell(
    `<section class="study-page"><div class="page-title"><span class="eyebrow">YOUR MEMORY NOTE</span><h1>全暗記モード</h1><p>市外局番と都道府県の対応表</p></div>${prefixMap(true)}<div class="study-toolbar"><label class="search"><span>⌕</span><input id="search" type="search" placeholder="市外局番・都道府県を検索" aria-label="市外局番・都道府県を検索" value="${escapeHtml(state.filter)}"/></label><button class="secondary" data-hide-all>すべて隠す</button><button class="secondary" data-show-all>すべて表示</button></div><div class="region-tabs" role="group" aria-label="地域で絞り込み"><button data-region="all" aria-pressed="${state.region === "all"}">全国</button>${regions.map((r, i) => `<button data-region="${i}" aria-pressed="${state.region === String(i)}">${r.name}</button>`).join("")}</div><p class="scope-note">先頭2〜3桁の学習表です。越境する番号は、複数県の対応をまとめて覚えます。「すべて隠す」は番号を残し、県名と覚え方を隠します。</p><div id="study-list"></div><details class="prefecture-table"><summary>都道府県から番号を探す（47都道府県の対応表）</summary><div class="table-wrap"><table><thead><tr><th>都道府県</th><th>先頭2〜3桁</th></tr></thead><tbody>${regions
      .flatMap((r) => r.names.split(" "))
      .map(
        (p) =>
          `<tr><th>${p}</th><td>${entries
            .filter((q) => q.prefectures.includes(p))
            .map((q) => q.code)
            .join(" / ")}</td></tr>`,
      )
      .join("")}</tbody></table></div></details></section>`,
  );
  studyList();
}
function studyList() {
  const filtered = entries.filter(
    (q) =>
      (state.region === "all" ||
        q.prefectures.some((p) => regionOf(p) === Number(state.region))) &&
      `${q.code}${label(q)}${q.hint}`.includes(state.filter.trim()),
  );
  document.querySelector("#study-list").innerHTML =
    `<p class="list-count" role="status">${filtered.length} / ${entries.length}パターン</p><div class="study-grid">${filtered
      .map((q) => {
        const hidden = state.hidden.has(q.code);
        return `<article class="study-card" style="--region:${prefixColor(q.code.slice(0, 2))}"><div class="study-card-top"><b>${q.code}</b><button class="reveal" data-toggle="${q.code}" aria-expanded="${!hidden}" aria-label="${q.code}の答えを${hidden ? "表示" : "隠す"}">${hidden ? "表示する ＋" : "隠す −"}</button></div>${hidden ? '<div class="hidden-answer">どの都道府県？</div>' : `<h3>${label(q)}</h3><p>${q.hint}</p>`}</article>`;
      })
      .join(
        "",
      )}</div>${filtered.length ? "" : '<div class="empty">一致する番号がありません。検索語や地域を変えてみてください。</div>'}`;
}
function historyPage() {
  shell(
    `<section class="result-page"><div class="page-title"><span class="eyebrow">YOUR PROGRESS</span><h1>学習記録</h1></div><div class="region-tabs">${["ten", "all", "review"].map((m) => `<button data-history-mode="${m}" aria-pressed="${state.mode === m}">${modeName(m)}</button>`).join("")}</div>${historyPanel(state.mode)}${storageNotice()}<div class="actions"><button class="primary" data-start="ten">10問に挑戦する →</button></div></section>`,
  );
}
function about() {
  shell(
    `<article class="about narrow"><span class="eyebrow">ABOUT THIS NOTE</span><h1>使い方・出典</h1><h2>数字から場所を覚える</h2><p>GeoGuessrの日本マップで看板などに見える電話番号を手がかりに、都道府県を推測する練習サイトです。公式GeoGuessrとは関係のない個人制作の学習ツールです。</p><h2>遊び方</h2><ol><li>10問モード、全市外局番モード、全暗記モードから選びます。</li><li>4択から回答します。複数県の番号は、正しい県の組み合わせを選びます。キーボードの1〜4でも回答できます。</li><li>覚え方と地図を確認して「次の問題へ」を押します。</li><li>結果画面で間違えた問題を復習できます。暗記ノートでは県名と覚え方を隠して練習できます。</li></ol><h2>スコアと時間</h2><p>スコアは正答数 ÷ 出題数 × 1,000（四捨五入）。各問の制限時間は10秒です。時間切れは不正解になります。評価はS＝満点、A＝900点以上、B＝800点以上、C＝700点以上、D＝600点以上、E＝500点以上、F＝500点未満です。</p><p>所要時間は各問題の表示から回答までの合計です。解説を読む時間は含みません。ページを離れると進行中のクイズは終了し、未完了の記録は保存されません。</p><h2>学習データと出典</h2><p>収録データはプロジェクトの <a href="/JP_AREACODES.md">JP_AREACODES.md</a> にある${entries.length}件の先頭2〜3桁パターンと覚え方です。「全市外局番モード」はこの学習表の全件を指し、国内すべての正式な市外局番を収録したものではありません。単一県の記載も、その県だけで使用されることを保証するものではありません。</p><p>公式参考情報：<a href="https://www.soumu.go.jp/main_sosiki/joho_tsusin/top/tel_number/shigai_list.html" target="_blank" rel="noopener noreferrer">総務省「市外局番の一覧」 ↗</a>。電話の番号区画と都道府県境は一致しないことがあります。実際の利用区域は公式資料でご確認ください。元資料と最新の公式一覧の全件照合は未実施です。</p><h2>制作・ライセンス</h2><p>リポジトリ：<a href="https://github.com/sifue/guess-jp-areacodes">sifue/guess-jp-areacodes</a></p><p>制作者：Soichiro Yoshimura <a href="https://github.com/sifue">@sifue</a></p><p>ソフトウェアと自作の都道府県タイル概略図：MIT License。外部の地図画像やフォントは使用していません。地図は位置関係を学ぶための模式図であり、正確な形状・縮尺・行政境界を示しません。</p><h2>記録について</h2><p>成績はブラウザーのlocalStorageに最新100件保存します。アカウント登録や外部への成績送信はありません。ブラウザーのサイトデータを削除すると記録が消えます。</p></article>`,
  );
}
function render() {
  (
    ({ home, quiz, study, result, history: historyPage, about })[state.page] ||
    home
  )();
}
function go(page) {
  if (page !== "quiz") clearInterval(countdownId);
  if (state.page === "quiz" && page !== "quiz" && page !== "result") {
    state.questions = [];
    state.answers = [];
  }
  state.page = page;
  history.replaceState(null, "", `#${page}`);
  render();
  window.scrollTo(0, 0);
  document.querySelector("#main")?.focus({ preventScroll: true });
}
window.addEventListener("hashchange", () => {
  if (location.hash === "#main") {
    document.querySelector("#main")?.focus();
    history.replaceState(null, "", `#${state.page}`);
    return;
  }
  go(location.hash.slice(1) || "home");
});
app.addEventListener("input", (event) => {
  if (event.target.id === "search") {
    state.filter = event.target.value;
    studyList();
  }
});
app.addEventListener("click", (event) => {
  const el = event.target.closest("button");
  if (!el) return;
  if (el.hasAttribute("data-prefix")) {
    const panel = el.closest(".prefix-map");
    panel.outerHTML = prefixMap(
      panel.dataset.detailed === "true",
      el.dataset.prefix,
    );
    document
      .querySelector(`[data-prefix="${el.dataset.prefix}"]`)
      ?.focus({ preventScroll: true });
  }
  if (el.hasAttribute("data-start")) start(el.dataset.start);
  if (el.hasAttribute("data-answer")) answer(Number(el.dataset.answer));
  if (el.hasAttribute("data-next")) {
    if (state.selection === null) return;
    if (state.index + 1 === state.questions.length) finish();
    else {
      state.index++;
      prepare();
      render();
      window.scrollTo(0, 0);
      document.querySelector(".choice")?.focus({ preventScroll: true });
    }
  }
  if (el.hasAttribute("data-review"))
    start(
      "review",
      entries.filter((q) =>
        state.answers.some((a) => a.code === q.code && !a.correct),
      ),
    );
  if (el.hasAttribute("data-toggle")) {
    const code = el.dataset.toggle;
    state.hidden.has(code) ? state.hidden.delete(code) : state.hidden.add(code);
    studyList();
    document
      .querySelector(`[data-toggle="${code}"]`)
      ?.focus({ preventScroll: true });
  }
  if (el.hasAttribute("data-hide-all")) {
    state.hidden = new Set(entries.map((q) => q.code));
    studyList();
  }
  if (el.hasAttribute("data-show-all")) {
    state.hidden.clear();
    studyList();
  }
  if (el.hasAttribute("data-region")) {
    state.region = el.dataset.region;
    study();
    document
      .querySelector(`[data-region="${state.region}"]`)
      ?.focus({ preventScroll: true });
  }
  if (el.hasAttribute("data-history-mode")) {
    state.mode = el.dataset.historyMode;
    render();
  }
});
window.addEventListener("keydown", (event) => {
  if (
    state.page === "quiz" &&
    !event.repeat &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.altKey &&
    /^[1-4]$/.test(event.key) &&
    !["INPUT", "TEXTAREA"].includes(event.target.tagName)
  ) {
    event.preventDefault();
    answer(Number(event.key) - 1);
  }
});
state.page = ["study", "history", "about"].includes(location.hash.slice(1))
  ? location.hash.slice(1)
  : "home";
render();
