import type { Language } from "../components/LanguageToggle";

export interface SourceEntry {
  title: string;
  estimatedTime: number;
  startRef: string;
  endRef: string;
  summary: string;
  text: string;
  commentaries: string[];
  reflectionPrompt: string;
  sefariaLink: string;
}

export const sourcesByTopic: Record<string, Record<Language, SourceEntry[]>> = {
  halacha: {
    en: [
      {
        title: "Shulchan Aruch OC 1:1 – Morning Awakening",
        estimatedTime: 5,
        startRef: "Shulchan Aruch OC 1:1",
        endRef: "1:1",
        summary: "Rise like a lion to serve the Creator at dawn.",
        text: "One should strengthen himself like a lion to get up in the morning to serve his Creator, so that he awakens the dawn.",
        commentaries: ["Mishnah Berurah"],
        reflectionPrompt:
          "How can you bring this determination into your life?",
        sefariaLink:
          "https://www.sefaria.org/Shulchan_Arukh%2C_Orach_Chayim.1.1",
      },
      {
        title: "Shulchan Aruch YD 87:1 – Meat and Milk",
        estimatedTime: 10,
        startRef: "Shulchan Aruch YD 87:1",
        endRef: "87:1",
        summary: "Prohibition of mixing meat and milk together.",
        text: "It is forbidden to cook meat in milk, even the smallest amount, whether meat of a domestic animal or wild animal...",
        commentaries: ["Shach", "Taz"],
        reflectionPrompt:
          "What boundaries help you maintain spiritual awareness?",
        sefariaLink:
          "https://www.sefaria.org/Shulchan_Arukh%2C_Yoreh_De'ah.87.1",
      },
    ],
    he: [
      {
        title: 'שולחן ערוך או"ח א:א – התעוררות הבוקר',
        estimatedTime: 5,
        startRef: 'שולחן ערוך או"ח א:א',
        endRef: "א:א",
        summary: "הנחיה לקום בכוח לעבודת הבורא עם שחר.",
        text: "יתגבר כארי לעמוד בבוקר לעבודת בוראו, שיהא הוא מעורר השחר.",
        commentaries: ["משנה ברורה"],
        reflectionPrompt: "איך תכניס נחישות זו לחייך?",
        sefariaLink:
          "https://www.sefaria.org/Shulchan_Arukh%2C_Orach_Chayim.1.1",
      },
      {
        title: 'שולחן ערוך יו"ד פז:א – בשר בחלב',
        estimatedTime: 10,
        startRef: 'שולחן ערוך יו"ד פז:א',
        endRef: "פז:א",
        summary: "איסור בישול ואכילת בשר בחלב.",
        text: "אסור לבשל בשר בחלב אפילו כלשהו, בין בשר בהמה או חיה...",
        commentaries: ['ש"ך', 'ט"ז'],
        reflectionPrompt: "איזה גבולות מסייעים לך לשמור על מודעות רוחנית?",
        sefariaLink:
          "https://www.sefaria.org/Shulchan_Arukh%2C_Yoreh_De'ah.87.1",
      },
    ],
  },
  rambam: {
    en: [
      {
        title: "Mishneh Torah, Hilchot De'ot 1:4 – The Middle Path",
        estimatedTime: 10,
        startRef: "De'ot 1:4",
        endRef: "1:4",
        summary:
          "Maimonides teaches that a person should walk in balanced traits.",
        text: "The straight path is the middle path in every trait that a person possesses...",
        commentaries: ["Kesef Mishneh"],
        reflectionPrompt: "Where can you strive for balance today?",
        sefariaLink:
          "https://www.sefaria.org/Mishneh_Torah%2C_Hilchot_De'ot.1.4",
      },
      {
        title: "Mishneh Torah, Hilchot Teshuva 2:2 – Steps of Repentance",
        estimatedTime: 15,
        startRef: "Teshuva 2:2",
        endRef: "2:2",
        summary: "Outline of the basic steps of teshuva.",
        text: "What constitutes complete repentance? That a person abandon the sin...",
        commentaries: ["Radvaz"],
        reflectionPrompt: "Reflect on a step of growth you can take.",
        sefariaLink: "https://www.sefaria.org/Mishneh_Torah%2C_Repentance.2.2",
      },
    ],
    he: [
      {
        title: "משנה תורה, הלכות דעות א:ד – דרך האמצע",
        estimatedTime: 10,
        startRef: "הלכות דעות א:ד",
        endRef: "א:ד",
        summary: 'הרמב"ם מלמד להתנהל במידה מאוזנת.',
        text: "הדרך הישרה היא מידה בינונית שבכל דעה ודעה...",
        commentaries: ["כסף משנה"],
        reflectionPrompt: "באילו תחומים תוכל לשאוף לאיזון?",
        sefariaLink:
          "https://www.sefaria.org/Mishneh_Torah%2C_Hilchot_De'ot.1.4?lang=he",
      },
      {
        title: "משנה תורה, הלכות תשובה ב:ב – שלבי התשובה",
        estimatedTime: 15,
        startRef: "הלכות תשובה ב:ב",
        endRef: "ב:ב",
        summary: 'הרמב"ם מונה את שלבי התשובה הבסיסיים.',
        text: "איזו היא תשובה גמורה? זה שיעזוב החוטא חטאו...",
        commentaries: ['רב"ד'],
        reflectionPrompt: "חשוב על צעד אחד להתקדמות רוחנית.",
        sefariaLink:
          "https://www.sefaria.org/Mishneh_Torah%2C_Repentance.2.2?lang=he",
      },
    ],
  },
  tanakh: {
    en: [
      {
        title: "Exodus 3:1–10 – The Burning Bush",
        estimatedTime: 10,
        startRef: "Exodus 3:1",
        endRef: "3:10",
        summary:
          "Moses encounters God in the burning bush and receives his mission.",
        text: "Moses was shepherding the flock of Jethro... and behold the bush was burning with fire, but the bush was not consumed...",
        commentaries: ["Rashi", "Sforno"],
        reflectionPrompt: "What sparks your sense of mission?",
        sefariaLink: "https://www.sefaria.org/Exodus.3.1-3.10",
      },
      {
        title: "Proverbs 3:5 – Trust in God",
        estimatedTime: 5,
        startRef: "Proverbs 3:5",
        endRef: "3:5",
        summary: "Call to place complete trust in God.",
        text: "Trust in the Lord with all your heart and do not rely on your own understanding.",
        commentaries: ["Metzudot"],
        reflectionPrompt: "Where do you struggle to let go and trust?",
        sefariaLink: "https://www.sefaria.org/Proverbs.3.5",
      },
    ],
    he: [
      {
        title: "שמות ג:א–י – הסנה הבוער",
        estimatedTime: 10,
        startRef: "שמות ג:א",
        endRef: "ג:י",
        summary: "משה פוגש את ה' בסנה הבוער ונשלח להוציא את ישראל.",
        text: "ומשה היה רועה... והנה הסנה בוער באש והסנה איננו אוכל...",
        commentaries: ['רש"י', "ספורנו"],
        reflectionPrompt: "מה מצית בך תחושת שליחות?",
        sefariaLink: "https://www.sefaria.org/Exodus.3.1-3.10?lang=he",
      },
      {
        title: "משלי ג:ה – בטחון בה'",
        estimatedTime: 5,
        startRef: "משלי ג:ה",
        endRef: "ג:ה",
        summary: "קריאה לתת אמון מלא בה'.",
        text: "בְּטַח אֶל-יְהוָה בְּכָל-לִבֶּךָ וְאֶל-בִּינָתְךָ אַל-תִּשָּׁעֵן.",
        commentaries: ["מצודת דוד"],
        reflectionPrompt: "היכן קשה לך לבטוח ולהישען על ה'?",
        sefariaLink: "https://www.sefaria.org/Proverbs.3.5?lang=he",
      },
    ],
  },
  talmud: {
    en: [
      {
        title: "Sanhedrin 37a – One Who Saves a Life",
        estimatedTime: 10,
        startRef: "Sanhedrin 37a",
        endRef: "37a",
        summary:
          "Teaching that saving one life is like saving an entire world.",
        text: "Therefore man was created singly to teach that anyone who destroys a single life... is considered as if he destroyed an entire world...",
        commentaries: ["Rashi"],
        reflectionPrompt: "How does this shape your view of individual worth?",
        sefariaLink: "https://www.sefaria.org/Sanhedrin.37a",
      },
      {
        title: "Ta'anit 7a – Rain Compared to Torah",
        estimatedTime: 10,
        startRef: "Ta'anit 7a",
        endRef: "7a",
        summary: "Explores the parallel between rain and Torah learning.",
        text: "Rabbi Yehoshua ben Levi said: what is the meaning of the verse 'My doctrine shall drop as the rain'? This teaches that just as rain...",
        commentaries: ["Ritva"],
        reflectionPrompt: "In what ways is Torah nourishing for you?",
        sefariaLink: "https://www.sefaria.org/Taanit.7a",
      },
    ],
    he: [
      {
        title: 'סנהדרין ל"ז ע"א – מציל נפש אחת',
        estimatedTime: 10,
        startRef: 'סנהדרין ל"ז ע"א',
        endRef: 'ל"ז ע"א',
        summary: "המלמד שהמציל נפש אחת כאילו קיים עולם מלא.",
        text: "לפיכך נברא אדם יחידי ללמד שכל המאבד נפש אחת... מעלה עליו הכתוב כאילו איבד עולם מלא...",
        commentaries: ['רש"י'],
        reflectionPrompt: "כיצד דבר זה משנה את הערך שאתה נותן לכל אדם?",
        sefariaLink: "https://www.sefaria.org/Sanhedrin.37a?lang=he",
      },
      {
        title: 'תענית ז ע"א – הגשם כתורה',
        estimatedTime: 10,
        startRef: 'תענית ז ע"א',
        endRef: 'ז ע"א',
        summary: "עיסוק בהשוואה בין גשם לתורה.",
        text: "אמר רבי יהושע בן לוי: מהו דכתיב 'יערף כמטר לקחי'... מלמד כשם שהגשם...",
        commentaries: ['ריטב"א'],
        reflectionPrompt: "כיצד התורה מזינה אותך?",
        sefariaLink: "https://www.sefaria.org/Taanit.7a?lang=he",
      },
    ],
  },
  spiritual: {
    en: [
      {
        title: "Duties of the Heart, Gate of Trust 1",
        estimatedTime: 10,
        startRef: "Chovot HaLevavot Shaar HaBitachon 1",
        endRef: "1",
        summary: "Beginning of the classic work on developing trust in God.",
        text: "Know, my brother, that the benefit of trust in God...",
        commentaries: ["Rabbeinu Bachya"],
        reflectionPrompt: "Where can deeper trust guide you today?",
        sefariaLink:
          "https://www.sefaria.org/Chovot_HaLevavot,_Gate_of_Trust.1",
      },
      {
        title: "Orchot Tzaddikim – Gate of Pride",
        estimatedTime: 15,
        startRef: "Orchot Tzaddikim, Gate of Pride",
        endRef: "1",
        summary:
          "Discusses the dangers of arrogance and the value of humility.",
        text: "Pride is the root of many negative traits...",
        commentaries: ["Anonymous"],
        reflectionPrompt: "How can you nurture humility?",
        sefariaLink: "https://www.sefaria.org/Orchot_Tzaddikim,_Gate_of_Pride",
      },
    ],
    he: [
      {
        title: "חובות הלבבות שער הביטחון א",
        estimatedTime: 10,
        startRef: "חובות הלבבות שער הביטחון א",
        endRef: "א",
        summary: "פתיחת הספר העוסק בביטחון בה'.",
        text: "דע אחי כי תועלת הביטחון בה'...",
        commentaries: ["רבנו בחיי"],
        reflectionPrompt: "היכן יכול ביטחון עמוק להנחות אותך היום?",
        sefariaLink:
          "https://www.sefaria.org/Chovot_HaLevavot,_Gate_of_Trust.1?lang=he",
      },
      {
        title: "אורחות צדיקים – שער הגאווה",
        estimatedTime: 15,
        startRef: "אורחות צדיקים שער הגאווה",
        endRef: "א",
        summary: "עוסק בסכנות הגאווה ובחשיבות הענווה.",
        text: "הגאווה היא שורש למידות רעות רבות...",
        commentaries: ["ללא שם"],
        reflectionPrompt: "כיצד תוכל לטפח ענווה?",
        sefariaLink:
          "https://www.sefaria.org/Orchot_Tzaddikim,_Gate_of_Pride?lang=he",
      },
    ],
  },
};

export default sourcesByTopic;
