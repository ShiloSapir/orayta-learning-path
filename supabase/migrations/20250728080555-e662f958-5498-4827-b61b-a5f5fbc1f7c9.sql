-- Enhance sources table with new columns for better categorization and filtering
ALTER TABLE public.sources 
ADD COLUMN difficulty_level text DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
ADD COLUMN source_type text DEFAULT 'text_study' CHECK (source_type IN ('text_study', 'practical_halacha', 'philosophical', 'historical', 'mystical')),
ADD COLUMN language_preference text DEFAULT 'both' CHECK (language_preference IN ('english', 'hebrew', 'both')),
ADD COLUMN min_time integer DEFAULT 5 CHECK (min_time >= 5),
ADD COLUMN max_time integer DEFAULT 60 CHECK (max_time <= 60),
ADD COLUMN learning_objectives text[] DEFAULT '{}',
ADD COLUMN prerequisites text[] DEFAULT '{}';

-- Add constraint to ensure max_time >= min_time
ALTER TABLE public.sources 
ADD CONSTRAINT check_time_range CHECK (max_time >= min_time);

-- Update existing sources to have proper time ranges
UPDATE public.sources SET 
  min_time = CASE 
    WHEN estimated_time <= 10 THEN 5
    WHEN estimated_time <= 20 THEN 10
    WHEN estimated_time <= 30 THEN 20
    ELSE 30
  END,
  max_time = CASE 
    WHEN estimated_time <= 10 THEN 15
    WHEN estimated_time <= 20 THEN 25
    WHEN estimated_time <= 30 THEN 35
    ELSE 60
  END;

-- Insert comprehensive source collection covering all topics and time ranges

-- HALACHA SOURCES (daily_practice)
INSERT INTO public.sources (
  title, title_he, category, subcategory, start_ref, end_ref, 
  sefaria_link, text_excerpt, text_excerpt_he, reflection_prompt, reflection_prompt_he,
  estimated_time, min_time, max_time, difficulty_level, source_type, language_preference,
  learning_objectives, published
) VALUES 
(
  'Morning Blessings: Starting Your Day with Gratitude',
  'ברכות השחר: התחלת היום בהכרת הטוב',
  'halacha',
  'daily_practice',
  'Berakhot 60b',
  'Berakhot 61a',
  'https://www.sefaria.org/Berakhot.60b-61a',
  'The morning blessings help us begin each day with awareness and gratitude for the basic gifts of life.',
  'ברכות השחר עוזרות לנו להתחיל כל יום במודעות ובהכרת טובה על מתנות החיים הבסיסיות.',
  'How can incorporating morning blessings transform your daily routine and mindset?',
  'כיצד שילוב ברכות השחר יכול לשנות את השגרה והחשיבה היומיומית שלך?',
  10, 5, 15, 'beginner', 'practical_halacha', 'both',
  ARRAY['Daily spiritual practice', 'Gratitude cultivation', 'Morning routine'],
  true
),
(
  'The Art of Handwashing: Netilat Yadayim',
  'אמנות נטילת ידיים',
  'halacha',
  'daily_practice',
  'Orach Chaim 158',
  'Orach Chaim 162',
  'https://www.sefaria.org/Shulchan_Arukh,_Orach_Chayim.158',
  'The laws of washing hands before eating bread connect us to spiritual purity and mindful eating.',
  'הלכות נטילת ידיים לפני אכילת לחם מחברות אותנו לטהרה רוחנית ולאכילה מודעת.',
  'What spiritual significance do you find in the simple act of washing hands?',
  'איזה משמעות רוחנית אתה מוצא במעשה הפשוט של נטילת ידיים?',
  8, 5, 12, 'beginner', 'practical_halacha', 'both',
  ARRAY['Ritual awareness', 'Mindful eating', 'Daily mitzvot'],
  true
),
(
  'Mezuzah: The Doorway to Jewish Consciousness',
  'מזוזה: השער לתודעה יהודית',
  'halacha',
  'daily_practice',
  'Yoreh Deah 285',
  'Yoreh Deah 291',
  'https://www.sefaria.org/Shulchan_Arukh,_Yoreh_De\'ah.285',
  'The mezuzah serves as a constant reminder of our values and commitments every time we enter or leave our homes.',
  'המזוזה משמשת כתזכורת קבועה לערכים ולמחויבויות שלנו בכל פעם שאנו נכנסים או יוצאים מהבית.',
  'How does the mezuzah on your doorpost influence your daily transitions between home and world?',
  'כיצד המזוזה על המשקוף משפיעה על המעברים היומיומיים שלך בין הבית לעולם?',
  12, 8, 18, 'intermediate', 'practical_halacha', 'both',
  ARRAY['Home sanctification', 'Jewish identity', 'Constant awareness'],
  true
),

-- HALACHA SOURCES (shabbat)
(
  'Candle Lighting: Bringing Peace into Your Home',
  'הדלקת נרות: הבאת שלום לבית',
  'halacha',
  'shabbat',
  'Orach Chaim 263',
  'Orach Chaim 264',
  'https://www.sefaria.org/Shulchan_Arukh,_Orach_Chayim.263',
  'The mitzvah of lighting Shabbat candles creates an atmosphere of peace, joy, and sanctity in the home.',
  'מצוות הדלקת נרות שבת יוצרת אווירה של שלום, שמחה וקדושה בבית.',
  'What transformation do you notice in your home atmosphere when Shabbat candles are lit?',
  'איזה שינוי אתה מבחין באווירת הבית כאשר נרות שבת דולקים?',
  15, 10, 20, 'beginner', 'practical_halacha', 'both',
  ARRAY['Shabbat preparation', 'Home atmosphere', 'Family traditions'],
  true
),
(
  'Kiddush: Sanctifying Time Through Wine',
  'קידוש: קידוש הזמן באמצעות יין',
  'halacha',
  'shabbat',
  'Orach Chaim 271',
  'Orach Chaim 273',
  'https://www.sefaria.org/Shulchan_Arukh,_Orach_Chayim.271',
  'Kiddush over wine sanctifies the Shabbat and marks the transition from ordinary time to sacred time.',
  'קידוש על היין מקדש את השבת ומסמן את המעבר מזמן רגיל לזמן קדוש.',
  'How does the ritual of Kiddush help you transition into Shabbat consciousness?',
  'כיצד טקס הקידוש עוזר לך לעבור לתודעת השבת?',
  18, 12, 25, 'intermediate', 'practical_halacha', 'both',
  ARRAY['Time sanctification', 'Ritual consciousness', 'Shabbat joy'],
  true
),

-- RAMBAM SOURCES (hilchot_deot)
(
  'The Middle Path: Balanced Character Development',
  'דרך האמצע: פיתוח אופי מאוזן',
  'rambam',
  'hilchot_deot',
  'Hilchot Deot 1:4',
  'Hilchot Deot 2:1',
  'https://www.sefaria.org/Mishneh_Torah,_Human_Dispositions.1.4',
  'Rambam teaches that the ideal character traits lie in the middle path between extremes.',
  'הרמב"ם מלמד שתכונות האופי האידיאליות נמצאות בדרך האמצע בין קיצוניות.',
  'Which character trait would benefit most from finding your personal middle path?',
  'איזו תכונת אופי הכי תרוויח ממציאת דרך האמצע האישית שלך?',
  20, 15, 30, 'intermediate', 'philosophical', 'both',
  ARRAY['Character development', 'Self-improvement', 'Balanced living'],
  true
),
(
  'Anger Management: The Rambam\'s Approach',
  'ניהול כעס: הגישה של הרמב"ם',
  'rambam',
  'hilchot_deot',
  'Hilchot Deot 2:3',
  'Hilchot Deot 2:4',
  'https://www.sefaria.org/Mishneh_Torah,_Human_Dispositions.2.3',
  'Rambam provides practical guidance for overcoming anger and developing patience.',
  'הרמב"ם מספק הדרכה מעשית להתגברות על כעס ולפיתוח סבלנות.',
  'What practical steps can you take today to implement Rambam\'s advice about anger?',
  'אילו צעדים מעשיים תוכל לנקוט היום ליישום עצת הרמב"ם בנוגע לכעס?',
  25, 18, 35, 'intermediate', 'practical_halacha', 'both',
  ARRAY['Emotional regulation', 'Self-control', 'Practical wisdom'],
  true
),

-- TANAKH SOURCES (weekly_portion)
(
  'Abraham\'s Hospitality: Lessons in Kindness',
  'הכנסת אורחים של אברהם: לקחים בחסד',
  'tanakh',
  'weekly_portion',
  'Genesis 18:1',
  'Genesis 18:8',
  'https://www.sefaria.org/Genesis.18.1-8',
  'Abraham\'s eagerness to welcome strangers teaches us about the value of hospitality and kindness.',
  'הנכונות של אברהם לקבל זרים מלמדת אותנו על ערך ההכנסת אורחים והחסד.',
  'How can you incorporate Abraham\'s model of hospitality into your daily life?',
  'כיצד תוכל לשלב את מודל ההכנסת אורחים של אברהם בחיי היומיום שלך?',
  15, 10, 22, 'beginner', 'text_study', 'both',
  ARRAY['Acts of kindness', 'Hospitality', 'Character modeling'],
  true
),
(
  'Jacob\'s Dream: Connecting Heaven and Earth',
  'חלום יעקב: חיבור שמים וארץ',
  'tanakh',
  'weekly_portion',
  'Genesis 28:10',
  'Genesis 28:22',
  'https://www.sefaria.org/Genesis.28.10-22',
  'Jacob\'s vision of the ladder teaches us about the connection between spiritual and physical realms.',
  'חזון הסולם של יעקב מלמד אותנו על הקשר בין העולם הרוחני והפיזי.',
  'Where do you see "ladders" connecting heaven and earth in your own life?',
  'איפה אתה רואה "סולמות" המחברים בין שמים וארץ בחיים שלך?',
  22, 15, 30, 'intermediate', 'philosophical', 'both',
  ARRAY['Spiritual connection', 'Dreams and vision', 'Sacred places'],
  true
),

-- TALMUD SOURCES (pirkei_avot)
(
  'Who is Wise? Learning from Everyone',
  'איזהו חכם? הלומד מכל אדם',
  'talmud',
  'pirkei_avot',
  'Pirkei Avot 4:1',
  'Pirkei Avot 4:1',
  'https://www.sefaria.org/Pirkei_Avot.4.1',
  'Ben Zoma teaches that true wisdom comes from being open to learning from every person we encounter.',
  'בן זומא מלמד שחכמה אמיתית באה מהיותנו פתוחים ללמוד מכל אדם שאנו פוגשים.',
  'Think of someone unexpected who taught you something valuable. What did you learn?',
  'חשוב על מישהו לא צפוי שלימד אותך משהו יקר. מה למדת?',
  12, 8, 18, 'beginner', 'philosophical', 'both',
  ARRAY['Humility', 'Continuous learning', 'Open-mindedness'],
  true
),
(
  'In a Place Where There Are No People',
  'במקום שאין אנשים',
  'talmud',
  'pirkei_avot',
  'Pirkei Avot 2:5',
  'Pirkei Avot 2:5',
  'https://www.sefaria.org/Pirkei_Avot.2.5',
  'Hillel teaches about stepping up to leadership when no one else will take responsibility.',
  'הלל מלמד על לקיחת אחריות והנהגה כאשר אף אחד אחר לא נוטל אחריות.',
  'When have you needed to "be a person" in a place where there were no people?',
  'מתי היית צריך "להיות אדם" במקום שלא היו אנשים?',
  16, 12, 25, 'intermediate', 'philosophical', 'both',
  ARRAY['Leadership', 'Responsibility', 'Moral courage'],
  true
),

-- SPIRITUAL GROWTH SOURCES (mussar)
(
  'The Practice of Self-Examination',
  'תרגיל חשבון הנפש',
  'spiritual',
  'mussar',
  'Shaarei Teshuvah 1:1',
  'Shaarei Teshuvah 1:5',
  'https://www.sefaria.org/Shaarei_Teshuvah.1.1',
  'Regular self-examination helps us grow in awareness and make positive changes in our character.',
  'חשבון הנפש קבוע עוזר לנו לגדול במודעות ולבצע שינויים חיוביים באופי שלנו.',
  'What pattern in your behavior would you like to examine more closely this week?',
  'איזה דפוס בהתנהגות שלך היית רוצה לבחון מקרוב השבוע?',
  18, 12, 28, 'intermediate', 'practical_halacha', 'both',
  ARRAY['Self-awareness', 'Personal growth', 'Spiritual practice'],
  true
),

-- SURPRISE ME SOURCES (Mixed)
(
  'The Power of Small Acts: Rambam on Charity',
  'כוח המעשים הקטנים: הרמב"ם על צדקה',
  'surprise',
  'Mixed Topics',
  'Hilchot Matanot Aniyim 10:7',
  'Hilchot Matanot Aniyim 10:14',
  'https://www.sefaria.org/Mishneh_Torah,_Gifts_to_the_Poor.10.7',
  'Even the smallest act of giving, when done consistently, can transform both giver and receiver.',
  'אפילו מעשה הנתינה הקטן ביותר, כאשר נעשה בעקביות, יכול לשנות הן את הנותן והן את המקבל.',
  'What small act of kindness could you commit to doing regularly?',
  'איזה מעשה קטן של חסד תוכל להתחייב לעשות באופן קבוע?',
  14, 10, 20, 'beginner', 'practical_halacha', 'both',
  ARRAY['Charity', 'Consistency', 'Social responsibility'],
  true
);

-- Add more sources for different time ranges
INSERT INTO public.sources (
  title, title_he, category, subcategory, start_ref, end_ref, 
  sefaria_link, text_excerpt, text_excerpt_he, reflection_prompt, reflection_prompt_he,
  estimated_time, min_time, max_time, difficulty_level, source_type, language_preference,
  learning_objectives, published
) VALUES 
-- Quick 5-minute sources
(
  'One Minute of Gratitude: The Shehecheyanu Blessing',
  'דקה של הכרת טובה: ברכת שהחיינו',
  'halacha',
  'daily_practice',
  'Orach Chaim 225',
  'Orach Chaim 225',
  'https://www.sefaria.org/Shulchan_Arukh,_Orach_Chayim.225',
  'The Shehecheyanu blessing helps us appreciate new and special moments in life.',
  'ברכת שהחיינו עוזרת לנו להעריך רגעים חדשים ומיוחדים בחיים.',
  'What recent "first time" experience deserves a moment of gratitude?',
  'איזו חוויה "בפעם הראשונה" מהזמן האחרון ראויה לרגע של הכרת טובה?',
  5, 5, 8, 'beginner', 'practical_halacha', 'both',
  ARRAY['Gratitude practice', 'Mindfulness', 'Blessing awareness'],
  true
),

-- Extended 45-60 minute sources  
(
  'Deep Dive: The Philosophy of Shabbat',
  'צלילה עמוקה: פילוסופיית השבת',
  'halacha',
  'shabbat',
  'Orach Chaim 242',
  'Orach Chaim 244',
  'https://www.sefaria.org/Shulchan_Arukh,_Orach_Chayim.242',
  'An in-depth exploration of how Shabbat observance connects us to creation, freedom, and divine partnership.',
  'חקירה מעמיקה של האופן שבו שמירת שבת מחברת אותנו לבריאה, לחופש ולשותפות אלוהית.',
  'How does your Shabbat practice reflect your understanding of creation, freedom, and partnership with the divine?',
  'כיצד תרגול השבת שלך משקף את ההבנה שלך של בריאה, חופש ושותפות עם האלוהי?',
  50, 45, 60, 'advanced', 'philosophical', 'both',
  ARRAY['Shabbat philosophy', 'Creation theology', 'Spiritual freedom'],
  true
),
(
  'Comprehensive Study: Rambam\'s Guide to Repentance',
  'לימוד מקיף: מדריך הרמב"ם לתשובה',
  'rambam',
  'hilchot_teshuva',
  'Hilchot Teshuva 1:1',
  'Hilchot Teshuva 2:10',
  'https://www.sefaria.org/Mishneh_Torah,_Repentance.1.1',
  'A comprehensive exploration of the process, psychology, and spiritual dimensions of repentance according to Maimonides.',
  'חקירה מקיפה של התהליך, הפסיכולוגיה והממדים הרוחניים של התשובה לפי הרמב"ם.',
  'What aspects of Rambam\'s approach to repentance resonate most with your personal spiritual journey?',
  'אילו היבטים בגישת הרמב"ם לתשובה מהדהדים הכי הרבה עם המסע הרוחני האישי שלך?',
  55, 45, 60, 'advanced', 'philosophical', 'both',
  ARRAY['Repentance process', 'Spiritual psychology', 'Personal transformation'],
  true
);