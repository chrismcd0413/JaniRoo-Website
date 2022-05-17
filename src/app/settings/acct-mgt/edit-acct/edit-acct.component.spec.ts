import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditAcctComponent } from './edit-acct.component';

describe('EditAcctComponent', () => {
  let component: EditAcctComponent;
  let fixture: ComponentFixture<EditAcctComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditAcctComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditAcctComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
