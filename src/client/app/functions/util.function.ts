import * as libphonenumber from 'libphonenumber-js';

/**
 * 電話番号変換
 */
export function formatTelephone(telephone: string, format?: libphonenumber.NumberFormat) {
    if (telephone === undefined) {
        return '';
    }
    const parsedNumber = (new RegExp(/^\+/).test(telephone))
        ? libphonenumber.parse(telephone)
        : libphonenumber.parse(telephone, 'JP');
    format = (format === undefined) ? 'International' : format;

    return libphonenumber.format(parsedNumber, format).replace(/\s/g, '');
}

/**
 * 全角変換
 */
export function toFull(value: string) {
    return value.replace(/[A-Za-z0-9]/g, (s) => {
        return String.fromCharCode(s.charCodeAt(0) + 65248);
    });
}

/**
 * 半角変換
 */
export function toHalf(value: string) {
    return value.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function (s) {
        return String.fromCharCode(s.charCodeAt(0) - 65248);
    });
}

/**
 * リトライ
 * @param args
 */
export async function retry<T>(args: {
    process: Function;
    interval: number;
    limit: number;
}) {
    let count = 0;
    return new Promise<T>(async (resolve, reject) => {
        const timerProcess = () => {
            setTimeout(async () => {
                count++;
                try {
                    const result = await args.process();
                    resolve(result);
                } catch (error) {
                    if (count >= args.limit) {
                        reject(error);
                        return;
                    }
                    timerProcess();
                }
            }, args.interval);
        };
        try {
            const result = await args.process();
            resolve(result);
        } catch (error) {
            timerProcess();
        }
    });
}

/**
 * ミリ秒待つ
 * デフォルト値3000ms
 */
export async function sleep(time: number = 3000) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, time);
    });
}

/**
 * ファイル存在判定
 */
export async function isFile(url: string) {
    const fetchResult = await fetch(url, {
        method: 'GET',
        cache: 'no-cache',
        headers: {
            'Content-Type': 'charset=utf-8'
        },
    });
    return (fetchResult.ok);
}
