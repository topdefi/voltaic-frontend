declare namespace zpLangController {
    enum ELang {
        //Ru = "ru",
        En = "en",
        //China = "zh",
    }

    function getLangList(): ELang[];
    function getCurrentLang(): ELang;
    function changeLang(lang: ELang, callback?: () => void);
}
