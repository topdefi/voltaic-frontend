import { Injectable } from "@angular/core";
import { registerLocaleData } from "@angular/common";

import ru from "@angular/common/locales/ru";
import en from "@angular/common/locales/en";
// import zh from "@angular/common/locales/zh-Hans";

import { TranslateService } from "@ngx-translate/core";
import { BehaviorSubject } from "rxjs";

const { ELang } = zpLangController;

const langs = {
    //[ELang.Ru]: ru,
    [ELang.En]: en,
    // [ELang.China]: zh,
};

@Injectable({ providedIn: "root" })
export class LangService {
    readonly onChange = new BehaviorSubject<zpLangController.ELang>(null);

    constructor(private translateService: TranslateService) { }

    init(): void {
        this.applyLang(zpLangController.getCurrentLang());
    }

    getCurrentLang(): zpLangController.ELang {
        return zpLangController.getCurrentLang();
    }

    changeLang(lang: zpLangController.ELang): void {
        zpLangController.changeLang(lang, () => {
            this.applyLang(lang);
        });
    }

    private applyLang(lang: zpLangController.ELang): void {
        registerLocaleData(langs[lang], lang);

        this.translateService.use(lang).subscribe(() => {
            this.onChange.next(lang);
        });
    }
}
