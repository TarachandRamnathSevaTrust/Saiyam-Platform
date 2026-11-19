-- ==============================================================================
-- SAIYAM PLATFORM: MASTER CURRICULUM MODULES & SESSIONS MAPPING (FINAL DATA)
-- Dual Language Support: Marathi (मराठी) & English (इंग्रजी)
-- ==============================================================================

-- 1. Create CURRICULUM MODULES table (१० अधिकृत अभ्यासक्रम विभाग)
CREATE TABLE IF NOT EXISTS public.curriculum_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_number INT UNIQUE NOT NULL,
    name_mr TEXT NOT NULL,
    name_en TEXT NOT NULL,
    description_mr TEXT,
    description_en TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Ensure CURRICULUM SESSIONS table has all Marathi & English columns
CREATE TABLE IF NOT EXISTS public.curriculum_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_number INT UNIQUE NOT NULL CHECK (session_number BETWEEN 1 AND 25),
    phase_number INT NOT NULL DEFAULT 1 CHECK (phase_number BETWEEN 1 AND 3),
    title_mr TEXT NOT NULL,
    title_en TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add any missing Marathi and English columns to curriculum_sessions
ALTER TABLE public.curriculum_sessions
ADD COLUMN IF NOT EXISTS module_number INT REFERENCES public.curriculum_modules(module_number) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS module_name_mr TEXT,
ADD COLUMN IF NOT EXISTS module_name_en TEXT,
ADD COLUMN IF NOT EXISTS session_name_mr TEXT,
ADD COLUMN IF NOT EXISTS session_name_en TEXT,
ADD COLUMN IF NOT EXISTS description_mr TEXT,
ADD COLUMN IF NOT EXISTS description_en TEXT;

-- 3. Enable RLS and Grant Permissions
ALTER TABLE public.curriculum_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for curriculum_modules" ON public.curriculum_modules;
CREATE POLICY "Allow all for curriculum_modules" ON public.curriculum_modules FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for curriculum_sessions" ON public.curriculum_sessions;
CREATE POLICY "Allow all for curriculum_sessions" ON public.curriculum_sessions FOR ALL USING (true) WITH CHECK (true);

GRANT ALL ON public.curriculum_modules TO anon, authenticated, service_role;
GRANT ALL ON public.curriculum_sessions TO anon, authenticated, service_role;

-- ==============================================================================
-- 4. SEED ALL MODULES (इंग्रजी व मराठी नावे)
-- ==============================================================================
INSERT INTO public.curriculum_modules (module_number, name_mr, name_en, description_mr, description_en)
VALUES
(0, 'प्रस्तावना व ओळख', 'Orientation & Introduction', 'संयम उपक्रम ओळख व नियमावली', 'Saiyam Program Overview & Ground Rules'),
(1, 'पंचकोश विकसन', 'Panchakosh', 'अन्नमय, प्राणमय, मनोमय, विज्ञानमय आणि आनंदमय कोश विकास', 'Development of the five sheaths of human personality'),
(2, 'आपले आरोग्य', 'Our Health', 'शारीरिक व मानसिक आरोग्य, पोषण व व्यायाम', 'Physical and mental health, nutrition and fitness'),
(3, 'लैंगिक दुर्वर्तन', 'Sexual Misconduct', 'सुरक्षितता, संमती व पोक्सो जनजागृती', 'Safety, consent, and POCSO awareness'),
(4, 'सौंदर्य', 'Beauty', 'आंतरिक व बाह्य सौंदर्य, दृष्टिकोन', 'Inner and outer beauty and positive self-image'),
(5, 'प्रसारमाध्यमे', 'Mass Media', 'माध्यम साक्षरता, स्क्रीन नियंत्रण व डिजिटल संयम', 'Media literacy, screen addiction and digital balance'),
(6, 'मैत्री', 'Friendship', 'सकारात्मक मैत्री, सीमा व सहकार्य', 'Healthy peer relationships, boundaries and trust'),
(7, 'स्त्री-पुरुष परस्पर पूरकता', 'Woman-Man Complementarity', 'समानता, परस्पर आदर व सहजीवन', 'Gender equality, mutual respect and cooperation'),
(8, 'ध्येयनिश्चिती व ताणतणावांशी सामना', 'Goal Setting & Facing Stress', 'ध्येय निश्चित करणे व परीक्षेचा ताण व्यवस्थापन', 'Goal setting and healthy stress management'),
(9, 'स्वसंयम – व्यसन परावृत्ती', 'Self-Control – Addiction Prevention', 'व्यसनमुक्ती, परावृत्ती व नकार देण्याचे कौशल्य', 'Addiction prevention and refusal skills'),
(10, 'स्वसंयम – स्वनियमन', 'Self-Control – Self-Regulation', 'आत्मनियंत्रण, भावना नियमन व अनुशासन', 'Self-discipline and emotional self-regulation'),
(11, 'संकलन, प्रश्नोत्तरे, उत्तरचाचणी', 'Summary, Q&A and Post-Test', 'अभ्यासक्रम उजळणी, शंका समाधान व अंतिम मूल्यमापन', 'Curriculum synthesis, open discussion and evaluation')
ON CONFLICT (module_number) DO UPDATE SET
  name_mr = EXCLUDED.name_mr,
  name_en = EXCLUDED.name_en,
  description_mr = EXCLUDED.description_mr,
  description_en = EXCLUDED.description_en;

-- ==============================================================================
-- 5. SEED ALL 25 SESSIONS WITH MODULE MAPPINGS (इंग्रजी व मराठी नावे)
-- ==============================================================================
INSERT INTO public.curriculum_sessions (
    session_number,
    phase_number,
    module_number,
    module_name_mr,
    module_name_en,
    title_mr,
    title_en,
    session_name_mr,
    session_name_en,
    description_mr,
    description_en
)
VALUES
-- Session 1
(1, 1, 0, 'प्रस्तावना व ओळख', 'Orientation & Introduction',
 'प्रस्तावना', 'Introduction',
 'प्रस्तावना', 'Introduction',
 'संयम उपक्रमाची ओळख, उद्दिष्टे व वर्ग नियमावली निश्चित करणे',
 'Introduction to Saiyam Program, core objectives and group norms'),

-- Session 2
(2, 1, 1, 'पंचकोश विकसन', 'Panchakosh',
 'पंचकोश १', 'Panchakosh 1',
 'पंचकोश १', 'Panchakosh 1',
 'पंचकोश संकल्पनेची ओळख: अन्नमय व प्राणमय कोश',
 'Introduction to Panchakosh concept: Annamaya and Pranamaya Kosha'),

-- Session 3
(3, 1, 1, 'पंचकोश विकसन', 'Panchakosh',
 'पंचकोश २', 'Panchakosh 2',
 'पंचकोश २', 'Panchakosh 2',
 'मनोमय, विज्ञानमय व आनंदमय कोश विकास',
 'Development of Manomaya, Vijnanamaya and Anandamaya Kosha'),

-- Session 4
(4, 1, 4, 'सौंदर्य', 'Beauty',
 'सौंदर्य', 'Beauty',
 'सौंदर्य', 'Beauty',
 'खरे सौंदर्य: बाह्य रूपापलीकडचे आंतरिक गुण व व्यक्तिमत्त्व',
 'Real beauty: inner virtues and personality beyond physical looks'),

-- Session 5
(5, 1, 2, 'आपले आरोग्य', 'Our Health',
 'आपले आरोग्य १', 'Our Health 1',
 'आपले आरोग्य १', 'Our Health 1',
 'शारीरिक आरोग्य, योग्य आहार व व्यक्तिगत स्वच्छता',
 'Physical health, balanced diet and personal hygiene'),

-- Session 6
(6, 1, 2, 'आपले आरोग्य', 'Our Health',
 'आपले आरोग्य २', 'Our Health 2',
 'आपले आरोग्य २', 'Our Health 2',
 'मानसिक आरोग्य, सकारात्मक विचार व भावनांचे संतुलन',
 'Mental health, positive thinking and emotional well-being'),

-- Session 7
(7, 1, 2, 'आपले आरोग्य', 'Our Health',
 'आपले आरोग्य ३', 'Our Health 3',
 'आपले आरोग्य ३', 'Our Health 3',
 'शारीरिक व्यायाम, योग, प्राणायाम व दैनंदिन दिनचर्या',
 'Exercise, yoga, pranayama and healthy daily routine'),

-- Session 8
(8, 1, 6, 'मैत्री', 'Friendship',
 'मैत्री १', 'Friendship 1',
 'मैत्री १', 'Friendship 1',
 'चांगली मैत्री कशी ओळखावी? मित्रांची निवड व विश्वास',
 'Understanding true friendship, choosing friends and building trust'),

-- Session 9
(9, 2, 6, 'मैत्री', 'Friendship',
 'मैत्री २', 'Friendship 2',
 'मैत्री २', 'Friendship 2',
 'मैत्रीतील मर्यादा, सहकाऱ्यांचा दबाव (Peer Pressure) हाताळणे',
 'Boundaries in friendship and resisting negative peer pressure'),

-- Session 10
(10, 2, 9, 'स्वसंयम – व्यसन परावृत्ती', 'Self-Control – Addiction Prevention',
 'व्यसने १', 'Addictions 1',
 'व्यसने १', 'Addictions 1',
 'व्यसनांची विविध रूपे (तंबाखू, गुटखा, दारू, सिगारेट) व दुष्परिणाम',
 'Forms of chemical addictions and their physical/social harms'),

-- Session 11
(11, 2, 9, 'स्वसंयम – व्यसन परावृत्ती', 'Self-Control – Addiction Prevention',
 'व्यसने २', 'Addictions 2',
 'व्यसने २', 'Addictions 2',
 'व्यसनांना ठामपणे "नाही" म्हणण्याचे कौशल्य व व्यसनमुक्ती मार्ग',
 'Assertive refusal skills to say "NO" and anti-addiction pathways'),

-- Session 12
(12, 2, 10, 'स्वसंयम – स्वनियमन', 'Self-Control – Self-Regulation',
 'स्वनियमन १', 'Self Regulation 1',
 'स्वनियमन १', 'Self Regulation 1',
 'राग व संताप नियंत्रण, मनाची एकाग्रता',
 'Anger management, impulse control and focus'),

-- Session 13
(13, 2, 10, 'स्वसंयम – स्वनियमन', 'Self-Control – Self-Regulation',
 'स्वनियमन २', 'Self Regulation 2',
 'स्वनियमन २', 'Self Regulation 2',
 'वेळेचे नियोजन, शिस्त व स्वतःवर नियंत्रण ठेवण्याची सवय',
 'Time management, self-discipline and habitual restraint'),

-- Session 14
(14, 2, 5, 'प्रसारमाध्यमे', 'Mass Media',
 'प्रसारमाध्यमे १', 'Mass Media 1',
 'प्रसारमाध्यमे १', 'Mass Media 1',
 'प्रसारमाध्यमांचा (टीव्ही, सोशल मीडिया) किशोरवयावरील प्रभाव',
 'Influence of mass media and social apps on adolescents'),

-- Session 15
(15, 2, 5, 'प्रसारमाध्यमे', 'Mass Media',
 'प्रसारमाध्यमे २', 'Mass Media 2',
 'प्रसारमाध्यमे २', 'Mass Media 2',
 'मोबाईल व इंटरनेटचे व्यसन, सायबर सुरक्षा',
 'Smartphone/gaming screen addiction and cyber safety rules'),

-- Session 16
(16, 2, 5, 'प्रसारमाध्यमे', 'Mass Media',
 'प्रसारमाध्यमे ३', 'Mass Media 3',
 'प्रसारमाध्यमे ३', 'Mass Media 3',
 'योग्य माहितीची निवड, डिजिटल डिटॉक्स व स्क्रीन टाईम नियंत्रण',
 'Critical content consumption, digital detox and screen limits'),

-- Session 17
(17, 3, 3, 'लैंगिक दुर्वर्तन', 'Sexual Misconduct',
 'लैंगिक दुर्वर्तन १', 'Sexual Misconduct 1',
 'लैंगिक दुर्वर्तन १', 'Sexual Misconduct 1',
 'चांगला स्पर्श - वाईट स्पर्श (Good Touch - Bad Touch) व सुरक्षितता',
 'Safe touch vs unsafe touch and personal physical safety'),

-- Session 18
(18, 3, 3, 'लैंगिक दुर्वर्तन', 'Sexual Misconduct',
 'लैंगिक दुर्वर्तन २', 'Sexual Misconduct 2',
 'लैंगिक दुर्वर्तन २', 'Sexual Misconduct 2',
 'पोक्सो (POCSO) कायदा, मदत मागण्‍याची हिंमत व चाईल्ड हेल्पलाईन',
 'POCSO awareness, speaking up against abuse and Childline support'),

-- Session 19
(19, 3, 7, 'स्त्री-पुरुष परस्पर पूरकता', 'Woman-Man Complementarity',
 'स्त्री-पुरुष परस्पर पूरकता १', 'Complementarity Between Men and Women 1',
 'स्त्री-पुरुष परस्पर पूरकता १', 'Complementarity Between Men and Women 1',
 'स्त्री व पुरुष दोघांचेही समान महत्त्व व परस्पर आदर',
 'Equal dignity of girls and boys and mutual respect in daily life'),

-- Session 20
(20, 3, 7, 'स्त्री-पुरुष परस्पर पूरकता', 'Woman-Man Complementarity',
 'स्त्री-पुरुष परस्पर पूरकता २', 'Complementarity Between Men and Women 2',
 'स्त्री-पुरुष परस्पर पूरकता २', 'Complementarity Between Men and Women 2',
 'रूढीवादी लिंगभेद मोडीत काढणे व सहकार्यपूर्ण नाते',
 'Overcoming gender stereotypes and cooperative partnership'),

-- Session 21
(21, 3, 8, 'ध्येयनिश्चिती व ताणतणावांशी सामना', 'Goal Setting & Facing Stress',
 'उद्दिष्टनिश्चिती आणि ताणतणाव १', 'Goal Setting and Stress 1',
 'उद्दिष्टनिश्चिती आणि ताणतणाव १', 'Goal Setting and Stress 1',
 'जीवनात ध्येय कसे ठरवावे? स्मार्ट (SMART) उद्दिष्टे',
 'How to set meaningful life goals (SMART goals framework)'),

-- Session 22
(22, 3, 8, 'ध्येयनिश्चिती व ताणतणावांशी सामना', 'Goal Setting & Facing Stress',
 'उद्दिष्टनिश्चिती आणि ताणतणाव २', 'Goal Setting and Stress 2',
 'उद्दिष्टनिश्चिती आणि ताणतणाव २', 'Goal Setting and Stress 2',
 'परीक्षेचा ताण, अपयशाची भीती व ताणतणावावर मात करणे',
 'Overcoming exam anxiety, fear of failure and resilience'),

-- Session 23
(23, 3, 11, 'संकलन, प्रश्नोत्तरे, उत्तरचाचणी', 'Summary, Q&A and Post-Test',
 'संकलन व उजळणी', 'Summary & Review',
 'संकलन व उजळणी', 'Summary & Review',
 'सर्व सत्रांमधील शिकवणुकीचे संकलन, विद्यार्थ्यांचे अनुभव कथन',
 'Comprehensive review of all 22 core sessions and student learnings'),

-- Session 24
(24, 3, 11, 'संकलन, प्रश्नोत्तरे, उत्तरचाचणी', 'Summary, Q&A and Post-Test',
 'प्रश्नोत्तरे व शंकासमाधान', 'Q&A and Discussion',
 'प्रश्नोत्तरे व शंकासमाधान', 'Q&A and Discussion',
 'विद्यार्थ्यांच्या मनातील शंकांचे निरसन व मार्गदर्शक चर्चा',
 'Open forum for answering student queries and guidance'),

-- Session 25
(25, 3, 11, 'संकलन, प्रश्नोत्तरे, उत्तरचाचणी', 'Summary, Q&A and Post-Test',
 'उत्तरचाचणी व समारोप', 'Post-Test & Evaluation',
 'उत्तरचाचणी व समारोप', 'Post-Test & Evaluation',
 'उत्तरचाचणी (Post-Test) परीक्षा, प्रमाणपत्र वाटप व उपक्रमाचा समारोप',
 'Conducting final post-test assessment and program closing celebration')

ON CONFLICT (session_number) DO UPDATE SET
  phase_number = EXCLUDED.phase_number,
  module_number = EXCLUDED.module_number,
  module_name_mr = EXCLUDED.module_name_mr,
  module_name_en = EXCLUDED.module_name_en,
  title_mr = EXCLUDED.title_mr,
  title_en = EXCLUDED.title_en,
  session_name_mr = EXCLUDED.session_name_mr,
  session_name_en = EXCLUDED.session_name_en,
  description_mr = EXCLUDED.description_mr,
  description_en = EXCLUDED.description_en;
