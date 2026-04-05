const { app, BrowserWindow, ipcMain, shell, protocol } = require('electron');
const path = require('path');
const { exec, spawn } = require('child_process');
const os = require('os');
const fs = require('fs');
const { URL } = require('url');

const isDev = !app.isPackaged && process.env.NODE_ENV !== 'production';

// Register the custom "app" protocol
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true } }
]);

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
    // START HERE: Explicitly use "app://mission"
    console.log('📦 Production Mode: Loading app://mission/index.html');
    win.loadURL('app://mission/index.html');
  }

  // Handle errors
  win.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error(`❌ Load Failed: ${validatedURL} (${errorDescription})`);
  });
}

// IPC Handlers
ipcMain.handle('launch-browser', async (event, { userId, url, platform }) => {
  const profileDir = path.join(app.getPath('userData'), 'drafted.job', userId.replace(/[@.]/g, '_'));
  if (!fs.existsSync(profileDir)) fs.mkdirSync(profileDir, { recursive: true });
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chromePathX86 = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
  const chromeExe = fs.existsSync(chromePath) ? chromePath : (fs.existsSync(chromePathX86) ? chromePathX86 : 'chrome.exe');
  const flags = [`--user-data-dir=${profileDir}`, '--remote-debugging-port=9223', '--remote-debugging-address=0.0.0.0', '--remote-allow-origins=*', '--no-first-run', '--no-default-browser-check', '--new-window', url];
  const child = spawn(chromeExe, flags, { detached: true, stdio: 'ignore', shell: false });
  child.unref();
  return { success: true, profile: profileDir };
});

ipcMain.handle('launch-chrome-debug', async (event, { userId }) => {
  const profileDir = path.join(app.getPath('userData'), 'drafted.job', userId.replace(/[@.]/g, '_'));
  if (!fs.existsSync(profileDir)) fs.mkdirSync(profileDir, { recursive: true });
  const chromeExe = 'chrome.exe';
  const flags = [`--user-data-dir=${profileDir}`, '--remote-debugging-port=9223', '--remote-debugging-address=0.0.0.0', '--remote-allow-origins=*', '--no-first-run', '--no-default-browser-check', 'about:blank'];
  const child = spawn(chromeExe, flags, { detached: true, stdio: 'ignore', shell: false });
  child.unref();
  return { success: true, profile: profileDir };
});

ipcMain.handle('open-external-browser', async (event, url) => {
  if (url) shell.openExternal(url);
  return { success: true };
});

// NEW: Native Cookie Management for Auth Tokens
ipcMain.handle('set-auth-cookie', async (event, { name, value, expirationDate }) => {
  const { session } = require('electron');
  
  // We set it for the backend URL so it gets sent with API requests
  const backendUrl = 'http://localhost:5000';
  
  const cookie = {
    url: backendUrl,
    name: name,
    value: value,
    domain: 'localhost',
    path: '/',
    expirationDate: expirationDate || (Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 30)),
    sameSite: 'no_restriction',
    secure: false, // Set false for localhost
    httpOnly: false
  };

  try {
    // Set for backend
    await session.defaultSession.cookies.set(cookie);
    // Also set for local mission protocol so frontend can verify it
    await session.defaultSession.cookies.set({ ...cookie, url: 'app://mission', domain: undefined });
    
    console.log(`✅ Cookie Synchronized: ${name}`);
    return { success: true };
  } catch (error) {
    console.error(`❌ Cookie Sync Failed: ${error}`);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-auth-cookie', async (event, name) => {
  const { session } = require('electron');
  try {
    // Check both locations
    const cookies = await session.defaultSession.cookies.get({ url: 'http://localhost:5000', name });
    if (cookies.length > 0) return cookies[0].value;
    
    const localCookies = await session.defaultSession.cookies.get({ url: 'app://mission', name });
    return localCookies.length > 0 ? localCookies[0].value : null;
  } catch (error) {
    console.error(`❌ Cookie Get Failed: ${error}`);
    return null;
  }
});

app.whenReady().then(() => {
  // Protocol Handler
  protocol.handle('app', async (req) => {
    const url = new URL(req.url);
    let pathname = url.pathname;

    // 3. Map to the local file system
    let targetPath = path.join(__dirname, '../out', pathname === '/' ? 'index.html' : pathname);

    // 4. Directory Check: If it points to a folder, look for index.html inside it
    if (fs.existsSync(targetPath) && fs.lstatSync(targetPath).isDirectory()) {
      targetPath = path.join(targetPath, 'index.html');
    }

    // 5. Next.js Routing variants (for extension-less paths)
    if (!fs.existsSync(targetPath)) {
      if (!path.extname(targetPath)) {
        // Case 1: /login -> /login.html
        if (fs.existsSync(targetPath + '.html')) {
          targetPath += '.html';
        } 
        // Case 2: /login -> /login/index.html (if not caught by directory check)
        else if (fs.existsSync(path.join(targetPath, 'index.html'))) {
          targetPath = path.join(targetPath, 'index.html');
        }
      }
    }

    // 6. Final safety check: if still not found, return index.html (SPA Fallback)
    if (!fs.existsSync(targetPath)) {
      console.warn(`⚠️ Not found, falling back to index: ${targetPath}`);
      targetPath = path.join(__dirname, '../out/index.html');
    }

    console.log(`✅ Serving: ${targetPath}`);
    const { net } = require('electron');
    return net.fetch('file://' + targetPath);
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
