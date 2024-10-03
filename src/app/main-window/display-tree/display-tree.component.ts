import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AstTreeService, TreeNode } from '../../services/ast-tree.service';
import * as d3 from 'd3';

@Component({
  selector: 'display-tree',
  standalone: true,
  imports: [],
  templateUrl: './display-tree.component.html',
  styleUrl: './display-tree.component.css'
})
export class DisplayTreeComponent implements OnInit, AfterViewInit {
  @ViewChild('treeContainer') private readonly treeContainer!: ElementRef<HTMLElement>;

  // Tree layout and hierarchy structure
  private hierarchyRoot!: d3.HierarchyNode<D3TreeNodeImpl>;
  private tree!: d3.TreeLayout<D3TreeNodeImpl>;

  // svg container, and two layers, one for nodes and one for links
  private svg!: d3.Selection<SVGSVGElement, undefined, null, undefined>;
  private gNode!: d3.Selection<SVGGElement, undefined, null, undefined>;
  private gLink!: d3.Selection<SVGGElement, undefined, null, undefined>;

  // Svg parameters
  private width: number = 3840;
  private height: number = 1080;
  private margin: { top: number, bottom: number, left: number, right: number }
    = { top: 10, bottom: 10, left: 150, right: 10 };
  private dx!: number;
  private dy!: number;

  // AST tree data
  private data: D3TreeNodeImpl;

  constructor(private readonly astTreeService: AstTreeService) {
    this.data = new D3TreeNodeImpl(new TreeNode(""));
  }

  ngOnInit(): void {
    this.createSvg();
    this.createTree();
    this.update(null, this.hierarchyRoot);

    this.astTreeService.getTreeRoot().subscribe((treeNode: TreeNode) => {
      this.data = new D3TreeNodeImpl(treeNode);
      this.createTree();
      this.update(null, this.hierarchyRoot);
    });
  }

  ngAfterViewInit(): void {
    this.treeContainer.nativeElement.appendChild(this.svg.node()!);
  }

  private createSvg(): void {
    this.svg = d3.create("svg")
      .attr("class", "svg-container")
      .attr("width", this.width)
      .attr("height", this.height)
      .attr("viewBox", [-this.margin.left, -this.margin.top, this.width, 10]);

    this.gNode = this.svg.append("g")
      .attr("class", "gNode")
      .attr("cursor", "pointer")
      .attr("pointer-events", "all");

    this.gLink = this.svg.append("g")
      .attr("class", "gLink")
      .attr("fill", "none")
      .attr("stroke", "#555")
      .attr("stroke-width", 1.5)
      .attr("stroke-opacity", 0.4);
  }

  private createTree(): void {
    this.hierarchyRoot = d3.hierarchy<D3TreeNodeImpl>(this.data, (d: D3TreeNodeImpl) => d.children);
    this.dx = 20;
    this.width = this.margin.left + this.margin.right + (this.hierarchyRoot.height + 1) * 300
    this.dy = (this.width - this.margin.left - this.margin.right) / (1 + this.hierarchyRoot.height);
    this.tree = d3.tree<D3TreeNodeImpl>().nodeSize([this.dx, this.dy]);

    this.hierarchyRoot.data.preX = this.dy / 2;
    this.hierarchyRoot.data.preY = 0;
    this.hierarchyRoot.descendants().forEach((d: d3.HierarchyNode<D3TreeNodeImpl>, id: number) => {
      d.data.id = id;
      d.data.hierarchyChildren = d.children;
    })
  }

  private update(event: Event | null, sourceData: d3.HierarchyNode<D3TreeNodeImpl>) {
    // Compute new tree layout
    this.tree(this.hierarchyRoot);
    let nodes: d3.HierarchyNode<D3TreeNodeImpl>[] = this.hierarchyRoot.descendants().reverse();
    let links: d3.HierarchyLink<D3TreeNodeImpl>[] = this.hierarchyRoot.links();

    // Resize SVG and tree layout
    let left: d3.HierarchyNode<D3TreeNodeImpl> = this.hierarchyRoot;
    let right: d3.HierarchyNode<D3TreeNodeImpl> = this.hierarchyRoot;
    this.hierarchyRoot.eachBefore((node: d3.HierarchyNode<D3TreeNodeImpl>) => {
      if (node.x! < left.x!) {
        left = node;
      }
      if (node.x! > right.x!) {
        right = node;
      }
    })
    this.height = right.x! - left.x! + this.margin.top + this.margin.bottom;
    this.width = this.margin.left + this.margin.right + (this.hierarchyRoot.height + 1) * 300
    this.dy = (this.width - this.margin.left - this.margin.right) / (1 + this.hierarchyRoot.height);
    this.tree.nodeSize([this.dx, this.dy]);

    this.svg.transition()
      .duration(250)
      .attr("height", this.height)
      .attr("width", this.width)
      .attr("viewBox", `-${this.margin.left} ${left.x! - this.margin.top} ${this.width} ${this.height}`);


    // ========================
    // ===== Node Section =====
    // ========================

    // Update nodes
    let node: d3.Selection<SVGGElement, d3.HierarchyNode<D3TreeNodeImpl>, SVGGElement, undefined>
      = this.gNode.selectAll<SVGGElement, d3.HierarchyNode<D3TreeNodeImpl>>("g.node")
        .data(nodes, (d: d3.HierarchyNode<D3TreeNodeImpl>) => d.data.id);

    // Enter nodes at the parent's previous position
    let nodeEnter: d3.Selection<SVGGElement, d3.HierarchyNode<D3TreeNodeImpl>, SVGGElement, undefined>
      = node.enter().append("g")
        .attr("class", "node")
        .attr("transform", (d: d3.HierarchyNode<D3TreeNodeImpl>) => `translate(${sourceData.data.preY},${sourceData.data.preX})`)
        .attr("fill-opacity", 0)
        .attr("stroke-opacity", 0)
        .on("click", (event: MouseEvent, d: d3.HierarchyNode<D3TreeNodeImpl>) => {
          d.data.isOpen = d.data.hierarchyChildren ? !d.data.isOpen : false;
          d.children = d.data.isOpen ? d.data.hierarchyChildren : undefined;
          this.update(event, d);
        });

    nodeEnter.append("circle")
      .attr("r", 2.5)
      .attr("fill", (d: d3.HierarchyNode<D3TreeNodeImpl>) => d.data.hierarchyChildren ? "#555" : "#999")
      .attr("stroke-width", 10);

    nodeEnter.append("text")
      .attr("dy", "0.31em")
      .attr("x", -6)
      .attr("text-anchor", "end")
      .text(d => d.data.treeNode.name)
      .attr("stroke-linejoin", "round")
      .attr("stroke-width", 3)
      .attr("stroke", "white")
      .attr("paint-order", "stroke");

    // Update: Transition nodes to their new position
    let nodeUpdate: d3.Transition<SVGGElement, d3.HierarchyNode<D3TreeNodeImpl>, SVGGElement, undefined>
      = node.merge(nodeEnter)
        .transition()
        .duration(250)
        .attr("transform", (d: d3.HierarchyNode<D3TreeNodeImpl>) => `translate(${d.y},${d.x})`)
        .attr("fill-opacity", 1)
        .attr("stroke-opacity", 1);

    nodeUpdate.select("circle")
      .attr("fill", (d: d3.HierarchyNode<D3TreeNodeImpl>) => d.data.hierarchyChildren ? "#555" : "#999");

    nodeUpdate.select("text")
      .text(d => d.data.treeNode.name);

    // Exit: Transition exiting nodesto the parent's new position
    let nodeExit: d3.Transition<SVGGElement, d3.HierarchyNode<D3TreeNodeImpl>, SVGGElement, undefined>
      = node.exit<d3.HierarchyNode<D3TreeNodeImpl>>()
        .transition()
        .duration(250)
        .remove()
        .attr("transform", (d: d3.HierarchyNode<D3TreeNodeImpl>) => `translate(${sourceData.y},${sourceData.x})`)
        .attr("fill-opacity", 0)
        .attr("stoke-opacity", 0);


    // ========================
    // ===== Link Section =====
    // ========================

    let diagonal: d3.Link<any, d3.HierarchyLink<D3TreeNodeImpl>, d3.HierarchyNode<D3TreeNodeImpl>>
      = d3.linkHorizontal<d3.HierarchyLink<D3TreeNodeImpl>, d3.HierarchyNode<D3TreeNodeImpl>>()
        .x((d: d3.HierarchyNode<D3TreeNodeImpl>) => d.y!)
        .y((d: d3.HierarchyNode<D3TreeNodeImpl>) => d.x!);

    // Update links
    let link: d3.Selection<SVGPathElement, d3.HierarchyLink<D3TreeNodeImpl>, SVGGElement, undefined>
      = this.gLink.selectAll<SVGPathElement, d3.HierarchyLink<D3TreeNodeImpl>>("path")
        .data(links, (d: d3.HierarchyLink<D3TreeNodeImpl>) => d.target.data.id);

    // Enter links at the parent's previous position
    let linkEnter: d3.Selection<SVGPathElement, d3.HierarchyLink<D3TreeNodeImpl>, SVGGElement, undefined>
      = link.enter().append("path")
        .attr("d", (d: d3.HierarchyLink<D3TreeNodeImpl>) => {
          let o: { x: number, y: number } = { x: sourceData.data.preX, y: sourceData.data.preY };
          return diagonal(d, { source: o, target: o });
        });

    // Update: transition links to their new position
    let linkUpdate: d3.Transition<SVGPathElement, d3.HierarchyLink<D3TreeNodeImpl>, SVGGElement, undefined>
      = link.merge(linkEnter)
        .transition()
        .duration(250)
        .attr("d", diagonal);

    // Exit: transition existing links to the parent's new position
    let linkExit: d3.Transition<SVGPathElement, d3.HierarchyLink<D3TreeNodeImpl>, SVGGElement, undefined>
      = link.exit<d3.HierarchyLink<D3TreeNodeImpl>>()
        .transition()
        .duration(250)
        .remove()
        .attr("d", (d: d3.HierarchyLink<D3TreeNodeImpl>) => {
          let o: { x: number, y: number } = { x: sourceData.x!, y: sourceData.y! };
          return diagonal(d, { source: o, target: o });
        })


    this.hierarchyRoot.eachBefore((d: d3.HierarchyNode<D3TreeNodeImpl>) => {
      d.data.preX = d.x!;
      d.data.preY = d.y!;
    });
  }
}


class D3TreeNodeImpl {
  public id: number;
  public isOpen: boolean;
  public treeNode: TreeNode;
  public children: D3TreeNodeImpl[];
  public hierarchyChildren: d3.HierarchyNode<D3TreeNodeImpl>[] | undefined;
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
      this.children.push(new D3TreeNodeImpl(node));
    });
  }
}