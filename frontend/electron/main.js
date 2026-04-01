const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const { exec, spawn } = require('child_process');
const os = require('os');
const fs = require('fs');
const isDev = !app.isPackaged;

async function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#000000',
  });

  if (isDev) {
    win.loadURL('http://localhost:3000');
  } else {
    win.loadFile(path.join(__dirname, '../out/index.html'));
  }
}

// IPC Handler for Local Browser - FORCING DEDICATED PROFILE
ipcMain.handle('launch-browser', async (event, { userId, url, platform }) => {
  console.log(`🚀 Forcing Dedicated Profile: ${userId}`);
  
  // 1. Setup a clean, persistent path for THIS user
  const profileDir = path.join(app.getPath('userData'), 'drafted.job', userId.replace(/[@.]/g, '_'));
  if (!fs.existsSync(profileDir)) {
    fs.mkdirSync(profileDir, { recursive: true });
  }

  // 2. Locate Real Chrome
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chromePathX86 = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
  const chromeExe = fs.existsSync(chromePath) ? chromePath : (fs.existsSync(chromePathX86) ? chromePathX86 : 'chrome.exe');

  // 3. Flags to force a SEPARATE instance from your default session
  const flags = [
    `--user-data-dir=${profileDir}`, 
    '--remote-debugging-port=9223', // SWITCHED TO 9223 TO AVOID COLLISION
    '--remote-debugging-address=0.0.0.0', 
    '--remote-allow-origins=*',
    '--no-first-run',
    '--no-default-browser-check',
    '--new-window', 
    url
  ];

  console.log(`Launching: ${chromeExe} with data at ${profileDir}`);

  // 4. Launch as a completely detached Process
  const child = spawn(chromeExe, flags, {
    detached: true,
    stdio: 'ignore',
    shell: false // Use false to prevent cmd.exe from interfering with flags
  });

  child.unref();

  return { success: true, profile: profileDir };
});

// Dedicated handler: launch Chrome with ONLY the debug port, no URL navigation
// Used by the scout auto-retry flow
ipcMain.handle('launch-chrome-debug', async (event, { userId }) => {
  console.log(`🔧 Auto-launching Chrome for debug on port 9223 — user: ${userId}`);

  const profileDir = path.join(app.getPath('userData'), 'drafted.job', userId.replace(/[@.]/g, '_'));
  if (!fs.existsSync(profileDir)) fs.mkdirSync(profileDir, { recursive: true });

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chromePathX86 = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
  const chromeExe = fs.existsSync(chromePath) ? chromePath : (fs.existsSync(chromePathX86) ? chromePathX86 : 'google-chrome');

  const flags = [
    `--user-data-dir=${profileDir}`,
    '--remote-debugging-port=9223',
    '--remote-debugging-address=0.0.0.0',
    '--remote-allow-origins=*',
    '--no-first-run',
    '--no-default-browser-check',
    // Open a blank tab — no URL needed, scout will navigate
    'about:blank'
  ];

  const child = spawn(chromeExe, flags, { detached: true, stdio: 'ignore', shell: false });
  child.unref();

  console.log(`✅ Chrome launched at port 9223, profile: ${profileDir}`);
  return { success: true, profile: profileDir };
});

ipcMain.handle('open-external-browser', async (event, url) => {
  console.log(`🌍 Opening external link: ${url}`);
  if (url) {
    shell.openExternal(url);
  }
  return { success: true };
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
