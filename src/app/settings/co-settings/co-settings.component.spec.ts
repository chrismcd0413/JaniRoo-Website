import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoSettingsComponent } from './co-settings.component';

describe('CoSettingsComponent', () => {
  let component: CoSettingsComponent;
  let fixture: ComponentFixture<CoSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CoSettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CoSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
