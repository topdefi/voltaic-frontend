import { BehaviorSubject } from "rxjs";
import { Injectable } from "@angular/core";

@Injectable({
    providedIn: "root",
})
export class ZoomSwitchService {
    private zoom = <string>"";
    zoomSwitch = new BehaviorSubject<string>(this.zoom);

    setZoom(newZoom: string) {
        this.zoom = newZoom;
        this.zoomSwitch.next(newZoom);
    }

    constructor() {}
}
