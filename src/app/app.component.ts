import { Component, OnInit } from "@angular/core";

import { AppService } from "services/app.service";
import { LangService } from "services/lang.service";

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.less"],
})
export class AppComponent implements OnInit {
    constructor(
        public appService: AppService,
        private langService: LangService,
    ) {}

    ngOnInit(): void {
        this.langService.init();
    }
}
