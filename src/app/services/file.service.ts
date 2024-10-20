import { Injectable } from '@angular/core';
import { FileInterface } from '../files/FileInterface';
import { ConcreteFile } from '../files/ConcreteFile';
import { Directory } from '../files/Directory';
import { BehaviorSubject, Observable } from 'rxjs';
import { AstTreeService } from './ast-tree.service';
import { DisplayMode } from '../utils/DisplayMode';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private fileRoot: FileInterface;
  private readonly curFolderPath: BehaviorSubject<string[]>;
  private readonly displayMode: BehaviorSubject<DisplayMode>;

  constructor(
    private readonly astTreeService: AstTreeService,
  ) {
    this.fileRoot = new Directory("", "");
    this.curFolderPath = new BehaviorSubject<string[]>([]);
    this.displayMode = new BehaviorSubject<DisplayMode>(DisplayMode.NO_CONTENT);
  }

  public setByFiles(fileArray: File[]) {
    let newFileRoot: FileInterface;

    // Set new folder root
    let filePath: string[] = fileArray[0].webkitRelativePath.split('/');
    newFileRoot = new Directory("directory", filePath[0]);

    // Set file path
    fileArray.forEach((file: File) => {
      filePath = file.webkitRelativePath.split('/');

      let curFileRoot: FileInterface = newFileRoot;
      for (let idx = 1; idx < filePath.length - 1; ++idx) {
        if (!curFileRoot.getFileList().some((curFile: FileInterface) => {
          return curFile.getName() === filePath[idx];
        })) {
          curFileRoot.addFile(new Directory("directory", filePath[idx]));
        }

        curFileRoot = curFileRoot.getFileList().find((curFile) => {
          return curFile.getName() === filePath[idx];
        })!;
      }

      if (file.name.endsWith("ast.json")) {
        curFileRoot.addFile(new ConcreteFile(file.type, file.name, file));
      }
    });

    // Update current path and mode
    this.fileRoot = newFileRoot;
    this.setCurFolderPath([newFileRoot.getName()]);
    this.setDisplayMode(DisplayMode.FOLDER);
  }

  public getCurFileList(): FileInterface[] {
    let curRoot: FileInterface = this.fileRoot;

    this.curFolderPath.getValue().slice(1).forEach((folderName: string) => {
      curRoot = curRoot.getFileList().find((curFile) => {
        return curFile.getName() === folderName;
      })!;
    });

    return curRoot.getFileList();
  }

  public openSubFile(subFile: FileInterface) {
    let newFolderPath: string[] = this.curFolderPath.getValue();
    newFolderPath.push(subFile.getName());
    this.setCurFolderPath(newFolderPath);

    // Open json file
    if (subFile.isFile()) {
      this.astTreeService.createTreeByFile(subFile.getFile());
      this.setDisplayMode(DisplayMode.TREE);
    } else if (subFile.getFileList().length === 0) {
      this.setDisplayMode(DisplayMode.NO_CONTENT);
    }
  }

  public navFolder(folder: string) {
    // Exclude the case for click event on .json file
    if (folder.includes(".")) {
      return;
    }

    let newFolderPath: string[] = this.curFolderPath.getValue();
    while (newFolderPath.at(newFolderPath.length - 1) !== folder) {
      newFolderPath.pop();
    }

    this.setCurFolderPath(newFolderPath);
    this.setDisplayMode(DisplayMode.FOLDER);
  }

  private setCurFolderPath(path: string[]) {
    this.curFolderPath.next(path);
  }

  private setDisplayMode(mode: DisplayMode) {
    this.displayMode.next(mode);
  }

  public getCurFolderPath(): Observable<string[]> {
    return this.curFolderPath.asObservable();
  }

  public getDisplayMode(): Observable<DisplayMode> {
    return this.displayMode.asObservable();
  }
}

