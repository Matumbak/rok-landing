# Phoenix NEST — Visual Design System (v3, from scratch)

Дизайн строится **от двух hero-картинок**, а не от прошлых итераций.
Никаких остатков от phoenix-on-fire, никаких компромиссов с теми
коммитами — это новый старт.

---

## 1. Reference research

| Источник | Что взято |
|---|---|
| **Throne and Liberty** ([playthroneandliberty.com](https://www.playthroneandliberty.com/en-us)) | Dark premium foundation + gold/bronze accent; full-bleed hero с overlay-текстом; primary CTA с platform-icons; двух-уровневая ribbon-навигация. |
| **Cherry blossom design systems** ([encycolorpedia / SchemeColor / icolorpalette](https://icolorpalette.com/palette-by-themes/cherry-blossom/)) | Sakura палитра — soft pinks + cool neutrals + deep maroon accent; rose нужно использовать как «акцент-приправу», не как primary brand color; для CTA сохранять gold/bronze, иначе бренд становится feminine. |
| **Behance Medieval RPG UI** ([behance.net/search/projects/medieval rpg ui](https://www.behance.net/search/projects/medieval%20rpg%20ui)) | Heraldic ornaments как UI primitives: corner marks, banner shapes, wreath emblems, ◆-разделители. |
| **Aceternity UI / Justinmind hero collections** ([justinmind.com/blog/inspiring-hero-image-websites](https://www.justinmind.com/blog/inspiring-hero-image-websites/)) | Half-gradient overlay вместо solid panel — поддерживает читаемость, не закрывает арт; gradient text в headlines; primary buttons с dark gradient + border (не плоская заливка). |
| **Sakura color guides** ([canva.com/colors/color-palettes/cherry-blossoms](https://www.canva.com/colors/color-palettes/cherry-blossoms/)) | Конкретные HEX-ы для sakura-палитры; пары pink + maroon-deep для readability. |

**Главный инсайт исследования.** Сайт должен ощущаться как **продолжение
живописи**, а не как «UI-chrome поверх картинки». Все три аналога, что
работают (T&L, Genshin, FFXIV), используют героическую картинку как
**сцену с уже встроенным брендом** — ТЕКСТ ВНУТРИ картинки несёт
большую часть нагрузки, а UI работает в **отрицательных пространствах**
изображения.

---

## 2. Design philosophy

Пять принципов, на которых стоит весь визуал. Все остальные решения —
производные.

### 2.1. Artwork — это design system

Картинка уже содержит:
- логотип («KINGDOM 3615 / PHOENIX NEST»)
- эмблему (венок + щит + крест)
- цветовую палитру (gold + rose + forest + cream)
- декоративный язык (банеры, корона, балюстрада, сакура)
- ритм композиции (центральный фокус + симметричное окружение)

Сайт **должен это продолжать**, а не дублировать. Никаких больших h1
«PHOENIX NEST» поверх — он уже есть на картинке. Никаких больших щитов
сбоку — они уже есть на картинке.

### 2.2. UI вплетается в негативные пространства

| Зона картинки | Назначение |
|---|---|
| Верхние углы (ветви сакуры) | top-fade под навигацию |
| Левая полоса (green banner с львом) | language switcher как hanging tag |
| Правая полоса (green banner с мечом) | discord button как hanging tag |
| Нижний край (балюстрада) | «полка» под CTA — кнопки как inscribed plaques |
| Центр (под эмблемой) | пустая зона для слогана + eyebrow |

CTA не «парят» — они **лежат на каменной балюстраде**. Lang-switcher
не «закреплён в углу» — он **висит на флагштоке** как идентификационная
бирка.

### 2.3. Heraldic vs Sakura duality

Два визуальных регистра, переключаются по контексту:

| | **Heraldic** | **Sakura** |
|---|---|---|
| Цвета | gold-on-dark | rose-on-cream |
| Шрифт | Cinzel (Roman caps, chiseled) | Cormorant Garamond italic |
| Геометрия | sharp serif, geometric heraldry | organic flourishes, гибкие линии |
| Где | hero CTA, status, scoring, admin panel, требования | кол-во участников, achievement-highlights, мотто, тосты |
| Настроение | rigour, war, hierarchy | community, ceremony, pride |

90% сайта — Heraldic. Sakura появляется точечно (1-2 элемента на
странице) для контраста и эмоционального тёплого момента.

### 2.4. Gold = brand, Rose = highlight, Forest = structural

Чёткие правила:

- **Gold** — primary CTA, headlines, главные акценты, identity. Главный
  цвет. Если в комнате есть только один акцентный цвет — это золото.
- **Rose** — НИКОГДА не primary CTA. Используется как highlight
  (числа, gem-emphasis, hover-glow на дополнительных элементах). На
  стороне «сейчас обрати внимание сюда».
- **Forest green** — structural (панели dark mode, secondary buttons,
  "approved" status, мини-щиты nav). Это «третий цвет», который
  редко в фокусе но часто в фоне.
- **Cream/parchment** — restful surface для длинных текстов (где
  читаемость важнее настроения). Только rare cases: миграционный бриф,
  ToS, legal.
- **Bronze-dark** — base background.

### 2.5. Кнопки — это ювелирные изделия, не Mario-блоки

Текущая `.btn-royal` (плоская градиентная заливка) и есть «цыганская».
Правильная heraldic кнопка ощущается как полированный металл:

- **Material:** dark bronze surface (НЕ flat gold заливка)
- **Inscription:** gold gradient text (engraved)
- **Edge:** thin gold rim (1px) + tiny corner marks (4 nailheads)
- **Hover:** rim brighter (catches sunlight), сама поверхность немного
  светлеет, никаких scale transforms, никаких radial glows
- **Active:** rim тускнеет (нажат, металл "вдавлен")

Цвет внутри кнопки ≈ цвет фона страницы. Это работает потому, что
текст-золото на тёмном металле читается как «гравировка по золоту» —
именно так выглядят inscribed plaques на королевских балюстрадах.

---

## 3. Color tokens

### 3.1. Bronze / surface (base)

```css
--bronze-950:  #0c0805;  /* deepest shadow (footer bottom) */
--bronze-900:  #14100a;  /* background base */
--bronze-800:  #1d160e;  /* card surface */
--bronze-700:  #2a1f14;  /* hover surface */
--bronze-600:  #3a2c1d;  /* divider, subtle border */
--bronze-500:  #5a4530;  /* mid-tone (avoid text use) */
```

### 3.2. Gold

```css
--gold-50:    #f8eed4;  /* highlight reflection */
--gold-100:   #f0dcaa;  /* engraved top stop */
--gold-200:   #e6c97c;  /* champagne */
--gold-300:   #d4b265;  /* light gold */
--gold-400:   #cca84e;  /* PRIMARY accent (--accent) */
--gold-500:   #b8902c;  /* engraved mid stop */
--gold-600:   #9a7820;  /* hover-down */
--gold-700:   #7a5418;  /* engraved deep stop */
--gold-800:   #5e3f12;  /* shadow */
--gold-900:   #3a280c;  /* deepest gold */
```

### 3.3. Rose (sakura)

```css
--rose-100:   #f5d5c5;  /* petal highlight */
--rose-200:   #e8b8c0;  /* soft sakura */
--rose-300:   #d89ca0;  /* mid petal */
--rose-400:   #c47a8a;  /* primary rose */
--rose-500:   #a86072;  /* gem-pink */
--rose-600:   #8a4858;  /* gem deep */
--rose-700:   #5e3040;  /* shadow */
```

### 3.4. Forest (banner green)

```css
--forest-300:  #5a7a5a;  /* light leaf */
--forest-400:  #3d5a3d;  /* mid banner */
--forest-500:  #2d4a2d;  /* primary forest */
--forest-600:  #1f3520;  /* deep banner */
--forest-700:  #18301a;  /* shadow */
```

### 3.5. Cream (parchment)

```css
--cream-50:   #fbf3e1;  /* lightest parchment */
--cream-100:  #f3e5ab;  /* primary cream — body text on dark */
--cream-200:  #e8d49a;  /* slightly weathered */
--cream-300:  #c4a268;  /* muted cream */
--cream-400:  #a08a5e;  /* dim muted */
```

### 3.6. Semantic mapping (Tailwind theme)

```css
@theme inline {
  --color-background:       var(--bronze-900);
  --color-background-deep:  var(--bronze-950);
  --color-card:             var(--bronze-800);
  --color-hover:            var(--bronze-700);
  --color-border-subtle:    var(--bronze-600);
  --color-border-gold:      var(--gold-700);
  --color-border-gold-hi:   var(--gold-400);

  --color-foreground:       var(--cream-100);
  --color-muted:            var(--cream-400);
  --color-bright:           var(--cream-50);

  --color-accent:           var(--gold-400);    /* primary */
  --color-accent-bright:    var(--gold-200);    /* hover */
  --color-accent-deep:      var(--gold-700);    /* shadow */

  --color-rose:             var(--rose-400);
  --color-rose-bright:      var(--rose-200);
  --color-rose-deep:        var(--rose-600);

  --color-forest:           var(--forest-500);
  --color-forest-deep:      var(--forest-700);

  --color-danger:           var(--rose-500);
  --color-success:          var(--forest-300);
}
```

---

## 4. Typography

### 4.1. Семейства

| Роль | Шрифт | Subsets | Использование |
|---|---|---|---|
| **Display** | Cinzel (400/500/600/700/800) | Latin only | H1, H2, H3, eyebrow, brand, page title, CTA text |
| **Display-RU** | Cormorant SC (400/500/600/700) | Latin + Cyrillic | Cyrillic fallback per-glyph |
| **Sub-display** | Cormorant Garamond (400 italic, 500) | Latin + Cyrillic | Под-заголовки, мотто, цитаты, decorative pulls |
| **Body** | Inter Tight (300/400/500/600) | Latin + Cyrillic | Параграфы, описания, формы |
| **Mono** | JetBrains Mono (400/500) | Latin | Governor ID, scores, hashes, technical |

Inter Tight чуть стройнее Inter Variable — лучше с Cinzel сидит.
Cormorant Garamond italic для мотто типа *"Honor older than the kingdom"*
— но используется максимум 1 раз на странице, иначе разъезжается ритм.

### 4.2. Размерная шкала (RU-aware)

| Tailwind | EN px | RU px |
|---|---|---|
| `text-display-1` | 88 | 72 |
| `text-display-2` | 64 | 54 |
| `text-display-3` | 48 | 42 |
| `text-h1` | 36 | 32 |
| `text-h2` | 28 | 26 |
| `text-h3` | 22 | 20 |
| `text-body-lg` | 18 | 17 |
| `text-body` | 16 | 16 |
| `text-body-sm` | 14 | 14 |
| `text-eyebrow` | 11 | 11 |
| `text-meta` | 10 | 10 |

Tracking: `0.04em` для Cinzel display, `0.02em` для Cormorant SC
кириллицы, `0` для body, `0.4em` для eyebrow.

---

## 5. Spacing & grid

Base unit: **8px**. Все промежутки кратны 8. Внутри тонких компонентов
(тэги, чипы) можно 4px.

| Token | Value |
|---|---|
| `space-1` | 8px |
| `space-2` | 16px |
| `space-3` | 24px |
| `space-4` | 32px |
| `space-6` | 48px |
| `space-8` | 64px |
| `space-12` | 96px |
| `space-16` | 128px |

Container: `max-w-7xl` (1280px). Side gutter: 24px mobile, 48px desktop.

---

## 6. Ornamental primitives (SVG components)

Эти SVG-компоненты — building blocks декора. Все используют
`currentColor` так что цвет управляется через Tailwind text-class.

### 6.1. `<CornerMark />`
Маленький уголок из золотой линии для frame'ов. 4 варианта (tl, tr,
bl, br). Используется в наборе по 4 в углах панелей.

```
┌
│
```

### 6.2. `<DiamondDivider />`
Горизонтальная gold-rule с rose-gem ромбом в центре. Прямая отсылка к
аналогичному разделителю на hero-картинке (под «KINGDOM 3615»).

```
————— ◆ —————
```

### 6.3. `<BannerTag />`
Вертикальная мини-плашка по принципу зелёных знамён с картинки. Висит
от верхнего края. Внутрь можно положить language toggle, status
indicator, score chip.

```
┌──┐
│Φ │
│  │
│v │
```

### 6.4. `<WreathEmblem />`
Венок + щит с крестом в центре. Используется как brand-mark на детальных
страницах (профиль applicant, верхушка миграционного брифа). Эхо
центрального элемента hero-картинки.

### 6.5. `<RibbonHeader />`
Горизонтальная развёрнутая лента с заголовком внутри. Для секций где
нужен сильный визуальный якорь.

```
◤━━━━━━━━━━━━━━━━━━━━━━━━━━◥
  RECRUITMENT
◣━━━━━━━━━━━━━━━━━━━━━━━━━━◢
```

---

## 7. Component library

### 7.1. `<Button variant="heraldic" />` — PRIMARY CTA

```
┌─────────────────────────┐
│ ◆  APPLY FOR MIGRATION ◆│   ← gold text engraved
└─────────────────────────┘
```

- bg: `var(--bronze-800)` (dark metal)
- border: `1px solid var(--gold-400)`
- 4 corner marks (CornerMark) at 1.5px inset
- text: `.engraved` gold gradient
- inner shadow `inset 0 1px 0 rgba(240,220,170,0.15)` (top highlight, metal sheen)
- hover: border `--gold-200`, text becomes slightly brighter, no scale
- active: border `--gold-700`, slight inner shadow stronger

### 7.2. `<Button variant="outline" />` — SECONDARY

- bg: transparent
- border: `1px solid var(--gold-700)` (dim gold)
- text: `var(--cream-200)`
- hover: border `--gold-400`, text `--cream-50`
- no inner shadow

### 7.3. `<Button variant="ghost" />`

- bg: transparent, no border
- text: `var(--muted)`
- hover: text `--foreground`, subtle bg `--bronze-700/30`

### 7.4. `<Panel variant="ornate" />`
Для важных секций (Hero CTA region, score breakdown, top-of-page детали).

- bg: `var(--bronze-800)`
- border: `1px solid var(--gold-600)`
- inner hairline: `absolute inset-2 border border-gold-700/30`
- 4 corner marks at outer corners
- shadow: `0 8px 32px rgba(0,0,0,0.5)`
- padding: `space-6` (48px)

### 7.5. `<Panel variant="simple" />`
Для обычных карточек.

- bg: `var(--bronze-800)`
- border-top: `1px solid var(--gold-700)`
- border-bottom: `1px solid var(--gold-700)`
- left/right: no border
- padding: `space-4` (32px)

### 7.6. `<Panel variant="parchment" />`
Для длинных текстов (миграционный бриф, legal).

- bg: `var(--cream-50)`
- color: `var(--bronze-900)`
- border: `1px solid var(--gold-600)`
- texture: subtle paper noise via SVG filter
- shadow: `0 4px 12px rgba(0,0,0,0.2)`
- padding: `space-8`

### 7.7. Form field

- bg: `var(--bronze-900)` (deeper than card → "well")
- border: `1px solid var(--bronze-600)`
- focus border: `1px solid var(--gold-400)`
- focus inner shadow: `inset 0 0 0 1px var(--gold-400/30)` (gold ring)
- placeholder: `var(--cream-400)`
- text: `var(--cream-100)`
- height: `40px` (compact), `48px` (default)

### 7.8. Eyebrow

```
─── ◆ KINGDOM 3615
```

- ◆: rose gem
- text: `text-eyebrow` Cinzel, `letter-spacing: 0.4em`
- "KINGDOM" — `text-accent` gold
- "3615" — `.engraved-rose`
- rule: gold→rose gradient

### 7.9. Score chip
Mini-shield style, color-banded.

```
     ╱─╲
    ╱85 ╲   ← shield outline gold
    ╲___╱
```

- Variants by score: gold (≥80), forest (60-79), bronze (40-59), rose
  (20-39), shadow (<20)
- Tiny shield SVG with score number inside
- Border: 1px outer color

### 7.10. Status badge

- Inline SVG mini-icon + text label
- `pending` → ⌛ amber-bronze tint
- `approved` → ✓ forest tint
- `rejected` → ✕ rose-deep tint
- `archived` → ◌ muted

---

## 8. Page layouts (полная переразработка)

### 8.1. Home / `/`

```
┌────────────────────────────────────────────────────────┐
│ [BrandMark] Phoenix · NEST    HOME  DKP  MIG    EN│RU D│  ← fixed nav, top-fade backdrop
├────────────────────────────────────────────────────────┤
│                                                        │
│            [ FULL-BLEED HERO ARTWORK ]                 │
│            artwork's own KINGDOM 3615                  │
│              PHOENIX NEST is centerpiece                │
│                                                        │
│                                                        │
│                    ────  ◆ KINGDOM 3615                │
│                   Born from ashes...                   │ ← slogan strip at bottom 
│              [ APPLY FOR MIGRATION ] [ VIEW STANDINGS ]│   no panel, strong scrim
│                                                        │
└────────────────────────────────────────────────────────┘
↓ scroll → 

┌── KINGDOM PULSE ───────────────────────────── ◆ ──────┐
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                      │
│  │ 95  │ │ 3.2B│ │ 23  │ │  7  │                      │
│  │ Mbr │ │ Pwr │ │ Gft │ │ KvK │                      │
│  └─────┘ └─────┘ └─────┘ └─────┘                      │
└────────────────────────────────────────────────────────┘

┌── THE KINGDOM ─────────────────────────────── ◆ ──────┐
│   2-column: Goal • Whales return • SoC 7 timeline     │
└────────────────────────────────────────────────────────┘
```

**Hero**:
- Full-bleed bg artwork (existing)
- Top-fade backdrop под navigation
- Дно — heavy scrim, на нём eyebrow + slogan + CTAs БЕЗ панели
  (текст несёт сильный text-shadow)
- Eyebrow + slogan + CTAs выровнены центрально (артборд центрирован)

**Под фолд** — секции с simple panels, ornament dividers между ними,
NO hard backgrounds — body bg gradient несёт всю ситуацию.

### 8.2. Migration / `/migration`

```
[Hero strip — small version of artwork as banner, fixed-height 200px]
[h1 "Apply for Migration" centered, engraved gold, with DiamondDivider]
[Subtitle "Phoenix NEST набирает бойцов..." italic Cormorant centered]

[KingdomInfo — stats + requirements, two parchment panels side-by-side]

[──────────── ◆ ────────────]  ← divider
[h2 "Apply for migration"]

[Multi-step form sections each as <Panel variant="ornate">]
[Each section header is a small RibbonHeader]
[Form fields use the new "well" style]

[──────────── ◆ ────────────]

[CTA submit — big heraldic button centered]
[Discord hint below]
```

### 8.3. DKP / `/dkp`

```
[Hero banner same as migration]
[h1 "DKP Standings" with DiamondDivider]

[Filters strip — search + alliance filter, no panel, just gold rule underneath]

[Standings table — uses Panel variant="simple"]
[Top-3 rows have heraldic accent: gold rim around row, rose for #1]
[Score chips heraldic shield style]
[Pagination — bottom centered, two-tone gold]

[Empty state — large WreathEmblem + parchment-style copy]
```

### 8.4. Admin shell

Внутренний UI остаётся в той же палитре, но регистр всегда HERALDIC
(никаких sakura accents — это рабочий инструмент). Заголовки кратче.
Sidebar nav вместо горизонтальной — иконки в left rail.

---

## 9. Motion

| Pattern | Duration | Easing | When |
|---|---|---|---|
| Page mount | 600ms | `cubic-bezier(.16,1,.3,1)` (out-expo) | Hero text reveals on load |
| Hover (button rim) | 250ms | `ease-out` | Border color shift |
| Hover (lift) | NONE | — | Запрет на translate/scale у heraldic элементов — металл не "прыгает" |
| Accordion expand | 350ms | `ease-in-out` | Score breakdown popover |
| Toast slide-in | 300ms | `ease-out` | Bottom-right notifications |
| Lang toggle | 150ms | `ease-out` | Instant feel |

**Motion philosophy:** металл не двигается. UI ощущается **выгравированным**.
Анимации только там, где нужен сигнал «что-то произошло» (hover-color
shift, form-field focus ring, expansion). Никаких parallax, никаких
gentle floats, никаких scaling buttons.

---

## 10. Accessibility

| Контраст | Минимум | Реально |
|---|---|---|
| `cream-100` on `bronze-900` | 4.5 (AA) | ~11.2 ✓ |
| `gold-400` on `bronze-900` | 4.5 | ~5.8 ✓ |
| `rose-400` on `bronze-900` | 4.5 | ~4.6 ✓ (close, watch on rose-tinted bg) |
| `cream-400` (muted) on `bronze-900` | 3.0 (AA Large) | ~5.0 ✓ |

Focus states:
- All interactive elements: `outline: 2px solid var(--gold-400); outline-offset: 2px;`
- Form fields use inner gold ring instead (already specced)
- Lang toggle, nav links: visible focus rectangle

Motion-respect:
- All motion wrapped in `@media (prefers-reduced-motion: no-preference)`

---

## 11. Implementation phases

**Phase 1 — Foundation (palette + typography)**
- Rewrite `globals.css` token block per §3
- Update `layout.tsx` font imports (add Cormorant Garamond, Inter Tight)
- Update `--font-display` and `--font-sans` cascades
- Test on /, /dkp, /migration for layout drift

**Phase 2 — Components**
- Build `<CornerMark />`, `<DiamondDivider />`, `<BannerTag />`,
  `<WreathEmblem />`, `<RibbonHeader />` SVG primitives in
  `components/ornaments/`
- Refactor `<Button />` variants per §7
- Refactor `<Panel />` variants per §7
- Refactor form field per §7

**Phase 3 — Hero rebuild**
- Apply new typography + new ornaments to Hero
- Drop the box panel — keep CTA strip lying on the artwork's balustrade
- Add `<BannerTag />` hanging banner-tags for lang toggle + Discord

**Phase 4 — Page applications**
- Migration page restructure per §8.2
- DKP page restructure per §8.3
- Admin shell per §8.4

**Phase 5 — Polish**
- Motion respect + focus states sweep
- Mobile spec sweep — heavy testing at 360px
- Accessibility contrast audit

---

## 12. Что НЕ переходит из v1/v2

- `.btn-royal` плоская градиентная заливка — выпиливается
- Sakura accent как primary CTA hover (мы делали rose-glow на кнопках) — выпиливается
- Тёмная backdrop-blur панель в Hero — выпиливается
- Большой visible h1 «PHOENIX NEST» поверх артворка — выпиливается (артворк уже содержит)
- Crimson radial bloom в body bg — выпиливается
- Старые SVG-щиты `ShieldMark` — уже выпилены, остаётся `BrandMark` (phoenix)
- `engraved` градиент текущих стопов — переписывается под gold-400/700 family

---

## Sources

- [Throne and Liberty — official site](https://www.playthroneandliberty.com/en-us)
- [iColorPalette — Cherry Blossom themes](https://icolorpalette.com/palette-by-themes/cherry-blossom/)
- [Behance — Medieval RPG UI](https://www.behance.net/search/projects/medieval%20rpg%20ui)
- [Justinmind — hero image inspiration](https://www.justinmind.com/blog/inspiring-hero-image-websites/)
- [Canva — Cherry Blossoms palette guide](https://www.canva.com/colors/color-palettes/cherry-blossoms/)
- [Armoria — heraldic generator](https://azgaar.github.io/Armoria/)
- [Vecteezy — ornate corners library](https://www.vecteezy.com/free-vector/ornate-corner)
