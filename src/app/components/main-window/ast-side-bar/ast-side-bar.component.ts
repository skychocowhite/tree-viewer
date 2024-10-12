import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { AstTreeService, OptionList, TreeNode } from '../../../services/ast-tree.service';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'ast-side-bar',
  standalone: true,
  imports: [
    MatCheckboxModule,
  ],
  templateUrl: './ast-side-bar.component.html',
  styleUrl: './ast-side-bar.component.css'
})
export class AstSideBarComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() public parentHeight!: number;
  @Input() public parentWidth!: number;

  @ViewChild('astSidebar') public astSidebar!: ElementRef<HTMLDivElement>;
  @ViewChild('code') public code!: ElementRef<HTMLDivElement>;

  public curRoot: TreeNode;
  public optionList: OptionList;

  constructor(
    private readonly astTreeService: AstTreeService
  ) {
    this.curRoot = new TreeNode();
    this.optionList = new OptionList();
  }

  ngOnInit(): void {
    this.astTreeService.getCurRoot().subscribe((curRoot: TreeNode) => {
      this.curRoot = curRoot;
      this.insertCode();
    })

    this.astTreeService.getOptionList().subscribe((optionList: OptionList) => {
      this.optionList = optionList;
    });
  }

  ngAfterViewInit(): void {
    if (this.astSidebar) {
      this.astSidebar.nativeElement.style.height = this.parentHeight + 'px';
      this.astSidebar.nativeElement.style.width = this.parentWidth + 'px';
    }
    if (this.code) {
      this.insertCode();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.astSidebar && changes['parentWidth']) {
      this.astSidebar.nativeElement.style.width = this.parentWidth + 'px';
    }
  }

  private insertCode(): void {
    if (this.code) {
      this.code.nativeElement.innerHTML = "";
      this.curRoot.code.split('\n').forEach((line: string) => {
        let divElement: HTMLDivElement = document.createElement("div");
        let spanElement: HTMLSpanElement = document.createElement("span");

        divElement.classList.add("code-line-block");
        spanElement.classList.add("code-line");
        spanElement.innerHTML = " ";
        spanElement.innerHTML += line;

        divElement.appendChild(spanElement);
        this.code.nativeElement.appendChild(divElement);
      });
    }
  }

  public toggleSuspendOpenClose(event: MouseEvent): void {
    this.optionList.options['suspendOpenClose'] = !this.optionList.options['suspendOpenClose'];
    this.astTreeService.setOptionList(this.optionList);
  }
}
