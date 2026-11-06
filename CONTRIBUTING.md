# So arbeiten wir zusammen

## Einmalig einrichten

1. Einladung annehmen: Sie kommt per E-Mail oder liegt unter <https://github.com/notifications>.
2. Repo klonen und die lokale Konfiguration anlegen:

   ```bash
   git clone https://github.com/JonathanKub09/hackathon-2026.git
   cd hackathon-2026
   cp .env.example .env
   ```

## Ablauf pro Aufgabe

1. **Issue anlegen** und dir zuweisen, damit niemand doppelt arbeitet.
2. **Branch von aktuellem `main` erstellen:**

   ```bash
   git switch main
   git pull
   git switch -c feature/kurzer-name
   ```

   Für Fehlerbehebungen nehmt ihr `fix/kurzer-name`.
3. **Committen und pushen:**

   ```bash
   git add .
   git commit -m "Login-Formular hinzufügen"
   git push -u origin feature/kurzer-name
   ```

4. **Pull Request öffnen** und in der Beschreibung `Closes #12` angeben, dann schließt sich das Issue beim Merge von selbst.
5. **Mergen:** Lasst kurz jemanden draufschauen und klickt dann auf _Squash and merge_. Der Branch wird danach automatisch gelöscht.

## Regeln

- **`main` läuft immer.** Dieser Stand wird gezeigt und abgegeben.
- **Kleine Pull Requests, oft mergen.** Das hält Merge-Konflikte klein.
- **Keine Secrets ins Repo.** API-Keys gehören in `.env`, und neue Variablen tragt ihr ohne Wert in `.env.example` ein.

## Merge-Konflikte lösen

```bash
git switch main
git pull
git switch feature/kurzer-name
git merge main
```

Die betroffenen Dateien bearbeiten, dann committen und pushen:

```bash
git add .
git commit
git push
```
