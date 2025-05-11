import express, { Request, Response } from 'express';
import puppeteer, { LaunchOptions } from 'puppeteer';
import type { CDPSession, Page, Frame } from 'puppeteer';
import { waitForGameFrame, clickBetMinus, clickSpin, wait } from './synot';


const app = express();
app.use(express.static('public'));
app.use(express.json());

let session: CDPSession;
let page: Page;
let windowId: number;
let fakeMaximize = true;
let performBoolean = false;


export async function performGameActions(page: Page) {
    while(performBoolean) {
        // 1. Get the game iframe
        const frame = await waitForGameFrame(page);

        await wait(90_000);
    
        // 2. Click Bet Minus 20 times
        await clickBetMinus(frame, 20);
    
        // 3. Click Spin button
        await clickSpin(frame);

        await wait(90_000);
    
        console.log('✅ Game actions completed inside iframe.');
    }
}
  
  

const updateWindowState = async () => {
    if (!session || !windowId) return;
  
    if (fakeMaximize) {
      // Move the window far off-screen
      await session.send('Browser.setWindowBounds', {
        windowId,
        bounds: {
          windowState: 'normal',
          left: -2000,
          top: 0
        }
      });
      console.log('Window moved out of bounds.');
    } else {
      // Move it back to visible screen
      await session.send('Browser.setWindowBounds', {
        windowId,
        bounds: {
          windowState: 'normal',
          left: 100,
          top: 100
        }
      });
      console.log('Window moved back in bounds.');
    }
  };
  

app.post('/toggle_Maximize', async (req: Request, res: Response) => {
  fakeMaximize = !fakeMaximize;
  console.log('Fake maximize toggled to:', fakeMaximize);
  await updateWindowState();
  res.sendStatus(200);
});


app.post('/perform_a_spin', (req: Request, res: Response) => {
    performBoolean = !performBoolean;
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

  
  await page.goto('https://herna.gapagroup.cz/');

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