const { app, BrowserWindow, dialog } = require('electron');
const { spawn } = require('child_process');
const path = require('path');

const isDev = !app.isPackaged;
let serverProcess;
let mainWindow;

function startServer() {
  if (isDev) {
    // DEVELOPMENT
    const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    serverProcess = spawn(npmCmd, ['run', 'server'], { 
      shell: true, 
      env: { ...process.env, PORT: 3000, NODE_ENV: 'development' } 
    });
  } else {
    // PRODUCTION (.exe)
    const serverDir = path.join(process.resourcesPath, 'dist_api');
    const serverPath = path.join(serverDir, 'SQL.js');
    const dbPath = path.join(process.resourcesPath, 'mydb.db');
    
    // Point to the physical node_modules folder we moved in extraResources
    const nodeModulesPath = path.join(process.resourcesPath, 'node_modules');

    serverProcess = spawn('node', [serverPath], { 
      shell: true,
      cwd: serverDir,
      env: { 
        ...process.env, 
        NODE_PATH: nodeModulesPath, // This fixes 'Cannot find module express'
        DB_PATH: dbPath,
        PORT: 3000,
        NODE_ENV: 'production'
      } 
    });
  }

  serverProcess.stderr.on('data', (data) => {
    const errorMsg = data.toString();
    console.error(`[API ERROR]: ${errorMsg}`);
    if (!isDev) {
      dialog.showErrorBox("Backend Server Error", errorMsg);
    }
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "SSO Management",
    webPreferences: { nodeIntegration: true, contextIsolation: false }
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:8080/#/emp'); 
  } else {
    const indexPath = path.join(__dirname, 'dist', 'index.html');
    mainWindow.loadURL(`file://${indexPath}#/emp`);
  }
}

app.whenReady().then(() => {
  startServer();
  createWindow();
});

app.on('window-all-closed', () => {
  if (serverProcess) {
    if (process.platform === 'win32') {
      spawn("taskkill", ["/pid", serverProcess.pid, "/f", "/t"]);
    } else {
      serverProcess.kill();
    }
  }
  if (process.platform !== 'darwin') app.quit();
});