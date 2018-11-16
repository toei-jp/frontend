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
    public isUsedMovieTicket: boolean;

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
        this.tickets = [];
        try {
            this.totalPrice = this.purchase.getTotalPrice();
        } catch (err) {
            this.error.redirect(err);
        }

        this.isUsedMovieTicket = this.movieTicketCheck();
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

        const validResult = selectedReservations.filter((reservation) => {
            const unitPriceSpecification = reservation.getUnitPriceSpecification();
            if (unitPriceSpecification === undefined
                || unitPriceSpecification.typeOf !== factory.chevre.priceSpecificationType.UnitPriceSpecification) {
                return false;
            }
            const filterResult = selectedReservations.filter((targetReservation) => {
                return (reservation.ticket !== undefined
                    && targetReservation.ticket !== undefined
                    && reservation.ticket.ticketOffer.id === targetReservation.ticket.ticketOffer.id);
            });
            const value = (unitPriceSpecification.referenceQuantity.value === undefined)
                ? 1
                : unitPriceSpecification.referenceQuantity.value;

            return (filterResult.length % value !== 0);
        });

        if (validResult.length > 0) {
            this.discountConditionsModal = true;

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
                const availabilityMovieTickets = checkMovieTicketAction.result.movieTickets.filter((movieTicket) => {
                    return (movieTicket.validThrough === undefined);
                });
                availabilityMovieTickets.forEach((movieTicket) => {
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
        const result = {
            unitPriceSpecification: 0,
            videoFormatCharge: 0,
            soundFormatCharge: 0,
            movieTicketTypeCharge: 0,
            total: 0
        };
        const unitPriceSpecifications = ticket.priceSpecification.priceComponent
            .filter((s) => s.typeOf === factory.chevre.priceSpecificationType.UnitPriceSpecification);
        const videoFormatCharges = ticket.priceSpecification.priceComponent
            .filter((s) => s.typeOf === factory.chevre.priceSpecificationType.VideoFormatChargeSpecification);
        const soundFormatCharges = ticket.priceSpecification.priceComponent
            .filter((s) => s.typeOf === factory.chevre.priceSpecificationType.SoundFormatChargeSpecification);
        const movieTicketTypeCharges = ticket.priceSpecification.priceComponent
            .filter((s) => s.typeOf === factory.chevre.priceSpecificationType.MovieTicketTypeChargeSpecification);

        unitPriceSpecifications.forEach((unitPriceSpecification) => {
            result.unitPriceSpecification += unitPriceSpecification.price;
        });
        videoFormatCharges.forEach((videoFormatCharge) => {
            result.videoFormatCharge += videoFormatCharge.price;
        });
        soundFormatCharges.forEach((soundFormatCharge) => {
            result.soundFormatCharge += soundFormatCharge.price;
        });
        movieTicketTypeCharges.forEach((movieTicketTypeCharge) => {
            result.movieTicketTypeCharge += movieTicketTypeCharge.price;
        });
        result.total = result.unitPriceSpecification + result.videoFormatCharge + result.soundFormatCharge + result.movieTicketTypeCharge;

        return result;
    }

    /**
     * ムビチケ対応確認
     */
    public movieTicketCheck() {
        const screeningEventTicketOffers = this.purchase.data.salesTickets;
        const movieTicketTypeOffers = screeningEventTicketOffers.filter((offer) => {
            const movieTicketTypeChargeSpecifications = offer.priceSpecification.priceComponent.filter((priceComponent) => {
                return (priceComponent.typeOf === factory.chevre.priceSpecificationType.MovieTicketTypeChargeSpecification);
            });
            return (movieTicketTypeChargeSpecifications.length > 0);
        });
        return (movieTicketTypeOffers.length > 0);
    }



}
