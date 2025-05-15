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

export async function tryLogin(page: Page, bot: SynotBot, username: string, password: string) {
  try {
    const loginExists = await page.$('input[name="login"]');
    const passwordExists = await page.$('input[name="password"]');

    if (loginExists && passwordExists) {
      bot.addLog("🔒 Login form detected. Attempting login...");

      await page.type('input[name="login"]', username, { delay: 50 });
      await page.type('input[name="password"]', password, { delay: 50 });

      // Attempt to submit the form (press Enter on password field)
      await page.keyboard.press('Enter');

      bot.addLog("✅ Login submitted");
      await wait(3000); // wait for login to complete
    } else {
      //bot.addLog("ℹ️ No login form detected.");
    }
  } catch (err: any) {
    throw new Error('❌ Failed to check or fill login form');
  }
}


export async function navigateToGamePage(page: Page, bot: SynotBot): Promise<void> {
  const url = pickRandomSynotGame();
  bot.addLog(`🔀 Navigating to new game: ${url}`);

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  } catch (err: any) {
    if (err.message.includes('ERR_ABORTED')) {
      throw new Error('⚠️ Navigation aborted (expected when changing URLs quickly)');
    } else {
      throw new Error('❌ Navigation failed');
    }
  }
}

export async function getGameIframe(page: Page, bot: SynotBot): Promise<Frame> {
  try {
    const iframeElement = await page.waitForSelector('iframe', { timeout: 10_000 });
    const frame = await iframeElement?.contentFrame();

    if (!frame) {
      throw new Error('❌ Could not access game iframe');
    }

    bot.addLog('✅ Game iframe loaded');
    return frame;
  } catch (err: any) {
    throw new Error('❌ Failed to access game iframe');
  }
}



async function dismissDialog(page: Page) {
  await page.evaluate(() => {
    const findButton = (root: Document | ShadowRoot): HTMLElement | null => {
      const buttons = root.querySelectorAll('peak-button');
      for (const btn of buttons) {
        if (btn.textContent?.trim() === 'OK') return btn as HTMLElement;
      }

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
}

async function tryRemoveRetentionPanel(frame: Frame, bot: SynotBot) {
  const removed = await frame.$eval('#retentionPanelIcons', el => {
    //el.remove();
    (el as HTMLElement).style.display = "none";
    return true;
  }).catch(() => false);

  if (!removed) {
    bot.addLog('ℹ️ #retentionPanelIcons not found or removal failed');
  }
}

export async function clickSpin(frame: Frame, bot: SynotBot) {
  try {
    const spinSelector = await findSpinButtonSelector(frame);
    if (!spinSelector) {
      throw new Error('⚠️ Spin button selector not found.');
    }

    const spinButton = await frame.waitForSelector(spinSelector, {
      timeout: 10000,
    });

    if (!spinButton) {
      throw new Error('⚠️ Spin button not visible.');
    }

    await spinButton.click();
    bot.addLog('✅ Spin button clicked');

  } catch (err: any) {
    throw new Error('❌ Failed to click spin button');
  }
}



export async function clickBetMinus(frame: Frame, page: Page, times: number = 10, bot: SynotBot) {
  try {
    await frame.waitForSelector('#betMinus', { timeout: 10000 });

    await wait(3000); // optional: might move this elsewhere if needed

    await dismissDialog(page);
    await tryRemoveRetentionPanel(frame, bot);

    for (let i = 0; i < times; i++) {
      await frame.click('#betMinus');
      await wait(50);
    }

    bot.addLog(`✅ Clicked #betMinus ${times} times`);
  } catch (err: any) {
    throw new Error('❌ Failed to click Bet Minus button');
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

  throw new Error('⚠️ No known spin button selector matched.');
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