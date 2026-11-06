# Anforderungen

Ziel: **Demo**, Zeit: ca. 50 Minuten.
Priorität: **Must** = muss in die Demo, **Should** = wenn Zeit bleibt, **Could** = in der Demo nur andeuten oder weglassen.

## Bewerbenden-Seite (Rolle 2)

| # | Anforderung | Priorität |
|---|---|---|
| 1 | **Touchpoint:** QR-Code oder Link führt auf die Startseite | Should (QR-Code einfach aus dem Link erzeugen) |
| 2 | **Startseite:** Worum geht es?, Call to Action, „Bei uns zählen deine Motivation und Skills (keine demografischen Daten)“ | Must |
| 3 | **Demografische Daten und Kontaktdaten** erfassen | Must |
| 4 | **Lebenslauf hochladen,** demografische Daten und Kontaktdaten werden geschwärzt und anonymisiert | Must (Upload), Should (Schwärzen) |
| 5 | **KI extrahiert die Daten** aus dem Lebenslauf, Bewerber prüft und ergänzt sie | Should (für die Demo notfalls mit vorbereiteten Beispieldaten) |
| 6 | **Offene Fragen zur Motivation** | Must |
| 7 | **Terminabfrage,** gestaltet wie die Startseite, mit „Was erwartet dich“ | Should |
| 8 | **Datenschutzeinwilligung und Absenden** | Must |
| 9 | **Bewerberprofil** mit Status der Bewerbung, Freischaltung per Link ins Postfach | Should (Statusseite), Could (E-Mail-Link) |

## Screener-Seite (Rolle 3)

| # | Anforderung | Priorität |
|---|---|---|
| 10 | **Login mit 2FA** | Must (Login), Could (2FA) |
| 11 | **Dashboard:** oben „Willkommen X“, darunter Übersicht mit News (z. B. „5 neue Bewerbungen“) und/oder Zeitstrahl mit geplanter Recruiting-Timeline | Must (Willkommen + News), Should (Zeitstrahl) |
| 12 | **Kanban** mit Bewerbungsstatus, Zuordnung mit Kürzeln und Datum | Must |
| 13 | Screener sehen nur anonymisierte Daten: Motivation und Skills, keine demografischen Daten | Must |

## Backend (Rolle 1)

Leitet sich aus den Punkten oben ab:

| Anforderung | Priorität |
|---|---|
| Kontaktdaten und demografische Daten getrennt von der anonymisierten Bewerbung speichern | Must |
| Lebenslauf-Upload in privaten Storage-Bucket | Must |
| Status pro Bewerbung (für Kanban und Bewerberprofil) | Must |
| Login für Screener | Must |
| KI-Extraktion des Lebenslaufs (Edge Function mit Claude API) | Should |
| Termine (Slots) zum Buchen | Should |
| 2FA und E-Mail-Link für das Bewerberprofil | Could |

## Offen

- **Status:** Das Briefing endet bei „Status“. Welche Spalten hat das Kanban?
  Vorschlag: Eingegangen → In Prüfung → Interview → Zusage / Absage.
- **Kürzel im Kanban:** Kürzel der Bewerbung (z. B. `B-012`) oder Kürzel des zuständigen Screeners?
