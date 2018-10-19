import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { factory } from '@toei-jp/cinerino-api-javascript-client';
import { ErrorService } from '../../../services/error/error.service';
import { PurchaseService } from '../../../services/purchase/purchase.service';

type IMovieTicketTypeChargeSpecification =
    factory.chevre.priceSpecification.IPriceSpecification<factory.chevre.priceSpecificationType.MovieTicketTypeChargeSpecification>;

@Component({
    selector: 'app-purchase-mvtk-confirm',
    templateUrl: './purchase-mvtk-confirm.component.html',
    styleUrls: ['./purchase-mvtk-confirm.component.scss']
})
export class PurchaseMvtkConfirmComponent implements OnInit {
    public movieTickets: {
        identifier: string;
        num: string;
        name: string;
    }[];
    constructor(
        public purchase: PurchaseService,
        private router: Router,
        private error: ErrorService
    ) { }

    public ngOnInit() {
        window.scrollTo(0, 0);
        if (this.purchase.data.mvtkTickets.length === 0) {
            this.error.redirect(new Error('status is different'));
        }
        this.movieTickets = [];
        const checkMovieTicketActions = this.purchase.data.mvtkTickets;
        checkMovieTicketActions.forEach((checkMovieTicketAction) => {
            if (checkMovieTicketAction.result === undefined) {
                return;
            }
            if (checkMovieTicketAction.result.purchaseNumberAuthResult.knyknrNoInfoOut === null) {
                return;
            }
            checkMovieTicketAction.result.purchaseNumberAuthResult.knyknrNoInfoOut.forEach((knyknrNoInfoOut) => {
                if (knyknrNoInfoOut.ykknInfo === null) {
                    return;
                }
                knyknrNoInfoOut.ykknInfo.forEach((ykknInfo) => {
                    this.movieTickets.push({
                        identifier: knyknrNoInfoOut.knyknrNo,
                        num: ykknInfo.ykknKnshbtsmiNum,
                        name: this.getTicketName(ykknInfo.ykknshTyp)
                    });
                });
            });
        });
    }

    public getTicketName(serviceType: string) {
        const findTicketResult = this.purchase.data.salesTickets.find((salesTicket) => {
            const MovieTicketTypeChargeSpecification =
                <IMovieTicketTypeChargeSpecification>salesTicket.priceSpecification.priceComponent
                    .filter((s) => s.typeOf === factory.chevre.priceSpecificationType.MovieTicketTypeChargeSpecification)
                    .shift();
            return (MovieTicketTypeChargeSpecification !== undefined
                && MovieTicketTypeChargeSpecification.appliesToMovieTicketType === serviceType);
        });

        if (findTicketResult === undefined) {
            return '';
        }
        return findTicketResult.name.ja;
    }

    public onSubmit() {
        this.router.navigate(['/purchase/ticket']);
    }

}
