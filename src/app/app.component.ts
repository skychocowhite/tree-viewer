import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MainWindowComponent } from './main-window/main-window.component';

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
export class AppComponent {
  title = 'tree-viewer';
}
