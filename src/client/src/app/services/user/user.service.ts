import { Injectable } from '@angular/core';
import { factory } from '@toei-jp/cinerino-api-javascript-client';
import { CinerinoService } from '../cinerino/cinerino.service';
import { SaveType, StorageService } from '../storage/storage.service';

/**
 * ネイティブアプリフラグ
 */
enum NativeAppFlg {
    /**
     * 非ネイティブアプリ
     */
    NotNative = '0',
    /**
     * ネイティブアプリ
     */
    Native = '1'
}

/**
 * 会員用フラグ
 */
export enum FlgMember {
    /**
     * 非会員
     */
    NonMember = '0',
    /**
     * 会員
     */
    Member = '1',
}

export interface IData {
    native: NativeAppFlg;
    memberType: FlgMember;
    contact?: factory.person.IContact;
    creditCards?: factory.paymentMethod.paymentCard.creditCard.ICheckedCard[];
    accessToken?: string;
    account?: factory.pecorino.account.IAccount<factory.accountType.Point>;
}

@Injectable()
export class UserService {
    public data: IData;

    constructor(
        private storage: StorageService,
        private cinerino: CinerinoService
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
            this.data = {
                native: NativeAppFlg.NotNative,
                memberType: FlgMember.NonMember
            };

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
        this.data = {
            native: NativeAppFlg.NotNative,
            memberType: FlgMember.NonMember
        };
        this.save();
    }

    /**
     * 会員初期化
     */
    public async initMember() {
        this.data.memberType = FlgMember.Member;
        this.save();
        await this.cinerino.getServices();
        // 連絡先取得
        const contact = await this.cinerino.person.getContacts({
            personId: 'me'
        });
        if (contact === undefined) {
            throw new Error('contact is undefined');
        }
        this.data.contact = contact;

        try {
            // クレジットカード検索
            const creditCards = await this.cinerino.person.findCreditCards({
                personId: 'me'
            });
            this.data.creditCards = creditCards;
        } catch (err) {
            console.error(err);
            this.data.creditCards = [];
        }

        // 口座検索
        let accounts = await this.cinerino.person.findAccounts({
            personId: 'me'
        });
        accounts = accounts.filter((account) => {
            return account.status === factory.pecorino.accountStatusType.Opened;
        });
        if (accounts.length === 0) {
            // 口座開設
            this.data.account = await this.cinerino.person.openAccount({
                personId: 'me',
                name: `${this.data.contact.familyName} ${this.data.contact.givenName}`
            });
        } else {
            this.data.account = accounts[0];
        }
        // console.log('口座番号', this.data.account.accountNumber);

        this.save();
    }

    /**
     * クレジットカード登録判定
     */
    public isRegisteredCreditCards() {
        return (this.data.creditCards !== undefined
            && this.data.creditCards.length > 0);
    }

    /**
     * ネイティブアプリ判定
     */
    public isNative() {
        return (this.data.native === NativeAppFlg.Native);
    }

    /**
     * 会員判定
     */
    public isMember() {
        return (this.data.memberType === FlgMember.Member);
    }

    /**
     * ネイティブアプリ判定設定
     */
    public setNative(value?: string) {
        this.data.native = (value === NativeAppFlg.Native)
            ? NativeAppFlg.Native
            : NativeAppFlg.NotNative;
    }

}
