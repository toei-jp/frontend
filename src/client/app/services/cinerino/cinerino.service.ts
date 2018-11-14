import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as cinerino from '@toei-jp/cinerino-api-javascript-client';
import 'rxjs/add/operator/toPromise';
import { environment } from '../../../environments/environment';
import { SaveType, StorageService } from '../storage/storage.service';

@Injectable()
export class CinerinoService {
    public auth: cinerino.IImplicitGrantClient;
    public event: cinerino.service.Event;
    public order: cinerino.service.Order;
    public organization: cinerino.service.Organization;
    public person: cinerino.service.Person;
    public personOwnershipInfo: cinerino.service.person.OwnershipInfo;
    public payment: cinerino.service.Payment;
    public transaction: {
        placeOrder: cinerino.service.txn.PlaceOrder
    };

    constructor(
        private http: HttpClient,
        private storage: StorageService
    ) { }

    /**
     * getServices
     */
    public async getServices(): Promise<void> {
        try {
            const option = await this.createOption();
            this.event = new cinerino.service.Event(option);
            this.order = new cinerino.service.Order(option);
            this.organization = new cinerino.service.Organization(option);
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
            endpoint: environment.CINERINO_API_ENDPOINT,
            auth: this.auth
        };
    }

    /**
     * @method authorize
     */
    public async authorize() {
        const user = this.storage.load('user', SaveType.Session);
        const member = user.memberType;
        const url = '/api/authorize/getCredentials';
        const options = {
            headers: new HttpHeaders({
                'Pragma': 'no-cache',
                'Cache-Control': 'no-cache',
                'If-Modified-Since': new Date(0).toUTCString()
            }),
            params: new HttpParams().set('member', member)
        };
        const credentials = await this.http.get<any>(url, options).toPromise();
        const option = {
            domain: '',
            clientId: '',
            redirectUri: '',
            logoutUri: '',
            responseType: '',
            scope: '',
            state: '',
            nonce: null,
            tokenIssuer: ''
        };
        this.auth = cinerino.createAuthInstance(option);
        this.auth.setCredentials(credentials);
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

}
