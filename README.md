# _Název:_ Budík
## _Představa:_
* Existuje databáze, obsahující tabulky, písničky a časy
* Každý záznam v tabulce časy obsahuje dobu spuštění budíku (přesnost do maximálně řádu minut, nikoli sekund), dále určený či určené dny (Po - Ne, realizováno jako čísla nebo enum), popis budíku, volitelně vybranou písničku a stav daného času (aktivní či deaktivovaný)
* Každý záznam v tabulce písničky obsahuje název, cestu k umístění na zařízení a délku (přesnost do maximálně sekund)
* Pokud nějaký čas z tabulky časů nemá písničku, použije se vibrace.
* Aplikace je rozdělena na část s časy a část s písničkami (UI)
* V části s písničkami vybírám ze zařízení (picker) a poté přidám do databáze se získanými informacemi (je možné si pustit ukázku hudby)
* V části s časy si volím dobu spuštění (picker) a nějakým radio buttonem určené dny
* Opakovaně, s odstupem 3 sekund, se provádí dotaz do databáze, který porovná aktuální čas s aktuálním dnem v týdnu se všemi časy, včetně určených dnů, v databázi a pokud najde shodu, pro daný záznam v databázi spustí budík. 
