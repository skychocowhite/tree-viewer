export interface FileInterface {
    type: string;
    name: string;


    isFile(): boolean;
    isDirectory(): boolean;
    addFile(file: FileInterface): void;
    getType(): string;
    getName(): string;
    getFile(): File;
    getFileList(): FileInterface[];
}
