# ZEHN – Grafik

Stand 25.10.2026 · Lizenzen auf den Original-Seiten geprüft, sofern nicht „ungeprüft“ vermerkt.

## Umsetzung (entschieden: Richtung A)

- `scripts/lpc/parts.ts` legt fest, welche LPC-Teile verwendet werden; `npm run assets:lpc` lädt sie aus dem Generator-Repository (nur Metadaten und die benötigten PNGs), schneidet die Animationen `idle` und `walk` in allen vier Blickrichtungen aus (vorne, hinten, links, rechts – die Figur lässt sich in der Garderobe drehen) und schreibt `public/assets/lpc/`, `src/content/lpc.generated.json` (Teile, Paletten, Credits) und `public/assets/CREDITS.csv`.
- Im Browser setzt `src/ui/lpc/compose.ts` die Figuren zusammen und färbt sie über die LPC-Paletten um (Haut, Haare, Augen, Kleidung) – dadurch sind alle Farbkombinationen ohne zusätzliche Dateien möglich.
- Figuren: Avatar (Teen-Körper), Ada (Frau mittleren Alters mit hellbraunem Dutt, Brille, Schürze; seit 2026-11 nicht mehr mit weißem Haar und Altersgesicht, sie wirkte zu alt), Baron (Zylinder, Monokel, Schnurrbart, Weste, Fliege, Umhang). Krümel bleibt eine eigene Pixelgrafik.
- Garderobe: Strickjacke, Agentenlook und drei Brillen werden über Abzeichen freigeschaltet (`src/content/wardrobe.ts`).
- Credits-Seite im Spiel, Lizenzhinweis in `public/assets/LIZENZEN.md`.
- Noch offen: Hoodie, Headset, Sneaker (gibt es in LPC nicht). Die Kulissen folgen seit Oktober 2026 den Stilregeln (Abschnitt „Kulissen“).


## Kulissen: Stilregeln

Brote, Theke und Möbel sollen neben den LPC-Figuren nicht fremd wirken. Für alles, was in `Scene.tsx` oder als Requisite neu gezeichnet wird, gilt:

- **Palette:** 16 bis 24 Farben aus den LPC-Paletten (`src/content/lpc.generated.json`), keine freien Farben.
- **Kontur:** dunkle Kontur von einem Grafikpixel um jede Fläche, wie bei den Figuren.
- **Drei Töne je Fläche:** hell, Grundton, dunkel; das Licht kommt von oben links.
- **Nur Rechtecke auf dem Pixelraster:** keine Ellipsen und Kreise, keine Verläufe, Linien nur waagerecht oder senkrecht.
- **Transparenz** nur für Glas und Licht.
- **Ansicht:** die Figuren sind eine ¾-Ansicht von vorn; Möbel und Requisiten dürfen frontal sein, solange Kontur und Töne stimmen.
- **Maßstab:** ein Grafikpixel ist überall gleich groß (`--px`). Figuren, Krümel und Kulisse sind alle auf dieses Raster gezeichnet. Die Kulisse hat 320×180 Grafikpixel und deckt das Fenster, solange die Bühne dabei in die Höhe und Breite passt (Grenzen unten); was übersteht, wird abgeschnitten. Wird sie begrenzt (hohes, schmales oder niedriges Fenster), füllt die Hintergrundfarbe der Szene den Rest.

### Entscheidung: Variante C in der Backstube

Die Backstube nutzt Brote aus „[LPC] Foods“ (`public/assets/props/`, Quelle und Prüfsummen in `QUELLEN.md`, Credit in `OTHER_CREDITS`); Wände, Fenster, Schild, Regalbretter und Theke sind nach den Stilregeln gezeichnet (`Scene.tsx`). Die Kacheln passen im Pixelmaßstab und in der Kontur zu den Figuren, auch wenn sie in ¾-Ansicht von oben gezeichnet sind. Wichtig: **alle** Brote kommen aus den Kacheln (Regale und Vitrine), sonst fällt der Stilbruch auf. Die Mehlsäcke im Keller sind Kacheln aus „[LPC] Containers“ mit gezeichneter Aufschrift „MEHL“ aus 3×5-Buchstaben (`Mehlsack` in `ui/pixel/sceneProps.tsx`); die Säcke auf den beiden Foto-Hälften sind Teil ihrer Zeichen-Karten. Keller (Rohre, Kabel als Treppenlinien, Racks, Schild, Treppe) und Schreibtisch (Poster, Uhr aus Rechtecken, Tasse, Lampe mit gestuftem Lichtkegel, dunklere Ziegel statt Schleier) folgen den Stilregeln. Die Firewall bleibt bewusst abstrakt (Gitter, Binärzahlen); nur das Glühen ist gestuft statt verlaufend. Der Funkturm (Einsatz von Akt 2) zeigt drei Gittertürme und Funkbrücken aus Stufen vor dem Nachthimmel, unten die Dächer. Die Story-Bilder von Akt 2 (`ui/pictures/akt2.tsx`: Peilgerät, Rotor, O-Schilder, Route des Pizzaroboters, Schlossplatte; je fünf Stufen) folgen denselben Regeln. Die Story-Bilder (`ui/pictures/akt1.tsx`: Marktplatz, Ortsschild, halbes Foto) sind auf einem ganzzahligen Raster gezeichnet (Kontur, drei Töne, Pixelschrift, die junge Ada und der Mehlsack in der Karte des Fotos), und der Tresor der Spielhalle ist eine Pixelgrafik, deren Rad in acht Rasten springt, statt sich stufenlos zu drehen. Die Extra-Fälle haben eigene Bilder (`ui/pictures/cases.tsx`: Brunnen mit Buchstabenblasen, Briefkasten mit Buchstabenschloss, Zettel unter Rotlicht, Tunnel mit Zuglautsprecher und Buchstaben im Fahrtwind), ebenso die Feder fürs Beweisfach; Kringels Paket ist eine Kachel (Abschnitt „Umsetzung je Motiv“). Die Gadgets im Koffer haben Pixelsymbole (`ui/components/gadgetIcons.ts`, gezeichnet von `GadgetIcon`; fehlende nur als Umriss), die Farbfelder der Garderobe sind eckig. Die Chat-Bilder sind dieselben Story-Bilder, die Gesichter im Chat kommen aus den LPC-Figuren. Der Buchstabenregen bleibt Oberfläche im Terminal-Look. **Sicheres Bildfeld:** Die Bilderbuch-Ansicht schneidet den oberen Teil der Kulisse ab, und der ganzzahlige Maßstab schneidet je nach Fenster bis zu 32 Grafikpixel links und rechts ab (1280×800, 1024×700). In Kulissen, vor denen Figuren stehen (Backstube, Keller, Firewall), gehört Wichtiges deshalb unter y ≈ 36 und zwischen x ≈ 32 und 288. Kulissen hinter Bedienflächen (Schreibtisch bei Übung und Akte) zeigen dagegen vor allem ihre Ränder – dort gehört die Deko an den Rand, angeschnitten ist in Ordnung.

### Der gemeinsame Maßstab `--px`

`usePixelScale` (`ui/hooks`, aufgerufen in `shell/App.tsx`) setzt `--px` am Wurzelelement. Der Wert (`pixelScale` in `ui/pixel/stage.ts`) ist die kleinste ganze Zahl von **Gerätepixeln**, bei der die Kulisse das Fenster deckt, umgerechnet in CSS-Pixel. Bei 125 % Skalierung sind alle Grafikpixel dadurch gleich groß (z. B. 6 Gerätepixel = 4,8 CSS-Pixel). Beispiele ohne Grenzen: 1280×800 → 5 px, 1920×1080 → 6 px.

Damit auf kleinen Bildschirmen nichts fehlt, wird der Wert **nach oben begrenzt**: In der **Breite** müssen Ada, Krümel und die eigene Figur (etwa 112 Grafikpixel plus 90 px Abstände) nebeneinander ins Fenster passen (`px ≤ (Breite − 90) / 112`, abgerundet). In der **Höhe** (nur im Bilderbuch, mit der Höhe der Gesprächsbox) bleiben über der Box etwa 100 Zeilen der Kulisse sichtbar wie am Monitor (`px ≤ (Höhe − Box − 32) / 100`, gerundet). Beispiele im Bilderbuch: 1280×900 → 5 px und 1920×1080 → 6 px (wie ohne Grenze), 1024×650 → 3 px, 1280×700 → 3 px, 768×950 → 5 px, 1024×560 → 2 px, Handy 390×750 → 2 px. Das Bilderbuch setzt den Wert je Bühne am `.vn`-Element (`Dialog.tsx`); `usePixelScale` am Wurzelelement (HQ, Chat) kennt nur die Breiten-Grenze.

Im Bilderbuch sind Figuren (`scaled`), Krümel, Kulisse und der Versatz der Bühne (`sceneLift`) daran gebunden; die alten Größenangaben in Pixeln und die Höhenbegrenzung unter 760 px Fensterhöhe entfallen. Kleinere Bilder (HQ, Akte, Chat) haben weiter eigene Größen.

## Eigene Bilder: Palette, Größen, Prüfung, Bogen

Story-Bilder, Gadget-Symbole und Krümel sind eigene Zeichnungen (ADR-0004). Sie bleiben SVG aus Rechtecken auf einem Pixelraster (`Grid` in `ui/pixel/Pixel.tsx`, scharf auf jedem Maßstab); neu gezeichnet wird als **Zeichen-Karte**: ein Zeichen je Farbe, die Farben über eine Legende aus Palettennamen (`fromPalette(rows, { K: 'outline', P: 'paper' })` in `ui/pixel/pixelMap.ts`; `.` ist leer, ein Zeichen ohne Farbe ist ein Fehler). Die Stilregeln oben gelten weiter. **Wie ein Bild in den Browser kommt:** `Grid` macht aus der Karte einmal eine kleine SVG-Bilddatei im Speicher (`pixelImageUrl` in `ui/pixel/pixelImage.ts`: ein `<rect>` je Fläche, `shape-rendering="crispEdges"`, eine `data:`-Adresse, gemerkt je Karte, Karten die erst beim Zeichnen entstehen nach Inhalt in einer kleinen Tabelle mit Obergrenze) und zeigt sie mit einem einzigen `<image>` im äußeren `<svg>` (`preserveAspectRatio="none"`, `image-rendering: pixelated`). Gleiche Bilder teilen sich dieselbe Adresse, der Browser dekodiert sie nur einmal; Größe, `--px`-Maßstab, Titel, Klassen und Unschärfe liegen weiter am äußeren `<svg>`. Bewegte Teile (Lämpchen `led`, Rotoren) bleiben Rechtecke darüber und laufen per CSS; mehrere Vorkommen desselben Bildes bewegen sich im Gleichtakt. Die Bild-Prüfung (`pictureProblems`) setzt dazu das Bild wieder in Rechtecke ein, sie sieht dieselben Flächen wie vorher.

**Palette** (`ui/pixel/palette.ts`): sieben Farbfamilien mit je drei Tönen einer LPC-Rampe aus `content/lpc.generated.json` (Schatten `-dark`, Grundton, Licht `-light`), dazu Tinte und Kontur – 23 Farben, höchstens 24. Jede Farbe nennt im Code Material, Variante und Stufe ihrer Rampe; wo eine Kachel aus `public/assets/props/` dieselben Töne nutzt, steht es dabei.

| Familie | Name | Rampe (Stufen) | Wofür |
| --- | --- | --- | --- |
| Papier | `paper` | cloth/white (3–5) | Zettel, Karten, Seiten |
| Holz | `wood` | cloth/walnut (2–4), wie Kasten- und Rundbrot | Holz, Leder, Kruste |
| Metall | `metal` | cloth/slate (2–4), wie die Gleis-Kachel | Metall, Stein, Gehäuse |
| Glas | `glass` | cloth/sky (2–4) | Glas, Himmel, helles Blau |
| Gold | `gold` | cloth/yellow (3–5) | Gold, Messing, Licht |
| Rot | `red` | cloth/red (3–5) | Stoff, Knöpfe, Warnlicht |
| Grün | `green` | body/green (3–5) | Stoff, Platinen, Leuchten |
| Tinte | `ink` | cloth/blue (2) | Schrift auf Papier |
| Kontur | `outline` | eigene Farbe (dunkelblau wie die Oberfläche) | Umriss jeder Fläche |

**Bildarten** (`ui/pixel/pictureKinds.ts`) mit fester Rastergröße auf einem 4er-Raster: Gadget 16×16 (auch Porträts der Verdächtigen), Beweisstück und Chat-Bild 32×20, großes Story-Objekt 64×40, Fallbild 96×56. `Grid` mit `kind` setzt Raster, Grundgröße (Gadget und großes Story-Objekt dreifach, Beweisstück vierfach, Fallbild doppelt; so erscheinen sie im Chat) und die Klasse `pic-<art>`. Die Orte mit eigener Größe zeigen jede Bildart in einem ganzzahligen Vielfachen ihrer Breite, damit jedes Rasterfeld gleich groß ist:

| Ort | Gadget-Größe | Beweisstück | Story-Objekt | Fallbild |
| --- | --- | --- | --- | --- |
| Story-Objekt | 96 px (6×) | 160 px (5×) | 128 px (2×) | 192 px (2×) |
| großes Story-Objekt | 128 px (8×) | 224 px (7×) | 256 px (4×) | 192 px (2×) |
| Extra-Fall | 96 px (6×) | 160 px (5×) | 128 px (2×) | 192 px (2×) |
| Siegelleiste (niedrige Fenster) | 64 px (4×) | 96 px (3×) | 128 px (2×) | 96 px (1×) |
| Fallakte | 64 px (4×) | 96 px (3×) | 64 px (1×) | 96 px (1×) |
| Beweisfach: Kachel / Bühne | 32 px (2×) / 128 px (8×) | 32 px (1×) / 160 px (5×) | – / 128 px (2×) | – / 96 px (1×) |

Gadget-Größe zeigen die Orte für die Feder (Story-Bild 16×16, sie liegt im Beweisfach neben den Gadgets) und die Porträts der Verdächtigen (Fallakte). Gadget-Symbole stehen in Koffer, Chat und Extra-Fall gleich groß (48 px, dreifach). Das Schloss für Gesperrtes ist überall 16 px groß (ein Bildschirmpixel je Feld), der Lautsprecher der Gegenstimme im Einsatz 96 px (3×).

**Prüfung** (`ui/pixel/pictures.test.ts`, Regeln in `ui/pixel/pictureCheck.ts`): Für jedes registrierte Bild (`registeredPictures` in `ui/pictures/registry.ts`: Story-Bilder, Gadget-Symbole, Krümel, die Symbole Lautsprecher und Schloss; Kacheln ausgenommen) prüft der Test am fertigen SVG: Größe einer passenden Bildart, nur Palettenfarben, am Rand nur Kontur oder nichts, nur Rechtecke (kein SVG-Text, keine Kreise oder Pfade), keine verschobenen Teile. Ausnahmen gibt es nicht. Die Dateien in `ui/pictures/`, `ui/components/` und `ui/pixel/` dürfen keine freien Hexwerte enthalten – außer den Kulissen und ihren Kacheln (`Scene.tsx`, die Aufschrift „MEHL“ in `sceneProps.tsx`) und den gezeichneten Teilen der Story-Objekte (`StoryObject.tsx`), die keine eigenen Bilder sind. Drei Töne je Fläche und Licht von oben links prüft der Bogen, nicht der Test. Schrift in einem Bild ist aus Rasterfeldern gezeichnet (Zeichen der Karte, meist Buchstaben aus 3×5 oder 5×7 Feldern, oder `ui/pixel/glyphs.ts`), nicht als SVG-Text: Text färbt das Stylesheet, das sähe die Farbprüfung nicht; die Prüfung lehnt Text deshalb ab.

**Eigene Bilder nach Bildart** (alle bestehen die Prüfung):

| Bildart | Bilder |
| --- | --- |
| Gadget 16×16 | alle 18 Gadget-Symbole (`ui/components/gadgetIcons.ts`); die Feder (`ui/pictures/cases.tsx`); die elf Porträts der Verdächtigen in den Fallakten (`ui/pictures/portraits.tsx`, Kennungen `portraet-…`: Kringel, Baron, Ortrud, Krümel, O. als Fragezeichen, Elster, Frau Hubbel, Hilde Hupf, Otti Korrekt, Tippi, Benno; jeder Verdächtige jeder Fallakte hat eins, Ortruds Porträt ist auch das Foto auf ihrer Schlüsselkarte, `OrtrudFoto`); das Schloss für Gesperrtes (`LockIcon` in `ui/pixel/Pixel.tsx`) |
| Beweisstück 32×20 | Krümel und der Lautsprecher der Gegenstimme mit blinkendem Lämpchen (`KruemelPic`, `LoudspeakerPic` in `ui/pixel/Pixel.tsx`); Akt 1: Pixelrauschen, die verpixelten Hände; Akt 2: Fahrkarte; Akt 3: Bennos Notizbuch, die Karte „Hallo Keks“; Akt 4: Zeitung, Plakat, Kalenderblatt; Akt 5: Junas Beitrag, Booster-Chip, Durchsage-Skript, die Karte „Signal von O.“; Akt 6: Tüte Goldstaub, Goldrand-Karte, Nadel, Ottis Lieferbuch, das Lieferblatt; Akt 7: Preisliste, Daumenabdruck, Schaltplan, Zylinder, Lieferwagen |
| Story-Objekt 64×40 | Akt 1: das halbe Foto; Akt 4: die andere Hälfte des Fotos (der Riss passt an das halbe Foto) |
| Fallbild 96×56 | Akt 1: Ortsschild (nah und unscharf), der Markt von Weitem, die Schilder am Markt (4 Stufen); Akt 2: Peilgerät, Rotor, O-Schilder, Route, Schlossplatte (je 5 Stufen), Elsternest, Skizze der Turmtür; Akt 3: Netzplan, Ladestation (je 5 Stufen), Ortruds Fahrplan; Akt 4: Straßenschild (5 Stufen); Akt 7: das ganze Foto (beide Hälften im Rahmen, mit Klebestreifen); Fälle (`ui/pictures/cases.tsx`, ganz gezeichnet, ohne Kacheln): Brunnen, Briefkasten, Zettel unter Rotlicht, Tunnel mit Zuglautsprecher (die Buchstaben im Fahrtwind sind die 5×5-Buchstaben aus `ui/pixel/glyphs.ts`), Kiosk-Kasse, Maschine 4 |

Ohne eigene Bildart, aber in Palettenfarben: Adas Brezel (Stempel in Rot, Wasserzeichen in Gold), Krone und Schnörkel auf der Goldrand-Karte (`StoryPicture.tsx`), der Umriss fehlender Gadgets (`metal-dark`, `GadgetIcon.tsx`) sowie Kordel und Adresszettel auf der Kachel des Pakets (`ui/pictures/cases.tsx`).

Einzelheiten der Bilder:

- **Stufenbilder:** eine Grundkarte für Stufe 0, je Stufe ein Rechteck aus einer Zeichen-Karte ohne leere Felder, das die Grundkarte an seiner Stelle ersetzt (`patch` in `ui/pixel/pixelMap.ts`, Akt 2 bis 4). Die Schilder am Markt (Akt 1) legen stattdessen kleine Karten mit leeren Feldern über die Grundkarte (H, G und die Gans, `shift`). Die Titel (`aria-label`) je Stufe nennen die Schrift des Bildes wörtlich.
- **Unschärfe:** Ortsschild (unscharf), der Markt und die Hände tragen einen CSS-Filter (`blur`, `style` an `Grid`) – keine Farbe, die Prüfung bleibt gültig.
- **Palette:** zwei Gadgets haben die Farbe gewechselt, weil die Palette die alte nicht hat: der Blasenwerfer ist rot statt rosa, der linke Shift-Handschuh in Glastönen statt blau. Haut der Porträts aus Papiertönen (`paper` Licht, `paper-dark` Grund, `wood-light` Schatten); die Fallakte zeigt Porträts 64 px breit (4×), Ortruds Schlüsselkarte ihr Foto 48 px (3×), groß 64 px (4×).
- **Krümel:** Ausleger, Gehäuse und Mast in drei Metalltönen, das Kamera-Auge in Tinte mit Glaslinse, Keks-Aufkleber in Gold; Zeile 1 bleibt frei für die Rotoren, zwei eigene Bilder (Gruppen `rotor-a`, `rotor-b`, opak im hellsten Glas), die per CSS wechseln (`scene.css`, `still` hält sie an); die drei Lämpchen (grün und rot an den Auslegern, rot auf dem Mast) zeichnet `KruemelPic` als eigene Felder mit der Klasse `led` (blinken, `scene.css`). `size` bleibt Krümels Breite in CSS-Pixeln (HQ, Fallakte, Einsatz, Spielhalle); im Bilderbuch (`scaled`) ist er 32 Grafikpixel breit.

**Bogen** (`npm run pictures:sheet -- <Ordner>`, `scripts/pictures/sheet.ts`, nicht im Build): zeigt alle registrierten Bilder mit Kennung, Bildart, Größe und Prüfergebnis vierfach auf dunklem und hellem Grund, dazu die Palette und zwei Kacheln zum Vergleich, als `index.html` und `bogen.png` (über Playwright). Der Ordner muss außerhalb des Repositorys liegen (ohne Angabe `../zehn-bilder`); nichts davon wird eingecheckt.

## Empfehlung: Richtung A (LPC, Draufsicht, 32-px-Kacheln, 64×64-Figuren) + Kenney Pixel UI

- Nur LPC erfüllt das Pflichtkriterium „Avatar in Ebenen“ (Geschlecht, Haare, Augen, Kleidung, mit Animationen); freischaltbare Kleidung = zusätzliche Ebenen.
- Ada (Dutt, Schürze, Brille; Frau Hubbel bekommt den älteren Kopf mit Falten) und der Baron (Zylinder, Umhang, Monokel, Fliege, Gehrock) lassen sich fast komplett im Generator bauen.
- Der Neon-Terminal-Look kommt aus der React-Oberfläche, nicht aus den Sprites.
- Szenen in Seitenansicht (Dächer, U-Bahn) können später als Parallax-Kulisse mit „Warped City“ (CC0) ergänzt werden.

## Richtung A – LPC

| Pack | Lizenz | Inhalt | Passung |
| --- | --- | --- | --- |
| [Universal LPC Character Generator](https://liberatedpixelcup.github.io/Universal-LPC-Spritesheet-Character-Generator/) | Je Teil CC0 / CC-BY / OGA-BY / CC-BY-SA / GPL; Credits aller Autoren außer CC0, `CREDITS.csv` exportierbar | Avatar in Ebenen, Körper „teen“ und „child“, T-Shirt, Polo, Strickjacke, Weste, Hosen, Rucksack, Brillen, Jetpack | 9/10 |
| [LPC Revised – The Office](https://opengameart.org/content/lpc-revised-the-office) | CC-BY-SA 3.0 oder OGA-BY 3.0 (OGA-BY wählen) | Laptops, Kopierer, Fernseher, Kaffeemaschine | 8/10 |
| [LPC FraMa Sci-Fi Extensions](https://opengameart.org/content/lpc-frama-sci-fi-extensions) | CC-BY-SA 4.0 / GPL 3.0 | Hackerspace: animierte LED-Wand, Computertische | 8/10 (HQ) |
| [LPC Skorpio's SciFi Pack](https://opengameart.org/content/lpc-skorpios-scifi-sprite-pack) | CC-BY-SA 3.0 / GPL 3.0, zusätzlich Danimal nennen | Roboter („Cutiebots“), Requisiten | 7/10 |
| [LPC Modern Streets](https://opengameart.org/node/183431) | CC0 | Gehwege, Ampeln, Schilder – keine Gebäude | 7/10 |
| [LPC House Insides](https://opengameart.org/content/lpc-house-insides) / LPC Foods | CC-BY-SA 3.0 / GPL (ungeprüft) | Küche, Herd, Brot (Backstube) | 6/10 |

## Richtung B – Kenney 16×16 (alles CC0)

[Roguelike Characters](https://kenney.nl/assets/roguelike-characters), [Roguelike Modern City](https://kenney.nl/assets/roguelike-modern-city), [Roguelike Indoors](https://kenney.nl/assets/roguelike-indoors), [1-Bit Pack](https://kenney.nl/assets/1-bit-pack), [Pixel UI Pack](https://kenney.nl/assets/pixel-ui-pack).
Vorteil: keine Pflichten, einheitlicher Stil. Nachteil: winzige, nicht animierte Figuren; Ada und der Baron wirken kaum.

## Richtung C – Seitenansicht Cyber

| Pack | Lizenz | Bemerkung |
| --- | --- | --- |
| [Warped City](https://ansimuz.itch.io/warped-city) | CC0, Preis frei wählbar | Parallax-Stadt, eher „erwachsenes“ Cyberpunk |
| [Grid Breach: Net Runner](https://chiewaters.itch.io/grid-breach-net-runner) | Eigene Lizenz, Nutzung erlaubt, keine Weitergabe der Dateien; ab 19,99 $ | Viele Assets in vielen Größen – Einheitlichkeit vor Kauf prüfen |

Kein anpassbarer Avatar – wäre komplett Eigenarbeit.

## Geprüft, aber ungeeignet oder zweite Wahl

- **LimeZu Modern Interiors / Exteriors:** Optisch ideal (moderne Möbel), aber proprietär (ab 1,50 $ bzw. 2,50 $, Credits nötig, keine Weitergabe); Lizenz der Gratisversion unklar. Alternative, falls ein paar Euro okay sind.
- **Cup Nooble Sprout Lands:** Gratisversion nur nicht-kommerziell, Farm-Thema.
- **Penzilla:** Lizenz unklar (ein Projekt pro Kauf), Fantasy.
- **0x72 DungeonTileset:** Fantasy, passt nicht.

## Lücken (eigene Grafik oder Mischen nötig)

- Hoodie, Headset, Sneaker, Cyber-Brille, Agenten-Gadgets als eigene LPC-Ebenen
- Krümel: eigene kleine 32-px-Drohne (Alternativen: Cutiebots, „Tiny space drone“)
- Backstube: Theke und Vitrine bleiben gezeichnet (die Kacheln aus „[LPC] Wooden Furniture“ sind Bausteine in Draufsicht, die Brote stehen darauf); der Ofen ist eine Kachel
- Server-Racks im Keller (mit blinkenden Lämpchen) und die Maschinen im Tresor bleiben gezeichnet; im Tunnel stehen Konsolen aus dem „LPC Sci Fi Megapack“
- Tresor, Funkturm, Lautsprecher, U-Bahn-Wagen: kein LPC-Kandidat
- Feder, Kiosk-Kasse, Tüte Goldstaub: Kandidat geprüft, passt nicht (Abschnitt „Umsetzung je Motiv“)
- Gebäudefassaden für Bad Qwertz
- Abzeichen-Icons (eigene oder Kenney 1-Bit eingefärbt)

## Inventur der Motive (2026-11-08)

Alle eigenen Bilder wurden gegen den LPC-Fundus auf OpenGameArt geprüft (59 Motive, 42 mit Kandidat). Ergebnis: Für Kulissen gibt es Kacheln im Stil der Figuren, für Beweisstücke und Gadgets fast nur Frontansicht-Icons in anderen Paletten. Entscheidung je Gruppe:

| Gruppe | Entscheidung | Quelle |
| --- | --- | --- |
| Kulissen: Theke, Vitrine, Regal, Ofen, Schreibtisch mit Laptop, Pinnwand, Werkzeugwand, Konsolen, Marktstände, Brunnen, Laternen, Schild-Pfosten, Gleise, Tunnelbogen | Kacheln übernehmen und die Kulissen damit ausbauen (je Kulisse eine Handvoll) | [LPC] Wooden Furniture, [LPC] House interior, [LPC Revised] The Office, [LPC] Medieval Village Decorations, [LPC] Victorian Town Decorations, [LPC] Water Fountain, LPC Lamp Posts Rework, [LPC] Woodshop, bulletin board and items, LPC Sci Fi Megapack / LPC goes to space, [LPC] Mine, LPC Mine Carts and Tracks, LPC Modern Streets |
| Requisiten ohne Schrift: Paket, Mehlsack, Beutel, Feder, Kasse | Kacheln übernehmen; Schnur, Glitzer und Zettel darauf gezeichnet | [LPC] Containers, CC0 Storage Icons, bulletin board and items, Cash Machine |
| Beweisstücke mit Schrift (Zettel, Karten, Briefe, Zeitung, Plakat, Kalender, Notizbuch, Lieferbuch, Preisliste) | eigene Zeichnung auf der gemeinsamen Palette; einheitliche Papier-Formen nach den CC0 Document Icons als Vorlage | – |
| Gadget-Symbole | eigene Zeichnung in einer Palette; Lupe, Fernglas, Kescher, Handschuhe, Karte, Laterne nach CC0-Icons nachgezeichnet | 16x16 Detective Items, CC0-Icon-Sammlungen (nur Vorlage) |
| Stufenbilder, Fotos, Krümel, Rauschen, Hände | eigene Zeichnung (Spielmechanik, Figuren, Schrift) | – |
| Fallbilder (Brunnen, Briefkasten, Tunnel, Kasse, Maschine, Rotlicht) | ganz gezeichnet als Zeichen-Karte (Marktplatz, Hauswand, Schreibtisch, Tunnelbogen, Kiosk, Backstube nachgezeichnet): eine Kachel im Bild entginge der Prüfung, und die Bilder bleiben einheitlich | – |
| Ohne Kandidat (Dechiffrierscheibe, Stethoskop, Blasenwerfer, Flow-Chip, Monokel, Megafon, Zylinder, Fahrkarte, Pinnnadel, Schaltplan, Gans, Seifenblasen, Fußabdruck, Tresor, Funkturm, Lautsprecher, U-Bahn-Wagen) | eigene Zeichnung | – |

### Umsetzung je Motiv

Übernommen sind die Kacheln, die das Motiv ohne Schrift tragen und in Kontur und Ansicht passen; Herkunft und Prüfsummen in `public/assets/props/QUELLEN.md`, Weg der Kacheln in [assets.md](../technik/assets.md).

| Motiv | Ort | Entscheidung | Quelle, Lizenz, Größe |
| --- | --- | --- | --- |
| Paket | Story-Bild `paket` (Chat, Fall der Woche) | Kachel, Kordel und Adresszettel gezeichnet (Bildart „Kachel“) | CC0 Storage Icons (7Soul1), CC0, 32×31 |
| Mehlsack | Keller | Kachel, Aufschrift „MEHL“ gezeichnet; die Fotos behalten den gezeichneten Sack (Fotos sind eigene Arbeit) | [LPC] Containers, CC-BY-SA 4.0, 32×25 |
| Feder | Story-Bild `feder` | eigene Zeichnung: Das Bild in „bulletin board and items“ ist keine Feder, und unsere Feder ist weiß-violett, von einem eleganten Hut | – |
| Kiosk-Kasse | Story-Bild `kasse` | eigene Zeichnung: „Cash Machine“ hat Farbverläufe (144 Farben, Stilregel „keine Verläufe“) und keinen Schirm, auf dem die falschen Preise stehen könnten | – |
| Tüte Goldstaub | Story-Bild `goldstaub` | eigene Zeichnung: Die Beweistüte ist durchsichtig, man sieht den Fußabdruck darin; ein Stoffbeutel aus „[LPC] Containers“ würde ihn verdecken | – |
| Ofen | Backstube, unter dem Fenster | Kachel | [LPC] Wooden Furniture, CC-BY-SA 3.0, 32×40 |
| Werkzeugwand | Keller, über den Säcken | Kachel; im Keller werden alle Kacheln per CSS auf drei Viertel Helligkeit gedimmt (`.scene-keller .prop` in `scene.css`), damit sie neben den gezeichneten Racks nicht angestrahlt wirken | [LPC] Woodshop, CC-BY 3.0, 124×30 |
| Laptop | Schreibtisch | Kachel | [LPC Revised] The Office, OGA-BY 3.0, 19×22 |
| Laternen | Marktplatz, zwischen Ständen und Bühne | Kachel (zweimal) | LPC Lamp Posts Rework, CC-BY 3.0, 18×80 |
| Gleis | Tunnel | Kachel, zehnmal nebeneinander, statt der gezeichneten Schienen | LPC Mine Carts and Tracks, CC-BY-SA 3.0, 32×18 |
| Konsolen | Tunnel | zwei Kacheln, sechs Konsolen statt der vier gezeichneten Serverschränke | LPC Sci Fi Megapack, CC-BY-SA 4.0, je 32×64 |
| Fallbilder (Brunnen, Briefkasten, Tunnel, Kasse, Maschine, Rotlicht) | `ui/pictures/cases.tsx` | eigene Zeichnung (Zeichen-Karten 96×56), keine Kulissen-Kacheln als Hintergrund | – |
| Pinnwand, Marktstände, Brunnen, Tunnelbogen, Schild-Pfosten | – | noch nicht eingebaut: Pinnwand (Kork als Rauschen ohne Töne) und Brunnen fänden in Keller und Marktplatz keinen freien Platz, ohne Bestehendes zu ersetzen; der Holzbogen aus „[LPC] Mine“ macht aus dem U-Bahn-Tunnel einen Bergwerksstollen | Kandidaten in der Tabelle oben |

Lizenzen der Pakete: CC-BY-SA 4.0/3.0 (oft mit GPL als Zweitlizenz, wir nehmen CC-BY-SA), CC-BY, OGA-BY oder CC0; Pakete von bluecarrot16 verlangen die vollständige CREDITS-Datei neben den Kacheln. Jede übernommene Kachel geht den Weg der Brote: Ausschnitt in `public/assets/props/`, Quelle und Prüfsumme in `QUELLEN.md`, Größe in `ui/pixel/propSizes.ts`, Credit in `content/credits.ts` und `public/assets/LIZENZEN.md`. Ein eigenes LPC-Bäckerei-Paket gibt es nicht; Theke, Vitrine und Ofen kommen aus Wohn- und Tavernen-Paketen.

## Lizenzpflichten

- **CC0:** keine.
- **LPC-Generator:** Credits-Seite im Spiel mit allen Autoren aus `CREDITS.csv`; bevorzugt CC0-, OGA-BY- oder CC-BY-Teile wählen. Bei CC-BY-SA-Teilen müssen abgeleitete Sprites wieder unter CC-BY-SA stehen (betrifft nur Grafiken, nicht den Code); kein DRM.
- **FraMa, Skorpio, House Insides:** Autoren nennen, Änderungen unter gleicher Lizenz.
- **The Office:** unter OGA-BY nutzen, Credit an Eliza Wyatt und Lanea Zimmerman (Sharm).
- **Kommerzielle Packs:** Nutzung im Spiel erlaubt, keine Weitergabe der Originaldateien; LimeZu verlangt Credit. **Passen nicht zu einem offenen Repository** – die Dateien lägen dort zum Herunterladen.
- **Auswahl zwischen Lizenzen:** immer CC0, OGA-BY, CC-BY oder CC-BY-SA wählen, **nie GPL** – bei GPL-Grafiken ist strittig, ob der Spielcode mit unter die GPL fällt.

Umsetzung: Credits-Seite im Spiel (`content/credits.ts`, LPC-Teile aus `CREDITS.csv`), Lizenzhinweis in `public/assets/LIZENZEN.md`, Quellen und Prüfsummen eingebundener Kacheln in `QUELLEN.md` neben den Dateien. Code, Texte und eigene Pixelgrafiken stehen unter MIT (`LICENSE`, README „Lizenz“).
