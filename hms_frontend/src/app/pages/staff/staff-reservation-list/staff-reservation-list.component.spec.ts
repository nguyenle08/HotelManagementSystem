import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffReservationListComponent } from './staff-reservation-list.component';

describe('StaffReservationListComponent', () => {
  let component: StaffReservationListComponent;
  let fixture: ComponentFixture<StaffReservationListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StaffReservationListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StaffReservationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
