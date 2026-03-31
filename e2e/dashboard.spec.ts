import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
  test("loads without errors and displays key elements", async ({ page }) => {
    await page.goto("/");

    // Verify no Next.js error overlay with error text is shown
    await expect(page.getByText("Unhandled Runtime Error")).not.toBeVisible();

    // Header "mymetrics" is visible
    await expect(page.getByText("mymetrics")).toBeVisible();

    // "Open metrics" heading is visible
    await expect(
      page.getByRole("heading", { name: "Open metrics" })
    ).toBeVisible();

    // 3 KPI cards are present
    await expect(page.getByText("Total Pageviews")).toBeVisible();
    await expect(page.getByText("Visitantes Únicos", { exact: true })).toBeVisible();
    await expect(page.getByText("Total Sesiones")).toBeVisible();

    // Domain filter button is present
    await expect(
      page.getByRole("button", { name: /dominio/i })
    ).toBeVisible();

    // "Top Dominios" section is present
    await expect(page.getByText("Top Dominios")).toBeVisible();
  });
});
