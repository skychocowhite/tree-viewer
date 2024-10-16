import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';

import { BreadcrumbModule } from 'primeng/breadcrumb';
import { FileService } from '../../../services/file.service';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [
    BreadcrumbModule,
  ],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.css'
})
export class BreadcrumbComponent implements OnInit {
  public items: MenuItemImpl[];

  constructor(private readonly fileService: FileService) {
    this.items = [];
  }

  ngOnInit(): void {
    this.fileService.getCurFolderPath().subscribe((paths: string[]) => {
      this.items = [];
      paths.forEach((path) => {
        this.items.push(new MenuItemImpl(path));
      });
    });
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
