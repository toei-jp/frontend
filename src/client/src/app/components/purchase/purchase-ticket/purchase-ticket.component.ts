import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { factory } from '@toei-jp/cinerino-api-javascript-client/lib/abstract';
import { IMovieTicket } from '@toei-jp/cinerino-factory/lib/factory/paymentMethod/paymentCard/movieTicket';
// import { environment } from '../../../../environments/environment';
import { ErrorService } from '../../../services/error/error.service';
import { IOffer, ISalesTicketResult, PurchaseService } from '../../../services/purchase/purchase.service';
import { UserService } from '../../../services/user/user.service';

@Component({
    selector: 'app-purchase-ticket',
    templateUrl: './purchase-ticket.component.html',
    styleUrls: ['./purchase-ticket.component.scss']
})
export class PurchaseTicketComponent implements OnInit {
    public offers: IOffer[];
    public totalPrice: number;
    public selectOffer: IOffer;
    public ticketsModal: boolean;
    public isLoading: boolean;
    public discountConditionsModal: boolean;
    public notSelectModal: boolean;
    public ticketForm: FormGroup;
    public disable: boolean;
    public tickets: {
        ticketOffer: factory.chevre.event.screeningEvent.ITicketOffer;
        movieTicket?: IMovieTicket;
    };

    constructor(
        public purchase: PurchaseService,
        public user: UserService,
        private formBuilder: FormBuilder,
        private router: Router,
        private error: ErrorService
    ) { }

    public ngOnInit() {
        // console.log(this.purchase.data.salesTickets);
        window.scrollTo(0, 0);
        this.purchase.load();
        this.isLoading = false;
        this.ticketsModal = false;
        this.discountConditionsModal = false;
        this.notSelectModal = false;
        this.ticketForm = this.formBuilder.group({});
        this.disable = false;
        try {
            this.totalPrice = this.getTotalPrice();
        } catch (err) {
            this.error.redirect(err);
        }
    }

    /**
     * 次へ
     * @method onSubmit
     */
    public async onSubmit() {
        const notSelectOffers = this.offers.filter((offer) => {
            return (!offer.selected);
        });
        if (notSelectOffers.length > 0) {
            this.notSelectModal = true;

            return;
        }

        if (this.disable) {
            return;
        }
        this.disable = true;
        this.isLoading = true;
        if (this.purchase.isExpired()) {
            this.router.navigate(['expired']);

            return;
        }
        try {
            // const offers = this.offers.map((offer) => {
            //     return {
            //         seatSection: offer.seatSection,
            //         seatNumber: offer.seatNumber,
            //         ticketInfo: offer.ticketInfo
            //     };
            // });
            const tickets = this.offers.map((offer) => offer.ticketInfo);
            await this.purchase.ticketRegistrationProcess(tickets);
            this.router.navigate(['/purchase/input']);
        } catch (err) {
            this.error.redirect(err);
        }
    }

    /**
     * 合計金額計算
     * @method getTotalPrice
     */
    public getTotalPrice(): number {
        let result = 0;
        const selectedOffers = this.offers.filter((offer) => {
            return (offer.selected);
        });
        for (const offer of selectedOffers) {
            result += offer.ticketInfo.charge;
        }

        return result;
    }

    /**
     * 券種選択
     * @method ticketSelect
     * @param {Event} event
     * @param {Ioffer} offer
     */
    public ticketSelect(offer: IOffer) {
        this.selectOffer = offer;
        this.ticketsModal = true;
    }

    /**
     * 販売可能券種選択
     * @method selectSalesTicket
     * @param {ISalesTicket} ticket
     * @param {boolean} glass
     */
    public selectSalesTicket(ticket: ISalesTicketResult) {
        const target = this.offers.find((offer) => {
            return (offer.seatNumber === this.selectOffer.seatNumber);
        });
        if (target === undefined) {
            this.ticketsModal = false;

            return;
        }
        /*if (this.purchase.data.screeningEvent !== undefined) {
            const ltdTicketCode = this.purchase.getMemberTicketCode();
            if (ltdTicketCode.indexOf(ticket.ticketCode) >= 0) {
                this.salesTickets = this.salesTickets.filter(
                    (t) => ltdTicketCode.indexOf(t.ticketCode) < 0
                );
                this.ltdSelected = target;
            } else if (this.ltdSelected === target) {
                this.ltdSelected = undefined;
                this.salesTickets = this.originalSaleTickets;
            }
        }*/
        // const findTicket = this.purchase.data.pointTickets.find((pointTicket) => {
        //     return (pointTicket.ticketCode === ticket.ticketCode);
        // });
        // const usePoint = (findTicket !== undefined) ? findTicket.usePoint : 0;
        target.price = this.purchase.getTicketPrice(ticket).total;
        target.priceCurrency = this.selectOffer.priceCurrency;
        target.seatNumber = this.selectOffer.seatNumber;
        target.seatSection = this.selectOffer.seatSection;
        target.selected = true;
        // target.limitCount = ticket.limitCount;
        // target.limitUnit = ticket.limitUnit;
        target.ticketInfo = {
            mvtkNum: '',
            ticketId: ticket.id,
            ticketName: ticket.name,
            charge: this.purchase.getTicketPrice(ticket).total,
            description: ticket.description,
            mvtkAppPrice: 0,
            // addGlasses: ticket.addGlasses,
            kbnEisyahousiki: '00',
            mvtkKbnDenshiken: '00',
            mvtkKbnMaeuriken: '00',
            mvtkKbnKensyu: '00',
            mvtkSalesPrice: 0,
            // addPrice: 0,
            // disPrice: 0,
            // salePrice: ticket.charge,
            seatNum: this.selectOffer.seatNumber,
            // stdPrice: ticket.charge,
            ticketCount: 1,
            // usePoint: usePoint
        };
        this.totalPrice = this.getTotalPrice();
        // this.upDateSalesTickets();
        this.ticketsModal = false;
    }

    /**
     * ムビチケ券種選択
     * @method selectMvtkTicket
     * @param {ISalesMvtkTicket} ticket
     * @param {boolean} glass
     */
    /*public selectMvtkTicket(ticket: ISalesMvtkTicket) {
        const target = this.offers.find((offer) => {
            return (offer.seatNumber === this.selectOffer.seatNumber);
        });
        if (target === undefined) {
            this.ticketsModal = false;

            return;
        }

        target.price = ticket.salePrice;
        target.priceCurrency = this.selectOffer.priceCurrency;
        target.seatNumber = this.selectOffer.seatNumber;
        target.seatSection = this.selectOffer.seatSection;
        target.selected = true;
        target.limitCount = 1;
        target.limitUnit = '001';
        target.ticketInfo = {
            mvtkNum: ticket.knyknrNoInfo.knyknrNo,
            ticketCode: ticket.mvtkTicketcodeResult.ticketCode,
            ticketName: ticket.ticketName,
            mvtkAppPrice: Number(ticket.ykknInfo.kijUnip),
            addGlasses: ticket.addGlasses,
            kbnEisyahousiki: ticket.ykknInfo.eishhshkTyp,
            mvtkKbnDenshiken: ticket.knyknrNoInfo.dnshKmTyp,
            mvtkKbnMaeuriken: ticket.knyknrNoInfo.znkkkytsknGkjknTyp,
            mvtkKbnKensyu: ticket.ykknInfo.ykknshTyp,
            mvtkSalesPrice: Number(ticket.ykknInfo.knshknhmbiUnip),
            addPrice: ticket.mvtkTicketcodeResult.addPrice,
            disPrice: 0,
            salePrice: ticket.salePrice,
            seatNum: this.selectOffer.seatNumber,
            stdPrice: 0,
            ticketCount: 1,
            ticketNameEng: ticket.mvtkTicketcodeResult.ticketNameEng,
            ticketNameKana: ticket.mvtkTicketcodeResult.ticketNameKana
        };
        this.totalPrice = this.getTotalPrice();
        this.upDateSalesTickets();
        this.ticketsModal = false;
    }*/

}
