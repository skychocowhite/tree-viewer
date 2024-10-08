import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayTreeComponent } from './display-tree.component';

describe('DisplayTreeComponent', () => {
  let component: DisplayTreeComponent;
  let fixture: ComponentFixture<DisplayTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisplayTreeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DisplayTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
