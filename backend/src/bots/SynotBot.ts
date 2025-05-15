import {injectControlPanelScript} from "../uiScripts/injectUI";
import { clickBetMinus, clickSpin, navigateToGamePage, getGameIframe, wait, tryLogin } from "../lib/gameActions";
import puppeteer from "puppeteer";
import type { Browser, Page, CDPSession } from "puppeteer";




export class SynotBot {
  private browser!: Browser;
  private page!: Page;
  private session!: CDPSession;
  private windowId!: number;
  
  private hasEcoModeInitialized = false;
  private performBoolean = false;
  private fakeMaximize = false;
  private ultraEcoMode = false;
  private log: string[] = [];
  private username = "";
  private password = "";
  private retries = 0;
  private maxRetries = 5;

  constructor(public id: string) {}

  async launch() {
    this.browser = await puppeteer.launch({ headless: 'new' as any, defaultViewport: null, 
      args: [
  '--mute-audio',
  '--no-sandbox',
  '--disable-gpu',
  '--disable-infobars',
  '--disable-dev-shm-usage',
  '--disable-software-rasterizer',
  '--disable-accelerated-2d-canvas',
  '--disable-accelerated-video-decode',
  '--disable-backgrounding-occluded-windows',
  '--disable-background-timer-throttling',
  '--disable-breakpad',
  '--disable-client-side-phishing-detection',
  '--disable-default-apps',
  '--disable-domain-reliability',
  '--disable-features=site-per-process,TranslateUI,BlinkGenPropertyTrees',
  '--disable-hang-monitor',
  '--disable-popup-blocking',
  '--disable-prompt-on-repost',
  '--disable-renderer-backgrounding',
  '--disable-sync',
  '--force-color-profile=srgb',
  '--metrics-recording-only',
  '--no-first-run',
  '--no-default-browser-check',
  '--enable-automation',
  '--password-store=basic',
  '--use-mock-keychain',
  '--autoplay-policy=no-user-gesture-required',
  '--hide-scrollbars',
  '--disable-extensions',
  '--disable-component-update',
] });
    this.page = await this.browser.newPage();
    await this.page.goto("https://www.synottip.cz/", { waitUntil: "networkidle2" });
    this.session = await this.page.createCDPSession();
    const info = await this.session.send("Browser.getWindowForTarget");
    this.windowId = info.windowId;

    await this.page.evaluate(() => {
      Object.defineProperty(window, 'devicePixelRatio', {
        get: () => 0.1,
        configurable: true
      });
    });


    await this.session.send("Browser.setWindowBounds", {
    windowId: this.windowId,
        bounds: {
        windowState: "normal"
        }
    });


    //await this.injectControlUI();
  }

  public addLog(message: string) {
    const now = new Date();

  const timestamp = `[${now.getDate().toString().padStart(2, '0')}.${(now.getMonth() + 1)
  .toString()
  .padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}]`;
    
    this.log.push(`[${timestamp}] ${message}`);

    // keep only last 150 entries
    if (this.log.length > 150) {
      this.log = this.log.slice(-150);
    }
  }

  public getLog(): string[] {
    return this.log;
  }

  public setLoginInfo = async (username: string, password: string) => {
    this.username = username;
    this.password = password;

    this.addLog(`🪪 Login info set for bot "${this.id}"`);
  }

  private async injectControlUI() {
    await this.page.evaluateOnNewDocument(injectControlPanelScript.toString()); // from injectUI.ts
  }

  toggleSpin() {
    this.performBoolean = !this.performBoolean;

    if (this.performBoolean) this.performActionsLoop();
    this.addLog(this.performBoolean ? "🔁 Auto-spin started" : "🛑 Auto-spin stopped");
  }





  private async performActionsLoop() {

    if(this.username === "" || this.password === "") return;

    while (this.performBoolean && this.retries < this.maxRetries) {
      try {
        await navigateToGamePage(this.page, this);

        await wait(1000);

        await tryLogin(this.page, this, this.username, this.password);

        await wait(1000);
        
        const frame = await getGameIframe(this.page, this);

        await wait(1000);

        if (this.ultraEcoMode) await this.EcoMode();

        await wait(1000); // let it load and settle
        await clickBetMinus(frame, this.page, 20, this);
        await clickSpin(frame, this);
        await wait(5000); // wait after spin

        this.retries = 0; // reset on success
      } catch (err: any) {
        this.retries++;
        this.addLog(`❌ Error during spin loop: ${err.message}. Retrying with another game...`);
        await wait(2000);
      }
    }
  }


  async toggleWindowState() {
    if (!this.session || !this.windowId) return;
    this.fakeMaximize = !this.fakeMaximize;
    await this.session.send("Browser.setWindowBounds", {
      windowId: this.windowId,
      bounds: this.fakeMaximize ? { left: -20000, top: 0 } : { left: 100, top: 100 },
    });

    this.addLog(this.fakeMaximize ? "🪟 Window hidden" : "🪟 Window restored");
  }

async toggleUltraEcoMode() {
  if (!this.session || !this.windowId || !this.page) return;

  this.ultraEcoMode = !this.ultraEcoMode;

  this.EcoMode();
}


async EcoMode() {
  if (this.ultraEcoMode && !this.hasEcoModeInitialized) {
    this.hasEcoModeInitialized = true;

    // ── 1. CPU throttling
    await this.session.send("Emulation.setCPUThrottlingRate", { rate: 6 });

    // ── 2. Tiny viewport + low DPR
    await this.page.setViewport({
      width: 300,
      height: 200,
      deviceScaleFactor: 0.1,
    });
    await this.page.evaluate(() => {
      Object.defineProperty(window, "devicePixelRatio", {
        get: () => 0.1,
        configurable: true,
      });
    });

    // ── 3. Shrink and hide window
    await this.session.send("Browser.setWindowBounds", {
      windowId: this.windowId,
      bounds: {
        width: 320,
        height: 240,
      },
    });

    // ── 4. Block heavy resources
    await this.session.send("Network.enable");
    await this.session.send("Network.setRequestInterception", {
      patterns: [
        { urlPattern: "*", resourceType: "Image", interceptionStage: "HeadersReceived" },
        { urlPattern: "*", resourceType: "Media", interceptionStage: "HeadersReceived" },
        { urlPattern: "*", resourceType: "Font", interceptionStage: "HeadersReceived" },
        //{ urlPattern: "*", resourceType: "Stylesheet", interceptionStage: "HeadersReceived" },
      ],
    });

    this.session.on("Network.requestIntercepted", async (evt: any) => {
      const abort = ["Image", "Media", "Font"/*, "Stylesheet"*/].includes(evt.resourceType);
      try {
        await this.session.send("Network.continueInterceptedRequest", {
          interceptionId: evt.interceptionId,
          errorReason: abort ? "Aborted" : undefined,
        });
      } catch (err) {
        this.addLog(`⚠️ Intercept failed: ${(err as Error).message}`);
      }
    });

    // ── 5. Stop animations & JS-heavy rendering
    await this.page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
    await this.page.evaluate(() => {
      // Freeze requestAnimationFrame
      (window as any).__originalRAF = window.requestAnimationFrame;
      window.requestAnimationFrame = () => 0;

      // Kill all transitions, animations, transforms
      for (const el of Array.from(document.querySelectorAll("*")) as HTMLElement[]) {
        el.style.transition = el.style.animation = el.style.transform = "none";
      }

      // Disable canvas/WebGL rendering
      const noop = () => {};
      HTMLCanvasElement.prototype.getContext = () => ({ clearRect: noop, fillRect: noop } as any);
    });

    // ── 6. Remove all visible text and headers not inside iframes
    await this.page.evaluate(() => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node: Node | null;
      while ((node = walker.nextNode())) {
        if (!node.parentElement?.closest("iframe")) {
          node.textContent = "";
        }
      }

      // Remove visible wrappers that aren't needed
      document.querySelectorAll("header, nav, footer, .popup, #retentionPanelIcons, .promotion-wrapper-popup").forEach(el => el.remove());
    });

    this.addLog("🛑 UltraEcoMode: EXTREME ACTIVATED");
  }

  // ── DEACTIVATION
  else if (!this.ultraEcoMode && this.hasEcoModeInitialized) {
    this.hasEcoModeInitialized = false;

    await this.session.send("Emulation.setCPUThrottlingRate", { rate: 1 });

    await this.page.setViewport({
      width: 1280,
      height: 720,
      deviceScaleFactor: 1,
    });

    await this.page.evaluate(() => {
      if ((window as any).__originalRAF) {
        window.requestAnimationFrame = (window as any).__originalRAF;
        delete (window as any).__originalRAF;
      }
      delete (window as any).devicePixelRatio;
    });

    await this.session.send("Network.disable");
    this.session.removeAllListeners("Network.requestIntercepted");

    await this.page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "no-preference" }]);

    await this.session.send("Browser.setWindowBounds", {
      windowId: this.windowId,
      bounds: {
        left: 100,
        top: 100,
        width: 1280,
        height: 720,
      },
    });

    this.addLog("🌱 UltraEcoMode: OFF");
  }
}




}
