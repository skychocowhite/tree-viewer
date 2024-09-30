import { Component } from '@angular/core';

import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { FileService } from '../../services/file.service';
import { CommonModule } from '@angular/common';
import { FileInterface } from '../../files/FileInterface';

@Component({
  selector: 'display-folder',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatListModule
  ],
  templateUrl: './display-folder.component.html',
  styleUrl: './display-folder.component.css'
})
export class DisplayFolderComponent {
  constructor(private fileService: FileService) {

  }

  public getCurFileList(): FileInterface[] {
    return this.fileService.getCurFileList();
  }
}
