import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({ providedIn: "root" })
export class ThemeService {
    readonly onChange = new BehaviorSubject<zpThemeController.ETheme>(
        zpThemeController.getCurrentTheme(),
    );

    readonly chartsColor = new BehaviorSubject<[number, number, number]>(
        zpThemeController.getChartsColor(),
    );

    get gridLinesColorX(): string {
        return `rgb(128, 128, 128, .2)`;
    }

    get gridLinesColorY(): string {
        const [r, g, b] = zpThemeController.getGridLineColor();

        return `rgb(${r}, ${g}, ${b}, .2)`;
    }

    changeTheme(theme: zpThemeController.ETheme): void {
        zpThemeController.changeTheme(theme, () => {
            this.chartsColor.next(zpThemeController.getChartsColor());

            this.onChange.next(theme);
        });
    }
}
