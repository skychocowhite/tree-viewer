import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AstSideBarComponent } from './ast-side-bar.component';

describe('AstSideBarComponent', () => {
  let component: AstSideBarComponent;
  let fixture: ComponentFixture<AstSideBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AstSideBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AstSideBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
