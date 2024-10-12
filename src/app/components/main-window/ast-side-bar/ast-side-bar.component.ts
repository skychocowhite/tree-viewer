import { AfterViewInit, Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';

@Component({
  selector: 'ast-side-bar',
  standalone: true,
  imports: [],
  templateUrl: './ast-side-bar.component.html',
  styleUrl: './ast-side-bar.component.css'
})
export class AstSideBarComponent implements AfterViewInit, OnChanges {
  @Input() public parentHeight!: number;
  @Input() public parentWidth!: number;

  @ViewChild('astSidebar') public astSidebar!: ElementRef<HTMLDivElement>;


  ngAfterViewInit(): void {
    if (this.astSidebar) {
      this.astSidebar.nativeElement.style.height = this.parentHeight + 'px';
      this.astSidebar.nativeElement.style.width = this.parentWidth + 'px';
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.astSidebar && changes['parentWidth']) {
      this.astSidebar.nativeElement.style.width = this.parentWidth + 'px';
    }
  }
}
