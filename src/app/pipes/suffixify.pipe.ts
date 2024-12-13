import { Pipe, PipeTransform } from "@angular/core";
import { not } from "logical-not";

import { MetricPrefix } from "pipes/metric-prefixify.pipe";

export enum ESuffix {
    ShareRate = "ShareRate",
    Power = "Power",
    PrimePower = "PrimePower",
}

export interface ISuffixifyPipeSettings {
    suffix?: ESuffix;
}

const suffixMap = {
    [ESuffix.ShareRate]: "share/s",
    [ESuffix.Power]: "h/s",
    [ESuffix.PrimePower]: "CPD",
};

@Pipe({ name: "suffixify" })
export class SuffixifyPipe implements PipeTransform {
    transform(source: any, suffix?: ESuffix): string | MetricPrefix | any {
        if (not(source)) return source;

        const suffixString = suffixMap[suffix] || "";

        if (source instanceof MetricPrefix) {
            const { value, metricPrefix } = source as MetricPrefix;

            return `${value} ${metricPrefix}${suffixString}`;
        }

        if (typeof source === "number") {
            if (source === 0) return source;

            return `${source} ${suffixString}`;
        }

        return source;
    }
}

@Pipe({ name: "suffixify_prime" })
export class SuffixifyPrimePipe implements PipeTransform {
    transform(source: any, suffix?: ESuffix): string | MetricPrefix | any {
        if (not(source)) return source;

        const suffixString = suffixMap[suffix] || "";

        if (source instanceof MetricPrefix) {
            const { value, metricPrefix } = source as MetricPrefix;

            return `${value} ${metricPrefix}${suffixString}`;
        }

        if (typeof source === "number") {
            if (source === 0) return source;

            return `${source} ${suffixString}`;
        }

        return source;
    }
}
