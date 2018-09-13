import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseOverlapComponent } from './purchase-overlap.component';

describe('PurchaseOverlapComponent', () => {
  let component: PurchaseOverlapComponent;
  let fixture: ComponentFixture<PurchaseOverlapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PurchaseOverlapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchaseOverlapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
