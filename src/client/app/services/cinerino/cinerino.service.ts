import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as cinerino from '@cinerino/api-javascript-client';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class CinerinoService {
    public auth: cinerino.IImplicitGrantClient;
    public event: cinerino.service.Event;
    public order: cinerino.service.Order;
    public seller: cinerino.service.Seller;
    public person: cinerino.service.Person;
    public personOwnershipInfo: cinerino.service.person.OwnershipInfo;
    public payment: cinerino.service.Payment;
    public transaction: {
        placeOrder: cinerino.service.txn.PlaceOrder
    };
    private endpoint: string;
    private waiterServerUrl: string;

    constructor(
        private http: HttpClient
    ) { }

    /**
     * getServices
     */
    public async getServices(): Promise<void> {
        try {
            const option = await this.createOption();
            this.event = new cinerino.service.Event(option);
            this.order = new cinerino.service.Order(option);
            this.seller = new cinerino.service.Seller(option);
            this.person = new cinerino.service.Person(option);
            this.payment = new cinerino.service.Payment(option);
            this.transaction = {
                placeOrder: new cinerino.service.txn.PlaceOrder(option)
            };
        } catch (err) {
            console.error(err);
            throw new Error('getServices is failed');
        }
    }

    /**
     * @method createOption
     */
    public async createOption() {
        await this.authorize();
        return {
            endpoint: this.endpoint,
            auth: this.auth
        };
    }

    /**
     * @method authorize
     */
    public async authorize() {
        const url = '/api/authorize/getCredentials';
        const body = {};
        const result = await this.http.post<{
            accessToken: string;
            userName: string;
            clientId: string;
            endpoint: string;
            waiterServerUrl: string;
        }>(url, body).toPromise();
        const option = {
            domain: '',
            clientId: result.clientId,
            redirectUri: '',
            logoutUri: '',
            responseType: '',
            scope: '',
            state: '',
            nonce: null,
            tokenIssuer: ''
        };
        this.auth = cinerino.createAuthInstance(option);
        this.auth.setCredentials({ accessToken: result.accessToken });
        this.endpoint = result.endpoint;
        this.waiterServerUrl = result.waiterServerUrl;
    }

    /**
     * サインイン
     */
    public async signIn() {
        const url = '/api/authorize/signIn';
        const result = await this.http.get<any>(url, {}).toPromise();
        // console.log(result.url);
        location.href = result.url;
    }

    /**
     * パスポート取得
     */
    public async getPassport(selleId: string) {
        if (this.waiterServerUrl === undefined
            || this.waiterServerUrl === '') {
            return { token: '' };
        }
        const url = this.waiterServerUrl;
        const body = { scope: `Transaction:PlaceOrder:${selleId}` };
        const result = await this.http.post<{ token: string; }>(url, body).toPromise();

        return result;
    }

}
