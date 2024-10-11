import { AfterViewInit, Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenav, MatSidenavContent, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDividerModule } from '@angular/material/divider';
import { ToolBarService } from '../services/tool-bar.service';
import { DisplayMode, FileService } from '../services/file.service';
import { BreadcrumbComponent } from "../utils/breadcrumb/breadcrumb.component";
import { CommonModule } from '@angular/common';
import { DisplayFolderComponent } from "./display-folder/display-folder.component";
import { DisplayNoContentComponent } from "./display-no-content/display-no-content.component";
import { DisplayZoomComponent } from "./display-zoom/display-zoom.component";


@Component({
  selector: 'app-main-window',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatListModule,
    MatSidenavModule,
    MatToolbarModule,
    BreadcrumbComponent,
    DisplayFolderComponent,
    DisplayNoContentComponent,
    DisplayZoomComponent
  ],
  providers: [
    ToolBarService,
    FileService,
  ],
  templateUrl: './main-window.component.html',
  styleUrl: './main-window.component.css'
})
export class MainWindowComponent implements OnInit, AfterViewInit {
  DisplayMode: typeof DisplayMode = DisplayMode;
  public displayMode: DisplayMode;

  public sidenavContentOriginWidth!: number;
  public sidenavContentOriginHeight!: number;

  @ViewChild('sidenav') public sidenav!: MatSidenav;
  @ViewChild('sidenavContent') public sidenavContent!: MatSidenavContent;

  constructor(private fileService: FileService) {
    this.displayMode = DisplayMode.NO_CONTENT;
  }

  ngOnInit(): void {
    this.fileService.getDisplayMode().subscribe((mode: DisplayMode) => {
      this.displayMode = mode;
    })
  }

  ngAfterViewInit(): void {
    this.sidenavContentOriginWidth = this.sidenavContent.getElementRef().nativeElement.scrollWidth;
    this.sidenavContentOriginHeight = this.sidenavContent.getElementRef().nativeElement.scrollHeight;
  }

  public onOpenFolderClick(event: Event) {
    let inputElement: HTMLInputElement = document.querySelector("#fileInput") as HTMLInputElement;
    inputElement.value = "";
    inputElement.click();
  }

  public onFileSelected(event: Event) {
    let inputElement: HTMLInputElement = event.target as HTMLInputElement;

    if (inputElement.files) {
      let fileArray: File[] = Array.from(inputElement.files);

      fileArray.sort((a: File, b: File) => {
        return a.webkitRelativePath.localeCompare(b.webkitRelativePath);
      });

      this.fileService.setByFiles(fileArray);
      this.sidenav.toggle();
    }
  }

  @HostListener('wheel', ['$event'])
  public onScroll(event: WheelEvent) {
    if (event.ctrlKey) {
      event.preventDefault();
    }
  }
}
