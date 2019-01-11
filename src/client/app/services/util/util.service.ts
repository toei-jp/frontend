import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class UtilService {

    constructor(
        private http: HttpClient
    ) { }

    /**
     * @method getServerDate
     */
    public async getServerDate() {
        const url = '/api/getServerDate';
        const body = {};
        const result = await this.http.get<{ date: string }>(url, body).toPromise();
        return result;
    }

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
