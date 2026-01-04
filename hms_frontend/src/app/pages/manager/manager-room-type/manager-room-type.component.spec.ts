import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagerRoomTypeComponent } from './manager-room-type.component';

describe('ManagerRoomTypeComponent', () => {
  let component: ManagerRoomTypeComponent;
  let fixture: ComponentFixture<ManagerRoomTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagerRoomTypeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagerRoomTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
