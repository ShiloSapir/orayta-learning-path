import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Language } from "./LanguageToggle";
import { useAppToast } from "@/hooks/useToast";
import { 
  ArrowLeft, 
  ExternalLink, 
  BookOpen, 
  Heart, 
  Calendar,
  SkipForward,
  CheckCircle
} from "lucide-react";

interface SourceRecommendationProps {
  language: Language;
  timeSelected: number;
  topicSelected: string;
  onBack: () => void;
  onReflection: () => void;
}

const content = {
  en: {
    title: "Your Torah Source",
    subtitle: "Selected for your spiritual journey",
    backButton: "Back",
    skipButton: "Skip This Source",
    saveButton: "Save for Later",
    learnedButton: "Mark as Learned",
    calendarButton: "Add to Calendar",
    reflectionButton: "Write Reflection",
    commentariesLabel: "Suggested Commentaries:",
    reflectionPromptLabel: "Reflection Prompt:",
    fromTo: "From",
    to: "to",
    sefariaLink: "Open in Sefaria"
  },
  he: {
    title: "המקור שלך",
    subtitle: "נבחר למסע הרוחני שלך",
    backButton: "חזור",
    skipButton: "דלג על המקור הזה",
    saveButton: "שמור למועד מאוחר",
    learnedButton: "סמן כנלמד",
    calendarButton: "הוסף ליומן",
    reflectionButton: "כתוב הרהור",
    commentariesLabel: "פירושים מומלצים:",
    reflectionPromptLabel: "שאלה להרהור:",
    fromTo: "מ",
    to: "עד",
    sefariaLink: "פתח בספריא"
  }
};

// Sample sources organized by category. Each topic contains several entries per language for diversity
interface SourceEntry {
  title: string;
  startRef: string;
  endRef: string;
  summary: string;
  text: string;
  commentaries: string[];
  reflectionPrompt: string;
  sefariaLink: string;
}

const sourcesByTopic: Record<string, Record<Language, SourceEntry[]>> = {
  halacha: {
    en: [
      {
        title: "Shulchan Aruch Orach Chaim 1:1 – Morning Awakening",
        startRef: "Shulchan Aruch OC 1:1",
        endRef: "1:1",
        summary: "The first law teaches rising with strength to serve God at dawn.",
        text: "One should strengthen himself like a lion to get up in the morning to serve his Creator, so that he awakens the dawn.",
        commentaries: ["Mishna Berura", "Kaf HaChaim", "Aruch HaShulchan"],
        reflectionPrompt: "How can you bring this morning determination into your life?",
        sefariaLink: "https://www.sefaria.org/Shulchan_Arukh%2C_Orach_Chayim.1.1"
      },
      {
        title: "Shulchan Aruch Yoreh Deah 249:1 – Giving Charity",
        startRef: "Shulchan Aruch YD 249:1",
        endRef: "249:1",
        summary: "Guidelines for prioritizing charity and supporting those in need.",
        text: "Every person is obligated to give tzedakah according to his ability, and the poor of his family come first.",
        commentaries: ["Shach", "Taz", "Pitchei Teshuva"],
        reflectionPrompt: "Who around you could benefit most from your support this week?",
        sefariaLink: "https://www.sefaria.org/Shulchan_Arukh%2C_Yoreh_Deah.249.1"
      },
      {
        title: "Shulchan Aruch Orach Chaim 25:5 – Putting on Tefillin",
        startRef: "Shulchan Aruch OC 25:5",
        endRef: "25:5",
        summary: "Laws detailing the proper intent and positioning when donning tefillin.",
        text: "One should place the arm-tefillin opposite the heart and concentrate on the unity of God.",
        commentaries: ["Mishna Berura", "Be'er Heitev"],
        reflectionPrompt: "How can wearing tefillin shape your focus each morning?",
        sefariaLink: "https://www.sefaria.org/Shulchan_Arukh%2C_Orach_Chayim.25.5"
      },
      {
        title: "Shulchan Aruch Orach Chaim 291:1 – Havdalah After Shabbat",
        startRef: "Shulchan Aruch OC 291:1",
        endRef: "291:1",
        summary: "Instructions for making Havdalah and parting from the holiness of Shabbat.",
        text: "One may not eat after Shabbat until he recites Havdalah over a cup of wine.",
        commentaries: ["Magen Avraham", "Mishna Berura"],
        reflectionPrompt: "What helps you carry the peace of Shabbat into the week ahead?",
        sefariaLink: "https://www.sefaria.org/Shulchan_Arukh%2C_Orach_Chayim.291.1"
      },
      {
        title: "Shulchan Aruch Yoreh Deah 87:1 – Meat and Milk",
        startRef: "Shulchan Aruch YD 87:1",
        endRef: "87:1",
        summary: "Basic prohibition of cooking or eating meat together with milk products.",
        text: "It is forbidden by the Torah to cook meat and milk together, or to eat of what was cooked together.",
        commentaries: ["Shach", "Taz"],
        reflectionPrompt: "How does mindfulness in what you eat affect your spiritual awareness?",
        sefariaLink: "https://www.sefaria.org/Shulchan_Arukh%2C_Yoreh_Deah.87.1"
      }
    ],
    he: [
      {
        title: "שולחן ערוך אורח חיים א:א – התעוררות הבוקר",
        startRef: "שולחן ערוך או\"ח א:א",
        endRef: "א:א",
        summary: "החוק הראשון מלמד לקום בכוח לעבודת הבורא עם שחר.",
        text: "יתגבר כארי לעמוד בבוקר לעבודת בוראו, שיהא הוא מעורר השחר.",
        commentaries: ["משנה ברורה", "כף החיים", "ערוך השולחן"],
        reflectionPrompt: "איך תביא התעוררות זו לשגרת יומך?",
        sefariaLink: "https://www.sefaria.org/Shulchan_Arukh%2C_Orach_Chayim.1.1"
      },
      {
        title: "שולחן ערוך יורה דעה רמט:א – מצוות צדקה",
        startRef: "שולחן ערוך יו\"ד רמט:א",
        endRef: "רמט:א",
        summary: "עקרונות סדרי הקדמת נתינת צדקה לעניים.",
        text: "חייב כל אדם ליתן צדקה כפי יכולתו ועניי עירו קודמים.",
        commentaries: ["ש\"ך", "ט\"ז", "פתחי תשובה"],
        reflectionPrompt: "למי בסביבתך אתה יכול לעזור יותר השבוע?",
        sefariaLink: "https://www.sefaria.org/Shulchan_Arukh%2C_Yoreh_Deah.249.1"
      },
      {
        title: "שולחן ערוך אורח חיים כה:ה – הנחת תפילין",
        startRef: "שולחן ערוך או\"ח כה:ה",
        endRef: "כה:ה",
        summary: "הלכות כוונה ומיקום התפילין בעת ההנחה.",
        text: "מניח תפילין של יד כנגד הלב ומכוון באחדות ה'",
        commentaries: ["משנה ברורה", "באר היטב"],
        reflectionPrompt: "איך התפילין מעצבים את ההתמקדות הרוחנית שלך?",
        sefariaLink: "https://www.sefaria.org/Shulchan_Arukh%2C_Orach_Chayim.25.5?lang=he"
      },
      {
        title: "שולחן ערוך אורח חיים רצא:א – הבדלה במוצאי שבת",
        startRef: "שולחן ערוך או\"ח רצא:א",
        endRef: "רצא:א",
        summary: "הלכות אמירת הבדלה ביציאה משבת.",
        text: "אסור לאכול אחר שבת עד שיבדיל על הכוס.",
        commentaries: ["מגן אברהם", "משנה ברורה"],
        reflectionPrompt: "כיצד אתה נושא את קדושת השבת אל תוך השבוע?",
        sefariaLink: "https://www.sefaria.org/Shulchan_Arukh%2C_Orach_Chayim.291.1?lang=he"
      },
      {
        title: "שולחן ערוך יורה דעה פז:א – בשר בחלב",
        startRef: "שולחן ערוך יו\"ד פז:א",
        endRef: "פז:א",
        summary: "איסור בישול ואכילת בשר בחלב.",
        text: "אסור מן התורה לבשל בשר בחלב או לאכול מבושל זה.",
        commentaries: ["ש\"ך", "ט\"ז"],
        reflectionPrompt: "איך מודעות באכילה משפיעה על דרכך הרוחנית?",
        sefariaLink: "https://www.sefaria.org/Shulchan_Arukh%2C_Yoreh_Deah.87.1?lang=he"
      }
    ]
  },
  rambam: {
    en: [
      {
        title: "Mishneh Torah Hilchot Teshuva 7:3 – The Nature of Return",
        startRef: "Hilchot Teshuva 7:3",
        endRef: "7:3",
        summary: "Rambam describes how sincere repentance unites a person with the Divine.",
        text: "How great is repentance! Yesterday he was separate from God... today he cleaves to the Divine Presence.",
        commentaries: ["Lechem Mishneh", "Kesef Mishneh", "Radbaz"],
        reflectionPrompt: "Recall a moment of transformation in your life. What did it teach you?",
        sefariaLink: "https://www.sefaria.org/Mishneh_Torah%2C_Repentance.7.3"
      },
      {
        title: "Mishneh Torah Hilchot De'ot 2:2 – The Middle Path",
        startRef: "Hilchot De'ot 2:2",
        endRef: "2:2",
        summary: "Rambam teaches that a person should follow the balanced path between extremes of character traits.",
        text: "The straight path is the midpoint disposition of each and every trait that man possesses.",
        commentaries: ["Rambam Commentary", "Kesef Mishneh"],
        reflectionPrompt: "Which trait in your life could benefit from finding a better balance?",
        sefariaLink: "https://www.sefaria.org/Mishneh_Torah%2C_Human_Dispositions.2.2"
      },
      {
        title: "Mishneh Torah Hilchot Shabbat 30:7 – Joy of Shabbat",
        startRef: "Hilchot Shabbat 30:7",
        endRef: "30:7",
        summary: "Rambam emphasizes honoring Shabbat with good food and cheerful spirit.",
        text: "It is a mitzvah to delight in Shabbat with delicacies and pleasant drinks.",
        commentaries: ["Mishneh Torah Commentaries"],
        reflectionPrompt: "How can you enhance your enjoyment of Shabbat this week?",
        sefariaLink: "https://www.sefaria.org/Mishneh_Torah%2C_Sabbath.30.7"
      },
      {
        title: "Mishneh Torah Hilchot Tefillah 1:1 – Daily Prayer",
        startRef: "Hilchot Tefillah 1:1",
        endRef: "1:1",
        summary: "Rambam states the obligation for daily prayer and praise of God.",
        text: "It is a positive commandment to pray every day, to praise God and request our needs.",
        commentaries: ["Kesef Mishneh"],
        reflectionPrompt: "What personal request will you bring to your prayers today?",
        sefariaLink: "https://www.sefaria.org/Mishneh_Torah%2C_Prayer.1.1"
      },
      {
        title: "Mishneh Torah Yesodei HaTorah 1:1 – Foundation of Foundations",
        startRef: "Yesodei HaTorah 1:1",
        endRef: "1:1",
        summary: "Rambam begins with the command to know that God exists and is the first cause.",
        text: "The foundation of all foundations and the pillar of wisdom is to know that there is a First Being who brought every existing thing into being.",
        commentaries: ["Kesef Mishneh"],
        reflectionPrompt: "How do you connect to the idea of a First Cause in your life?",
        sefariaLink: "https://www.sefaria.org/Mishneh_Torah%2C_Foundations_of_the_Torah.1.1"
      },
    ],
    he: [
      {
        title: "משנה תורה הלכות תשובה ז:ג – טבע התשובה",
        startRef: "הלכות תשובה ז:ג",
        endRef: "ז:ג",
        summary: "הרמב\"ם מתאר כיצד תשובה מקרבת את האדם לשכינה.",
        text: "גדולה תשובה שאמש היה זה מובדל מה'... והיום הוא דבוק בשכינה.",
        commentaries: ["לחם משנה", "כסף משנה", "רדב\"ז"],
        reflectionPrompt: "הרהר בשינוי שעברת. מה למדת ממנו?",
        sefariaLink: "https://www.sefaria.org/Mishneh_Torah%2C_Repentance.7.3"
      },
      {
        title: "משנה תורה הלכות דעות ב:ב – דרך האמצע",
        startRef: "הלכות דעות ב:ב",
        endRef: "ב:ב",
        summary: "הרמב\"ם מדגיש את חשיבות המידה הבינונית בין קצוות האופי.",
        text: "הדרך הישרה היא שהיא דרך האמצע של כל דעה ודעה מכל הדעות שיש לאדם.",
        commentaries: ["כסף משנה"],
        reflectionPrompt: "באיזו מידה בחייך דרוש איזון נכון יותר?",
        sefariaLink: "https://www.sefaria.org/Mishneh_Torah%2C_Human_Dispositions.2.2"
      },
      {
        title: "משנה תורה הלכות שבת ל:ז – שמחת השבת",
        startRef: "הלכות שבת ל:ז",
        endRef: "ל:ז",
        summary: "הרמב\"ם מצווה לכבד את השבת ולהתענג עליה במאכל ובמשקה.",
        text: "מצוה לענג את השבת במאכלים ומשקים טובים ובנחת רוח.",
        commentaries: ["משנה תורה"],
        reflectionPrompt: "כיצד תוסיף עונג בשבת הקרובה?",
        sefariaLink: "https://www.sefaria.org/Mishneh_Torah%2C_Sabbath.30.7?lang=he"
      },
      {
        title: "משנה תורה הלכות תפילה א:א – חיוב התפילה",
        startRef: "הלכות תפילה א:א",
        endRef: "א:א",
        summary: "הרמב\"ם קובע שחובה להתפלל בכל יום ולבקש צרכינו.",
        text: "מצות עשה להתפלל בכל יום לשבח את ה' ולבקש צרכיו.",
        commentaries: ["כסף משנה"],
        reflectionPrompt: "איזו בקשה אישית תביא בתפילתך היום?",
        sefariaLink: "https://www.sefaria.org/Mishneh_Torah%2C_Prayer.1.1?lang=he"
      },
      {
        title: "משנה תורה יסודי התורה א:א – יסוד היסודות",
        startRef: "יסודי התורה א:א",
        endRef: "א:א",
        summary: "הרמב\"ם פותח בידיעה שיש מצוי ראשון שברא כל נמצא.",
        text: "יסוד היסודות ועמוד החכמות לידע שיש שם מצוי ראשון והוא ממציא כל נמצא.",
        commentaries: ["רמב\"ם"],
        reflectionPrompt: "כיצד הידיעה במצוי ראשון משפיעה על אמונתך?",
        sefariaLink: "https://www.sefaria.org/Mishneh_Torah%2C_Foundations_of_the_Torah.1.1?lang=he"
      }
    ]
  },
  tanakh: {
    en: [
      {
        title: "Genesis 28:10-12 – Jacob's Dream",
        startRef: "Genesis 28:10",
        endRef: "28:12",
        summary: "Jacob dreams of a ladder reaching heaven, symbolizing connection between earth and the Divine.",
        text: "And he dreamed, and behold! a ladder was set up on the earth, and its top reached to heaven...",
        commentaries: ["Rashi", "Ramban"],
        reflectionPrompt: "What personal vision lifts you toward something higher?",
        sefariaLink: "https://www.sefaria.org/Genesis.28.10-28.12"
      },
      {
        title: "Isaiah 58:6-7 – True Fasting",
        startRef: "Isaiah 58:6",
        endRef: "58:7",
        summary: "The prophet teaches that sincere worship includes freeing the oppressed and helping the needy.",
        text: "Is not this the fast I choose? To loosen the chains of wickedness... to share your bread with the hungry.",
        commentaries: ["Metzudat David", "Radak"],
        reflectionPrompt: "How do acts of kindness express your spiritual ideals?",
        sefariaLink: "https://www.sefaria.org/Isaiah.58.6-58.7"
      },
      {
        title: "Psalms 23:1-4 – God My Shepherd",
        startRef: "Psalms 23:1",
        endRef: "23:4",
        summary: "A psalm of trust in God's guidance and protection, even in difficult times.",
        text: "The Lord is my shepherd, I shall not want... Even though I walk in the valley of the shadow of death, I fear no evil.",
        commentaries: ["Ibn Ezra", "Malbim"],
        reflectionPrompt: "Where have you felt guided or protected recently?",
        sefariaLink: "https://www.sefaria.org/Psalms.23.1-23.4"
      },
      {
        title: "Exodus 3:1-4 – The Burning Bush",
        startRef: "Exodus 3:1",
        endRef: "3:4",
        summary: "Moses encounters God in the burning bush, receiving his divine mission.",
        text: "The bush was burning with fire, yet the bush was not consumed... God called to him from within the bush.",
        commentaries: ["Rashi", "Sforno"],
        reflectionPrompt: "Where might you notice the sacred in everyday moments?",
        sefariaLink: "https://www.sefaria.org/Exodus.3.1-3.4"
      },
      {
        title: "Proverbs 3:5-6 – Trust in God",
        startRef: "Proverbs 3:5",
        endRef: "3:6",
        summary: "A teaching to rely on God and He will guide your path.",
        text: "Trust in the Lord with all your heart and do not rely on your own understanding.",
        commentaries: ["Metzudat David"],
        reflectionPrompt: "How can you place greater trust in a higher plan?",
        sefariaLink: "https://www.sefaria.org/Proverbs.3.5-3.6"
      }
    ],
    he: [
      {
        title: "בראשית כח:י–יב – חלום יעקב",
        startRef: "בראשית כח:י",
        endRef: "כח:יב",
        summary: "יעקב חולם על סולם מוצב ארצה וראשו מגיע השמימה.",
        text: "ויחלום והנה סולם מצב ארצה וראשו מגיע השמימה...",
        commentaries: ["רש\"י", "רמב\"ן"],
        reflectionPrompt: "איזו חזון אישי מקרב אותך למעלה?",
        sefariaLink: "https://www.sefaria.org/Genesis.28.10-28.12?lang=he"
      },
      {
        title: "ישעיהו נח:ו–ז – צום אמיתי",
        startRef: "ישעיהו נח:ו",
        endRef: "נח:ז",
        summary: "הנביא מלמד שעבודת ה' כרוכה בשחרור עוולים ועזרה לנזקקים.",
        text: "הלוא זה צום אבחרהו פתח חרצבות רשע... פרוש לרעב לחמך.",
        commentaries: ["מצודת דוד", "רד\"ק"],
        reflectionPrompt: "איך מעשי חסד מבטאים את האידאלים הרוחניים שלך?",
        sefariaLink: "https://www.sefaria.org/Isaiah.58.6-58.7?lang=he"
      },
      {
        title: "תהילים כג:א–ד – ה' רועי",
        startRef: "תהילים כג:א",
        endRef: "כג:ד",
        summary: "מזמור של ביטחון בה' המדריך ושומר בעת צרה.",
        text: "ה' רועי לא אחסר... גם כי אלך בגיא צלמות לא אירא רע כי אתה עמדי.",
        commentaries: ["אבן עזרא", "מלבי\"ם"],
        reflectionPrompt: "היכן הרגשת לאחרונה השגחה ושמירה עליונה?",
        sefariaLink: "https://www.sefaria.org/Psalms.23.1-23.4?lang=he"
      },
      {
        title: "שמות ג:א–ד – הסנה הבוער",
        startRef: "שמות ג:א",
        endRef: "ג:ד",
        summary: "משה פוגש את ה' מתוך הסנה הבוער ונשלח לגאול את ישראל.",
        text: "והנה הסנה בוער באש והסנה איננו אכל... ויקרא אליו אלוהים מתוך הסנה.",
        commentaries: ["רש\"י", "ספורנו"],
        reflectionPrompt: "היכן אתה מבחין בקדושה בתוך חיי היומיום?",
        sefariaLink: "https://www.sefaria.org/Exodus.3.1-3.4?lang=he"
      },
      {
        title: "משלי ג:ה–ו – בטח בה'",
        startRef: "משלי ג:ה",
        endRef: "ג:ו",
        summary: "קריאה לבטוח בה' ולסמוך על הדרכתו.",
        text: "בטח אל ה' בכל לבך ואל בינתך אל תשען.",
        commentaries: ["מצודת דוד"],
        reflectionPrompt: "כיצד אתה יכול לבטוח יותר בתוכנית האלוקית?",
        sefariaLink: "https://www.sefaria.org/Proverbs.3.5-3.6?lang=he"
      }
    ]
  },
  talmud: {
    en: [
      {
        title: "Pirkei Avot 1:2 – The World Stands",
        startRef: "Pirkei Avot 1:2",
        endRef: "1:2",
        summary: "Shimon the Righteous teaches that the world stands on Torah, service, and acts of kindness.",
        text: "On three things the world stands: on the Torah, on the service of God, and on acts of kindness.",
        commentaries: ["Bartenura", "Rashi"],
        reflectionPrompt: "Which of these three pillars can you strengthen today?",
        sefariaLink: "https://www.sefaria.org/Pirkei_Avot.1.2"
      },
      {
        title: "Berakhot 2a – Evening Shema",
        startRef: "Berakhot 2a",
        endRef: "2a",
        summary: "Discussion of the proper time to recite the Shema in the evening.",
        text: "From what time may one recite the evening Shema? From the time the priests enter to eat their teruma...",
        commentaries: ["Tosafot", "Rif"],
        reflectionPrompt: "How do you create space for sacred moments in your day?",
        sefariaLink: "https://www.sefaria.org/Berakhot.2a"
      },
      {
        title: "Bava Metzia 32b – Returning a Lost Item",
        startRef: "Bava Metzia 32b",
        endRef: "32b",
        summary: "The Talmud explains the obligation to return lost property even when inconvenient.",
        text: "You shall surely return it to him – even multiple times, even if it causes you trouble.",
        commentaries: ["Rashi", "Tosafot"],
        reflectionPrompt: "When have you gone out of your way to help someone reclaim what is theirs?",
        sefariaLink: "https://www.sefaria.org/Bava_Metzia.32b"
      },
      {
        title: "Sanhedrin 37a – Saving a Life",
        startRef: "Sanhedrin 37a",
        endRef: "37a",
        summary: "Whoever saves a single life is considered as if he saved an entire world.",
        text: "For this reason man was created alone... to teach that anyone who destroys one soul, it is as if he destroyed a whole world.",
        commentaries: ["Rashi", "Maharsha"],
        reflectionPrompt: "How does valuing each life change your actions?",
        sefariaLink: "https://www.sefaria.org/Sanhedrin.37a"
      },
      {
        title: "Ta'anit 7a – Torah Compared to Water",
        startRef: "Ta'anit 7a",
        endRef: "7a",
        summary: "The sages compare words of Torah to refreshing water.",
        text: "Just as water brings life to the world, so too the Torah brings life to those who study it.",
        commentaries: ["Rashi"],
        reflectionPrompt: "Where do you turn for spiritual nourishment?",
        sefariaLink: "https://www.sefaria.org/Taanit.7a"
      }
    ],
    he: [
      {
        title: "פרקי אבות א:ב – על שלושה דברים",
        startRef: "פרקי אבות א:ב",
        endRef: "א:ב",
        summary: "שמעון הצדיק אומר שהעולם עומד על התורה, העבודה וגמילות חסדים.",
        text: "על שלושה דברים העולם עומד: על התורה ועל העבודה ועל גמילות חסדים.",
        commentaries: ["ברטנורא", "רש\"י"],
        reflectionPrompt: "איזה מהיסודות הללו תרצה לחזק היום?",
        sefariaLink: "https://www.sefaria.org/Pirkei_Avot.1.2?lang=he"
      },
      {
        title: "ברכות ב א – זמן קריאת שמע בערב",
        startRef: "ברכות ב א",
        endRef: "ב א",
        summary: "דיון בזמן הנכון לקריאת שמע של ערבית.",
        text: "מאימתי קורין את שמע בערבית? משעה שהכהנים נכנסין לאכול בתרומתן...",
        commentaries: ["תוספות", "רי\"ף"],
        reflectionPrompt: "כיצד אתה מקדיש זמן לרגעים קדושים במהלך היום?",
        sefariaLink: "https://www.sefaria.org/Berakhot.2a?lang=he"
      },
      {
        title: "בבא מציעא לב ב – השבת אבדה",
        startRef: "בבא מציעא לב ב",
        endRef: "לב ב",
        summary: "הגמרא מלמדת שחובת השבת אבדה קיימת אף כשזה מטריח.",
        text: "השב תשיבם לו – אפילו כמה פעמים, אפילו אם זה מטריח אותך.",
        commentaries: ["רש\"י", "תוספות"],
        reflectionPrompt: "מתי טרחת להחזיר אבדה למישהו?",
        sefariaLink: "https://www.sefaria.org/Bava_Metzia.32b?lang=he"
      },
      {
        title: "סנהדרין לז א – הצלת נפש",
        startRef: "סנהדרין לז א",
        endRef: "ז א",
        summary: "כל המציל נפש אחת כאילו קיים עולם מלא.",
        text: "לפיכך נברא אדם יחידי... שכל המאבד נפש אחת מישראל כאילו איבד עולם מלא.",
        commentaries: ["רש\"י", "מהרש\"א"],
        reflectionPrompt: "כיצד ערך חיי אדם משפיע על מעשיך?",
        sefariaLink: "https://www.sefaria.org/Sanhedrin.37a?lang=he"
      },
      {
        title: "תענית ז א – התורה נמשלה למים",
        startRef: "תענית ז א",
        endRef: "ז א",
        summary: "חז\"ל משווים את דברי התורה למים שמחיים את העולם.",
        text: "מה המים יורדים טיפה טיפה ונעשים נחלים – כך התורה נקנית מעט מעט.",
        commentaries: ["רש\"י"],
        reflectionPrompt: "היכן אתה שואב חיות רוחנית?",
        sefariaLink: "https://www.sefaria.org/Taanit.7a?lang=he"
      }
    ]
  },
  spiritual: {
    en: [
      {
        title: "Mesilat Yesharim – Introduction",
        startRef: "Mesilat Yesharim Introduction",
        endRef: "Introduction",
        summary: "Ramchal sets out a path toward spiritual growth and closeness to God.",
        text: "The duty of man in his world is to clarify and realize what his purpose is...",
        commentaries: ["Rabbi Yehuda Leib Alter", "Rav Dessler"],
        reflectionPrompt: "What personal purpose drives your spiritual journey?",
        sefariaLink: "https://www.sefaria.org/Mesilat_Yesharim.1"
      },
      {
        title: "Tanya, Likutei Amarim 32 – Love of a Fellow Jew",
        startRef: "Tanya 32",
        endRef: "32",
        summary: "The Alter Rebbe teaches that true love for another comes from recognizing the soul within.",
        text: "This is why Rabbi Akiva said: 'Love your fellow as yourself'—this is a great principle of the Torah.",
        commentaries: ["Rabbi Schneur Zalman", "Chassidic Masters"],
        reflectionPrompt: "How can focusing on the soul of others change your interactions?",
        sefariaLink: "https://www.sefaria.org/Tanya%2C_Likkutei_Amarim%2C_Chapter_32"
      },
      {
        title: "Chovot HaLevavot – Gate of Trust 1",
        startRef: "Chovot HaLevavot Shaar HaBitachon 1",
        endRef: "1",
        summary: "Rabbeinu Bachya explains the importance of trusting solely in God.",
        text: "Among the benefits of bitachon is serenity of soul and freedom from worldly worries.",
        commentaries: ["Rabbi Bachya"],
        reflectionPrompt: "Where can you let go and trust more deeply?",
        sefariaLink: "https://www.sefaria.org/Chovot_HaLevavot%2C_Sha'ar_HaBitachon.1"
      },
      {
        title: "Nefesh HaChaim 1:4 – Divine Image",
        startRef: "Nefesh HaChaim 1:4",
        endRef: "1:4",
        summary: "Rav Chaim of Volozhin describes the lofty potential of the human soul.",
        text: "Man is called a small world because all the spiritual realms depend upon his actions.",
        commentaries: ["Rav Chaim"],
        reflectionPrompt: "How do your actions impact the world around you?",
        sefariaLink: "https://www.sefaria.org/Nefesh_HaChaim.1.4"
      },
      {
        title: "Orchot Tzaddikim – Gate of Anger",
        startRef: "Orchot Tzaddikim Shaar Ka'as",
        endRef: "Gate of Anger",
        summary: "Guidance for controlling anger and cultivating patience.",
        text: "Anger burns in the heart and removes a person from calm judgment.",
        commentaries: ["Mussar Masters"],
        reflectionPrompt: "What practice helps you stay calm when provoked?",
        sefariaLink: "https://www.sefaria.org/Orchot_Tzaddikim%2C_Gate_of_Anger"
      }
    ],
    he: [
      {
        title: "מסילת ישרים – הקדמה",
        startRef: "מסילת ישרים הקדמה",
        endRef: "הקדמה",
        summary: "הרמח\"ל מתווה דרך להתקדמות רוחנית ולהתקרבות לה'.",
        text: "חובת האדם בעולמו היא להתבונן ולברר מה תכליתו...",
        commentaries: ["הרב יהודה ליב אלתר", "רב דסלר"],
        reflectionPrompt: "מהו היעד הרוחני האישי שלך?",
        sefariaLink: "https://www.sefaria.org/Mesilat_Yesharim.1?lang=he"
      },
      {
        title: "תניא ליקוטי אמרים לב – אהבת ישראל",
        startRef: "תניא פרק לב",
        endRef: "לב",
        summary: "אדמו\"ר הזקן מלמד שאהבה אמיתית נובעת מהכרת הנשמה שבכל אדם.",
        text: "לכן אמר רבי עקיבא 'ואהבת לרעך כמוך' – זה כלל גדול בתורה.",
        commentaries: ["אדמו\"ר הזקן", "מאורי החסידות"],
        reflectionPrompt: "איך התמקדות בנשמה שבאחרים משנה את יחסך אליהם?",
        sefariaLink: "https://www.sefaria.org/Tanya%2C_Likkutei_Amarim%2C_Chapter_32?lang=he"
      },
      {
        title: "חובות הלבבות שער הביטחון א – בטחון בה'",
        startRef: "חובות הלבבות שער הביטחון א",
        endRef: "א",
        summary: "רבי בחיי מסביר את מעלת הביטחון המלא בה' בלבד.",
        text: "מעלות הביטחון – מנוחת הנפש והסרת הדאגה מעסקי העולם.",
        commentaries: ["רבינו בחיי"],
        reflectionPrompt: "במה תוכל לבטוח יותר בהשגחת ה'?",
        sefariaLink: "https://www.sefaria.org/Chovot_HaLevavot%2C_Sha'ar_HaBitachon.1?lang=he"
      },
      {
        title: "נפש החיים א:ד – צלם אלוקים",
        startRef: "נפש החיים א:ד",
        endRef: "א:ד",
        summary: "ר' חיים מוולוז'ין מדגיש את כוח הנשמה להשפיע בעולמות.",
        text: "האדם נקרא עולם קטן כי כל העולמות תלויים במעשיו.",
        commentaries: ["ר' חיים"],
        reflectionPrompt: "כיצד מעשיך משפיעים על סביבתך הרוחנית?",
        sefariaLink: "https://www.sefaria.org/Nefesh_HaChaim.1.4?lang=he"
      },
      {
        title: "אורחות צדיקים – שער הכעס",
        startRef: "אורחות צדיקים שער הכעס",
        endRef: "שער הכעס",
        summary: "דרכים לשלוט בכעס ולפתח סבלנות.",
        text: "הכעס בוער בלב ומסלק את האדם מן הדעת.",
        commentaries: ["ספרי מוסר"],
        reflectionPrompt: "איזו עצה מסייעת לך להישאר רגוע?",
        sefariaLink: "https://www.sefaria.org/Orchot_Tzaddikim%2C_Gate_of_Anger?lang=he"
      }
    ]
  }
};

const getSourceForTopic = (topic: string, language: Language): SourceEntry => {
  let topicKey = topic as keyof typeof sourcesByTopic;
  if (topicKey === 'surprise') {
    const keys = Object.keys(sourcesByTopic) as Array<keyof typeof sourcesByTopic>;
    topicKey = keys[Math.floor(Math.random() * keys.length)];
  }
  const options = sourcesByTopic[topicKey]?.[language] || sourcesByTopic.spiritual[language];
  return options[Math.floor(Math.random() * options.length)];
};

export const SourceRecommendation = ({ 
  language, 
  timeSelected, 
  topicSelected, 
  onBack, 
  onReflection 
}: SourceRecommendationProps) => {
  const [currentSource, setCurrentSource] = useState<SourceEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const t = content[language];
  const isHebrew = language === 'he';
  const toast = useAppToast();

  // Initialize source on component mount or when topic/language changes
  useEffect(() => {
    const source = getSourceForTopic(topicSelected, language);
    setCurrentSource(source);
    setError(null);
  }, [topicSelected, language]);

  const generateNewSource = () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get all sources for the current topic
      const sources = sourcesByTopic[topicSelected]?.[language];
      if (!sources || sources.length === 0) {
        throw new Error('No sources available for this topic');
      }
      
      // Filter out current source to ensure we get a different one
      const availableSources = sources.filter(source => 
        currentSource ? source.title !== currentSource.title : true
      );
      
      if (availableSources.length === 0) {
        // If no different sources available, keep current one
        setError('No alternative sources available');
        setIsLoading(false);
        return;
      }
      
      // Select random source from available ones
      const randomIndex = Math.floor(Math.random() * availableSources.length);
      const newSource = availableSources[randomIndex];
      
      setCurrentSource(newSource);
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate new source');
      setIsLoading(false);
    }
  };

  const handleAction = (action: string) => {
    console.log(`Action: ${action}`);
    
    switch (action) {
      case 'skip':
        generateNewSource();
        break;
      case 'save':
        // TODO: Implement save functionality with Supabase
        toast.info('Source saved for later study', {
          description: 'This feature requires Supabase integration'
        });
        break;
      case 'learned':
        // TODO: Implement learned functionality with Supabase
        toast.success('Source marked as learned', {
          description: 'This feature requires Supabase integration'
        });
        break;
      case 'calendar':
        // TODO: Implement calendar integration
        toast.info('Calendar integration coming soon', {
          description: 'This feature requires backend setup'
        });
        break;
      case 'reflection':
        onReflection();
        break;
      default:
        console.warn(`Unknown action: ${action}`);
    }
  };

  // Show loading state if source is not yet loaded
  if (!currentSource && !error) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading source...</p>
        </div>
      </div>
    );
  }

  // Show error state if source failed to load
  if (error && !currentSource) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  const source = currentSource!;

  return (
    <div className={`min-h-screen bg-gradient-subtle p-4 pb-20 ${isHebrew ? 'hebrew' : ''}`}>
      <div className="max-w-4xl mx-auto py-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t.backButton}
          </Button>
          <div className="text-center">
            <BookOpen className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-sm text-muted-foreground">
              {timeSelected} min • {topicSelected}
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={() => handleAction('skip')}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
            ) : (
              <SkipForward className="h-4 w-4" />
            )}
            {isLoading ? 'Loading...' : t.skipButton}
          </Button>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t.title}
          </h1>
          <p className="text-muted-foreground">
            {t.subtitle}
          </p>
        </div>

        {/* Source Card */}
        <Card className="learning-card mb-8 bg-gradient-warm">
          <div className="space-y-6">
            {/* Source Title */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {source.title}
              </h2>
              <div className="text-sm text-muted-foreground">
                {t.fromTo} {source.startRef} {t.to} {source.endRef}
              </div>
            </div>

            {/* Summary */}
            <div>
              <p className="text-foreground leading-relaxed">
                {source.summary}
              </p>
            </div>

            {/* Main Text */}
            <div className="bg-card/50 rounded-lg p-6 border border-border/50">
              <p className={`text-spiritual ${isHebrew ? 'text-hebrew' : ''}`}>
                {source.text}
              </p>
            </div>

            {/* Commentaries */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">
                {t.commentariesLabel}
              </h3>
              <div className="flex flex-wrap gap-2">
                {source.commentaries.map((commentary, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                  >
                    {commentary}
                  </span>
                ))}
              </div>
            </div>

            {/* Reflection Prompt */}
            <div className="bg-accent/20 rounded-lg p-4 border border-accent/30">
              <h3 className="font-semibold text-accent-foreground mb-2">
                {t.reflectionPromptLabel}
              </h3>
              <p className="text-accent-foreground/80 leading-relaxed">
                {source.reflectionPrompt}
              </p>
            </div>

            {/* Sefaria Link */}
            <div className="text-center">
              <Button
                variant="outline"
                onClick={() => window.open(source.sefariaLink, '_blank')}
                className="btn-gentle"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                {t.sefariaLink}
              </Button>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button
            variant="outline"
            onClick={() => handleAction('save')}
            className="btn-gentle flex items-center gap-2"
          >
            <Heart className="h-4 w-4" />
            {t.saveButton}
          </Button>
          
          <Button
            variant="outline"
            onClick={() => handleAction('learned')}
            className="btn-gentle flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            {t.learnedButton}
          </Button>
          
          <Button
            variant="outline"
            onClick={() => handleAction('calendar')}
            className="btn-gentle flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            {t.calendarButton}
          </Button>
          
          <Button
            onClick={onReflection}
            className="btn-spiritual flex items-center gap-2"
          >
            <BookOpen className="h-4 w-4" />
            {t.reflectionButton}
          </Button>
        </div>
      </div>
    </div>
  );
};