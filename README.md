# hackathon-2026

> Projektidee in einem Satz. _(Tragt ihr ein, sobald die Idee steht.)_

## Schnellstart

```bash
git clone https://github.com/JonathanKub09/hackathon-2026.git
cd hackathon-2026
cp .env.example .env
```

Die Befehle zum Installieren und Starten kommen hierher, sobald der Tech-Stack feststeht.

## Zusammenarbeiten

1. Aufgabe als Issue anlegen und dir zuweisen.
2. Eigenen Branch von `main` erstellen.
3. Pull Request öffnen und nach `main` mergen.

Die genauen Befehle und Regeln stehen in [CONTRIBUTING.md](CONTRIBUTING.md).

## Design

Im Repo liegt der Design-Skill [`taste-skill`](.claude/skills/taste-skill/) von Leonxlnx (MIT-Lizenz). Claude Code erkennt ihn in diesem Repo automatisch, wenn ihr Oberflächen baut oder überarbeitet. Ohne Claude Code könnt ihr `references/` und `library/` als Nachschlagewerk nutzen.

Die Node-Skripte aus dem Original fehlen bewusst, weil sie einen echten Browser steuern und Daten aus dem Netz laden. Befehle wie `draw.mjs`, `lint.mjs` oder `inspect.mjs`, die in `SKILL.md` stehen, funktionieren deshalb nicht. Die Designrichtung wählt ihr also von Hand aus der Bibliothek, und die automatische Prüfung entfällt. Die vollständige Version installiert ihr so:

```bash
npx skills add Leonxlnx/taste-skill --skill design-taste-frontend
```

## Team

| Name | GitHub | Rolle |
| ---- | ------ | ----- |
|      |        |       |
