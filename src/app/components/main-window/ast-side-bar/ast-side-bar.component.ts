import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { AstOption, AstTreeService, OptionList, TreeNode } from '../../../services/ast-tree.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { skip, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'ast-side-bar',
  standalone: true,
  imports: [
    MatCheckboxModule,
  ],
  templateUrl: './ast-side-bar.component.html',
  styleUrl: './ast-side-bar.component.css'
})
export class AstSideBarComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @Input() public parentHeight!: number;
  @Input() public parentWidth!: number;

  @ViewChild('astSidebar') public astSidebar!: ElementRef<HTMLDivElement>;
  @ViewChild('code') public code!: ElementRef<HTMLDivElement>;
  @ViewChild('codeNumber') public codeNumber!: ElementRef<HTMLDivElement>;

  private readonly destroy$: Subject<void> = new Subject();

  AstOption: typeof AstOption = AstOption;
  public optionList: OptionList;

  public curRoot: TreeNode;

  constructor(
    private readonly astTreeService: AstTreeService
  ) {
    this.optionList = new OptionList();
    this.curRoot = new TreeNode();
  }

  ngOnInit(): void {
    this.astTreeService.getCurRoot()
      .pipe(
        skip(1),
        takeUntil(this.destroy$)
      )
      .subscribe((curRoot: TreeNode) => {
        this.curRoot = curRoot;
        this.render();
      })

    this.astTreeService.getOptionList()
      .pipe(
        skip(1),
        takeUntil(this.destroy$)
      )
      .subscribe((optionList: OptionList) => {
        this.optionList = optionList;
        this.render();
      });
  }

  ngAfterViewInit(): void {
    if (this.astSidebar) {
      this.astSidebar.nativeElement.style.height = this.parentHeight + 'px';
      this.astSidebar.nativeElement.style.width = this.parentWidth + 'px';
    }
    if (this.code) {
      this.render();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.astSidebar && changes['parentHeight']) {
      this.astSidebar.nativeElement.style.height = this.parentHeight + 'px';
    }

    if (this.astSidebar && changes['parentWidth']) {
      this.astSidebar.nativeElement.style.width = this.parentWidth + 'px';
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private render(): void {
    if (this.optionList.options[AstOption.HIGHLIGHT_SELECTED]) {
      this.renderCode(this.astTreeService.getTreeRootValue());
    } else {
      this.renderCode(this.astTreeService.getCurRootValue());
    }
  }

  private renderCode(renderNode: TreeNode): void {
    if (this.code) {
      this.code.nativeElement.textContent = "";
      this.codeNumber.nativeElement.textContent = "";

      renderNode.code.split('\n').forEach((line: string, lineIndex: number) => {
        this.handleLineNum(line, lineIndex + 1);
        this.handleLineCode(line, lineIndex + 1);
      });
    }
  }

  private handleLineCode(line: string, lineNum: number) {
    let codeLineDivElement: HTMLDivElement = document.createElement("div");
    let codeLineSpanElement: HTMLSpanElement;
    let spanElements: HTMLSpanElement[] = [];
    let range = this.astTreeService.getCurRootValue().range;

    codeLineDivElement.classList.add("code-line-block");

    if (this.optionList.options[AstOption.HIGHLIGHT_SELECTED] && range) {
      codeLineSpanElement = document.createElement("span");
      codeLineSpanElement.classList.add("code-line");

      if (range.begin.line < lineNum && lineNum < range.end.line) {
        codeLineSpanElement.classList.add("hl-c");
        codeLineSpanElement.textContent = " " + line;
        spanElements.push(codeLineSpanElement);
      } else if (lineNum === range.begin.line && range.lineCount === 1) {
        // head non-highlighted part
        codeLineSpanElement.textContent = " " + line.substring(0, range.begin.column - 1);
        spanElements.push(codeLineSpanElement);

        // middle highlighted part
        codeLineSpanElement = document.createElement("span");
        codeLineSpanElement.classList.add("code-line", "hl-c");
        codeLineSpanElement.textContent = line.substring(range.begin.column - 1, range.end.column);
        spanElements.push(codeLineSpanElement);

        // tail non-highlighted part
        codeLineSpanElement = document.createElement("span");
        codeLineSpanElement.classList.add("code-line");
        codeLineSpanElement.textContent = line.substring(range.end.column);
        spanElements.push(codeLineSpanElement);
      } else if (lineNum === range.begin.line) {
        // head non-highlighted part
        codeLineSpanElement.textContent = " " + line.substring(0, range.begin.column - 1);
        spanElements.push(codeLineSpanElement);

        // middle highlighted part
        codeLineSpanElement = document.createElement("span");
        codeLineSpanElement.classList.add("code-line", "hl-c");
        codeLineSpanElement.textContent = line.substring(range.begin.column - 1);
        spanElements.push(codeLineSpanElement);
      } else if (lineNum === range.end.line) {
        // middle highlighted part
        codeLineSpanElement = document.createElement("span");
        codeLineSpanElement.classList.add("code-line", "hl-c");
        codeLineSpanElement.textContent = " " + line.substring(0, range.end.column);
        spanElements.push(codeLineSpanElement);

        // tail non-highlighted part
        codeLineSpanElement = document.createElement("span");
        codeLineSpanElement.classList.add("code-line");
        codeLineSpanElement.textContent = line.substring(range.end.column);
        spanElements.push(codeLineSpanElement);
      } else {
        codeLineSpanElement.textContent = " " + line;
        spanElements.push(codeLineSpanElement);
      }
    } else {
      codeLineSpanElement = document.createElement("span");
      codeLineSpanElement.classList.add("code-line");
      codeLineSpanElement.textContent = " " + line;

      // UnknownType node
      if (!this.optionList.options[AstOption.HIGHLIGHT_SELECTED] &&
        this.astTreeService.getCurRootValue().name === "UnknownType") {
        codeLineSpanElement.textContent = "Unknown Type";
      }
      spanElements.push(codeLineSpanElement);
    }

    spanElements.forEach((spanElement: HTMLSpanElement) => {
      codeLineDivElement.appendChild(spanElement);
    });
    this.code.nativeElement.appendChild(codeLineDivElement);
  }

  private handleLineNum(line: string, lineNum: number) {
    let codeNumDivElement: HTMLDivElement = document.createElement("div");
    let codeNumSpanElement: HTMLSpanElement = document.createElement("span");
    let range = this.astTreeService.getCurRootValue().range;

    codeNumDivElement.classList.add("code-line-number-block");
    codeNumSpanElement.classList.add("code-line-number");

    if (this.optionList.options[AstOption.HIGHLIGHT_SELECTED] && range) {
      if (range.begin.line <= lineNum && lineNum <= range.end.line) {
        codeNumSpanElement.classList.add("hl-n");
      }
    }

    let numberStr: string = (lineNum).toString();
    for (let i: number = 4 - numberStr.length; i > 0; --i) {
      codeNumSpanElement.textContent += " ";
    }
    codeNumSpanElement.textContent += numberStr;

    // UnknownType Node
    if (!this.optionList.options[AstOption.HIGHLIGHT_SELECTED] &&
      this.astTreeService.getCurRootValue().name === "UnknownType") {
      codeNumSpanElement.textContent = "XXXX";
    }

    codeNumDivElement.appendChild(codeNumSpanElement);
    this.codeNumber.nativeElement.appendChild(codeNumDivElement);
  }

  public toggleAlwaysOpen(): void {
    this.optionList.options[AstOption.ALWAYS_OPEN] = !this.optionList.options[AstOption.ALWAYS_OPEN];
    this.astTreeService.setOptionList(this.optionList);
  }

  public toggleHightlight(): void {
    this.optionList.options[AstOption.HIGHLIGHT_SELECTED] = !this.optionList.options[AstOption.HIGHLIGHT_SELECTED];
    this.astTreeService.setOptionList(this.optionList);
  }
}
