const { app, BrowserWindow, dialog } = require('electron');
const { spawn } = require('child_process');
const path = require('path');

const isDev = !app.isPackaged;
let serverProcess;
let mainWindow;

function startServer() {
  if (isDev) {
    // --- DEVELOPMENT MODE ---
    const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    serverProcess = spawn(npmCmd, ['run', 'server'], { 
      shell: true, 
      env: { ...process.env, PORT: 3000, NODE_ENV: 'development' } 
    });
  } else {
    // --- PRODUCTION MODE (.exe) ---
    
    // 1. Define paths relative to the Resources folder
    const serverDir = path.join(process.resourcesPath, 'dist_api');
    const serverPath = path.join(serverDir, 'SQL.js');
    const dbPath = path.join(process.resourcesPath, 'mydb.db');
    
    /**
     * 2. The "Express" Fix:
     * When using asarUnpack in package.json, electron-builder moves 
     * specified modules to 'app.asar.unpacked/node_modules'.
     * We point NODE_PATH there so the spawned 'node' process can find Express.
     */
    const nodeModulesPath = path.join(process.resourcesPath, 'app.asar.unpacked', 'node_modules');

    serverProcess = spawn('node', [serverPath], { 
      shell: true,
      cwd: serverDir,
      env: { 
        ...process.env, 
        NODE_PATH: nodeModulesPath, // Tell Node where the 'express' folder is
        DB_PATH: dbPath,
        PORT: 3000,
        NODE_ENV: 'production'
      } 
    });
  }

  // Error Handling for the Backend
  serverProcess.stderr.on('data', (data) => {
    const errorMsg = data.toString();
    console.error(`[API ERROR]: ${errorMsg}`);
    
    // If it's still failing, this dialog will tell us exactly why
    if (!isDev) {
      dialog.showErrorBox("Backend Server Error", errorMsg);
    }
  });

  serverProcess.on('exit', (code) => {
    console.log(`Backend process exited with code ${code}`);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "SSO Management",
    webPreferences: { 
      nodeIntegration: true, 
      contextIsolation: false 
    }
  });

  if (isDev) {
    // Vite dev server
    mainWindow.loadURL('http://localhost:8080/#/emp'); 
  } else {
    // Load local build
    const indexPath = path.join(__dirname, 'dist', 'index.html');
    mainWindow.loadURL(`file://${indexPath}#/emp`);
  }
}

app.whenReady().then(() => {
  startServer();
  createWindow();
});

// Cleanup processes on exit
app.on('window-all-closed', () => {
  if (serverProcess) {
    if (process.platform === 'win32') {
      // Force kill the process tree on Windows
      spawn("taskkill", ["/pid", serverProcess.pid, "/f", "/t"]);
    } else {
      serverProcess.kill();
    }
  }
  if (process.platform !== 'darwin') app.quit();
});