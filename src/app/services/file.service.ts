import { Injectable } from '@angular/core';
import { FileInterface } from '../files/FileInterface';
import { ConcreteFile } from '../files/ConcreteFile';
import { Directory } from '../files/Directory';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private fileRoot: FileInterface;
  private curFolderPath: BehaviorSubject<string[]>;

  constructor() {
    this.fileRoot = new Directory("", "");
    this.curFolderPath = new BehaviorSubject<string[]>([]);
  }

  public setByFiles(files: FileList) {
    let fileArray: File[] = Array.from(files);
    let newFileRoot: FileInterface;

    // Set new folder root
    let filePath: string[] = files[0].webkitRelativePath.split('/');
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

      curFileRoot.addFile(new ConcreteFile(file.type, file.name, file));
    });

    // Update current path
    console.log(newFileRoot);
    this.setCurFolderPath([newFileRoot.getName()]);
  }

  private setCurFolderPath(path: string[]) {
    this.curFolderPath.next(path);
  }

  public getCurFolderPath(): Observable<string[]> {
    return this.curFolderPath.asObservable();
  }
}
