# Bewerbungs-App

Recruiting-Tool für eine studentische Unternehmensberatung: Bewerber laden ihren Lebenslauf hoch, daraus wird die Maske vorausgefüllt. Je 4 Screener bewerten die anonymen Angaben, aus dem Schnitt entsteht ein Ranking, und Admins verschieben Bewerbungen in die Status.

Lies vor jeder Änderung [docs/schnittstelle.md](docs/schnittstelle.md). Sie gilt vor `STACK.md` und `docs/rollen/`.

## Regeln

- Logik, Datenbank und Rechte gehören dem Backend. Das Frontend ruft nur `src/lib/api.ts` auf und ändert weder `supabase/` noch die Logik dahinter. Ergänzungen schlagt ihr dem Backend vor.
- Lebenslauf und Personendaten gibt es nur in `applications_private` und `ranking_admin`, beides nur für Admins. Screener sehen das Kürzel und die ausgelesenen Angaben, nie den Lebenslauf.
- Keine echten Lebensläufe und keinen Service-Role-Key ins Repo, denn es ist öffentlich. Zum Testen gibt es `testdata/cvs/`.
- Für Oberflächen gibt es den Design-Skill in `.claude/skills/taste-skill/`.
