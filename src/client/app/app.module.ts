import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { SwiperModule } from 'ngx-swiper-wrapper';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './components/app/app.component';
import { AuthSigninComponent } from './components/pages/auth/auth-signin/auth-signin.component';
import { BaseComponent } from './components/pages/base/base.component';
import { CompanyComponent } from './components/pages/company/company.component';
import { ErrorComponent } from './components/pages/error/error.component';
import { ExpiredComponent } from './components/pages/expired/expired.component';
import { LawComponent } from './components/pages/law/law.component';
import { NotFoundComponent } from './components/pages/not-found/not-found.component';
import { PurchaseBaseComponent } from './components/pages/purchase/purchase-base/purchase-base.component';
import { PurchaseCompleteComponent } from './components/pages/purchase/purchase-complete/purchase-complete.component';
import { PurchaseConfirmComponent } from './components/pages/purchase/purchase-confirm/purchase-confirm.component';
import { PurchaseInputComponent } from './components/pages/purchase/purchase-input/purchase-input.component';
import { PurchaseMvtkConfirmComponent } from './components/pages/purchase/purchase-mvtk-confirm/purchase-mvtk-confirm.component';
import { PurchaseMvtkInputComponent } from './components/pages/purchase/purchase-mvtk-input/purchase-mvtk-input.component';
import { PurchaseOverlapComponent } from './components/pages/purchase/purchase-overlap/purchase-overlap.component';
// import { PurchasePointComponent } from './components/pages/purchase/purchase-point/purchase-point.component';
import { PurchaseScheduleComponent } from './components/pages/purchase/purchase-schedule/purchase-schedule.component';
import { PurchaseSeatComponent } from './components/pages/purchase/purchase-seat/purchase-seat.component';
import { PurchaseTicketComponent } from './components/pages/purchase/purchase-ticket/purchase-ticket.component';
import { PurchaseTransactionComponent } from './components/pages/purchase/purchase-transaction/purchase-transaction.component';
import { TestScreenComponent } from './components/pages/test/test-screen/test-screen.component';
import { TicketingMethodComponent } from './components/pages/ticketing-method/ticketing-method.component';
import { ButtonsComponent } from './components/parts/buttons/buttons.component';
import { FooterComponent } from './components/parts/footer/footer.component';
import { HeaderComponent } from './components/parts/header/header.component';
import { IconComponent } from './components/parts/icon/icon.component';
import { LoadingComponent } from './components/parts/loading/loading.component';
import { ModalComponent } from './components/parts/modal/modal.component';
import { NextButtonComponent } from './components/parts/next-button/next-button.component';
import {
    PurchaseFilmOrderPerformanceComponent
} from './components/parts/purchase-film-order-performance/purchase-film-order-performance.component';
import { PurchaseFilmOrderComponent } from './components/parts/purchase-film-order/purchase-film-order.component';
import { PurchaseNoteComponent } from './components/parts/purchase-note/purchase-note.component';
import { PurchaseStepComponent } from './components/parts/purchase-step/purchase-step.component';
import { PurchaseTermComponent } from './components/parts/purchase-term/purchase-term.component';
import { ScreenComponent } from './components/parts/screen/screen.component';
import { SeatInfoComponent } from './components/parts/seat-info/seat-info.component';
import { SiteSealComponent } from './components/parts/site-seal/site-seal.component';
import { DurationPipe } from './pipes/duration/duration.pipe';
import { LibphonenumberFormatPipe } from './pipes/libphonenumber-format/libphonenumber-format.pipe';
import { TimeFormatPipe } from './pipes/time-format/time-format.pipe';
import {
    CallNativeService,
    CinerinoService,
    ErrorService,
    PurchaseGuardService,
    PurchaseService,
    StorageService,
    TestGuardService,
    UserService,
    UtilService
} from './services';

@NgModule({
    declarations: [
        AppComponent,
        PurchaseBaseComponent,
        PurchaseCompleteComponent,
        PurchaseScheduleComponent,
        PurchaseSeatComponent,
        PurchaseTicketComponent,
        PurchaseInputComponent,
        PurchaseConfirmComponent,
        PurchaseMvtkInputComponent,
        PurchaseMvtkConfirmComponent,
        ScreenComponent,
        HeaderComponent,
        FooterComponent,
        PurchaseStepComponent,
        LoadingComponent,
        SiteSealComponent,
        ModalComponent,
        ButtonsComponent,
        PurchaseTransactionComponent,
        ErrorComponent,
        PurchaseFilmOrderComponent,
        PurchaseFilmOrderPerformanceComponent,
        TimeFormatPipe,
        DurationPipe,
        SeatInfoComponent,
        IconComponent,
        LibphonenumberFormatPipe,
        PurchaseOverlapComponent,
        BaseComponent,
        NextButtonComponent,
        NotFoundComponent,
        ExpiredComponent,
        PurchaseTermComponent,
        PurchaseNoteComponent,
        // PurchasePointComponent,
        AuthSigninComponent,
        TestScreenComponent,
        LawComponent,
        TicketingMethodComponent,
        CompanyComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule,
        SwiperModule
    ],
    providers: [
        PurchaseGuardService,
        ErrorService,
        StorageService,
        PurchaseService,
        CallNativeService,
        CinerinoService,
        UserService,
        TestGuardService,
        UtilService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
