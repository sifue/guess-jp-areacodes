# 局番ノート

数字から、日本を思い出す。GeoGuessrの日本マップ向けに、市外局番の先頭2〜3桁と都道府県の対応を学ぶ静的Webサイトです。制作者：**Soichiro Yoshimura @sifue**。バージョン：**1.0.0**。

## 起動

Node.js 22.12以上（開発確認：24.16）を使用します。

```bash
npm ci
npm run dev
```

表示されたURL（通常 http://localhost:5173 ）を開きます。同じネットワークのスマホからは開発PCのIPアドレスと同じポートでアクセスできます。

## 遊び方

- **市外局番10問モード**：ランダムな10パターンを4択で回答します。
- **全市外局番モード**：元資料の59パターンを重複なしで出題します。
- **全暗記モード**：番号・都道府県・覚え方を検索、地域別に絞り込みできます。答えと覚え方の一括／個別表示切り替えと、47都道府県から引く対応表があります。

回答後に覚え方を読み、必要なら地図を開いてから「次の問題へ」を押します。回答はキーボードの1〜4にも対応。結果では全問の正誤、選んだ答え、正解、時間を確認でき、誤答だけ再挑戦できます。

スコアは正解数÷問題数×1,000（四捨五入）。評価はS＝1,000、A＝900以上、B＝800以上、C＝700以上、D＝600以上、E＝500以上、F＝500未満です。所要時間は回答中の合計で、解説の閲覧時間は除外します。速度による減点はありません。

成績はモード別の一覧・グラフ・統計で確認できます。ブラウザーのlocalStorageに全モード合計で最新100件まで保存します。端末間の同期はありません。クイズ途中の画面移動や再読み込みはクイズ終了扱いとなり、途中経過は保存しません。

## 収録データの範囲

[JP_AREACODES.md](JP_AREACODES.md)の59件が対象です。「012」「042」などは先頭桁のグループであり、完全な市外局番とは限りません。**全国すべての正式な市外局番を網羅するサイトではありません。** 複数県の行は県の組み合わせを答える問題にして、元資料の越境情報を保持します。単一県の行も、他県での使用がないことを保証しません。

公式参考情報は[総務省「市外局番の一覧」](https://www.soumu.go.jp/main_sosiki/joho_tsusin/top/tel_number/shigai_list.html)です。元資料と最新公式一覧の全件照合は未実施です。確認状況と更新手順は[データ仕様](docs/data.md)を参照してください。

## Cloudflare Pagesへの公開

サーバー処理、データベース、環境変数は不要です。Viteで生成した `dist/` を公開します。

### Git連携

1. リポジトリをGitHubまたはGitLabに配置します。
2. Cloudflareダッシュボードの Workers & Pages から **Pages** を選び、Gitリポジトリを接続します。
3. ビルドコマンドを `npm run build`、出力ディレクトリを `dist`、ルートディレクトリをリポジトリ直下に設定します。
4. Node.js 22.12以上を使用し、デプロイします。

参照：[CloudflareのVite向け公式手順](https://developers.cloudflare.com/pages/framework-guides/deploy-a-vite3-project/)。

### Wranglerによる手動公開

```bash
npm run build
npx wrangler login
npx wrangler pages project create guess-jp-areacodes --production-branch main
npx wrangler pages deploy dist --project-name guess-jp-areacodes --branch main
```

初回だけログイン・プロジェクト作成が必要です。プロジェクト名を変更する場合は `wrangler.jsonc` と上記コマンドを合わせて変更してください。Direct Uploadで作ったプロジェクトは後からGit連携に切り替えられないため、自動公開が必要なら最初からGit連携を選びます。参照：[Cloudflare Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/)。本リポジトリの実装作業では本番公開は行っていません。

公開前のローカル確認：

```bash
npm run build
npm run preview
```

## テスト・開発

```bash
npm test
npx playwright install chromium
npm run test:e2e
npm run build
npm run format:check
```

Linuxでブラウザー実行用の共有ライブラリが不足する場合は `npx playwright install --with-deps chromium` を使います。E2EはPCと縦向きスマホの2種類で、10問・59問の完走、復習、保存、表示切り替えを検証します。スクリーンショットは `test-results/` に出力します。

構成・採点・設計判断は[設計書](docs/design.md)、検証状況は[開発記録](docs/progress.md)を参照してください。更新ごとに `package.json` とロックファイルのバージョンをセマンティックバージョニングに沿って更新し、変更履歴も更新します。

## クレジット

- 制作：Soichiro Yoshimura [@sifue](https://github.com/sifue)
- 覚え方・学習表：プロジェクト提供資料 `JP_AREACODES.md`
- 公式参考情報：総務省「市外局番の一覧」
- 地図：本プロジェクトで自作したSVGタイル概略図。正確な形状・縮尺・行政境界を示しません。
- ソフトウェア・自作図版：[MIT License](LICENSE)

外部の地図画像・Webフォントは使っていません。GeoGuessrの公式・提携サービスではありません。
