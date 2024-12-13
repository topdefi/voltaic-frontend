declare namespace zpThemeController {
    type Color = [number, number, number];

    enum ETheme {
        Light = "light",
        Dark = "dark",
    }

    function getCurrentTheme(): ETheme;
    function getThemeList(): ETheme[];
    function changeTheme(target: ETheme, callback?: () => void);
    function getChartsColor(): Color;
    function getGridLineColor(): Color;
}
