import { Pipe, PipeTransform } from "@angular/core";
import { formatDate } from "@angular/common";

import { Observable, of } from "rxjs";
import { map } from "rxjs/operators";
import { not } from "logical-not";

import { LangService } from "services/lang.service";

@Pipe({ name: "date" })
export class DatePipe implements PipeTransform {
    constructor(private langService: LangService) {}

    transform(value: any, format = "shortDate"): Observable<string> {
        if (not(value)) return of("");

        return this.langService.onChange.pipe(
            map(() =>
                formatDate(value, format, this.langService.getCurrentLang()),
            ),
        );
    }
}
