import type { Frame, Page, ElementHandle } from 'puppeteer';

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

export async function waitForGameFrame(page: Page): Promise<Frame> {
  await page.goto(pickRandomSynotGame(), {
    waitUntil: 'networkidle2'
  });

  const iframeElement = await page.waitForSelector('iframe');
  const frame = await iframeElement?.contentFrame();
  if (!frame) throw new Error('❌ Could not access game iframe');

  console.log('✅ Game iframe loaded');
  return frame;
}

export async function clickBetMinus(frame: Frame, times: number = 10) {
  try {
  await frame.waitForSelector('#betMinus', { timeout: 10000 });

  for (let i = 0; i < times; i++) {
    await frame.click('#betMinus');
    await wait(50);
  }

  console.log(`✅ Clicked #betMinus ${times} times`);
  } catch (err: any) {
  console.error('❌ Failed to click Bet Minus button:', err.message);
  }
}

export async function clickSpin(frame: Frame) {
  try {
    const spinSelector = await findSpinButtonSelector(frame);
    if (!spinSelector) {
      console.warn('⚠️ Spin button selector not found.');
      return;
    }

    const spinButton = await frame.waitForSelector(spinSelector, {
      timeout: 10000,
    });

    if (!spinButton) {
      console.warn('⚠️ Spin button not visible.');
      return;
    }

    await spinButton.click();
    console.log('✅ Spin button clicked');
  } catch (err: any) {
    console.error('❌ Failed to click spin button:', err.message);
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
      console.log(`✅ Found spin button using selector: ${selector}`);
      return selector;
    }
  }

  console.warn('⚠️ No known spin button selector matched.');
  return null;
}


export async function clickOkButton(frame: Frame) {
  await frame.evaluate(() => {
    // Najdi root aplikace
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








