# H5P.CapitalLetters

*[English](#english) · [Eesti](#eesti)*

---

## English

**Capital Letters** is an H5P content type where learners click the letters that should be uppercase. The text is shown entirely in lowercase; the learner toggles individual letters and then checks the answer.

### How it works

- The author enters the text in its **correct** form. Every letter that is uppercase in the author's text is treated as a correct answer.
- The player renders the same text fully in lowercase. Each letter is a button that toggles between lowercase and uppercase on click.
- On **Check**, the answer is scored, feedback (correct / wrong / missing counts) is shown, the response area is locked, and the correct text can be revealed.
- **Retry** resets the task (when enabled).

### Scoring

- Score = number of correctly selected letters.
- If **Wrong clicks reduce the score** is enabled, incorrectly selected lowercase letters are subtracted. The score never goes below zero.
- Maximum score = the number of uppercase letters in the correct text.
- Results are reported over xAPI (`fill-in` interaction).

### Editor fields (semantics)

- `taskDescription` — instruction shown above the task (HTML).
- `correctText` — the text in correct form; uppercase letters mark the correct answers.
- `behaviour.showRetry` — show a retry button after checking.
- `behaviour.penalizeWrongAnswers` — subtract wrong clicks from the score.
- `l10n` — button, feedback and accessibility label overrides.

### Details

- Machine name: `H5P.CapitalLetters`
- Version: 1.3.9
- Core API: 1.24
- Embed type: iframe
- Dependencies: H5P core only (`H5P.jQuery`, `H5P.EventDispatcher`)
- Interface languages: de, en, es, et, ru
- License: MIT

### Installation

Install as an H5P library in your H5P host (e.g. the Moodle H5P/hvp plugin, Lumi, or an H5P-enabled platform), or include it as a library inside an `.h5p` package.

---

## Eesti

**Suur algustäht** (Capital Letters) on H5P sisutüüp, kus õppija klikib tähtedel, mis peaksid olema kirjutatud suurtähega. Tekst kuvatakse täielikult väiketähtedena; õppija lülitab üksikuid tähti ja seejärel kontrollib vastust.

### Kuidas töötab

- Autor sisestab teksti **õiges** vormis. Iga täht, mis on autori tekstis suurtäht, loetakse õigeks vastuseks.
- Mängija kuvab sama teksti täielikult väiketähtedena. Iga täht on nupp, mis klikkides lülitub väike- ja suurtähe vahel.
- **Kontrolli** vajutamisel hinnatakse vastus, näidatakse tagasiside (õigeid / valesid / puuduvaid), vastusala lukustatakse ja õige teksti saab kuvada.
- **Proovi uuesti** lähtestab ülesande (kui lubatud).

### Hindamine

- Tulemus = õigesti valitud tähtede arv.
- Kui **Valed klikid vähendavad tulemust** on sees, lahutatakse valesti valitud väiketähed. Tulemus ei lange kunagi alla nulli.
- Maksimaalne tulemus = suurtähtede arv õiges tekstis.
- Tulemused edastatakse xAPI kaudu (`fill-in` interaktsioon).

### Redaktori väljad (semantics)

- `taskDescription` — ülesande kohal kuvatav juhend (HTML).
- `correctText` — tekst õiges vormis; suurtähed märgivad õigeid vastuseid.
- `behaviour.showRetry` — kuva pärast kontrollimist "proovi uuesti" nupp.
- `behaviour.penalizeWrongAnswers` — lahuta valed klikid tulemusest.
- `l10n` — nuppude, tagasiside ja ligipääsetavuse siltide alistused.

### Üksikasjad

- Masina nimi: `H5P.CapitalLetters`
- Versioon: 1.3.9
- Core API: 1.24
- Embed-tüüp: iframe
- Sõltuvused: ainult H5P core (`H5P.jQuery`, `H5P.EventDispatcher`)
- Kasutajaliidese keeled: de, en, es, et, ru
- Litsents: MIT

### Paigaldamine

Paigalda H5P teegina oma H5P hostis (nt Moodle'i H5P/hvp plugin, Lumi või mõni muu H5P-t toetav platvorm) või kaasa teegina `.h5p` paketti.
