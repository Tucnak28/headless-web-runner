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
  private ultraEcoMode = false;

  constructor(public id: string) {}

  async launch() {
    this.browser = await puppeteer.launch({ headless: false as any, defaultViewport: null, args: [
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
      "--remote-debugging-port=9222",
    ] });
    this.page = await this.browser.newPage();
    await this.page.goto("https://www.synottip.cz/", { waitUntil: "networkidle2" });
    this.session = await this.page.createCDPSession();
    const info = await this.session.send("Browser.getWindowForTarget");
    this.windowId = info.windowId;


    await this.session.send("Browser.setWindowBounds", {
    windowId: this.windowId,
        bounds: {
        windowState: "normal"
        }
    });


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

async toggleUltraEcoMode() {
  if (!this.session || !this.windowId || !this.page) return;

  this.ultraEcoMode = !this.ultraEcoMode;

  if (this.ultraEcoMode) {
    // 1. CPU throttling to max (very slow)
    await this.session.send("Emulation.setCPUThrottlingRate", { rate: 6 });

    // 3. Tiny viewport + blurry pixel ratio
    /*await this.page.setViewport({
      width: 1,
      height: 1,
      deviceScaleFactor: 0.1
    });*/

    // 4. Override devicePixelRatio
    await this.page.evaluate(() => {
      Object.defineProperty(window, 'devicePixelRatio', {
        get() { return 0.1; }
      });
    });

    // 5. Block all images, media, and fonts
    await this.session.send("Network.enable");
    await this.session.send("Network.setRequestInterception", {
    patterns: [
        { urlPattern: "*", resourceType: "Image", interceptionStage: "HeadersReceived" },
        { urlPattern: "*", resourceType: "Media", interceptionStage: "HeadersReceived" },
        { urlPattern: "*", resourceType: "Font", interceptionStage: "HeadersReceived" },
        { urlPattern: "*", resourceType: "Stylesheet", interceptionStage: "HeadersReceived" },
    ]
    });

    this.session.on("Network.requestIntercepted", async (event: any) => {
    const blocked = ["Image", "Media", "Font", "Stylesheet"].includes(event.resourceType);
    await this.session.send("Network.continueInterceptedRequest", {
        interceptionId: event.interceptionId,
        errorReason: blocked ? "Aborted" : undefined
    });
    });

    // 6. Stop animations, rendering, and JS-heavy loops
    await this.page.emulateMediaFeatures([
      { name: "prefers-reduced-motion", value: "reduce" }
    ]);

    await this.page.evaluate(() => {
      // Patch requestAnimationFrame
      (window as any).__originalRAF = window.requestAnimationFrame;
      window.requestAnimationFrame = () => 0;

      // Stop all CSS animations & transitions
      const all = document.querySelectorAll("*");
      for (const el of all) {
        const style = el as HTMLElement;
        style.style.animation = "none";
        style.style.transition = "none";
        style.style.transform = "none";
      }

      // Stop canvas/webGL redraws
      const noop = () => {};
      HTMLCanvasElement.prototype.getContext = () => ({ clearRect: noop, fillRect: noop } as any);
    });

    console.log("🛑 UltraEcoMode: EXTREME ACTIVATED");

  } else {
    // Restore everything

    await this.session.send("Emulation.setCPUThrottlingRate", { rate: 1 });

    /*await this.page.setViewport({
      width: 1280,
      height: 720,
      deviceScaleFactor: 1
    });*/

    await this.page.evaluate(() => {
      if ((window as any).__originalRAF) {
        window.requestAnimationFrame = (window as any).__originalRAF;
      }
      delete (window as any).devicePixelRatio;
    });

    await this.session.send("Network.disable");
    this.session.removeAllListeners("Network.requestIntercepted");


    await this.page.emulateMediaFeatures([
      { name: "prefers-reduced-motion", value: "no-preference" }
    ]);

    console.log("🌱 UltraEcoMode: OFF");
  }
}


}
