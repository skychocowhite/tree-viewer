import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
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
export class DisplayZoomComponent implements OnChanges {
  @Input() public parentHeight!: number;
  @Input() public parentWidth!: number;

  @ViewChild('zoomWrapper') public zoomWrapper!: ElementRef<HTMLDivElement>;
  @ViewChild(DisplayTreeComponent) public treeComponent!: DisplayTreeComponent;

  public readonly minScale: number = 0.1;
  public readonly maxScale: number = 3;
  public readonly scaleStep: number = 0.1

  public svgWidth: number = 0;
  public svgHeight: number = 0;
  public scale: number = 1;


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['parentWidth']) {
      this.parentWidth = changes['parentWidth'].currentValue;
      this.changeScrollBar();
    }
  }

  private zoomIn(): void {
    if (this.scale + this.scaleStep <= this.maxScale) {
      this.scale += this.scaleStep;
      this.changeScrollBar();
    }
  }

  private zoomOut(): void {
    if (this.scale - this.scaleStep >= this.minScale) {
      this.scale -= this.scaleStep;
      this.changeScrollBar();
    }
  }

  public onSvgSizeChanged(event: { width: number, height: number }): void {
    this.svgWidth = event.width;
    this.svgHeight = event.height;
    this.changeScrollBar();
  }

  public changeScrollBar(): void {
    if (this.zoomWrapper) {
      let treeContainer: ElementRef<HTMLDivElement> = this.treeComponent.getTreeContainer();

      this.zoomWrapper.nativeElement.style.height = this.parentHeight + 'px';
      this.zoomWrapper.nativeElement.style.width = this.parentWidth + 'px';

      if (this.parentHeight >= this.svgHeight * this.scale) {
        treeContainer.nativeElement.style.height = this.parentHeight + 'px';
      } else {
        treeContainer.nativeElement.style.height = this.svgHeight * this.scale + 'px';
      }

      if (this.parentWidth >= this.svgWidth * this.scale) {
        treeContainer.nativeElement.style.width = this.parentWidth + 'px';
      } else {
        treeContainer.nativeElement.style.width = this.svgWidth * this.scale + 'px';
      }
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
