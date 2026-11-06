# Schnittstelle zwischen Backend und Frontend

Hier steht alles, was das Frontend braucht. Bei Widersprüchen gilt diese Datei vor `STACK.md` und `docs/rollen/`.

## Verbindung

Das Backend läuft schon. URL und Publishable Key stehen in `.env.example`, beide sind öffentlich.

```bash
cp .env.example .env.local
```

Das Frontend ruft nur die Funktionen aus [src/lib/api.ts](../src/lib/api.ts) auf. Die Typen stehen in [src/lib/types.ts](../src/lib/types.ts). Es gibt schon drei Testbewerbungen aus den [Mock-CVs](../testdata/cvs/README.md): `MAEL5101`, `NOBE5102` und `SEER5103`.

## Grundidee

Bewerber laden ihren normalen Lebenslauf hoch. Daraus wird die Maske vorausgefüllt, die Lücken ergänzen sie selbst. Screener sehen nie den Lebenslauf, sondern nur die ausgelesenen Angaben und das Kürzel. Lebenslauf und Personendaten sind nur für Admins sichtbar.

## Wer was sehen darf

| Daten | Bewerber | Screener | Admin |
| --- | --- | --- | --- |
| Lebenslauf-PDF | nur beim Hochladen | nein | ja |
| Name, Kontakt, Demografie | nur beim Eingeben | nein | ja |
| Kürzel, Studium, Stationen, Skills, Antworten | nur beim Eingeben | zugewiesene und fertig bewertete | ja |
| Eigene Bewertung | nein | ja | ja |
| Fremde Bewertungen | nein | sobald alle 4 fertig sind | ja |
| Ranking | nein | ja, ohne Kontaktdaten | ja, mit Kontaktdaten |
| Status ändern | nein | nein | ja |

Die Datenbank setzt das durch, nicht das Frontend. Bewerber haben kein Konto und keinen direkten Schreibzugriff.

## Bewerber-Seite `/apply`

1. **Lebenslauf hochladen:** Als Erstes kommt `checkCv(file)`. Die Antwort enthält `contact`, `profile` und `cv`.
   - `has_text: false`: Das PDF ist ein Scan, die Person füllt die Maske von Hand aus.
   - `format_recognized: false`: Der Lebenslauf hat nicht das Standardformat, Stationen werden von Hand eingetragen.
2. **Maske durchklicken und Lücken füllen:** Leere Felder sind nicht erkannt worden, alles bleibt änderbar.
   - Persönliches aus `contact`: Vorname, Nachname, E-Mail, Telefon, Ort. Dazu die Datenschutz-Einwilligung und weitere demografische Felder in `demographics`.
   - Studium aus `profile`: Studiengang, Abschluss, Hochschule, voraussichtlicher Abschluss.
   - Aus `cv`: Stationen, Ausbildung, Skills und Sprachen. Jede Station bekommt eine Checkbox für `is_relevant`, das ist die „most relevant experience“.
3. **Fragen:** Die 3 festen Fragen aus `getQuestions()` beantworten lassen. `max_length` ist das Zeichenlimit.
4. **Absenden:** `submitApplication(application, file)` gibt das Kürzel zurück, das die Erfolgsseite anzeigt.

Stehen Name, E-Mail oder Telefon in Angaben, die Screener sehen, also in Antworten, Stationen, Studium oder Skills, lehnt das Backend ab. Dann wirft der Aufruf einen `ApiError`, und `error.leaks` nennt die Treffer. Die Person korrigiert die Stelle und sendet erneut.

## Screener-Seite `/recruiter`

Login mit `supabase.auth.signInWithPassword`, danach gibt `getMyRole()` die Rolle zurück. Ist sie `null`, gehört das Konto nicht zum Team.

**Dashboard**
- `getProgress()` liefert den Recruiting-Fortschritt: `applications_done` von `applications_total`, `reviews_done` von `reviews_total`, eigene offene und erledigte Bewerbungen sowie die Anzahl je Status.
- Admins bekommen zusätzlich `screeners` mit dem Stand jeder Person.
- `getMyQueue()` liefert die eigenen Bewerbungen, offene zuerst. Offen heißt `completed_at` ist leer.

**Bewertung einer Bewerbung**
- `getApplicationDetails(id)` liefert Studium, Skills, Sprachen, Stationen, Ausbildung und Antworten. Stationen mit `is_relevant` hervorheben.
- `getCriteria()` liefert die Kriterien für das Formular, je Kriterium eine Skala von 1 bis 5.
- `submitRating(id, scores, comment)` speichert alle Kriterien auf einmal. Danach ist die Bewertung gesperrt.

**Ranking**
- `getRanking()` ist die Übersicht für Screener, `getRankingWithContacts()` für Admins mit Name, E-Mail, Telefon und `cv_path`.
- Klick auf einen Eintrag: `getApplicationDetails(application_id)` für die Infos und `getReviews(application_id)` für die 4 Einschätzungen.
- Admins öffnen den Lebenslauf mit `getCvUrl(cv_path)`. Der Link gilt 60 Sekunden.
- Admins verschieben Bewerbungen mit `setApplicationStatus(id, status)`.

## Status

| Status | Bedeutung | Wer setzt ihn |
| --- | --- | --- |
| `not_rated` | Nicht bewertet, die 4 Bewertungen sind noch nicht da | automatisch beim Eingang |
| `rated` | Bewertet | automatisch nach der 4. Bewertung, oder ein Admin setzt zurück |
| `rejected` | Abgelehnt | Admin im Ranking |
| `accepted` | Angenommen, zum Beispiel zum Interview eingeladen | Admin im Ranking |

Verschieben geht nur bei fertig bewerteten Bewerbungen.

## Bewertungslogik

- **Zuweisung:** Jede Bewerbung geht automatisch an 4 Screener, zuerst an die mit der wenigsten offenen Arbeit. Kommen neue Screener dazu, werden offene Plätze aufgefüllt.
- **Ergebnis je Screener:** Summe aus Punkten mal Gewicht, geteilt durch die Summe der Gewichte.
- **Gesamtergebnis:** Der Schnitt der 4 Screener-Ergebnisse. Darüber wird gerankt, die beste Bewerbung zuerst.
- **Reihenfolge:** Im Ranking stehen nur vollständig bewertete Bewerbungen, es wächst also bis zum Schluss.
- **Unabhängigkeit:** Fremde Bewertungen bleiben verborgen, bis alle 4 fertig sind.

Fragen und Kriterien sind Platzhalter, die echten kommen noch. Die Kriterien sind Motivation 30 %, Fachliche Eignung 30 %, Erfahrung 25 % und Kommunikation 15 %. Sie liegen in den Tabellen `questions` und `rating_criteria`.

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
- Lebenslauf-Format: [testdata/cvs/README.md](../testdata/cvs/README.md)
