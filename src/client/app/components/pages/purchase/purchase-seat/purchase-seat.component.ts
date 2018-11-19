import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { IReservationSeat, Reservation } from '../../../../models';
import { CinerinoService, ErrorService, PurchaseService } from '../../../../services';
import { IInputScreenData } from '../../../parts/screen/screen.component';

@Component({
    selector: 'app-purchase-seat',
    templateUrl: './purchase-seat.component.html',
    styleUrls: ['./purchase-seat.component.scss']
})
export class PurchaseSeatComponent implements OnInit {
    public isLoading: boolean;
    public seatForm: FormGroup;
    public notSelectSeatModal: boolean;
    public upperLimitModal: boolean;
    public disable: boolean;
    public screenData: IInputScreenData;
    public environment = environment;

    constructor(
        public purchase: PurchaseService,
        private router: Router,
        private formBuilder: FormBuilder,
        private cinerino: CinerinoService,
        private error: ErrorService,
        // private user: UserService
    ) { }

    public async ngOnInit() {
        window.scrollTo(0, 0);
        this.isLoading = true;
        this.notSelectSeatModal = false;
        this.seatForm = this.formBuilder.group({
            terms: [false, [Validators.requiredTrue]]
        });
        this.disable = false;
        try {
            if (this.purchase.data.screeningEvent === undefined) {
                throw new Error('screeningEvent is undefined');
            }
            if (this.purchase.data.salesTickets.length === 0) {
                this.purchase.data.salesTickets = await this.fitchSalesTickets();
                if (this.purchase.data.salesTickets.length === 0) {
                    throw new Error('salesTickets not found');
                }
            }
            this.screenData = {
                theaterCode: this.purchase.data.screeningEvent.superEvent.location.branchCode,
                titleCode: this.purchase.data.screeningEvent.superEvent.workPerformed.identifier,
                screenCode: this.purchase.data.screeningEvent.location.branchCode
            };
        } catch (error) {
            this.error.redirect(error);
        }
    }

    /**
     * スクリーン読み込み完了
     * @method loadScreen
     * @param {ISeat[]} seats
     */
    public loadScreen() {
        this.isLoading = false;
    }

    /**
     * 販売可能チケット情報取得
     * @method getSalesTickets
     */
    public async fitchSalesTickets() {
        if (this.purchase.data.screeningEvent === undefined) {
            return [];
        }
        const screeningEvent = this.purchase.data.screeningEvent;
        await this.cinerino.getServices();
        const transaction = this.purchase.data.transaction;
        if (transaction === undefined) {
            throw new Error('Transaction not found');
        }
        if (transaction.object.clientUser === undefined) {
            throw new Error('ClientUser not found');
        }
        const salesTickets = await this.cinerino.event.searchScreeningEventTicketOffers({
            event: { id: screeningEvent.id },
            seller: {
                typeOf: transaction.seller.typeOf,
                id: transaction.seller.id
            },
            store: {
                id: transaction.object.clientUser.client_id
            }
        });
        // console.log('salesTickets', salesTicketArgs, salesTickets);

        return salesTickets;
    }

    /**
     * 次へ
     * @method onSubmit
     */
    public async onSubmit() {
        if (this.purchase.data.screeningEvent === undefined) {
            this.router.navigate(['/error']);
            return;
        }

        if (this.purchase.data.reservations.length === 0) {
            this.notSelectSeatModal = true;
            return;
        }
        if (this.purchase.data.screeningEvent.offers.eligibleQuantity !== undefined
            && this.purchase.data.screeningEvent.offers.eligibleQuantity.maxValue !== undefined
            && this.purchase.data.reservations.length > this.purchase.data.screeningEvent.offers.eligibleQuantity.maxValue) {
            this.upperLimitModal = true;
            return;
        }
        if (this.disable) {
            return;
        }
        if (this.seatForm.invalid) {
            this.seatForm.controls.terms.markAsDirty();

            return;
        }
        this.disable = true;
        this.isLoading = true;
        if (this.purchase.isExpired()) {
            this.router.navigate(['expired']);

            return;
        }
        try {
            await this.purchase.seatRegistrationProcess();
            this.router.navigate(['/purchase/ticket']);
        } catch (err) {
            this.error.redirect(err);
        }
    }

    /**
     * 座席選択
     * @method seatSelect
     * @param {Iseat[]} seats
     */
    public seatSelect(seats: IReservationSeat[]) {
        this.purchase.data.reservations = seats.map((seat) => {
            const ticket = { ticketOffer: this.purchase.data.salesTickets[0] };
            return new Reservation({ seat, ticket });
        });
        this.purchase.save();
    }

    /**
     * 座席選択数警告
     * @method seatSelectionAlert
     */
    public seatSelectionAlert() {
        this.upperLimitModal = true;
    }

}

