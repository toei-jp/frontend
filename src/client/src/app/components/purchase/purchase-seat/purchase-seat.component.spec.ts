import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseSeatComponent } from './purchase-seat.component';

describe('PurchaseSeatComponent', () => {
  let component: PurchaseSeatComponent;
  let fixture: ComponentFixture<PurchaseSeatComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PurchaseSeatComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchaseSeatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
