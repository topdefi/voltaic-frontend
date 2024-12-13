import { Component, OnInit } from "@angular/core";

import { SubscribableComponent } from "ngx-subscribable";

import { LangService } from "services/lang.service";
import { ThemeService } from "services/theme.service";

@Component({
    selector: "app-header-controls",
    templateUrl: "./header-controls.component.html",
    styleUrls: ["./header-controls.component.less"],
})
export class HeaderControlsComponent extends SubscribableComponent
    implements OnInit {
    readonly ELang = zpLangController.ELang;

    readonly langList = zpLangController.getLangList();
    readonly themeList = zpThemeController.getThemeList();

    currentLang = zpLangController.getCurrentLang();
    currentTheme = zpThemeController.getCurrentTheme();

    isThemeLoading = false;

    constructor(
        private langService: LangService,
        private themeService: ThemeService,
    ) {
        super();
    }

    ngOnInit(): void {
        this.subscriptions.push(
            this.themeService.onChange.subscribe(theme => {
                this.isThemeLoading = false;
                this.currentTheme = theme;
            }),
        );
    }

    changeLang(lang: zpLangController.ELang): void {
        this.langService.changeLang(lang);

        this.currentLang = lang;
    }

    changeTheme(theme: zpThemeController.ETheme): void {
        if (this.isThemeLoading || theme === this.currentTheme) return;

        this.themeService.changeTheme(theme);

        this.isThemeLoading = true;
    }
}
