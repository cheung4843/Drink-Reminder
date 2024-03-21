console.log('settings_renderer.ts loaded');

class SettingsForm {
    private form: HTMLFormElement;
    private dailyGoalInput: HTMLInputElement;
    private perClickInput: HTMLInputElement;
    private reminderIntervalInput: HTMLInputElement;

    constructor(formId: string) {
        this.form = document.getElementById(formId) as HTMLFormElement;
        this.dailyGoalInput = document.getElementById('dailyGoal') as HTMLInputElement;
        this.perClickInput = document.getElementById('perClick') as HTMLInputElement;
        this.reminderIntervalInput = document.getElementById('reminderInterval') as HTMLInputElement;

        this.form.addEventListener('submit', this.handleSubmit.bind(this));
    }

    private async handleSubmit(event: Event): Promise<void> {
        event.preventDefault(); // 防止表單的預設行為

        const settings = {
            // 如果輸入框有值，就用輸入框的值，否則就用原本的值
            dailyGoal: this.dailyGoalInput.value ? parseInt(this.dailyGoalInput.value) : await window.electronAPI.getSettingsValue('dailyGoal'),
            perClick: this.perClickInput.value ? parseInt(this.perClickInput.value) : await window.electronAPI.getSettingsValue('perClick'),
            reminderInterval: this.reminderIntervalInput.value ? parseInt(this.reminderIntervalInput.value) : await window.electronAPI.getSettingsValue('reminderInterval'),
        };

        // 更新使用者設定
        window.electronAPI.saveSettings(settings);
        // 更新 index.html 的飲水資料
        window.electronAPI.updateWaterDataFromSettings();
    }
}

// Create a new instance of SettingsForm
const settingsForm = new SettingsForm('settingsForm');
