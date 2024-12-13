const zpThemeController = (function () {
    const STORAGE_KEY = "zp-theme";

    const ETheme = Object.freeze({
        Light: "light",
        Dark: "dark",
    });

    const zpThemeController = Object.freeze({
        ETheme,

        getCurrentTheme() {
            return currentTheme;
        },

        getThemeList() {
            return Object.values(zpThemeController.ETheme);
        },

        changeTheme(target, callback) {
            if (toTheme(target) !== target) return;
            if (target === currentTheme) return;

            currentTheme = target;
            window.localStorage.setItem(STORAGE_KEY, target);

            document.querySelector("head").append(
                Object.assign(document.createElement("link"), {
                    rel: "stylesheet",
                    href: `assets/css/theme-${target}.css`,
                    onload() {
                        if (linkElement) linkElement.remove();

                        linkElement = this;

                        if (typeof callback === "function") {
                            callback();
                        }
                    },
                }),
            );
        },

        getChartsColor() {
            return ChartsColor[currentTheme].color;
        },

        getGridLineColor() {
            return ChartsColor[currentTheme].gridLine;
        },
    });

    const ChartsColor = {
        [ETheme.Light]: { color: [23, 124, 220], gridLine: [0, 0, 0] },
        [ETheme.Dark]: { color: [43, 144, 143], gridLine: [255, 255, 255] },
    };

    let linkElement;
    let currentTheme;

    zpThemeController.changeTheme(
        toTheme(window.localStorage.getItem(STORAGE_KEY)),
    );

    return zpThemeController;

    function toTheme(source) {
        return zpThemeController.getThemeList().indexOf(source) !== -1
            ? source
            : zpThemeController.ETheme.Light;
    }
})();

if (typeof window.zpThemeController === "undefined") {
    window.zpThemeController = zpThemeController;
}
