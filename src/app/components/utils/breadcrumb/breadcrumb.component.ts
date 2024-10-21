import { Component, OnDestroy, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';

import { BreadcrumbModule } from 'primeng/breadcrumb';
import { FileService } from '../../../services/file.service';
import { skip, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [
    BreadcrumbModule,
  ],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.css'
})
export class BreadcrumbComponent implements OnInit, OnDestroy {
  private readonly destroy$: Subject<void> = new Subject();

  public items: MenuItemImpl[];

  constructor(private readonly fileService: FileService) {
    this.items = [];
  }

  ngOnInit(): void {
    this.fileService.getCurFolderPath()
      .pipe(
        skip(1),
        takeUntil(this.destroy$)
      )
      .subscribe((paths: string[]) => {
        this.items = [];
        paths.forEach((path) => {
          this.items.push(new MenuItemImpl(path));
        });
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public onItemClick(event: Event, item: MenuItemImpl): void {
    this.fileService.navFolder(item.getName());
  }
}


export class MenuItemImpl implements MenuItem {
  private readonly name: string;

  constructor(name: string) {
    this.name = name;
  }

  public getName(): string {
    return this.name;
  }
}
