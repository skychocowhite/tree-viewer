import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayZoomComponent } from './display-zoom.component';

describe('DisplayZoomComponent', () => {
  let component: DisplayZoomComponent;
  let fixture: ComponentFixture<DisplayZoomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisplayZoomComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DisplayZoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
