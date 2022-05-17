import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditLocComponent } from './edit-loc.component';

describe('EditLocComponent', () => {
  let component: EditLocComponent;
  let fixture: ComponentFixture<EditLocComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditLocComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditLocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
