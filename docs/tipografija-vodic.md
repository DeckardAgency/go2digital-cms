# Tipografija — Vodič za administratore

Sustav tipografije omogućuje ti da u cijelosti upravljaš izgledom teksta na web stranici — fontom, veličinom, debljinom, visinom retka — iz admin sučelja, bez potrebe za izmjenama u kodu.

Ovaj dokument objašnjava što je dostupno, gdje se što uređuje i kako riješiti najčešće zadatke.

---

## 1. Ključni pojmovi

### Preset (predložak)
Imenovani skup svih svojstava teksta: font, debljina, veličina za **desktop / tablet / mobilni**, visina retka i razmak slova.

Primjeri iz sustava: `hero-title`, `section-title`, `body`, `body-sm`, `eyebrow`, `card-title`, itd.

Kada promijeniš vrijednosti preseta, promjena se automatski primijeni **svugdje gdje se taj preset koristi**.

### Block map (mapa bloka)
Određuje **koji preset koristi koji element** unutar određene sekcije ili stranice.

Primjer: u bloku `panels` element `title` koristi preset `panel-title`, element `description` koristi preset `body`, itd. Ako želiš promijeniti tipografiju naslova panela na nešto drugo, promijeniš mapu — ne sam preset.

### Font
Obitelj fontova (npr. `PP Neue Montreal`) s jednom ili više težina (400 = regular, 700 = bold…). Fontovi su registrirani s putanjama do `.woff2` datoteka.

### Breakpointi
- **Desktop** = širina ekrana **≥ 1024px**
- **Tablet** = širina ekrana **≤ 1023px**
- **Mobile** = širina ekrana **≤ 767px**

Svaka vrijednost u presetu može biti različita za svaki breakpoint.

### CSS jedinice (što upisati u polja veličine)
- `rem` — relativna vrijednost (1rem = 16px). **Preporučeno**, npr. `2.5rem`
- `px` — fiksni pikseli, npr. `40px`
- `em` — relativno spram veličine samog elementa, često za `letter-spacing`
- `clamp(min, vw, max)` — **fluidna** vrijednost, skalira se s ekranom
   - Primjer: `clamp(1.5rem, 2.5vw, 2.5rem)` = između 1.5rem i 2.5rem, ovisno o širini

---

## 2. Glavne admin stranice

### 🔤 `/typography/presets` — Presete
**Što je ovdje:** popis svih postojećih presetova s pregledom veličina i fontovima.

**Što radiš:**
- **Uredi preset:** klik na olovku → dijalog s poljima za font, težinu, visinu retka, razmak slova i 3 polja za veličinu (desktop/tablet/mobilni). Uživo pregled u 3 okvira.
- **Novi preset:** klik "New Preset" → unesi slug (npr. `moj-naslov`), labelu, odaberi font, postavi vrijednosti, Save.
- **Obriši preset:** klik na kanticu → dijalog pokazuje **gdje se preset koristi** prije brisanja.
- Kolona **"Used"** — pokazuje brojač koliko mjesta referencira ovaj preset (preleti mišem preko broja za popis).

---

### 🧩 `/typography/block-maps` — Mape blokova
**Što je ovdje:** popis svih blokova na stranici (homepage sekcije + stranice blog/lab/esg/contact/team).

**Što radiš:**
- Svaki blok u tablici pokazuje **chipove** — element-ključeve koji imaju "prepisanu" vrijednost (razlikuju se od defaulta).
- Klik na olovku → dijalog s listom svih elemenata za taj blok + dropdown za odabir preseta po elementu.
- Prazno polje u elementu = koristi se default preset.

---

### 🔠 `/typography/fonts` — Fontovi
**Što je ovdje:** registrirane font-obitelji i njihove težine.

**Što radiš:**
- **Uredi font:** promijeni ime, font-stack (fallback fontovi).
- **Upload Weight:** učitaj `.woff2`, `.woff`, `.ttf` ili `.otf` datoteku → automatski se dodaje novi red s težinom (možeš odabrati 100–900).
- **Add Font:** novi font — unesi slug, ime, stack, dodaj težine.

---

### 🏠 `/homepage/*` — Editori pojedinačnih sekcija (singletoni)
Svaka singleton sekcija (Hero, Billboard, Custom Solutions, itd.) ima karticu **Typography** ispod **Content** kartice.

**Što radiš:**
- Svaki element sekcije (npr. Title, Kicker, Heading, Description) ima dropdown s presetom.
- Prazno = koristi se default preset (npr. za Hero Title default je `hero-title`).
- Odaberi drugi preset za taj specifičan element → Save na vrhu stranice.

---

### 📦 `/homepage/<collection>` — List stranice za collectione
Collection sekcije (Panels, Tracking, Featured Labs, Possibilities, Products, Possibilities) imaju **Typography** karticu odmah ispod zaglavlja.

**Što radiš:**
- Kartica prikazuje sve elemente bloka (title, description, itd.).
- Tipografija se dijeli **za SVE retke** u ovoj kolekciji (svi paneli koriste istu).
- Promjena + "Save typography" gumb.

**Posebni slučajevi:**
- **Why Cards** i **Analytics Tabs** — tipografija se nasljeđuje od parent sekcije. Info traka na ovim stranicama vodi na urednički prikaz parent sekcije.
- **Products** stranica ima **tri** Typography kartice (`products`, `interactive-display`, `interactive-description`) jer tri tipa bloka dijele isti CMS route.

---

### 📰 Blog, Lab, ESG CMS stranice
Na list stranicama blog postova, lab projekata i ESG elemenata nalaze se **ciljane Typography kartice** koje prikazuju samo elemente bitne za te retke:

| Stranica | Što se uređuje |
|----------|----------------|
| `/blog/posts` | Typography blog kartica (naslov, meta, kategorija) |
| `/blog/categories` | Typography filter-gumba |
| `/lab/projects` | Typography lab kartica |
| `/lab/categories` | Typography filter-gumba |
| `/esg/pillars` | Typography ESG pillara |
| `/esg/cards` | Typography ESG kartica |
| `/esg/badges` | Typography ESG badge-ova |

**Napomena:** sve ESG stranice dijele istu `esg` block mapu — promjena `pillarTitle` na `/esg/pillars` i dalje čuva sve ostale ESG element-vrijednosti netaknutima.

---

## 3. Kako napraviti…

### ✏️ …promijeniti veličinu naslova Hero sekcije?

**Opcija A — globalno (utječe na sve koji koriste `hero-title`):**
1. Idi na **`/typography/presets`**
2. Klik olovka na `hero-title`
3. Promijeni desktop na npr. `6rem`
4. Klik **Save**
5. Reload frontend — naslov je sada 96px na desktopu

**Opcija B — samo za Hero (zamijeniti kojim presetom se Title renderira):**
1. Idi na **`/homepage/hero`**
2. Scroll do **Typography** kartice
3. U dropdownu "Title" odaberi drugi preset (npr. `display-xl`)
4. Klik **Save** na vrhu stranice
5. Reload frontend — Hero Title sada koristi `display-xl` vrijednosti

---

### 🎨 …promijeniti tipografiju panela (collectiona)?
1. Idi na **`/homepage/panels`**
2. Typography kartica je odmah ispod zaglavlja
3. Promijeni npr. dropdown za "Panel Title" → odaberi `section-title`
4. Klik **"Save typography"** u kartici
5. Svi paneli sada imaju novu tipografiju za naslov

---

### ➕ …dodati novi preset?
1. Idi na **`/typography/presets`**
2. Klik **"New Preset"**
3. Popuni:
   - **Slug** — mala slova s crticama (npr. `moj-specijalni-naslov`)
   - **Label** — čitljivo ime (npr. "Moj specijalni naslov")
   - **Font** — odaberi iz dropdowna
   - **Weight** — 100, 200, … 900
   - **Line Height** — npr. `1.3`
   - **Letter Spacing** — opcionalno, npr. `-0.02em`
   - **Sizes** — 3 polja za desktop / tablet / mobilni (CSS vrijednosti)
4. Uživo pregled u tri okvira pokazuje kako izgleda
5. Klik **Save**

---

### 🔤 …dodati novi font?
1. Idi na **`/typography/fonts`**
2. Klik **"Add Font"**
3. Unesi:
   - **Slug** — npr. `inter`
   - **Display Name** — npr. "Inter"
   - **Font Stack** — uključi fallbackove, npr. `'Inter', -apple-system, BlinkMacSystemFont, sans-serif`
4. Klik **"Upload Weight"** za svaku težinu:
   - Odaberi `.woff2` (preporučeno), `.woff`, `.ttf` ili `.otf`
   - Nakon upload-a pojavljuje se novi red
   - Postavi ispravan broj težine (400 za regular, 700 za bold…)
5. Klik **Save**
6. Novi font sada je dostupan pri kreiranju ili uređivanju presetova

---

### 🗑️ …obrisati preset?
1. Idi na **`/typography/presets`**
2. Provjeri kolonu **"Used"**:
   - `—` (crtica) = preset se ne koristi nigdje, sigurno za brisanje
   - Broj = koliko mjesta ga referencira, preleti mišem za točan popis
3. Klik na kanticu (crveni gumb)
4. Dijalog pokazuje **točna mjesta gdje se preset koristi** i upozorava da će se ona vratiti na hardcoded default
5. Potvrda brisanja

---

### 🌐 …pronaći gdje se preset koristi?
Na `/typography/presets` — preleti mišem preko broja u koloni "Used". Tooltip pokazuje:
- **Sections** — singleton sekcije koje koriste ovaj preset
- **Collections** — collection blokovi koji koriste ovaj preset

---

## 4. Organizacija po stranicama

### Homepage (`/`)
- **Singleton sekcije** (ima ih 8, svaka ima svoj editor):
  - Hero, Billboard, Custom Solutions, Human Focused, Text Animation, Why Section, Analytics, Rentals Image
- **Collection blokovi** (ima ih 7, svaki ima block map):
  - `panels`, `tracking`, `featured-labs`, `possibilities`, `products`, `interactive-display`, `interactive-description`

### Ostale stranice (svaka ima block map)
| Stranica | Block map |
|----------|-----------|
| `/blog` (lista) | `blog-list` |
| `/blog/[slug]` (detalj) | `blog-detail` |
| `/lab` (lista) | `lab-list` |
| `/lab/[slug]` (detalj) | `lab-detail` |
| `/esg` | `esg` |
| `/tim` | `team` |
| `/kontakt` | `contact` |

Sve block mape možeš uređivati na **`/typography/block-maps`**.

---

## 5. Savjeti i preporuke

### ✅ Koristi imenovane presete
Ne kreiraj jedinstveni preset za svaki element. Konzistentnost kroz stranicu znači manje presetova i predvidljiviji dizajn.

### ✅ Promjena preseta > promjena mape
Ako želiš da se promjena odrazi globalno (na sve gdje se preset koristi), uredi **preset**. Ako želiš da se odrazi samo na jednom mjestu, promijeni **mapu** (dodijeli drugi preset).

### ✅ Koristi `clamp()` za fluidne veličine
`clamp(1.5rem, 3vw, 3rem)` — skalira se s ekranom, često eliminira potrebu za različitim vrijednostima po breakpointu.

### ⚠️ Prije brisanja preseta
Pogledaj "Used" kolonu. Ako je u upotrebi, razmisli treba li zaista brisati ili preimenovati (preimenuj u CMS = obriši + kreiraj novi s istim vrijednostima + ručno dodijeli na svim mjestima koja su ga koristila).

### ⚠️ Letter spacing u `em` vs `rem`
- `em` se skalira s veličinom fonta (bolje za različite breakpointe)
- `rem` je fiksna veličina neovisno o fontu
- Uobičajeno: naslovi koriste `em`, fiksni UI elementi koriste `rem`

---

## 6. Rješavanje problema

### Promjena se ne vidi na frontendu
1. Je li kliknuto **Save**?
2. **Hard reload** frontend stranice (`Ctrl+Shift+R` / `Cmd+Shift+R`) — browser keš može držati stare CSS varijable
3. Otvori DevTools (`F12`) → Elements → pronađi element → provjeri jesu li `.typo-*` klase prisutne
4. Provjeri Network tab — je li `/api/settings?group=typography` odgovorio s novim vrijednostima

### Element nema preset — koristi default
To je **normalno ponašanje**. Ako u mapi nema definicije za neki element, frontend koristi hardcoded default koji je postavljen u komponenti. To je sigurnosna mreža.

### Font se ne učita (vidljiv fallback)
1. Provjeri `/typography/fonts` — postoji li font?
2. Otvori DevTools → Network tab → filtriraj po "Font" — je li datoteka uspješno povučena (status 200)?
3. Ako je 404 — provjeri `src` putanju u definiciji težine. Upload je trebao automatski postaviti valjanu putanju; ako je ručno uređena, možda je pogrešna.

### Novo uploadirani font ne radi
1. Provjeri `src` u definiciji težine — treba biti oblika `/storage/media/...`
2. Provjeri da je definirana ispravna **težina** (400, 700, itd.) — inače se neće match-ati s presetom koji traži specifičnu težinu
3. Provjeri **format** — `woff2`, `woff`, `truetype` (za `.ttf`), `opentype` (za `.otf`)

### Nakon uređivanja preseta, frontend pokazuje staru vrijednost
Frontend keš može biti kriv:
1. Hard reload (`Ctrl+Shift+R`)
2. Očisti browser cache
3. Ako koristiš inkognito-prozor i dalje ne radi — provjeri je li API stvarno vratio nove vrijednosti u `/api/settings?group=typography` (DevTools Network)

---

## 7. Glosar

| Pojam | Značenje |
|-------|----------|
| **Preset** | Imenovani skup tipografskih svojstava |
| **Block map** | Mapa koja definira koji preset se koristi za koji element unutar sekcije |
| **Singleton** | Sekcija koja ima točno jedan zapis (npr. Hero) |
| **Collection** | Sekcija s više redaka (npr. Panels, Tracking Features) |
| **Slug** | URL-friendly identifikator, mala slova i crtice (npr. `hero-title`) |
| **Font stack** | Lista fontova s fallbackovima razdvojenima zarezom |
| **Weight** | Težina (debljina) fonta, obično 100–900 |
| **Breakpoint** | Širina ekrana na kojoj se mijenja stil |
| **clamp()** | CSS funkcija za fluidnu veličinu između minimuma i maksimuma |
