import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AstTreeService {
  private readonly treeRoot: BehaviorSubject<TreeNode>;
  private readonly curRoot: BehaviorSubject<TreeNode>;
  private readonly optionList: BehaviorSubject<OptionList>;

  constructor() {
    this.treeRoot = new BehaviorSubject<TreeNode>(new TreeNode("", ""));
    this.curRoot = new BehaviorSubject<TreeNode>(new TreeNode("", ""));

    this.optionList = new BehaviorSubject<OptionList>(new OptionList());
    this.optionList.getValue().addOption('suspendOpenClose');
  }

  public createTreeByFile(file: File): void {
    const reader = new FileReader();

    // Read AST from JSON data format
    if (file.type === "application/json") {
      reader.onload = (ev: ProgressEvent<FileReader>) => {
        try {
          let jsonData: AstJsonObj = JSON.parse(ev.target!.result as string);
          let newTreeRoot: TreeNode = new TreeNode(jsonData.nodeType, jsonData.code);
          this.createTree(jsonData, newTreeRoot);
          this.setTreeRoot(newTreeRoot);
          this.setCurRoot(newTreeRoot);
        } catch (err: any) {
          console.error(err);
        }
      };
      reader.readAsText(file);
    }

  }

  private createTree(jsonData: AstJsonObj, curRoot: TreeNode) {
    jsonData.children.forEach((childData: AstJsonObj) => {
      curRoot.children.push(new TreeNode(childData.nodeType, childData.code));
      this.createTree(childData, curRoot.children[curRoot.children.length - 1]);
    });
  }

  public getTreeRoot(): Observable<TreeNode> {
    return this.treeRoot.asObservable();
  }

  public getCurRoot(): Observable<TreeNode> {
    return this.curRoot.asObservable();
  }

  public getOptionList(): Observable<OptionList> {
    return this.optionList.asObservable();
  }

  public setTreeRoot(treeRoot: TreeNode): void {
    this.treeRoot.next(treeRoot);
  }

  public setCurRoot(curRoot: TreeNode): void {
    this.curRoot.next(curRoot);
  }

  public setOptionList(optionList: OptionList): void {
    this.optionList.next(optionList);
  }
}

export class TreeNode {
  public name: string;
  public children: TreeNode[];
  public code: string;

  constructor(name: string, code: string) {
    this.name = name;
    this.children = [];
    this.code = code;
  }
}

export class OptionList {
  public options: { [key: string]: boolean };

  constructor() {
    this.options = {};
  }

  public addOption(key: string): this {
    this.options[key] = false;
    return this;
  }

  public toggleOption(key: string): void {
    if (key in this.options) {
      this.options[key] = !this.options[key];
    }
  }
}

interface AstJsonObj {
  nodeType: string;
  code: string;
  children: AstJsonObj[];
}
