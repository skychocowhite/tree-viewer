import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDividerModule } from '@angular/material/divider';
import { ToolBarService } from '../services/tool-bar.service';
import { FileService } from '../services/file.service';
import { BreadcrumbComponent } from "../utils/breadcrumb/breadcrumb.component";


@Component({
  selector: 'app-main-window',
  standalone: true,
  imports: [
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatListModule,
    MatSidenavModule,
    MatToolbarModule,
    BreadcrumbComponent
  ],
  providers: [
    ToolBarService,
    FileService,
  ],
  templateUrl: './main-window.component.html',
  styleUrl: './main-window.component.css'
})
export class MainWindowComponent implements OnInit {
  constructor(private fileService: FileService) {
  }

  ngOnInit(): void { }

  public onOpenFolderClick(event: Event) {
    let inputElement: HTMLInputElement = document.querySelector("#fileInput") as HTMLInputElement;
    inputElement.value = "";
    inputElement.click();
  }

  public onFileSelected(event: Event) {
    let inputElement: HTMLInputElement = event.target as HTMLInputElement;

    if (inputElement.files) {
      this.fileService.setByFiles(inputElement.files);
    }
  }
}
