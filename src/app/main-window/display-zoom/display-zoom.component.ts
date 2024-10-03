import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { DisplayTreeComponent } from "../display-tree/display-tree.component";

@Component({
  selector: 'display-zoom',
  standalone: true,
  imports: [
    CommonModule,
    DisplayTreeComponent
  ],
  templateUrl: './display-zoom.component.html',
  styleUrl: './display-zoom.component.css'
})
export class DisplayZoomComponent {
  public readonly minScale: number = 1;
  public readonly maxScale: number = 100;
  public readonly scaleStep: number = 0.5

  public scale: number = 1;

  private zoomIn(): void {
    if (this.scale + this.scaleStep <= this.maxScale) {
      this.scale += this.scaleStep;
    }
  }

  private zoomOut(): void {
    if (this.scale - this.scaleStep >= this.minScale) {
      this.scale -= this.scaleStep;
    }
  }

  @HostListener('wheel', ['$event'])
  public onScroll(event: WheelEvent) {
    if (event.ctrlKey) {
      event.preventDefault();

      if (event.deltaY < 0) {
        this.zoomIn();
      } else {
        this.zoomOut();
      }
    }
  }
}
