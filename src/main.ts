import { app, BrowserWindow, ipcMain } from "electron";
import * as path from "path";
import { Store } from './store';

let userSettings: Store;
let userDrinkingData: Store;

let mainWindow: BrowserWindow;
let settingsWindow: BrowserWindow;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },

  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, "../index.html"));

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();
  userSettings = new Store('user-settings');
  // 預設值: {"dailyGoal":"2000","perClick":"500","reminderInterval":"30"}
  userSettings.set('dailyGoal', 2000);
  userSettings.set('perClick', 500);
  userSettings.set('reminderInterval', 30);
  // userSettings.set('IsUsedCustomSettings', false);
  userDrinkingData = new Store('user-drinking-data');
  // 預設值
  userDrinkingData.set('currentWater', 0);

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
ipcMain.handle('open-settings-window', async (event) => {
  settingsWindow = new BrowserWindow({
    width: 500,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false,
    },
  });

  settingsWindow.loadFile(path.join(__dirname, "../settings.html"));
  console.log('Settings window opened');
  // settingsWindow.webContents.openDevTools();

  return 'Settings window opened';
});

ipcMain.handle('save-settings', async (event, settings: object) => {
  console.log('Received settings:', settings);
  // userSettings.set('dailyGoal', settings['dailyGoal']);
  // userSettings.set('perClick', settings['perClick']);
  // userSettings.set('reminderInterval', settings['reminderInterval']);
  Object.entries(settings).forEach(([key, value]) => {
    userSettings.set(key, value);
  });
  console.log(app.getPath('userData'));
  // console.log(userSettings.get('dailyGoal'));
  // console.log(userSettings.get('perClick'));
  // console.log(userSettings.get('reminderInterval'));
  // 保存設定到文件或應用程式狀態...
  return 'Settings saved';
});

ipcMain.handle('get-settings-value', async (event, key) => {
  return userSettings.get(key);
});

ipcMain.handle('save-drinking-data', async (event, data: object) => {
  console.log('Received drinking data:', data);
  Object.entries(data).forEach(([key, value]) => {
    userDrinkingData.set(key, value);
  });
  return 'Drinking data saved';

});

ipcMain.handle('get-drinking-data', async (event, key) => {
  return userDrinkingData.get(key);
});

ipcMain.handle('update-water-data-from-settings', async (event) => {
  mainWindow.webContents.send('update-water-data');
  // 更新 index.html 上的顯示資訊
  return 'Water data updated';
});