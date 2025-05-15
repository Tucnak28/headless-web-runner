import type { Frame, Page } from 'puppeteer';
import { SynotBot } from '../bots/SynotBot';

export const wait = (ms: number) => new Promise(res => setTimeout(res, ms));


export function pickRandomSynotGame() {
  const games = [
'https://casino.synottip.cz/game/run/053ade1e-6bdf-4a01-b460-01a8e7f880f0',
'https://casino.synottip.cz/game/run/6178bdc0-1602-4743-bd14-68165708c1c4',
'https://casino.synottip.cz/game/run/00811bf9-eba4-4ab4-a4ea-a735af8e1d56',
'https://casino.synottip.cz/game/run/48a4de0e-e13c-4bfb-8c40-11c314822e88',
'https://casino.synottip.cz/game/run/0cbfd270-2fed-453b-b527-1326b7da323b',
'https://casino.synottip.cz/game/run/f9388cbe-541f-41d8-8f7a-d86deec44138',
'https://casino.synottip.cz/game/run/ce68ce74-4237-4af4-86ac-6105fabb8628',
'https://casino.synottip.cz/game/run/b200c32e-30ea-498f-a0da-aa889e384a7a',
'https://casino.synottip.cz/game/run/10eb9962-d7ee-4917-a4c9-f0b1f2081377',
'https://casino.synottip.cz/game/run/e0d2a12a-a95e-48d5-8141-99a13bb8a66d',
'https://casino.synottip.cz/game/run/487e3b88-ffeb-42ac-a356-356260e300e9',
'https://casino.synottip.cz/game/run/c2b1a20b-632b-46b5-b7c6-c089deae5e30',
'https://casino.synottip.cz/game/run/48fa991c-b6b0-478a-a2b0-788b7326905f'
  ];

  const randomIndex = Math.floor(Math.random() * games.length);
  return games[randomIndex];
}

export async function waitForGameFrame(page: Page, bot: SynotBot): Promise<Frame> {
  const url = pickRandomSynotGame();
  bot.addLog(`🔀 Navigating to new game: ${url}`);

  try {

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  } catch (err: any) {

    if (err.message.includes('ERR_ABORTED')) {
      bot.addLog('⚠️ navigation aborted (expected when changing URLs quickly)');
    } else {
      throw err;
    }
  }

  const iframeHandle = await page.waitForSelector('iframe[data-test-role="game-frame"]', {
    timeout: 30_000
  });

  if(!iframeHandle) throw new Error('❌ Url did not change');

  const frame = await iframeHandle.contentFrame();
  if (!frame) {
    bot.addLog('❌ Could not access game iframe');
    throw new Error('Could not access game iframe');
  }

  bot.addLog(`✅ Game iframe is ready (${frame.url()})`);
  return frame;
}


export async function clickBetMinus(frame: Frame, page: Page, times: number = 10, bot: SynotBot) {
  try {
  await frame.waitForSelector('#betMinus', { timeout: 10000 });


  await wait(3000);

  await page.evaluate(() => {
    const findButton = (root: Document | ShadowRoot): HTMLElement | null => {
      const buttons = root.querySelectorAll('peak-button');
      for (const btn of buttons) {
        if (btn.textContent?.trim() === 'OK') return btn as HTMLElement;
      }

      // Search recursively in shadow roots
      for (const el of root.querySelectorAll('*')) {
        const shadow = (el as HTMLElement).shadowRoot;
        if (shadow) {
          const found = findButton(shadow);
          if (found) return found;
        }
      }

      return null;
    };

    const btn = findButton(document);
    if (btn) btn.click();
  });

  // AAAAAAAAAAAAAAAAA I WILL JUST DELETEEEE ITTT
  await frame.waitForSelector('#retentionPanelIcons', { timeout: 5000 });

  const removed = await frame.$eval(
    '#retentionPanelIcons',
    el => {
      el.remove();
      return true;
    }
  ).catch(() => false);

  if (removed) {
    //console.log('✅ #retentionPanelIcons was removed');
  } else {
    bot.addLog('ℹ️ #retentionPanelIcons not found or removal failed');
  }









  for (let i = 0; i < times; i++) {
    await frame.click('#betMinus');
    await wait(50);
  }

    bot.addLog(`✅ Clicked #betMinus ${times} times`);
  } catch (err: any) {
    bot.addLog('❌ Failed to click Bet Minus button:' + err.message);
  }
}

export async function clickSpin(frame: Frame, bot: SynotBot) {
  try {
    const spinSelector = await findSpinButtonSelector(frame);
    if (!spinSelector) {
      bot.addLog('⚠️ Spin button selector not found.');
      return;
    }

    const spinButton = await frame.waitForSelector(spinSelector, {
      timeout: 10000,
    });

    if (!spinButton) {
      bot.addLog('⚠️ Spin button not visible.');
      return;
    }

    await spinButton.click();
    bot.addLog('✅ Spin button clicked');

  } catch (err: any) {
    bot.addLog('❌ Failed to click spin button:' + err.message);
  }
}



export async function findSpinButtonSelector(frame: Frame): Promise<string | null> {
  const selectors = [
    'div > div.screen > div.baseGame > div.userControls > div.mainBtns > div.btn.spinBtn',
    'div.gameShadow > div.screen > div.baseGame > div.userControls > div.mainBtns > div.btn.spinBtn > div.icon',
    'div.gameShadow > div.screen > div.baseGame > div.userControls > div.mainBtns > div.btn.spinBtn > div.content > div.icon'
  ];

  for (const selector of selectors) {
    const element = await frame.$(selector);
    if (element) {
      //console.log(`✅ Found spin button using selector: ${selector}`);
      return selector;
    }
  }

  //console.warn('⚠️ No known spin button selector matched.');
  return null;
}

export async function deepQuerySelector(page: Page, selectors: string[]): Promise<string | null> {
  return await page.evaluate((selectors) => {
    let context: any = document;
    
    for (const sel of selectors) {
      const next = context.querySelector(sel);
      if (!next) return null;
      context = next.shadowRoot ?? next;
    }

    return context?.textContent ?? null;
  }, selectors);
}




export async function clickOkButton(frame: Frame) {
  await frame.evaluate(() => {

    const app = document.querySelector('#peakIconHolder > peak-app');
    if (!app || !app.shadowRoot) return;

    const notificationsManager = app.shadowRoot.querySelector('#notificationsManager');
    if (!notificationsManager || !notificationsManager.shadowRoot) return;

    const consentDialog = notificationsManager.shadowRoot.querySelector('peak-dialog > peak-notification-consent');
    if (!consentDialog || !consentDialog.shadowRoot) return;

    const okButton = consentDialog.shadowRoot.querySelector('div > div.carousel-wrapper > div > peak-button:nth-child(2)');
    if (okButton instanceof HTMLElement) {
      okButton.click();
    }
  });
}