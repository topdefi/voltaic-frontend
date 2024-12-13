import { Component } from "@angular/core";

import { EAppRoutes } from "enums/routing";

@Component({
    selector: "app-main-layout",
    templateUrl: "./main-layout.component.html",
    styleUrls: ["./main-layout.component.less"],
})
export class MainLayoutComponent {
    readonly EAppRoutes = EAppRoutes;
}
