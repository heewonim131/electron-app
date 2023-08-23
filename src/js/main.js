// Modules to control application life and create native browser window
const { app, ipcMain, BrowserWindow } = require('electron')
const path = require('path')
const log = require('electron-log');
const { autoUpdater } = require('electron-updater');

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.db');

db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL
  );
`);

// Insert a new user
const insertUser = db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)');

// Query users by username
const getUsers = 'SELECT * FROM users WHERE username = ?';

const adminUsers = ['ci.lee', 'mh.heo', 'bg.lee', 'sh.jeong', 'dh.cha', 'je.shin', 'hw.im', 'sh.park', 'wc.lee', 'js.do', 'js.ahn'];
adminUsers.forEach((username) => {
  db.all(getUsers, username, (err, rows) => {
    if (err) throw err;
    if (rows.length === 0) {
      insertUser.run(username, '1234', 'admin');
    }
  });
});

// IPC handler for validating user credentials during login
ipcMain.handle('validate-credentials', async (event, username, password) => {
  return new Promise((resolve, reject) => {
    db.all(getUsers, username, (err, rows) => {
      if (err) throw err;
      if (rows.length > 0) {
        const user = rows[0];
        if (user.password === password) {
          resolve(true);
        }
      }
      resolve(false);
    });
  });
});
ipcMain.handle('signup-user', async (event, username, password) => {
  return new Promise((resolve, reject) => {
    db.all(getUsers, username, (err, rows) => {
      if (err) throw err;
      if (rows.length > 0) {
        resolve(false);
      } else {
        insertUser.run(username, password, 'user');
        resolve(true);
      }
    });
  });
});

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, '../html/index.html'))

  // Open the DevTools.
  mainWindow.webContents.openDevTools()
}

autoUpdater.on('checking-for-update', () => {
  log.info('업데이트 확인 중...');
});
autoUpdater.on('update-available', (info) => {
  log.info('업데이트가 가능합니다.');
});
autoUpdater.on('update-not-available', (info) => {
  log.info('현재 최신버전입니다.');
});
autoUpdater.on('error', (err) => {
  log.info('에러가 발생하였습니다. 에러내용 : ' + err);
});
autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "다운로드 속도: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - 현재 ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  log.info(log_message);
})
autoUpdater.on('update-downloaded', (info) => {
  log.info('업데이트가 완료되었습니다.');
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();
  autoUpdater.checkForUpdates();
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
