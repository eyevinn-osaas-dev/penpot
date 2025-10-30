import { test, expect } from "@playwright/test";
import { WorkspacePage } from "../pages/WorkspacePage";

test.beforeEach(async ({ page }) => {
  await WorkspacePage.init(page);
  await WorkspacePage.mockConfigFlags(page, ["enable-feature-text-editor-v2"]);
});

test.only("Create a new text shape", async ({ page }) => {
  const workspace = new WorkspacePage(page);
  await workspace.setupEmptyFile();
  await workspace.mockGetFile("workspace/get-file-blank.json");
  await workspace.goToWorkspace({
    fileId: "c7ce0794-0992-8105-8004-38f280443849",
    pageId: "66697432-c33d-8055-8006-2c62cc084cad",
  });
  await page.waitForTimeout(500);
  await workspace.page.keyboard.press("T");
  await page.waitForTimeout(100);
  await workspace.clickAndMove(190, 150, 300, 200);
  await page.waitForTimeout(100);
  await workspace.page.keyboard.type("Lorem ipsum");
  await page.waitForTimeout(100);

  const firstInline = await page.$('[data-itype="inline"]');
  console.log(firstInline);

  await workspace.page.keyboard.press("Escape");
});

test("Create a new text shape from pasting text", async ({ page }) => {
  const workspace = new WorkspacePage(page);
  await workspace.setupEmptyFile();
  await workspace.mockGetFile("text-editor/get-file-blank.json");
  await workspace.goToWorkspace({
    fileId: "c7ce0794-0992-8105-8004-38f280443849",
    pageId: "66697432-c33d-8055-8006-2c62cc084cad",
  });
  await page.waitForTimeout(500);
  await page.evaluate(() => navigator.clipboard.writeText("Lorem ipsum"));
  await page.waitForTimeout(100);
  await workspace.page.keyboard.press("Control+V");
  await page.waitForTimeout(100);
  await workspace.clickLeafLayer("Lorem ipsum");

  const firstInline = await page.waitForSelector('[data-itype="inline"]');
  console.log(firstInline);
});

test("Update an already created text shape", async ({ page }) => {
  const workspace = new WorkspacePage(page);
  await workspace.setupEmptyFile();
  await workspace.mockGetFile("text-editor/get-file-lorem-ipsum.json");
  await workspace.goToWorkspace({
    fileId: "c7ce0794-0992-8105-8004-38f280443849",
    pageId: "66697432-c33d-8055-8006-2c62cc084cad",
  });
  await page.waitForTimeout(500);
  await workspace.clickLeafLayer("Lorem ipsum");
  await workspace.clickLeafLayer("Lorem ipsum");
  await page.waitForTimeout(100);

  await workspace.page.keyboard.press("ArrowRight");
  await workspace.page.keyboard.type(" dolor sit amet")
  await workspace.page.keyboard.press("Escape");


});

test("Update a new text shape from pasting text", async ({ page }) => {
  const workspace = new WorkspacePage(page);
  await workspace.setupEmptyFile();
  await workspace.mockGetFile("text-editor/get-file-lorem-ipsum.json");
  await workspace.goToWorkspace({
    fileId: "c7ce0794-0992-8105-8004-38f280443849",
    pageId: "66697432-c33d-8055-8006-2c62cc084cad",
  });
  await workspace.clickLeafLayer("Lorem ipsum");
});

test.skip("BUG 11552 - Apply styles to the current caret", async ({ page }) => {
  const workspace = new WorkspacePage(page);
  await workspace.setupEmptyFile();
  await workspace.mockGetFile("text-editor/get-file-11552.json");
  await workspace.mockRPC(
    "update-file?id=*",
    "text-editor/update-file-11552.json",
  );

  await workspace.goToWorkspace({
    fileId: "238a17e0-75ff-8075-8006-934586ea2230",
    pageId: "238a17e0-75ff-8075-8006-934586ea2231",
  });
  await workspace.clickLeafLayer("Lorem ipsum");
  await workspace.clickLeafLayer("Lorem ipsum");

  const fontSizeInput = workspace.rightSidebar.getByRole("textbox", {
    name: "Font Size",
  });
  await expect(fontSizeInput).toBeVisible();

  await workspace.page.keyboard.press("Enter");
  await workspace.page.keyboard.press("ArrowRight");

  await fontSizeInput.fill("36");

  await workspace.clickLeafLayer("Lorem ipsum");

  // display Mixed placeholder
  await expect(fontSizeInput).toHaveValue("");
  await expect(fontSizeInput).toHaveAttribute("placeholder", "Mixed");
});
