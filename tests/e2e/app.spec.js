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
  await page.getByRole("button", { name: "まずは10問、挑戦する" }).click();
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
