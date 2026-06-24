import { app, BrowserWindow,shell } from "electron";
import path from "path";

const isDev = !app.isPackaged;

let mainWindow: BrowserWindow | null = null;
let VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;
 const indexPath = path.join(app.getAppPath(), "dist/index.html");
if (process.platform === "win32") app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev && VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    // IMPORTANT FIX
   
    mainWindow.maximize();
    mainWindow.loadFile(indexPath);
  }

  // Make all links open with the browser, not with the application
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:")) shell.openExternal(url);
    return { action: "deny" };
  });

  app.on("open-url", function (event, url) {
    event.preventDefault();
    if (mainWindow) {
      handleOpenUrl(url);
    }
  });
  function handleOpenUrl(link: string) {
    const deepLinkingUrl = link.split("://")[1];

    if (mainWindow) {
      mainWindow
        .loadURL(
          VITE_DEV_SERVER_URL
            ? VITE_DEV_SERVER_URL + deepLinkingUrl
            : `file://${path.join(indexPath, "index.html")}#/${deepLinkingUrl}` // Update this line
        )
        .then(() => {
          mainWindow?.webContents.send(
            "navigate",
            VITE_DEV_SERVER_URL
              ? deepLinkingUrl
              : `file://${path.join(indexPath, "index.html")}#/${deepLinkingUrl}` // Update this line
          );
        })
        .catch((err) => console.error("Error loading URL: ", err));
    } else {
      app.whenReady().then(() => {
        createWindow();
        mainWindow
          ?.loadURL(
            `file://${path.join(indexPath, "index.html")}#/${deepLinkingUrl}`
          ) // Update this line
          .then(() => {
            mainWindow?.webContents.send(
              "navigate",
              `file://${path.join(indexPath, "index.html")}#/${deepLinkingUrl}`
            );
          })
          .catch((err) => console.error("Error loading URL: ", err));
      });
    }
  }
}

app.whenReady().then(createWindow);
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", (_, argv) => {
 
    app.on("second-instance", (_, argv) => {
      if (mainWindow) {
        // Depending on the platform, argv[argv.length - 1] may contain the deep link
        let deepLink = argv.find((arg) => arg.startsWith("electron-fiddle://"));

        if (deepLink) {
          const deepLinkingUrl = deepLink.split("electron-fiddle://")[1];

          mainWindow.webContents.send("navigate", deepLinkingUrl);
          mainWindow.loadURL(
            VITE_DEV_SERVER_URL
              ? VITE_DEV_SERVER_URL + deepLinkingUrl
              : `file://${path.join(indexPath, "index.html")}#/${deepLinkingUrl}`
          );
          mainWindow.focus();
        }
      }
    });
  });
}
app.on("activate", () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    createWindow();
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});