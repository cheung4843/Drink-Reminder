// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process unless
// nodeIntegration is set to true in webPreferences.
// Use preload.js to selectively enable features
// needed in the renderer process.

class SettingButton {
    private button: HTMLButtonElement;

    constructor(ButtonId: string) {
        this.button = document.getElementById(ButtonId) as HTMLButtonElement;
        this.button.addEventListener('click', () => {
            window.electronAPI.openSettingsWindow();
            console.log('click settings button');
        })
    }

}

class DrinkingHelper {
    private drinkWaterBtn: HTMLButtonElement;
    private currentWaterDiv: HTMLDivElement;
    private targetWaterDiv: HTMLDivElement;

    private perClick: number;
    private targetWater: number;
    private currentWater: number;

    constructor() {
        this.drinkWaterBtn = document.getElementById("drinkWaterButton") as HTMLButtonElement;
        this.currentWaterDiv = document.getElementById("currentWater") as HTMLDivElement;
        this.targetWaterDiv = document.getElementById("targetWater") as HTMLDivElement;

        this.updateWaterData();

        // 每次點喝水後更新資料
        this.drinkWaterBtn.addEventListener('click', this.drinkWater.bind(this));
        // 每次設定更新後更新資料
        window.electronAPI.onUpdateWaterData(this.updateWaterData.bind(this));

    }

    private async updateWaterData(): Promise<void> {
        this.perClick = await window.electronAPI.getSettingsValue('perClick') as number;
        this.currentWater = await window.electronAPI.getDrinkingData('currentWater') as number;
        this.targetWater = await window.electronAPI.getSettingsValue('dailyGoal') as number;

        this.drinkWaterBtn.textContent = `+${this.perClick}ml`;
        this.currentWaterDiv.textContent = `目前喝了:${this.currentWater}ml`;
        this.targetWaterDiv.textContent = `目標:${this.targetWater}ml`;
    }

    private drinkWater(): void {
        const newCurrentWater = this.currentWater + this.perClick;
        window.electronAPI.saveDrinkingData({ currentWater: newCurrentWater });

        this.updateWaterData();
    }


}

class DrinkReminder {
    private secsToCountDown: number;
    private reminderInterval: number;
    private interval: NodeJS.Timeout;
    private timeDisplayDiv: HTMLDivElement;

    constructor() {
        this.initializeCountDown();
    }

    private async initializeCountDown(): Promise<void> {
        this.reminderInterval = await window.electronAPI.getSettingsValue('reminderInterval') as number;
        console.log(this.reminderInterval);
        this.secsToCountDown = this.reminderInterval * 60;
        this.timeDisplayDiv = document.getElementById('timeDisplyDiv') as HTMLDivElement;
    }

    public startCountDown(): void {
        this.interval = setInterval(this.updateCountDown.bind(this), 1000);
    }

    private async updateCountDown(): Promise<void> {
        this.secsToCountDown -= 1;
        this.updateTimeDisplay();
        if (this.secsToCountDown <= 0) {
            window.electronAPI.notify('喝水時間到', '該喝水了');
            this.secsToCountDown = this.reminderInterval * 60;
        }
    }

    private async updateTimeDisplay(): Promise<void> {
        const mins = Math.floor(this.secsToCountDown / 60);
        const secs = this.secsToCountDown % 60;
        this.timeDisplayDiv.textContent = `${mins}:${secs}`;
    }

}


let settingBtn = new SettingButton('settings');
let drinkingHelper = new DrinkingHelper();
let drinkReminder = new DrinkReminder();
drinkReminder.startCountDown();