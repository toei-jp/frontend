import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-seat-info',
  templateUrl: './seat-info.component.html',
  styleUrls: ['./seat-info.component.scss']
})
export class SeatInfoComponent implements OnInit {
  @Input() public type: string;
  constructor() { }

  public ngOnInit() {
  }

}
