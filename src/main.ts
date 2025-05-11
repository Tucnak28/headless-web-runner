// src/main.ts
import express, { Request, Response } from 'express';
import puppeteer, { LaunchOptions } from 'puppeteer';
import type { CDPSession } from 'puppeteer';

let fakeMaximize = true;

const app = express();
app.use(express.static('public'));

let session: CDPSession;
let windowId: number;

const updateWindowState = async () => {
  if (!session || !windowId) return;
  const state = fakeMaximize ? 'normal' : 'minimized';
  await session.send('Browser.setWindowBounds', {
    windowId,
    bounds: {
      windowState: state
    }
  });
  console.log(`Window set to: ${state}`);
};

app.post('/toggle', async (req: Request, res: Response) => {
  fakeMaximize = !fakeMaximize;
  console.log('Fake maximize toggled to:', fakeMaximize);
  await updateWindowState();
  res.sendStatus(200);
});

const server = app.listen(3000, () => {
  console.log('Web UI at http://localhost:3000/control.html');
});

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: []
  } as unknown as LaunchOptions);

  const page = await browser.newPage();

  // Viewport trick
  await page.setViewport({ width: 1920, height: 1080 });

  // Fake visibility and screen state
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(document, 'hidden', { get: () => false });
    Object.defineProperty(document, 'visibilityState', { get: () => 'visible' });
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
  });

  await page.goto('https://google.com');

  session = await page.createCDPSession();
  const info = await session.send('Browser.getWindowForTarget');
  windowId = info.windowId;

  // Apply initial window state
  await updateWindowState();
})();