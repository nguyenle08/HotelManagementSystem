import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagerReportComponent } from './manager-report.component';

describe('ManagerReportComponent', () => {
  let component: ManagerReportComponent;
  let fixture: ComponentFixture<ManagerReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagerReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagerReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
