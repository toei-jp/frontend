import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchasePointComponent } from './purchase-point.component';

describe('PurchasePointComponent', () => {
  let component: PurchasePointComponent;
  let fixture: ComponentFixture<PurchasePointComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PurchasePointComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchasePointComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
