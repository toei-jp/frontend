import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketingMethodComponent } from './ticketing-method.component';

describe('TicketingMethodComponent', () => {
  let component: TicketingMethodComponent;
  let fixture: ComponentFixture<TicketingMethodComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TicketingMethodComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TicketingMethodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
