import { AfterViewInit, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MainWindowComponent } from './components/main-window/main-window.component';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    MainWindowComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements AfterViewInit {
  title = 'tree-viewer';

  constructor(
    private readonly iconRegistry: MatIconRegistry,
    private readonly sanitizer: DomSanitizer
  ) {
    // Add custom svg icon
    iconRegistry
      .addSvgIcon('left_panel_open', sanitizer.bypassSecurityTrustResourceUrl('left_panel_open.svg'))
      .addSvgIcon('close_square', sanitizer.bypassSecurityTrustResourceUrl('close_square.svg'));
  }

  ngAfterViewInit(): void {
    document.querySelectorAll('input, textarea, div, p, span').forEach((element: Element) => {
      element.setAttribute("data-gramm", "false");
    })
  }
}
