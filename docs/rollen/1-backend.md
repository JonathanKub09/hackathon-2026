# Rolle 1: Backend (Supabase)

> **Stand:** Das Backend steht. Abläufe und Aufrufe stehen in [docs/schnittstelle.md](../schnittstelle.md), die Datei gilt vor dieser Rolle.

Du baust alles, worauf die beiden Frontends zugreifen: Datenbank, Dateispeicher, Login und den gemeinsamen Supabase-Client.
Stack und Gesamtplan stehen in [STACK.md](../../STACK.md).

## Deine Aufgaben

1. **Supabase-Projekt anlegen** und URL und Anon-Key an das Team schicken (nicht ins Repo committen).
2. **Schema ausführen**: Tabelle `applications`, RLS, Policies und `recruiter_view` (SQL in [STACK.md](../../STACK.md)).
   Das SQL als `supabase/schema.sql` ins Repo legen.
3. **Storage**: privaten Bucket `cvs` anlegen.
   - Insert-Policy für `anon` (Bewerber laden hoch)
   - Select-Policy für `authenticated` (Recruiter lesen)
4. **Auth**: E-Mail/Passwort aktivieren und 1–2 Recruiter-Accounts im Dashboard anlegen. Die Zugangsdaten bekommt Rolle 3.
5. **Gemeinsamen Code bereitstellen**, sobald Rolle 2 das Vite-Gerüst gepusht hat:
   - `src/lib/supabase.ts`: Client mit `createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)`
   - `src/lib/types.ts`: Typen siehe unten
6. **Testdaten**: 2–3 Beispielbewerbungen mit PDF einfügen, damit Rolle 3 nicht warten muss.
7. Danach: beim Deploy auf Vercel helfen (Env-Variablen dort eintragen).

## Schnittstelle (bitte nicht ohne Absprache ändern)

```ts
// src/lib/types.ts
export type NewApplication = {
  name: string;
  email: string;
  studiengang?: string;
  semester?: number;
  motivation: string;
  cv_path?: string;
  consent_privacy: boolean;
  interests: string[];
};

export type RecruiterApplication = {
  id: string;
  created_at: string;
  motivation: string;
  cv_path: string | null;
};
```

**Konvention für den Dateipfad:** `cvs/<crypto.randomUUID()>.pdf`. Gespeichert wird nur der Pfad in `cv_path`, keine URL.

## Deine Dateien

- `supabase/schema.sql`
- `src/lib/supabase.ts`
- `src/lib/types.ts`

## Fertig, wenn

- Ein anonymer Insert in `applications` klappt, ein anonymer Select nicht.
- Ein eingeloggter Recruiter `recruiter_view` lesen und eine Signed URL für ein PDF erzeugen kann.
