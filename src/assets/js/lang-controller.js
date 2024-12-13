const zpLangController = (function () {
    const STORAGE_KEY = "zp-lang";

    const ELang = Object.freeze({
        //Ru: "ru",
        En: "en",
        // China: "zh",
    });
    const langList = Object.values(ELang);
    const defaultLang = ELang.En;

    let currentLang = getInitialLang();

    const zpLangController = Object.freeze({
        ELang,

        getLangList() {
            return Object.values(ELang);
        },

        getCurrentLang() {
            return currentLang;
        },

        changeLang(lang, callback) {
            if (!isValidLang(lang)) return;
            if (lang === currentLang) return;

            window.localStorage.setItem(STORAGE_KEY, lang);

            currentLang = lang;

            if (typeof callback === "function") {
                callback();
            }
        },
    });

    return zpLangController;

    function getInitialLang() {
        const storageLang = window.localStorage.getItem(STORAGE_KEY);

        if (isValidLang(storageLang)) return storageLang;

        const [systemLang] = window.navigator.language.split("-");

        if (isValidLang(systemLang)) return systemLang;

        return defaultLang;
    }

    function isValidLang(source) {
        return langList.indexOf(source) !== -1;
    }
})();

if (typeof window.zpLangController === "undefined") {
    window.zpLangController = zpLangController;
}
