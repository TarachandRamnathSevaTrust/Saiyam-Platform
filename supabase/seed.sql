-- ==============================================================================
-- SAIYAM PLATFORM: SEED DATA (25 SESSIONS & STANDARD PAPERS)
-- ==============================================================================

-- 1. Pre-seed All 25 Curriculum Sessions (संयम सत्रांचा आराखडा संच)
INSERT INTO public.curriculum_sessions (session_number, title_mr, title_en, description) VALUES
(1, 'सत्र १. प्रस्तावना आणि पूर्व चाचण्या', 'Session 1: Introduction & Pre-Tests', 'Orientation, introduction to Saiyam, and administration of MKMH, MMAT, ERT pre-assessments.'),
(2, 'सत्र २. पंचकोश - १ (अन्नमय व प्राणमय कोश)', 'Session 2: Panchkosha - Part 1', 'Understanding the physical and vital energy layers of self-development.'),
(3, 'सत्र ३. पंचकोश - २ (मनोमय, विज्ञानमय व आनंदमय कोश)', 'Session 3: Panchkosha - Part 2', 'Exploring thoughts, intellect, and internal joy/resilience.'),
(4, 'सत्र ४. सौंदर्य आणि आत्मप्रतिष्ठा', 'Session 4: Beauty & Self-Esteem', 'Deconstructing societal beauty myths and building inner confidence.'),
(5, 'सत्र ५. आपले आरोग्य - १ (शारीरिक आरोग्य व पोषण)', 'Session 5: Our Health - Part 1', 'Physical well-being, nutrition, and healthy bodily habits.'),
(6, 'सत्र ६. आपले आरोग्य - २ (व्यसनांचे दुष्परिणाम)', 'Session 6: Our Health - Part 2', 'Medical realities of tobacco, alcohol, and drug misuse.'),
(7, 'सत्र ७. आपले आरोग्य - ३ (स्क्रीन व डिजिटल व्यसन)', 'Session 7: Our Health - Part 3', 'Healthy screen time boundaries and gaming/social media discipline.'),
(8, 'सत्र ८. मैत्री - १ (सकारात्मक मैत्री व प्रभाव)', 'Session 8: Friendship - Part 1', 'Healthy peer groups and mutual respect.'),
(9, 'सत्र ९. मैत्री - २ (मित्र आणि दबाव)', 'Session 9: Friendship - Part 2', 'Recognizing peer pressure and negative influences.'),
(10, 'सत्र १०. नकार देण्याचे कौशल्य (Saying NO)', 'Session 10: Refusal Skills', 'Developing assertiveness to say NO without feeling guilty.'),
(11, 'सत्र ११. भावनांची ओळख व समज', 'Session 11: Emotional Literacy', 'Identifying anger, anxiety, sadness, and excitement.'),
(12, 'सत्र १२. राग व तणाव व्यवस्थापन', 'Session 12: Anger & Stress Regulation', 'Techniques for calming the mind and handling frustration.'),
(13, 'सत्र १३. लैंगिक समानता व संवेदनशीलता', 'Session 13: Gender Sensitivity', 'Challenging gender stereotypes and respecting boundaries.'),
(14, 'सत्र १४. संप्रेषण कौशल्य (Communication Skills)', 'Session 14: Effective Communication', 'Expressing feelings clearly and active listening.'),
(15, 'सत्र १५. निर्णयक्षमता (Decision Making)', 'Session 15: Decision Making', 'Weighing consequences and making responsible choices.'),
(16, 'सत्र १६. ध्येय निश्चिती (Goal Setting)', 'Session 16: Goal Setting', 'Short-term and long-term academic and personal targets.'),
(17, 'सत्र १७. वेळ व्यवस्थापन (Time Management)', 'Session 17: Time Management', 'Balancing study, outdoor play, hobbies, and rest.'),
(18, 'सत्र १८. इंटरनेट व सोशल मीडिया सुरक्षा', 'Session 18: Cyber Safety', 'Protecting privacy, avoiding online predators and cyberbullying.'),
(19, 'सत्र १९. कौटुंबिक नातेसंबंध व संवाद', 'Session 19: Family Bonding', 'Open dialogue with parents and handling family friction.'),
(20, 'सत्र २०. समस्या निवारण (Problem Solving)', 'Session 20: Problem Solving', 'Step-by-step approaches to adolescent dilemmas.'),
(21, 'सत्र २१. स्वयं-शिस्त व संयम', 'Session 21: Self-Control & Restraint', 'Delaying gratification and focusing on long-term growth.'),
(22, 'सत्र २२. मूल्ये आणि नैतिकता', 'Session 22: Values & Ethics', 'Personal integrity and community empathy.'),
(23, 'सत्र २३. सकारात्मक विचारसरणी व आशावाद', 'Session 23: Positive Thinking', 'Building mental toughness and learning from failure.'),
(24, 'सत्र २४. नेतृत्व व सामाजिक जबाबदारी', 'Session 24: Leadership & Social Responsibility', 'Youth taking initiative in peer groups against addiction.'),
(25, 'सत्र २५. समारोप आणि उत्तर चाचण्या', 'Session 25: Conclusion & Post-Tests', 'Program reflection, certificate distribution, and MKMH, MMAT, ERT post-assessments.')
ON CONFLICT (session_number) DO NOTHING;

-- 2. Seed Standardized Assessment Questions (MKMH, MMAT, ERT)
-- Sample validated items directly from the JPIP Saiyam Framework Manual
INSERT INTO public.questions (paper_type, question_number, text_mr, text_en, options, correct_option, category) VALUES
-- Paper 1: MKMH (माझे ज्ञान, माझे आरोग्य चाचणी)
('MKMH', 1, 'चांगले वागण्याचे नियम मुला-मुलींसाठी सारखेच असले पाहिजेत.', 'Rules of good behavior should be the same for both boys and girls.', '["CORRECT", "WRONG", "DONT_KNOW"]'::jsonb, 'CORRECT', 'Gender Sensitivity'),
('MKMH', 2, 'कोणत्याही लांबच्या प्रवासाला मुलींना सोबतीशिवाय पाठवू नये.', 'Girls should never be sent on long journeys without an escort.', '["CORRECT", "WRONG", "DONT_KNOW"]'::jsonb, 'WRONG', 'Gender Equality'),
('MKMH', 3, 'जड व कष्टाची कामे करावीत तर मुलांनीच.', 'Only boys should perform hard physical labor.', '["CORRECT", "WRONG", "DONT_KNOW"]'::jsonb, 'WRONG', 'Gender Myths'),
('MKMH', 4, 'पुरुषांनी घरातील बारीक सारीक कामे करणे व घर सांभाळणे कमीपणाचे नाही.', 'Men doing household chores or taking care of the house is not degrading.', '["CORRECT", "WRONG", "DONT_KNOW"]'::jsonb, 'CORRECT', 'Gender Sensitivity'),
('MKMH', 5, 'पौगंडावस्थेत शरीरात होणारे बदल नैसर्गिक आणि सामान्य आहेत.', 'Physical changes occurring during adolescence are natural and normal.', '["CORRECT", "WRONG", "DONT_KNOW"]'::jsonb, 'CORRECT', 'Reproductive Health'),

-- Paper 2: MMAT (व्यसनाधीनता समज व गैरसमज प्रश्नावली)
('MMAT', 1, 'एकदा व्यसन सुटलं की सुटलं, परत काही लागत नाही.', 'Once an addiction is kicked, one never relapses.', '["CORRECT", "WRONG", "DONT_KNOW"]'::jsonb, 'WRONG', 'Addiction Myth'),
('MMAT', 2, 'फक्त एकदाच सिगारेट किंवा हुक्का ओढल्याने काहीही व्यसन लागत नाही.', 'Smoking a cigarette or hookah just once never causes addiction.', '["CORRECT", "WRONG", "DONT_KNOW"]'::jsonb, 'WRONG', 'Substance Risk'),
('MMAT', 3, 'दारू किंवा ड्रग्ज घेतल्याने तात्पुरता ताण कमी होतो, पण समस्या कायम राहते.', 'Consuming alcohol or drugs temporarily relieves stress, but the root problem remains.', '["CORRECT", "WRONG", "DONT_KNOW"]'::jsonb, 'CORRECT', 'Substance Fact'),
('MMAT', 4, 'मित्रांनी आग्रह केला तरी व्यसनापासून दूर राहणे आपल्या हातात असते.', 'Even under heavy peer pressure, abstaining from addiction is within our control.', '["CORRECT", "WRONG", "DONT_KNOW"]'::jsonb, 'CORRECT', 'Refusal Mindset'),
('MMAT', 5, 'ई-सिगारेट (Vapes) सामान्य सिगारेटपेक्षा पूर्णपणे सुरक्षित असतात.', 'E-cigarettes (Vapes) are completely safe compared to normal cigarettes.', '["CORRECT", "WRONG", "DONT_KNOW"]'::jsonb, 'WRONG', 'Vaping Myth'),

-- Paper 3: ERT (स्व-भावना नियमन चाचणी)
('ERT', 1, 'मला खूप राग येतो तेव्हा मी शांतपणे विचार करू शकतो/शकते.', 'When I get very angry, I can calm down and think rationally.', '["CORRECT", "WRONG", "DONT_KNOW"]'::jsonb, 'CORRECT', 'Emotional Regulation'),
('ERT', 2, 'माझ्या मनासारखे झाले नाही तरी मी मित्रांशी चिडून बोलत नाही.', 'Even when things don''t go my way, I do not lash out in anger at my friends.', '["CORRECT", "WRONG", "DONT_KNOW"]'::jsonb, 'CORRECT', 'Frustration Tolerance'),
('ERT', 3, 'मोबाईलवर गेम खेळताना वेळेचे भान न राहिल्यामुळे नंतर पश्चात्ताप होतो.', 'I often lose track of time playing mobile games and regret it later.', '["CORRECT", "WRONG", "DONT_KNOW"]'::jsonb, 'WRONG', 'Digital Self-Regulation'),
('ERT', 4, 'मित्राने चुकीच्या गोष्टीसाठी आग्रह केला तर मी स्पष्टपणे "नाही" म्हणू शकतो/शकते.', 'If a friend insists on doing something harmful, I can clearly and firmly say "NO".', '["CORRECT", "WRONG", "DONT_KNOW"]'::jsonb, 'CORRECT', 'Assertiveness'),
('ERT', 5, 'माझ्या अपयशाची जबाबदारी मी दुसऱ्यांवर ढकलत नाही.', 'I do not blame others for my own mistakes or failures.', '["CORRECT", "WRONG", "DONT_KNOW"]'::jsonb, 'CORRECT', 'Locus of Control')
ON CONFLICT (paper_type, question_number) DO NOTHING;
