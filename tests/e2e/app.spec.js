import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
const data = JSON.parse(
  readFileSync(new URL("../../src/data.json", import.meta.url)),
);
test("ホームと暗記ノートの検索・地域・隠す操作", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /数字から、\s*日本を思い出す。/ }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: `test-results/home-${test.info().project.name}.png`,
    fullPage: true,
  });
  await page.getByRole("link", { name: "暗記ノート", exact: true }).click();
  await expect(page.locator(".study-card")).toHaveCount(59);
  await page.getByRole("button", { name: "すべて隠す", exact: true }).click();
  await expect(page.locator(".hidden-answer")).toHaveCount(59);
  await page
    .getByRole("button", { name: "011の答えを表示", exact: true })
    .click();
  await expect(page.locator(".hidden-answer")).toHaveCount(58);
  await page.getByRole("button", { name: "すべて表示", exact: true }).click();
  await expect(page.locator(".hidden-answer")).toHaveCount(0);
  await page.getByRole("searchbox").fill("042");
  await expect(page.locator(".study-card")).toHaveCount(1);
  await expect(page.locator(".study-card")).toContainText(
    "東京都・神奈川県・埼玉県・山梨県",
  );
  await page.getByRole("searchbox").fill("見つからない");
  await expect(
    page.getByText("一致する番号がありません。", { exact: false }),
  ).toBeVisible();
  await page.getByRole("searchbox").fill("");
  await page.getByRole("button", { name: "関東", exact: true }).click();
  expect(await page.locator(".study-card").count()).toBeLessThan(59);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});
async function play(page, total, missFirst = false) {
  for (let i = 0; i < total; i++) {
    const code = await page.locator(".question-number").innerText();
    const answer = data.find((q) => q.code === code).prefectures.join("・");
    const choices = page.locator(".choice");
    let target = choices.filter({ hasText: answer });
    if (missFirst && i === 0)
      target = choices.filter({ hasNotText: answer }).first();
    await target.click();
    await expect(page.locator(".feedback")).toBeVisible();
    await expect(choices.first()).toBeDisabled();
    if (i === 0) {
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({
        path: `test-results/quiz-${test.info().project.name}.png`,
        fullPage: true,
      });
    }
    await page
      .getByRole("button", {
        name: i === total - 1 ? "結果を見る →" : "次の問題へ →",
        exact: true,
      })
      .click();
  }
}
test("10問完走・誤答復習・履歴の永続化とモード分離", async ({ page }) => {
  await page.goto("/");
  await page.locator('[data-start="ten"]').first().click();
  await play(page, 10, true);
  await expect(page.locator(".grade b")).toHaveText("A");
  await expect(page.locator(".review-row")).toHaveCount(10);
  await page.getByRole("button", { name: "間違えた問題を復習" }).click();
  await play(page, 1);
  await expect(page.locator(".grade b")).toHaveText("S");
  await page.reload();
  await page.getByRole("link", { name: "学習記録", exact: true }).click();
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await expect(page.locator("tbody")).toContainText("900");
  await page.getByRole("button", { name: "復習モード", exact: true }).click();
  await expect(page.locator("tbody")).toContainText("1000");
});
test("全59問を重複なく完走する", async ({ page }) => {
  await page.goto("/");
  await page.locator('[data-start="all"]').click();
  await play(page, 59);
  await expect(page.locator(".grade b")).toHaveText("S");
  await expect(page.locator(".review-row")).toHaveCount(59);
  const codes = await page.locator(".review-row summary>b").allTextContents();
  expect(new Set(codes).size).toBe(59);
  await page.screenshot({
    path: `test-results/result-${test.info().project.name}.png`,
    fullPage: true,
  });
});
test("ストレージ保存失敗でも結果を表示する", async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new Error("保存不可");
    };
  });
  await page.goto("/");
  await page.locator('[data-start="ten"]').first().click();
  await play(page, 10);
  await expect(
    page.getByText("記録を端末に保存できませんでした。", { exact: false }),
  ).toBeVisible();
});

test("10秒のカウントダウン・時間切れ・次問へのリセット", async ({ page }) => {
  await page.clock.install();
  await page.goto("/");
  await page.locator('[data-start="ten"]').first().click();
  await expect(page.locator("[data-countdown]")).toHaveText("10.0");
  await page.clock.runFor(7100);
  await expect(page.locator(".countdown")).toHaveClass(/urgent/);
  await page.clock.runFor(3000);
  await expect(page.locator(".feedback")).toContainText("時間切れ");
  await expect(page.locator("[data-countdown]")).toHaveText("0.0");
  await expect(page.locator(".choice").first()).toBeDisabled();
  await page.clock.runFor(20000);
  await expect(page.locator(".quiz-progress")).toContainText("問題 1");
  await page.locator("[data-next]").click();
  await expect(page.locator("[data-countdown]")).toHaveText("10.0");
  await page.locator(".choice").first().click();
  const stopped = await page.locator("[data-countdown]").innerText();
  await page.clock.runFor(20000);
  await expect(page.locator("[data-countdown]")).toHaveText(stopped);
  await page.getByRole("link", { name: "← モード選択へ", exact: true }).click();
  await page.clock.runFor(20000);
  await expect(page.locator(".feedback")).toHaveCount(0);
});

test("先頭2桁マップの凡例・複数所属・全暗記詳細図・名称", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/市外局番ノート/);
  await expect(
    page.getByRole("link", { name: "GitHub", exact: true }),
  ).toHaveAttribute("href", "https://github.com/sifue/guess-jp-areacodes");
  await expect(page.locator(".learning-strip")).toHaveCount(0);
  await expect(page.locator('[data-prefecture="東京都"]')).toContainText("03");
  await expect(page.locator('[data-prefecture="東京都"]')).toContainText("04");
  await page.locator('[data-prefix="02"]').click();
  await expect(page.locator('[data-prefecture="宮城県"]')).toHaveAttribute(
    "opacity",
    "1",
  );
  await expect(page.locator('[data-prefecture="青森県"]')).toHaveAttribute(
    "opacity",
    "0.12",
  );
  await page.getByRole("link", { name: "暗記ノート", exact: true }).click();
  await expect(page.locator(".detailed-map")).toBeVisible();
  await expect(page.locator(".prefix-correspondence>div")).toHaveCount(9);
  await page.screenshot({
    path: `test-results/study-map-${test.info().project.name}.png`,
    fullPage: false,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("04系・07系の補足図の全パターン・重なり・対応県表", async ({ page }) => {
  await page.goto("/");
  for (const prefix of ["04", "07"]) {
    await page.locator(`[data-home-map="${prefix}"]`).click();
    const panel = page.locator(`[data-regional-map="${prefix}"]`);
    await expect(panel).toBeVisible();
    for (const entry of data.filter((entry) => entry.code.startsWith(prefix))) {
      await expect(
        panel.locator(`[data-region-code="${entry.code}"]`).first(),
      ).toBeVisible();
    }
    const overlaps = await panel
      .locator("[data-region-code]")
      .evaluateAll((nodes) => {
        const boxes = nodes.map((node) => node.querySelector("rect").getBBox());
        return boxes.some((box, i) =>
          boxes
            .slice(i + 1)
            .some(
              (other) =>
                box.x < other.x + other.width &&
                box.x + box.width > other.x &&
                box.y < other.y + other.height &&
                box.y + box.height > other.y,
            ),
        );
      });
    expect(overlaps).toBe(false);
    await panel
      .getByText("番号ごとの対応都道府県を表示", { exact: true })
      .click();
    await expect(panel.locator("tbody tr")).toHaveCount(8);
    await panel.screenshot({
      path: `test-results/regional-${prefix}-${test.info().project.name}.png`,
    });
  }
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("モード選択が地図より上にあり、地域図は1枚ずつ切り替わる", async ({
  page,
}) => {
  await page.goto("/");
  const modes = await page.locator(".mode-section").boundingBox();
  const maps = await page.locator(".home-maps").boundingBox();
  expect(modes.y + modes.height).toBeLessThan(maps.y);
  expect(modes.y).toBeLessThan(350);
  await expect(page.locator(".home-map-content:visible")).toHaveCount(1);
  await expect(page.locator("#home-map-national")).toBeVisible();
  await page.locator('[data-home-map="hokkaido"]').click();
  await expect(page.locator(".hokkaido-svg")).toBeVisible();
  await expect(page.locator("#home-map-national")).toBeHidden();
  for (const map of ["04", "07", "national"]) {
    await page.locator(`[data-home-map="${map}"]`).click();
    await expect(page.locator(".home-map-content:visible")).toHaveCount(1);
    await expect(page.locator(`[data-home-map="${map}"]`)).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  }
  await page.locator('[data-prefix="04"]').click();
  await expect(page.locator("#home-map-national")).toBeVisible();
  await page.locator('[data-home-map="07"]').click();
  await expect(page.locator("#home-map-07")).toBeVisible();
  await page.locator(".home-maps").screenshot({
    path: `test-results/map-switcher-${test.info().project.name}.png`,
  });
});
