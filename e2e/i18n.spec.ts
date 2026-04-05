import { expect, test } from "@playwright/test";

import { waitForHydration } from "./helpers";

test.describe("Internationalization", () => {
  test("uses English copy on mirrored routes and locale toggle rewrites the URL", async ({
    page,
  }) => {
    await page.goto("/en/");
    await waitForHydration(page);

    await expect(page.getByRole("button", { name: "Check" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Map/i })).toBeVisible();
    await expect(page).toHaveURL(/\/en\/?$/);

    await page.getByRole("button", { name: "Български" }).click();
    await expect(page).toHaveURL("http://localhost:3000/");
    await waitForHydration(page);
    await expect(page.getByRole("button", { name: "Провери" })).toBeVisible();

    await page.goto("/en/compare");
    await waitForHydration(page);
    await expect(
      page.getByRole("heading", { level: 1, name: "Compare two addresses" })
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Compare" })).toBeVisible();
  });
});
