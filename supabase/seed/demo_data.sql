-- Mock-Daten für die Demo: 4 Demo-Screener ohne Passwort und erfundene Bewerbungen in allen Status.
-- Das Skript lässt sich mehrfach ausführen, es entfernt zuerst die alten Demo-Daten.
-- Alles entfernen: nur den Abschnitt „Alte Demo-Daten entfernen“ ausführen.

do $seed$
declare
  demo_ids uuid[] := array[
    'a0000000-0000-4000-8000-000000000001',
    'a0000000-0000-4000-8000-000000000002',
    'a0000000-0000-4000-8000-000000000003',
    'a0000000-0000-4000-8000-000000000004'
  ]::uuid[];
  demo_names text[] := array['Lena (Demo)', 'Tom (Demo)', 'Aylin (Demo)', 'Ben (Demo)'];
  -- Jede Demo-Person weicht etwas vom Grundwert ab, damit die Bewertungen nicht identisch sind.
  offsets integer[] := array[[0, 0, 0, 0], [0, -1, 0, 1], [1, 0, -1, 0], [-1, 0, 0, 1]];
  criteria text[] := array['motivation', 'fachfrage', 'erfahrung', 'skills'];
  comments text[] := array[
    'Klare Antworten, die Erfahrung passt gut.',
    'Solide, bei der Fachfrage hätte ich mir mehr Tiefe gewünscht.',
    'Sehr motiviert, die Stationen sind noch etwas dünn.',
    'Gutes Profil, im Interview würde ich die Teamarbeit vertiefen.'
  ];
  questions uuid[] := array(select id from public.questions order by position);
  item jsonb;
  new_code text;
  app uuid;
  done integer;
  base integer[];
begin
  -- Alte Demo-Daten entfernen
  delete from public.applications a
  using public.applications_private p
  where p.application_id = a.id and p.email like 'demo.%@example.com';
  delete from public.staff where is_demo;
  delete from auth.users where id = any(demo_ids);

  -- Demo-Screener: ohne Passwort, also ohne Anmeldung möglich
  insert into auth.users (id, aud, role, email)
  select x, 'authenticated', 'authenticated', 'demo.screener.' || o || '@example.com'
  from unnest(demo_ids) with ordinality t(x, o);

  insert into public.staff (user_id, role, display_name, is_demo)
  select x, 'screener', demo_names[o], true
  from unnest(demo_ids) with ordinality t(x, o);

  for item in select * from jsonb_array_elements($json$[
    {"first_name":"Clara","last_name":"Neumann","phone":"030 23125 201","days":12,"done":4,"status":"interview","interview_at":"2026-11-18T10:00:00+01:00","base":[4,4,4,3],
     "study_program":"Wirtschaftsingenieurwesen","degree":"B.Sc.","university":"Hochschule Musterstadt","semester":"5","expected_graduation":"09/2027","preferred_slot":"Mittwoch, 18. November, 09:30 Uhr",
     "skills":["Excel-Modellierung","SQL","Präsentieren"],"languages":["Deutsch (Muttersprache)","Englisch (C1)"],
     "experiences":[{"start_date":"04/2025","end_date":"heute","title":"Werkstudentin Controlling","organization":"Beispielwerk Anlagenbau GmbH","details":["Aufbau eines Kostenmodells für eine neue Fertigungslinie"],"is_relevant":true},{"start_date":"10/2023","end_date":"03/2025","title":"Tutorin Statistik","organization":"Hochschule Musterstadt","details":["Betreuung einer Übungsgruppe"],"is_relevant":false}],
     "a":["Im Controlling sehe ich jeden Tag Zahlen, aber selten, was daraus entschieden wird. Ich will dort mitarbeiten, wo aus der Analyse eine Empfehlung wird.","Aus dem Studium bringe ich Kostenrechnung und Prozessanalyse mit. Damit würde ich zuerst die Daten eines Projekts ordnen.","Ich habe ein Gruppenprojekt allein fertig gemacht, statt früh um Hilfe zu bitten. Heute spreche ich Probleme in der ersten Woche an."]},
    {"first_name":"Jonas","last_name":"Becker","phone":"030 23125 202","days":11,"done":4,"status":"accepted","interview_at":"2026-11-17T14:30:00+01:00","base":[4,3,4,4],
     "study_program":"Data Science","degree":"M.Sc.","university":"Universität Beispielstadt","semester":"2","expected_graduation":"03/2027","preferred_slot":"Dienstag, 17. November, 14:30 Uhr",
     "skills":["Python","Machine Learning","Datenvisualisierung"],"languages":["Deutsch (Muttersprache)","Englisch (C2)"],
     "experiences":[{"start_date":"06/2024","end_date":"heute","title":"Werkstudent Data Analytics","organization":"Musterbank AG","details":["Prognosemodell für Kundenabwanderung"],"is_relevant":true},{"start_date":"03/2023","end_date":"09/2023","title":"Praktikant Beratung","organization":"Nordlicht Consulting GmbH","details":["Marktanalyse für einen Mittelständler"],"is_relevant":true}],
     "a":["Ich möchte Modelle bauen, die wirklich Entscheidungen verändern, und nicht nur gute Kennzahlen im Notebook haben.","Saubere Datenaufbereitung und Prognosemodelle. In einem Projekt würde ich zuerst prüfen, welche Daten überhaupt belastbar sind.","Ich habe zu lange an einem perfekten Modell gearbeitet, statt früh ein einfaches zu zeigen. Heute zeige ich schnell eine erste Version."]},
    {"first_name":"Elif","last_name":"Aydin","phone":"030 23125 203","days":10,"done":4,"status":"interview","interview_at":"2026-11-19T15:30:00+01:00","base":[3,4,3,4],
     "study_program":"Informatik","degree":"B.Sc.","university":"TU Nordstadt","semester":"6","expected_graduation":"03/2027","preferred_slot":"Donnerstag, 19. November, 15:30 Uhr",
     "skills":["TypeScript","React","Datenbanken"],"languages":["Deutsch (C1)","Türkisch (Muttersprache)","Englisch (C1)"],
     "experiences":[{"start_date":"09/2024","end_date":"heute","title":"Werkstudentin Softwareentwicklung","organization":"Kaufhaus Musterstadt","details":["Interne Bestell-App weiterentwickelt"],"is_relevant":true},{"start_date":"10/2023","end_date":"08/2024","title":"Tutorin Programmieren","organization":"TU Nordstadt","details":["Übungen für Erstsemester"],"is_relevant":false}],
     "a":["Ich will Software bauen, die wirklich jemand benutzt, und dafür verstehen, welches Problem ein Unternehmen eigentlich hat.","Saubere Softwarearchitektur und Datenmodellierung. Ich würde mit den Abläufen anfangen und erst dann über Technik sprechen.","Ich habe eine Aufgabe übernommen, ohne nach dem Ziel zu fragen. Heute kläre ich zuerst, was am Ende herauskommen soll."]},
    {"first_name":"Nina","last_name":"Krüger","phone":"030 23125 204","days":9,"done":4,"status":"rated","base":[4,4,3,3],
     "study_program":"Management","degree":"M.A.","university":"Universität Beispielstadt","semester":"3","expected_graduation":"09/2027","preferred_slot":"Dienstag, 17. November, 10:00 Uhr",
     "skills":["Projektmanagement","Moderation","Excel"],"languages":["Deutsch (Muttersprache)","Englisch (C1)","Spanisch (B1)"],
     "experiences":[{"start_date":"02/2025","end_date":"08/2025","title":"Praktikantin Strategie","organization":"Stadtwerke Musterstadt","details":["Workshops zur Neuausrichtung moderiert"],"is_relevant":true}],
     "a":["Ich möchte lernen, wie Veränderungen in Organisationen wirklich funktionieren, und das in echten Projekten ausprobieren.","Methoden aus dem Change Management. Damit würde ich die betroffenen Teams früh einbinden.","Ich habe in einem Projekt Kritik zu spät angesprochen. Heute gebe ich früher und direkter Rückmeldung."]},
    {"first_name":"David","last_name":"Schulz","phone":"030 23125 205","days":8,"done":4,"status":"rated","base":[3,3,3,3],
     "study_program":"Betriebswirtschaftslehre","degree":"B.A.","university":"Hochschule Musterstadt","semester":"4","expected_graduation":"03/2028","preferred_slot":"Mittwoch, 18. November, 13:00 Uhr",
     "skills":["Excel","Buchhaltung","Präsentieren"],"languages":["Deutsch (Muttersprache)","Englisch (B2)"],
     "experiences":[{"start_date":"10/2024","end_date":"heute","title":"Werkstudent Finanzen","organization":"Bäckerei Beispiel GmbH","details":["Monatsabschlüsse vorbereitet"],"is_relevant":true}],
     "a":["Ich will breiter sehen, wie unterschiedliche Unternehmen arbeiten, statt mich früh auf eine Abteilung festzulegen.","Grundlagen aus Rechnungswesen und Controlling. Ich würde prüfen, wo ein Unternehmen wirklich Geld verdient.","Ich habe zu spät mit der Prüfungsvorbereitung begonnen. Seitdem plane ich größere Aufgaben rückwärts vom Termin."]},
    {"first_name":"Mia","last_name":"Hoffmann","phone":"030 23125 206","days":7,"done":4,"status":"rated","base":[3,2,2,3],
     "study_program":"Psychologie","degree":"B.Sc.","university":"Universität Beispielstadt","semester":"3","expected_graduation":"09/2028","preferred_slot":"Keiner passt",
     "skills":["Befragungen","Statistik","Präsentieren"],"languages":["Deutsch (Muttersprache)","Englisch (C1)"],
     "experiences":[{"start_date":"04/2025","end_date":"heute","title":"Hilfskraft Forschung","organization":"Universität Beispielstadt","details":["Befragungen ausgewertet"],"is_relevant":false}],
     "a":["Mich interessiert, warum Teams gut oder schlecht zusammenarbeiten, und das möchte ich in der Praxis erleben.","Ich bringe Wissen über Befragungen und Statistik mit. Damit würde ich die Stimmung in einem Team messbar machen.","Ich habe ein Studienfach gewählt, ohne vorher mit Studierenden zu sprechen. Heute frage ich erst Leute, die es schon machen."]},
    {"first_name":"Paul","last_name":"Wagner","phone":"030 23125 207","days":6,"done":4,"status":"rejected","base":[2,2,1,2],
     "study_program":"Germanistik","degree":"B.A.","university":"Universität Beispielstadt","semester":"2","expected_graduation":"09/2029","preferred_slot":"Dienstag, 17. November, 17:00 Uhr",
     "skills":["Texten","Recherche"],"languages":["Deutsch (Muttersprache)","Englisch (B2)"],
     "experiences":[{"start_date":"06/2025","end_date":"heute","title":"Aushilfe Service","organization":"Café Beispiel","details":["Service und Kasse"],"is_relevant":false}],
     "a":["Ich möchte neben dem Studium etwas anderes ausprobieren und neue Leute kennenlernen.","Ich kann gut recherchieren und schreiben. Das hilft bestimmt bei Präsentationen.","Ich hätte früher mit dem Nebenjob anfangen sollen, um mehr Erfahrung zu sammeln."]},
    {"first_name":"Tim","last_name":"Richter","phone":"030 23125 208","days":4,"done":3,"status":"not_rated","base":[3,3,3,2],
     "study_program":"Elektrotechnik","degree":"B.Eng.","university":"TU Nordstadt","semester":"5","expected_graduation":"09/2027","preferred_slot":"Donnerstag, 19. November, 11:00 Uhr",
     "skills":["MATLAB","Python","Messtechnik"],"languages":["Deutsch (Muttersprache)","Englisch (B2)"],
     "experiences":[{"start_date":"03/2025","end_date":"09/2025","title":"Praktikant Entwicklung","organization":"Formfein Spritzguss GmbH","details":["Messaufbau für Prüfreihen entwickelt"],"is_relevant":true}],
     "a":["Ich will verstehen, wie aus Technik ein Geschäft wird, und nicht nur an einzelnen Bauteilen arbeiten.","Systematische Fehlersuche aus der Elektrotechnik. Damit würde ich Ursachen statt Symptome angehen.","Ich habe eine Messreihe nicht dokumentiert und musste sie wiederholen. Heute schreibe ich alles sofort mit."]},
    {"first_name":"Sara","last_name":"Lang","phone":"030 23125 209","days":3,"done":2,"status":"not_rated","base":[4,3,2,3],
     "study_program":"Volkswirtschaftslehre","degree":"B.Sc.","university":"Universität Beispielstadt","semester":"4","expected_graduation":"03/2028","preferred_slot":"Mittwoch, 18. November, 09:30 Uhr",
     "skills":["Stata","Excel","Recherche"],"languages":["Deutsch (Muttersprache)","Französisch (C1)"],
     "experiences":[{"start_date":"10/2024","end_date":"heute","title":"Tutorin Mikroökonomie","organization":"Universität Beispielstadt","details":["Tutorium mit 30 Studierenden"],"is_relevant":true}],
     "a":["Ich möchte Modelle aus dem Studium an echten Fragen von Unternehmen testen.","Ökonometrie und Marktanalyse. Ich würde zuerst klären, welche Annahmen ein Plan eigentlich trifft.","Ich habe einen Vortrag zu kompliziert aufgebaut. Heute teste ich ihn vorher an jemandem ohne Fachwissen."]},
    {"first_name":"Lukas","last_name":"Brandt","phone":"030 23125 210","days":2,"done":1,"status":"not_rated","base":[3,3,2,2],
     "study_program":"Wirtschaftsrecht","degree":"LL.B.","university":"Hochschule Musterstadt","semester":"3","expected_graduation":"09/2028","preferred_slot":"Dienstag, 17. November, 10:00 Uhr",
     "skills":["Vertragsprüfung","Recherche"],"languages":["Deutsch (Muttersprache)","Englisch (B2)"],
     "experiences":[{"start_date":"02/2025","end_date":"04/2025","title":"Praktikant Rechtsabteilung","organization":"Kaufhaus Musterstadt","details":["Verträge für Lieferanten geprüft"],"is_relevant":true}],
     "a":["Ich will sehen, wie rechtliche Fragen in echten Unternehmensentscheidungen eine Rolle spielen.","Strukturiertes Arbeiten mit dem Gutachtenstil. Damit würde ich komplexe Fragen in Teilfragen zerlegen.","Ich habe mich in einem Team zu lange zurückgehalten. Heute sage ich früher, was ich denke."]},
    {"first_name":"Hannah","last_name":"Vogel","phone":"030 23125 211","days":1,"done":0,"status":"not_rated","base":[3,3,3,3],
     "study_program":"Biologie","degree":"B.Sc.","university":"Universität Beispielstadt","semester":"6","expected_graduation":"03/2027","preferred_slot":"Donnerstag, 19. November, 18:00 Uhr",
     "skills":["Laborarbeit","Statistik"],"languages":["Deutsch (Muttersprache)","Englisch (C1)"],
     "experiences":[{"start_date":"10/2024","end_date":"heute","title":"Hilfskraft Labor","organization":"Universität Beispielstadt","details":["Versuchsreihen betreut"],"is_relevant":true}],
     "a":["Ich möchte nach dem Studium nicht nur im Labor arbeiten und will herausfinden, was mir außerhalb liegt.","Sauberes wissenschaftliches Arbeiten. Ich würde Annahmen immer erst testen, bevor ich sie empfehle.","Ich habe zu lange an einer Versuchsidee festgehalten. Heute breche ich früher ab, wenn die Daten dagegen sprechen."]}
  ]$json$::jsonb)
  loop
    new_code := public.create_application(
      item
      || jsonb_build_object(
        'email', 'demo.' || lower(item ->> 'first_name') || '.' || lower(item ->> 'last_name') || '@example.com',
        'consent_privacy', true,
        'demographics', jsonb_build_object('wohnort', 'Musterstadt'),
        'answers', jsonb_build_array(
          jsonb_build_object('question_id', questions[1], 'answer', item -> 'a' ->> 0),
          jsonb_build_object('question_id', questions[2], 'answer', item -> 'a' ->> 1),
          jsonb_build_object('question_id', questions[3], 'answer', item -> 'a' ->> 2)
        )
      )
    ) ->> 'code';

    select id into app from public.applications where code = new_code;
    done := (item ->> 'done')::integer;
    base := array(select value::integer from jsonb_array_elements_text(item -> 'base'));

    -- Die automatische Zuweisung gilt nur für echte Screener, hier zählen die Demo-Bewertungen.
    delete from public.screening_assignments where application_id = app;

    for i in 1..done loop
      insert into public.screening_assignments (application_id, screener_id, completed_at, comment)
      values (app, demo_ids[i], now() - interval '1 hour' * i, comments[i]);

      for c in 1..4 loop
        insert into public.ratings (application_id, screener_id, criterion_id, score)
        values (app, demo_ids[i], criteria[c], greatest(1, least(4, base[c] + offsets[i][c])));
      end loop;
    end loop;

    update public.applications
    set status = (item ->> 'status')::public.application_status,
        interview_at = (item ->> 'interview_at')::timestamptz,
        created_at = now() - interval '1 day' * (item ->> 'days')::integer
    where id = app;
  end loop;

  -- Offene Plätze gehen an die echten Screener.
  perform private.assign_open_applications();
end
$seed$;
