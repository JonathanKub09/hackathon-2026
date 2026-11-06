import { ORG } from './model.ts'
import { Button, Header, QrCode, Redact, Rise, Wordmark } from './ui.tsx'

/** Der Touchpoint: ein Aushang mit QR-Code und Kurzlink, so wie er am Campus hängt. */
export function Touchpoint({ onOpen }: { onOpen: () => void }) {
  return (
    <main className="grid min-h-svh place-items-center bg-surface px-5 py-14">
      <div className="grid w-full max-w-4xl items-center gap-10 md:grid-cols-[1fr_auto]">
        <Rise>
          <article className="bg-ink p-8 text-white sm:p-12" aria-label="Aushang am Campus">
            <Wordmark invert />
            <h1 className="mt-16 text-[clamp(2.4rem,6vw,4.5rem)] font-semibold leading-[0.95] tracking-[-0.04em]">
              Name egal. Skills zählen.
            </h1>
            <p className="mt-6 max-w-[34ch] text-lg leading-relaxed text-white/85">
              Wir suchen Studierende für echte Beratungsprojekte. Bewirb dich anonym in zehn Minuten.
            </p>
            <div className="mt-12 flex items-end gap-6">
              <button type="button" onClick={onOpen} className="shrink-0 bg-white p-2 transition-transform hover:scale-[1.03] active:scale-[0.98]">
                <QrCode size={128} />
                <span className="sr-only">QR-Code scannen</span>
              </button>
              <p className="text-base leading-snug text-white/85">
                Scannen oder öffnen:
                <br />
                <span className="font-medium text-white">muster-consulting.de/bewerben</span>
              </p>
            </div>
          </article>
        </Rise>
        <Rise i={2} className="max-w-xs">
          <h2 className="text-2xl font-semibold tracking-[-0.02em]">Touchpoint</h2>
          <p className="mt-3 text-base leading-relaxed">
            Bewerber kommen über den QR-Code auf Plakat und Flyer oder über einen Link aus Social Media und
            Uni-Newsletter. Beides führt auf die Startseite.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Button onClick={onOpen}>QR-Code scannen</Button>
            <Button variant="secondary" onClick={onOpen}>
              Link öffnen
            </Button>
          </div>
        </Rise>
      </div>
    </main>
  )
}

const hiddenData = [
  { label: 'Name', value: 'Alexandra Beispiel' },
  { label: 'Alter', value: '22 Jahre' },
  { label: 'Geschlecht', value: 'weiblich' },
  { label: 'Herkunft', value: 'Lissabon' },
  { label: 'Foto', value: 'Bewerbungsfoto.jpg' },
]
const visible = [
  { label: 'Skills', value: 'Python, SQL, Präsentieren' },
  { label: 'Erfahrung', value: 'Werkstudentin Datenanalyse' },
  { label: 'Motivation', value: '„Ich will sehen, wie Theorie in echten Firmen trägt.“' },
]

const ablauf = [
  ['Kontaktdaten angeben', 'Nur für uns, damit wir dich erreichen. Recruiter sehen sie nie.'],
  ['Lebenslauf hochladen', 'Wir schwärzen Name, Foto, Alter und Adresse automatisch.'],
  ['Daten prüfen', 'Unsere KI liest Ausbildung, Erfahrung und Skills aus. Du korrigierst und ergänzt.'],
  ['Drei Fragen beantworten', 'Kurz und ehrlich: Warum wir, und was dich antreibt.'],
  ['Termin wählen', 'Ein Kennenlerngespräch von 30 Minuten, online oder vor Ort.'],
]

/** Startseite: Worum geht es, Call to Action, Motivation und Skills statt demografischer Daten. */
export function Start({ onStart }: { onStart: () => void }) {
  return (
    <div>
      <Header right={<Button variant="secondary" className="h-11! px-5!" onClick={onStart}>Jetzt bewerben</Button>} />

      <section className="mx-auto grid max-w-6xl gap-12 px-5 pt-12 pb-24 sm:px-8 md:grid-cols-[1.15fr_1fr] md:items-end md:pt-20 md:pb-36">
        <div>
          <Rise>
            <h1 className="text-[clamp(2.75rem,8.2vw,7rem)] font-semibold leading-[0.92] tracking-[-0.045em]">
              Bewirb dich mit dem, was du kannst.
            </h1>
          </Rise>
          <Rise i={1}>
            <p className="mt-8 max-w-[44ch] text-xl leading-relaxed">
              {ORG} ist eine studentische Unternehmensberatung. Bei uns entscheiden Motivation und Skills,
              nicht Name, Alter oder Herkunft.
            </p>
          </Rise>
          <Rise i={2} className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Button onClick={onStart} className="h-14 px-9 text-lg">
              Bewerbung starten
            </Button>
            <span className="text-base text-muted">Dauert etwa zehn Minuten</span>
          </Rise>
        </div>

        <Rise i={3}>
          <figure className="bg-surface p-6 sm:p-8" aria-label="So sieht ein Recruiter deine Bewerbung">
            <figcaption className="text-base font-medium">So sieht ein Recruiter deine Bewerbung</figcaption>
            <dl className="mt-6 space-y-3 text-lg">
              {hiddenData.map((c, i) => (
                <div key={c.label} className="grid grid-cols-[7.5rem_1fr] gap-3">
                  <dt className="text-muted">{c.label}</dt>
                  <dd>
                    <Redact text={c.value} delay={500 + i * 140} />
                  </dd>
                </div>
              ))}
              {visible.map((c) => (
                <div key={c.label} className="grid grid-cols-[7.5rem_1fr] gap-3">
                  <dt className="text-muted">{c.label}</dt>
                  <dd className="font-medium">{c.value}</dd>
                </div>
              ))}
            </dl>
          </figure>
        </Rise>
      </section>

      <section className="bg-ink text-white">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-24 sm:px-8 md:grid-cols-2 md:py-36">
          <h2 className="text-[clamp(2.25rem,5vw,4rem)] font-semibold leading-[0.98] tracking-[-0.04em]">
            Worum geht es?
          </h2>
          <div className="space-y-8 text-lg leading-relaxed">
            <p className="text-2xl leading-snug">
              Du arbeitest im Team an echten Projekten für Unternehmen aus der Region, neben dem Studium und mit
              Betreuung.
            </p>
            <dl className="space-y-6">
              <div>
                <dt className="font-semibold">Echte Kunden</dt>
                <dd className="text-white/85">Vom Mittelständler bis zum Start-up, mit Auftrag, Budget und Abgabetermin.</dd>
              </div>
              <div>
                <dt className="font-semibold">Lernen im Team</dt>
                <dd className="text-white/85">Schulungen zu Projektmanagement, Analyse und Präsentation von erfahrenen Mitgliedern.</dd>
              </div>
              <div>
                <dt className="font-semibold">Faire Auswahl</dt>
                <dd className="text-white/85">Recruiter lesen deine Bewerbung ohne Name und Foto. Erst im Gespräch lernen wir dich kennen.</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-12 px-5 py-24 sm:px-8 md:grid-cols-[1fr_1.3fr] md:py-36">
        <h2 className="text-[clamp(2.25rem,5vw,4rem)] font-semibold leading-[0.98] tracking-[-0.04em]">
          So läuft deine Bewerbung
        </h2>
        <ol className="space-y-7">
          {ablauf.map(([t, d]) => (
            <li key={t} className="border-l-4 border-ink pl-5">
              <p className="text-xl font-semibold">{t}</p>
              <p className="mt-1 text-lg leading-relaxed">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      <footer className="bg-accent text-white">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-28">
          <h2 className="text-[clamp(2.25rem,6vw,5rem)] font-semibold leading-[0.95] tracking-[-0.04em]">
            Zeig uns, was dich antreibt.
          </h2>
          <Button variant="invert" onClick={onStart} className="mt-10 h-14 px-9 text-lg">
            Bewerbung starten
          </Button>
          <p className="mt-16 text-base text-white/80">
            {ORG} · Datenschutz · Impressum
          </p>
        </div>
      </footer>
    </div>
  )
}
