# Schnittstelle zwischen Backend und Frontend

Hier steht alles, was das Frontend braucht. Bei Widersprüchen gilt diese Datei vor `STACK.md` und `docs/rollen/`.

## Verbindung

Das Backend läuft schon. URL und Publishable Key stehen in `.env.example`, beide sind öffentlich.

```bash
cp .env.example .env.local
```

Das Frontend ruft nur die Funktionen aus [src/lib/api.ts](../src/lib/api.ts) auf. Die Typen stehen in [src/lib/types.ts](../src/lib/types.ts). Es gibt schon drei Testbewerbungen aus den [Mock-CVs](../testdata/cvs/README.md): `MAEL5101`, `NOBE5102` und `SEER5103`.

## Wer was sehen darf

| Daten | Bewerber | Screener | Admin |
| --- | --- | --- | --- |
| Name, Kontakt, Demografie | nur beim Eingeben | nein | ja |
| Lebenslauf-PDF | nur beim Hochladen | zugewiesene und fertig bewertete | ja |
| Kürzel, Gruppe, Stationen, Antworten | nur beim Eingeben | zugewiesene und fertig bewertete | ja |
| Fragen je Gruppe | ja | ja | bearbeiten |
| Eigene Bewertung | nein | ja | ja |
| Fremde Bewertungen | nein | sobald alle 4 fertig sind | ja |
| Ranking | nein | ja, ohne Kontaktdaten | ja, mit Kontaktdaten |

Die Datenbank setzt das durch, nicht das Frontend. Bewerber haben kein Konto und keinen direkten Schreibzugriff.

## Bewerber-Seite `/apply`

1. **Angaben:** Vorname, Nachname, E-Mail, Telefon, Datenschutz-Einwilligung. Weitere demografische Felder kommen als freies Objekt in `demographics`. Ein Studiengang wird nicht abgefragt.
2. **Lebenslauf:** Die Person lädt den selbst anonymisierten Lebenslauf hoch, dann folgt `checkCv(person, file)`.
   - `anonymous: false`: Die Einträge aus `leaks` anzeigen und einen neuen Upload verlangen.
   - `has_text: false`: Das PDF ist ein Scan, also Stationen von Hand eintragen lassen.
   - `format_recognized: false`: Der Lebenslauf hat nicht das Standardformat, auch dann Stationen von Hand.
3. **Prüfen:** Das Ergebnis aus `cv` zum Korrigieren anzeigen. Jede Station bekommt eine Checkbox für `is_relevant`. Die erkannte `group` ist vorausgewählt, die Auswahl kommt aus `getGroups()`.
4. **Fragen:** Die 3 Fragen aus `getQuestions(group)` beantworten lassen. `max_length` ist das Zeichenlimit.
5. **Absenden:** `submitApplication(application, file)` gibt das Kürzel zurück, das die Erfolgsseite anzeigt.

Das Backend prüft beim Absenden erneut. Stehen Name, Telefon oder eine E-Mail im PDF, in den Stationen oder in den Antworten, wirft der Aufruf einen `ApiError`, und `error.leaks` nennt die Treffer.

## Screener-Seite `/recruiter`

Login mit `supabase.auth.signInWithPassword`, danach gibt `getMyRole()` die Rolle zurück. Ist sie `null`, gehört das Konto nicht zum Team.

**Dashboard**
- `getProgress()` liefert den Recruiting-Fortschritt: `applications_done` von `applications_total`, `reviews_done` von `reviews_total` sowie eigene offene und erledigte Bewerbungen.
- Admins bekommen zusätzlich `screeners` mit dem Stand jeder Person.
- `getMyQueue()` liefert die eigenen Bewerbungen, offene zuerst. Offen heißt `completed_at` ist leer.

**Bewertung einer Bewerbung**
- `getApplicationDetails(id)` liefert Stationen, Ausbildung und Antworten. Stationen mit `is_relevant` hervorheben.
- `getCvUrl(cv_path)` liefert einen Link zum PDF, der 60 Sekunden gilt.
- `getCriteria()` liefert die Kriterien für das Formular, je Kriterium eine Skala von 1 bis 5.
- `submitRating(id, scores, comment)` speichert alle Kriterien auf einmal. Danach ist die Bewertung gesperrt.

**Ranking**
- `getRanking()` ist die Übersicht für Screener, `getRankingWithContacts()` für Admins mit Name, E-Mail und Telefon.
- Klick auf einen Eintrag: `getApplicationDetails(application_id)` für die Infos und `getReviews(application_id)` für die 4 Einschätzungen.

## Bewertungslogik

- **Zuweisung:** Jede Bewerbung geht automatisch an 4 Screener, zuerst an die mit der wenigsten offenen Arbeit. Kommen neue Screener dazu, werden offene Plätze aufgefüllt.
- **Ergebnis je Screener:** Summe aus Punkten mal Gewicht, geteilt durch die Summe der Gewichte.
- **Gesamtergebnis:** Der Schnitt der 4 Screener-Ergebnisse. Darüber wird gerankt, die beste Bewerbung zuerst.
- **Reihenfolge:** Im Ranking stehen nur vollständig bewertete Bewerbungen, es wächst also bis zum Schluss.
- **Unabhängigkeit:** Fremde Bewertungen bleiben verborgen, bis alle 4 fertig sind.

Die Kriterien sind Platzhalter: Motivation 30 %, Fachliche Eignung 30 %, Erfahrung 25 %, Kommunikation 15 %. Sie liegen in der Tabelle `rating_criteria`.

## Kürzel

Das Backend bildet es aus den ersten 2 Buchstaben des Vornamens, den letzten 2 Buchstaben des Nachnamens und den letzten 4 Ziffern der Telefonnummer. Aus Mara Beispiel mit 030 23125 101 wird `MAEL5101`. Bei einer Dopplung kommt `-2` dazu.

## Konten für Screener und Admins

1. Konto im Supabase-Dashboard unter Authentication > Users anlegen.
2. Im SQL Editor die Rolle vergeben, `role` ist `screener` oder `admin`:

```sql
insert into public.staff (user_id, role, display_name)
select id, 'screener', 'Anzeigename' from auth.users where email = 'name@example.com';
```

Es braucht mindestens 4 Screener, sonst bekommt keine Bewerbung ihre 4 Bewertungen. Vorhandene Bewerbungen werden beim Anlegen automatisch zugewiesen.

## Backend ändern

- Schema: [supabase/migrations/](../supabase/migrations/)
- Logik für Bewerbungen: [supabase/functions/apply/](../supabase/functions/apply/)
