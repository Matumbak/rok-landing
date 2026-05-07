/**
 * Static translation dictionary for the public landing.
 *
 * Locales: "en" (default) and "ru" (auto-selected when the browser's
 * `navigator.language` starts with "ru"). Adding a new locale = drop
 * a sibling object with the same keys.
 *
 * Missing keys fall back through `en` automatically (see `lookup` in
 * `lib/i18n/index.tsx`). Unknown keys log a console warning in dev.
 */
export const LOCALES = ["en", "ru"] as const;
export type Locale = (typeof LOCALES)[number];

/** Recursive map: each leaf is a string. Subtrees are nested objects. */
export type TranslationTree = { [k: string]: string | TranslationTree };

/* eslint-disable @typescript-eslint/no-explicit-any */
const en: TranslationTree = {
  nav: {
    home: "Home",
    dkp: "DKP",
    migration: "Migration",
    media: "Media",
    discord: "Discord",
    toggleMenu: "Toggle menu",
  },
  hero: {
    eyebrow: "Kingdom {{id}}",
    title: "Discipline & Power",
    description:
      "The Bastion of {{leader}}. A federation forged for KvK and ready for the Ark.",
    cta: {
      join: "Join the Horde",
      standings: "View Standings",
    },
  },
  footer: {
    tagline: "{{id}} Huns · Rise of Kingdoms",
    discord: "Join Discord →",
  },
  pages: {
    migration: {
      eyebrow: "Recruitment",
      title: "Join the Horde",
      description:
        "The gates of 4028 are open to disciplined governors who pull weight in KvK and on the Ark. Read the brief, then submit your application below.",
      preferChat: "Prefer to chat first?",
      openDiscord: "Open Discord",
      walkthrough: "— an officer will walk you through it.",
    },
    dkp: {
      eyebrow: "Leaderboard",
      title: "DKP Standings",
      description:
        "Ranked by combined kill points and rally contribution this season. Updated after every KvK pass.",
    },
    media: {
      eyebrow: "Field Reports",
      title: "Media",
      description:
        "Watch the Horde in motion — KvK pushes, Ark coordination, migration walkthroughs from the 4028 frontline.",
    },
  },
  kingdomInfo: {
    statsEyebrow: "Intel Brief",
    statsTitle: "Kingdom Stats",
    statsSubtitle: "Hard numbers. No ceremony.",
    requirementsEyebrow: "Recruitment",
    requirementsTitle: "Migration Requirements",
    requirementsSubtitle: "If you meet these, the gates are open.",
  },
  media: {
    empty: "No media yet — check back soon.",
    watchYoutube: "Watch on YouTube",
  },
  form: {
    received: {
      title: "Application received",
      reference: "Reference:",
      followup: "An officer will reach out on Discord within 48 hours.",
    },
    intro: {
      title: "Apply for migration",
      subtitle:
        "Fill the brief, attach screenshots from your profile, top commanders and resources. An officer reviews every application within 48h on Discord.",
    },
    sections: {
      profile: {
        title: "Profile",
        subtitle:
          "Drop your governor profile, kill data popup, troop details, individual stats and lost troops screens first — fields below auto-fill via OCR. Edit anything that came out wrong.",
      },
      spending: {
        title: "Spending tier",
        subtitle:
          "Required. Pick the bracket that feels honest — officers don't need exact numbers.",
      },
      age: {
        title: "Account age proof",
        subtitle: {
          before: "Open your ",
          scout: "Scout / Skirmisher",
          after:
            " commander profile and screenshot it. We read her «Recruit Date» to confirm how old your account is — any other commander is rejected.",
        },
      },
      commanders: {
        title: "Commanders & equipment",
        subtitle:
          "Drop screenshots of your top commanders and their gear — officers review them by eye, no need to type names or pairs.",
      },
      resources: {
        title: "Resources & speedups",
        subtitle:
          "Open the in-game «Your Resources & Speedups» modal — screenshot both tabs, drop them here, then verify the auto-filled values below.",
      },
      prevKvk: {
        title: "Previous KvK DKP (optional)",
        subtitle:
          "Drop your KvK scan spreadsheet — we look up your governor ID and pull last-KvK DKP, T4/T5, deaths automatically (kept separate from your lifetime account stats above). Or screenshot the score and type it below.",
      },
      about: {
        title: "About you",
        subtitle: "Optional — helps us match you to the right ops team.",
      },
    },
    groups: {
      identity: "Identity",
      core: "Core",
      kvkRecord: "KvK record",
      resources: "Resources — use the «Total» column",
      speedups:
        "Speedups — accepted formats: «63d 12h 20m», «63 дн 12 ч 20 м», or raw minutes («720»)",
    },
    fields: {
      governorId: "Governor ID",
      nickname: "In-game nickname",
      currentKingdom: "Current kingdom",
      discordHandle: "Discord handle",
      vipLevel: "VIP level",
      power: "Power",
      killPoints: "Kill points",
      t4Kills: "T4 kills",
      t5Kills: "T5 kills",
      deaths: "Deaths",
      maxValor: "Max valor (lifetime)",
      accountBornAt: "Account created (YYYY-MM-DD)",
      marches: "Marches",
      food: "Food",
      wood: "Wood",
      stone: "Stone",
      gold: "Gold",
      construction: "Construction",
      research: "Research",
      training: "Training",
      healing: "Healing",
      universal: "Universal",
      previousKvkDkp: "Previous KvK DKP",
      prevKvkT4: "Last KvK · T4 kills",
      prevKvkT5: "Last KvK · T5 kills",
      prevKvkDeaths: "Last KvK · Deaths",
      prevKvkKp: "Last KvK · Kill points",
      activityHours: "Activity hours",
      timezone: "Timezone",
      reason: "Why 4028?",
      hasScrolls: "I already have migration scrolls ready",
    },
    ocr: {
      extracted: "extracted",
      autoTitle: "Auto-filled from OCR — edit to override",
    },
    dropzone: {
      drag: "Drag images here or",
      browse: "browse",
      slotsLeft: "{{n}} slots left · auto-compressed before upload",
      limit: "Upload limit reached",
    },
    gallery: {
      previewLabel: "Preview {{label}}",
      previewFallback: "screenshot",
      removeLabel: "Remove",
      ocrTitle: "OCR running",
      scoutMatch: "Scout",
      scoutMatchTitle: "Verified Scout commander",
      scoutMismatch: "Wrong",
      scoutMismatchTitle: "Not the Scout commander — re-upload",
      uploadFailed: "Upload failed",
    },
    scout: {
      confirmed: "Scout commander confirmed.",
      bornOn: "Account created on",
      mismatchTitle: "That's not the Scout.",
      mismatchHint:
        "Only the starter Skirmisher gives us a reliable account-birth date. Open her profile and try again.",
      verifying: "Verifying commander…",
    },
    dkpScan: {
      uploadButton: "Upload KvK scan (xlsx / csv)",
      hintReady:
        "We find your row by Governor ID and pull DKP, T4/T5, deaths, etc.",
      hintNeedId: "Fill the Governor ID above first.",
      foundRank: "Found rank #{{rank}} —",
      autofillNote: "Fields below auto-filled where empty.",
      notFoundTitle: "Not in this scan ({{rows}} rows checked).",
      notFoundHint:
        "Double-check the Governor ID, or upload a different scan.",
      noGovIdError:
        "Fill the Governor ID above first — we look you up by it.",
      lookupFailed: "lookup_failed",
    },
    submit: {
      ready: "{{n}} screenshots ready",
      ocrRunning: "OCR running…",
      draftSaved: "· draft auto-saved",
      submitting: "Submitting…",
      submit: "Submit application",
    },
    lightbox: {
      close: "Close preview",
      open: "Open",
      alt: "screenshot preview",
    },
    placeholders: {
      governorId: "124000000",
      nickname: "WarDaddyChadski",
      currentKingdom: "3450",
      discordHandle: "@yourhandle",
      vipLevel: "14",
      power: "84M",
      killPoints: "152M",
      t4Kills: "18M",
      t5Kills: "6.4M",
      deaths: "3.2M",
      maxValor: "7.2M",
      accountBornAt: "2026-02-07",
      marches: "6",
      food: "3.6B",
      wood: "3.9B",
      stone: "3.7B",
      gold: "2.9B",
      construction: "63d 12h 20m",
      research: "88d 2h 28m",
      training: "3d 20h 49m",
      healing: "6d 5h 55m",
      universal: "340d 18h 56m",
      previousKvkDkp: "142M",
      prevKvkT4: "2.4M",
      prevKvkT5: "1.1M",
      prevKvkDeaths: "450K",
      prevKvkKp: "38M",
      activityHours: "3-4h/day, evenings",
      timezone: "UTC+2",
      reason:
        "A few sentences — your KvK history, what you're looking for.",
    },
  },
  langSwitch: {
    label: "Language",
    en: "EN",
    ru: "RU",
  },
};

/** Russian. Tone: respectful "вы", direct, no English game-jargon
 *  unless it has no clean Russian equivalent (KvK, DKP, T4/T5 stay).
 *  Officer/admin RoK-RU community uses these terms verbatim. */
const ru: TranslationTree = {
  nav: {
    home: "Главная",
    dkp: "DKP",
    migration: "Миграция",
    media: "Медиа",
    discord: "Discord",
    toggleMenu: "Меню",
  },
  hero: {
    eyebrow: "Королевство {{id}}",
    title: "Дисциплина и сила",
    description:
      "Бастион {{leader}}. Альянс, заточенный под KvK и готовый к Ковчегу.",
    cta: {
      join: "Вступить в орду",
      standings: "Таблица DKP",
    },
  },
  footer: {
    tagline: "{{id}} Huns · Rise of Kingdoms",
    discord: "Присоединиться →",
  },
  pages: {
    migration: {
      eyebrow: "Набор",
      title: "Вступай в орду",
      description:
        "Ворота 4028 открыты для дисциплинированных правителей, которые тащат в KvK и на Ковчеге. Прочитай требования и подай заявку ниже.",
      preferChat: "Хочешь сначала пообщаться?",
      openDiscord: "Открыть Discord",
      walkthrough: "— офицер тебя проведёт.",
    },
    dkp: {
      eyebrow: "Рейтинг",
      title: "Таблица DKP",
      description:
        "Сводный рейтинг по KP и вкладу в раллики за сезон. Обновляется после каждого KvK.",
    },
    media: {
      eyebrow: "Полевые сводки",
      title: "Медиа",
      description:
        "Орда в действии — пуши KvK, координация на Ковчеге, гайды по миграции от фронта 4028.",
    },
  },
  kingdomInfo: {
    statsEyebrow: "Сводка",
    statsTitle: "Статистика королевства",
    statsSubtitle: "Голые цифры, без церемоний.",
    requirementsEyebrow: "Набор",
    requirementsTitle: "Требования к миграции",
    requirementsSubtitle: "Подходишь — ворота открыты.",
  },
  media: {
    empty: "Пока нет роликов — заглядывай позже.",
    watchYoutube: "Смотреть на YouTube",
  },
  form: {
    received: {
      title: "Заявка принята",
      reference: "Номер:",
      followup: "Офицер свяжется с тобой в Discord в течение 48 часов.",
    },
    intro: {
      title: "Заявка на миграцию",
      subtitle:
        "Заполни анкету, прикрепи скриншоты профиля, топ-командиров и ресурсов. Офицер проверит каждую заявку за 48 часов в Discord.",
    },
    sections: {
      profile: {
        title: "Профиль",
        subtitle:
          "Залей сначала скрин профиля правителя, всплывашку с убийствами и мертвые — поля ниже заполнятся через OCR автоматически. Если что-то распозналось криво — поправь руками.",
      },
      spending: {
        title: "Уровень доната",
        subtitle:
          "Обязательно. Выбери диапазон честно — точные цифры офицеру не нужны.",
      },
      age: {
        title: "Подтверждение возраста аккаунта",
        subtitle: {
          before: "Открой профиль командира ",
          scout: "Застрельщица",
          after:
            " и сделай скриншот. Мы читаем «Дату найма» — это единственный надёжный способ узнать возраст аккаунта; любой другой командир не подойдёт.",
        },
      },
      commanders: {
        title: "Командиры и снаряжение",
        subtitle:
          "Скрины топ-командиров и их шмота.",
      },
      resources: {
        title: "Ресурсы и ускорения",
        subtitle:
          "Открой в игре «Ваши ресурсы и ускорения», заскринь обе вкладки, перетащи сюда — и сверь авто-заполненные значения ниже.",
      },
      prevKvk: {
        title: "DKP за прошлый KvK (по желанию)",
        subtitle:
          "Залей xlsx-скан KvK — мы найдём тебя по Governor ID и автоматически подтянем DKP, T4/T5, потери (отдельно от твоей лайфтайм-статистики выше). Или сделай скриншот результата и впиши вручную.",
      },
      about: {
        title: "О тебе",
        subtitle:
          "По желанию — поможет распределить тебя в нужную опс-команду.",
      },
    },
    groups: {
      identity: "Идентификация",
      core: "Основное",
      kvkRecord: "KvK-история",
      resources: "Ресурсы",
      speedups:
        "Ускорения — формат «63d 12h 20m», «63 дн 12 ч 20 м» или просто минуты («720»)",
    },
    fields: {
      governorId: "Governor ID",
      nickname: "Ник в игре",
      currentKingdom: "Текущее королевство",
      discordHandle: "Discord",
      vipLevel: "VIP-уровень",
      power: "Мощь",
      killPoints: "Очки убийств",
      t4Kills: "Убийства T4",
      t5Kills: "Убийства T5",
      deaths: "Потери",
      maxValor: "Макс. доблесть (лайфтайм)",
      accountBornAt: "Дата создания (ГГГГ-ММ-ДД)",
      marches: "Маршей",
      food: "Еда",
      wood: "Дерево",
      stone: "Камень",
      gold: "Золото",
      construction: "Строительство",
      research: "Исследование",
      training: "Обучение",
      healing: "Лечение",
      universal: "Универсальные",
      previousKvkDkp: "DKP прошлого KvK",
      prevKvkT4: "Прошлый KvK · T4",
      prevKvkT5: "Прошлый KvK · T5",
      prevKvkDeaths: "Прошлый KvK · потери",
      prevKvkKp: "Прошлый KvK · KP",
      activityHours: "Часы активности",
      timezone: "Часовой пояс",
      reason: "Почему 4028?",
      hasScrolls: "У меня уже есть свитки переноса",
    },
    ocr: {
      extracted: "распознано",
      autoTitle: "Заполнено OCR — поправь, если криво",
    },
    dropzone: {
      drag: "Перетащи картинки сюда или",
      browse: "выбери",
      slotsLeft: "Осталось {{n}} слотов · сжимаем перед загрузкой",
      limit: "Лимит загрузок исчерпан",
    },
    gallery: {
      previewLabel: "Предпросмотр {{label}}",
      previewFallback: "скриншот",
      removeLabel: "Удалить",
      ocrTitle: "OCR работает",
      scoutMatch: "Скаут",
      scoutMatchTitle: "Скаут подтверждён",
      scoutMismatch: "Не то",
      scoutMismatchTitle: "Это не Скаут — перезалей",
      uploadFailed: "Загрузка упала",
    },
    scout: {
      confirmed: "Скаут подтверждён.",
      bornOn: "Аккаунт создан",
      mismatchTitle: "Это не Скаут.",
      mismatchHint:
        "Дату создания аккаунта мы достаём только со стартовой Лучницы-скаута. Открой её профиль и попробуй ещё раз.",
      verifying: "Проверяем командира…",
    },
    dkpScan: {
      uploadButton: "Загрузить скан KvK (xlsx / csv)",
      hintReady:
        "Найдём твою строку по Governor ID и подтянем DKP, T4/T5, потери и т.д.",
      hintNeedId: "Сначала впиши Governor ID выше.",
      foundRank: "Найдено место №{{rank}} —",
      autofillNote: "Поля ниже заполнены, где было пусто.",
      notFoundTitle:
        "Тебя нет в этом скане (проверено строк: {{rows}}).",
      notFoundHint:
        "Перепроверь Governor ID или загрузи другой скан.",
      noGovIdError:
        "Сначала впиши Governor ID выше — мы по нему ищем.",
      lookupFailed: "Не удалось найти строку",
    },
    submit: {
      ready: "Скриншотов готово: {{n}}",
      ocrRunning: "OCR работает…",
      draftSaved: "· черновик сохранён",
      submitting: "Отправляем…",
      submit: "Отправить заявку",
    },
    lightbox: {
      close: "Закрыть",
      open: "Открыть",
      alt: "Предпросмотр скриншота",
    },
    placeholders: {
      governorId: "124000000",
      nickname: "WarDaddyChadski",
      currentKingdom: "3450",
      discordHandle: "@yourhandle",
      vipLevel: "14",
      power: "84M",
      killPoints: "152M",
      t4Kills: "18M",
      t5Kills: "6.4M",
      deaths: "3.2M",
      maxValor: "7.2M",
      accountBornAt: "2026-02-07",
      marches: "6",
      food: "3.6B",
      wood: "3.9B",
      stone: "3.7B",
      gold: "2.9B",
      construction: "63d 12h 20m",
      research: "88d 2h 28m",
      training: "3d 20h 49m",
      healing: "6d 5h 55m",
      universal: "340d 18h 56m",
      previousKvkDkp: "142M",
      prevKvkT4: "2.4M",
      prevKvkT5: "1.1M",
      prevKvkDeaths: "450K",
      prevKvkKp: "38M",
      activityHours: "3-4 ч/день, вечером",
      timezone: "UTC+2",
      reason:
        "Пара предложений — твоя KvK-история и что ищешь.",
    },
  },
  langSwitch: {
    label: "Язык",
    en: "EN",
    ru: "RU",
  },
};

export const TRANSLATIONS: Record<Locale, TranslationTree> = { en, ru };
