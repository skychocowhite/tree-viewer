import { FileInterface } from "./FileInterface";

export class Directory implements FileInterface {
    public type: string;
    public name: string;
    private fileList: FileInterface[];

    constructor(type: string, name: string) {
        this.type = type;
        this.name = name;
        this.fileList = [];
    }

    public isFile(): boolean {
        return false;
    }

    public isDirectory(): boolean {
        return true;
    }

    public addFile(file: FileInterface) {
        this.fileList.push(file);
    }

    public getType(): string {
        return this.type;
    }

    public getName(): string {
        return this.name;
    }

    public getFile(): File {
        throw Error("'Directory' class does not contain method 'getFile'");
    }

    public getFileList(): FileInterface[] {
        return this.fileList;
    }
}