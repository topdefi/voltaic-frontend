import { Pipe, PipeTransform } from "@angular/core";

export enum EMetricPrefix {
    Yotta = "Y",
    Zetta = "Z",
    Exa = "E",
    Peta = "P",
    Tera = "T",
    Giga = "G",
    Mega = "M",
    Kilo = "k",
}

const metricPrefixList = [
    ,
    EMetricPrefix.Kilo,
    EMetricPrefix.Mega,
    EMetricPrefix.Giga,
    EMetricPrefix.Tera,
    EMetricPrefix.Peta,
    EMetricPrefix.Exa,
    EMetricPrefix.Zetta,
    EMetricPrefix.Yotta,
];

export class MetricPrefix {
    constructor(public value: string, public metricPrefix: string) {}
}

@Pipe({ name: "metricPrefixify" })
export class MetricPrefixifyPipe implements PipeTransform {
    transform(source: any, zeroUnitsOffset: number = 0): MetricPrefix | any {
        if (typeof source !== "number") return source;
        if (source === 0) return source;

        const unitsCount = String(source).replace(/\.\d+/, "").length;
        const i = Math.floor(unitsCount / 3) - (unitsCount % 3 === 0 ? 1 : 0);

        return new MetricPrefix(
            String(source / Math.pow(10, i * 3)),
            metricPrefixList[i + Math.floor(zeroUnitsOffset / 3)] || "",
        );
    }
}
