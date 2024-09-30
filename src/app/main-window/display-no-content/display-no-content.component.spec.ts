import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayNoContentComponent } from './display-no-content.component';

describe('DisplayNoContentComponent', () => {
  let component: DisplayNoContentComponent;
  let fixture: ComponentFixture<DisplayNoContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisplayNoContentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DisplayNoContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
