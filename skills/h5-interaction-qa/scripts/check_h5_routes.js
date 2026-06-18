#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");

let chromium;
try {
  ({ chromium } = require("playwright"));
} catch (error) {
  console.error("Playwright is not available. Run with the Codex bundled NODE_PATH.");
  console.error(error.message);
  process.exit(2);
}

const input = process.argv[2];
if (!input) {
  console.error("Usage: check_h5_routes.js /absolute/path/to/index.html");
  process.exit(2);
}

const htmlPath = path.resolve(input);
if (!fs.existsSync(htmlPath)) {
  console.error(`File not found: ${htmlPath}`);
  process.exit(2);
}

const baseUrl = pathToFileURL(htmlPath).href;
const failures = [];
const consoleErrors = [];
const viewports = [
  { name: "mobile", width: 390, height: 844 },
  { name: "short-mobile", width: 390, height: 720 },
  { name: "large-mobile", width: 430, height: 932 },
  { name: "desktop-phone-preview", width: 760, height: 980, isMobile: false },
];
const visualBlockSelectors = [
  ".home-title",
  ".event-status",
  ".entry-grid",
  ".game-logo",
  ".event-panel",
  ".reward-preview",
  ".play-loop",
  ".start-btn",
  ".board-title",
  ".board-cell",
  ".card-reveal",
  ".screen-head",
  ".role-summary",
  ".next-btn",
  ".map-cards",
  ".map-title",
  ".map-progress",
  ".punish-card",
  ".dice-btn",
  ".mini-game-list",
  ".feed-head",
  ".bottom-nav",
  ".shop-head",
  ".shop-hero",
  ".shop-tabs",
];

function fail(message) {
  failures.push(message);
}

function overlapArea(a, b) {
  const x = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
  const y = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
  return { area: x * y, x, y };
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  let checkedRoutes = 0;

  for (const viewport of viewports) {
    const page = await browser.newPage({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: 2,
      isMobile: viewport.isMobile !== false,
    });

    page.setDefaultTimeout(4000);
    page.on("pageerror", (error) => consoleErrors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });

    await page.goto(baseUrl, { waitUntil: "load" });
    await page.waitForTimeout(250);

    const screens = await page.evaluate(() =>
      Array.from(document.querySelectorAll("[data-screen]"))
        .map((screen) => screen.dataset.screen)
        .filter(Boolean)
    );

    if (!screens.length) fail(`[${viewport.name}] No [data-screen] routes found.`);

    for (const screen of screens) {
      checkedRoutes += 1;
      await page.goto(`${baseUrl}#${screen}`, { waitUntil: "load" });
      await page.waitForTimeout(250);

      const routeState = await page.evaluate((expected) => {
        const active = document.querySelector(".screen.is-active")?.dataset.screen || "";
        const viewportImages = Array.from(document.querySelectorAll(".screen.is-active img"))
          .filter((img) => {
            const rect = img.getBoundingClientRect();
            const style = getComputedStyle(img);
            return (
              style.display !== "none" &&
              style.visibility !== "hidden" &&
              rect.width > 1 &&
              rect.height > 1 &&
              rect.bottom > 0 &&
              rect.right > 0 &&
              rect.top < window.innerHeight &&
              rect.left < window.innerWidth
            );
          });
        const failedImages = viewportImages
          .filter((img) => !img.complete || img.naturalWidth === 0)
          .map((img) => img.getAttribute("src"));
        const overflowX = document.documentElement.scrollWidth > window.innerWidth;
        return { expected, active, failedImages, overflowX };
      }, screen);

      if (routeState.active !== screen) {
        fail(`[${viewport.name}] Route #${screen} activated ${routeState.active || "(none)"}.`);
      }
      if (routeState.failedImages.length) {
        fail(`[${viewport.name}] Route #${screen} has broken images: ${routeState.failedImages.join(", ")}`);
      }
      if (routeState.overflowX) {
        fail(`[${viewport.name}] Route #${screen} has horizontal overflow.`);
      }

      const visualOverlaps = await page.evaluate((selectors) => {
        const blocks = selectors.flatMap((selector) =>
          Array.from(document.querySelectorAll(`.screen.is-active ${selector}`)).map((el) => {
            const rect = el.getBoundingClientRect();
            const style = getComputedStyle(el);
            return {
              selector,
              label: (el.getAttribute("aria-label") || el.textContent || selector).trim().replace(/\s+/g, " ").slice(0, 40),
              rect: {
                left: rect.left,
                right: rect.right,
                top: rect.top,
                bottom: rect.bottom,
                width: rect.width,
                height: rect.height,
              },
              visible: style.display !== "none" && style.visibility !== "hidden" && rect.width > 1 && rect.height > 1,
            };
          })
        ).filter((block) => block.visible);

        const overlaps = [];
        for (let i = 0; i < blocks.length; i += 1) {
          for (let j = i + 1; j < blocks.length; j += 1) {
            const a = blocks[i];
            const b = blocks[j];
            const x = Math.max(0, Math.min(a.rect.right, b.rect.right) - Math.max(a.rect.left, b.rect.left));
            const y = Math.max(0, Math.min(a.rect.bottom, b.rect.bottom) - Math.max(a.rect.top, b.rect.top));
            const area = x * y;
            const minArea = Math.min(a.rect.width * a.rect.height, b.rect.width * b.rect.height);
            const ratio = minArea ? area / minArea : 0;

            if (area > 180 && ratio > 0.025) {
              overlaps.push({
                a: a.selector,
                b: b.selector,
                area: Math.round(area),
                ratio: Number(ratio.toFixed(3)),
                verticalOverlap: Math.round(y),
              });
            }
          }
        }
        return overlaps;
      }, visualBlockSelectors);

      for (const item of visualOverlaps) {
        fail(`[${viewport.name}] Route #${screen} has visual overlap: ${item.a} with ${item.b}, area=${item.area}, ratio=${item.ratio}, vertical=${item.verticalOverlap}px.`);
      }

      const boardControlIssues = await page.evaluate(() => {
        const activeScreen = document.querySelector(".screen.is-active");
        if (!activeScreen?.classList.contains("board-screen")) return [];

        const issues = [];
        const rectOf = (el) => {
          const rect = el.getBoundingClientRect();
          return {
            left: rect.left,
            right: rect.right,
            top: rect.top,
            bottom: rect.bottom,
            width: rect.width,
            height: rect.height,
          };
        };
        const intersects = (a, b, pad = 0) =>
          Math.min(a.right, b.right) - Math.max(a.left, b.left) > pad &&
          Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > pad;

        const panel = activeScreen.querySelector(".board-map-panel");
        const panelRect = panel ? rectOf(panel) : null;
        const dice = activeScreen.querySelector(".dice-btn");
        const diceRect = dice ? rectOf(dice) : null;

        activeScreen.querySelectorAll(".board-card-token").forEach((card, index) => {
          const rect = rectOf(card);
          if (rect.width > 110 || rect.height > 150) {
            issues.push(`board card ${index + 1} is oversized (${Math.round(rect.width)}x${Math.round(rect.height)})`);
          }
          if (panelRect && rect.bottom > panelRect.top + 2) {
            issues.push(`board card ${index + 1} overlaps the map panel`);
          }
          if (diceRect && intersects(rect, diceRect, 2)) {
            issues.push(`board card ${index + 1} overlaps the dice control`);
          }
        });

        return issues;
      });

      for (const issue of boardControlIssues) {
        fail(`[${viewport.name}] Route #${screen} board control issue: ${issue}.`);
      }

      const controls = await page.evaluate(() =>
        Array.from(document.querySelectorAll(".screen.is-active [data-goto]")).map((el, index) => ({
          index,
          target: el.dataset.goto,
          label: (el.getAttribute("aria-label") || el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 60),
        }))
      );

      for (let i = 0; i < controls.length; i += 1) {
        const control = controls[i];
        await page.goto(`${baseUrl}#${screen}`, { waitUntil: "load" });
        await page.waitForTimeout(150);

        try {
          await page.locator(".screen.is-active [data-goto]").nth(control.index).click();
          await page.waitForTimeout(180);
        } catch (error) {
          fail(`[${viewport.name}] #${screen} control "${control.label || control.index}" to #${control.target} is not clickable: ${error.message.split("\n")[0]}`);
          continue;
        }

        const afterClick = await page.evaluate(() => ({
          hash: location.hash.replace("#", ""),
          active: document.querySelector(".screen.is-active")?.dataset.screen || "",
        }));

        if (afterClick.active !== control.target || afterClick.hash !== control.target) {
          fail(`[${viewport.name}] #${screen} control "${control.label || control.index}" expected #${control.target}, got active=${afterClick.active}, hash=${afterClick.hash}.`);
        }
      }
    }

    await page.close();
  }

  await browser.close();

  if (consoleErrors.length) {
    for (const error of consoleErrors) fail(`Console/page error: ${error}`);
  }

  if (failures.length) {
    console.error(`H5 interaction QA failed (${failures.length}):`);
    failures.forEach((message) => console.error(`- ${message}`));
    process.exit(1);
  }

  console.log(`H5 interaction QA passed: ${checkedRoutes} route-viewport checks.`);
})();
