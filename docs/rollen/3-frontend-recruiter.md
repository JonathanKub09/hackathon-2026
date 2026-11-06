# Rolle 3: Frontend Recruiter (`/recruiter`)

> **Stand:** Das Backend steht. Abläufe und Aufrufe stehen in [docs/schnittstelle.md](../schnittstelle.md), die Datei gilt vor dieser Rolle.

Du baust die Ansicht für die Screener: einloggen, Bewerbungen durchsehen, Lebenslauf öffnen.
**Recruiter sehen nur Motivationstext und Lebenslauf**, keinen Namen, keine E-Mail und keine Checkbox-Angaben.
Stack und Gesamtplan stehen in [STACK.md](../../STACK.md).

## Deine Aufgaben

1. **Login** in `src/pages/recruiter/`:
   - E-Mail/Passwort-Formular mit `supabase.auth.signInWithPassword`
   - Session prüfen mit `supabase.auth.getSession()` und `onAuthStateChange`
   - Logout-Button
2. **Liste der Bewerbungen**:
   - Daten nur aus der View laden: `supabase.from('recruiter_view').select('*').order('created_at', { ascending: false })`
   - Pro Bewerbung: Eingangsdatum, Motivationstext (gekürzt, aufklappbar), Button „Lebenslauf öffnen“
3. **Lebenslauf öffnen**:
   - `supabase.storage.from('cvs').createSignedUrl(cv_path, 60)` und die URL in einem neuen Tab öffnen
4. **Optional, wenn Zeit bleibt**: Detailansicht mit PDF im `<iframe>` neben dem Motivationstext, Weiter/Zurück zwischen Bewerbungen.

## Schnittstelle

Du nutzt `supabase` aus `src/lib/supabase.ts` und den Typ `RecruiterApplication` aus `src/lib/types.ts`. Beides liefert Rolle 1, die Login-Daten ebenfalls.
Bis Backend und Testdaten da sind, kannst du mit einem Array aus Mock-Objekten vom Typ `RecruiterApplication` arbeiten.

**Wichtig:** Frag nie die Tabelle `applications` direkt ab, sondern immer `recruiter_view`. Nur so bleiben Name und E-Mail ausgeblendet.

## Deine Dateien

- `src/pages/recruiter/**`
- eigene Komponenten unter `src/components/recruiter/`

## Fertig, wenn

- Ohne Login nichts zu sehen ist.
- Nach dem Login die Testbewerbungen erscheinen und sich jedes PDF öffnen lässt.
