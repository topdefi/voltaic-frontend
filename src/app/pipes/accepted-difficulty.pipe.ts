import { Pipe, PipeTransform } from "@angular/core";

import { MetricPrefix, EMetricPrefix } from "pipes/metric-prefixify.pipe";

@Pipe({ name: "acceptedDifficulty" })
export class AcceptedDifficultyPipe implements PipeTransform {
    transform(source: any): MetricPrefix | any {
        if (typeof source !== "number") return source;
        if (source === 0) return source;

        return new MetricPrefix(String(source / 1e6), EMetricPrefix.Mega);
    }
}
