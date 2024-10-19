import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ToolBarService {
  private readonly sidenavToggle: BehaviorSubject<boolean>;
  private readonly astSidebarToggle: BehaviorSubject<boolean>;

  constructor() {
    this.sidenavToggle = new BehaviorSubject<boolean>(false);
    this.astSidebarToggle = new BehaviorSubject<boolean>(false);
  }

  public setSidenavToggle(toggle: boolean): void {
    console.log("New sidebar toggle: " + toggle);
    this.sidenavToggle.next(toggle);
  }

  public setAstSidebarToggle(toggle: boolean): void {
    this.astSidebarToggle.next(toggle);
  }

  public getSidenavToggle(): Observable<boolean> {
    return this.sidenavToggle.asObservable();
  }

  public getSidenavToggleValue(): boolean {
    return this.sidenavToggle.getValue();
  }

  public getAstSidebarToggle(): Observable<boolean> {
    return this.astSidebarToggle.asObservable();
  }

  public getAstSidebarToggleValue(): boolean {
    return this.astSidebarToggle.getValue();
  }
}
