import { FileInterface } from "./FileInterface";

export class File implements FileInterface {
    public type: string;
    public name: string;

    constructor(type: string, name: string) {
        this.type = type;
        this.name = name;
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
}