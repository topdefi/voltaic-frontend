import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "seconds" })
export class SecondsPipe implements PipeTransform {
    transform(source: any): Date | any {
        if (typeof source !== "number") return source;

        return new Date(source * 1000);
    }
}
