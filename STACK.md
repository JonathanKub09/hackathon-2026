# Tech-Stack & Plan – Bewerbungs-App

> Das Backend steht. Datenmodell, Abläufe und Rechte stehen in [docs/schnittstelle.md](docs/schnittstelle.md), die Datei gilt vor diesem Plan.

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

`.env.local` aus `.env.example` kopieren, die Werte stehen dort schon.

## Supabase

Das Projekt läuft bereits, siehe [docs/schnittstelle.md](docs/schnittstelle.md).

## Zeitplan (60 Min.)

- **0–10 Min.:** Setup, Supabase-Projekt, Schema, Bucket
- **10–30 Min.:** Bewerbungsformular mit Feldern, Checkboxen, PDF-Upload und Insert
- **30–45 Min.:** Recruiter-Login und Liste mit Motivation und PDF-Link
- **45–55 Min.:** Styling und Deploy auf Vercel
- **55–60 Min.:** Puffer und Demo vorbereiten
