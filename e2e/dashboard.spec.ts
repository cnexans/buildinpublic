import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
  test("loads without errors and displays key elements", async ({ page }) => {
    await page.goto("/");

    // Verify no Next.js error overlay
    await expect(page.getByText("Unhandled Runtime Error")).not.toBeVisible();

    // Header logo "CN." is visible
    await expect(page.getByRole("link", { name: "CN." })).toBeVisible();

    // "Mis proyectos" heading is visible
    await expect(
      page.getByRole("heading", { name: "Mis proyectos" })
    ).toBeVisible();

    // 3 KPI cards are present
    await expect(page.getByText("Pageviews")).toBeVisible();
    await expect(page.getByText("Visitantes Únicos")).toBeVisible();
    await expect(page.getByText("Sesiones")).toBeVisible();

    // Project filter is present
    await expect(page.getByText(/proyecto/i)).toBeVisible();

    // "Top Proyectos" section is present
    await expect(page.getByText("Top Proyectos")).toBeVisible();
  });
});
