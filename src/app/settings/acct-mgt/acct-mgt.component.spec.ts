import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcctMgtComponent } from './acct-mgt.component';

describe('AcctMgtComponent', () => {
  let component: AcctMgtComponent;
  let fixture: ComponentFixture<AcctMgtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AcctMgtComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AcctMgtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
