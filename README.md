# CRM Forever

Codul sursă al versiunii publicate a aplicației CRM Forever. Interfața este în română și este optimizată pentru mobil. Contactele, cele două direcții (Business și Produse), acțiunile și istoricul sunt salvate într-o bază Cloudflare D1. Regulile curente se bazează pe specificația v1.1 și modelul v10.51 din `docs/`.

## Ce conține repository-ul

- `app/` — interfața și API-ul pentru contacte;
- `lib/engine.ts` — validarea rezultatelor, tranzițiile, termenele și pauzele;
- `db/schema.ts` și `drizzle/` — schema și migrarea bazei de date;
- `tests/engine.test.mjs` — scenarii pentru fluxurile principale;
- `docs/` — documentele pe baza cărora a fost construită această versiune.

Arhiva conține codul. Datele efective ale contactelor din aplicația privată nu sunt în repository. Următoarele documente de specificație, dacă există, necesită implementare și verificare separate.

## Rulare locală

Necesită Node.js 22.13+ și pnpm 11.25.0. În Windows poți folosi PowerShell; Git Bash nu este necesar pentru comenzile de mai jos.

```sh
corepack enable
corepack pnpm install --frozen-lockfile
corepack pnpm typecheck
corepack pnpm test
corepack pnpm build
```

Prima pornire a bazei locale (rulează migrarea o singură dată):

```sh
corepack pnpm exec wrangler d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_sloppy_dragon_lord.sql
corepack pnpm start
```

Deschide adresa locală afișată de Wrangler. Baza locală se află în `.wrangler/state` și este ignorată de Git. Reexecutarea migrării inițiale asupra unei baze deja create poate eșua deoarece tabela există; nu este necesară la repornire. Pentru schimbări de schemă adaugă migrații noi, păstrând migrațiile deja aplicate.

## Încărcare în GitHub

Repository-ul privat păstrează codul accesibil doar persoanelor cărora le dai acces. Dezarhivează acest pachet și rulează comenzile în directorul `crm-forever`:

```sh
git init -b main
git add .
git commit -m "Initial CRM Forever source"
gh repo create crm-forever --private --source . --remote origin --push
```

Ultima comandă cere autentificarea în GitHub CLI dacă nu ești deja conectat. Dacă folosești interfața GitHub, creează un repository privat gol, fără README sau `.gitignore` generate de GitHub, apoi execută:

```sh
git remote add origin https://github.com/UTILIZATOR/crm-forever.git
git push -u origin main
```

Înlocuiește `UTILIZATOR` cu numele contului tău. Nu adăuga fișiere `.env`, baza locală, directoarele `node_modules` sau `dist`.

## Publicarea aplicației

GitHub stochează codul; publicarea repository-ului nu pornește automat aplicația. Aceasta are un API și o bază D1, deci GitHub Pages, care servește site-uri statice, nu poate rula CRM-ul complet. Pentru o instanță separată trebuie configurată o gazdă compatibilă cu Cloudflare Workers și o bază D1, migrația și controlul accesului. Site-ul privat existent rămâne independent de repository-ul GitHub; schimbările din GitHub nu îl actualizează automat.

Această copie are `.openai/hosting.json` fără identificatorul Site-ului existent. Nu include credențiale, contacte sau baza de date de producție. Înainte de a face public repository-ul sau o instalare proprie, configurează explicit controlul accesului pentru datele de contact.

## Verificare

`corepack pnpm typecheck` verifică tipurile; `corepack pnpm test` parcurge scenariile critice pentru Produse, Business, pauze și termene. Codul include componente ale starterului sub licențele indicate în fișierele `*.LICENSE*`. Nu a fost atribuită o licență proiectului CRM Forever.
