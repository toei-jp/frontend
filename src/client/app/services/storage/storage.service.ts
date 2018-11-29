/**
 * StorageService
 */
import { Injectable } from '@angular/core';
import * as moment from 'moment';

export enum SaveType {
    /**
     * セッションへ保存
     */
    Session = 0,
    /**
     * ローカルへ保存
     */
    Local = 1
}

@Injectable()
export class StorageService {

    constructor() {}

    public load(key: string, saveType?: SaveType): any {
        const storage = (saveType === SaveType.Session) ? sessionStorage : localStorage;
        const value = storage.getItem(key);

        return (value !== null) ? JSON.parse(value) : null;
    }

    public save(key: string, value: any, saveType?: SaveType): void {
        value.updateAt = moment().toISOString();
        const storage = (saveType === SaveType.Session) ? sessionStorage : localStorage;
        try {
            storage.setItem(key, JSON.stringify(value));
        } catch (err) {
            console.error('StorageService.save', err);
        }
    }

    public remove(key: string, saveType?: SaveType): void {
        const storage = (saveType === SaveType.Session) ? sessionStorage : localStorage;
        storage.removeItem(key);
    }

}
