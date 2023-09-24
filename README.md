## Popis aplikace

- Jedná se o mobilní aplikaci reprezentující budík, podobně jako budík od Google
- Aplikace umožňuje nastavovat si budíky, pojmenovat si je a přiřadit k nim případně písničku
- Písničky se nahrávají do aplikace a v aplikaci je možné je přehrát

## Informace o vývoji

- Aplikace se vyvíjela v období duben 2022
- Aplikace byla ze školního Github repozitáře nahrána do tohoto repozitáře v květnu 2022, tedy ke konci 4. ročníku střední školy
- V srpnu 2023 došlo k aktualizaci zastaralých balíčků, začínající od commitu [eab9c64](https://github.com/JanDostal/spsse-web-react-native-wake-app/commit/eab9c64c4e8a7047b72ec3e39e251662e9c9fa67)

## Představa

- Existuje databáze, obsahující tabulky, písničky a časy
- Každý záznam v tabulce časy obsahuje dobu spuštění budíku (přesnost do maximálně řádu minut, nikoli sekund), dále určený či určené dny (Po - Ne, realizováno jako čísla nebo enum), popis budíku, volitelně vybranou písničku a stav daného času (aktivní či deaktivovaný)
- Každý záznam v tabulce písničky obsahuje název, cestu k umístění na zařízení a délku (přesnost do maximálně sekund)
- Pokud nějaký čas z tabulky časů nemá písničku, použije se vibrace
- Aplikace je rozdělena na část s časy a část s písničkami (UI)
- V části s písničkami vybírám ze zařízení (picker) a poté přidám do databáze se získanými informacemi (je možné si pustit ukázku hudby)
- V části s časy si volím dobu spuštění (picker) a nějakým radio buttonem určené dny
- Opakovaně, s odstupem 3 sekund, se provádí dotaz do databáze, který porovná aktuální čas s aktuálním dnem v týdnu se všemi časy, včetně určených dnů, v databázi a pokud najde shodu, pro daný záznam v databázi spustí budík

## Instrukce pro spuštění

1. Je ideální otevřít dedikovanou command line v daném operačním systému
2. V rámci command line změnit aktuální adresář na adresář představující tento repozitář
3. Následně zadat příkaz ***npm install***
4. Zadat příkaz ***npx expo start***
5. Podle návodu na https://reactnative.dev/docs/environment-setup?guide=quickstart nainstalovat aplikaci **Expo Go** na mobilní telefon a následně naskenovat QR kód v command line pomocí stažené aplikace

- Zdrojový kód lze prohlédnout pomocí **Visual Studio Code**, jedná se o **React Native**
