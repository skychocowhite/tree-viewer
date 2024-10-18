import { AfterViewInit, Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenav, MatSidenavContent, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDividerModule } from '@angular/material/divider';
import { ToolBarService } from '../../services/tool-bar.service';
import { DisplayMode, FileService } from '../../services/file.service';
import { BreadcrumbComponent } from "../utils/breadcrumb/breadcrumb.component";
import { CommonModule } from '@angular/common';
import { DisplayFolderComponent } from "./display-folder/display-folder.component";
import { DisplayNoContentComponent } from "./display-no-content/display-no-content.component";
import { DisplayZoomComponent } from "./display-zoom/display-zoom.component";
import { AstSideBarComponent } from "./ast-side-bar/ast-side-bar.component";


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
    DisplayZoomComponent,
    AstSideBarComponent
  ],
  providers: [
    ToolBarService,
    FileService,
  ],
  templateUrl: './main-window.component.html',
  styleUrl: './main-window.component.css'
})
export class MainWindowComponent implements OnInit, AfterViewInit {
  // Current mode of display, decide which component to show
  DisplayMode: typeof DisplayMode = DisplayMode;
  public displayMode: DisplayMode;

  // Side bar navigation component
  public sidenavContentOriginWidth!: number;
  public sidenavContentOriginHeight!: number;

  @ViewChild('sidenav') public sidenav!: MatSidenav;
  @ViewChild('sidenavContent') public sidenavContent!: MatSidenavContent;

  // Ast side bar container
  public astSidebarToggle: boolean;

  constructor(
    private readonly fileService: FileService
  ) {
    this.displayMode = DisplayMode.NO_CONTENT;
    this.astSidebarToggle = false;
  }

  ngOnInit(): void {
    this.fileService.getDisplayMode().subscribe((mode: DisplayMode) => {
      this.displayMode = mode;

      if (this.displayMode !== DisplayMode.TREE) {
        this.astSidebarToggle = false;
      }
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

    if (inputElement.files && inputElement.files.length > 0) {
      let fileArray: File[] = Array.from(inputElement.files);

      fileArray.sort((a: File, b: File) => {
        return a.webkitRelativePath.localeCompare(b.webkitRelativePath);
      });

      this.fileService.setByFiles(fileArray);
      this.sidenav.toggle();
    }
  }

  public onAstSidebarToggle(): void {
    this.astSidebarToggle = !this.astSidebarToggle;
  }

  @HostListener('wheel', ['$event'])
  public onScroll(event: WheelEvent) {
    if (event.ctrlKey) {
      event.preventDefault();
    }
  }

  @HostListener('window:resize', ['$event'])
  public onResizeWindow(event: UIEvent) {
    this.sidenavContentOriginWidth = window.innerWidth;
    this.sidenavContentOriginHeight = window.innerHeight;
  }
}
