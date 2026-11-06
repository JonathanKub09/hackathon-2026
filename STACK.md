# Tech-Stack & Plan – Bewerbungs-App

App für den Bewerbungsprozess einer studentischen Unternehmensberatung.
Bewerber geben Lebenslauf, Motivationstext usw. ein. Die Daten werden in Supabase gespeichert.
Recruiter sehen nur Lebenslauf und Motivationstext.

## Stack: Vite + React + TypeScript + Tailwind + Supabase

| Teil | Wahl | Warum |
|---|---|---|
| Frontend | **Vite + React + TS** | Startet in Sekunden, keine Framework-Magie |
| Styling | **Tailwind** (optional shadcn/ui) | Formulare sehen ohne eigenes CSS ordentlich aus |
| Routing | **react-router** | Zwei Seiten: `/apply` und `/recruiter` |
| DB | **Supabase Postgres** | Tabelle `applications` |
| Lebenslauf | **Supabase Storage** | Bucket `cvs` für das PDF |
| Recruiter-Login | **Supabase Auth** (E-Mail/Passwort) | Nur eingeloggte Nutzer sehen Bewerbungen |
| Hosting | **Vercel** oder Netlify | Repo verbinden, fertig |

Kein Next.js, weil wir kein SSR und keine API-Routes brauchen. Supabase übernimmt Backend, Auth und Dateispeicher.

## Setup (ca. 5 Min.)

```bash
npm create vite@latest . -- --template react-ts
npm i @supabase/supabase-js react-router-dom
npm i -D tailwindcss @tailwindcss/vite
```

`.env.local` (nicht committen):

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## Supabase-Schema

```sql
create table applications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  name text not null,
  email text not null,
  studiengang text,
  semester int,
  motivation text not null,
  cv_path text,                      -- Pfad im Storage-Bucket "cvs"
  consent_privacy boolean not null,  -- Checkbox
  interests text[]                   -- z.B. Checkboxen "Strategy", "Tech", ...
);

alter table applications enable row level security;

-- Bewerber (anonym) dürfen nur einfügen
create policy "anon insert" on applications for insert to anon with check (true);

-- Recruiter: eigene View mit nur CV + Motivation
create view recruiter_view with (security_invoker = true) as
  select id, created_at, motivation, cv_path from applications;

create policy "recruiter read" on applications for select to authenticated using (true);
```

### Storage

- Bucket `cvs` als **private** anlegen
- Insert-Policy für `anon`, Select-Policy für `authenticated`
- Recruiter-Seite öffnet PDFs über `createSignedUrl`

### Hinweis zum Datenschutz

Die View steuert nur, was die Recruiter-Seite anzeigt. Sicher ist sie nicht, denn ein eingeloggter Nutzer kann die Tabelle trotzdem direkt abfragen.
Wenn „Recruiter sehen nur CV + Motivation“ wirklich durchgesetzt werden soll, die Daten auf zwei Tabellen aufteilen (`applications_private` und `applications_public`).
Für die Hackathon-Demo reicht die View.

## Zeitplan (60 Min.)

- **0–10 Min.:** Setup, Supabase-Projekt, Schema, Bucket
- **10–30 Min.:** Bewerbungsformular mit Feldern, Checkboxen, PDF-Upload und Insert
- **30–45 Min.:** Recruiter-Login und Liste mit Motivation und PDF-Link
- **45–55 Min.:** Styling und Deploy auf Vercel
- **55–60 Min.:** Puffer und Demo vorbereiten
