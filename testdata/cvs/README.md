# Mock-Lebensläufe

Drei erfundene, anonymisierte Lebensläufe zum Testen und für die Demo. Alle Personen, Firmen und Hochschulen sind fiktiv. Echte Lebensläufe gehören nicht in dieses Repo, denn es ist öffentlich.

| Datei | Erwartete Gruppe | Kürzel | Was sie testet |
| ----- | ---------------- | ------ | -------------- |
| `mock-cv-technik.pdf` | `technik` | `MAEL5101` | „Kunststofftechnik“ darf nicht als „Kunst“ zählen. Ein langer Stichpunkt läuft über zwei Zeilen. |
| `mock-cv-kreativ.pdf` | `kreativ` | `NOBE5102` | Normaler Treffer über Titel und Kenntnisse. |
| `mock-cv-generisch.pdf` | `generisch` | `SEER5103` | „Ingenieurbüro“ steht nur beim Arbeitgeber und darf nicht als Ingenieur zählen. |

Die Gruppen sind Platzhalter, bis die Konzeption die echten festlegt.

`cvs.json` ist die Quelle für die PDFs und zugleich das Soll-Ergebnis für den Parser: Aus jedem PDF muss genau der passende Eintrag herauskommen. Der Block `identitaet` steht nicht im PDF. Das sind die Angaben, die die Testperson ins Formular einträgt.

## Format

Das Format ist einspaltig und enthält echten Text, keine Bilder. Name, Kontaktdaten, Foto und Geburtsdatum stehen nicht im Lebenslauf, auch nicht in den PDF-Metadaten.

```text
Lebenslauf

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

- Alles vor `ERFAHRUNG` wird ignoriert.
- Die vier Überschriften stehen in Großbuchstaben und immer in dieser Reihenfolge.
- Eine Station beginnt immer mit einer Zeile im Muster `Zeitraum | Titel | Organisation`. Das Ende ist ein Datum oder `heute`.
- Eine Zeile, die mit `- ` beginnt, ist ein neuer Stichpunkt. Andere Zeilen gehören noch zum vorherigen Stichpunkt.
- Jede Station unter `ERFAHRUNG` wird in der App zu einer Checkbox für die „most relevant experience“.
- Stichworte für die Gruppe werden nur in Titeln und Kenntnissen gesucht, als ganze Wörter und nicht im Namen der Organisation.

Lebensläufe in anderen Formaten erkennt der Parser nicht. Dann trägt die Person ihre Stationen von Hand ein.

## PDFs neu erzeugen

Nach Änderungen an `cvs.json` oder am Layout:

```bash
uv run testdata/cvs/generate.py
```
