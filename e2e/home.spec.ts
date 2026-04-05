import { expect, test } from "@playwright/test";

import { waitForHydration } from "./helpers";

test.describe("Home Page", () => {
  test("shows hero, quick links, and header navigation", async ({ page }) => {
    await page.goto("/");
    await waitForHydration(page);

    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Walk Score"
    );
    await expect(page.getByTestId("search-input")).toBeVisible();
    await expect(page.getByRole("button", { name: "Провери" })).toBeVisible();
    await expect(page.getByText("ул. Граф Игнатиев")).toBeVisible();

    await page.getByRole("link", { name: /Карта/i }).click();
    await expect(page).toHaveURL(/\/map$/);
  });

  test("quick links navigate to score pages", async ({ page }) => {
    await page.goto("/");
    await waitForHydration(page);

    await page.getByRole("link", { name: "ул. Граф Игнатиев" }).click();
    await expect(page).toHaveURL(/\/score\?address=/);
    await waitForHydration(page);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "ul. Graf Ignatiev 24, Sofia"
    );
  });

  test("search submit navigates to a score page", async ({ page }) => {
    await page.goto("/");
    await waitForHydration(page);
    await page.getByTestId("search-input").fill("кв. Лозенец");
    await page.getByTestId("search-submit").click();

    await expect(page).toHaveURL(/\/score\?address=/);
    await waitForHydration(page);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Lozenets, Sofia"
    );
  });
});
