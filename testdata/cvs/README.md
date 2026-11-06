# Mock-Lebensläufe

Drei erfundene Lebensläufe im Standardformat zum Testen und für die Demo. Alle Personen, Firmen und Hochschulen sind fiktiv. Echte Lebensläufe gehören nicht in dieses Repo, denn es ist öffentlich.

| Datei | Kürzel | Was sie testet |
| ----- | ------ | -------------- |
| `mock-cv-technik.pdf` | `MAEL5101` | Studium läuft noch, voraussichtlicher Abschluss 03/2027. Ein langer Stichpunkt läuft über zwei Zeilen. |
| `mock-cv-kreativ.pdf` | `NOBE5102` | Abgeschlossenes Studium. |
| `mock-cv-generisch.pdf` | `SEER5103` | Kein Studium, die Studienfelder bleiben leer und die Person füllt sie selbst aus. |

`cvs.json` ist die Quelle für die PDFs und zugleich das Soll-Ergebnis für den Parser: Aus jedem PDF muss genau der passende Eintrag herauskommen. Der Block `identitaet` ist der Kopf des Lebenslaufs.

## Format

Das Format ist einspaltig und enthält echten Text, keine Bilder. Es ist nicht anonym: Den Lebenslauf sehen nur Admins, Screener bekommen nur die ausgelesenen Angaben.

```text
Vorname Nachname
E-Mail: name@example.com
Telefon: 030 23125 100
Ort: Musterstadt

ERFAHRUNG
MM/JJJJ - MM/JJJJ | Titel | Organisation
- Stichpunkt, der auch über mehrere Zeilen laufen darf

AUSBILDUNG
MM/JJJJ - heute | Abschluss | Einrichtung

KENNTNISSE
Kenntnis, Kenntnis, Kenntnis

SPRACHEN
Sprache (Niveau), Sprache (Niveau)
```

Regeln für den Parser:

- Vor `ERFAHRUNG` stehen der Name und die Kontaktdaten. Der Name ist die erste passende Zeile.
- Die vier Überschriften stehen in Großbuchstaben und immer in dieser Reihenfolge.
- Eine Station beginnt immer mit einer Zeile im Muster `Zeitraum | Titel | Organisation`. Das Ende ist ein Datum oder `heute`.
- Eine Zeile, die mit `- ` beginnt, ist ein neuer Stichpunkt. Andere Zeilen gehören noch zum vorherigen Stichpunkt.
- Jede Station unter `ERFAHRUNG` wird in der App zu einer Checkbox für die „most relevant experience“.
- Das Studium ist der erste Eintrag unter `AUSBILDUNG` mit akademischem Abschluss, etwa `B.Eng. Maschinenbau`. Daraus entstehen Abschluss, Studiengang und Hochschule.
- Das Enddatum dieses Eintrags ist der voraussichtliche Abschluss. Bei `heute` bleibt das Feld leer.

Lebensläufe in anderen Formaten erkennt der Parser nicht. Dann füllt die Person die Maske von Hand aus.

## PDFs neu erzeugen

Nach Änderungen an `cvs.json` oder am Layout:

```bash
uv run testdata/cvs/generate.py
```
