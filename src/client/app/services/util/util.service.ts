import { Injectable } from '@angular/core';

@Injectable()
export class UtilService {

    constructor() { }

    /**
     * カタカナをひらがなへ変換
     * @param {string} str
     */
    public convertToHira(str: string) {
        return str.replace(/[\u30a1-\u30f6]/g, function (match) {
            const chr = match.charCodeAt(0) - 0x60;

            return String.fromCharCode(chr);
        });
    }

}
