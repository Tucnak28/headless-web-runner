import {
  clickBetMinus,
  clickSpin,
  navigateToGamePage,
  getGameIframe,
  wait,
  tryLogin,
} from "../lib/gameActions";
import puppeteer from "puppeteer";
import type { Browser, Page, CDPSession } from "puppeteer";
import fs from "fs";
import path from "path";

export class SynotBot {
  private browser!: Browser;
  private page!: Page;
  private session!: CDPSession;
  private windowId!: number;
  private spinLoopPromise: Promise<void> | null = null;

  private hasEcoModeInitialized = false;
  private performBoolean = false;
  private fakeMaximize = false;
  private ultraEcoMode = false;
  private log: string[] = [];
  private username = "";
  private password = "";
  private delay = 0;
  private retries = 0;
  private maxRetries = 5;

  private delayWeights = {
    nav: 2,
    postLogin: 1,
    settle1: 1,
    settle2: 1,
    settle3: 1,
    spin: 3,
  };

  constructor(public id: string) {}

  async launch() {
    this.browser = await puppeteer.launch({
      headless: false as any,
      defaultViewport: null,
      args: [
        "--mute-audio",
        "--no-sandbox",
        "--disable-gpu",
        "--disable-infobars",
        "--disable-dev-shm-usage",
        "--disable-software-rasterizer",
        "--disable-accelerated-2d-canvas",
        "--disable-accelerated-video-decode",
        "--disable-backgrounding-occluded-windows",
        "--disable-background-timer-throttling",
        "--disable-breakpad",
        "--disable-client-side-phishing-detection",
        "--disable-default-apps",
        "--disable-domain-reliability",
        "--disable-features=site-per-process,TranslateUI,BlinkGenPropertyTrees",
        "--disable-hang-monitor",
        "--disable-popup-blocking",
        "--disable-prompt-on-repost",
        "--disable-renderer-backgrounding",
        "--disable-sync",
        "--force-color-profile=srgb",
        "--metrics-recording-only",
        "--no-first-run",
        "--no-default-browser-check",
        "--enable-automation",
        "--password-store=basic",
        "--use-mock-keychain",
        "--autoplay-policy=no-user-gesture-required",
        "--hide-scrollbars",
        "--disable-extensions",
        "--disable-component-update",
      ],
    });

    this.page = await this.browser.newPage();
    await this.page.goto("https://www.synottip.cz/", {
      waitUntil: "networkidle2",
    });
    this.session = await this.page.createCDPSession();
    const info = await this.session.send("Browser.getWindowForTarget");
    this.windowId = info.windowId;

    await this.page.evaluate(() => {
      Object.defineProperty(window, "devicePixelRatio", {
        get: () => 0.1,
        configurable: true,
      });
    });

    await this.session.send("Browser.setWindowBounds", {
      windowId: this.windowId,
      bounds: {
        windowState: "normal",
      },
    });

    //await this.injectControlUI();
  }

  public getInfo() {
    return {
      id: this.id,
      username: this.username,
      delay: this.delay,
    };
  }


  public addLog(message: string) {
    const now = new Date();

    const timestamp = `[${now.getDate().toString().padStart(2, "0")}.${(
      now.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")} ${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}]`;

    const formattedMessage = `${timestamp} ${message}`;
    this.log.push(formattedMessage);

    // Keep only last 150 entries
    if (this.log.length > 150) {
      this.log = this.log.slice(-150);
    }

    // Log to file
    const dateOnly = now.toISOString().split("T")[0];
    const fileName = `${dateOnly} ${this.id} - ${this.username}.txt`;
    const filePath = path.join(__dirname, "..", "..", "logs", fileName);

    // Ensure the directory exists
    fs.mkdirSync(path.dirname(filePath), { recursive: true });

    // Append the log line
    fs.appendFile(filePath, formattedMessage + "\n", (err) => {
      if (err) {
        console.error("❌ Failed to write to log file:", err.message);
      }
    });
  }

  public getLog(): string[] {
    return this.log;
  }

  public setLoginInfo = async (username: string, password: string) => {
    this.username = username;
    this.password = password;

    this.addLog(`🪪 Login info set for bot "${this.id}"`);
  };

  public setDelay = async (delay: number) => {
    this.delay = delay;
    this.addLog(`⏱️ Delay set to ${this.delay}s for bot "${this.id}"`);
  };

  private async dynamicWait(label: keyof typeof this.delayWeights) {
    const totalWeight = Object.values(this.delayWeights).reduce(
      (a, b) => a + b,
      0
    );
    const unit = ((this.delay ?? 14) * 1000) / totalWeight;

    const waitTime = unit * this.delayWeights[label];
    await wait(waitTime);
  }

  public toggleSpin() {
    this.performBoolean = !this.performBoolean;

    if (this.performBoolean) {
      if (!this.spinLoopPromise) {
        this.spinLoopPromise = this.performActionsLoop().finally(() => {
          this.spinLoopPromise = null;
        });
      }
    }

    this.addLog(
      this.performBoolean
        ? "🔁 Auto-spin started"
        : "🛑 Auto-spin stopped (Current cycle has to finish)"
    );
  }

  private async performActionsLoop() {
    if (this.username === "" || this.password === "") return;

    while (this.performBoolean) {
      try {
        await navigateToGamePage(this.page, this);
        await this.dynamicWait("nav");

        await tryLogin(this.page, this, this.username, this.password);
        await this.dynamicWait("postLogin");

        const frame = await getGameIframe(this.page, this);
        await this.dynamicWait("settle1");

        if (this.ultraEcoMode) await this.EcoMode();
        await this.dynamicWait("settle2");

        await clickBetMinus(frame, this.page, 20, this);
        await this.dynamicWait("settle3");

        await clickSpin(frame, this);
        await this.dynamicWait("spin");

        this.retries = 0;
      } catch (err: any) {
        this.retries++;
        this.addLog(
          `❌ Error during spin loop:\n${err.message}\nRetrying with another game...`
        );

        if (this.retries >= this.maxRetries) {
          this.addLog("⚠️ Too many retries, waiting 10 minutes...");
          await wait(600_000);
          this.retries = 0;
        } else {
          await wait(2000);
        }
      }
    }
  }

  async toggleWindowState() {
    if (!this.session || !this.windowId) return;
    this.fakeMaximize = !this.fakeMaximize;
    await this.session.send("Browser.setWindowBounds", {
      windowId: this.windowId,
      bounds: this.fakeMaximize
        ? { left: -20000, top: 0 }
        : { left: 100, top: 100 },
    });

    this.addLog(this.fakeMaximize ? "🪟 Window hidden" : "🪟 Window restored");
  }

  async toggleUltraEcoMode() {
    if (!this.session || !this.windowId || !this.page) return;

    this.ultraEcoMode = !this.ultraEcoMode;

    this.EcoMode();
  }

  public async kill() {
    this.addLog("💀 Killing bot...");

    //Stop spinning
    this.performBoolean = false;

    //Close Puppeteer resources
    try {
      if (this.page && !this.page.isClosed()) {
        await this.page.close();
      }

      if (this.browser && this.browser.process() != null) {
        await this.browser.close();
      }

      this.addLog("✅ Bot closed successfully");
    } catch (err) {
      this.addLog(`❌ Error while closing bot: ${(err as Error).message}`);
    }

    //Cleanup session
    this.spinLoopPromise = null;
    this.session = undefined as any;
    this.page = undefined as any;
    this.browser = undefined as any;
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
          {
            urlPattern: "*",
            resourceType: "Image",
            interceptionStage: "HeadersReceived",
          },
          {
            urlPattern: "*",
            resourceType: "Media",
            interceptionStage: "HeadersReceived",
          },
          {
            urlPattern: "*",
            resourceType: "Font",
            interceptionStage: "HeadersReceived",
          },
          //{ urlPattern: "*", resourceType: "Stylesheet", interceptionStage: "HeadersReceived" },
        ],
      });

      this.session.on("Network.requestIntercepted", async (evt: any) => {
        const abort = ["Image", "Media", "Font" /*, "Stylesheet"*/].includes(
          evt.resourceType
        );
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
      await this.page.emulateMediaFeatures([
        { name: "prefers-reduced-motion", value: "reduce" },
      ]);
      await this.page.evaluate(() => {
        // Freeze requestAnimationFrame
        (window as any).__originalRAF = window.requestAnimationFrame;
        window.requestAnimationFrame = () => 0;

        // Kill all transitions, animations, transforms
        for (const el of Array.from(
          document.querySelectorAll("*")
        ) as HTMLElement[]) {
          el.style.transition =
            el.style.animation =
            el.style.transform =
              "none";
        }

        // Disable canvas/WebGL rendering
        const noop = () => {};
        HTMLCanvasElement.prototype.getContext = () =>
          ({ clearRect: noop, fillRect: noop } as any);
      });

      // ── 6. Remove all visible text and headers not inside iframes
      await this.page.evaluate(() => {
        const walker = document.createTreeWalker(
          document.body,
          NodeFilter.SHOW_TEXT
        );
        let node: Node | null;
        while ((node = walker.nextNode())) {
          if (!node.parentElement?.closest("iframe")) {
            node.textContent = "";
          }
        }

        // Remove visible wrappers that aren't needed
        document
          .querySelectorAll(
            "header, nav, footer, .popup, #retentionPanelIcons, .promotion-wrapper-popup"
          )
          .forEach((el) => el.remove());
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

      await this.page.emulateMediaFeatures([
        { name: "prefers-reduced-motion", value: "no-preference" },
      ]);

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
