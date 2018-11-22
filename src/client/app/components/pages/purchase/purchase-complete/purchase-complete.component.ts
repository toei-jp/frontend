import { Component, OnInit } from '@angular/core';
import { factory } from '@cinerino/api-javascript-client';
import * as moment from 'moment';
import { environment } from '../../../../../environments/environment';
import { TimeFormatPipe } from '../../../../pipes/time-format/time-format.pipe';
import {
    ErrorService,
    PurchaseService,
    SaveType,
    StorageService,
    UserService
} from '../../../../services';

@Component({
    selector: 'app-purchase-complete',
    templateUrl: './purchase-complete.component.html',
    styleUrls: ['./purchase-complete.component.scss']
})
export class PurchaseCompleteComponent implements OnInit {
    public data: {
        order: factory.order.IOrder;
        transaction: factory.transaction.placeOrder.ITransaction;
        movieTheaterOrganization: factory.organization.movieTheater.IOrganization;
        // sendEmailNotification?: factory.task.sendEmailMessage.ITask
    };
    public environment = environment;
    public entryExplanationModal: boolean;

    constructor(
        private storage: StorageService,
        private error: ErrorService,
        public purchase: PurchaseService,
        public user: UserService
    ) { }

    public ngOnInit() {
        window.scrollTo(0, 0);
        this.entryExplanationModal = false;
        this.data = this.storage.load('complete', SaveType.Session);
        if (this.data === null) {
            this.error.redirect(new Error('complete data is null'));
        }
        /*if (this.data.sendEmailNotification === undefined) {
            this.mailSendProcess(0).then().catch();
        }*/
    }

    /**
     * 印刷
     * @method print
     */
    public print() {
        print();
    }

    /**
     * 劇場名取得
     * @method getTheaterName
     * @returns {string}
     */
    public getTheaterName() {
        const itemOffered = this.data.order.acceptedOffers[0].itemOffered;
        if (itemOffered.typeOf !== factory.chevre.reservationType.EventReservation) {
            return '';
        }

        return itemOffered.reservationFor.superEvent.location.name.ja;
    }

    /**
     * スクリーン名取得
     * @method getScreenName
     * @returns {string}
     */
    public getScreenName() {
        const itemOffered = this.data.order.acceptedOffers[0].itemOffered;
        if (itemOffered.typeOf !== factory.chevre.reservationType.EventReservation) {
            return '';
        }

        return itemOffered.reservationFor.location.name.ja;
    }

    /**
     * 作品名取得
     * @method getTitle
     * @returns {string}
     */
    public getTitle() {
        const itemOffered = this.data.order.acceptedOffers[0].itemOffered;
        if (itemOffered.typeOf !== factory.chevre.reservationType.EventReservation) {
            return '';
        }

        return itemOffered.reservationFor.name.ja;
    }

    /**
     * 鑑賞日取得
     * @method getAppreciationDate
     * @returns {string}
     */
    public getAppreciationDate() {
        const itemOffered = this.data.order.acceptedOffers[0].itemOffered;
        if (itemOffered.typeOf !== factory.chevre.reservationType.EventReservation) {
            return '';
        }
        moment.locale('ja');

        return moment(itemOffered.reservationFor.startDate).format('YYYY年MM月DD日(ddd)');
    }

    /**
     * 上映開始時間取得
     * @method getStartDate
     * @returns {string}
     */
    public getStartDate() {
        const itemOffered = this.data.order.acceptedOffers[0].itemOffered;
        if (itemOffered.typeOf !== factory.chevre.reservationType.EventReservation) {
            return '';
        }
        return new TimeFormatPipe().transform(itemOffered.reservationFor.startDate);
    }

    /**
     * 上映終了取得
     * @method getEndDate
     * @returns {string}
     */
    public getEndDate() {
        const itemOffered = this.data.order.acceptedOffers[0].itemOffered;
        if (itemOffered.typeOf !== factory.chevre.reservationType.EventReservation) {
            return '';
        }
        return new TimeFormatPipe().transform(itemOffered.reservationFor.endDate);
    }

    /**
     * 照会URL取得
     * @method getInquiryUrl
     * @returns {string}
     */
    public getInquiryUrl() {
        const params = `theater=${this.data.movieTheaterOrganization.location.branchCode}&reserve=${this.data.order.confirmationNumber}`;
        return `/inquiry/login?${params}`;
    }

}
