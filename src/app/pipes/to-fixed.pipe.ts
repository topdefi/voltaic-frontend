import { Pipe, PipeTransform } from "@angular/core";
import { not } from "logical-not";

import { MetricPrefix } from "pipes/metric-prefixify.pipe";

@Pipe({ name: "toFixed" })
export class ToFixedPipe implements PipeTransform {
    transform(
        source: any,
        toFixed: number | null = 3,
    ): string | MetricPrefix | any {
        if (not(source)) return source;

        if (source instanceof MetricPrefix) {
            source.value = parseFloat(source.value).toFixed(toFixed);

            return source;
        }

        return source;
    }
}
