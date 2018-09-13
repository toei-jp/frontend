import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IInputScreenData } from '../../parts/screen/screen.component';

@Component({
    selector: 'app-test-screen',
    templateUrl: './test-screen.component.html',
    styleUrls: ['./test-screen.component.scss']
})
export class TestScreenComponent implements OnInit {
    public isLoading: boolean;
    public screenData: IInputScreenData;
    constructor(
        private activatedRoute: ActivatedRoute
    ) { }

    public async ngOnInit() {
        this.isLoading = true;
        this.activatedRoute.params.subscribe(params => {
            this.screenData = {
                theaterCode: params.theaterCode,
                dateJouei: '',
                titleCode: '',
                titleBranchNum: '',
                timeBegin: '',
                screenCode: params.screenCode
            };

            this.isLoading = false;
        });
    }

}
