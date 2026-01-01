import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffStatusReservationComponent } from './staff-status-reservation.component';

describe('StaffStatusReservationComponent', () => {
  let component: StaffStatusReservationComponent;
  let fixture: ComponentFixture<StaffStatusReservationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StaffStatusReservationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StaffStatusReservationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
