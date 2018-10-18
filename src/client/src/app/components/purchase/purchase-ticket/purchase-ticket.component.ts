import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { factory } from '@toei-jp/cinerino-api-javascript-client/lib/abstract';
import { IMovieTicket } from '@toei-jp/cinerino-factory/lib/factory/paymentMethod/paymentCard/movieTicket';
import { IReservationTicket, Reservation } from '../../../models';
// import { environment } from '../../../../environments/environment';
import { ErrorService } from '../../../services/error/error.service';
import { PurchaseService } from '../../../services/purchase/purchase.service';
import { UserService } from '../../../services/user/user.service';

type IMovieTicketTypeChargeSpecification =
    factory.chevre.priceSpecification.IPriceSpecification<factory.chevre.priceSpecificationType.MovieTicketTypeChargeSpecification>;

@Component({
    selector: 'app-purchase-ticket',
    templateUrl: './purchase-ticket.component.html',
    styleUrls: ['./purchase-ticket.component.scss']
})
export class PurchaseTicketComponent implements OnInit {
    public totalPrice: number;
    public ticketsModal: boolean;
    public isLoading: boolean;
    public discountConditionsModal: boolean;
    public notSelectModal: boolean;
    public ticketForm: FormGroup;
    public disable: boolean;
    public selectedReservation: Reservation;
    public tickets: IReservationTicket[];

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
            this.totalPrice = this.purchase.getTotalPrice();
        } catch (err) {
            this.error.redirect(err);
        }
    }

    /**
     * 次へ
     * @method onSubmit
     */
    public async onSubmit() {
        const selectedReservations = this.purchase.data.reservations.filter((reservation) => {
            return (reservation.ticket !== undefined);
        });
        if (selectedReservations.length === 0) {
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
            await this.purchase.ticketRegistrationProcess();
            this.router.navigate(['/purchase/input']);
        } catch (err) {
            this.error.redirect(err);
        }
    }

    /**
     * 券種選択
     * @method openTicketList
     */
    public openTicketList(reservation: Reservation) {
        this.createTickets();
        this.selectedReservation = reservation;
        this.ticketsModal = true;
    }

    /**
     * 券種一覧作成
     */
    public createTickets() {
        this.tickets = [];
        this.purchase.data.salesTickets.forEach((ticketOffer) => {
            const movieTicketTypeChargeSpecification = <IMovieTicketTypeChargeSpecification>ticketOffer.priceSpecification.priceComponent
                .filter((s) => s.typeOf === factory.chevre.priceSpecificationType.MovieTicketTypeChargeSpecification)
                .shift();
            if (movieTicketTypeChargeSpecification === undefined) {
                // ムビチケ以外
                this.tickets.push({ ticketOffer });
                return;
            }

            // 対象ムビチケ券
            const movieTickets: IMovieTicket[] = [];
            this.purchase.data.mvtkTickets.forEach((checkMovieTicketAction) => {
                if (checkMovieTicketAction.result === undefined) {
                    return;
                }
                checkMovieTicketAction.result.movieTickets.forEach((movieTicket) => {
                    if (movieTicket.serviceType === movieTicketTypeChargeSpecification.appliesToMovieTicketType) {
                        movieTickets.push(movieTicket);
                    }
                });
            });

            // 選択中の対象ムビチケ券
            const reservations = this.purchase.data.reservations.filter((reservation) => {
                if (reservation.ticket === undefined
                    || reservation.ticket.movieTicket === undefined) {
                    return false;
                }
                return (movieTicketTypeChargeSpecification.appliesToMovieTicketType
                    === reservation.ticket.movieTicket.serviceType);
            });

            movieTickets.forEach((movieTicket, index) => {
                if (index >= (movieTickets.length - reservations.length)) {
                    return;
                }
                this.tickets.push({ ticketOffer, movieTicket });
            });
        });
    }

    /**
     * 券種選択
     * @method selectTicket
     */
    public selectTicket(ticket: IReservationTicket) {
        const findReservationResult = this.purchase.data.reservations.find((reservation) => {
            return (reservation.seat.seatNumber === this.selectedReservation.seat.seatNumber
                && reservation.seat.seatSection === this.selectedReservation.seat.seatSection);
        });
        if (findReservationResult !== undefined) {
            findReservationResult.ticket = ticket;
        }
        this.purchase.save();
        this.totalPrice = this.purchase.getTotalPrice();
        // this.upDateSalesTickets();
        this.ticketsModal = false;
    }

    /**
     * 券種金額取得
     */
    public getTicketPrice(ticket: factory.chevre.event.screeningEvent.ITicketOffer) {
        const unitPriceSpecification = ticket.priceSpecification.priceComponent
            .filter((s) => s.typeOf === factory.chevre.priceSpecificationType.UnitPriceSpecification)
            .shift();
        const videoFormatCharge = ticket.priceSpecification.priceComponent
            .filter((s) => s.typeOf === factory.chevre.priceSpecificationType.VideoFormatChargeSpecification)
            .shift();
        const soundFormatCharge = ticket.priceSpecification.priceComponent
            .filter((s) => s.typeOf === factory.chevre.priceSpecificationType.SoundFormatChargeSpecification)
            .shift();
        const movieTicketTypeCharge = ticket.priceSpecification.priceComponent
            .filter((s) => s.typeOf === factory.chevre.priceSpecificationType.MovieTicketTypeChargeSpecification)
            .shift();
        const price = {
            unitPriceSpecification: (unitPriceSpecification === undefined) ? 0 : unitPriceSpecification.price,
            videoFormatCharge: (videoFormatCharge === undefined) ? 0 : videoFormatCharge.price,
            soundFormatCharge: (soundFormatCharge === undefined) ? 0 : soundFormatCharge.price,
            movieTicketTypeCharge: (movieTicketTypeCharge === undefined) ? 0 : movieTicketTypeCharge.price,
            total: 0
        };

        price.total = price.unitPriceSpecification + price.videoFormatCharge + price.soundFormatCharge + price.movieTicketTypeCharge;

        return price;
    }


}
