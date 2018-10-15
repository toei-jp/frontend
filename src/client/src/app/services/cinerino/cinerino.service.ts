import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as mvtkReserve from '@motionpicture/mvtk-reserve-service';
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
    // public place: cinerino.service.Place;
    public transaction: {
        placeOrder: cinerino.service.transaction.PlaceOrder
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
            // this.place = new cinerino.service.Place(option);
            this.transaction = {
                placeOrder: new cinerino.service.transaction.PlaceOrder(option)
            };
            console.log(this);
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

    /**
     * ムビチケ照会
     * @param {mvtkReserve.services.auth.purchaseNumberAuth.IPurchaseNumberAuthIn} args
     */
    public async mvtkPurchaseNumberAuth(
        args: mvtkReserve.services.auth.purchaseNumberAuth.IPurchaseNumberAuthIn
    ) {
        const url = `${environment.API_ENDPOINT}/api/purchase/mvtkPurchaseNumberAuth`;

        return this.http.post<mvtkReserve.services.auth.purchaseNumberAuth.IPurchaseNumberAuthResult>(url, args).toPromise();
    }

    /**
     * ムビチケ座席指定情報連携
     * @param {mvtkReserve.services.seat.seatInfoSync.ISeatInfoSyncIn} args
     */
    public async mvtksSeatInfoSync(
        args: mvtkReserve.services.seat.seatInfoSync.ISeatInfoSyncIn
    ) {
        const url = `${environment.API_ENDPOINT}/api/purchase/mvtksSeatInfoSync`;


        return this.http.post<mvtkReserve.services.seat.seatInfoSync.ISeatInfoSyncResult>(url, args).toPromise();
    }

    /**
     * 座席ステータス取得
     * @param { eventId: string } args
     */
    public async getSeatState(
        args: { eventId: string }
    ) {
        const url = `${environment.API_ENDPOINT}/api/purchase/getSeatState`;

        return this.http.get<cinerino.factory.chevre.event.screeningEvent.IScreeningRoomSectionOffer[]>(url, {
            params: <any>args
        }).toPromise();
    }

    public async findMovieTheaterByBranchCode(args: { branchCode: string } ) {
        const url = `${environment.API_ENDPOINT}/api/purchase/findMovieTheaterByBranchCode`;

        return this.http.get<cinerino.factory.chevre.place.movieTheater.IPlace>(url, {
            params: <any>args
        }).toPromise();
    }

    /**
     * ムビチケ券種取得
     * @param {ticketCode: string} args
     */
    public async mvtkTicket(
        args: { ticketCode: string }
    ) {
        const url = `${environment.API_ENDPOINT}/api/purchase/mvtkTicket`;
        return this.http.get<{ name: string; code: string }>(url, {
            params: args
        }).toPromise();
    }

    /**
     * 券種取得
     * @method getSalesTickets
     * @param {cinerino.factory.chevre.services.reserve.ISalesTicketArgs} args
     */
    /*public async getSalesTickets(
        args: cinerino.factory.chevre.services.reserve.ISalesTicketArgs
    ) {
        const url = `${environment.API_ENDPOINT}/api/master/getSalesTickets`;
        return this.http.get<cinerino.factory.chevre.services.reserve.ISalesTicketResult[]>(url, {
            params: <any>args
        }).toPromise();
    }*/

    /**
     * 券種マスター一覧取得
     * @method getTickets
     * @param {cinerino.factory.chevre.services.reserve.ITicketArgs} args
     */
    /*public async getTickets(
        args: cinerino.factory.chevre.services.master.ITicketArgs
    ) {
        const url = `${environment.API_ENDPOINT}/api/master/getTickets`;
        return this.http.get<cinerino.factory.chevre.services.master.ITicketResult[]>(url, {
            params: <any>args
        }).toPromise();
    }*/

}
