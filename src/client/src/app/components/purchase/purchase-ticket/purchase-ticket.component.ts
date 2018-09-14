import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
// import { environment } from '../../../../environments/environment';
import { ErrorService } from '../../../services/error/error.service';
import { /*IMvtkTicket, */IOffer, ISalesTicketResult, PurchaseService } from '../../../services/purchase/purchase.service';
import { UserService } from '../../../services/user/user.service';

/*interface ISalesMvtkTicket extends IMvtkTicket {
    id: string;
    selected: boolean;
    addGlasses: number;
    salePrice: number;
    ticketName: string;
}

interface ISalesPointTicket extends ISalesTicketResult {
    id: string;
    selected: boolean;
}*/

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
    // public originalSaleTickets: ISalesTicketResult[];
    // public ltdSelected: Ioffer | undefined;
    public isLoading: boolean;
    public discountConditionsModal: boolean;
    public notSelectModal: boolean;
    public salesTickets: ISalesTicketResult[];
    // public salesMvtkTickets: ISalesMvtkTicket[];
    // public salesPointTickets: ISalesPointTicket[];
    public ticketForm: FormGroup;
    public disable: boolean;

    constructor(
        public purchase: PurchaseService,
        public user: UserService,
        private formBuilder: FormBuilder,
        private router: Router,
        private error: ErrorService
    ) { }

    public ngOnInit() {
        window.scrollTo(0, 0);
        this.purchase.load();
        this.isLoading = false;
        this.ticketsModal = false;
        this.discountConditionsModal = false;
        this.notSelectModal = false;
        this.ticketForm = this.formBuilder.group({});
        this.disable = false;
        try {
            this.salesTickets = this.createSalseTickets();
            // this.salesMvtkTickets = this.createSalseMvtkTickets();
            // this.salesPointTickets = this.createSalsePointTickets();
            this.setOffers();
            this.totalPrice = this.getTotalPrice();
            // this.upDateSalseTickets();
            // this.originalSaleTickets = [ ...this.salesTickets];
        } catch (err) {
            this.error.redirect(err);
        }
    }

    /**
     * 販売可能チケット生成
     * @method createSalseTickets
     */
    private createSalseTickets() {
        // if (this.purchase.data.screeningEvent === undefined) {
        //     throw new Error('screeningEvent is undefined');
        // }
        // const screeningEvent = this.purchase.data.screeningEvent;
        // const pointInfo = environment.POINT_TICKET.find((ticket) => {
        //     return ticket.THEATER === screeningEvent.location.branchCode;
        // });
        const results = [];
        for (const salesTicket of this.purchase.data.salesTickets) {
            /*if (pointInfo !== undefined) {
                // ポイント券種除外
                const pointTicketCodeList = pointInfo.TICKET_CODE;
                const ticketCode = pointTicketCodeList.find((pointTicketcode) => {
                    return pointTicketcode === salesTicket.ticketCode;
                });
                if (ticketCode !== undefined) {
                    continue;
                }
            }*/

            const noGlassesBase = {};
            const noGlasses = Object.assign(noGlassesBase, salesTicket);
            // noGlasses.addGlasses = 0;
            results.push(noGlasses);
            /*if (salesTicket.addGlasses > 0) {
                // メガネあり券種作成
                const glassesBase = {};
                const glasses = Object.assign(glassesBase, salesTicket);
                glasses.salePrice = glasses.salePrice + glasses.addGlasses;
                glasses.ticketName = `${glasses.ticketName}メガネ込み`;
                results.push(glasses);
            }*/
        }

        return results;
    }

    /**
     * ムビチケ券種リスト生成
     * @method createSalseMvtkTickets
     */
    /*private createSalseMvtkTickets() {
        const results = [];
        for (const mvtkTicket of this.purchase.data.mvtkTickets) {
            for (let i = 0; i < Number(mvtkTicket.ykknInfo.ykknKnshbtsmiNum); i++) {
                const DIGITS = -2;
                const count = `00${i}`.slice(DIGITS);
                const noGlassesBase = {
                    id: `${mvtkTicket.knyknrNoInfo.knyknrNo}${mvtkTicket.ykknInfo.ykknshTyp}${count}`,
                    selected: false,
                    addGlasses: 0,
                    salePrice: Number(mvtkTicket.mvtkTicketcodeResult.addPrice),
                    ticketName: mvtkTicket.mvtkTicketcodeResult.ticketName
                };
                const noGlasses = Object.assign(noGlassesBase, mvtkTicket);
                results.push(noGlasses);
                if (mvtkTicket.mvtkTicketcodeResult.addPriceGlasses > 0) {
                    // メガネあり券種作成
                    const glassesBase = {
                        id: `${mvtkTicket.knyknrNoInfo.knyknrNo}${mvtkTicket.ykknInfo.ykknshTyp}${count}`,
                        selected: false,
                        addGlasses: Number(mvtkTicket.mvtkTicketcodeResult.addPriceGlasses),
                        salePrice:
                            Number(mvtkTicket.mvtkTicketcodeResult.addPriceGlasses) + Number(mvtkTicket.mvtkTicketcodeResult.addPrice),
                        ticketName: `${mvtkTicket.mvtkTicketcodeResult.ticketName} メガネ込み`
                    };
                    const glasses = Object.assign(glassesBase, mvtkTicket);
                    results.push(glasses);
                }
            }
        }

        return results;
    }*/

    /**
     * ポイントチケット生成
     * @method createSalsePointTickets
     */
    /*private createSalsePointTickets() {
        const results = [];
        let count = 0;
        for (const pointTicket of this.purchase.data.pointTickets) {
            const salesTicket = this.purchase.data.salesTickets.find((ticket) => {
                return ticket.ticketCode === pointTicket.ticketCode;
            });
            if (salesTicket === undefined) {
                throw new Error('salesTicket is not found');
            }
            const data = {
                ticketCode: salesTicket.ticketCode,
                ticketName: salesTicket.ticketName,
                ticketNameKana: salesTicket.ticketNameKana,
                ticketNameEng: salesTicket.ticketNameEng,
                stdPrice: salesTicket.salePrice,
                addPrice: salesTicket.addPrice,
                salePrice: salesTicket.salePrice,
                limitCount: salesTicket.limitCount,
                limitUnit: salesTicket.limitUnit,
                ticketNote: salesTicket.ticketNote,
                addGlasses: salesTicket.addGlasses,
                selected: false,
                id: `${salesTicket.ticketCode}${count}`
            };
            const noGlassesBase = {};
            const noGlasses = Object.assign(noGlassesBase, data);
            noGlasses.addGlasses = 0;
            results.push(noGlasses);
            if (data.addGlasses > 0) {
                // メガネあり券種作成
                const glassesBase = {};
                const glasses = Object.assign(glassesBase, data);
                glasses.salePrice = glasses.salePrice + glasses.addGlasses;
                glasses.ticketName = `${glasses.ticketName}メガネ込み`;
                results.push(glasses);
            }
            count++;
        }

        return results;
    }*/

    /**
     * 券種リスト更新
     * @method upDateSalseTickets
     */
    /*public upDateSalseTickets() {
        // ムビチケ券種
        for (const ticket of this.salesMvtkTickets) {
            ticket.selected = false;
        }
        for (const offer of this.offers) {
            if (offer.ticketInfo.mvtkNum === '') {
                continue;
            }
            // 選択済みへ変更
            const sameTicket = this.salesMvtkTickets.find((ticket) => {
                return (offer.ticketInfo.mvtkNum === ticket.knyknrNoInfo.knyknrNo
                    && offer.ticketInfo.ticketCode === ticket.mvtkTicketcodeResult.ticketCode
                    && !ticket.selected);
            });
            if (sameTicket !== undefined) {
                sameTicket.selected = true;
                const sameGlassesTicket = this.salesMvtkTickets.find((ticket) => {
                    return (sameTicket.id === ticket.id && !ticket.selected);
                });
                if (sameGlassesTicket !== undefined) {
                    sameGlassesTicket.selected = true;
                }
            }
        }
        // ポイント券種
        for (const ticket of this.salesPointTickets) {
            ticket.selected = false;
        }
        for (const offer of this.offers) {
            if (offer.ticketInfo.usePoint === 0) {
                continue;
            }
            // 選択済みへ変更
            const sameTicket = this.salesPointTickets.find((ticket) => {
                return (offer.ticketInfo.ticketCode === ticket.ticketCode
                    && !ticket.selected);
            });
            if (sameTicket !== undefined) {
                sameTicket.selected = true;
                const sameGlassesTicket = this.salesPointTickets.find((ticket) => {
                    return (sameTicket.id === ticket.id && !ticket.selected);
                });
                if (sameGlassesTicket !== undefined) {
                    sameGlassesTicket.selected = true;
                }
            }
        }
    }*/

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
        /*if (this.ticketValidation()) {
            window.scrollTo(0, 0);
            this.discountConditionsModal = true;

            return;
        }*/
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
     * オファーを登録
     * @method setOffers
     */
    private setOffers() {
        if (this.purchase.data.seatReservationAuthorization === undefined
            && this.purchase.data.reservationAuthorizationArgs !== undefined) {
            this.offers = this.purchase.data.offers;
        } else if (this.purchase.data.seatReservationAuthorization !== undefined) {
            this.offers = this.purchase.data.offers.map((offer) => {
                /*if (offer.ticketInfo.mvtkNum !== '') {
                    // ムビチケ
                    return {
                        price: offer.price,
                        priceCurrency: offer.priceCurrency,
                        seatNumber: offer.seatNumber,
                        seatSection: offer.seatSection,
                        mvtkNum: offer.ticketInfo.mvtkNum,
                        selected: true,
                        limitCount: 1,
                        limitUnit: '001',
                        validation: false,
                        ticketInfo: offer.ticketInfo
                    };
                } else if (offer.ticketInfo.usePoint > 0) {
                    // ポイント
                    const ticket = this.salesPointTickets.find((salseTicket) => {
                        return (offer.ticketInfo.ticketCode === salseTicket.ticketCode
                            && offer.ticketInfo.addGlasses === salseTicket.addGlasses);
                    });

                    if (ticket === undefined) {
                        throw new Error('ticket is not found');
                    }

                    return {
                        price: offer.price,
                        priceCurrency: offer.priceCurrency,
                        seatNumber: offer.seatNumber,
                        seatSection: offer.seatSection,
                        mvtkNum: offer.ticketInfo.mvtkNum,
                        selected: true,
                        limitCount: ticket.limitCount,
                        limitUnit: ticket.limitUnit,
                        validation: false,
                        ticketInfo: offer.ticketInfo
                    };
                } else {*/
                    // 通常
                    const ticket = this.salesTickets.find((salseTicket) => {
                        return (offer.ticketInfo.ticketId === salseTicket.id
                            /*&& offer.ticketInfo.addGlasses === salseTicket.addGlasses*/);
                    });

                    if (ticket === undefined) {
                        throw new Error('ticket is not found');
                    }

                    return {
                        price: offer.price,
                        priceCurrency: offer.priceCurrency,
                        seatNumber: offer.seatNumber,
                        seatSection: offer.seatSection,
                        // mvtkNum: offer.ticketInfo.mvtkNum,
                        selected: true,
                        // limitCount: ticket.limitCount,
                        // limitUnit: ticket.limitUnit,
                        validation: false,
                        ticketInfo: offer.ticketInfo
                    };
                // }
            });
        }
    }

    /**
     * 制限単位、人数制限判定
     * @method ticketValidation
     */
    /*public ticketValidation(): boolean {
        let result = false;
        for (const offer of this.offers) {
            if (offer.limitUnit === '001') {
                const unitLimitTickets = this.offers.filter((targetOffer) => {
                    return (targetOffer.limitUnit === '001' && targetOffer.limitCount === offer.limitCount);
                });
                if (unitLimitTickets.length % offer.limitCount !== 0) {
                    offer.validation = true;
                    result = true;
                }
            }
        }

        return result;
    }*/

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
     * @method selectSalseTicket
     * @param {ISalesTicket} ticket
     * @param {boolean} glass
     */
    public selectSalseTicket(ticket: ISalesTicketResult) {
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
        target.price = ticket.charge;
        target.priceCurrency = this.selectOffer.priceCurrency;
        target.seatNumber = this.selectOffer.seatNumber;
        target.seatSection = this.selectOffer.seatSection;
        target.selected = true;
        // target.limitCount = ticket.limitCount;
        // target.limitUnit = ticket.limitUnit;
        target.ticketInfo = {
            // mvtkNum: '',
            ticketId: ticket.id,
            ticketName: ticket.name,
            charge: ticket.charge,
            description: ticket.description,
            // mvtkAppPrice: 0,
            // addGlasses: ticket.addGlasses,
            // kbnEisyahousiki: '00',
            // mvtkKbnDenshiken: '00',
            // mvtkKbnMaeuriken: '00',
            // mvtkKbnKensyu: '00',
            // mvtkSalesPrice: 0,
            // addPrice: 0,
            // disPrice: 0,
            // salePrice: ticket.charge,
            seatNum: this.selectOffer.seatNumber,
            // stdPrice: ticket.charge,
            ticketCount: 1,
            // usePoint: usePoint
        };
        this.totalPrice = this.getTotalPrice();
        // this.upDateSalseTickets();
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
        this.upDateSalseTickets();
        this.ticketsModal = false;
    }*/

}
