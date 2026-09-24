# Publică sursa CRM Forever în GitHub

1. Descarcă arhiva ZIP și dezarhiveaz-o.
2. Deschide terminalul în directorul `crm-forever`.
3. Rulează `git init -b main`, `git add .` și `git commit -m "Initial CRM Forever source"`.
4. Cu GitHub CLI instalat, rulează `gh repo create crm-forever --private --source . --remote origin --push`. Alternativ, creează pe GitHub un repository privat gol și folosește `git remote add origin https://github.com/UTILIZATOR/crm-forever.git` urmat de `git push -u origin main`.

Detaliile pentru pornirea locală, migrarea bazei și limitele GitHub Pages sunt în `README.md`. Arhiva nu include baza de date de producție sau datele contactelor.
