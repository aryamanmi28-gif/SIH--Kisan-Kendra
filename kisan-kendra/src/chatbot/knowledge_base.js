/**
 * Kisan Kendra Multi-Language Chatbot Knowledge Base
 * Supports 5 languages:
 * - English (en)
 * - Hindi (hi - हिन्दी)
 * - Kannada (kn - ಕನ್ನಡ)
 * - Tamil (ta - தமிழ்)
 * - Telugu (te - తెలుగు)
 */

export const CHATBOT_TRANSLATIONS = {
  en: {
    botTitle: 'Kisan Sahayak AI Assistant',
    botSubtitle: '24/7 Procurement, Queue & Payment Helper',
    placeholder: 'Ask about slot booking, MSP, queue, payment...',
    send: 'Send',
    clearChat: 'Clear Chat',
    welcomeMessage: 'Namaste! I am Kisan Sahayak 🌾. I can help you with crop procurement, slot booking, mandi gate check-in, queue tracking, and payment status.',
    processTabLabel: '⚡ Process Guide',
    faqTabLabel: '💬 Ask FAQs',
    suggestedTopics: 'Suggested Questions:',
    noMatchFound: 'I could not find an exact match for your question. You can select a topic below or use our Guided Process Assistant:',
    switchLangPrompt: 'Language switched to English',
    typing: 'Kisan Sahayak is typing...',
    speechOn: 'Voice Readout Enabled',
    speechOff: 'Voice Readout Disabled',
    guideTitle: 'What step do you need help with?',
    guideSteps: {
      step1: '1️⃣ Registration & Documents',
      step2: '2️⃣ Book Procurement Slot',
      step3: '3️⃣ Gate Check-in on Slot Day',
      step4: '4️⃣ Queue & Counter Weighment',
      step5: '5️⃣ DBT Direct Payment Status',
    },
    actionButtons: {
      goToCentres: 'View Centres & Book Slot ➔',
      goToQueue: 'Track Live Queue ➔',
      goToProcurement: 'Check Procurement & Payment ➔',
      goToRegister: 'Register / Login ➔',
    }
  },
  hi: {
    botTitle: 'किसान सहायक AI मित्र',
    botSubtitle: '24/7 उपज खरीद, कतार एवं भुगतान सहायक',
    placeholder: 'स्लॉट बुकिंग, एमएसपी, टोकन, भुगतान के बारे में पूछें...',
    send: 'भेजें',
    clearChat: 'बातचीत साफ करें',
    welcomeMessage: 'नमस्ते! मैं किसान सहायक हूँ 🌾। आज मैं फसल खरीद, स्लॉट बुकिंग, मंडी गेट चेक-इन, लाइव कतार और भुगतान की जानकारी में आपकी क्या मदद कर सकता हूँ?',
    processTabLabel: '⚡ प्रक्रिया गाइड',
    faqTabLabel: '💬 सामान्य प्रश्न (FAQ)',
    suggestedTopics: 'सुझाए गए प्रश्न:',
    noMatchFound: 'मुझे आपके प्रश्न का सटीक उत्तर नहीं मिला। आप नीचे दिए गए विषयों में से चुन सकते हैं या हमारी प्रक्रिया गाइड का उपयोग कर सकते हैं:',
    switchLangPrompt: 'भाषा बदलकर हिन्दी कर दी गई है',
    typing: 'किसान सहायक उत्तर लिख रहा है...',
    speechOn: 'वॉइस रीडआउट चालू है',
    speechOff: 'वॉइस रीडआउट बंद है',
    guideTitle: 'आपको किस चरण में सहायता चाहिए?',
    guideSteps: {
      step1: '1️⃣ पंजीकरण एवं दस्तावेज',
      step2: '2️⃣ स्लॉट बुकिंग (खरीद केंद्र)',
      step3: '3️⃣ मंडी गेट चेक-इन',
      step4: '4️⃣ लाइव कतार एवं तौल',
      step5: '5️⃣ DBT बैंक भुगतान स्थिति',
    },
    actionButtons: {
      goToCentres: 'केंद्र देखें और स्लॉट बुक करें ➔',
      goToQueue: 'लाइव कतार देखें ➔',
      goToProcurement: 'खरीद और भुगतान जांचें ➔',
      goToRegister: 'पंजीकरण / लॉगिन ➔',
    }
  },
  kn: {
    botTitle: 'ಕಿಸಾನ್ ಸಹಾಯಕ್ AI ಸಹಾಯಕ',
    botSubtitle: '24/7 ಬೆಳೆ ಖರೀದಿ, ಸರದಿ ಮತ್ತು ಪಾವತಿ ಸಹಾಯಕ',
    placeholder: 'ಸ್ಲಾಟ್ ಬುಕಿಂಗ್, MSP, ಸರದಿ, ಪಾವತಿ ಬಗ್ಗೆ ಕೇಳಿ...',
    send: 'ಕಳುಹಿಸಿ',
    clearChat: 'ಚಾಟ್ ಅಳಿಸಿ',
    welcomeMessage: 'ನಮಸ್ಕಾರ! ನಾನು ಕಿಸಾನ್ ಸಹಾಯಕ್ 🌾. ಬೆಳೆ ಖರೀದಿ, ಸ್ಲಾಟ್ ಬುಕಿಂಗ್, ಮಂಡಿ ಗೇಟ್ ಚೆಕ್-ಇನ್, ಸರದಿ ಟ್ರ್ಯಾಕಿಂಗ್ ಮತ್ತು ಪಾವತಿ ಮಾಹಿತಿಗೆ ನಾನು ಸಹಾಯ ಮಾಡುತ್ತೇನೆ.',
    processTabLabel: '⚡ ಮಾರ್ಗದರ್ಶಿ ಪ್ರಕ್ರಿಯೆ',
    faqTabLabel: '💬 ಪ್ರಶ್ನೋತ್ತರ (FAQ)',
    suggestedTopics: 'ಸೂಚಿಸಿದ ಪ್ರಶ್ನೆಗಳು:',
    noMatchFound: 'ನಿಮ್ಮ ಪ್ರಶ್ನೆಗೆ ನಿಖರವಾದ ಉತ್ತರ ಸಿಗಲಿಲ್ಲ. ಕೆಳಗಿನ ವಿಷಯಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ ಅಥವಾ ನಮ್ಮ ಹಂತ-ಹಂತದ ಪ್ರಕ್ರಿಯೆ ಸಹಾಯ ಪಡೆದುಕೊಳ್ಳಿ:',
    switchLangPrompt: 'ಭಾಷೆಯನ್ನು ಕನ್ನಡಕ್ಕೆ ಬದಲಾಯಿಸಲಾಗಿದೆ',
    typing: 'ಕಿಸಾನ್ ಸಹಾಯಕ್ ಉತ್ತರಿಸುತ್ತಿದ್ದಾನೆ...',
    speechOn: 'ಧ್ವನಿ ಸಕ್ರಿಯಗೊಳಿಸಲಾಗಿದೆ',
    speechOff: 'ಧ್ವನಿ ನಿಷ್ಕ್ರಿಯಗೊಳಿಸಲಾಗಿದೆ',
    guideTitle: 'ನಿಮಗೆ ಯಾವ ಹಂತದಲ್ಲಿ ಸಹಾಯ ಬೇಕು?',
    guideSteps: {
      step1: '1️⃣ ನೋಂದಣಿ ಮತ್ತು ದಾಖಲೆಗಳು',
      step2: '2️⃣ ಬೆಳೆ ಖರೀದಿ ಸ್ಲಾಟ್ ಬುಕಿಂಗ್',
      step3: '3️⃣ ಮಂಡಿ ಗೇಟ್ ಚೆಕ್-ಇನ್',
      step4: '4️⃣ ಲೈವ್ ಸರದಿ ಮತ್ತು ತೂಕ',
      step5: '5️⃣ DBT ಬ್ಯಾಂಕ್ ಪಾವತಿ ಸ್ಥಿತಿ',
    },
    actionButtons: {
      goToCentres: 'ಕೇಂದ್ರಗಳನ್ನು ನೋಡಿ ಸ್ಲಾಟ್ ಕಾಯ್ದಿರಿಸಿ ➔',
      goToQueue: 'ಲೈವ್ ಸರದಿ ಪರಿಶೀಲಿಸಿ ➔',
      goToProcurement: 'ಖರೀದಿ ಮತ್ತು ಪಾವತಿ ನೋಡಿ ➔',
      goToRegister: 'ನೋಂದಣಿ / ಲಾಗಿನ್ ➔',
    }
  },
  ta: {
    botTitle: 'கிசான் சஹாயக் AI உதவியாளர்',
    botSubtitle: '24/7 கொள்முதல், வரிசை & பணப்பரிவர்த்தனை உதவி',
    placeholder: 'ஸ்லாட் முன்பதிவு, MSP, வரிசை, பணம் பற்றி கேட்கவும்...',
    send: 'அனுப்பு',
    clearChat: 'அழி',
    welcomeMessage: 'வணக்கம்! நான் கிசான் சஹாயக் 🌾. பயிர் கொள்முதல், ஸ்லாட் முன்பதிவு, மண்டி கேட் செக்-இன், நேரலை வரிசை மற்றும் பண வரவு குறித்து உங்களுக்கு உதவுகிறேன்.',
    processTabLabel: '⚡ வழிமுறை வழிகாட்டி',
    faqTabLabel: '💬 கேள்விகள் (FAQ)',
    suggestedTopics: 'பரிந்துரைக்கப்பட்ட கேள்விகள்:',
    noMatchFound: 'உங்கள் கேள்விக்கு நேரடி பதில் கிடைக்கவில்லை. கீழே உள்ள தலைப்புகளைத் தேர்ந்தெடுக்கவும்:',
    switchLangPrompt: 'மொழி தமிழாக மாற்றப்பட்டது',
    typing: 'கிசான் சஹாயக் பதிலளிக்கிறது...',
    speechOn: 'குரல் வாசிப்பு இயக்கப்பட்டது',
    speechOff: 'குரல் வாசிப்பு முடக்கம்',
    guideTitle: 'உங்களுக்கு எந்த கட்டத்தில் உதவி தேவை?',
    guideSteps: {
      step1: '1️⃣ பதிவு & தேவையான ஆவணங்கள்',
      step2: '2️⃣ கொள்முதல் ஸ்லாட் முன்பதிவு',
      step3: '3️⃣ மண்டி கேட் செக்-இன்',
      step4: '4️⃣ நேரலை வரிசை & எடை பரிசோதனை',
      step5: '5️⃣ DBT நேரடி வங்கி வரவு',
    },
    actionButtons: {
      goToCentres: 'மையங்களை பார்த்து முன்பதிவு செய் ➔',
      goToQueue: 'நேரலை வரிசையைப் பார் ➔',
      goToProcurement: 'கொள்முதல் & பணம் பார் ➔',
      goToRegister: 'பதிவு செய் / லாகின் ➔',
    }
  },
  te: {
    botTitle: 'కిసాన్ సహాయక్ AI సహాయకుడు',
    botSubtitle: '24/7 పంట సేకరణ, క్యూ & చెల్లింపుల సహాయకుడు',
    placeholder: 'స్లాట్ బుకింగ్, MSP, క్యూ, చెల్లింపుల గురించి అడగండి...',
    send: 'పంపు',
    clearChat: 'చాట్ క్లియర్ చేయి',
    welcomeMessage: 'నమస్కారం! నేను కిసాన్ సహాయక్ 🌾. పంట సేకరణ, స్లాట్ బుకింగ్, మండీ గేట్ చెక్-ఇన్, లైవ్ క్యూ మరియు బ్యాంక్ చెల్లింపులలో మీకు సహాయం చేస్తాను.',
    processTabLabel: '⚡ విధాన మార్గదర్శి',
    faqTabLabel: '💬 ప్రశ్నలు & సమాధానాలు',
    suggestedTopics: 'సూచించిన ప్రశ్నలు:',
    noMatchFound: 'మీ ప్రశ్నకు ఖచ్చితమైన సమాధానం దొరకలేదు. దయచేసి క్రింది విషయాలను లేదా మా గైడెడ్ ప్రాసెస్ సహాయకుడిని ఉపయోగించండి:',
    switchLangPrompt: 'భాష తెలుగులోకి మార్చబడింది',
    typing: 'కిసాన్ సహాయక్ సమాధానం ఇస్తోంది...',
    speechOn: 'వాయిస్ సదుపాయం ఆన్ చేయబడింది',
    speechOff: 'వాయిస్ సదుపాయం ఆఫ్ చేయబడింది',
    guideTitle: 'మీకు ఏ దశలో సహాయం కావాలి?',
    guideSteps: {
      step1: '1️⃣ రిజిస్ట్రేషన్ & అవసరమైన పత్రాలు',
      step2: '2️⃣ పంట సేకరణ స్లాట్ బుకింగ్',
      step3: '3️⃣ మండీ గేట్ వద్ద చెక్-ఇన్',
      step4: '4️⃣ లైవ్ క్యూ & తూకం వివరాలు',
      step5: '5️⃣ DBT ద్వారా డైరెక్ట్ బ్యాంక్ జమ',
    },
    actionButtons: {
      goToCentres: 'కేంద్రాలను చూసి స్లాట్ బుక్ చేయండి ➔',
      goToQueue: 'లైవ్ క్యూ ని ట్రాక్ చేయండి ➔',
      goToProcurement: 'సేకరణ & చెల్లింపు చూడండి ➔',
      goToRegister: 'రిజిస్ట్రేషన్ / లాగిన్ ➔',
    }
  }
}

/**
 * Multi-Language FAQ Database for Kisan Kendra (5 Core Languages)
 */
export const FAQ_DATABASE = [
  {
    id: 'working',
    category: 'General Overview',
    keywords: ['working', 'how it works', 'kisan kendra', 'what is', 'project', 'process', 'overview', 'काम', 'कैसे', 'प्रक्रिया', 'ಪ್ರಕ್ರಿಯೆ', 'செயல்பாடு', 'పనిచేస్తుంది'],
    question: {
      en: 'How does Kisan Kendra work?',
      hi: 'किसान केंद्र कैसे काम करता है?',
      kn: 'ಕಿಸಾನ್ ಕೇಂದ್ರ ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ?',
      ta: 'கிசான் கேந்திரா எவ்வாறு இயங்குகிறது?',
      te: 'కిసాన్ కేంద్ర ఎలా పనిచేస్తుంది?'
    },
    answer: {
      en: 'Kisan Kendra simplifies government crop procurement into 4 steps:\n1. Book a Procurement Slot online at your nearest centre.\n2. Receive a digital Token Reference Code with slot date & time.\n3. Check-in at the Mandi Gate on your slot day to enter the live queue.\n4. Complete weighment & quality inspection, then track direct bank transfer (DBT) transparently.',
      hi: 'किसान केंद्र फसल खरीद को 4 आसान चरणों में पूरा करता है:\n1. निकटतम खरीद केंद्र पर ऑनलाइन स्लॉट बुक करें।\n2. तिथि और समय का डिजिटल टोकन कोड प्राप्त करें।\n3. तय तारीख को मंडी गेट पर चेक-इन करके लाइव कतार में शामिल हों।\n4. वजन और गुणवत्ता जांच पूरी करें, और सीधे बैंक खाते (DBT) में भुगतान ट्रैक करें।',
      kn: 'ಕಿಸಾನ್ ಕೇಂದ್ರವು ಬೆಳೆ ಖರೀದಿಯನ್ನು 4 ಹಂತಗಳಲ್ಲಿ ಸುಲಭಗೊಳಿಸುತ್ತದೆ:\n1. ನಿಮ್ಮ ಹತ್ತಿರದ ಕೇಂದ್ರದಲ್ಲಿ ಆನ್‌ಲೈನ್ ಸ್ಲಾಟ್ ಕಾಯ್ದಿರಿಸಿ.\n2. ದಿನಾಂಕ ಮತ್ತು ಸಮಯದ ಡಿಜಿಟಲ್ ಟೋಕನ್ ಪಡೆಯಿರಿ.\n3. ನಿಗದಿತ ದಿನದಂದು ಮಂಡಿ ಗೇಟ್‌ನಲ್ಲಿ ಚೆಕ್-ಇನ್ ಮಾಡಿ ಕ್ಯೂ ಸೇರಿ.\n4. ತೂಕ ಮತ್ತು ಗುಣಮಟ್ಟ ಪರೀಕ್ಷೆ ಪೂರ್ಣಗೊಳಿಸಿ, ನೇರ ಬ್ಯಾಂಕ್ ಪಾವತಿಯನ್ನು (DBT) ಟ್ರ್ಯಾಕ್ ಮಾಡಿ.',
      ta: 'கிசான் கேந்திரா பயிர் கொள்முதலை 4 படிகளில் எளிதாக்குகிறது:\n1. உங்களுக்கு அருகில் உள்ள மையத்தில் ஆன்லைனில் ஸ்லாட் முன்பதிவு செய்யுங்கள்.\n2. தேதி மற்றும் நேரத்திற்கான டிஜிட்டல் டோக்கனைப் பெறுங்கள்.\n3. குறித்த நாளில் மண்டி கேட்டில் செக்-இன் செய்து நேரலை வரிசையில் இணையுங்கள்.\n4. எடை மற்றும் தர சோதனையை முடித்து, நேரடி வங்கி செலுத்துதலை (DBT) கண்காணிக்கவும்.',
      te: 'కిసాన్ కేంద్ర పంట సేకరణను 4 సులభమైన దశల్లో పూర్తి చేస్తుంది:\n1. మీకు దగ్గరలోని కేంద్రంలో ఆన్‌లైన్ స్లాట్ బుక్ చేసుకోండి.\n2. తేదీ మరియు సమయంతో కూడిన డిజిటల్ టోకెన్ పొందండి.\n3. నిర్ణీత తేదీన మండీ గేట్ వద్ద చెక్-ఇన్ చేసి లైవ్ క్యూలో చేరండి.\n4. తూకం మరియు నాణ్యత తనిఖీ పూర్తి చేసి, డిబిటి ద్వారా నేరుగా బ్యాంక్ ఖాతాలో జమ అయ్యే డబ్బును ట్రాక్ చేయండి.'
    }
  },
  {
    id: 'booking',
    category: 'Slot Booking Rules',
    keywords: ['book', 'booking', 'slot', 'cancel', 'reschedule', 'limit', 'rules', 'बुकिंग', 'स्लॉट', 'रद्द', 'सीमा', 'ಬುಕಿಂಗ್', 'ಸ್ಲಾಟ್', 'ಮುன்பதிவு', 'బుకింగ్'],
    question: {
      en: 'How do I book a procurement slot and what are the rules?',
      hi: 'मैं फसल खरीद स्लॉट कैसे बुक करूं और इसके नियम क्या हैं?',
      kn: 'ನಾನು ಬೆಳೆ ಖರೀದಿ ಸ್ಲಾಟ್ ಹೇಗೆ ಬುಕ್ ಮಾಡುವುದು ಮತ್ತು ನಿಯಮಗಳೇನು?',
      ta: 'கொள்முதல் ஸ்லாட்டை எவ்வாறு முன்பதிவு செய்வது மற்றும் விதிகள் என்ன?',
      te: 'నేను సేకరణ స్లాట్‌ను ఎలా బుక్ చేసుకోవాలి మరియు నిబంధనలు ఏమిటి?'
    },
    answer: {
      en: 'To book a slot:\n1. Go to "Centres" and select your nearest Mandi.\n2. Pick an available slot date and morning/afternoon timing.\n3. Select your crop lot and estimated weight (in kg).\n4. Confirm to generate your digital Token Slip.\n\n📌 Rules:\n- Limit of 1 active booking per crop lot per day per farmer.\n- Slot time windows run from 6:00 AM to 4:00 PM.\n- You can cancel or reschedule up to 12 hours before your slot time.',
      hi: 'स्लॉट बुक करने के लिए:\n1. "केंद्र" पर जाएं और अपनी निकटतम मंडी चुनें।\n2. उपलब्ध तिथि और सुबह/दोपहर का समय चुनें।\n3. अपनी फसल और अनुमानित वजन (किग्रा) दर्ज करें।\n4. पुष्टि करके टोकन स्लिप प्राप्त करें।\n\n📌 नियम:\n- प्रति किसान प्रति फसल प्रति दिन 1 सक्रिय बुकिंग की सीमा है।\n- समय सुबह 6:00 से शाम 4:00 बजे तक है।\n- आप 12 घंटे पहले तक स्लॉट रद्द या बदल सकते हैं।',
      kn: 'ಸ್ಲಾಟ್ ಬುಕ್ ಮಾಡಲು:\n1. "ಕೇಂದ್ರಗಳು" ಗೆ ಹೋಗಿ ಮಂಡಿ ಆಯ್ಕೆಮಾಡಿ.\n2. ದಿನಾಂಕ ಮತ್ತು ಸಮಯದ ಸ್ಲಾಟ್ ಆಯ್ಕೆಮಾಡಿ.\n3. ಬೆಳೆ ವಿವರ ಮತ್ತು ತೂಕ ನಮೂದಿಸಿ ಟೋಕನ್ ಪಡೆಯಿರಿ.\n\n📌 ನಿಯಮಗಳು:\n- ಒಬ್ಬ ರೈತ ದಿನಕ್ಕೆ ಒಂದು ಬೆಳೆಗೆ 1 ಸಕ್ರಿಯ ಸ್ಲಾಟ್ ಮಾತ್ರ ಬುಕ್ ಮಾಡಬಹುದು.\n- ಸಮಯ ಬೆಳಿಗ್ಗೆ 6:00 ರಿಂದ ಸಂಜೆ 4:00 ರವರೆಗೆ.',
      ta: 'ஸ்லாட் முன்பதிவு செய்ய:\n1. "மையங்கள்" பகுதிக்குச் சென்று மண்டியைத் தேர்ந்தெடுக்கவும்.\n2. தேதி மற்றும் நேரத்தைத் தேர்வுசெய்து டோக்கன் பெறவும்.\n\n📌 விதிகள்:\n- ஒரு விவசாயி ஒரு நாளைக்கு 1 செயலில் உள்ள ஸ்ಲಾட்டை மட்டுமே முன்பதிவு செய்ய முடியும்.\n- நேரம் காலை 6:00 முதல் மாலை 4:00 மணி வரை.',
      te: 'స్లాట్ బుక్ ಮಾಡಲು:\n1. "కేంద్రాలు" విభాగంలోకి వెళ్లి మండీని ఎంచుకోండి.\n2. తేదీ మరియు సమయం ఎంచుకుని టోకెన్ పొందండి.\n\n📌 నిబంధనలు:\n- ఒక రైతు ఒక రోజుకు 1 యాక్టివ్ స్లాట్ మాత్రమే బుక్ చేసుకోవచ్చు.\n- సమయం ఉదయం 6:00 నుండి సాయంత్రం 4:00 వరకు.'
    }
  },
  {
    id: 'priority',
    category: 'Crop Priority Window',
    keywords: ['priority', 'spoilage', 'perishable', 'paddy', 'maize', 'groundnut', 'fast', 'moisture', 'प्राथमिकता', 'खराब', 'धान', 'मक्का', 'मूंगफली', 'ಆದ್ಯತೆ', 'ಮುನ್ನುರಿமை', 'ప్రాధాన్యత'],
    question: {
      en: 'What is the Priority Window for perishable crops like Paddy?',
      hi: 'धान जैसी जल्दी खराब होने वाली फसलों के लिए प्राथमिकता विंडो क्या है?',
      kn: 'ಭತ್ತದಂತಹ ಬೇಗ ಹಾಳಾಗುವ ಬೆಳೆಗಳಿಗೆ ಆದ್ಯತೆ ಸಮಯ (Priority Window) ಎಂದರೇನು?',
      ta: 'நெல் போன்ற விரைவில் கெட்டுப்போகும் பயிர்களுக்கான முன்னுரிமை நேரம் என்ன?',
      te: 'వరి వంటి త్వరగా పాడైపోయే పంటల కోసం ప్రాధాన్యత సమయం ఏమిటి?'
    },
    answer: {
      en: 'High moisture and highly perishable crops (Paddy, Maize, Groundnut) spoil rapidly if exposed to open weather.\nKisan Kendra automatically assigns them Priority Morning Slots (6:00 AM - 10:00 AM) so they are checked in, weighed, and stored first in a dedicated priority lane.',
      hi: 'अधिक नमी और जल्दी खराब होने वाली फसलें (धान, मक्का, मूंगफली) खुले मौसम में जल्दी खराब होती हैं।\nकिसान केंद्र स्वचालित रूप से इन्हें सुबह की प्राथमिकता स्लॉट (6:00 AM - 10:00 AM) आवंटित करता है ताकि इनका तौल प्राथमिकता लेन में सबसे पहले हो सके।',
      kn: 'ಹೆಚ್ಚು ತೇವಾಂಶವಿರುವ ಬೆಳೆಗಳು (ಭತ್ತ, ಮೆಕ್ಕೆಜೋಳ, ಕಡಲೆಕಾಯಿ) ಬೇಗ ಹಾಳಾಗುತ್ತವೆ. ಕಿಸಾನ್ ಕೇಂದ್ರವು ಇವುಗಳಿಗೆ ಬೆಳಗಿನ ಆದ್ಯತೆ ಸ್ಲಾಟ್‌ಗಳನ್ನು (6:00 AM - 10:00 AM) ನೀಡುತ್ತದೆ.',
      ta: 'ஈரப்பதம் உள்ள பயிர்கள் (நெல், மக்காச்சோளம், நிலக்கடலை) விரைவில் கெட்டுவிடும். கிசான் கேந்திரா இவற்றிற்கு காலை முன்னுரிமை நேரங்களை (6:00 AM - 10:00 AM) வழங்குகிறது.',
      te: 'ఎక్కువ తేమ ఉన్న పంటలు (వరి, జొన్నలు, వేరుశెనగ) త్వరగా పాడవుతాయి. కిసాన్ కేంద్ర వీటి కోసం ఉదయం ప్రాధాన్యత స్లాట్‌లను (6:00 AM - 10:00 AM) కేటాయిస్తుంది.'
    }
  },
  {
    id: 'documents',
    category: 'Verification & Documents',
    keywords: ['document', 'documents', 'aadhaar', 'khasra', 'bank', 'proof', 'register', 'दस्तावेज़', 'आधार', 'खसरा', 'खाता', 'ದಖಲೆಗಳು', 'ಆಧಾರ್', 'ஆவணங்கள்', 'డాక్యుమెంట్లు'],
    question: {
      en: 'What documents do I need for registration and procurement?',
      hi: 'पंजीकरण और फसल खरीद के लिए कौन से दस्तावेज चाहिए?',
      kn: 'ನೋಂದಣಿ ಮತ್ತು ಖರೀದಿಗೆ ಯಾವ ದಾಖಲೆಗಳು ಬೇಕು?',
      ta: 'பதிவு மற்றும் கொள்முதல் செய்ய என்னென்ன ஆவணங்கள் தேவை?',
      te: 'రిజిస్ట్రేషన్ మరియు సేకరణకు ఏ ఏ డాక్యుమెంట్లు అవసరం?'
    },
    answer: {
      en: 'Please keep the following ready:\n1. Aadhaar Card (Identity & DBT verification).\n2. Land Record / Khasra / Khatauni certificate.\n3. Bank Account details linked with Aadhaar card.\n4. Registered Mobile Number (to receive OTPs and token alerts).',
      hi: 'कृपया निम्नलिखित दस्तावेज तैयार रखें:\n1. आधार कार्ड (पहचान व डीबीटी हेतु)।\n2. भूमि रिकॉर्ड / खसरा / खतौनी प्रमाण पत्र।\n3. आधार से जुड़ा बैंक खाता पासबुक विवरण।\n4. पंजीकृत मोबाइल नंबर (ओटीपी और टोकन अलर्ट हेतु)।',
      kn: 'ಈ ದಾಖಲೆಗಳನ್ನು ಸಿದ್ಧವಾಗಿಟ್ಟುಕೊಳ್ಳಿ:\n1. ಆಧಾರ್ ಕಾರ್ಡ್.\n2. ಜಮೀನು ಪಹಣಿ / ಖಾತಾ ದಾಖಲೆ.\n3. ಆಧಾರ್ ಲಿಂಕ್ ಆದ ಬ್ಯಾಂಕ್ ಖಾತೆ.\n4. ನೋಂದಾಯಿತ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ.',
      ta: 'பின்வரும் ஆவணங்களை தயாராக வைத்திருக்கவும்:\n1. ஆதார் கார்டு.\n2. நிலப் பட்டா / சிட்டா ஆவணம்.\n3. ஆதாரோடு இணைக்கப்பட்ட வங்கி கணக்கு.\n4. பதிவு செய்யப்பட்ட மொபைல் எண்.',
      te: 'ఈ డాక్యుమెంట్లను సిద్ధంగా ఉంచుకోండి:\n1. ఆధార్ కార్డు.\n2. భూమి పట్టా / ఖస్రా పత్రాలు.\n3. ఆధార్ లింక్ అయిన బ్యాంక్ ఖాతా.\n4. రిజిస్టర్డ్ మొబైల్ నంబర్.'
    }
  },
  {
    id: 'checkin',
    category: 'Mandi Gate Check-in',
    keywords: ['checkin', 'check-in', 'gate', 'token', 'code', 'qr', 'arrive', 'गेट', 'चेक-इन', 'टोकन', 'ಚೆಕ್-ಇನ್', 'செக்-இன்', 'చెకిన్'],
    question: {
      en: 'How does Mandi Gate check-in work on my slot day?',
      hi: 'मेरे स्लॉट के दिन मंडी गेट चेक-इन कैसे काम करता है?',
      kn: 'ನನ್ನ ಸ್ಲಾಟ್ ದಿನದಂದು ಮಂಡಿ ಗೇಟ್ ಚೆಕ್-ಇನ್ ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ?',
      ta: 'என் ஸ்ಲಾಟ್ நாளில் மண்டி கேட் செಕ್-இன் எவ்வாறு இயங்குகிறது?',
      te: 'నా స్లాట్ రోజున మండీ గేట్ చెక్-ఇన్ ఎలా పనిచేస్తుంది?'
    },
    answer: {
      en: 'On your slot day:\n1. Arrive at the Mandi Gate during your booked time window.\n2. Show your Token Reference Code / QR Slip to gate personnel.\n3. Gate staff scans your code and updates status to "Checked-in".\n4. Your active token appears on the Live Queue board with real-time counter tracking.',
      hi: 'आपकी स्लॉट तिथि पर:\n1. तय समय में मंडी गेट पर पहुंचे।\n2. गेट कर्मचारी को अपना टोकन रेफरेंस कोड / क्यूआर दिखाएं।\n3. कर्मचारी कोड स्कैन करके स्टेटस को "चेक-इन" में अपडेट करेंगे।\n4. आपका टोकन नंबर लाइव कतार बोर्ड पर दिखाई देगा।',
      kn: 'ನಿಮ್ಮ ಸ್ಲಾಟ್ ದಿನದಂದು ಮಂಡಿ ಗೇಟ್‌ಗೆ ಬಂದು ಟೋಕನ್ ಕೋಡ್ ತೋರಿಸಿ. ಸಿಬ್ಬಂದಿ ಪರಿಶೀಲಿಸಿದ ನಂತರ ನಿಮ್ಮ ಸ್ಥಾನ ಲೈವ್ ಕ್ಯೂನಲ್ಲಿ ಕಾಣಿಸುತ್ತದೆ.',
      ta: 'உங்கள் ஸ்ಲಾಟ್ நாளில் மண்டி கேட்டை அடைந்து டோக்கன் குறியீட்டைக் காட்டுங்கள். சரிபார்க்கப்பட்டதும் உங்கள் டோக்கன் நேரலை வரிசையில் தெரியும்.',
      te: 'మీ స్లాట్ రోజున మండీ గేట్ వద్దకు చేరుకుని టోకెన్ చూపించండి. చెక్-ఇన్ పూర్తి కాగానే లైవ్ క్యూలో మీ టోకెన్ కనిపిస్తుంది.'
    }
  },
  {
    id: 'queue',
    category: 'Live Queue Tracking',
    keywords: ['queue', 'tracker', 'wait time', 'counter', 'position', 'token number', 'कतार', 'वेटिंग', 'काउंटर', 'समीकरण', 'ಸರದಿ', 'வரிசை', 'క్యూ'],
    question: {
      en: 'How can I track the live mandi queue and wait time?',
      hi: 'मैं लाइव मंडी कतार और प्रतीक्षा समय को कैसे ट्रैक कर सकता हूँ?',
      kn: 'ನಾನು ಲೈವ್ ಮಂಡಿ ಸರದಿ ಮತ್ತು ಕಾಯುವ ಸಮಯವನ್ನು ಹೇಗೆ ಟ್ರ್ಯಾಕ್ ಮಾಡುವುದು?',
      ta: 'நேரலை மண்டி வரிசை மற்றும் காத்திருப்பு நேரத்தை எவ்வாறு கண்காணிப்பது?',
      te: 'నేను లైవ్ మండీ క్యూ మరియు వేచి ఉండే సమయాన్ని ఎలా ట్రాక్ చేయాలి?'
    },
    answer: {
      en: 'Go to the "Queue Tracker" page from your dashboard:\n- View your Token Position (e.g. Token #104).\n- See the Current Token being served at Counter 1 & 2.\n- Check estimated wait time updated live based on weighbridge throughput.\n- Receive SMS alerts when your turn is 3 numbers away!',
      hi: '"कतार ट्रैकर" पेज पर जाएं:\n- अपना टोकन नंबर देखें (जैसे टोकन #104)।\n- काउंटर 1 और 2 पर चल रहे टोकन को देखें।\n- तौल की गति के आधार पर अनुमानित प्रतीक्षा समय देखें।\n- जब आपका नंबर 3 टोकन दूर होगा तो आपको एसएमएस मिलेगा!',
      kn: '"ಸರದಿ ಟ್ರ್ಯಾಕರ್" ಪುಟಕ್ಕೆ ಹೋಗಿ ನಿಮ್ಮ ಟೋಕನ್ ಸ್ಥಾನ, ಪ್ರಸ್ತುತ ಕೌಂಟರ್ ಸಂಖ್ಯೆ ಮತ್ತು ನಿರೀಕ್ಷಿತ ಕಾಯುವ ಸಮಯವನ್ನು ನೋಡಿ.',
      ta: '"வரிசை டிராக்கர்" பக்கத்திற்குச் சென்று உங்கள் டோக்கன் எண், தற்போதைய கவுண்டர் நிலை மற்றும் காத்திருப்பு நேரத்தைப் பாருங்கள்.',
      te: '"క్యూ ట్రాకర్" పేజీలోకి వెళ్లి మీ టోకెన్ నంబర్, కౌంటర్ వద్ద నడుస్తున్న నంబర్ మరియు వేచి ఉండే సమయం చూడవచ్చు.'
    }
  },
  {
    id: 'msp',
    category: 'Minimum Support Price (MSP) & Rates',
    keywords: ['msp', 'rate', 'price', 'government rate', 'wheat', 'paddy', 'cotton', 'soybean', 'एमएसपी', 'रेट', 'मूल्य', 'सरकारी भाव', 'ಬೆಂಬಲ ಬೆಲೆ', 'ஆதரவு விலை', 'మద్దతు ధర'],
    question: {
      en: 'What are the official Government MSP rates for crops?',
      hi: 'फसलों के लिए आधिकारिक सरकारी एमएसपी (MSP) दरें क्या हैं?',
      kn: 'ಬೆಳೆಗಳಿಗೆ ಸರ್ಕಾರದ ಬೆಂಬಲ ಬೆಲೆ (MSP) ದರಗಳು ಯಾವುವು?',
      ta: 'பயிர்களுக்கான அரசின் ஆதரவு விலை (MSP) என்ன?',
      te: 'పంటలకు ప్రభుత్వ కనీస మద్దతు ధర (MSP) వివరాలు ఏమిటి?'
    },
    answer: {
      en: 'Current Minimum Support Price (MSP) per Quintal (100 kg):\n• Paddy (Common): ₹2,300/qtl\n• Paddy (Grade A): ₹2,320/qtl\n• Wheat: ₹2,275/qtl\n• Maize: ₹2,225/qtl\n• Soybean: ₹4,892/qtl\n• Cotton (Medium Staple): ₹7,121/qtl\n• Gram (Chana): ₹5,440/qtl\n• Mustard: ₹5,650/qtl\n• Tur (Arhar): ₹7,550/qtl',
      hi: 'वर्तमान न्यूनतम समर्थन मूल्य (MSP) प्रति क्विंटल (100 किग्रा):\n• धान (सामान्य): ₹2,300/क्विंटल\n• धान (ग्रेड ए): ₹2,320/क्विंटल\n• गेहूं: ₹2,275/क्विंटल\n• मक्का: ₹2,225/क्विंटल\n• सोयाबीन: ₹4,892/क्विंटल\n• कपास: ₹7,121/क्विंटल\n• चना: ₹5,440/क्विंटल\n• सरसों: ₹5,650/क्विंटल\n• तुअर (अरहर): ₹7,550/क्विंटल',
      kn: 'ಪ್ರಸ್ತುತ ಕನಿಷ್ಠ ಬೆಂಬಲ ಬೆಲೆ (MSP) ಪ್ರತಿ ಕ್ವಿಂಟಾಲ್‌ಗೆ:\n• ಭತ್ತ (ಸಾಮಾನ್ಯ): ₹2,300\n• ಗೋಧಿ: ₹2,275\n• ಮೆಕ್ಕೆಜೋಳ: ₹2,225\n• ಸೋಯಾಬೀನ್: ₹4,892\n• ಕಡಲೆ: ₹5,440\n• ಸಾಸಿವೆ: ₹5,650',
      ta: 'தற்போதைய அரசு ஆதரவு விலை (MSP) குவிண்டாலுக்கு:\n• நெல்: ₹2,300\n• கோதுமை: ₹2,275\n• மக்காச்சோளம்: ₹2,225\n• சோயாபீன்: ₹4,892\n• பருத்தி: ₹7,121',
      te: 'ప్రస్తుత కనీస మద్దతు ధర (MSP) క్వింటాలుకు:\n• వరి (సాధారణ): ₹2,300\n• గోధుమ: ₹2,275\n• జొన్న/మక్కజొన్న: ₹2,225\n• సోయాబీన్: ₹4,892\n• శనగలు: ₹5,440'
    }
  },
  {
    id: 'payment',
    category: 'Payment & Direct Bank Transfer (DBT)',
    keywords: ['payment', 'dbt', 'bank', 'money', 'credited', 'utr', 'stages', 'status', 'भुगतान', 'डीबीटी', 'बैंक', 'पैसे', 'यूटीआर', 'ಪಾವತಿ', 'ಬ್ಯಾಂಕ್', 'பணம்', 'செலுத்துதல்', 'చెల్లింపులు'],
    question: {
      en: 'How is payment credited to my bank account and how to track it?',
      hi: 'मेरे बैंक खाते में पैसा कैसे जमा होता है और इसे कैसे ट्रैक करें?',
      kn: 'ನನ್ನ ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ ಹಣ ಹೇಗೆ ಜಮೆಯಾಗುತ್ತದೆ ಮತ್ತು ಅದನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡುವುದು ಹೇಗೆ?',
      ta: 'என் வங்கி கணக்கில் பணம் எவ்வாறு வரவு வைக்கப்படுகிறது, அதை எப்படி கண்காணிப்பது?',
      te: 'నా బ్యాంక్ ఖాతాలో డబ్బు ఎలా జమ అవుతుంది మరియు దానిని ఎలా ట్రాక్ చేయాలి?'
    },
    answer: {
      en: 'Payment is transferred via Direct Benefit Transfer (DBT) directly into your Aadhaar-seeded bank account in 4 transparent stages:\n1. 📜 Procurement Completed: Receipt issued with exact weight & MSP rate.\n2. 🏛️ Payment Initiated: Treasury approval and voucher code generated.\n3. 🏦 DBT Processing: Bank clearing batch submitted.\n4. ✅ Payment Credited: Money credited with UTR reference number sent to your mobile!\n\nCheck status anytime on the Procurement/Payment tab.',
      hi: 'भुगतान सीधे आपके आधार से जुड़े बैंक खाते में DBT के माध्यम से 4 पारदर्शी चरणों में स्थानांतरित होता है:\n1. 📜 फसल खरीद पूरी: सटीक वजन और एमएसपी रसीद जारी।\n2. 🏛️ भुगतान शुरू: कोषागार स्वीकृति और वाउचर कोड जारी।\n3. 🏦 डीबीटी प्रोसेसिंग: बैंक क्लियरिंग प्रक्रिया चालू।\n4. ✅ भुगतान जमा: आपके बैंक खाते में यूटीआर नंबर के साथ राशि जमा!\n\nअपनी स्थिति "खरीद एवं भुगतान" टैब पर देखें।',
      kn: 'ಹಣವು ನೇರವಾಗಿ ನಿಮ್ಮ ಆಧಾರ್ ಲಿಂಕ್ ಆದ ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ DBT ಮೂಲಕ 4 ಹಂತಗಳಲ್ಲಿ ಜಮೆಯಾಗುತ್ತದೆ:\n1. ಖರೀದಿ ರಸೀದಿ\n2. ಪಾವತಿ ಅನುಮೋದನೆ\n3. DBT ಪ್ರಕ್ರಿಯೆ\n4. ಖಾತೆಗೆ ಜಮೆ (UTR ಸಂಖ್ಯೆಯೊಂದಿಗೆ).',
      ta: 'பணம் நேரடியாக உங்கள் ஆதாரோடு இணைக்கப்பட்ட வங்கி கணக்கிற்கு DBT மூலம் 4 கட்டங்களில் வரவு வைக்கப்படும்:\n1. கொள்முதல் ரசீது\n2. அரசாங்க ஒப்புதல்\n3. DBT செயலாக்கம்\n4. கணக்கில் வரவு (UTR எண்ணுடன்).',
      te: 'డబ్బు నేరుగా మీ ఆధಾರ್ లింక్ అయిన బ్యాంక్ ఖాతాకు DBT ద్వారా 4 దశల్లో జమ అవుతుంది:\n1. సేకరణ రసీదు\n2. చెల్లింపు ఆమోదం\n3. DBT ప్రాసెసింగ్\n4. ఖాతాలో జమ (UTR నంబర్‌తో).'
    }
  },
  {
    id: 'helpline',
    category: 'Helpline & Support',
    keywords: ['helpline', 'contact', 'support', 'call', 'number', 'officer', 'problem', 'help', 'हेल्पलाइन', 'संपर्क', 'मदद', 'अधिकारी', 'ಸಹಾಯವಾಣಿ', 'உதவி எண்', 'హెల్ప్‌లైನ್'],
    question: {
      en: 'What is the Toll-Free Helpline and Nodal Support contact?',
      hi: 'टोल-फ्री हेल्पलाइन और नोडल अधिकारी संपर्क नंबर क्या है?',
      kn: 'ಟೋಲ್-ಫ್ರೀ ಸಹಾಯವಾಣಿ ಮತ್ತು ಅಧಿಕಾರಿಗಳ ಸಂಪರ್ಕ ಸಂಖ್ಯೆ ಏನು?',
      ta: 'டோல்-ஃப்ரீ உதவி எண் மற்றும் தொடர்பு எண்கள் என்ன?',
      te: 'టోల్-ఫ్రీ హెల్ప్‌లైన్ మరియు అధికారుల సంప్రదింపు సంఖ్య ఏమిటి?'
    },
    answer: {
      en: 'For any emergency support or procurement queries:\n📞 Toll-Free Kisan Helpline: 1800-180-1551 (6:00 AM - 9:00 PM)\n📧 Support Email: support@kisankendra.gov.in\n🏢 Mandi Nodal Officer: Available at every Procurement Centre office.\n\nYou can also visit the "Help & Rules" section in the app for local Mandi officer details.',
      hi: 'किसी भी आपातकालीन सहायता या खरीद संबंधी प्रश्नों के लिए:\n📞 टोल-फ्री किसान हेल्पलाइन: 1800-180-1551 (सुबह 6:00 से रात 9:00 बजे)\n📧 सहायता ईमेल: support@kisankendra.gov.in\n🏢 मंडी नोडल अधिकारी: प्रत्येक खरीद केंद्र कार्यालय पर उपलब्ध।',
      kn: 'ಯಾವುದೇ ನೆರವಿಗೆ:\n📞 ಉಚಿತ ರೈತ ಸಹಾಯವಾಣಿ: 1800-180-1551\n📧 ಇಮೇಲ್: support@kisankendra.gov.in',
      ta: 'உதவி பெற:\n📞 டோಲ್-ஃப்ரீ உதவி எண்: 1800-180-1551\n📧 மின்னஞ்சல்: support@kisankendra.gov.in',
      te: 'సహాయం కొరకు:\n📞 టోల్-ఫ్రీ కిసాన్ హెల్ప్‌లైన్: 1800-180-1551\n📧 ఈమెయిల్: support@kisankendra.gov.in'
    }
  }
]

/**
 * Step-by-Step Farmer Process Guides for 5 Journey Stages (5 Core Languages)
 */
export const FARMER_PROCESS_GUIDES = {
  step1: {
    title: {
      en: 'Step 1: Registration & Document Preparation',
      hi: 'चरण 1: पंजीकरण एवं दस्तावेज तैयारी',
      kn: 'ಹಂತ 1: ನೋಂದಣಿ ಮತ್ತು ದಾಖಲೆಗಳ ಸಿದ್ಧತೆ',
      ta: 'படி 1: பதிவு மற்றும் ஆவணங்கள் ஆயத்தம்',
      te: 'దశ 1: రిజిస్ట్రేషన్ & డాక్యుమెంట్ల తయారీ'
    },
    details: {
      en: '1. Register your mobile number using OTP.\n2. Ensure your Aadhaar card is linked to your bank account for DBT.\n3. Keep Land Record (Khasra/Khatauni) copy ready.\n4. Add your crop details (crop type, area cultivated, estimated harvest weight).',
      hi: '1. ओटीपी का उपयोग करके अपना मोबाइल नंबर पंजीकृत करें।\n2. सुनिश्चित करें कि आपका आधार कार्ड डीबीटी के लिए बैंक खाते से जुड़ा है।\n3. भूमि रिकॉर्ड (खसरा/खतौनी) की प्रति तैयार रखें।\n4. अपनी फसल का विवरण (प्रकार, क्षेत्रफल, अनुमानित वजन) दर्ज करें।',
      kn: '1. ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯೊಂದಿಗೆ ಲಾಗಿನ್ ಆಗಿ.\n2. ಆಧಾರ್ ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ ಲಿಂಕ್ ಆಗಿದೆಯೇ ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ.\n3. ಜಮೀನು ಪಹಣಿ ದಾಖಲೆ ಸಿದ್ಧವಾಗಿಡಿ.\n4. ನಿಮ್ಮ ಬೆಳೆ ವಿವರಗಳನ್ನು ಸೇರಿಸಿ.',
      ta: '1. மொபைல் எண்ணை பதிவு செய்யுங்கள்.\n2. ஆதார் வங்கி கணக்குடன் இணைக்கப்பட்டுள்ளதா என பார்க்கவும்.\n3. நிலப் பட்டா நகலை தயாராக வைக்கவும்.\n4. பயிர் వివరங்களை உள்ளிடவும்.',
      te: '1. మొబైల్ నంబర్‌తో రిజిస్టర్ అవ్వండి.\n2. ఆధార్ బ్యాంక్ ఖాతాకు లింక్ అయిందో లేదో చూడండి.\n3. భూమి పట్టా కాపీని సిద్ధంగా ఉంచండి.\n4. మీ పంట వివరాలను నమోదు చేయండి.'
    },
    actionLink: '/register',
    actionKey: 'goToRegister'
  },
  step2: {
    title: {
      en: 'Step 2: Booking a Procurement Slot',
      hi: 'चरण 2: खरीद स्लॉट बुकिंग',
      kn: 'ಹಂತ 2: ಬೆಳೆ ಖರೀದಿ ಸ್ಲಾಟ್ ಬುಕಿಂಗ್',
      ta: 'படி 2: கொள்முதல் ஸ்ಲಾட் முன்பதிவு',
      te: 'దశ 2: పంట సేకరణ స్లాట్ బుకింగ్'
    },
    details: {
      en: '1. Open the "Centres" page and select your nearest Mandi.\n2. Check available daily capacity and choose a convenient date.\n3. Pick a morning slot (6 AM-10 AM for Paddy/perishables) or afternoon slot.\n4. Confirm to generate your Token Reference Slip.',
      hi: '1. "केंद्र" पेज खोलें और अपनी निकटतम मंडी चुनें।\n2. उपलब्ध दैनिक क्षमता जांचें और सुविधाजनक तिथि चुनें।\n3. धान/शीघ्र खराब फसलों के लिए सुबह का स्लॉट (6 AM-10 AM) या दोपहर का स्लॉट चुनें।\n4. पुष्टि करके टोकन स्लिप प्राप्त करें।',
      kn: '1. "ಕೇಂದ್ರಗಳು" ಪುಟ ತೆರೆದು ಮಂಡಿ ಆಯ್ಕೆಮಾಡಿ.\n2. ಲಭ್ಯವಿರುವ ದಿನಾಂಕ ಮತ್ತು ಸಮಯ ಆಯ್ಕೆಮಾಡಿ.\n3. ಭತ್ತಕ್ಕೆ ಬೆಳಗಿನ ಸ್ಲಾಟ್ ಆಯ್ಕೆಮಾಡುವುದು ಉತ್ತಮ.\n4. ಕನ್ಫರ್ಮ್ ಮಾಡಿ ಟೋಕನ್ ಪಡೆಯಿರಿ.',
      ta: '1. "மையங்கள்" பக்கத்திற்குச் சென்று மண்டியைத் தேர்வுசெய்யவும்.\n2. வசதியான தேதி மற்றும் நேரத்தைத் தேர்ந்தெடுக்கவும்.\n3. நெல் பயிருக்கு காலை நேரம் சிறந்தது.\n4. உறுதிசெய்து டோக்கன் பெறவும்.',
      te: '1. "కేంద్రాలు" పేజీలో మండీని ఎంచుకోండి.\n2. అందుబాటులో ఉన్న తేదీ మరియు సమయం ఎంచుకోండి.\n3. వరి పంటకు ఉదయం స్లాట్ ఎంచుకోవడం మంచిది.\n4. కన్ఫర్మ్ చేసి డిజిటಲ್ టోకెన్ పొందండి.'
    },
    actionLink: '/centres',
    actionKey: 'goToCentres'
  },
  step3: {
    title: {
      en: 'Step 3: Mandi Gate Check-in',
      hi: 'चरण 3: मंडी गेट चेक-इन',
      kn: 'ಹಂತ 3: ಮಂಡಿ ಗೇಟ್ ಚೆಕ್-ಇನ್',
      ta: 'படி 3: மண்டி கேட் செக்-இன்',
      te: 'దశ 3: మండీ గేట్ వద్ద చెక్-ఇన్'
    },
    details: {
      en: '1. Reach the Mandi gate on your booked date during your slot timing.\n2. Present your Token Code or QR code on phone/printout to gate officer.\n3. Once scanned, your status becomes "Checked-in" and you enter the official mandi queue.\n4. Park your vehicle in designated crop unloading bays.',
      hi: '1. अपने बुक किए गए स्लॉट समय पर मंडी गेट पहुंचे।\n2. गेट अधिकारी को अपना टोकन कोड या क्यूआर कोड दिखाएं।\n3. स्कैन होने के बाद आपका स्टेटस "चेक-इन" हो जाएगा और आप आधिकारिक कतार में शामिल हो जाएंगे।\n4. अपना वाहन निर्दिष्ट फसल अनलोडिंग बे में पार्क करें।',
      kn: '1. ನಿಗದಿತ ಸಮಯಕ್ಕೆ ಮಂಡಿ ಗೇಟ್‌ಗೆ ಬನ್ನಿ.\n2. ನಿಮ್ಮ ಟೋಕನ್ ಕೋಡ್ ಸಿಬ್ಬಂದಿಗೆ ತೋರಿಸಿ.\n3. ಚೆಕ್-ಇನ್ ಆದ ನಂತರ ನಿಮ್ಮ ಸ್ಥಾನ ಲೈವ್ ಕ್ಯೂಗೆ ಸೇರುತ್ತದೆ.',
      ta: '1. குறித்த நேரத்தில் மண்டி கேட்டை அடையுங்கள்.\n2. டோக்கன் குறியீட்டைக் காட்டுங்கள்.\n3. செக்-இன் முடிந்தது நேரலை வரிசையில் இணையுங்கள்.',
      te: '1. కేటాయించిన సమయానికి మండీ గేట్ వద్దకు రండి.\n2. మీ టోకెన్ కోడ్‌ను గేట్ వద్ద చూపించండి.\n3. చెక్-ఇన్ పూర్తి కాగానే లైవ్ క్యూలో మీ టోకెన్ చేరుతుంది.'
    },
    actionLink: '/queue',
    actionKey: 'goToQueue'
  },
  step4: {
    title: {
      en: 'Step 4: Live Queue Tracking & Counter Weighment',
      hi: 'चरण 4: लाइव कतार और काउंटर तौल',
      kn: 'ಹಂತ 4: ಲೈವ್ ಸರದಿ ಮತ್ತು ತೂಕ ಪರೀಕ್ಷೆ',
      ta: 'படி 4: நேரலை வரிசை & எடை பரிசோதனை',
      te: 'దశ 4: లైవ్ క్యూ & కౌంటర్ వద్ద తೂకం'
    },
    details: {
      en: '1. Keep checking the "Queue Tracker" on your mobile to see counter progress.\n2. When your token number is called, drive to the Digital Weighbridge.\n3. Quality inspector tests moisture & grain purity (Grade A or Standard).\n4. Digital receipt is generated with total weight and official MSP amount.',
      hi: '1. काउंटर की प्रगति देखने के लिए मोबाइल पर "कतार ट्रैकर" देखते रहें।\n2. टोकन नंबर पुकारे जाने पर डिजिटल वे bridge पर जाएं।\n3. गुणवत्ता निरीक्षक नमी व शुद्धता की जांच करेंगे (ग्रेड ए या मानक)।\n4. कुल वजन और सरकारी एमएसपी राशि की डिजिटल रसीद जारी होगी।',
      kn: '1. "ಸರದಿ ಟ್ರ್ಯಾಕರ್" ನೋಡಿ ನಿಮ್ಮ ಸರದಿ ಗಮನಿಸಿ.\n2. ಟೋಕನ್ ಕರೆ ಬಂದಾಗ ತೂಕದ ಯಂತ್ರದ ಬಳಿ ಹೋಗಿ.\n3. ಗುಣಮಟ್ಟ ಪರೀಕ್ಷೆ ನಂತರ ಬೆಂಬಲ ಬೆಲೆಯ ರಸೀದಿ ಪಡೆಯಿರಿ.',
      ta: '1. "வரிசை டிராக்கர்" மூலம் உங்கள் நிலையை கவனியுங்கள்.\n2. டோக்கன் அழைக்கப்பட்டதும் எடை மேடைக்கு செல்லுங்கள்.\n3. தரம் சோதிக்கப்பட்டு MSP ரசீது வழங்கப்படும்.',
      te: '1. "క్యూ ట్రాకర్" చూస్తూ మీ టోకెన్ నంబర్ గమనించండి.\n2. పిలుపు రాగానే డిజిటಲ್ తూకం వద్దకు వెళ్లండి.\n3. నాణ్యత తనిਖీ తర్వాత MSP రసీదు పొందండి.'
    },
    actionLink: '/queue',
    actionKey: 'goToQueue'
  },
  step5: {
    title: {
      en: 'Step 5: DBT Direct Payment Tracking',
      hi: 'चरण 5: डीबीटी प्रत्यक्ष बैंक भुगतान ट्रैकिंग',
      kn: 'ಹಂತ 5: DBT ಬ್ಯಾಂಕ್ ಪಾವತಿ ಟ್ರ್ಯಾಕಿಂಗ್',
      ta: 'படி 5: DBT நேரடி வங்கி வரவு கண்காணிப்பு',
      te: 'దశ 5: DBT ద్వారా డైరెక్ట్ బ్యాంక్ చెల్లింపు'
    },
    details: {
      en: '1. Open "Procurement Status" from the dashboard.\n2. Watch your 4-stage timeline: Procurement Completed ➔ Payment Initiated ➔ DBT Processing ➔ Payment Credited.\n3. Once credited, view your bank UTR Reference Number.\n4. Download or print official Procurement Payment Certificate.',
      hi: '1. डैशबोर्ड से "खरीद स्थिति" खोलें।\n2. अपनी 4-चरणीय समयरेखा देखें: खरीद पूरी ➔ भुगतान शुरू ➔ डीबीटी प्रोसेसिंग ➔ भुगतान जमा।\n3. पैसा जमा होने पर बैंक यूटीआर नंबर देखें।\n4. आधिकारिक खरीद भुगतान प्रमाण पत्र डाउनलोड या प्रिंट करें।',
      kn: '1. "ಖರೀದಿ ಸ್ಥಿತಿ" ತೆರೆದು 4 ಹಂತಗಳ ಪಾವತಿ ಸ್ಥಿತಿ ನೋಡಿ.\n2. ಹಣ ಜಮೆಯಾದ ನಂತರ UTR ಸಂಖ್ಯೆ ಪಡೆಯಿರಿ.\n3. ಪಾವತಿ ರಸೀದಿ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ.',
      ta: '1. "கொள்முதல் நிலை" பகுதிக்குச் செல்லுங்கள்.\n2. 4-கட்ட பணப்பரிவர்த்தனை நிலையைப் பாருங்கள்.\n3. பணம் வந்ததும் UTR எண்ணை சரிபாருங்கள்.',
      te: '1. "సేకరణ స్థితి" పేజీలోకి వెళ్లండి.\n2. 4 దశల చెల్లింపుల ప్రక్రియ చూడండి.\n3. డబ్బులు జమ అయ్యాక UTR నంబర్ పొంది రసీదు డౌన్‌లోಡ್ చేయండి.'
    },
    actionLink: '/procurement',
    actionKey: 'goToProcurement'
  }
}
