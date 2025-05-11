import type { Frame, Page } from 'puppeteer';

export const wait = (ms: number) => new Promise(res => setTimeout(res, ms));

export async function waitForGameFrame(page: Page): Promise<Frame> {
  await page.goto('https://www.forbescasino.cz/game/1123/online/fire_witch', {
    waitUntil: 'networkidle2'
  });

  const iframeElement = await page.waitForSelector('iframe');
  const frame = await iframeElement?.contentFrame();
  if (!frame) throw new Error('❌ Could not access game iframe');

  console.log('✅ Game iframe loaded');
  return frame;
}

export async function clickBetMinus(frame: Frame, times: number = 10) {
  await frame.waitForSelector('#betMinus', { visible: true, timeout: 10000 });

  for (let i = 0; i < times; i++) {
    await frame.click('#betMinus');
    await wait(100);
  }

  console.log(`✅ Clicked #betMinus ${times} times`);
}

export async function clickSpin(frame: Frame) {
  const spinSelector =
    'div.gameShadow > div.screen > div.baseGame > div.userControls > div.mainBtns > div.btn.spinBtn > div.content > div.icon';

  await frame.waitForSelector(spinSelector, { visible: true, timeout: 10000 });
  await frame.click(spinSelector);

  console.log('✅ Spin button clicked');
}
