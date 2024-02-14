const {
  app,
  ipcMain,
  BrowserWindow,
  BrowserView,
  remote,
} = require("electron");
const path = require("node:path");

app.whenReady().then(() => {
  // Sample base window
  const parent = new BrowserWindow({
    width: 1600,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });
  parent.loadFile("index.html");

  // URL to your ad-sample.html
  const adURL = "https://consent.nitrocnct.com/app-example/ad-sample.html";

  // URL to your cmp.html
  const cmpURL = "https://consent.nitrocnct.com/app-example/cmp.html";

  // Your front page
  const referrer = "https://nitrocnct.com/";

  // ## Create an ad window ##
  const ad = new BrowserView({
    webPreferences: {
      partition: "persist:adpartition",
    },
  });

  // Remove app name and electron from user-agent
  const re = new RegExp(`(${app.getName()}|Electron)/[\\d\\.]+ `, "g");
  ad.webContents.setUserAgent(ad.webContents.getUserAgent().replace(re, ""));

  // Position ad to the right side (example)
  // Width is set larger than viewable area to avoid being treated as mobile device by ads
  let bounds = parent.getBounds();
  ad.setBounds({ x: bounds.width - 325, y: 10, width: 1280, height: 600 });
  parent.on("resize", function () {
    bounds = parent.getBounds();
    ad.setBounds({ x: bounds.width - 325, y: 10, width: 1280, height: 600 });
  });

  parent.setBrowserView(ad);

  // ## Load the CMP ##

  const createCMP = () => {
    return new BrowserWindow({
      width: 1120,
      height: 600,
      center: true,
      closable: false,
      skipTaskbar: true,
      modal: true,
      titleBarStyle: "hidden",
      transparent: true,
      hasShadow: false,
      frame: false,
      moveable: false,
      fullscreen: false,
      webPreferences: {
        partition: "persist:adpartition",
      },
      parent,
    });
  };

  const cmp = createCMP();

  // Safe to show ads once the CMP window is closed
  cmp.on("closed", () => {
    ad.webContents.loadURL(adURL, {
      httpReferrer: referrer,
    });
  });

  cmp.loadURL(cmpURL);

  // Handles resurfacing the CMP
  ipcMain.handle("resurface", () => {
    const cmp = createCMP();
    cmp.loadURL(cmpURL + "?resurface=1");
  });
});
