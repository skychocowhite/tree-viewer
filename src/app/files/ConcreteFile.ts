import { FileInterface } from "./FileInterface";

export class ConcreteFile implements FileInterface {
    public type: string;
    public name: string;
    public file: File;

    constructor(type: string, name: string, file: File) {
        this.type = type;
        this.name = name;
        this.file = file;
    }

    public isFile(): boolean {
        return true;
    }

    public isDirectory(): boolean {
        return false;
    }

    public addFile(file: FileInterface): void {
        throw Error("'File' class does not have addFile method");
    }

    public getType(): string {
        return this.type;
    }

    public getName(): string {
        return this.name;
    }

    public getFile(): File {
        return this.file;
    }

    public getFileList(): FileInterface[] {
        throw Error("'File' class does not implement this method");
    }
}