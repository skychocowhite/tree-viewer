import { Routes } from '@angular/router';
import { MainWindowComponent } from './components/main-window/main-window.component';

export const routes: Routes = [
    {
        path: "",
        component: MainWindowComponent
    },
    {
        path: "/upload",
    },
    {
        path: "**",
        redirectTo: "",
        pathMatch: 'full'
    }
];
