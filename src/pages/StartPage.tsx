import { Link } from 'react-router-dom'
import { ORG } from '../components/apply/model.ts'

const CHOICES = [
  {
    to: '/apply',
    title: 'Ich möchte mich bewerben',
    text: 'Lebenslauf hochladen, Angaben prüfen und drei Fragen beantworten.',
  },
  {
    to: '/recruiter',
    title: 'Ich bin im Recruiting-Team',
    text: 'Anmelden, Bewerbungen bewerten und das Ranking ansehen.',
  },
]

// Einstieg der App: Hier entscheidet man, ob man Bewerber oder Screener ist.
export default function StartPage() {
  return (
    <main className="mx-auto flex min-h-svh max-w-4xl flex-col justify-center px-5 py-14 sm:px-8">
      <p className="text-base font-semibold">{ORG}</p>
      <h1 className="mt-4 text-[clamp(2.4rem,6vw,4.5rem)] font-semibold leading-[0.95] tracking-[-0.04em]">Wie möchtest du weitermachen?</h1>
      <div className="mt-12 grid gap-4 md:grid-cols-2">
        {CHOICES.map((choice) => (
          <Link
            key={choice.to}
            to={choice.to}
            className="group flex flex-col bg-surface p-6 transition-colors hover:bg-ink hover:text-white focus-visible:outline-2 focus-visible:outline-accent sm:p-8"
          >
            <span className="text-2xl font-semibold tracking-[-0.02em]">{choice.title}</span>
            <span className="mt-3 text-lg leading-relaxed text-muted group-hover:text-white/80">{choice.text}</span>
          </Link>
        ))}
      </div>
    </main>
  )
}
