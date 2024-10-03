import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AstTreeService {
  private readonly treeRoot: BehaviorSubject<TreeNode>;

  constructor() {
    this.treeRoot = new BehaviorSubject<TreeNode>(new TreeNode(""));
  }

  public createTreeByFile(file: File): void {
    const reader = new FileReader();

    // Read AST from JSON data format
    if (file.type === "application/json") {
      reader.onload = (ev: ProgressEvent<FileReader>) => {
        try {
          let jsonData: AstJsonObj = JSON.parse(ev.target!.result as string);
          let newTreeRoot: TreeNode = new TreeNode(jsonData.nodeType);
          this.createTree(jsonData, newTreeRoot);
          this.setTreeRoot(newTreeRoot);
          console.log(newTreeRoot);
        } catch (err: any) {
          console.error(err);
        }
      };
      reader.readAsText(file);
    }

  }

  private createTree(jsonData: AstJsonObj, curRoot: TreeNode) {
    jsonData.children.forEach((childData: AstJsonObj) => {
      curRoot.children.push(new TreeNode(childData.nodeType));
      this.createTree(childData, curRoot.children[curRoot.children.length - 1]);
    });
  }

  public getTreeRoot(): Observable<TreeNode> {
    return this.treeRoot.asObservable();
  }

  public setTreeRoot(treeRoot: TreeNode): void {
    this.treeRoot.next(treeRoot);
  }
}

export class TreeNode {
  public name: string;
  public children: TreeNode[];

  constructor(name: string) {
    this.name = name;
    this.children = [];
  }
}

interface AstJsonObj {
  nodeType: string;
  code: string;
  children: AstJsonObj[];
}
