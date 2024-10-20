import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { AstOption, AstTreeService, OptionList, TreeNode } from '../../../services/ast-tree.service';
import * as d3 from 'd3';
import { skip, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'display-tree',
  standalone: true,
  imports: [],
  templateUrl: './display-tree.component.html',
  styleUrl: './display-tree.component.css'
})
export class DisplayTreeComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @Input() public scale: number = 1;

  @Output() svgSizeChange: EventEmitter<{ width: number, height: number }> = new EventEmitter();

  @ViewChild('treeContainer') private readonly treeContainer!: ElementRef<HTMLDivElement>;

  private readonly destroy$: Subject<void> = new Subject();

  // Tree layout and hierarchy structure
  private hierarchyRoot!: d3.HierarchyNode<D3TreeNodeWrapper>;
  private tree!: d3.TreeLayout<D3TreeNodeWrapper>;

  // svg container, and two layers, one for nodes and one for links
  private svg!: d3.Selection<SVGSVGElement, undefined, null, undefined>;
  private gNode!: d3.Selection<SVGGElement, undefined, null, undefined>;
  private gLink!: d3.Selection<SVGGElement, undefined, null, undefined>;

  // Svg parameters
  private width: number = 3840;
  private height: number = 1080;
  private readonly margin: { top: number, bottom: number, left: number, right: number }
    = { top: 10, bottom: 10, left: 100, right: 10 };

  // Use rectangular for each node, the width of rectangular depends on the length of text
  private readonly rectHeight: number = 50;

  // AST tree data
  private data: D3TreeNodeWrapper;
  private optionList: OptionList;

  constructor(
    private readonly astTreeService: AstTreeService
  ) {
    this.data = new D3TreeNodeWrapper(new TreeNode());
    this.optionList = new OptionList();
  }

  ngOnInit(): void {
    this.createSvg();
    this.createTree();

    // Update AST tree data
    this.astTreeService.getTreeRoot()
      .pipe(
        skip(1),
        takeUntil(this.destroy$)
      )
      .subscribe((treeNode: TreeNode) => {
        this.data = new D3TreeNodeWrapper(treeNode);
        this.createTree();
      });

    this.astTreeService.getCurRoot()
      .pipe(
        skip(1),
        takeUntil(this.destroy$)
      )
      .subscribe((curRoot: TreeNode) => {
        this.update(null, this.hierarchyRoot);
      });

    this.astTreeService.getOptionList()
      .pipe(
        skip(1),
        takeUntil(this.destroy$)
      )
      .subscribe((optionList: OptionList) => {
        this.optionList = optionList;

        if (optionList.options[AstOption.ALWAYS_OPEN]) {
          this.setAlwaysOpen(this.hierarchyRoot);
        }

        this.update(null, this.hierarchyRoot);
      });
  }

  // The container should insert the svg container after both tags are rendered
  ngAfterViewInit(): void {
    this.treeContainer.nativeElement.appendChild(this.svg.node()!);
  }

  // Rescale SVG container depending on scale
  ngOnChanges(changes: SimpleChanges): void {
    if (this.svg && changes['scale']) {
      this.svg.attr("transform", `scale(${this.scale})`);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setAlwaysOpen(node: d3.HierarchyNode<D3TreeNodeWrapper>): void {
    node.data.isOpen = !!node.data.hierarchyChildren;
    node.children = node.data.hierarchyChildren;
    if (node.children) {
      node.children.forEach((d) => this.setAlwaysOpen(d));
    }
  }

  // Create svg and g containers using d3.Selection
  private createSvg(): void {
    this.svg = d3.create("svg")
      .attr("class", "svg-container")
      .attr("width", this.width)
      .attr("height", this.height)
      .attr("viewBox", [-this.margin.left, -this.margin.top, this.width, 10])
      .attr("transform", `scale(${this.scale})`)
      .attr("transform-origin", "top left");

    this.gLink = this.svg.append("g")
      .attr("class", "gLink")
      .attr("fill", "none")

    this.gNode = this.svg.append("g")
      .attr("class", "gNode")
      .attr("cursor", "pointer")
      .attr("pointer-events", "all");
  }

  // Create tree and hierarchy structure
  private createTree(): void {
    this.hierarchyRoot = d3.hierarchy<D3TreeNodeWrapper>(this.data, (d: D3TreeNodeWrapper) => d.children);
    this.tree = d3.tree<D3TreeNodeWrapper>();

    this.hierarchyRoot.data.preX = 0;
    this.hierarchyRoot.data.preY = 0;
    this.hierarchyRoot.descendants().forEach((d: d3.HierarchyNode<D3TreeNodeWrapper>, id: number) => {
      d.data.id = id;
      d.data.hierarchyChildren = d.children;
    })
  }

  // Update layout
  private update(event: Event | null, sourceData: d3.HierarchyNode<D3TreeNodeWrapper>) {
    // Compute new tree layout
    this.tree(this.hierarchyRoot);

    // Get nodes and links of current layout
    let nodes: d3.HierarchyNode<D3TreeNodeWrapper>[] = this.hierarchyRoot.descendants().reverse();
    let links: d3.HierarchyLink<D3TreeNodeWrapper>[] = this.hierarchyRoot.links();

    // Shift node position to folder-liked layout
    this.updateNodeXY(nodes[nodes.length - 1], 0);

    // Resize SVG size
    let left: d3.HierarchyNode<D3TreeNodeWrapper> = this.hierarchyRoot;
    let right: d3.HierarchyNode<D3TreeNodeWrapper> = this.hierarchyRoot;
    nodes.forEach((node: d3.HierarchyNode<D3TreeNodeWrapper>) => {
      if (node.x! < left.x!) {
        left = node;
      }
      if (node.x! > right.x!) {
        right = node;
      }
    })

    this.height = right.x! - left.x! + this.rectHeight + this.margin.top + this.margin.bottom;
    this.width = this.margin.left + this.margin.right + this.getTreeHeight(nodes[nodes.length - 1], this.getRectWidth(nodes[nodes.length - 1].data.treeNode.name));
    this.svg
      .attr("height", this.height)
      .attr("width", this.width)
      .attr("viewBox", `-${this.margin.left} ${left.x! - this.rectHeight - this.margin.top} ${this.width} ${this.height}`);

    this.svgSizeChange.emit({ width: this.width, height: this.height });

    // ========================
    // ===== Node Section =====
    // ========================
    this.updateNodes(nodes, sourceData);

    // ========================
    // ===== Link Section =====
    // ========================
    this.updateLinks(links, sourceData);


    // Store new previous positions
    this.hierarchyRoot.eachBefore((d: d3.HierarchyNode<D3TreeNodeWrapper>) => {
      d.data.preX = d.x!;
      d.data.preY = d.y!;
    });
  }

  // Get current tree height
  private getTreeHeight(node: d3.HierarchyNode<D3TreeNodeWrapper>, curHeight: number): number {
    let newHeight = curHeight;

    if (node.children) {
      node.children.forEach((d: d3.HierarchyNode<D3TreeNodeWrapper>) => {
        newHeight = Math.max(newHeight, curHeight + 30 + this.getRectWidth(d.data.treeNode.name));
        newHeight = Math.max(newHeight, this.getTreeHeight(d, curHeight + 30 + this.getRectWidth(d.data.treeNode.name) / 2));
      });
    }

    return newHeight;
  }

  // Update nodes when data changed
  private async updateNodes(nodes: d3.HierarchyNode<D3TreeNodeWrapper>[], sourceData: d3.HierarchyNode<D3TreeNodeWrapper>): Promise<void> {
    // Insert new nodes
    let node: d3.Selection<SVGGElement, d3.HierarchyNode<D3TreeNodeWrapper>, SVGGElement, undefined>
      = this.gNode.selectAll<SVGGElement, d3.HierarchyNode<D3TreeNodeWrapper>>("g.node")
        .data(nodes, (d: d3.HierarchyNode<D3TreeNodeWrapper>) => d.data.id);

    // Enter: nodes at the parent's previous position
    let nodeEnter: d3.Selection<SVGGElement, d3.HierarchyNode<D3TreeNodeWrapper>, SVGGElement, undefined>
      = node.enter().append("g")
        .attr("class", "node")
        .on("click", (event: MouseEvent, d: d3.HierarchyNode<D3TreeNodeWrapper>) => {
          this.astTreeService.setCurRoot(d.data.treeNode);
          if (!this.optionList.options[AstOption.ALWAYS_OPEN]) {
            d.data.isOpen = d.data.hierarchyChildren ? !d.data.isOpen : false;
            d.children = d.data.isOpen ? d.data.hierarchyChildren : undefined;
            this.update(event, d);
          }
        });

    nodeEnter.append("rect")
      .attr("x", (d) => d.y!)
      .attr("y", (d) => d.x!);
    nodeEnter.append("text")
      .attr("y", (d) => d.x!);

    // Update: transition nodes to their new position
    let nodeUpdate: d3.Selection<SVGGElement, d3.HierarchyNode<D3TreeNodeWrapper>, SVGGElement, undefined>
      = node.merge(nodeEnter)
        .attr("fill-opacity", 1)
        .attr("stroke-opacity", 1)
        .attr("will-change", "transform");

    nodeUpdate.select("rect")
      .attr("width", (d) => this.getRectWidth(d.data.treeNode.name))
      .attr("height", this.rectHeight)
      .attr("x", (d) => d.y! - (this.getRectWidth(d.data.treeNode.name) / 2))
      .attr("y", (d) => d.x! - this.rectHeight)
      .attr("rx", 18)
      .attr("fill", "#484f58")
      .attr("fill-opacity", 1)
      .attr("stroke", (d: d3.HierarchyNode<D3TreeNodeWrapper>) => {
        if (d.data.treeNode.id === this.astTreeService.getCurRootValue().id) {
          return "#39FF14";
        }
        return "#555";
      })
      .attr("stroke-width", 2);

    nodeUpdate.select("text")
      .text(d => d.data.treeNode.name)
      .attr("font-family", "Consolas")
      .attr("font-size", "15px")
      .attr("x", (d) => d.y!)
      .attr("y", (d) => d.x! - this.rectHeight / 2)
      .attr("dy", "0.31em")
      .attr("fill", "white")
      .attr("text-anchor", "middle")
      .attr("stroke-linejoin", "round")
      .attr("paint-order", "stroke");

    let duration: number = 1;
    let timer: d3.Timer = d3.timer((elapsed) => {
      this.animateNodeUpdate(nodeUpdate, elapsed, duration);
      if (elapsed > duration + 50) timer.stop();
    })

    // Exit: transition exiting nodesto the parent's new position
    node.exit<d3.HierarchyNode<D3TreeNodeWrapper>>()
      .remove()
      .attr("fill-opacity", 0)
      .attr("stoke-opacity", 0);
  }

  // Update links when data changed
  private async updateLinks(links: d3.HierarchyLink<D3TreeNodeWrapper>[], sourceData: d3.HierarchyNode<D3TreeNodeWrapper>): Promise<void> {
    let link: d3.Selection<SVGPathElement, d3.HierarchyLink<D3TreeNodeWrapper>, SVGGElement, undefined>
      = this.gLink.selectAll<SVGPathElement, d3.HierarchyLink<D3TreeNodeWrapper>>("path.link")
        .data(links, (d: d3.HierarchyLink<D3TreeNodeWrapper>) => d.target.data.id);

    // Enter: links at the parent's previous position
    let linkEnter: d3.Selection<SVGPathElement, d3.HierarchyLink<D3TreeNodeWrapper>, SVGGElement, undefined>
      = link.enter().append("path")
        .attr("class", "link")

    // Update: transition links to their new position
    link.merge(linkEnter)
      .attr("d", (d: d3.HierarchyLink<D3TreeNodeWrapper>) =>
        `M${d.source.y},${d.source.x} V${d.target.x! - this.rectHeight / 2} H${d.target.y! - this.getRectWidth(d.target.data.treeNode.name) / 2}`)
      .attr("fill-opacity", 1)
      .attr("stroke", '#8b949e')
      .attr("stroke-width", 5)
      .attr("stroke-opacity", 1);

    // Exit: transition existing links to the parent's new position
    link.exit<d3.HierarchyLink<D3TreeNodeWrapper>>()
      .remove()
      .attr("stroke-opacity", 0);
  }

  // Update nodes position
  private updateNodeXY(node: d3.HierarchyNode<D3TreeNodeWrapper>, curX: number): number {
    node.x = curX;

    if (node.parent) {
      node.y = node.parent.y! + 30 + this.getRectWidth(node.data.treeNode.name) / 2;
    }

    if (node.children) {
      node.children.forEach((child: d3.HierarchyNode<D3TreeNodeWrapper>) => {
        curX = this.updateNodeXY(child, curX + this.rectHeight + 15);
      });
    }

    return curX;
  }

  // Get width of rectangular depedning on current text width
  private getRectWidth(text: string) {
    const canvas: HTMLCanvasElement = document.createElement('canvas');
    const context: CanvasRenderingContext2D = canvas.getContext('2d')!;
    context.font = `${15}px Consolas`;
    const metrics: TextMetrics = context.measureText(text);
    return metrics.width + 30;
  }

  public getTreeContainer(): ElementRef<HTMLDivElement> {
    return this.treeContainer;
  }

  private animateNodeUpdate(
    selection: d3.Selection<SVGGElement, d3.HierarchyNode<D3TreeNodeWrapper>, SVGGElement, undefined>,
    elapsed: number,
    duration: number
  ) {
    // const process: number = Math.min(elapsed / duration, 1);
    // selection.attr("transform", (d) => {
    //   const newX = d.data.preX + (d.x! - d.data.preX) * process;
    //   const newY = d.data.preY + (d.y! - d.data.preY) * process;
    //   return `translate(${newY},${newX})`;
    // });
  }
}


// Class to wrap original AST tree data
export class D3TreeNodeWrapper {
  public id: number;                     // Index in the hierarcy structure, using BFS ordering
  public isOpen: boolean;                // Flag to open nodes
  public treeNode: TreeNode;             // Original AST data
  public children: D3TreeNodeWrapper[];  // Wrapper of children

  // Copy of children after insert into hierarchy structure, used for changing layout depending on opened or closed state
  public hierarchyChildren: d3.HierarchyNode<D3TreeNodeWrapper>[] | undefined;

  // Previous positions for the node
  public preX: number;
  public preY: number;

  constructor(rootNode: TreeNode) {
    this.id = 0;
    this.isOpen = rootNode.children.length > 0;
    this.treeNode = rootNode;
    this.children = [];
    this.hierarchyChildren = undefined;
    this.preX = 0;
    this.preY = 0;

    rootNode.children.forEach((node: TreeNode) => {
      this.children.push(new D3TreeNodeWrapper(node));
    });
  }
}