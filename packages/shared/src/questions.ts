import { Question, CurriculumSession, CurriculumModule, QuestionOption } from './types';

// Standardized physical paper options formats
export const OPTIONS_MKMH: QuestionOption[] = [
  { code: 'CORRECT', labelMr: 'बरोबर', labelEn: 'Correct' },
  { code: 'WRONG', labelMr: 'चूक', labelEn: 'Wrong' },
  { code: 'DONT_KNOW', labelMr: 'माहीत नाही', labelEn: "Don't Know" },
];

export const OPTIONS_MMAT: QuestionOption[] = [
  { code: 'CORRECT', labelMr: 'बरोबर', labelEn: 'Correct' },
  { code: 'WRONG', labelMr: 'चूक', labelEn: 'Wrong' },
  { code: 'CANNOT_SAY', labelMr: 'सांगता येत नाही', labelEn: 'Cannot Say' },
];

export const OPTIONS_ERT: QuestionOption[] = [
  { code: 'ALWAYS', labelMr: 'नेहमी', labelEn: 'Always' },
  { code: 'OFTEN', labelMr: 'बऱ्याच वेळा', labelEn: 'Often' },
  { code: 'SOMETIMES', labelMr: 'कधी कधी', labelEn: 'Sometimes' },
  { code: 'NEVER', labelMr: 'कधीच नाही', labelEn: 'Never' },
];

// ZERO hardcoded questions: Populated 100% dynamically from backend/database
// awaiting the verified list of ~90 questions with marks from TRST team.
export const INITIAL_QUESTIONS: Question[] = [
  {
    "id": "q-mkmh-1",
    "paperType": "MKMH",
    "questionNumber": 1,
    "textMr": "वयात येण्याची प्रक्रिया ही मुला-मुलींमध्ये एकाच वेळी सुरू होते.",
    "textEn": "The process of puberty triggers at the same time in both boys and girls",
    "options": [
      {
        "code": "CORRECT",
        "labelMr": "बरोबर",
        "labelEn": "Correct"
      },
      {
        "code": "WRONG",
        "labelMr": "चूक",
        "labelEn": "Wrong"
      },
      {
        "code": "DONT_KNOW",
        "labelMr": "माहीत नाही",
        "labelEn": "Don't Know"
      }
    ],
    "correctOptionCode": "WRONG",
    "marks": 1.0,
    "category": "Adolescent Knowledge & Health"
  },
  {
    "id": "q-mkmh-2",
    "paperType": "MKMH",
    "questionNumber": 2,
    "textMr": "स्वप्नावस्था म्हणजे मुलांमध्ये दिसणारे पौगंडावस्थेचे (वयात येण्याचे) एक लक्षण आहे.",
    "textEn": "'Wet dreams' are a symptom of pubertal changes in boys",
    "options": [
      {
        "code": "CORRECT",
        "labelMr": "बरोबर",
        "labelEn": "Correct"
      },
      {
        "code": "WRONG",
        "labelMr": "चूक",
        "labelEn": "Wrong"
      },
      {
        "code": "DONT_KNOW",
        "labelMr": "माहीत नाही",
        "labelEn": "Don't Know"
      }
    ],
    "correctOptionCode": "CORRECT",
    "marks": 1.0,
    "category": "Adolescent Knowledge & Health"
  },
  {
    "id": "q-mkmh-3",
    "paperType": "MKMH",
    "questionNumber": 3,
    "textMr": "स्त्रियांमधील दर मासिक चक्रात (पाळीपूर्वी) दोन्ही बीजांडांतून अनेक अंडपेशी बाहेर पडतात.",
    "textEn": "During each menstrual cycle in girls, many ova (ovum) are released from both ovaries",
    "options": [
      {
        "code": "CORRECT",
        "labelMr": "बरोबर",
        "labelEn": "Correct"
      },
      {
        "code": "WRONG",
        "labelMr": "चूक",
        "labelEn": "Wrong"
      },
      {
        "code": "DONT_KNOW",
        "labelMr": "माहीत नाही",
        "labelEn": "Don't Know"
      }
    ],
    "correctOptionCode": "WRONG",
    "marks": 1.0,
    "category": "Adolescent Knowledge & Health"
  },
  {
    "id": "q-mkmh-4",
    "paperType": "MKMH",
    "questionNumber": 4,
    "textMr": "आपल्या आवडत्या व्यक्तीला (मुलगा/मुलगी) संमतीशिवाय वारंवार फोन करणे, हाका मारणे, चिठ्ठी पाठवणे, चावट शेरेबाजी करणे, तिचा पाठलाग करणे किंवा त्या व्यक्तीबद्दल अफवा पसरवणे, हे वर्तन कधीतरी ती व्यक्ती 'पटेल' म्हणून चालू ठेवणे",
    "textEn": "Calling your crush without his/her consent, calling him/her out in public, sending messages, passing vulgar comments, stalking or spreading rumours about the person is okay, with the hope of future acceptance",
    "options": [
      {
        "code": "CORRECT",
        "labelMr": "बरोबर",
        "labelEn": "Correct"
      },
      {
        "code": "WRONG",
        "labelMr": "चूक",
        "labelEn": "Wrong"
      },
      {
        "code": "DONT_KNOW",
        "labelMr": "माहीत नाही",
        "labelEn": "Don't Know"
      }
    ],
    "correctOptionCode": "WRONG",
    "marks": 1.0,
    "category": "Adolescent Knowledge & Health"
  },
  {
    "id": "q-mkmh-5",
    "paperType": "MKMH",
    "questionNumber": 5,
    "textMr": "मासिक पाळी म्हणजे गर्भाशयाचे नको असलेले अस्तर गळून पडणे",
    "textEn": "Menstrual cycle means shedding of the unwanted lining in uterus",
    "options": [
      {
        "code": "CORRECT",
        "labelMr": "बरोबर",
        "labelEn": "Correct"
      },
      {
        "code": "WRONG",
        "labelMr": "चूक",
        "labelEn": "Wrong"
      },
      {
        "code": "DONT_KNOW",
        "labelMr": "माहीत नाही",
        "labelEn": "Don't Know"
      }
    ],
    "correctOptionCode": "CORRECT",
    "marks": 1.0,
    "category": "Adolescent Knowledge & Health"
  },
  {
    "id": "q-mkmh-6",
    "paperType": "MKMH",
    "questionNumber": 6,
    "textMr": "मुलींना कधीच व्यसन लागू शकत नाही",
    "textEn": "Girls never become addicts",
    "options": [
      {
        "code": "CORRECT",
        "labelMr": "बरोबर",
        "labelEn": "Correct"
      },
      {
        "code": "WRONG",
        "labelMr": "चूक",
        "labelEn": "Wrong"
      },
      {
        "code": "DONT_KNOW",
        "labelMr": "माहीत नाही",
        "labelEn": "Don't Know"
      }
    ],
    "correctOptionCode": "WRONG",
    "marks": 1.0,
    "category": "Adolescent Knowledge & Health"
  },
  {
    "id": "q-mkmh-7",
    "paperType": "MKMH",
    "questionNumber": 7,
    "textMr": "फक्त दुय्यम बाह्य लक्षणांवरून (उदा. उंची, आवाज, स्तनांचा आकार इत्यादी) एखाद्या स्त्री/पुरुषाच्या प्रजनन क्षमतेचा अंदाज डॉक्टर १००% सांगू शकतात.",
    "textEn": "Doctors can definitely predict the reproductive ability of a man/woman exclusively based on his/her secondary characteristics",
    "options": [
      {
        "code": "CORRECT",
        "labelMr": "बरोबर",
        "labelEn": "Correct"
      },
      {
        "code": "WRONG",
        "labelMr": "चूक",
        "labelEn": "Wrong"
      },
      {
        "code": "DONT_KNOW",
        "labelMr": "माहीत नाही",
        "labelEn": "Don't Know"
      }
    ],
    "correctOptionCode": "WRONG",
    "marks": 1.0,
    "category": "Adolescent Knowledge & Health"
  },
  {
    "id": "q-mkmh-8",
    "paperType": "MKMH",
    "questionNumber": 8,
    "textMr": "माणसाच्या बाळाचे लिंग गर्भावस्थाच्या सहाव्या महिन्यात निश्चित होते.",
    "textEn": "The sex of the baby is determined during the sixth month of mother's pregnancy",
    "options": [
      {
        "code": "CORRECT",
        "labelMr": "बरोबर",
        "labelEn": "Correct"
      },
      {
        "code": "WRONG",
        "labelMr": "चूक",
        "labelEn": "Wrong"
      },
      {
        "code": "DONT_KNOW",
        "labelMr": "माहीत नाही",
        "labelEn": "Don't Know"
      }
    ],
    "correctOptionCode": "WRONG",
    "marks": 1.0,
    "category": "Adolescent Knowledge & Health"
  },
  {
    "id": "q-mkmh-9",
    "paperType": "MKMH",
    "questionNumber": 9,
    "textMr": "पौगंडावस्थेमध्ये (वयात येताना) मुला-मुलींमध्ये भावना अतिशय स्थिर व शांत असतात.",
    "textEn": "Children's emotions are stable and calm during puberty",
    "options": [
      {
        "code": "CORRECT",
        "labelMr": "बरोबर",
        "labelEn": "Correct"
      },
      {
        "code": "WRONG",
        "labelMr": "चूक",
        "labelEn": "Wrong"
      },
      {
        "code": "DONT_KNOW",
        "labelMr": "माहीत नाही",
        "labelEn": "Don't Know"
      }
    ],
    "correctOptionCode": "WRONG",
    "marks": 1.0,
    "category": "Adolescent Knowledge & Health"
  },
  {
    "id": "q-mkmh-10",
    "paperType": "MKMH",
    "questionNumber": 10,
    "textMr": "एच.आय.व्ही.चा विषाणू शरीरातील रोगप्रतिकारक शक्ती नष्ट करतो.",
    "textEn": "HIV destroys the immune system of the body",
    "options": [
      {
        "code": "CORRECT",
        "labelMr": "बरोबर",
        "labelEn": "Correct"
      },
      {
        "code": "WRONG",
        "labelMr": "चूक",
        "labelEn": "Wrong"
      },
      {
        "code": "DONT_KNOW",
        "labelMr": "माहीत नाही",
        "labelEn": "Don't Know"
      }
    ],
    "correctOptionCode": "CORRECT",
    "marks": 1.0,
    "category": "Adolescent Knowledge & Health"
  },
  {
    "id": "q-mkmh-11",
    "paperType": "MKMH",
    "questionNumber": 11,
    "textMr": "एकदा दारूचे व्यसन लागले की संपलंच सगळं.",
    "textEn": "Alcohol addiction leads to complete devastation",
    "options": [
      {
        "code": "CORRECT",
        "labelMr": "बरोबर",
        "labelEn": "Correct"
      },
      {
        "code": "WRONG",
        "labelMr": "चूक",
        "labelEn": "Wrong"
      },
      {
        "code": "DONT_KNOW",
        "labelMr": "माहीत नाही",
        "labelEn": "Don't Know"
      }
    ],
    "correctOptionCode": "CORRECT",
    "marks": 1.0,
    "category": "Adolescent Knowledge & Health"
  },
  {
    "id": "q-mkmh-12",
    "paperType": "MKMH",
    "questionNumber": 12,
    "textMr": "उगाचच जवळ बसणाऱ्या, अंगाला स्पर्श करणाऱ्या परिचित/अपरिचित व्यक्तीबद्दल आई-वडिलांना सांगणे आवश्यक आहे.",
    "textEn": "A child should communicate to parents about any known/unknown person who unnecessarily tries to become intimate",
    "options": [
      {
        "code": "CORRECT",
        "labelMr": "बरोबर",
        "labelEn": "Correct"
      },
      {
        "code": "WRONG",
        "labelMr": "चूक",
        "labelEn": "Wrong"
      },
      {
        "code": "DONT_KNOW",
        "labelMr": "माहीत नाही",
        "labelEn": "Don't Know"
      }
    ],
    "correctOptionCode": "CORRECT",
    "marks": 1.0,
    "category": "Adolescent Knowledge & Health"
  },
  {
    "id": "q-mkmh-13",
    "paperType": "MKMH",
    "questionNumber": 13,
    "textMr": "मासिक पाळीमुळे स्त्री अपवित्र बनते, असे मला वाटते.",
    "textEn": "According to my opinion menstrual cycle makes a woman impure",
    "options": [
      {
        "code": "CORRECT",
        "labelMr": "बरोबर",
        "labelEn": "Correct"
      },
      {
        "code": "WRONG",
        "labelMr": "चूक",
        "labelEn": "Wrong"
      },
      {
        "code": "DONT_KNOW",
        "labelMr": "माहीत नाही",
        "labelEn": "Don't Know"
      }
    ],
    "correctOptionCode": "WRONG",
    "marks": 1.0,
    "category": "Adolescent Knowledge & Health"
  },
  {
    "id": "q-mkmh-14",
    "paperType": "MKMH",
    "questionNumber": 14,
    "textMr": "जीवनात यशस्वी व्हायचे असेल तर केवळ आत्मविश्वास पुरेसा नाही, तर सुंदर दिसणेही आवश्यक आहे.",
    "textEn": "Confidence alone is not enough to be successful in life, looking beautiful/handsome is also equally essential",
    "options": [
      {
        "code": "CORRECT",
        "labelMr": "बरोबर",
        "labelEn": "Correct"
      },
      {
        "code": "WRONG",
        "labelMr": "चूक",
        "labelEn": "Wrong"
      },
      {
        "code": "DONT_KNOW",
        "labelMr": "माहीत नाही",
        "labelEn": "Don't Know"
      }
    ],
    "correctOptionCode": "WRONG",
    "marks": 1.0,
    "category": "Adolescent Knowledge & Health"
  },
  {
    "id": "q-mkmh-15",
    "paperType": "MKMH",
    "questionNumber": 15,
    "textMr": "एखाद्या मुलीने जर तिच्या मित्राला ऐनवेळी नकार दिला आणि तो मुलगा चिडला व त्याने तिच्यावर जबरदस्ती केली, तर त्यात त्याचा काहीच दोष नाही.",
    "textEn": "It is okay if a boy gets angry when a girl refuses his advances for friendship and forces it on her",
    "options": [
      {
        "code": "CORRECT",
        "labelMr": "बरोबर",
        "labelEn": "Correct"
      },
      {
        "code": "WRONG",
        "labelMr": "चूक",
        "labelEn": "Wrong"
      },
      {
        "code": "DONT_KNOW",
        "labelMr": "माहीत नाही",
        "labelEn": "Don't Know"
      }
    ],
    "correctOptionCode": "WRONG",
    "marks": 1.0,
    "category": "Adolescent Knowledge & Health"
  },
  {
    "id": "q-mkmh-16",
    "paperType": "MKMH",
    "questionNumber": 16,
    "textMr": "समलिंगी संबंध ठेवणाऱ्या व्यक्ती माणूस म्हणून सर्व बाबतीत इतरांसारख्याच सक्षम असू शकतात.",
    "textEn": "In all other aspects of life, homosexuals are just like any other human being",
    "options": [
      {
        "code": "CORRECT",
        "labelMr": "बरोबर",
        "labelEn": "Correct"
      },
      {
        "code": "WRONG",
        "labelMr": "चूक",
        "labelEn": "Wrong"
      },
      {
        "code": "DONT_KNOW",
        "labelMr": "माहीत नाही",
        "labelEn": "Don't Know"
      }
    ],
    "correctOptionCode": "CORRECT",
    "marks": 1.0,
    "category": "Adolescent Knowledge & Health"
  },
  {
    "id": "q-mkmh-17",
    "paperType": "MKMH",
    "questionNumber": 17,
    "textMr": "खूप पैसा असला ना, की व्यसन-बिसन काही फरक पडत नाही.",
    "textEn": "When you make ample money, addiction just does not make a difference",
    "options": [
      {
        "code": "CORRECT",
        "labelMr": "बरोबर",
        "labelEn": "Correct"
      },
      {
        "code": "WRONG",
        "labelMr": "चूक",
        "labelEn": "Wrong"
      },
      {
        "code": "DONT_KNOW",
        "labelMr": "माहीत नाही",
        "labelEn": "Don't Know"
      }
    ],
    "correctOptionCode": "WRONG",
    "marks": 1.0,
    "category": "Adolescent Knowledge & Health"
  },
  {
    "id": "q-mkmh-18",
    "paperType": "MKMH",
    "questionNumber": 18,
    "textMr": "इंटरनेटवरील इतर सोशल साइट्सवर सहज भेटलेल्या अनोळखी व्यक्तींशी मैत्री करावी, त्यामुळे नवे मित्र-मैत्रिणी मिळतात.",
    "textEn": "One can easily communicate with unknown people on social media sites. In fact you will end up getting more friends.",
    "options": [
      {
        "code": "CORRECT",
        "labelMr": "बरोबर",
        "labelEn": "Correct"
      },
      {
        "code": "WRONG",
        "labelMr": "चूक",
        "labelEn": "Wrong"
      },
      {
        "code": "DONT_KNOW",
        "labelMr": "माहीत नाही",
        "labelEn": "Don't Know"
      }
    ],
    "correctOptionCode": "WRONG",
    "marks": 1.0,
    "category": "Adolescent Knowledge & Health"
  },
  {
    "id": "q-mkmh-19",
    "paperType": "MKMH",
    "questionNumber": 19,
    "textMr": "मुलांना अधिक मैत्रिणी व मुलींना अधिक मित्र असल्यास त्यांचा त्यांच्या गटात भाव वाढतो.",
    "textEn": "Having an opposite gender friend can earn more respect to a boy/girl in their friend circle",
    "options": [
      {
        "code": "CORRECT",
        "labelMr": "बरोबर",
        "labelEn": "Correct"
      },
      {
        "code": "WRONG",
        "labelMr": "चूक",
        "labelEn": "Wrong"
      },
      {
        "code": "DONT_KNOW",
        "labelMr": "माहीत नाही",
        "labelEn": "Don't Know"
      }
    ],
    "correctOptionCode": "WRONG",
    "marks": 1.0,
    "category": "Adolescent Knowledge & Health"
  },
  {
    "id": "q-mkmh-20",
    "paperType": "MKMH",
    "questionNumber": 20,
    "textMr": "अतील कपडे (अंतर्वस्त्रे) कृत्रिम धाग्याने बनवलेली व फॅशनेबल असावीत.",
    "textEn": "Using artificial and attractive undergarments is desirable",
    "options": [
      {
        "code": "CORRECT",
        "labelMr": "बरोबर",
        "labelEn": "Correct"
      },
      {
        "code": "WRONG",
        "labelMr": "चूक",
        "labelEn": "Wrong"
      },
      {
        "code": "DONT_KNOW",
        "labelMr": "माहीत नाही",
        "labelEn": "Don't Know"
      }
    ],
    "correctOptionCode": "WRONG",
    "marks": 1.0,
    "category": "Adolescent Knowledge & Health"
  },
  {
    "id": "q-mkmh-21",
    "paperType": "MKMH",
    "questionNumber": 21,
    "textMr": "बाळ जन्माला येण्यापूर्वी ते मुलगा/मुलगी आहे हे तपासणे त्या पती-पत्नीच्या मर्जीवर अवलंबून आहे.",
    "textEn": "The parents have complete right to decide if they want to check the gender of their baby before birth",
    "options": [
      {
        "code": "CORRECT",
        "labelMr": "बरोबर",
        "labelEn": "Correct"
      },
      {
        "code": "WRONG",
        "labelMr": "चूक",
        "labelEn": "Wrong"
      },
      {
        "code": "DONT_KNOW",
        "labelMr": "माहीत नाही",
        "labelEn": "Don't Know"
      }
    ],
    "correctOptionCode": "WRONG",
    "marks": 1.0,
    "category": "Adolescent Knowledge & Health"
  },
  {
    "id": "q-mkmh-22",
    "paperType": "MKMH",
    "questionNumber": 22,
    "textMr": "मोबाईलवर खूप वेळ गेम खेळणे म्हणजे काही व्यसन नाही.",
    "textEn": "Spending lot of time in playing games on mobile phone can't be termed as addiction",
    "options": [
      {
        "code": "CORRECT",
        "labelMr": "बरोबर",
        "labelEn": "Correct"
      },
      {
        "code": "WRONG",
        "labelMr": "चूक",
        "labelEn": "Wrong"
      },
      {
        "code": "DONT_KNOW",
        "labelMr": "माहीत नाही",
        "labelEn": "Don't Know"
      }
    ],
    "correctOptionCode": "WRONG",
    "marks": 1.0,
    "category": "Adolescent Knowledge & Health"
  },
  {
    "id": "q-mkmh-23",
    "paperType": "MKMH",
    "questionNumber": 23,
    "textMr": "जननेंद्रियांचा आकार लहान-मोठा असण्यावर लैंगिक क्षमता अवलंबून असते.",
    "textEn": "Sexual capacity of a person depends on the size of the reproductive organs",
    "options": [
      {
        "code": "CORRECT",
        "labelMr": "बरोबर",
        "labelEn": "Correct"
      },
      {
        "code": "WRONG",
        "labelMr": "चूक",
        "labelEn": "Wrong"
      },
      {
        "code": "DONT_KNOW",
        "labelMr": "माहीत नाही",
        "labelEn": "Don't Know"
      }
    ],
    "correctOptionCode": "WRONG",
    "marks": 1.0,
    "category": "Adolescent Knowledge & Health"
  },
  {
    "id": "q-mkmh-24",
    "paperType": "MKMH",
    "questionNumber": 24,
    "textMr": "मुलींनी नाजूक-साजूक दिसावे व मुलांनी कणखर दिसावे, हेच योग्य आहे.",
    "textEn": "Girls should be delicate while boys should be strong",
    "options": [
      {
        "code": "CORRECT",
        "labelMr": "बरोबर",
        "labelEn": "Correct"
      },
      {
        "code": "WRONG",
        "labelMr": "चूक",
        "labelEn": "Wrong"
      },
      {
        "code": "DONT_KNOW",
        "labelMr": "माहीत नाही",
        "labelEn": "Don't Know"
      }
    ],
    "correctOptionCode": "WRONG",
    "marks": 1.0,
    "category": "Adolescent Knowledge & Health"
  },
  {
    "id": "q-mkmh-25",
    "paperType": "MKMH",
    "questionNumber": 25,
    "textMr": "मुलगे व मुली यांच्यात सर्व बाबतीत मुलगेच वरचढ असतात.",
    "textEn": "Boys rock than girls in everything",
    "options": [
      {
        "code": "CORRECT",
        "labelMr": "बरोबर",
        "labelEn": "Correct"
      },
      {
        "code": "WRONG",
        "labelMr": "चूक",
        "labelEn": "Wrong"
      },
      {
        "code": "DONT_KNOW",
        "labelMr": "माहीत नाही",
        "labelEn": "Don't Know"
      }
    ],
    "correctOptionCode": "WRONG",
    "marks": 1.0,
    "category": "Adolescent Knowledge & Health"
  },
  {
    "id": "q-mkmh-26",
    "paperType": "MKMH",
    "questionNumber": 26,
    "textMr": "चांगले वागण्याचे नियम मुला-मुलींसाठी सारखेच असले पाहिजेत.",
    "textEn": "Both boys and girls should have the same set of rules to follow",
    "options": [
      {
        "code": "CORRECT",
        "labelMr": "बरोबर",
        "labelEn": "Correct"
      },
      {
        "code": "WRONG",
        "labelMr": "चूक",
        "labelEn": "Wrong"
      },
      {
        "code": "DONT_KNOW",
        "labelMr": "माहीत नाही",
        "labelEn": "Don't Know"
      }
    ],
    "correctOptionCode": "CORRECT",
    "marks": 1.0,
    "category": "Adolescent Knowledge & Health"
  },
  {
    "id": "q-mkmh-27",
    "paperType": "MKMH",
    "questionNumber": 27,
    "textMr": "एखादे व्यसन सुटले की सुटले, परत काही लागत नाही.",
    "textEn": "Once a person is de-addicted, it is for life time",
    "options": [
      {
        "code": "CORRECT",
        "labelMr": "बरोबर",
        "labelEn": "Correct"
      },
      {
        "code": "WRONG",
        "labelMr": "चूक",
        "labelEn": "Wrong"
      },
      {
        "code": "DONT_KNOW",
        "labelMr": "माहीत नाही",
        "labelEn": "Don't Know"
      }
    ],
    "correctOptionCode": "WRONG",
    "marks": 1.0,
    "category": "Adolescent Knowledge & Health"
  },
  {
    "id": "q-mkmh-28",
    "paperType": "MKMH",
    "questionNumber": 28,
    "textMr": "कोणत्याही लांबच्या प्रवासाला मुलींना सोबतीशिवाय पाठवणे योग्य नाही.",
    "textEn": "While traveling long distances, girls should always be accompanied by someone",
    "options": [
      {
        "code": "CORRECT",
        "labelMr": "बरोबर",
        "labelEn": "Correct"
      },
      {
        "code": "WRONG",
        "labelMr": "चूक",
        "labelEn": "Wrong"
      },
      {
        "code": "DONT_KNOW",
        "labelMr": "माहीत नाही",
        "labelEn": "Don't Know"
      }
    ],
    "correctOptionCode": "WRONG",
    "marks": 1.0,
    "category": "Adolescent Knowledge & Health"
  },
  {
    "id": "q-mkmh-29",
    "paperType": "MKMH",
    "questionNumber": 29,
    "textMr": "जड व कष्टाची कामे करावीत तर मुलांनीच.",
    "textEn": "Hard and heavy work is always a man's job",
    "options": [
      {
        "code": "CORRECT",
        "labelMr": "बरोबर",
        "labelEn": "Correct"
      },
      {
        "code": "WRONG",
        "labelMr": "चूक",
        "labelEn": "Wrong"
      },
      {
        "code": "DONT_KNOW",
        "labelMr": "माहीत नाही",
        "labelEn": "Don't Know"
      }
    ],
    "correctOptionCode": "WRONG",
    "marks": 1.0,
    "category": "Adolescent Knowledge & Health"
  },
  {
    "id": "q-mkmh-30",
    "paperType": "MKMH",
    "questionNumber": 30,
    "textMr": "पुरुषांनी घरातील बारीकसारीक कामे करणे व घर सांभाळणे यात काहीच गैर नाही.",
    "textEn": "It is okay for men to do small household chores and look after the home",
    "options": [
      {
        "code": "CORRECT",
        "labelMr": "बरोबर",
        "labelEn": "Correct"
      },
      {
        "code": "WRONG",
        "labelMr": "चूक",
        "labelEn": "Wrong"
      },
      {
        "code": "DONT_KNOW",
        "labelMr": "माहीत नाही",
        "labelEn": "Don't Know"
      }
    ],
    "correctOptionCode": "CORRECT",
    "marks": 1.0,
    "category": "Adolescent Knowledge & Health"
  },
  {
    "id": "q-mmat-1",
    "paperType": "MMAT",
    "questionNumber": 1,
    "textMr": "व्यसन हा एक मानसिक आजार आहे",
    "textEn": "Addiction is a psychological disease",
    "options": [
      {
        "code": "CORRECT",
        "labelMr": "बरोबर",
        "labelEn": "Correct"
      },
      {
        "code": "WRONG",
        "labelMr": "चूक",
        "labelEn": "Wrong"
      },
      {
        "code": "DONT_KNOW",
        "labelMr": "माहीत नाही",
        "labelEn": "Don't Know"
      }
    ],
    "correctOptionCode": "CORRECT",
    "marks": 2.0,
    "scoringRubric": {
      "CORRECT": 2,
      "WRONG": 1,
      "DONT_KNOW": 0
    },
    "category": "Addiction Myths & Facts"
  },
  {
    "id": "q-mmat-2",
    "paperType": "MMAT",
    "questionNumber": 2,
    "textMr": "सिगारेट प्यायल्यामुळे आपले वजन नियंत्रणात (कंट्रोलमध्ये) राहते.",
    "textEn": "Cigarette smoking helps in weight control",
    "options": [
      {
        "code": "CORRECT",
        "labelMr": "बरोबर",
        "labelEn": "Correct"
      },
      {
        "code": "WRONG",
        "labelMr": "चूक",
        "labelEn": "Wrong"
      },
      {
        "code": "DONT_KNOW",
        "labelMr": "माहीत नाही",
        "labelEn": "Don't Know"
      }
    ],
    "correctOptionCode": "WRONG",
    "marks": 2.0,
    "scoringRubric": {
      "WRONG": 2,
      "CORRECT": 1,
      "DONT_KNOW": 0
    },
    "category": "Addiction Myths & Facts"
  },
  {
    "id": "q-mmat-3",
    "paperType": "MMAT",
    "questionNumber": 3,
    "textMr": "दारू प्यायल्यावर आपले सगळे ताणतणाव (टेन्शन) नाहीसे होतात.",
    "textEn": "Alcohol (liquor) helps in getting rid of all stress and worries",
    "options": [
      {
        "code": "CORRECT",
        "labelMr": "बरोबर",
        "labelEn": "Correct"
      },
      {
        "code": "WRONG",
        "labelMr": "चूक",
        "labelEn": "Wrong"
      },
      {
        "code": "DONT_KNOW",
        "labelMr": "माहीत नाही",
        "labelEn": "Don't Know"
      }
    ],
    "correctOptionCode": "WRONG",
    "marks": 2.0,
    "scoringRubric": {
      "WRONG": 2,
      "CORRECT": 1,
      "DONT_KNOW": 0
    },
    "category": "Addiction Myths & Facts"
  },
  {
    "id": "q-mmat-4",
    "paperType": "MMAT",
    "questionNumber": 4,
    "textMr": "कधीतरी सिगारेट किंवा बिडी ओढली तर त्याचे आपल्यावर काहीच वाईट परिणाम होत नाहीत.",
    "textEn": "There are absolutely no ill effects on health if someone tries cigarette smoking occasionally",
    "options": [
      {
        "code": "CORRECT",
        "labelMr": "बरोबर",
        "labelEn": "Correct"
      },
      {
        "code": "WRONG",
        "labelMr": "चूक",
        "labelEn": "Wrong"
      },
      {
        "code": "DONT_KNOW",
        "labelMr": "माहीत नाही",
        "labelEn": "Don't Know"
      }
    ],
    "correctOptionCode": "WRONG",
    "marks": 2.0,
    "scoringRubric": {
      "WRONG": 2,
      "CORRECT": 1,
      "DONT_KNOW": 0
    },
    "category": "Addiction Myths & Facts"
  },
  {
    "id": "q-mmat-5",
    "paperType": "MMAT",
    "questionNumber": 5,
    "textMr": "सरकारने गुटख्यावर बंदी आणली आहे, त्यामुळे लोक आता गुटखा खात नाहीत.",
    "textEn": "Since government has banned Gutkha (tobacco), no one really consumes it now",
    "options": [
      {
        "code": "CORRECT",
        "labelMr": "बरोबर",
        "labelEn": "Correct"
      },
      {
        "code": "WRONG",
        "labelMr": "चूक",
        "labelEn": "Wrong"
      },
      {
        "code": "DONT_KNOW",
        "labelMr": "माहीत नाही",
        "labelEn": "Don't Know"
      }
    ],
    "correctOptionCode": "WRONG",
    "marks": 2.0,
    "scoringRubric": {
      "WRONG": 2,
      "CORRECT": 1,
      "DONT_KNOW": 0
    },
    "category": "Addiction Myths & Facts"
  },
  {
    "id": "q-mmat-6",
    "paperType": "MMAT",
    "questionNumber": 6,
    "textMr": "इंटरनेट किंवा मोबाईलवरील गेम्स तासन्तास खेळल्यामुळे मेंदूला ताजेतवाने वाटते.",
    "textEn": "The brain gets refreshed when one engages in mobile games for hours together",
    "options": [
      {
        "code": "CORRECT",
        "labelMr": "बरोबर",
        "labelEn": "Correct"
      },
      {
        "code": "WRONG",
        "labelMr": "चूक",
        "labelEn": "Wrong"
      },
      {
        "code": "DONT_KNOW",
        "labelMr": "माहीत नाही",
        "labelEn": "Don't Know"
      }
    ],
    "correctOptionCode": "WRONG",
    "marks": 2.0,
    "scoringRubric": {
      "WRONG": 2,
      "CORRECT": 1,
      "DONT_KNOW": 0
    },
    "category": "Addiction Myths & Facts"
  },
  {
    "id": "q-mmat-7",
    "paperType": "MMAT",
    "questionNumber": 7,
    "textMr": "रोज माशेरी (मिश्री) लावणे याला व्यसन म्हणत नाहीत.",
    "textEn": "Using 'misree' or 'masheri' everyday cannot be labeled as addiction",
    "options": [
      {
        "code": "CORRECT",
        "labelMr": "बरोबर",
        "labelEn": "Correct"
      },
      {
        "code": "WRONG",
        "labelMr": "चूक",
        "labelEn": "Wrong"
      },
      {
        "code": "DONT_KNOW",
        "labelMr": "माहीत नाही",
        "labelEn": "Don't Know"
      }
    ],
    "correctOptionCode": "WRONG",
    "marks": 2.0,
    "scoringRubric": {
      "WRONG": 2,
      "CORRECT": 1,
      "DONT_KNOW": 0
    },
    "category": "Addiction Myths & Facts"
  },
  {
    "id": "q-mmat-8",
    "paperType": "MMAT",
    "questionNumber": 8,
    "textMr": "व्यसनी मित्रांच्या संगतीमुळे व्यसनाच्या जाळ्यात अडकले जाऊ शकते.",
    "textEn": "One can get into the trap of addiction due to being friends with those who are addicted to something",
    "options": [
      {
        "code": "CORRECT",
        "labelMr": "बरोबर",
        "labelEn": "Correct"
      },
      {
        "code": "WRONG",
        "labelMr": "चूक",
        "labelEn": "Wrong"
      },
      {
        "code": "DONT_KNOW",
        "labelMr": "माहीत नाही",
        "labelEn": "Don't Know"
      }
    ],
    "correctOptionCode": "CORRECT",
    "marks": 2.0,
    "scoringRubric": {
      "CORRECT": 2,
      "WRONG": 1,
      "DONT_KNOW": 0
    },
    "category": "Addiction Myths & Facts"
  },
  {
    "id": "q-mmat-9",
    "paperType": "MMAT",
    "questionNumber": 9,
    "textMr": "मोबाईलचा वापर करता आला नाही म्हणून दुःख होणे किंवा अस्वस्थ वाटणे हे स्वाभाविकच आहे.",
    "textEn": "It is very obvious to become restless/sad if one is not able to use his/her mobile due to some reason",
    "options": [
      {
        "code": "CORRECT",
        "labelMr": "बरोबर",
        "labelEn": "Correct"
      },
      {
        "code": "WRONG",
        "labelMr": "चूक",
        "labelEn": "Wrong"
      },
      {
        "code": "DONT_KNOW",
        "labelMr": "माहीत नाही",
        "labelEn": "Don't Know"
      }
    ],
    "correctOptionCode": "WRONG",
    "marks": 2.0,
    "scoringRubric": {
      "WRONG": 2,
      "CORRECT": 1,
      "DONT_KNOW": 0
    },
    "category": "Addiction Myths & Facts"
  },
  {
    "id": "q-mmat-10",
    "paperType": "MMAT",
    "questionNumber": 10,
    "textMr": "व्यसनी माणसाला एकदा उपचार दिले की ते त्याला निर्व्यसनी व्हायला पुरेसे असतात.",
    "textEn": "Once a person gets therapy for deaddiction, it is enough for keeping the person away from addiction for lifetime",
    "options": [
      {
        "code": "CORRECT",
        "labelMr": "बरोबर",
        "labelEn": "Correct"
      },
      {
        "code": "WRONG",
        "labelMr": "चूक",
        "labelEn": "Wrong"
      },
      {
        "code": "DONT_KNOW",
        "labelMr": "माहीत नाही",
        "labelEn": "Don't Know"
      }
    ],
    "correctOptionCode": "WRONG",
    "marks": 2.0,
    "scoringRubric": {
      "WRONG": 2,
      "CORRECT": 1,
      "DONT_KNOW": 0
    },
    "category": "Addiction Myths & Facts"
  },
  {
    "id": "q-mmat-11",
    "paperType": "MMAT",
    "questionNumber": 11,
    "textMr": "शालेय वयात दर १० मुलांमागे १ मूल व्यसनामध्ये अडकत असते.",
    "textEn": "Every tenth child in schools is getting trapped in addiction of some or the other kind",
    "options": [
      {
        "code": "CORRECT",
        "labelMr": "बरोबर",
        "labelEn": "Correct"
      },
      {
        "code": "WRONG",
        "labelMr": "चूक",
        "labelEn": "Wrong"
      },
      {
        "code": "DONT_KNOW",
        "labelMr": "माहीत नाही",
        "labelEn": "Don't Know"
      }
    ],
    "correctOptionCode": "CORRECT",
    "marks": 2.0,
    "scoringRubric": {
      "CORRECT": 2,
      "WRONG": 1,
      "DONT_KNOW": 0
    },
    "category": "Addiction Myths & Facts"
  },
  {
    "id": "q-mmat-12",
    "paperType": "MMAT",
    "questionNumber": 12,
    "textMr": "बुद्धिमान मुलांना व्यसन लागण्याची शक्यता खूप कमी असते.",
    "textEn": "The probability of intelligent people getting addicted to something is too low",
    "options": [
      {
        "code": "CORRECT",
        "labelMr": "बरोबर",
        "labelEn": "Correct"
      },
      {
        "code": "WRONG",
        "labelMr": "चूक",
        "labelEn": "Wrong"
      },
      {
        "code": "DONT_KNOW",
        "labelMr": "माहीत नाही",
        "labelEn": "Don't Know"
      }
    ],
    "correctOptionCode": "WRONG",
    "marks": 2.0,
    "scoringRubric": {
      "WRONG": 2,
      "CORRECT": 1,
      "DONT_KNOW": 0
    },
    "category": "Addiction Myths & Facts"
  },
  {
    "id": "q-mmat-13",
    "paperType": "MMAT",
    "questionNumber": 13,
    "textMr": "एक व्यसनी व्यक्ती स्वतःच्या कमाईचा मोठा भाग व्यसनावर खर्च करते.",
    "textEn": "Any addict spends a huge amount of his/her income on addiction",
    "options": [
      {
        "code": "CORRECT",
        "labelMr": "बरोबर",
        "labelEn": "Correct"
      },
      {
        "code": "WRONG",
        "labelMr": "चूक",
        "labelEn": "Wrong"
      },
      {
        "code": "DONT_KNOW",
        "labelMr": "माहीत नाही",
        "labelEn": "Don't Know"
      }
    ],
    "correctOptionCode": "CORRECT",
    "marks": 2.0,
    "scoringRubric": {
      "CORRECT": 2,
      "WRONG": 1,
      "DONT_KNOW": 0
    },
    "category": "Addiction Myths & Facts"
  },
  {
    "id": "q-mmat-14",
    "paperType": "MMAT",
    "questionNumber": 14,
    "textMr": "मुली कधीही व्यसनांमध्ये अडकत नाहीत.",
    "textEn": "Girls never get indulged in addiction",
    "options": [
      {
        "code": "CORRECT",
        "labelMr": "बरोबर",
        "labelEn": "Correct"
      },
      {
        "code": "WRONG",
        "labelMr": "चूक",
        "labelEn": "Wrong"
      },
      {
        "code": "DONT_KNOW",
        "labelMr": "माहीत नाही",
        "labelEn": "Don't Know"
      }
    ],
    "correctOptionCode": "WRONG",
    "marks": 2.0,
    "scoringRubric": {
      "WRONG": 2,
      "CORRECT": 1,
      "DONT_KNOW": 0
    },
    "category": "Addiction Myths & Facts"
  },
  {
    "id": "q-mmat-15",
    "paperType": "MMAT",
    "questionNumber": 15,
    "textMr": "दारू, सिगारेट किंवा तंबाखूपेक्षा इंटरनेट आणि मोबाईलचे व्यसन कमी धोकादायक किंवा नुकसानकारक असते.",
    "textEn": "The addiction to mobile and internet is far less harmful than that of alcohol and tobacco",
    "options": [
      {
        "code": "CORRECT",
        "labelMr": "बरोबर",
        "labelEn": "Correct"
      },
      {
        "code": "WRONG",
        "labelMr": "चूक",
        "labelEn": "Wrong"
      },
      {
        "code": "DONT_KNOW",
        "labelMr": "माहीत नाही",
        "labelEn": "Don't Know"
      }
    ],
    "correctOptionCode": "WRONG",
    "marks": 2.0,
    "scoringRubric": {
      "WRONG": 2,
      "CORRECT": 1,
      "DONT_KNOW": 0
    },
    "category": "Addiction Myths & Facts"
  },
  {
    "id": "q-mmat-16",
    "paperType": "MMAT",
    "questionNumber": 16,
    "textMr": "आपल्या मनात आले की आपण व्यसनावर १००% ताबा लगेच मिळवू शकतो.",
    "textEn": "A person can get 100% control on addiction at once when he/she decides to do so",
    "options": [
      {
        "code": "CORRECT",
        "labelMr": "बरोबर",
        "labelEn": "Correct"
      },
      {
        "code": "WRONG",
        "labelMr": "चूक",
        "labelEn": "Wrong"
      },
      {
        "code": "DONT_KNOW",
        "labelMr": "माहीत नाही",
        "labelEn": "Don't Know"
      }
    ],
    "correctOptionCode": "WRONG",
    "marks": 2.0,
    "scoringRubric": {
      "WRONG": 2,
      "CORRECT": 1,
      "DONT_KNOW": 0
    },
    "category": "Addiction Myths & Facts"
  },
  {
    "id": "q-mmat-17",
    "paperType": "MMAT",
    "questionNumber": 17,
    "textMr": "मोबाईल किंवा कॉम्प्युटरवर अश्लील (पॉर्न) व्हिडिओ पाहिल्यामुळे मानसिक स्वास्थ्य बिघडू शकते.",
    "textEn": "A person can get emotionally/mentally disturbed due to watching porn material on mobile/computer etc",
    "options": [
      {
        "code": "CORRECT",
        "labelMr": "बरोबर",
        "labelEn": "Correct"
      },
      {
        "code": "WRONG",
        "labelMr": "चूक",
        "labelEn": "Wrong"
      },
      {
        "code": "DONT_KNOW",
        "labelMr": "माहीत नाही",
        "labelEn": "Don't Know"
      }
    ],
    "correctOptionCode": "CORRECT",
    "marks": 2.0,
    "scoringRubric": {
      "CORRECT": 2,
      "WRONG": 1,
      "DONT_KNOW": 0
    },
    "category": "Addiction Myths & Facts"
  },
  {
    "id": "q-mmat-18",
    "paperType": "MMAT",
    "questionNumber": 18,
    "textMr": "व्यसनामुळे अनेक कुटुंबे उद्ध्वस्त होण्याचे प्रमाण खूप मोठे आहे.",
    "textEn": "The number of families getting completely devastated due to addiction is very huge",
    "options": [
      {
        "code": "CORRECT",
        "labelMr": "बरोबर",
        "labelEn": "Correct"
      },
      {
        "code": "WRONG",
        "labelMr": "चूक",
        "labelEn": "Wrong"
      },
      {
        "code": "DONT_KNOW",
        "labelMr": "माहीत नाही",
        "labelEn": "Don't Know"
      }
    ],
    "correctOptionCode": "CORRECT",
    "marks": 2.0,
    "scoringRubric": {
      "CORRECT": 2,
      "WRONG": 1,
      "DONT_KNOW": 0
    },
    "category": "Addiction Myths & Facts"
  },
  {
    "id": "q-mmat-19",
    "paperType": "MMAT",
    "questionNumber": 19,
    "textMr": "गुटखा खाल्ल्यामुळे कधीच कर्करोग (कॅन्सर) होत नाही.",
    "textEn": "Gutkha (tobacco) consumption never leads to cancer",
    "options": [
      {
        "code": "CORRECT",
        "labelMr": "बरोबर",
        "labelEn": "Correct"
      },
      {
        "code": "WRONG",
        "labelMr": "चूक",
        "labelEn": "Wrong"
      },
      {
        "code": "DONT_KNOW",
        "labelMr": "माहीत नाही",
        "labelEn": "Don't Know"
      }
    ],
    "correctOptionCode": "WRONG",
    "marks": 2.0,
    "scoringRubric": {
      "WRONG": 2,
      "CORRECT": 1,
      "DONT_KNOW": 0
    },
    "category": "Addiction Myths & Facts"
  },
  {
    "id": "q-mmat-20",
    "paperType": "MMAT",
    "questionNumber": 20,
    "textMr": "व्यक्ती किती शिकलेली आहे, याचा व्यसनाशी काहीही संबंध नाही.",
    "textEn": "There is no connection between addiction and person's education",
    "options": [
      {
        "code": "CORRECT",
        "labelMr": "बरोबर",
        "labelEn": "Correct"
      },
      {
        "code": "WRONG",
        "labelMr": "चूक",
        "labelEn": "Wrong"
      },
      {
        "code": "DONT_KNOW",
        "labelMr": "माहीत नाही",
        "labelEn": "Don't Know"
      }
    ],
    "correctOptionCode": "CORRECT",
    "marks": 2.0,
    "scoringRubric": {
      "CORRECT": 2,
      "WRONG": 1,
      "DONT_KNOW": 0
    },
    "category": "Addiction Myths & Facts"
  },
  {
    "id": "q-mmat-21",
    "paperType": "MMAT",
    "questionNumber": 21,
    "textMr": "व्यसनामुळे गरीबांचे जेवढे नुकसान होते, तेवढे श्रीमंतांचे होत नाही.",
    "textEn": "The rich do not face as much loss due to addiction as compared to poor people",
    "options": [
      {
        "code": "CORRECT",
        "labelMr": "बरोबर",
        "labelEn": "Correct"
      },
      {
        "code": "WRONG",
        "labelMr": "चूक",
        "labelEn": "Wrong"
      },
      {
        "code": "DONT_KNOW",
        "labelMr": "माहीत नाही",
        "labelEn": "Don't Know"
      }
    ],
    "correctOptionCode": "WRONG",
    "marks": 2.0,
    "scoringRubric": {
      "WRONG": 2,
      "CORRECT": 1,
      "DONT_KNOW": 0
    },
    "category": "Addiction Myths & Facts"
  },
  {
    "id": "q-mmat-22",
    "paperType": "MMAT",
    "questionNumber": 22,
    "textMr": "ज्या अर्थी चित्रपटांमध्ये दारू, सिगारेट इत्यादी गोष्टी नेहमीच दाखवल्या जातात, त्या अर्थी त्या वाईट गोष्टी नाहीत.",
    "textEn": "As many movies/tele-serials vividly show consumption of cigarette/alcohol on screen, they are definitely not bad things",
    "options": [
      {
        "code": "CORRECT",
        "labelMr": "बरोबर",
        "labelEn": "Correct"
      },
      {
        "code": "WRONG",
        "labelMr": "चूक",
        "labelEn": "Wrong"
      },
      {
        "code": "DONT_KNOW",
        "labelMr": "माहीत नाही",
        "labelEn": "Don't Know"
      }
    ],
    "correctOptionCode": "WRONG",
    "marks": 2.0,
    "scoringRubric": {
      "WRONG": 2,
      "CORRECT": 1,
      "DONT_KNOW": 0
    },
    "category": "Addiction Myths & Facts"
  },
  {
    "id": "q-mmat-23",
    "paperType": "MMAT",
    "questionNumber": 23,
    "textMr": "कायद्याने दारूबंदी केली असता लोक दारूपासून दूर राहतात.",
    "textEn": "When liquor is legally banned, people keep away from it",
    "options": [
      {
        "code": "CORRECT",
        "labelMr": "बरोबर",
        "labelEn": "Correct"
      },
      {
        "code": "WRONG",
        "labelMr": "चूक",
        "labelEn": "Wrong"
      },
      {
        "code": "DONT_KNOW",
        "labelMr": "माहीत नाही",
        "labelEn": "Don't Know"
      }
    ],
    "correctOptionCode": "WRONG",
    "marks": 2.0,
    "scoringRubric": {
      "WRONG": 2,
      "CORRECT": 1,
      "DONT_KNOW": 0
    },
    "category": "Addiction Myths & Facts"
  },
  {
    "id": "q-mmat-24",
    "paperType": "MMAT",
    "questionNumber": 24,
    "textMr": "थोड्या प्रमाणात दारू प्यायली की काम चांगले करता येते आणि कामातील उत्साह वाढतो.",
    "textEn": "Small peg dose of alcohol helps in increasing work efficiency",
    "options": [
      {
        "code": "CORRECT",
        "labelMr": "बरोबर",
        "labelEn": "Correct"
      },
      {
        "code": "WRONG",
        "labelMr": "चूक",
        "labelEn": "Wrong"
      },
      {
        "code": "DONT_KNOW",
        "labelMr": "माहीत नाही",
        "labelEn": "Don't Know"
      }
    ],
    "correctOptionCode": "WRONG",
    "marks": 2.0,
    "scoringRubric": {
      "WRONG": 2,
      "CORRECT": 1,
      "DONT_KNOW": 0
    },
    "category": "Addiction Myths & Facts"
  },
  {
    "id": "q-mmat-25",
    "paperType": "MMAT",
    "questionNumber": 25,
    "textMr": "ड्रग्ज खूप काळ घेत राहिल्यावरच त्यांचे व्यसन लागते.",
    "textEn": "Drug addiction takes place only when one consumes drugs for a prolonged period of time",
    "options": [
      {
        "code": "CORRECT",
        "labelMr": "बरोबर",
        "labelEn": "Correct"
      },
      {
        "code": "WRONG",
        "labelMr": "चूक",
        "labelEn": "Wrong"
      },
      {
        "code": "DONT_KNOW",
        "labelMr": "माहीत नाही",
        "labelEn": "Don't Know"
      }
    ],
    "correctOptionCode": "WRONG",
    "marks": 2.0,
    "scoringRubric": {
      "WRONG": 2,
      "CORRECT": 1,
      "DONT_KNOW": 0
    },
    "category": "Addiction Myths & Facts"
  },
  {
    "id": "q-mmat-26",
    "paperType": "MMAT",
    "questionNumber": 26,
    "textMr": "इतरांना त्रास न देता एखादी व्यक्ती व्यसन करत असेल, तर काही बिघडत नाही.",
    "textEn": "Addiction (alcohol/tobacco/media) which does not trouble other people around is completely harmless",
    "options": [
      {
        "code": "CORRECT",
        "labelMr": "बरोबर",
        "labelEn": "Correct"
      },
      {
        "code": "WRONG",
        "labelMr": "चूक",
        "labelEn": "Wrong"
      },
      {
        "code": "DONT_KNOW",
        "labelMr": "माहीत नाही",
        "labelEn": "Don't Know"
      }
    ],
    "correctOptionCode": "WRONG",
    "marks": 2.0,
    "scoringRubric": {
      "WRONG": 2,
      "CORRECT": 1,
      "DONT_KNOW": 0
    },
    "category": "Addiction Myths & Facts"
  },
  {
    "id": "q-mmat-27",
    "paperType": "MMAT",
    "questionNumber": 27,
    "textMr": "काही अमली (नशिले) पदार्थ घेतल्याने परीक्षेचा अभ्यास चांगला होतो.",
    "textEn": "Consuming addictive drugs helps in better preparation for exams",
    "options": [
      {
        "code": "CORRECT",
        "labelMr": "बरोबर",
        "labelEn": "Correct"
      },
      {
        "code": "WRONG",
        "labelMr": "चूक",
        "labelEn": "Wrong"
      },
      {
        "code": "DONT_KNOW",
        "labelMr": "माहीत नाही",
        "labelEn": "Don't Know"
      }
    ],
    "correctOptionCode": "WRONG",
    "marks": 2.0,
    "scoringRubric": {
      "WRONG": 2,
      "CORRECT": 1,
      "DONT_KNOW": 0
    },
    "category": "Addiction Myths & Facts"
  },
  {
    "id": "q-mmat-28",
    "paperType": "MMAT",
    "questionNumber": 28,
    "textMr": "गंभीर प्रसंगी किंवा तणावाच्या वेळी डोके हलके करण्यासाठी दारू किंवा अमली (नशिले) पदार्थ घेणे आपल्याला मदतच करते.",
    "textEn": "Alcohol or any other such drug is a sure shot help at times of stress/tension provoking moments",
    "options": [
      {
        "code": "CORRECT",
        "labelMr": "बरोबर",
        "labelEn": "Correct"
      },
      {
        "code": "WRONG",
        "labelMr": "चूक",
        "labelEn": "Wrong"
      },
      {
        "code": "DONT_KNOW",
        "labelMr": "माहीत नाही",
        "labelEn": "Don't Know"
      }
    ],
    "correctOptionCode": "WRONG",
    "marks": 2.0,
    "scoringRubric": {
      "WRONG": 2,
      "CORRECT": 1,
      "DONT_KNOW": 0
    },
    "category": "Addiction Myths & Facts"
  },
  {
    "id": "q-mmat-29",
    "paperType": "MMAT",
    "questionNumber": 29,
    "textMr": "दारू, सिगारेट, ड्रग्ज, गुटखा, इंटरनेट यांपैकी कशाचाही परिणाम आपल्या बौद्धिक क्षमतेवर होत नाही.",
    "textEn": "There is absolutely no negative impact of consumption of alcohol/drugs/internet/mobile on our thinking ability",
    "options": [
      {
        "code": "CORRECT",
        "labelMr": "बरोबर",
        "labelEn": "Correct"
      },
      {
        "code": "WRONG",
        "labelMr": "चूक",
        "labelEn": "Wrong"
      },
      {
        "code": "DONT_KNOW",
        "labelMr": "माहीत नाही",
        "labelEn": "Don't Know"
      }
    ],
    "correctOptionCode": "WRONG",
    "marks": 2.0,
    "scoringRubric": {
      "WRONG": 2,
      "CORRECT": 1,
      "DONT_KNOW": 0
    },
    "category": "Addiction Myths & Facts"
  },
  {
    "id": "q-mmat-30",
    "paperType": "MMAT",
    "questionNumber": 30,
    "textMr": "फेसबुक/इन्स्टाग्राम या ॲप्सचा लोक दुरुपयोग करत नाहीत.",
    "textEn": "People never misuse apps like Facebook, Instagram, WhatsApp, etc.",
    "options": [
      {
        "code": "CORRECT",
        "labelMr": "बरोबर",
        "labelEn": "Correct"
      },
      {
        "code": "WRONG",
        "labelMr": "चूक",
        "labelEn": "Wrong"
      },
      {
        "code": "DONT_KNOW",
        "labelMr": "माहीत नाही",
        "labelEn": "Don't Know"
      }
    ],
    "correctOptionCode": "WRONG",
    "marks": 2.0,
    "scoringRubric": {
      "WRONG": 2,
      "CORRECT": 1,
      "DONT_KNOW": 0
    },
    "category": "Addiction Myths & Facts"
  },
  {
    "id": "q-ert-1",
    "paperType": "ERT",
    "questionNumber": 1,
    "textMr": "आवडीचा पदार्थ दिसला की तो लगेच खाल्ला पाहिजे असे मला वाटते.",
    "textEn": "I feel like eating my favourite dish as soon as I see it",
    "options": [
      {
        "code": "ALWAYS",
        "labelMr": "नेहमी",
        "labelEn": "Always"
      },
      {
        "code": "OFTEN",
        "labelMr": "बऱ्याच वेळा",
        "labelEn": "Frequently"
      },
      {
        "code": "SOMETIMES",
        "labelMr": "कधी कधी",
        "labelEn": "Sometimes"
      },
      {
        "code": "NEVER",
        "labelMr": "कधीच नाही",
        "labelEn": "Never"
      }
    ],
    "correctOptionCode": "NEVER",
    "marks": 4.0,
    "scoringRubric": {
      "NEVER": 4,
      "SOMETIMES": 3,
      "OFTEN": 2,
      "ALWAYS": 1
    },
    "category": "Emotional Self-Regulation"
  },
  {
    "id": "q-ert-2",
    "paperType": "ERT",
    "questionNumber": 2,
    "textMr": "मित्र-मैत्रिणींनी माझ्या मनाविरुद्ध काही करण्यास सांगितले, तर मी 'नाही' म्हणू शकतो/शकते.",
    "textEn": "I can refuse, even if my friends ask me to do something against my will",
    "options": [
      {
        "code": "ALWAYS",
        "labelMr": "नेहमी",
        "labelEn": "Always"
      },
      {
        "code": "OFTEN",
        "labelMr": "बऱ्याच वेळा",
        "labelEn": "Frequently"
      },
      {
        "code": "SOMETIMES",
        "labelMr": "कधी कधी",
        "labelEn": "Sometimes"
      },
      {
        "code": "NEVER",
        "labelMr": "कधीच नाही",
        "labelEn": "Never"
      }
    ],
    "correctOptionCode": "ALWAYS",
    "marks": 4.0,
    "scoringRubric": {
      "ALWAYS": 4,
      "OFTEN": 3,
      "SOMETIMES": 2,
      "NEVER": 1
    },
    "category": "Emotional Self-Regulation"
  },
  {
    "id": "q-ert-3",
    "paperType": "ERT",
    "questionNumber": 3,
    "textMr": "मला राग कंट्रोल होत नाही",
    "textEn": "I cannot control my anger",
    "options": [
      {
        "code": "ALWAYS",
        "labelMr": "नेहमी",
        "labelEn": "Always"
      },
      {
        "code": "OFTEN",
        "labelMr": "बऱ्याच वेळा",
        "labelEn": "Frequently"
      },
      {
        "code": "SOMETIMES",
        "labelMr": "कधी कधी",
        "labelEn": "Sometimes"
      },
      {
        "code": "NEVER",
        "labelMr": "कधीच नाही",
        "labelEn": "Never"
      }
    ],
    "correctOptionCode": "NEVER",
    "marks": 4.0,
    "scoringRubric": {
      "NEVER": 4,
      "SOMETIMES": 3,
      "OFTEN": 2,
      "ALWAYS": 1
    },
    "category": "Emotional Self-Regulation"
  },
  {
    "id": "q-ert-4",
    "paperType": "ERT",
    "questionNumber": 4,
    "textMr": "मित्र-मैत्रिणींनी बोलावले तर मी जे काही करत असेन ते सोडून त्यांच्याबरोबर जावे असे मला वाटते.",
    "textEn": "Whenever my friends call me, I feel like leaving my work and going with them",
    "options": [
      {
        "code": "ALWAYS",
        "labelMr": "नेहमी",
        "labelEn": "Always"
      },
      {
        "code": "OFTEN",
        "labelMr": "बऱ्याच वेळा",
        "labelEn": "Frequently"
      },
      {
        "code": "SOMETIMES",
        "labelMr": "कधी कधी",
        "labelEn": "Sometimes"
      },
      {
        "code": "NEVER",
        "labelMr": "कधीच नाही",
        "labelEn": "Never"
      }
    ],
    "correctOptionCode": "NEVER",
    "marks": 4.0,
    "scoringRubric": {
      "NEVER": 4,
      "SOMETIMES": 3,
      "OFTEN": 2,
      "ALWAYS": 1
    },
    "category": "Emotional Self-Regulation"
  },
  {
    "id": "q-ert-5",
    "paperType": "ERT",
    "questionNumber": 5,
    "textMr": "छोट्या छोट्या गोष्टींमुळे मी अस्वस्थ (डिस्टर्ब) होतो/होते.",
    "textEn": "I get disturbed because of small things",
    "options": [
      {
        "code": "ALWAYS",
        "labelMr": "नेहमी",
        "labelEn": "Always"
      },
      {
        "code": "OFTEN",
        "labelMr": "बऱ्याच वेळा",
        "labelEn": "Frequently"
      },
      {
        "code": "SOMETIMES",
        "labelMr": "कधी कधी",
        "labelEn": "Sometimes"
      },
      {
        "code": "NEVER",
        "labelMr": "कधीच नाही",
        "labelEn": "Never"
      }
    ],
    "correctOptionCode": "NEVER",
    "marks": 4.0,
    "scoringRubric": {
      "NEVER": 4,
      "SOMETIMES": 3,
      "OFTEN": 2,
      "ALWAYS": 1
    },
    "category": "Emotional Self-Regulation"
  },
  {
    "id": "q-ert-6",
    "paperType": "ERT",
    "questionNumber": 6,
    "textMr": "इतरांनी केलेल्या थट्टेमुळे माझा आत्मविश्वास कमी होत नाही.",
    "textEn": "My self confidence does not get affected even if anyone mocks me",
    "options": [
      {
        "code": "ALWAYS",
        "labelMr": "नेहमी",
        "labelEn": "Always"
      },
      {
        "code": "OFTEN",
        "labelMr": "बऱ्याच वेळा",
        "labelEn": "Frequently"
      },
      {
        "code": "SOMETIMES",
        "labelMr": "कधी कधी",
        "labelEn": "Sometimes"
      },
      {
        "code": "NEVER",
        "labelMr": "कधीच नाही",
        "labelEn": "Never"
      }
    ],
    "correctOptionCode": "ALWAYS",
    "marks": 4.0,
    "scoringRubric": {
      "ALWAYS": 4,
      "OFTEN": 3,
      "SOMETIMES": 2,
      "NEVER": 1
    },
    "category": "Emotional Self-Regulation"
  },
  {
    "id": "q-ert-7",
    "paperType": "ERT",
    "questionNumber": 7,
    "textMr": "अनोळखी व्यक्तींशी बोलताना मला टेन्शन येते.",
    "textEn": "I feel tensed while speaking to strangers",
    "options": [
      {
        "code": "ALWAYS",
        "labelMr": "नेहमी",
        "labelEn": "Always"
      },
      {
        "code": "OFTEN",
        "labelMr": "बऱ्याच वेळा",
        "labelEn": "Frequently"
      },
      {
        "code": "SOMETIMES",
        "labelMr": "कधी कधी",
        "labelEn": "Sometimes"
      },
      {
        "code": "NEVER",
        "labelMr": "कधीच नाही",
        "labelEn": "Never"
      }
    ],
    "correctOptionCode": "NEVER",
    "marks": 4.0,
    "scoringRubric": {
      "NEVER": 4,
      "SOMETIMES": 3,
      "OFTEN": 2,
      "ALWAYS": 1
    },
    "category": "Emotional Self-Regulation"
  },
  {
    "id": "q-ert-8",
    "paperType": "ERT",
    "questionNumber": 8,
    "textMr": "काहीही मनाविरुद्ध घडले की मला टेन्शन येते.",
    "textEn": "I instantly get upset, if something doesn't happen against my will",
    "options": [
      {
        "code": "ALWAYS",
        "labelMr": "नेहमी",
        "labelEn": "Always"
      },
      {
        "code": "OFTEN",
        "labelMr": "बऱ्याच वेळा",
        "labelEn": "Frequently"
      },
      {
        "code": "SOMETIMES",
        "labelMr": "कधी कधी",
        "labelEn": "Sometimes"
      },
      {
        "code": "NEVER",
        "labelMr": "कधीच नाही",
        "labelEn": "Never"
      }
    ],
    "correctOptionCode": "NEVER",
    "marks": 4.0,
    "scoringRubric": {
      "NEVER": 4,
      "SOMETIMES": 3,
      "OFTEN": 2,
      "ALWAYS": 1
    },
    "category": "Emotional Self-Regulation"
  },
  {
    "id": "q-ert-9",
    "paperType": "ERT",
    "questionNumber": 9,
    "textMr": "एखाद्या कामात अपयश आल्यास त्याचा मला खूप त्रास होतो.",
    "textEn": "It troubles me a lot if I face failure",
    "options": [
      {
        "code": "ALWAYS",
        "labelMr": "नेहमी",
        "labelEn": "Always"
      },
      {
        "code": "OFTEN",
        "labelMr": "बऱ्याच वेळा",
        "labelEn": "Frequently"
      },
      {
        "code": "SOMETIMES",
        "labelMr": "कधी कधी",
        "labelEn": "Sometimes"
      },
      {
        "code": "NEVER",
        "labelMr": "कधीच नाही",
        "labelEn": "Never"
      }
    ],
    "correctOptionCode": "NEVER",
    "marks": 4.0,
    "scoringRubric": {
      "NEVER": 4,
      "SOMETIMES": 3,
      "OFTEN": 2,
      "ALWAYS": 1
    },
    "category": "Emotional Self-Regulation"
  },
  {
    "id": "q-ert-10",
    "paperType": "ERT",
    "questionNumber": 10,
    "textMr": "वैताग येणारी कामे असली तर मी ती सोडून देतो/देते.",
    "textEn": "When I come across any boring task, I tend to give it up",
    "options": [
      {
        "code": "ALWAYS",
        "labelMr": "नेहमी",
        "labelEn": "Always"
      },
      {
        "code": "OFTEN",
        "labelMr": "बऱ्याच वेळा",
        "labelEn": "Frequently"
      },
      {
        "code": "SOMETIMES",
        "labelMr": "कधी कधी",
        "labelEn": "Sometimes"
      },
      {
        "code": "NEVER",
        "labelMr": "कधीच नाही",
        "labelEn": "Never"
      }
    ],
    "correctOptionCode": "NEVER",
    "marks": 4.0,
    "scoringRubric": {
      "NEVER": 4,
      "SOMETIMES": 3,
      "OFTEN": 2,
      "ALWAYS": 1
    },
    "category": "Emotional Self-Regulation"
  },
  {
    "id": "q-ert-11",
    "paperType": "ERT",
    "questionNumber": 11,
    "textMr": "एखादी आवडती गोष्ट नंतर कर असे म्हटले की मला ती लगेच करून बघावीशी वाटते.",
    "textEn": "Whenever I am asked to do my favourite thing later, I feel like doing it right away",
    "options": [
      {
        "code": "ALWAYS",
        "labelMr": "नेहमी",
        "labelEn": "Always"
      },
      {
        "code": "OFTEN",
        "labelMr": "बऱ्याच वेळा",
        "labelEn": "Frequently"
      },
      {
        "code": "SOMETIMES",
        "labelMr": "कधी कधी",
        "labelEn": "Sometimes"
      },
      {
        "code": "NEVER",
        "labelMr": "कधीच नाही",
        "labelEn": "Never"
      }
    ],
    "correctOptionCode": "NEVER",
    "marks": 4.0,
    "scoringRubric": {
      "NEVER": 4,
      "SOMETIMES": 3,
      "OFTEN": 2,
      "ALWAYS": 1
    },
    "category": "Emotional Self-Regulation"
  },
  {
    "id": "q-ert-12",
    "paperType": "ERT",
    "questionNumber": 12,
    "textMr": "माझ्या मते, चांगले न शिकवल्यामुळेच बहुतेक वेळा मुलांना मार्क कमी पडतात.",
    "textEn": "In my opinion, most of the time students get less marks because teachers don't teach well",
    "options": [
      {
        "code": "ALWAYS",
        "labelMr": "नेहमी",
        "labelEn": "Always"
      },
      {
        "code": "OFTEN",
        "labelMr": "बऱ्याच वेळा",
        "labelEn": "Frequently"
      },
      {
        "code": "SOMETIMES",
        "labelMr": "कधी कधी",
        "labelEn": "Sometimes"
      },
      {
        "code": "NEVER",
        "labelMr": "कधीच नाही",
        "labelEn": "Never"
      }
    ],
    "correctOptionCode": "NEVER",
    "marks": 4.0,
    "scoringRubric": {
      "NEVER": 4,
      "SOMETIMES": 3,
      "OFTEN": 2,
      "ALWAYS": 1
    },
    "category": "Emotional Self-Regulation"
  },
  {
    "id": "q-ert-13",
    "paperType": "ERT",
    "questionNumber": 13,
    "textMr": "माझे मन खूप अस्वस्थ असले तरी मी माझा अभ्यास एकाग्रतेने करू शकतो/शकते.",
    "textEn": "I can concentrate on my studies, even if my mind is restless",
    "options": [
      {
        "code": "ALWAYS",
        "labelMr": "नेहमी",
        "labelEn": "Always"
      },
      {
        "code": "OFTEN",
        "labelMr": "बऱ्याच वेळा",
        "labelEn": "Frequently"
      },
      {
        "code": "SOMETIMES",
        "labelMr": "कधी कधी",
        "labelEn": "Sometimes"
      },
      {
        "code": "NEVER",
        "labelMr": "कधीच नाही",
        "labelEn": "Never"
      }
    ],
    "correctOptionCode": "ALWAYS",
    "marks": 4.0,
    "scoringRubric": {
      "ALWAYS": 4,
      "OFTEN": 3,
      "SOMETIMES": 2,
      "NEVER": 1
    },
    "category": "Emotional Self-Regulation"
  },
  {
    "id": "q-ert-14",
    "paperType": "ERT",
    "questionNumber": 14,
    "textMr": "एखादे अवघड काम करताना मदत मिळाली नाही तरी मला टेन्शन येते.",
    "textEn": "I get stressed if I don't get any help while doing a difficult task",
    "options": [
      {
        "code": "ALWAYS",
        "labelMr": "नेहमी",
        "labelEn": "Always"
      },
      {
        "code": "OFTEN",
        "labelMr": "बऱ्याच वेळा",
        "labelEn": "Frequently"
      },
      {
        "code": "SOMETIMES",
        "labelMr": "कधी कधी",
        "labelEn": "Sometimes"
      },
      {
        "code": "NEVER",
        "labelMr": "कधीच नाही",
        "labelEn": "Never"
      }
    ],
    "correctOptionCode": "NEVER",
    "marks": 4.0,
    "scoringRubric": {
      "NEVER": 4,
      "SOMETIMES": 3,
      "OFTEN": 2,
      "ALWAYS": 1
    },
    "category": "Emotional Self-Regulation"
  },
  {
    "id": "q-ert-15",
    "paperType": "ERT",
    "questionNumber": 15,
    "textMr": "चारचौघांमध्ये इतरांपेक्षा वेगळे मत मांडायचे असले तर मला लाज वाटते.",
    "textEn": "I feel shy when I have to express a different opinion than others",
    "options": [
      {
        "code": "ALWAYS",
        "labelMr": "नेहमी",
        "labelEn": "Always"
      },
      {
        "code": "OFTEN",
        "labelMr": "बऱ्याच वेळा",
        "labelEn": "Frequently"
      },
      {
        "code": "SOMETIMES",
        "labelMr": "कधी कधी",
        "labelEn": "Sometimes"
      },
      {
        "code": "NEVER",
        "labelMr": "कधीच नाही",
        "labelEn": "Never"
      }
    ],
    "correctOptionCode": "NEVER",
    "marks": 4.0,
    "scoringRubric": {
      "NEVER": 4,
      "SOMETIMES": 3,
      "OFTEN": 2,
      "ALWAYS": 1
    },
    "category": "Emotional Self-Regulation"
  },
  {
    "id": "q-ert-16",
    "paperType": "ERT",
    "questionNumber": 16,
    "textMr": "बऱ्याच दिवसांपासून ठरलेला बेत अचानक रद्द झाला की मला सहन होत नाही.",
    "textEn": "I can't stand the sudden cancellation of a plan I had set for many days",
    "options": [
      {
        "code": "ALWAYS",
        "labelMr": "नेहमी",
        "labelEn": "Always"
      },
      {
        "code": "OFTEN",
        "labelMr": "बऱ्याच वेळा",
        "labelEn": "Frequently"
      },
      {
        "code": "SOMETIMES",
        "labelMr": "कधी कधी",
        "labelEn": "Sometimes"
      },
      {
        "code": "NEVER",
        "labelMr": "कधीच नाही",
        "labelEn": "Never"
      }
    ],
    "correctOptionCode": "NEVER",
    "marks": 4.0,
    "scoringRubric": {
      "NEVER": 4,
      "SOMETIMES": 3,
      "OFTEN": 2,
      "ALWAYS": 1
    },
    "category": "Emotional Self-Regulation"
  },
  {
    "id": "q-ert-17",
    "paperType": "ERT",
    "questionNumber": 17,
    "textMr": "मला एखादी गोष्ट हवी असेल तर मी ती काहीही करून मिळवतोच/मिळवतेच.",
    "textEn": "If I want something, I get it by hook or crook",
    "options": [
      {
        "code": "ALWAYS",
        "labelMr": "नेहमी",
        "labelEn": "Always"
      },
      {
        "code": "OFTEN",
        "labelMr": "बऱ्याच वेळा",
        "labelEn": "Frequently"
      },
      {
        "code": "SOMETIMES",
        "labelMr": "कधी कधी",
        "labelEn": "Sometimes"
      },
      {
        "code": "NEVER",
        "labelMr": "कधीच नाही",
        "labelEn": "Never"
      }
    ],
    "correctOptionCode": "NEVER",
    "marks": 4.0,
    "scoringRubric": {
      "NEVER": 4,
      "SOMETIMES": 3,
      "OFTEN": 2,
      "ALWAYS": 1
    },
    "category": "Emotional Self-Regulation"
  },
  {
    "id": "q-ert-18",
    "paperType": "ERT",
    "questionNumber": 18,
    "textMr": "मी इतरांचे मन दुखवत नाही.",
    "textEn": "I don't hurt feelings of others",
    "options": [
      {
        "code": "ALWAYS",
        "labelMr": "नेहमी",
        "labelEn": "Always"
      },
      {
        "code": "OFTEN",
        "labelMr": "बऱ्याच वेळा",
        "labelEn": "Frequently"
      },
      {
        "code": "SOMETIMES",
        "labelMr": "कधी कधी",
        "labelEn": "Sometimes"
      },
      {
        "code": "NEVER",
        "labelMr": "कधीच नाही",
        "labelEn": "Never"
      }
    ],
    "correctOptionCode": "ALWAYS",
    "marks": 4.0,
    "scoringRubric": {
      "ALWAYS": 4,
      "OFTEN": 3,
      "SOMETIMES": 2,
      "NEVER": 1
    },
    "category": "Emotional Self-Regulation"
  },
  {
    "id": "q-ert-19",
    "paperType": "ERT",
    "questionNumber": 19,
    "textMr": "माझ्या कुटुंबीयांनी माझे मत ऐकले नाही तर मला खूपच वाईट वाटते.",
    "textEn": "I feel very bad if my family members do not listen to my opinion",
    "options": [
      {
        "code": "ALWAYS",
        "labelMr": "नेहमी",
        "labelEn": "Always"
      },
      {
        "code": "OFTEN",
        "labelMr": "बऱ्याच वेळा",
        "labelEn": "Frequently"
      },
      {
        "code": "SOMETIMES",
        "labelMr": "कधी कधी",
        "labelEn": "Sometimes"
      },
      {
        "code": "NEVER",
        "labelMr": "कधीच नाही",
        "labelEn": "Never"
      }
    ],
    "correctOptionCode": "NEVER",
    "marks": 4.0,
    "scoringRubric": {
      "NEVER": 4,
      "SOMETIMES": 3,
      "OFTEN": 2,
      "ALWAYS": 1
    },
    "category": "Emotional Self-Regulation"
  },
  {
    "id": "q-ert-20",
    "paperType": "ERT",
    "questionNumber": 20,
    "textMr": "पुढे मिळणाऱ्या संधीपेक्षा आत्ता मिळणारे बक्षीस मला जास्त महत्त्वाचे वाटते.",
    "textEn": "For me, the reward I get now is more important than the opportunity I might get in future",
    "options": [
      {
        "code": "ALWAYS",
        "labelMr": "नेहमी",
        "labelEn": "Always"
      },
      {
        "code": "OFTEN",
        "labelMr": "बऱ्याच वेळा",
        "labelEn": "Frequently"
      },
      {
        "code": "SOMETIMES",
        "labelMr": "कधी कधी",
        "labelEn": "Sometimes"
      },
      {
        "code": "NEVER",
        "labelMr": "कधीच नाही",
        "labelEn": "Never"
      }
    ],
    "correctOptionCode": "NEVER",
    "marks": 4.0,
    "scoringRubric": {
      "NEVER": 4,
      "SOMETIMES": 3,
      "OFTEN": 2,
      "ALWAYS": 1
    },
    "category": "Emotional Self-Regulation"
  },
  {
    "id": "q-ert-21",
    "paperType": "ERT",
    "questionNumber": 21,
    "textMr": "घरात वादावादीचे प्रसंग निर्माण झाले तर माझे कशातच लक्ष लागत नाही.",
    "textEn": "Whenever I have an argument at home, I cannot focus on other things",
    "options": [
      {
        "code": "ALWAYS",
        "labelMr": "नेहमी",
        "labelEn": "Always"
      },
      {
        "code": "OFTEN",
        "labelMr": "बऱ्याच वेळा",
        "labelEn": "Frequently"
      },
      {
        "code": "SOMETIMES",
        "labelMr": "कधी कधी",
        "labelEn": "Sometimes"
      },
      {
        "code": "NEVER",
        "labelMr": "कधीच नाही",
        "labelEn": "Never"
      }
    ],
    "correctOptionCode": "NEVER",
    "marks": 4.0,
    "scoringRubric": {
      "NEVER": 4,
      "SOMETIMES": 3,
      "OFTEN": 2,
      "ALWAYS": 1
    },
    "category": "Emotional Self-Regulation"
  },
  {
    "id": "q-ert-22",
    "paperType": "ERT",
    "questionNumber": 22,
    "textMr": "व्यायामाचे महत्त्व कळत असूनसुद्धा सकाळी लवकर उठून व्यायाम करणे मला जमत नाही.",
    "textEn": "In spite of knowing the importance of exercise, I can't get up early in the morning and do exercise",
    "options": [
      {
        "code": "ALWAYS",
        "labelMr": "नेहमी",
        "labelEn": "Always"
      },
      {
        "code": "OFTEN",
        "labelMr": "बऱ्याच वेळा",
        "labelEn": "Frequently"
      },
      {
        "code": "SOMETIMES",
        "labelMr": "कधी कधी",
        "labelEn": "Sometimes"
      },
      {
        "code": "NEVER",
        "labelMr": "कधीच नाही",
        "labelEn": "Never"
      }
    ],
    "correctOptionCode": "NEVER",
    "marks": 4.0,
    "scoringRubric": {
      "NEVER": 4,
      "SOMETIMES": 3,
      "OFTEN": 2,
      "ALWAYS": 1
    },
    "category": "Emotional Self-Regulation"
  },
  {
    "id": "q-ert-23",
    "paperType": "ERT",
    "questionNumber": 23,
    "textMr": "माझ्या मते, 'लोक काय म्हणतील' याचा विचार केला पाहिजे.",
    "textEn": "One should always care about what people say",
    "options": [
      {
        "code": "ALWAYS",
        "labelMr": "नेहमी",
        "labelEn": "Always"
      },
      {
        "code": "OFTEN",
        "labelMr": "बऱ्याच वेळा",
        "labelEn": "Frequently"
      },
      {
        "code": "SOMETIMES",
        "labelMr": "कधी कधी",
        "labelEn": "Sometimes"
      },
      {
        "code": "NEVER",
        "labelMr": "कधीच नाही",
        "labelEn": "Never"
      }
    ],
    "correctOptionCode": "NEVER",
    "marks": 4.0,
    "scoringRubric": {
      "NEVER": 4,
      "SOMETIMES": 3,
      "OFTEN": 2,
      "ALWAYS": 1
    },
    "category": "Emotional Self-Regulation"
  },
  {
    "id": "q-ert-24",
    "paperType": "ERT",
    "questionNumber": 24,
    "textMr": "माझ्याकडून चुका झाल्या की मला खूप त्रास होतो.",
    "textEn": "I feel awful when I commit a mistake",
    "options": [
      {
        "code": "ALWAYS",
        "labelMr": "नेहमी",
        "labelEn": "Always"
      },
      {
        "code": "OFTEN",
        "labelMr": "बऱ्याच वेळा",
        "labelEn": "Frequently"
      },
      {
        "code": "SOMETIMES",
        "labelMr": "कधी कधी",
        "labelEn": "Sometimes"
      },
      {
        "code": "NEVER",
        "labelMr": "कधीच नाही",
        "labelEn": "Never"
      }
    ],
    "correctOptionCode": "NEVER",
    "marks": 4.0,
    "scoringRubric": {
      "NEVER": 4,
      "SOMETIMES": 3,
      "OFTEN": 2,
      "ALWAYS": 1
    },
    "category": "Emotional Self-Regulation"
  },
  {
    "id": "q-ert-25",
    "paperType": "ERT",
    "questionNumber": 25,
    "textMr": "वर्गातील मुलीने/मुलाने माझ्याविरुद्ध काही म्हटले तर ते मला सहन होत नाही.",
    "textEn": "I can't stand if any of my classmates has a word against me",
    "options": [
      {
        "code": "ALWAYS",
        "labelMr": "नेहमी",
        "labelEn": "Always"
      },
      {
        "code": "OFTEN",
        "labelMr": "बऱ्याच वेळा",
        "labelEn": "Frequently"
      },
      {
        "code": "SOMETIMES",
        "labelMr": "कधी कधी",
        "labelEn": "Sometimes"
      },
      {
        "code": "NEVER",
        "labelMr": "कधीच नाही",
        "labelEn": "Never"
      }
    ],
    "correctOptionCode": "NEVER",
    "marks": 4.0,
    "scoringRubric": {
      "NEVER": 4,
      "SOMETIMES": 3,
      "OFTEN": 2,
      "ALWAYS": 1
    },
    "category": "Emotional Self-Regulation"
  },
  {
    "id": "q-ert-26",
    "paperType": "ERT",
    "questionNumber": 26,
    "textMr": "माझ्या मते, जो लकी असतो त्याला यश मिळतेच.",
    "textEn": "In my opinion, lucky people always get success",
    "options": [
      {
        "code": "ALWAYS",
        "labelMr": "नेहमी",
        "labelEn": "Always"
      },
      {
        "code": "OFTEN",
        "labelMr": "बऱ्याच वेळा",
        "labelEn": "Frequently"
      },
      {
        "code": "SOMETIMES",
        "labelMr": "कधी कधी",
        "labelEn": "Sometimes"
      },
      {
        "code": "NEVER",
        "labelMr": "कधीच नाही",
        "labelEn": "Never"
      }
    ],
    "correctOptionCode": "NEVER",
    "marks": 4.0,
    "scoringRubric": {
      "NEVER": 4,
      "SOMETIMES": 3,
      "OFTEN": 2,
      "ALWAYS": 1
    },
    "category": "Emotional Self-Regulation"
  },
  {
    "id": "q-ert-27",
    "paperType": "ERT",
    "questionNumber": 27,
    "textMr": "मला माझ्या नावडत्या विषयांचा अभ्यास करावासाच वाटत नाही.",
    "textEn": "I just don't feel like studying the subjects that I dislike",
    "options": [
      {
        "code": "ALWAYS",
        "labelMr": "नेहमी",
        "labelEn": "Always"
      },
      {
        "code": "OFTEN",
        "labelMr": "बऱ्याच वेळा",
        "labelEn": "Frequently"
      },
      {
        "code": "SOMETIMES",
        "labelMr": "कधी कधी",
        "labelEn": "Sometimes"
      },
      {
        "code": "NEVER",
        "labelMr": "कधीच नाही",
        "labelEn": "Never"
      }
    ],
    "correctOptionCode": "NEVER",
    "marks": 4.0,
    "scoringRubric": {
      "NEVER": 4,
      "SOMETIMES": 3,
      "OFTEN": 2,
      "ALWAYS": 1
    },
    "category": "Emotional Self-Regulation"
  },
  {
    "id": "q-ert-28",
    "paperType": "ERT",
    "questionNumber": 28,
    "textMr": "रांगेत उभे असताना नंबर लागल्यावर माझे काम अडले की अगदी संताप होतो.",
    "textEn": "I get furious at sudden interruption while standing in the queue",
    "options": [
      {
        "code": "ALWAYS",
        "labelMr": "नेहमी",
        "labelEn": "Always"
      },
      {
        "code": "OFTEN",
        "labelMr": "बऱ्याच वेळा",
        "labelEn": "Frequently"
      },
      {
        "code": "SOMETIMES",
        "labelMr": "कधी कधी",
        "labelEn": "Sometimes"
      },
      {
        "code": "NEVER",
        "labelMr": "कधीच नाही",
        "labelEn": "Never"
      }
    ],
    "correctOptionCode": "NEVER",
    "marks": 4.0,
    "scoringRubric": {
      "NEVER": 4,
      "SOMETIMES": 3,
      "OFTEN": 2,
      "ALWAYS": 1
    },
    "category": "Emotional Self-Regulation"
  },
  {
    "id": "q-ert-29",
    "paperType": "ERT",
    "questionNumber": 29,
    "textMr": "पुढे पुढे करणाऱ्या मुलांनाच वर्गात संधी मिळतात असे मला वाटते.",
    "textEn": "I think only the students who try to please teachers, get opportunities in class",
    "options": [
      {
        "code": "ALWAYS",
        "labelMr": "नेहमी",
        "labelEn": "Always"
      },
      {
        "code": "OFTEN",
        "labelMr": "बऱ्याच वेळा",
        "labelEn": "Frequently"
      },
      {
        "code": "SOMETIMES",
        "labelMr": "कधी कधी",
        "labelEn": "Sometimes"
      },
      {
        "code": "NEVER",
        "labelMr": "कधीच नाही",
        "labelEn": "Never"
      }
    ],
    "correctOptionCode": "NEVER",
    "marks": 4.0,
    "scoringRubric": {
      "NEVER": 4,
      "SOMETIMES": 3,
      "OFTEN": 2,
      "ALWAYS": 1
    },
    "category": "Emotional Self-Regulation"
  },
  {
    "id": "q-ert-30",
    "paperType": "ERT",
    "questionNumber": 30,
    "textMr": "मला न पटणारे मित्र-मैत्रिणींचे बोलणे मी ऐकून घेतो/घेते.",
    "textEn": "I listen to my friends even if their opinions are not in agreement with me",
    "options": [
      {
        "code": "ALWAYS",
        "labelMr": "नेहमी",
        "labelEn": "Always"
      },
      {
        "code": "OFTEN",
        "labelMr": "बऱ्याच वेळा",
        "labelEn": "Frequently"
      },
      {
        "code": "SOMETIMES",
        "labelMr": "कधी कधी",
        "labelEn": "Sometimes"
      },
      {
        "code": "NEVER",
        "labelMr": "कधीच नाही",
        "labelEn": "Never"
      }
    ],
    "correctOptionCode": "ALWAYS",
    "marks": 4.0,
    "scoringRubric": {
      "ALWAYS": 4,
      "OFTEN": 3,
      "SOMETIMES": 2,
      "NEVER": 1
    },
    "category": "Emotional Self-Regulation"
  },
  {
    "id": "q-ert-31",
    "paperType": "ERT",
    "questionNumber": 31,
    "textMr": "टी.व्ही./मोबाईलवर काही बघत असताना लाईट/नेटवर्क कधीच गेले नाही पाहिजे असे मला वाटते.",
    "textEn": "I feel there should be no power cuts/network disturbances while one watches TV/mobiles",
    "options": [
      {
        "code": "ALWAYS",
        "labelMr": "नेहमी",
        "labelEn": "Always"
      },
      {
        "code": "OFTEN",
        "labelMr": "बऱ्याच वेळा",
        "labelEn": "Frequently"
      },
      {
        "code": "SOMETIMES",
        "labelMr": "कधी कधी",
        "labelEn": "Sometimes"
      },
      {
        "code": "NEVER",
        "labelMr": "कधीच नाही",
        "labelEn": "Never"
      }
    ],
    "correctOptionCode": "NEVER",
    "marks": 4.0,
    "scoringRubric": {
      "NEVER": 4,
      "SOMETIMES": 3,
      "OFTEN": 2,
      "ALWAYS": 1
    },
    "category": "Emotional Self-Regulation"
  },
  {
    "id": "q-ert-32",
    "paperType": "ERT",
    "questionNumber": 32,
    "textMr": "आपण ज्याचा अभ्यास केला नाहीये तेच प्रश्न परीक्षेत आले तर काय, अशी मला भीती वाटते.",
    "textEn": "I fear, what if questions from the syllabus I did not prepare are asked in the exam",
    "options": [
      {
        "code": "ALWAYS",
        "labelMr": "नेहमी",
        "labelEn": "Always"
      },
      {
        "code": "OFTEN",
        "labelMr": "बऱ्याच वेळा",
        "labelEn": "Frequently"
      },
      {
        "code": "SOMETIMES",
        "labelMr": "कधी कधी",
        "labelEn": "Sometimes"
      },
      {
        "code": "NEVER",
        "labelMr": "कधीच नाही",
        "labelEn": "Never"
      }
    ],
    "correctOptionCode": "NEVER",
    "marks": 4.0,
    "scoringRubric": {
      "NEVER": 4,
      "SOMETIMES": 3,
      "OFTEN": 2,
      "ALWAYS": 1
    },
    "category": "Emotional Self-Regulation"
  },
  {
    "id": "q-ert-33",
    "paperType": "ERT",
    "questionNumber": 33,
    "textMr": "मोठ्या माणसांचे एखादे म्हणणे मला पटत नसेल तर तसे मला सांगता येते.",
    "textEn": "I don't agree with my elders on anything, I can explicitly express it",
    "options": [
      {
        "code": "ALWAYS",
        "labelMr": "नेहमी",
        "labelEn": "Always"
      },
      {
        "code": "OFTEN",
        "labelMr": "बऱ्याच वेळा",
        "labelEn": "Frequently"
      },
      {
        "code": "SOMETIMES",
        "labelMr": "कधी कधी",
        "labelEn": "Sometimes"
      },
      {
        "code": "NEVER",
        "labelMr": "कधीच नाही",
        "labelEn": "Never"
      }
    ],
    "correctOptionCode": "ALWAYS",
    "marks": 4.0,
    "scoringRubric": {
      "ALWAYS": 4,
      "OFTEN": 3,
      "SOMETIMES": 2,
      "NEVER": 1
    },
    "category": "Emotional Self-Regulation"
  },
  {
    "id": "q-ert-34",
    "paperType": "ERT",
    "questionNumber": 34,
    "textMr": "काही गोष्टी मनासारख्या झाल्या नाहीत तरी फार बिघडत नाही असे मला वाटते.",
    "textEn": "I feel it is okay if somethings don't happen as I wish",
    "options": [
      {
        "code": "ALWAYS",
        "labelMr": "नेहमी",
        "labelEn": "Always"
      },
      {
        "code": "OFTEN",
        "labelMr": "बऱ्याच वेळा",
        "labelEn": "Frequently"
      },
      {
        "code": "SOMETIMES",
        "labelMr": "कधी कधी",
        "labelEn": "Sometimes"
      },
      {
        "code": "NEVER",
        "labelMr": "कधीच नाही",
        "labelEn": "Never"
      }
    ],
    "correctOptionCode": "ALWAYS",
    "marks": 4.0,
    "scoringRubric": {
      "ALWAYS": 4,
      "OFTEN": 3,
      "SOMETIMES": 2,
      "NEVER": 1
    },
    "category": "Emotional Self-Regulation"
  },
  {
    "id": "q-ert-35",
    "paperType": "ERT",
    "questionNumber": 35,
    "textMr": "मला हवे तेव्हा हवी ती वस्तू मिळाली नाही तर मी खूप नाराज होते/होतो.",
    "textEn": "I get very upset if I do not get something when I strongly want it",
    "options": [
      {
        "code": "ALWAYS",
        "labelMr": "नेहमी",
        "labelEn": "Always"
      },
      {
        "code": "OFTEN",
        "labelMr": "बऱ्याच वेळा",
        "labelEn": "Frequently"
      },
      {
        "code": "SOMETIMES",
        "labelMr": "कधी कधी",
        "labelEn": "Sometimes"
      },
      {
        "code": "NEVER",
        "labelMr": "कधीच नाही",
        "labelEn": "Never"
      }
    ],
    "correctOptionCode": "NEVER",
    "marks": 4.0,
    "scoringRubric": {
      "NEVER": 4,
      "SOMETIMES": 3,
      "OFTEN": 2,
      "ALWAYS": 1
    },
    "category": "Emotional Self-Regulation"
  }
];

// ==============================================================================
// OFFICIAL CURRICULUM MODULES (१० मुख्य विभाग + प्रस्तावना व समारोप)
// ==============================================================================
export const CURRICULUM_MODULES: CurriculumModule[] = [
  {
    moduleNumber: 0,
    nameMr: 'प्रस्तावना व ओळख',
    nameEn: 'Orientation & Introduction',
    descriptionMr: 'संयम उपक्रम ओळख व वर्ग नियमावली',
    descriptionEn: 'Saiyam Program Overview & Ground Rules',
  },
  {
    moduleNumber: 1,
    nameMr: 'पंचकोश विकसन',
    nameEn: 'Panchakosh',
    descriptionMr: 'अन्नमय, प्राणमय, मनोमय, विज्ञानमय आणि आनंदमय कोश विकास',
    descriptionEn: 'Development of the five sheaths of human personality',
  },
  {
    moduleNumber: 2,
    nameMr: 'आपले आरोग्य',
    nameEn: 'Our Health',
    descriptionMr: 'शारीरिक व मानसिक आरोग्य, पोषण व व्यायाम',
    descriptionEn: 'Physical and mental health, nutrition and fitness',
  },
  {
    moduleNumber: 3,
    nameMr: 'लैंगिक दुर्वर्तन',
    nameEn: 'Sexual Misconduct',
    descriptionMr: 'सुरक्षितता, संमती व पोक्सो जनजागृती',
    descriptionEn: 'Safety, consent, and POCSO awareness',
  },
  {
    moduleNumber: 4,
    nameMr: 'सौंदर्य',
    nameEn: 'Beauty',
    descriptionMr: 'आंतरिक व बाह्य सौंदर्य, दृष्टिकोन',
    descriptionEn: 'Inner and outer beauty and positive self-image',
  },
  {
    moduleNumber: 5,
    nameMr: 'प्रसारमाध्यमे',
    nameEn: 'Mass Media',
    descriptionMr: 'माध्यम साक्षरता, स्क्रीन नियंत्रण व डिजिटल संयम',
    descriptionEn: 'Media literacy, screen addiction and digital balance',
  },
  {
    moduleNumber: 6,
    nameMr: 'मैत्री',
    nameEn: 'Friendship',
    descriptionMr: 'सकारात्मक मैत्री, सीमा व सहकार्य',
    descriptionEn: 'Healthy peer relationships, boundaries and trust',
  },
  {
    moduleNumber: 7,
    nameMr: 'स्त्री-पुरुष परस्पर पूरकता',
    nameEn: 'Woman-Man Complementarity',
    descriptionMr: 'समानता, परस्पर आदर व सहजीवन',
    descriptionEn: 'Gender equality, mutual respect and cooperation',
  },
  {
    moduleNumber: 8,
    nameMr: 'ध्येयनिश्चिती व ताणतणावांशी सामना',
    nameEn: 'Goal Setting & Facing Stress',
    descriptionMr: 'ध्येय निश्चित करणे व परीक्षेचा ताण व्यवस्थापन',
    descriptionEn: 'Goal setting and healthy stress management',
  },
  {
    moduleNumber: 9,
    nameMr: 'स्वसंयम – व्यसन परावृत्ती',
    nameEn: 'Self-Control – Addiction Prevention',
    descriptionMr: 'व्यसनमुक्ती, परावृत्ती व नकार देण्याचे कौशल्य',
    descriptionEn: 'Addiction prevention and refusal skills',
  },
  {
    moduleNumber: 10,
    nameMr: 'स्वसंयम – स्वनियमन',
    nameEn: 'Self-Control – Self-Regulation',
    descriptionMr: 'आत्मनियंत्रण, भावना नियमन व अनुशासन',
    descriptionEn: 'Self-discipline and emotional self-regulation',
  },
  {
    moduleNumber: 11,
    nameMr: 'संकलन, प्रश्नोत्तरे, उत्तरचाचणी',
    nameEn: 'Summary, Q&A and Post-Test',
    descriptionMr: 'अभ्यासक्रम उजळणी, शंका समाधान व अंतिम मूल्यमापन',
    descriptionEn: 'Curriculum synthesis, open discussion and evaluation',
  },
];

// ==============================================================================
// 25 OFFICIAL CURRICULUM SESSIONS MAPPED TO MODULES (२५ अधिकृत सत्रे)
// ==============================================================================
export const ALL_25_SESSIONS: CurriculumSession[] = [
  {
    sessionNumber: 1,
    phaseNumber: 1,
    titleMr: 'प्रस्तावना',
    titleEn: 'Introduction',
    sessionNameMr: 'प्रस्तावना',
    sessionNameEn: 'Introduction',
    descriptionMr: 'संयम उपक्रमाची ओळख, उद्दिष्टे व वर्ग नियमावली निश्चित करणे',
    descriptionEn: 'Introduction to Saiyam Program, core objectives and group norms',
    moduleNumber: 0,
    moduleNameMr: 'प्रस्तावना व ओळख',
    moduleNameEn: 'Orientation & Introduction',
  },
  {
    sessionNumber: 2,
    phaseNumber: 1,
    titleMr: 'पंचकोश १',
    titleEn: 'Panchakosh 1',
    sessionNameMr: 'पंचकोश १',
    sessionNameEn: 'Panchakosh 1',
    descriptionMr: 'पंचकोश संकल्पनेची ओळख: अन्नमय व प्राणमय कोश',
    descriptionEn: 'Introduction to Panchakosh concept: Annamaya and Pranamaya Kosha',
    moduleNumber: 1,
    moduleNameMr: 'पंचकोश विकसन',
    moduleNameEn: 'Panchakosh',
  },
  {
    sessionNumber: 3,
    phaseNumber: 1,
    titleMr: 'पंचकोश २',
    titleEn: 'Panchakosh 2',
    sessionNameMr: 'पंचकोश २',
    sessionNameEn: 'Panchakosh 2',
    descriptionMr: 'मनोमय, विज्ञानमय व आनंदमय कोश विकास',
    descriptionEn: 'Development of Manomaya, Vijnanamaya and Anandamaya Kosha',
    moduleNumber: 1,
    moduleNameMr: 'पंचकोश विकसन',
    moduleNameEn: 'Panchakosh',
  },
  {
    sessionNumber: 4,
    phaseNumber: 1,
    titleMr: 'सौंदर्य',
    titleEn: 'Beauty',
    sessionNameMr: 'सौंदर्य',
    sessionNameEn: 'Beauty',
    descriptionMr: 'खरे सौंदर्य: बाह्य रूपापलीकडचे आंतरिक गुण व व्यक्तिमत्त्व',
    descriptionEn: 'Real beauty: inner virtues and personality beyond physical looks',
    moduleNumber: 4,
    moduleNameMr: 'सौंदर्य',
    moduleNameEn: 'Beauty',
  },
  {
    sessionNumber: 5,
    phaseNumber: 1,
    titleMr: 'आपले आरोग्य १',
    titleEn: 'Our Health 1',
    sessionNameMr: 'आपले आरोग्य १',
    sessionNameEn: 'Our Health 1',
    descriptionMr: 'शारीरिक आरोग्य, योग्य आहार व व्यक्तिगत स्वच्छता',
    descriptionEn: 'Physical health, balanced diet and personal hygiene',
    moduleNumber: 2,
    moduleNameMr: 'आपले आरोग्य',
    moduleNameEn: 'Our Health',
  },
  {
    sessionNumber: 6,
    phaseNumber: 1,
    titleMr: 'आपले आरोग्य २',
    titleEn: 'Our Health 2',
    sessionNameMr: 'आपले आरोग्य २',
    sessionNameEn: 'Our Health 2',
    descriptionMr: 'मानसिक आरोग्य, सकारात्मक विचार व भावनांचे संतुलन',
    descriptionEn: 'Mental health, positive thinking and emotional well-being',
    moduleNumber: 2,
    moduleNameMr: 'आपले आरोग्य',
    moduleNameEn: 'Our Health',
  },
  {
    sessionNumber: 7,
    phaseNumber: 1,
    titleMr: 'आपले आरोग्य ३',
    titleEn: 'Our Health 3',
    sessionNameMr: 'आपले आरोग्य ३',
    sessionNameEn: 'Our Health 3',
    descriptionMr: 'शारीरिक व्यायाम, योग, प्राणायाम व दैनंदिन दिनचर्या',
    descriptionEn: 'Exercise, yoga, pranayama and healthy daily routine',
    moduleNumber: 2,
    moduleNameMr: 'आपले आरोग्य',
    moduleNameEn: 'Our Health',
  },
  {
    sessionNumber: 8,
    phaseNumber: 1,
    titleMr: 'मैत्री १',
    titleEn: 'Friendship 1',
    sessionNameMr: 'मैत्री १',
    sessionNameEn: 'Friendship 1',
    descriptionMr: 'चांगली मैत्री कशी ओळखावी? मित्रांची निवड व विश्वास',
    descriptionEn: 'Understanding true friendship, choosing friends and building trust',
    moduleNumber: 6,
    moduleNameMr: 'मैत्री',
    moduleNameEn: 'Friendship',
  },
  {
    sessionNumber: 9,
    phaseNumber: 2,
    titleMr: 'मैत्री २',
    titleEn: 'Friendship 2',
    sessionNameMr: 'मैत्री २',
    sessionNameEn: 'Friendship 2',
    descriptionMr: 'मैत्रीतील मर्यादा, सहकाऱ्यांचा दबाव (Peer Pressure) हाताळणे',
    descriptionEn: 'Boundaries in friendship and resisting negative peer pressure',
    moduleNumber: 6,
    moduleNameMr: 'मैत्री',
    moduleNameEn: 'Friendship',
  },
  {
    sessionNumber: 10,
    phaseNumber: 2,
    titleMr: 'व्यसने १',
    titleEn: 'Addictions 1',
    sessionNameMr: 'व्यसने १',
    sessionNameEn: 'Addictions 1',
    descriptionMr: 'व्यसनांची विविध रूपे (तंबाखू, गुटखा, दारू, सिगारेट) व दुष्परिणाम',
    descriptionEn: 'Forms of chemical addictions and their physical/social harms',
    moduleNumber: 9,
    moduleNameMr: 'स्वसंयम – व्यसन परावृत्ती',
    moduleNameEn: 'Self-Control – Addiction Prevention',
  },
  {
    sessionNumber: 11,
    phaseNumber: 2,
    titleMr: 'व्यसने २',
    titleEn: 'Addictions 2',
    sessionNameMr: 'व्यसने २',
    sessionNameEn: 'Addictions 2',
    descriptionMr: 'व्यसनांना ठामपणे "नाही" म्हणण्याचे कौशल्य व व्यसनमुक्ती मार्ग',
    descriptionEn: 'Assertive refusal skills to say "NO" and anti-addiction pathways',
    moduleNumber: 9,
    moduleNameMr: 'स्वसंयम – व्यसन परावृत्ती',
    moduleNameEn: 'Self-Control – Addiction Prevention',
  },
  {
    sessionNumber: 12,
    phaseNumber: 2,
    titleMr: 'स्वनियमन १',
    titleEn: 'Self Regulation 1',
    sessionNameMr: 'स्वनियमन १',
    sessionNameEn: 'Self Regulation 1',
    descriptionMr: 'राग व संताप नियंत्रण, मनाची एकाग्रता',
    descriptionEn: 'Anger management, impulse control and focus',
    moduleNumber: 10,
    moduleNameMr: 'स्वसंयम – स्वनियमन',
    moduleNameEn: 'Self-Control – Self-Regulation',
  },
  {
    sessionNumber: 13,
    phaseNumber: 2,
    titleMr: 'स्वनियमन २',
    titleEn: 'Self Regulation 2',
    sessionNameMr: 'स्वनियमन २',
    sessionNameEn: 'Self Regulation 2',
    descriptionMr: 'वेळेचे नियोजन, शिस्त व स्वतःवर नियंत्रण ठेवण्याची सवय',
    descriptionEn: 'Time management, self-discipline and habitual restraint',
    moduleNumber: 10,
    moduleNameMr: 'स्वसंयम – स्वनियमन',
    moduleNameEn: 'Self-Control – Self-Regulation',
  },
  {
    sessionNumber: 14,
    phaseNumber: 2,
    titleMr: 'प्रसारमाध्यमे १',
    titleEn: 'Mass Media 1',
    sessionNameMr: 'प्रसारमाध्यमे १',
    sessionNameEn: 'Mass Media 1',
    descriptionMr: 'प्रसारमाध्यमांचा (टीव्ही, सोशल मीडिया) किशोरवयावरील प्रभाव',
    descriptionEn: 'Influence of mass media and social apps on adolescents',
    moduleNumber: 5,
    moduleNameMr: 'प्रसारमाध्यमे',
    moduleNameEn: 'Mass Media',
  },
  {
    sessionNumber: 15,
    phaseNumber: 2,
    titleMr: 'प्रसारमाध्यमे २',
    titleEn: 'Mass Media 2',
    sessionNameMr: 'प्रसारमाध्यमे २',
    sessionNameEn: 'Mass Media 2',
    descriptionMr: 'मोबाईल व इंटरनेटचे व्यसन, सायबर सुरक्षा',
    descriptionEn: 'Smartphone/gaming screen addiction and cyber safety rules',
    moduleNumber: 5,
    moduleNameMr: 'प्रसारमाध्यमे',
    moduleNameEn: 'Mass Media',
  },
  {
    sessionNumber: 16,
    phaseNumber: 2,
    titleMr: 'प्रसारमाध्यमे ३',
    titleEn: 'Mass Media 3',
    sessionNameMr: 'प्रसारमाध्यमे ३',
    sessionNameEn: 'Mass Media 3',
    descriptionMr: 'योग्य माहितीची निवड, डिजिटल डिटॉक्स व स्क्रीन टाईम नियंत्रण',
    descriptionEn: 'Critical content consumption, digital detox and screen limits',
    moduleNumber: 5,
    moduleNameMr: 'प्रसारमाध्यमे',
    moduleNameEn: 'Mass Media',
  },
  {
    sessionNumber: 17,
    phaseNumber: 3,
    titleMr: 'लैंगिक दुर्वर्तन १',
    titleEn: 'Sexual Misconduct 1',
    sessionNameMr: 'लैंगिक दुर्वर्तन १',
    sessionNameEn: 'Sexual Misconduct 1',
    descriptionMr: 'चांगला स्पर्श - वाईट स्पर्श (Good Touch - Bad Touch) व सुरक्षितता',
    descriptionEn: 'Safe touch vs unsafe touch and personal physical safety',
    moduleNumber: 3,
    moduleNameMr: 'लैंगिक दुर्वर्तन',
    moduleNameEn: 'Sexual Misconduct',
  },
  {
    sessionNumber: 18,
    phaseNumber: 3,
    titleMr: 'लैंगिक दुर्वर्तन २',
    titleEn: 'Sexual Misconduct 2',
    sessionNameMr: 'लैंगिक दुर्वर्तन २',
    sessionNameEn: 'Sexual Misconduct 2',
    descriptionMr: 'पोक्सो (POCSO) कायदा, मदत मागण्‍याची हिंमत व चाईल्ड हेल्पलाईन',
    descriptionEn: 'POCSO awareness, speaking up against abuse and Childline support',
    moduleNumber: 3,
    moduleNameMr: 'लैंगिक दुर्वर्तन',
    moduleNameEn: 'Sexual Misconduct',
  },
  {
    sessionNumber: 19,
    phaseNumber: 3,
    titleMr: 'स्त्री-पुरुष परस्पर पूरकता १',
    titleEn: 'Complementarity Between Men and Women 1',
    sessionNameMr: 'स्त्री-पुरुष परस्पर पूरकता १',
    sessionNameEn: 'Complementarity Between Men and Women 1',
    descriptionMr: 'स्त्री व पुरुष दोघांचेही समान महत्त्व व परस्पर आदर',
    descriptionEn: 'Equal dignity of girls and boys and mutual respect in daily life',
    moduleNumber: 7,
    moduleNameMr: 'स्त्री-पुरुष परस्पर पूरकता',
    moduleNameEn: 'Woman-Man Complementarity',
  },
  {
    sessionNumber: 20,
    phaseNumber: 3,
    titleMr: 'स्त्री-पुरुष परस्पर पूरकता २',
    titleEn: 'Complementarity Between Men and Women 2',
    sessionNameMr: 'स्त्री-पुरुष परस्पर पूरकता २',
    sessionNameEn: 'Complementarity Between Men and Women 2',
    descriptionMr: 'रूढीवादी लिंगभेद मोडीत काढणे व सहकार्यपूर्ण नाते',
    descriptionEn: 'Overcoming gender stereotypes and cooperative partnership',
    moduleNumber: 7,
    moduleNameMr: 'स्त्री-पुरुष परस्पर पूरकता',
    moduleNameEn: 'Woman-Man Complementarity',
  },
  {
    sessionNumber: 21,
    phaseNumber: 3,
    titleMr: 'उद्दिष्टनिश्चिती आणि ताणतणाव १',
    titleEn: 'Goal Setting and Stress 1',
    sessionNameMr: 'उद्दिष्टनिश्चिती आणि ताणतणाव १',
    sessionNameEn: 'Goal Setting and Stress 1',
    descriptionMr: 'जीवनात ध्येय कसे ठरवावे? स्मार्ट (SMART) उद्दिष्टे',
    descriptionEn: 'How to set meaningful life goals (SMART goals framework)',
    moduleNumber: 8,
    moduleNameMr: 'ध्येयनिश्चिती व ताणतणावांशी सामना',
    moduleNameEn: 'Goal Setting & Facing Stress',
  },
  {
    sessionNumber: 22,
    phaseNumber: 3,
    titleMr: 'उद्दिष्टनिश्चिती आणि ताणतणाव २',
    titleEn: 'Goal Setting and Stress 2',
    sessionNameMr: 'उद्दिष्टनिश्चिती आणि ताणतणाव २',
    sessionNameEn: 'Goal Setting and Stress 2',
    descriptionMr: 'परीक्षेचा ताण, अपयशाची भीती व ताणतणावावर मात करणे',
    descriptionEn: 'Overcoming exam anxiety, fear of failure and resilience',
    moduleNumber: 8,
    moduleNameMr: 'ध्येयनिश्चिती व ताणतणावांशी सामना',
    moduleNameEn: 'Goal Setting & Facing Stress',
  },
  {
    sessionNumber: 23,
    phaseNumber: 3,
    titleMr: 'संकलन व उजळणी',
    titleEn: 'Summary & Review',
    sessionNameMr: 'संकलन व उजळणी',
    sessionNameEn: 'Summary & Review',
    descriptionMr: 'सर्व सत्रांमधील शिकवणुकीचे संकलन, विद्यार्थ्यांचे अनुभव कथन',
    descriptionEn: 'Comprehensive review of all 22 core sessions and student learnings',
    moduleNumber: 11,
    moduleNameMr: 'संकलन, प्रश्नोत्तरे, उत्तरचाचणी',
    moduleNameEn: 'Summary, Q&A & Post-Test',
  },
  {
    sessionNumber: 24,
    phaseNumber: 3,
    titleMr: 'प्रश्नोत्तरे व शंकासमाधान',
    titleEn: 'Q&A and Discussion',
    sessionNameMr: 'प्रश्नोत्तरे व शंकासमाधान',
    sessionNameEn: 'Q&A and Discussion',
    descriptionMr: 'विद्यार्थ्यांच्या मनातील शंकांचे निरसन व मार्गदर्शक चर्चा',
    descriptionEn: 'Open forum for answering student queries and guidance',
    moduleNumber: 11,
    moduleNameMr: 'संकलन, प्रश्नोत्तरे, उत्तरचाचणी',
    moduleNameEn: 'Summary, Q&A & Post-Test',
  },
  {
    sessionNumber: 25,
    phaseNumber: 3,
    titleMr: 'उत्तरचाचणी व समारोप',
    titleEn: 'Post-Test & Evaluation',
    sessionNameMr: 'उत्तरचाचणी व समारोप',
    sessionNameEn: 'Post-Test & Evaluation',
    descriptionMr: 'उत्तरचाचणी (Post-Test) परीक्षा, प्रमाणपत्र वाटप व उपक्रमाचा समारोप',
    descriptionEn: 'Conducting final post-test assessment and program closing celebration',
    moduleNumber: 11,
    moduleNameMr: 'संकलन, प्रश्नोत्तरे, उत्तरचाचणी',
    moduleNameEn: 'Summary, Q&A & Post-Test',
  },
];
