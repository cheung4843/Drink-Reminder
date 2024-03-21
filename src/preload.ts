// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
// window.addEventListener("DOMContentLoaded", () => {
//   const replaceText = (selector: string, text: string) => {
//     const element = document.getElementById(selector);
//     if (element) {
//       element.innerText = text;
//     }
//   };

//   for (const type of ["chrome", "node", "electron"]) {
//     replaceText(`${type}-version`, process.versions[type as keyof NodeJS.ProcessVersions]);
//   }
// });

import { contextBridge, ipcRenderer } from "electron";

declare global {
  interface Window {
    electronAPI: any;
  }
}

contextBridge.exposeInMainWorld('electronAPI', {
  openSettingsWindow: () => ipcRenderer.invoke('open-settings-window'),
  saveSettings: (settings: object) => ipcRenderer.invoke('save-settings', settings),
  getSettingsValue: (key: string) => ipcRenderer.invoke('get-settings-value', key),
  saveDrinkingData: (data: object) => ipcRenderer.invoke('save-drinking-data', data),
  getDrinkingData: (key: string) => ipcRenderer.invoke('get-drinking-data', key),
  updateWaterDataFromSettings: () => ipcRenderer.invoke('update-water-data-from-settings'),
  // 由 settings_renderer.ts 呼叫 updateWaterDataFromSettings，
  // 再由 main.ts 呼叫 mainWindow.webContents.send('update-water-data')，
  // 最後由 renderer.ts 藉由 onUpdateWaterData 來接收，callback 是 DrinkingHelper 的 updateWaterData 方法
  onUpdateWaterData: (callback: Function) => ipcRenderer.on('update-water-data', () => callback())
});
