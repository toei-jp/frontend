/**
 * CallNativeService
 */
import { Injectable } from '@angular/core';

@Injectable()
export class CallNativeService {

    constructor() { }

    /**
     * @method postMessage
     * @param data {any}
     */
    private postMessage(data: any) {
        const TARGET_VIEW = 'mainView';
        try {
            const json: string = JSON.stringify(data);
            (<any>window).wizViewMessenger.postMessage(json, TARGET_VIEW);
        } catch (err) {
            console.error(err);
        }
    }

    /**
     * inAppBrowser呼び出し
     * @method postMessage
     * @param args {IinAppBrowserArgs}
     */
    public inAppBrowser(args: IinAppBrowserArgs) {
        try {
            const data = {
                method: 'inAppBrowser',
                option: args
            };
            this.postMessage(data);
        } catch (err) {
            console.error(err);
        }
    }

    /**
     * localNotification呼び出し
     * @method localNotification
     * @param args {IlocalNotificationArgs}
     */
    public localNotification(args: IlocalNotificationArgs) {
        try {
            const data = {
                method: 'localNotification',
                option: args
            };
            this.postMessage(data);
        } catch (err) {
            console.error(err);
        }
    }
}

/**
 * URLの読み込み先として使用するブラウザーの種別。
 */
export enum InAppBrowserTarget {
    /**
     * ホワイトリストに対象の URL が登録されている場合には、Cordova WebView を開きます。それ以外の場合には、InAppBrowser を開きます。
     */
    Self = '_self',
    /**
     * InAppBrowser を開きます。
     */
    Blank = '_blank',
    /**
     * システム標準の Web ブラウザー ( system’s web browser ) を開きます。
     */
    System = '_system'
}

/**
 * IinAppBrowserArgs
 */
export interface IinAppBrowserArgs {
    /**
     * URL
     */
    url: string;
    /**
     * URLの読み込み先として使用するブラウザーの種別（デフォルトはシステム標準の Web ブラウザー）
     */
    target?: InAppBrowserTarget;
}

/**
 * localNotificationArgs
 */
export interface IlocalNotificationArgs {
    /**
     * ID
     */
    id: number;
    /**
     * タイトル
     */
    title: string;
    /**
     * テキスト
     */
    text: string;
    /**
     * 通知トリガー
     */
    trigger?: {
        /**
         * 通知を送る時間（ISO）
         */
        at: string
    };
    /**
     * アイコンの画像パス
     */
    icon?: string;
    /**
     * スモールアイコンの画像パス
     */
    smallIcon?: string;
    /**
     * 前面表示（デフォルトは前面表示しない）
     */
    foreground?: boolean;
}

