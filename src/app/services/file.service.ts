import { Injectable } from '@angular/core';
import { FileInterface } from '../files/FileInterface';
import { ConcreteFile } from '../files/ConcreteFile';
import { Directory } from '../files/Directory';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private fileRoot: FileInterface;

  constructor() {
    this.fileRoot = new Directory("", "");
  }

  public setByFiles(files: FileList) {
    let fileArray: File[] = Array.from(files);

    fileArray.forEach((file: File) => {
      let filePath: string[] = file.webkitRelativePath.split('/');
      this.fileRoot = new Directory("directory", filePath[0]);

      let curFileRoot: FileInterface = this.fileRoot;
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
  }
}
