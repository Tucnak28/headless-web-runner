// src/main.ts
import express, { Request, Response } from 'express';
import puppeteer, { LaunchOptions } from 'puppeteer';
import type { CDPSession, Page, Frame } from 'puppeteer';
import { waitForGameFrame, clickBetMinus, clickSpin } from './synot';


const app = express();
app.use(express.static('public'));
app.use(express.json());

let session: CDPSession;
let page: Page;
let windowId: number;
let fakeMaximize = true;


export async function performGameActions(page: Page) {
    // 1. Get the game iframe
    const frame = await waitForGameFrame(page);
  
    // 2. Click Bet Minus 10 times
    await clickBetMinus(frame, 10);
  
    // 3. Click Spin button
    await clickSpin(frame);
  
    console.log('✅ Game actions completed inside iframe.');
}
  
  

const updateWindowState = async () => {
  if (!session || !windowId) return;
  const state = fakeMaximize ? 'normal' : 'minimized';
  await session.send('Browser.setWindowBounds', {
    windowId,
    bounds: { windowState: state }
  });
  console.log(`Window set to: ${state}`);
};

app.post('/toggle_Maximize', async (req: Request, res: Response) => {
  fakeMaximize = !fakeMaximize;
  console.log('Fake maximize toggled to:', fakeMaximize);
  await updateWindowState();
  res.sendStatus(200);
});

app.post('/clicked', (req: Request, res: Response) => {
  console.log('Clicked element data:', req.body);
  res.sendStatus(200);
});

app.post('/perform_a_spin', (req: Request, res: Response) => {
    performGameActions(page);
    res.sendStatus(200);
});



const server = app.listen(3000, () => {
  console.log('Web UI at http://localhost:3000/control.html');
});

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: [
        '--mute-audio',
        '--disable-infobars',
        '--no-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--no-default-browser-check',
        '--disable-setuid-sandbox',
        '--disable-features=site-per-process',
        '--autoplay-policy=no-user-gesture-required',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows'

      ]
  } as unknown as LaunchOptions);

  page = await browser.newPage();



  await page.exposeFunction('reportClick', (data: any) => {
    console.log('🖱️ Clicked element from browser:', data);
  });

  
  await page.goto('https://forbescasino.cz');

  session = await page.createCDPSession();
  const info = await session.send('Browser.getWindowForTarget');
  windowId = info.windowId;
  await updateWindowState();
})();




  /*await page.evaluateOnNewDocument(() => {
    const getUniqueSelector = (el: Element): string => {
      if (el.id) return `#${el.id}`;
      const parts: string[] = [];
      while (el && el.nodeType === 1 && el !== document.body) {
        let selector = el.nodeName.toLowerCase();
        if (el.className) selector += '.' + [...el.classList].join('.');
        parts.unshift(selector);
        el = el.parentElement!;
      }
      return parts.join(' > ');
    };
  
    document.addEventListener('click', (e) => {
      const target = e.target as Element;
      if (!target) return;
  
      const data = {
        tag: target.tagName,
        id: target.id,
        classes: target.className,
        text: target.textContent?.trim().slice(0, 100),
        href: (target as HTMLAnchorElement).href || undefined,
        selector: getUniqueSelector(target)
      };
  
      // @ts-ignore
      if (window.reportClick) {
        // @ts-ignore
        window.reportClick(data);
      } else {
        console.warn('reportClick not available');
      }
    }, true);
  });*/