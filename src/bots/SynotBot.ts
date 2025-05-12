import {injectControlPanelScript} from "../frontend/injectUI";
import { clickBetMinus, clickSpin, waitForGameFrame, wait } from "../lib/gameActions";
import puppeteer from "puppeteer";
import type { Browser, Page, CDPSession } from "puppeteer";

export class SynotBot {
  private browser!: Browser;
  private page!: Page;
  private session!: CDPSession;
  private windowId!: number;
  private performBoolean = false;
  private fakeMaximize = false;

  constructor(public id: string) {}

  async launch() {
    this.browser = await puppeteer.launch({ headless: false, args: [
        "--mute-audio",
      "--disable-infobars",
      "--no-sandbox",
      "--disable-blink-features=AutomationControlled",
      "--no-default-browser-check",
      "--disable-setuid-sandbox",
      "--disable-features=site-per-process",
      "--autoplay-policy=no-user-gesture-required",
      "--disable-background-timer-throttling",
      "--disable-backgrounding-occluded-windows",
    ] });
    this.page = await this.browser.newPage();
    await this.page.goto("https://www.synottip.cz/", { waitUntil: "networkidle2" });
    this.session = await this.page.createCDPSession();
    const info = await this.session.send("Browser.getWindowForTarget");
    this.windowId = info.windowId;

    await this.injectControlUI();
  }

  private async injectControlUI() {
    await this.page.evaluateOnNewDocument(injectControlPanelScript.toString()); // from injectUI.ts
  }

  toggleSpin() {
    this.performBoolean = !this.performBoolean;
    if (this.performBoolean) this.performActionsLoop();
  }

  private async performActionsLoop() {
    while (this.performBoolean) {
      const frame = await waitForGameFrame(this.page);
      await clickBetMinus(frame, 20);
      await clickSpin(frame);
      await wait(90000);
    }
  }

  async toggleWindowState() {
    if (!this.session || !this.windowId) return;
    this.fakeMaximize = !this.fakeMaximize;
    await this.session.send("Browser.setWindowBounds", {
      windowId: this.windowId,
      bounds: this.fakeMaximize ? { left: -20000, top: 0 } : { left: 100, top: 100 },
    });
  }
}
