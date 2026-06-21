import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LookupManagementComponent } from './lookup-management.component';

describe('LookupManagementComponent', () => {
  let component: LookupManagementComponent;
  let fixture: ComponentFixture<LookupManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LookupManagementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LookupManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
