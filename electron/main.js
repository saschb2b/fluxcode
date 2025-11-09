const { app, BrowserWindow } = require("electron")
const path = require("path")

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      webgl: true, // Enable WebGL for Three.js
    },
    icon: path.join(__dirname, "../public/icon.png"),
  })

  // In development, load from Next.js dev server
  // In production, load from static export
  const isDev = !app.isPackaged

  if (isDev) {
    mainWindow.loadURL("http://localhost:3000")
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, "../out/index.html"))
  }

  mainWindow.on("closed", () => {
    mainWindow = null
  })
}

app.whenReady().then(createWindow)

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit()
  }
})

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// Steam Deck optimization: Disable hardware acceleration if needed
// Uncomment if you encounter graphics issues on Steam Deck
// app.disableHardwareAcceleration();
