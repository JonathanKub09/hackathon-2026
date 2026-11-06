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
   - Studium aus `profile`: Studiengang, Abschluss, Hochschule, voraussichtlicher Abschluss. Das Fachsemester trägt die Person selbst ein, Feld `semester`.
   - Aus `cv`: Stationen, Ausbildung, Skills und Sprachen. Jede Station bekommt eine Checkbox für `is_relevant`, das ist die „most relevant experience“.
3. **Fragen:** Die 3 festen Fragen aus `getQuestions()` beantworten lassen. `max_length` ist das Zeichenlimit.
4. **Wunschtermin:** Die Auswahl kommt als Text in `preferred_slot`.
5. **Absenden:** Mit Einwilligung und optional `keep_data` gibt `submitApplication(application, file)` das Kürzel und `token` zurück.
6. **Bewerberprofil:** `getApplicantStatus(token)` liefert den Stand der eigenen Bewerbung. Wer den Zugang hat, sieht nur diese Angaben, also den Link nur der Person selbst zeigen.

Stehen Name, E-Mail oder Telefon in Angaben, die Screener sehen, also in Antworten, Stationen, Studium oder Skills, lehnt das Backend ab. Dann wirft der Aufruf einen `ApiError`, und `error.leaks` nennt die Treffer. Die Person korrigiert die Stelle und sendet erneut.

## Screener-Seite `/recruiter`

Login mit `signIn(email, password)`, Registrierung mit `registerStaff(...)`. Danach gibt `getMe()` Rolle und Anzeigename zurück. Ist das Ergebnis `null`, gehört das Konto nicht zum Team. `signOut()` meldet ab.

**Dashboard**
- `getProgress()` liefert den Recruiting-Fortschritt: `applications_done` von `applications_total`, `reviews_done` von `reviews_total`, eigene offene und erledigte Bewerbungen sowie die Anzahl je Status.
- Admins bekommen zusätzlich `screeners` mit dem Stand jeder Person.
- `getOverview()` liefert alles fürs Kanban: eigene Zuweisungen und fertig bewertete Bewerbungen mit `status`, `reviews_done` von `reviews_required`, `is_assigned`, `my_completed_at`, `score` und `criterion_scores`.
- `getMyQueue()` liefert nur die eigene Warteschlange, offene zuerst.

**Bewertung einer Bewerbung**
- `getApplicationDetails(id)` liefert Studium, Skills, Sprachen, Stationen, Ausbildung und Antworten. Stationen mit `is_relevant` hervorheben.
- `getCriteria()` liefert die Kriterien mit `basis` und den 4 Stufentexten in `levels`, die Skala geht von 1 bis 4.
- `submitRating(id, scores, comment)` speichert alle Kriterien auf einmal. Danach ist die Bewertung gesperrt, `getMyRating(id)` zeigt sie wieder an.
- Die Punkte sammelt das Frontend also zuerst lokal und schickt sie mit einem Button ab.

**Ranking**
- `getRanking()` ist die Übersicht für Screener, `getRankingWithContacts()` für Admins mit Name, E-Mail, Telefon und `cv_path`.
- `getAdminOverview()` zeigt Admins zusätzlich noch nicht fertig bewertete Bewerbungen. `criterion_scores` enthält den Schnitt je Kriterium.
- Klick auf einen Eintrag: `getApplicationDetails(application_id)` für die Infos und `getReviews(application_id)` für die 4 Einschätzungen.
- Admins öffnen den Lebenslauf mit `getCvUrl(cv_path)`. Der Link gilt 60 Sekunden.
- Admins verschieben Bewerbungen mit `setApplicationStatus(id, status, interviewAt)`. Der Termin ist optional und steht danach in `interview_at`.

## Status

| Status | Bedeutung | Wer setzt ihn |
| --- | --- | --- |
| `not_rated` | Nicht bewertet, die 4 Bewertungen sind noch nicht da | automatisch beim Eingang |
| `rated` | Bewertet | automatisch nach der 4. Bewertung, oder ein Admin setzt zurück |
| `interview` | Zum Interview eingeladen | Admin im Ranking |
| `rejected` | Abgelehnt | Admin im Ranking |
| `accepted` | Angenommen | Admin im Ranking |

Verschieben geht nur bei fertig bewerteten Bewerbungen.

## Bewertungslogik

- **Zuweisung:** Jede Bewerbung geht automatisch an 4 Screener, zuerst an die mit der wenigsten offenen Arbeit. Kommen neue Screener dazu, werden offene Plätze aufgefüllt.
- **Ergebnis je Screener:** Summe aus Punkten mal Gewicht, geteilt durch die Summe der Gewichte.
- **Gesamtergebnis:** Der Schnitt der 4 Screener-Ergebnisse. Darüber wird gerankt, die beste Bewerbung zuerst.
- **Reihenfolge:** Im Ranking stehen nur vollständig bewertete Bewerbungen, es wächst also bis zum Schluss.
- **Unabhängigkeit:** Fremde Bewertungen bleiben verborgen, bis alle 4 fertig sind.

Fragen und Kriterien sind Platzhalter, die echten kommen noch. Die Kriterien stammen aus der Screener-Ansicht mit Skala 1 bis 4, die Gewichte sind Motivation 30 %, Fachfrage 30 %, Berufserfahrung 25 % und Skills 15 %. Sie liegen in den Tabellen `questions` und `rating_criteria`.

## Kürzel

Das Backend bildet es aus den ersten 2 Buchstaben des Vornamens, den letzten 2 Buchstaben des Nachnamens und den letzten 4 Ziffern der Telefonnummer. Aus Mara Beispiel mit 030 23125 101 wird `MAEL5101`. Bei einer Dopplung kommt `-2` dazu.

## Konten für Screener und Admins

Auf `/recruiter/login` gibt es „Neu hier? Konto erstellen“. Für die Registrierung braucht man einen Einladungscode, der Code entscheidet über die Rolle. Es gibt je einen für Screener und Admins, das Konto ist sofort aktiv.

Die Codes stehen nicht im Repo, weil es öffentlich ist. Die Datenbank kennt nur ihre Hashes in `private.invite_codes`, einen neuen Code legt man dort als SHA-256-Hash an und löscht den alten.

Es braucht mindestens 4 Screener, sonst bekommt keine Bewerbung ihre 4 Bewertungen. Vorhandene Bewerbungen werden beim Anlegen automatisch zugewiesen.

## Backend ändern

- Schema: [supabase/migrations/](../supabase/migrations/)
- Logik für Bewerbungen: [supabase/functions/apply/](../supabase/functions/apply/)
- Registrierung: [supabase/functions/register/](../supabase/functions/register/)
- Lebenslauf-Format: [testdata/cvs/README.md](../testdata/cvs/README.md)
