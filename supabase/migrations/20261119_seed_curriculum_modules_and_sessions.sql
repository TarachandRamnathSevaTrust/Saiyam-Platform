-- ==============================================================================
-- SAIYAM PLATFORM: SEED 10 MODULES & 25 CURRICULUM SESSIONS
-- Official TRST Curriculum Definition
-- ==============================================================================

-- 1. Ensure extra columns exist on curriculum_sessions
ALTER TABLE public.curriculum_sessions
ADD COLUMN IF NOT EXISTS module_number INT,
ADD COLUMN IF NOT EXISTS module_name_mr TEXT,
ADD COLUMN IF NOT EXISTS module_name_en TEXT;

-- 2. Ensure RLS allows read and write for curriculum_sessions
ALTER TABLE public.curriculum_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all for curriculum_sessions" ON public.curriculum_sessions;
CREATE POLICY "Allow all for curriculum_sessions" ON public.curriculum_sessions FOR ALL USING (true) WITH CHECK (true);

-- 3. Upsert the 25 official sessions mapped to their respective modules
INSERT INTO public.curriculum_sessions (session_number, phase_number, title_mr, title_en, module_number, module_name_mr, module_name_en, description)
VALUES
(1, 1, 'प्रस्तावना', 'Introduction', 0, 'प्रस्तावना व ओळख', 'Orientation & Introduction', 'Orientation to Saiyam Program & Ground Rules'),
(2, 1, 'पंचकोश १', 'Panchakosh 1', 1, 'पंचकोश विकसन', 'Panchakosh', 'Panchakosh development part 1'),
(3, 1, 'पंचकोश २', 'Panchakosh 2', 1, 'पंचकोश विकसन', 'Panchakosh', 'Panchakosh development part 2'),
(4, 1, 'सौंदर्य', 'Beauty', 4, 'सौंदर्य', 'Beauty', 'Understanding real inner & outer beauty'),
(5, 1, 'आपले आरोग्य १', 'Our Health 1', 2, 'आपले आरोग्य', 'Our Health', 'Physical & mental health awareness part 1'),
(6, 1, 'आपले आरोग्य २', 'Our Health 2', 2, 'आपले आरोग्य', 'Our Health', 'Physical & mental health awareness part 2'),
(7, 1, 'आपले आरोग्य ३', 'Our Health 3', 2, 'आपले आरोग्य', 'Our Health', 'Physical & mental health awareness part 3'),
(8, 1, 'मैत्री १', 'Friendship 1', 6, 'मैत्री', 'Friendship', 'Healthy friendships, boundaries and peer support part 1'),
(9, 2, 'मैत्री २', 'Friendship 2', 6, 'मैत्री', 'Friendship', 'Healthy friendships, boundaries and peer support part 2'),
(10, 2, 'व्यसने १', 'Addictions 1', 9, 'स्वसंयम – व्यसन परावृत्ती', 'Self-Control – Addiction Prevention', 'Understanding substance and behavioral addiction part 1'),
(11, 2, 'व्यसने २', 'Addictions 2', 9, 'स्वसंयम – व्यसन परावृत्ती', 'Self-Control – Addiction Prevention', 'Resistance skills and anti-addiction strategies part 2'),
(12, 2, 'स्वनियमन १', 'Self Regulation 1', 10, 'स्वसंयम – स्वनियमन', 'Self-Control – Self-Regulation', 'Self-discipline, emotion regulation & impulse control part 1'),
(13, 2, 'स्वनियमन २', 'Self Regulation 2', 10, 'स्वसंयम – स्वनियमन', 'Self-Control – Self-Regulation', 'Self-discipline, emotion regulation & impulse control part 2'),
(14, 2, 'प्रसारमाध्यमे १', 'Mass Media 1', 5, 'प्रसारमाध्यमे', 'Mass Media', 'Media literacy, screen addiction & critical thinking part 1'),
(15, 2, 'प्रसारमाध्यमे २', 'Mass Media 2', 5, 'प्रसारमाध्यमे', 'Mass Media', 'Media literacy, screen addiction & critical thinking part 2'),
(16, 2, 'प्रसारमाध्यमे ३', 'Mass Media 3', 5, 'प्रसारमाध्यमे', 'Mass Media', 'Media literacy, screen addiction & critical thinking part 3'),
(17, 3, 'लैंगिक दुर्वर्तन १', 'Sexual Misconduct 1', 3, 'लैंगिक दुर्वर्तन', 'Sexual Misconduct', 'Consent, safety, POSCO awareness & boundary respect part 1'),
(18, 3, 'लैंगिक दुर्वर्तन २', 'Sexual Misconduct 2', 3, 'लैंगिक दुर्वर्तन', 'Sexual Misconduct', 'Consent, safety, POSCO awareness & boundary respect part 2'),
(19, 3, 'स्त्री-पुरुष परस्पर पूरकता १', 'Complementarity Between Men and Women 1', 7, 'स्त्री-पुरुष परस्पर पूरकता', 'Woman-Man Complementarity', 'Gender equality, mutual respect & complementary roles part 1'),
(20, 3, 'स्त्री-पुरुष परस्पर पूरकता २', 'Complementarity Between Men and Women 2', 7, 'स्त्री-पुरुष परस्पर पूरकता', 'Woman-Man Complementarity', 'Gender equality, mutual respect & complementary roles part 2'),
(21, 3, 'उद्दिष्टनिश्चिती आणि ताणतणाव १', 'Goal Setting and Stress 1', 8, 'ध्येयनिश्चिती व ताणतणावांशी सामना', 'Goal Setting & Facing Stress', 'Setting meaningful life goals & coping with academic/personal stress part 1'),
(22, 3, 'उद्दिष्टनिश्चिती आणि ताणतणाव २', 'Goal Setting and Stress 2', 8, 'ध्येयनिश्चिती व ताणतणावांशी सामना', 'Goal Setting & Facing Stress', 'Setting meaningful life goals & coping with academic/personal stress part 2'),
(23, 3, 'संकलन व उजळणी', 'Summary & Review', 11, 'संकलन, प्रश्नोत्तरे, उत्तरचाचणी', 'Summary, Q&A & Post-Test', 'Curriculum synthesis, revision and student key takeaways'),
(24, 3, 'प्रश्नोत्तरे व शंकासमाधान', 'Q&A and Discussion', 11, 'संकलन, प्रश्नोत्तरे, उत्तरचाचणी', 'Summary, Q&A & Post-Test', 'Open discussion forum, clearing student doubts & reflections'),
(25, 3, 'उत्तरचाचणी व समारोप', 'Post-Test & Evaluation', 11, 'संकलन, प्रश्नोत्तरे, उत्तरचाचणी', 'Summary, Q&A & Post-Test', 'Conducting Post-Test assessments & program closing')
ON CONFLICT (session_number) DO UPDATE SET
  title_mr = EXCLUDED.title_mr,
  title_en = EXCLUDED.title_en,
  module_number = EXCLUDED.module_number,
  module_name_mr = EXCLUDED.module_name_mr,
  module_name_en = EXCLUDED.module_name_en,
  description = EXCLUDED.description;
