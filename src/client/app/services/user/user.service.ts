import { Injectable } from '@angular/core';
import { factory } from '@cinerino/api-javascript-client';
import { SaveType, StorageService } from '../storage/storage.service';

export interface IData {
    contact?: factory.person.IProfile;
    creditCards?: factory.paymentMethod.paymentCard.creditCard.ICheckedCard[];
    accessToken?: string;
    account?: factory.pecorino.account.IAccount<factory.accountType.Point>;
}

@Injectable()
export class UserService {
    public data: IData;

    constructor(
        private storage: StorageService,
        // private cinerino: CinerinoService
    ) {
        this.load();
        this.save();
    }

    /**
     * 読み込み
     * @method load
     */
    public load() {
        const data: IData | null = this.storage.load('user', SaveType.Session);
        if (data === null) {
            this.data = {};

            return;
        }
        this.data = data;
    }

    /**
     * 保存
     * @method save
     */
    public save() {
        this.storage.save('user', this.data, SaveType.Session);
    }

    /**
     * リセット
     * @method reset
     */
    public reset() {
        this.data = {};
        this.save();
    }

    /**
     * クレジットカード登録判定
     */
    public isRegisteredCreditCards() {
        return (this.data.creditCards !== undefined
            && this.data.creditCards.length > 0);
    }

}
