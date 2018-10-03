import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './components/app/app.component';
import { AuthSigninComponent } from './components/auth/auth-signin/auth-signin.component';
import { BaseComponent } from './components/base/base.component';
import { ErrorComponent } from './components/error/error.component';
import { ExpiredComponent } from './components/expired/expired.component';
import { InquiryBaseComponent } from './components/inquiry/inquiry-base/inquiry-base.component';
import { InquiryConfirmComponent } from './components/inquiry/inquiry-confirm/inquiry-confirm.component';
import { InquiryLoginComponent } from './components/inquiry/inquiry-login/inquiry-login.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
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
import { PurchaseBaseComponent } from './components/purchase/purchase-base/purchase-base.component';
import { PurchaseCompleteComponent } from './components/purchase/purchase-complete/purchase-complete.component';
import { PurchaseConfirmComponent } from './components/purchase/purchase-confirm/purchase-confirm.component';
import { PurchaseInputComponent } from './components/purchase/purchase-input/purchase-input.component';
import { PurchaseMvtkConfirmComponent } from './components/purchase/purchase-mvtk-confirm/purchase-mvtk-confirm.component';
import { PurchaseMvtkInputComponent } from './components/purchase/purchase-mvtk-input/purchase-mvtk-input.component';
import { PurchaseOverlapComponent } from './components/purchase/purchase-overlap/purchase-overlap.component';
// import { PurchasePointComponent } from './components/purchase/purchase-point/purchase-point.component';
import { PurchaseScheduleComponent } from './components/purchase/purchase-schedule/purchase-schedule.component';
import { PurchaseSeatComponent } from './components/purchase/purchase-seat/purchase-seat.component';
import { PurchaseTicketComponent } from './components/purchase/purchase-ticket/purchase-ticket.component';
import { PurchaseTransactionComponent } from './components/purchase/purchase-transaction/purchase-transaction.component';
import { TestScreenComponent } from './components/test/test-screen/test-screen.component';
import { DurationPipe } from './pipes/duration/duration.pipe';
import { LibphonenumberFormatPipe } from './pipes/libphonenumber-format/libphonenumber-format.pipe';
import { TimeFormatPipe } from './pipes/time-format/time-format.pipe';
import { AwsCognitoService } from './services/aws-cognito/aws-cognito.service';
import { CallNativeService } from './services/call-native/call-native.service';
import { CinerinoService } from './services/cinerino/cinerino.service';
import { ErrorService } from './services/error/error.service';
import { MemberGuardService } from './services/member-guard/member-guard.service';
import { PurchaseGuardService } from './services/purchase-guard/purchase-guard.service';
import { PurchaseService } from './services/purchase/purchase.service';
import { StorageService } from './services/storage/storage.service';
import { TestGuardService } from './services/test-guard/test-guard.service';
import { UserService } from './services/user/user.service';
import { UtilService } from './services/util/util.service';

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
        InquiryBaseComponent,
        InquiryLoginComponent,
        InquiryConfirmComponent,
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
        TestScreenComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule
    ],
    providers: [
        PurchaseGuardService,
        ErrorService,
        StorageService,
        PurchaseService,
        AwsCognitoService,
        CallNativeService,
        CinerinoService,
        UserService,
        TestGuardService,
        UtilService,
        MemberGuardService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
