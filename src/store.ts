import fs from 'fs';
import path from 'path';
import { app } from 'electron';

export class Store {
    private path: string;

    constructor(name: string) {
        const userDataPath = app.getPath('userData');
        this.path = path.join(userDataPath, `${name}.json`);
        this.ensureFile();
    }

    private ensureFile() {
        if (!fs.existsSync(this.path)) {
            fs.writeFileSync(this.path, JSON.stringify({}));
        }
    }

    public get(key: string): any {
        const data = this.readData();
        return data[key];
    }

    public set(key: string, value: any) {
        const data = this.readData();
        data[key] = value;
        fs.writeFileSync(this.path, JSON.stringify(data));
    }

    private readData(): any {
        return JSON.parse(fs.readFileSync(this.path, 'utf8'));
    }
}