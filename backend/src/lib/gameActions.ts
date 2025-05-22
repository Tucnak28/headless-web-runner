import type { Frame, Page, ElementHandle } from 'puppeteer';
import { SynotBot } from '../bots/SynotBot';

export const wait = (ms: number) => new Promise(res => setTimeout(res, ms));


export function pickRandomGame(bot: SynotBot): string {
  const gamePools: Record<string, string[]> = {
    Synottip: [
	  'https://casino.synottip.cz/game/run/f533df6c-72f5-45e0-9821-b2b67f157c11',
      'https://casino.synottip.cz/game/run/e311070a-504f-4b43-a498-57b7559d4708',
      'https://casino.synottip.cz/game/run/895374d2-85ca-426c-83a0-3500130caf61',
      'https://casino.synottip.cz/game/run/be7fa862-492f-4da0-a15e-11eedc79fa6e',
      'https://casino.synottip.cz/game/run/ea0f1791-d078-4dff-a93a-f6c79e33f07f',
      'https://casino.synottip.cz/game/run/fc91bd7b-1872-438d-bf3a-115a3337a161',
      'https://casino.synottip.cz/game/run/d9426254-76ff-4da8-a48c-2990f9fdd16b',
      'https://casino.synottip.cz/game/run/62e5535f-9fa1-4486-86ee-4ef7b8c0bb38',
      'https://casino.synottip.cz/game/run/6178bdc0-1602-4743-bd14-68165708c1c4',
      'https://casino.synottip.cz/game/run/1969d9c5-4cb1-44ef-b53f-722ab3694e1d',
      'https://casino.synottip.cz/game/run/c3316cdf-d625-4e51-a57c-aab30f8b8fef',
      'https://casino.synottip.cz/game/run/62591ad6-b761-4f13-90f0-2b631dd9b9dc',
      'https://casino.synottip.cz/game/run/10eb9962-d7ee-4917-a4c9-f0b1f2081377',
      'https://casino.synottip.cz/game/run/7550e40a-67dc-41ed-8a2c-b1729da75a0e',
      'https://casino.synottip.cz/game/run/056eb63d-2758-4712-b4a2-d51ecc13bc73',
      'https://casino.synottip.cz/game/run/887895bd-6dc9-42bd-892b-e5d6352d0fa9',
      'https://casino.synottip.cz/game/run/d18ddc15-624a-422c-9cf9-f7205ad6f9b8',
      'https://casino.synottip.cz/game/run/f892f9e2-3a8a-4bd0-a9f5-a04a52cfeb87',
      'https://casino.synottip.cz/game/run/55ae75a8-21dd-4347-ab34-db35e3d1bc14',
      'https://casino.synottip.cz/game/run/5c3ba390-2fba-43cb-a1ba-5fc2c5c72af3',
      'https://casino.synottip.cz/game/run/f11f8aaa-08fd-4d88-80d0-ce506da265c1',
      'https://casino.synottip.cz/game/run/aa9db369-f7da-4925-8f38-de0f6d789382',
      'https://casino.synottip.cz/game/run/b200c32e-30ea-498f-a0da-aa889e384a7a',
      'https://casino.synottip.cz/game/run/751ab507-112e-4b25-bb84-2c995324c591',
      'https://casino.synottip.cz/game/run/b0b1e00d-9777-4f85-8b6a-0b3924ec1602',
      'https://casino.synottip.cz/game/run/00811bf9-eba4-4ab4-a4ea-a735af8e1d56',
      'https://casino.synottip.cz/game/run/053ade1e-6bdf-4a01-b460-01a8e7f880f0',
      'https://casino.synottip.cz/game/run/6178bdc0-1602-4743-bd14-68165708c1c4',
      'https://casino.synottip.cz/game/run/00811bf9-eba4-4ab4-a4ea-a735af8e1d56',
    ],
    Gapa: [
      'https://herna.gapagroup.cz/game/run/053ade1e-6bdf-4a01-b460-01a8e7f880f0',
      'https://herna.gapagroup.cz/game/run/6178bdc0-1602-4743-bd14-68165708c1c4',
      'https://herna.gapagroup.cz/game/run/00811bf9-eba4-4ab4-a4ea-a735af8e1d56',
      'https://herna.gapagroup.cz/game/run/48a4de0e-e13c-4bfb-8c40-11c314822e88',
      'https://herna.gapagroup.cz/game/run/0cbfd270-2fed-453b-b527-1326b7da323b',
      'https://herna.gapagroup.cz/game/run/f9388cbe-541f-41d8-8f7a-d86deec44138',
      'https://herna.gapagroup.cz/game/run/ce68ce74-4237-4af4-86ac-6105fabb8628',
      'https://herna.gapagroup.cz/game/run/b200c32e-30ea-498f-a0da-aa889e384a7a',
      'https://herna.gapagroup.cz/game/run/10eb9962-d7ee-4917-a4c9-f0b1f2081377',
      'https://herna.gapagroup.cz/game/run/e0d2a12a-a95e-48d5-8141-99a13bb8a66d',
      'https://herna.gapagroup.cz/game/run/487e3b88-ffeb-42ac-a356-356260e300e9',
      'https://herna.gapagroup.cz/game/run/c2b1a20b-632b-46b5-b7c6-c089deae5e30',
      'https://herna.gapagroup.cz/game/run/e9854e45-7e47-42b6-a7a5-0fca975b9245',
    ],
    Fbet: [
      'https://www.fbet.cz/vegas/game/AladdinAndTheGoldenPalace/real',
      'https://www.fbet.cz/vegas/game/BookOfSecrets/real',
      'https://www.fbet.cz/vegas/game/Diamondz/real',
      'https://www.fbet.cz/vegas/game/TikiPrincess/real',
      'https://www.fbet.cz/vegas/game/HuntersSpirit/real',
      'https://www.fbet.cz/vegas/game/BuffaloHunt/real',
      'https://www.fbet.cz/vegas/game/BlazingIce/real',
      'https://www.fbet.cz/vegas/game/AladdinMagicCarpet/real',
      'https://www.fbet.cz/vegas/game/HellBars/real',
      'https://www.fbet.cz/vegas/game/Eldorado/real',
      'https://www.fbet.cz/vegas/game/FruityGold/real',
      'https://www.fbet.cz/vegas/game/FruityGold81/real',
      'https://www.fbet.cz/vegas/game/AtlantisGold/real',
      'https://www.fbet.cz/vegas/game/MirrorShield/real',
      'https://www.fbet.cz/vegas/game/MonkeySlots/real',
    ],

    Forbes: [
      'https://www.forbescasino.cz/game/1384/online/amazons_wonders',
    ]


  };

  const pool = gamePools[bot.getInfo().platform];
  if (!pool || pool.length === 0) {
    throw new Error(`No games found for platform "${bot.getInfo().platform}"`);
  }

  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}


export async function tryLogin(page: Page, bot: SynotBot, username: string, password: string) {
  const usernameSelectors = [
    'input[name="login"]',
    'input[name="username"]',
    'input[name="email"]',
    'input[formcontrolname="name"]',
    '#login-email',
    'input[autocomplete="username"]'
  ];

  const passwordSelectors = [
    'input[name="password"]',
    'input[formcontrolname="psw"]',
    '#login-pass',
    'input[autocomplete="current-password"]'
  ];

  try {
    const usernameField = await findEnabledInput(page, usernameSelectors);
    const passwordField = await findEnabledInput(page, passwordSelectors);

    if (usernameField && passwordField) {
      bot.addLog("🔒 Login form detected. Attempting login...");

      await usernameField.type(username, { delay: 50 });
      await passwordField.type(password, { delay: 50 });

      await page.keyboard.press('Enter');

      bot.addLog("✅ Login submitted");
      await wait(3000);
    }
  } catch (err: any) {
    throw new Error(`❌ Failed during login attempt: ${err.message}`);
  }
}

async function findEnabledInput(page: Page, selectors: string[]): Promise<ElementHandle<Element> | null> {
  for (const selector of selectors) {
    const el = await page.$(selector);
    if (el) {
      const isDisabled = await page.evaluate(el => el.hasAttribute('disabled'), el);
      if (!isDisabled) return el;
    }
  }
  return null;
}




export async function navigateToGamePage(page: Page, bot: SynotBot): Promise<void> {
  const url = pickRandomGame(bot);
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
    el.remove();
    /*const s = (el as HTMLElement).style;
    (el as HTMLElement).style.display = "none";
    s.setProperty('pointer-events', 'none', 'important');
    s.setProperty('opacity',        '0',   'important');
    s.setProperty('visibility',     'hidden', 'important');

    s.setProperty('width',  '0', 'important');
    s.setProperty('height', '0', 'important');*/
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