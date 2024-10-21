import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BreadcrumbComponent } from '../utils/breadcrumb/breadcrumb.component';
import { ToolBarService } from '../../services/tool-bar.service';
import { FileService } from '../../services/file.service';
import { DisplayMode } from '../../utils/DisplayMode';
import { skip, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    BreadcrumbComponent,
  ],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.css'
})
export class ToolbarComponent implements OnInit, OnDestroy {
  private readonly destroy$: Subject<void> = new Subject();

  DisplayMode: typeof DisplayMode = DisplayMode;
  public displayMode: DisplayMode;
  public astSidebarToggle: boolean;

  constructor(
    private readonly toolbarService: ToolBarService,
    private readonly fileService: FileService
  ) {
    this.displayMode = DisplayMode.NO_CONTENT;
    this.astSidebarToggle = false;
  }

  ngOnInit(): void {
    this.toolbarService.getAstSidebarToggle()
      .pipe(
        skip(1),
        takeUntil(this.destroy$)
      )
      .subscribe((toggle: boolean) => {
        this.astSidebarToggle = toggle;
      });

    this.fileService.getDisplayMode()
      .pipe(
        skip(1),
        takeUntil(this.destroy$)
      )
      .subscribe((mode: DisplayMode) => {
        this.displayMode = mode;
        if (mode !== DisplayMode.TREE) {
          this.toolbarService.setAstSidebarToggle(false);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public onSidenavToggle(): void {
    this.toolbarService.setSidenavToggle(!this.toolbarService.getSidenavToggleValue());
  }

  public onAstSidebarToggle(): void {
    this.toolbarService.setAstSidebarToggle(!this.astSidebarToggle);
  }
}
