import { Pipe, PipeTransform } from "@angular/core";
import { NgLocaleLocalization } from "@angular/common";

import { TranslateService } from "@ngx-translate/core";
import { Observable, of } from "rxjs";
import { map } from "rxjs/operators";

import { ETime } from "enums/time";
import { LangService } from "services/lang.service";

@Pipe({ name: "ago" })
export class AgoPipe implements PipeTransform {
    constructor(
        private ngLocaleLocalization: NgLocaleLocalization,
        private translateService: TranslateService,
        private langService: LangService,
    ) {}

    transform(time: any): Observable<string> {
        if (typeof time !== "number") return of(time);

        return this.langService.onChange.pipe(
            map(() => {
                const s = time % ETime.Minute;
                const m = Math.floor(time / ETime.Minute) % ETime.Minute;
                const h = Math.floor(time / ETime.Hour) % 24;
                const d = Math.floor(time / ETime.Day);

                const lang = this.langService.getCurrentLang();
                const parts: any[] = [];

                if (d) {
                    parts.push(d);
                    parts.push(
                        this.translateService.instant(
                            "common.date.day." +
                                this.ngLocaleLocalization.getPluralCategory(
                                    d,
                                    lang,
                                ),
                        ),
                    );
                }

                if (h) {
                    parts.push(h);
                    parts.push(
                        this.translateService.instant(
                            "common.date.hour." +
                                this.ngLocaleLocalization.getPluralCategory(
                                    h,
                                    lang,
                                ),
                        ),
                    );
                }

                if (m) {
                    parts.push(m);
                    parts.push(
                        this.translateService.instant(
                            "common.date.minute." +
                                this.ngLocaleLocalization.getPluralCategory(
                                    m,
                                    lang,
                                ),
                        ),
                    );
                }

                if (s) {
                    parts.push(s);
                    parts.push(
                        this.translateService.instant(
                            "common.date.second." +
                                this.ngLocaleLocalization.getPluralCategory(
                                    s,
                                    lang,
                                ),
                        ),
                    );
                }

                return (
                    parts.join(" ") ||
                    "0 " +
                        this.translateService.instant(
                            "common.date.second." +
                                this.ngLocaleLocalization.getPluralCategory(
                                    0,
                                    lang,
                                ),
                        )
                );
            }),
        );
    }
}
