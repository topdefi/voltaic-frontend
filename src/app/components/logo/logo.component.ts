import { Component, Input } from "@angular/core";

@Component({
    selector: "app-logo",
    templateUrl: "./logo.component.html",
    styleUrls: ["./logo.component.less"],
})
export class LogoComponent {
    // @HostBinding("class._iconOnly")
    @Input()
    iconOnly: boolean;
}
