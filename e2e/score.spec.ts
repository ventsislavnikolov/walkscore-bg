import { expect, test } from "@playwright/test";

import { waitForHydration } from "./helpers";

test.describe("Score Page", () => {
  test("renders score cards, category breakdown, nearby amenities, and share controls", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForHydration(page);
    await page.getByRole("link", { name: "ул. Граф Игнатиев" }).click();
    await waitForHydration(page);

    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "ul. Graf Ignatiev 24, Sofia"
    );
    await expect(page.getByText("Walk Score").first()).toBeVisible();
    await expect(page.getByText("Transit Score").first()).toBeVisible();
    await expect(page.getByText("Bike Score").first()).toBeVisible();
    await expect(page.getByText("Разбивка по категории")).toBeVisible();
    await expect(page.getByText("Наблизо")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Копирай линк" })
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Embed код" })).toBeVisible();
  });
});
