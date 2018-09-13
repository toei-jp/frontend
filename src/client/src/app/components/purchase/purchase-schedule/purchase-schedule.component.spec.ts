import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseScheduleComponent } from './purchase-schedule.component';

describe('PurchaseScheduleComponent', () => {
  let component: PurchaseScheduleComponent;
  let fixture: ComponentFixture<PurchaseScheduleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PurchaseScheduleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchaseScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
