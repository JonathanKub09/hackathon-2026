# Rolle 2: Frontend Bewerber (`/apply`)

Du baust die Seite, auf der sich Studierende bewerben: Formular ausfüllen, Lebenslauf hochladen, absenden.
Stack und Gesamtplan stehen in [STACK.md](../../STACK.md).

## Deine Aufgaben

1. **Vite-Gerüst anlegen und sofort pushen** (die anderen warten darauf):
   ```bash
   npm create vite@latest . -- --template react-ts
   npm i @supabase/supabase-js react-router-dom
   npm i -D tailwindcss @tailwindcss/vite
   ```
   Tailwind einrichten. Router mit zwei Routen `/apply` und `/recruiter` in `src/App.tsx`. `/recruiter` zeigt erst einmal nur einen Platzhalter.
   `.env.local` in `.gitignore` aufnehmen.
2. **Formular** in `src/pages/apply/`:
   - Name, E-Mail, Studiengang, Semester
   - Motivationstext (Textarea, Pflichtfeld)
   - Lebenslauf-Upload (nur PDF, max. ca. 5 MB)
   - Checkboxen für Interessen, z. B. Strategy, Tech, Finance, Marketing
   - Pflicht-Checkbox Datenschutz-Einwilligung
3. **Absenden**:
   1. PDF hochladen: `supabase.storage.from('cvs').upload(\`${crypto.randomUUID()}.pdf\`, file)`
   2. Insert in `applications` mit dem Pfad als `cv_path`
   3. Danach eine Erfolgsseite anzeigen, bei Fehlern eine Meldung
4. **Validierung**: Pflichtfelder, E-Mail-Format, Dateityp. Der Absenden-Button ist während des Uploads deaktiviert.

## Schnittstelle

Du nutzt `supabase` aus `src/lib/supabase.ts` und den Typ `NewApplication` aus `src/lib/types.ts`. Beides liefert Rolle 1.
Bis die Dateien da sind, kannst du das Formular schon bauen und das Absenden mit `console.log` simulieren.

## Deine Dateien

- Gerüst: `package.json`, `vite.config.ts`, `src/main.tsx`, `src/App.tsx` (nur am Anfang, danach Routen nur mit Absprache ändern)
- `src/pages/apply/**`
- eigene Komponenten unter `src/components/apply/`

## Fertig, wenn

- Eine ausgefüllte Bewerbung mit PDF in Supabase landet (Tabelle und Bucket prüfen).
- Das Formular auf dem Handy benutzbar ist.
