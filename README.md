Úvod
====

Webová aplikácia iLyze zobrazuje na mape lyžiarske strediská na
Slovensku. Aplikácia poskytuje nasledovnú funkcionalitu:

-   nájdenie a zobrazenie všetkých lyžiarskych stredísk
-   nájdenie a zobrazenie všetkých hotelov
-   lokalizácia používateľa a usporiaddanie lyžiarskych stredísk podľa
    vzdialenosti
-   filtrovanie lyžiarskych stredísk podľa maximálnej vzdialenosti od
    používateľa
-   filtrovanie lyžiarskych stredísk podľa maximaálnej vzdialenosti od
    hotela
-   filtrovanie lyžiarskych stredísk podľa obtiažnosti

Ukážka aplikácie:
![ilyze](https://github.com/fiit-pdt/assignment-gis-pitr12/blob/master/ilyze.png)

Aplikácia využíva dáta získané z [Open Street Maps](http://www.openstreetmap.org/#map=5/51.500/-0.100). Stiahol som si
zazipované dáta vo formáte *osm.bz2* pre konkrétnu krajinu (Slovensko).
Pre import dát do databázy *Postgres* využívajucej rozšírenia *postGis*
a *Hsore* som využil nástroj [osm2pgsql](https://github.com/openstreetmap/osm2pgsql). Pričom pri importe som využil
dva špeciálne prepínače a to `-l`, a `-h`. Prepínač `-l` zabezpečí, že
geo dáta budú uložené pomocou správnej projekcie a prepínač `-h` umožní
vytvorenie špeciálneho stĺpca v tabuľke, v ktorom sú uložené dodatočné
dáta, ktoré sa nenachádzajú v samostatných stĺpcoch (tento stĺpec je
typu *hstore*).

Realizácia
==========

Aplikácia pozostáva z 2 samostatných častí a to Frontend (Client) a
Backend. Frontend predstavuje webovú aplikáciu, ktorá využíva *Mapbox
API* a [mapbox.js](https://www.mapbox.com/mapbox.js/api/v2.2.3/). Backend je webová aplikácia realizovaná pomocou
frameworku *Ruby on Rails*, ktorá slúži ako API, ktoré komunikuje s
databázou *Postgres* a vracia dáta vo formáte [geoJSON](http://geojson.org/geojson-spec.html).

Frontend
--------

Frontend je statická webstránka `home/index.html.erb`, ktorá
zobrazuje `mapbox.js` widget. Táto stránka zobrazuje mapu (defaultný
štýl *streets*), ktorá je mierne modifikovaná tak, že zelená farba
(reprezentujúca pohoria) je viacmenej nahradená bielou farbou, aby nebol
používateľ rozptylovaný a prehľadne videl všetky potrebné informácie.
Taktiež sa používateľovi pri každom lyžiarskom stredisku alebo hoteli
zobrazí špecfický marker, takže používateľ vidí ako ďaleko je lyžiarske
stredisko vzdialené od hotela.

Logika realizovaná vo forntende sa nachádza v `home.js`, kde sa
uskutočňuje lokalizácia používateľa, dopytuje sa API pre získanie dát a
sidebar a mapa sa napĺňajú získanými dátami.

Backend
-------

Backend predstavuje API, pričom sú dodržiavané základné konvencie
frameworku Ruby on Rails. Tj. Url API sú reprezentované ako metódy
controllera `home_controller.rb`, ktoré rendrujú získané dáta vo
formáte *geoJSON*. Všetka logika pracujúca s dátami sa nachádza v modeli
`location.rb`. V tomto modeli taktiež prebieha transformovanie údajov
získaných z DB na korektný formát geojsonu.

API
===

API umožňuje získanie potrebných dát vo formáte *geoJSON*, pričom
špecifické údaje opisujúce daný objekt sa nachádzajú v elemente
`properties: (title, description a tags)`

Ukážka odpovede API:
```
[
  {
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": [17.9650788,48.6651589]
   },
  "properties": {
    "title": "Bezovec",
    "description": "88727.502427588",
    "type": "S",
    "marker-color": "\#3887BE",
    "marker-size": "large",
    "marker-symbol": "skiing",
    "tags": "\\"website\\"=&gt;\\"http:\\/\\/www.skibezovec.sk\\/\\""
  }
 }
]
```

**Možnosti využitia API:**

-   nájdenie všetkých lyžiarských stredísk od danej pozície (výsledky
    usporiadané podľa vzdiaenosti)

    -   `GET /api/locations?lat=48.1496461&lon=17.0503285`
-   nájdenie všetkých lyžiarských stredísk od danej pozície v maximálnej
    určenej vzdialenosti (výsledky usporiadané podľa vzdiaenosti)

    -   `GET /api/locations?lat=48.1496461&lon=17.0503285&area=500000`
-   nájdenie všetkých lyžiarských stredísk od danej pozície v maximálnej
    určenej vzdialenosti (výsledky usporiadané podľa vzdiaenosti) a
    taktiež v určenej maximálnej vzdialenosti od hotela

    -   `GET /api/ski_near_hotels?lat=48.1496461&lon=17.0503285&area=500000&hotel_dist=3000`
-   nájdenie všetkých lyžiarských stredísk od danej pozície (výsledky
    usporiadané podľa vzdiaenosti) filtrované podľa úrovňe obtiažnosti

    -  `GET /api/locations?lat=48.1496461&lon=17.0503285&difficulty=novice,easy`
