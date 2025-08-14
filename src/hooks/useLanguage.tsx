import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'es' | 'ca' | 'hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    'hero.title': 'CO-EVOLVE NETWORK',
    'hero.subtitle': 'Architecting Sovereign Independence through AI collaboration. A global community foundry building tools and ventures for the next generation of creators.',
    'hero.launchBanner': 'Independence Day Launch: Bharat → Barcelona → World',
    'mission.title': 'THE MISSION',
    'mission.text1': 'The future belongs to sovereign creators who partner with AI to amplify their unique human experience into scalable impact.',
    'mission.text2': 'We build the infrastructure for this new world. From Barcelona to Bangalore, we believe in proof over promises.',
    'mission.core': 'CORE PRINCIPLE',
    'mission.coreText': 'Every startup failure teaches. Every success documents. Every tool empowers. We transform insights into accessible AI adoption guides.',
    'community.title': 'BARCELONA COMMUNITY HUB',
    'community.subtitle': 'Where failure meets insight, and ideas become apps',
    'community.failure': 'Startup Failure Insights',
    'community.failureDesc': 'Weekly sessions sharing real failure stories and extracted lessons for the community.',
    'community.adoption': 'Non-Tech AI Adoption',
    'community.adoptionDesc': 'Practical guides and mentorship for non-technical people to confidently adopt AI tools.',
    'community.launch': 'Launch Documentation',
    'community.launchDesc': 'Complete series from idea to final app, with templates and community contributions.',
    'resources.title': 'DOWNLOADABLE RESOURCES',
    'resources.manifesto': 'The Sovereign Manifesto',
    'resources.guides': 'AI Adoption Guides',
    'resources.templates': 'Launch Templates',
    'resources.failures': 'Failure Case Studies',
    'signup.title': 'JOIN THE NETWORK',
    'signup.subtitle': 'Enter the collective. Receive updates on evolution, ventures, and exclusive creator economy insights.',
    'signup.placeholder': 'your@email.com',
    'signup.button': 'CONNECT',
    'signup.disclaimer': 'No spam. Only signal. Unsubscribe anytime.',
    'contact.title': 'CONNECT',
    'contact.subtitle': 'Ready to co-evolve? Let\'s build together.',
    'contact.email': 'Email Us',
    'contact.linkedin': 'LinkedIn',
    'contact.barcelona': 'Barcelona Hub'
  },
  es: {
    'hero.title': 'RED CO-EVOLUCIÓN',
    'hero.subtitle': 'Arquitectando la Independencia Soberana a través de la colaboración con IA. Una fundición comunitaria global construyendo herramientas y ventures para la próxima generación de creadores.',
    'hero.launchBanner': 'Lanzamiento Día de la Independencia: Bharat → Barcelona → Mundo',
    'mission.title': 'LA MISIÓN',
    'mission.text1': 'El futuro pertenece a creadores soberanos que se asocian con IA para amplificar su experiencia humana única en impacto escalable.',
    'mission.text2': 'Construimos la infraestructura para este nuevo mundo. De Barcelona a Bangalore, creemos en pruebas sobre promesas.',
    'mission.core': 'PRINCIPIO FUNDAMENTAL',
    'mission.coreText': 'Cada fracaso de startup enseña. Cada éxito documenta. Cada herramienta empodera. Transformamos insights en guías accesibles de adopción de IA.',
    'community.title': 'HUB COMUNITARIO BARCELONA',
    'community.subtitle': 'Donde el fracaso encuentra insight, y las ideas se vuelven apps',
    'community.failure': 'Insights de Fracasos Startup',
    'community.failureDesc': 'Sesiones semanales compartiendo historias reales de fracaso y lecciones extraídas para la comunidad.',
    'community.adoption': 'Adopción de IA No-Tech',
    'community.adoptionDesc': 'Guías prácticas y mentoría para personas no técnicas para adoptar herramientas de IA con confianza.',
    'community.launch': 'Documentación de Lanzamiento',
    'community.launchDesc': 'Serie completa de idea a app final, con plantillas y contribuciones comunitarias.',
    'resources.title': 'RECURSOS DESCARGABLES',
    'resources.manifesto': 'El Manifiesto Soberano',
    'resources.guides': 'Guías de Adopción de IA',
    'resources.templates': 'Plantillas de Lanzamiento',
    'resources.failures': 'Estudios de Casos de Fracaso',
    'signup.title': 'ÚNETE A LA RED',
    'signup.subtitle': 'Entra al colectivo. Recibe actualizaciones sobre evolución, ventures e insights exclusivos de la economía creadora.',
    'signup.placeholder': 'tu@email.com',
    'signup.button': 'CONECTAR',
    'signup.disclaimer': 'Sin spam. Solo señal. Cancela cuando quieras.',
    'contact.title': 'CONECTAR',
    'contact.subtitle': '¿Listo para co-evolucionar? Construyamos juntos.',
    'contact.email': 'Envía Email',
    'contact.linkedin': 'LinkedIn',
    'contact.barcelona': 'Hub Barcelona'
  },
  ca: {
    'hero.title': 'XARXA CO-EVOLUCIÓ',
    'hero.subtitle': 'Arquitectant la Independència Sobirana a través de la col·laboració amb IA. Una fundició comunitària global construint eines i ventures per a la propera generació de creadors.',
    'hero.launchBanner': 'Llançament Dia de la Independència: Bharat → Barcelona → Món',
    'mission.title': 'LA MISSIÓ',
    'mission.text1': 'El futur pertany a creadors sobirans que s\'associen amb IA per amplificar la seva experiència humana única en impacte escalable.',
    'mission.text2': 'Construïm la infraestructura per a aquest nou món. De Barcelona a Bangalore, creiem en proves sobre promeses.',
    'mission.core': 'PRINCIPI FONAMENTAL',
    'mission.coreText': 'Cada fracàs de startup ensenya. Cada èxit documenta. Cada eina empodera. Transformem insights en guies accessibles d\'adopció d\'IA.',
    'community.title': 'HUB COMUNITARI BARCELONA',
    'community.subtitle': 'On el fracàs troba insight, i les idees es converteixen en apps',
    'community.failure': 'Insights de Fracassos Startup',
    'community.failureDesc': 'Sessions setmanals compartint històries reals de fracàs i lliçons extretes per a la comunitat.',
    'community.adoption': 'Adopció d\'IA No-Tech',
    'community.adoptionDesc': 'Guies pràctiques i mentoria per a persones no tècniques per adoptar eines d\'IA amb confiança.',
    'community.launch': 'Documentació de Llançament',
    'community.launchDesc': 'Sèrie completa d\'idea a app final, amb plantilles i contribucions comunitàries.',
    'resources.title': 'RECURSOS DESCARREGABLES',
    'resources.manifesto': 'El Manifest Sobirà',
    'resources.guides': 'Guies d\'Adopció d\'IA',
    'resources.templates': 'Plantilles de Llançament',
    'resources.failures': 'Estudis de Casos de Fracàs',
    'signup.title': 'UNEIX-TE A LA XARXA',
    'signup.subtitle': 'Entra al col·lectiu. Rep actualitzacions sobre evolució, ventures i insights exclusius de l\'economia creadora.',
    'signup.placeholder': 'el.teu@email.com',
    'signup.button': 'CONNECTAR',
    'signup.disclaimer': 'Sense spam. Només senyal. Cancel·la quan vulguis.',
    'contact.title': 'CONNECTAR',
    'contact.subtitle': 'Preparat per co-evolucionar? Construïm junts.',
    'contact.email': 'Envia Email',
    'contact.linkedin': 'LinkedIn',
    'contact.barcelona': 'Hub Barcelona'
  },
  hi: {
    'hero.title': 'को-इवॉल्व नेटवर्क',
    'hero.subtitle': 'AI सहयोग के माध्यम से संप्रभु स्वतंत्रता का वास्तुशिल्प। अगली पीढ़ी के रचनाकारों के लिए उपकरण और उद्यम निर्माण करने वाला वैश्विक समुदाय फाउंड्री।',
    'hero.launchBanner': 'स्वतंत्रता दिवस लॉन्च: भारत → बार्सिलोना → विश्व',
    'mission.title': 'मिशन',
    'mission.text1': 'भविष्य उन संप्रभु रचनाकारों का है जो AI के साथ साझेदारी करके अपने अनूठे मानवीय अनुभव को स्केलेबल प्रभाव में बदलते हैं।',
    'mission.text2': 'हम इस नई दुनिया के लिए बुनियादी ढांचा बनाते हैं। बार्सिलोना से बैंगलोर तक, हम वादों पर सबूत में विश्वास करते हैं।',
    'mission.core': 'मूल सिद्धांत',
    'mission.coreText': 'हर स्टार्टअप विफलता सिखाती है। हर सफलता दस्तावेजित करती है। हर उपकरण सशक्त बनाता है। हम अंतर्दृष्टि को सुलभ AI अपनाने के गाइड में बदलते हैं।',
    'community.title': 'बार्सिलोना कम्युनिटी हब',
    'community.subtitle': 'जहां विफलता अंतर्दृष्टि से मिलती है, और विचार ऐप्स बन जाते हैं',
    'community.failure': 'स्टार्टअप विफलता अंतर्दृष्टि',
    'community.failureDesc': 'समुदाय के लिए वास्तविक विफलता की कहानियां और निकाले गए सबक साझा करने वाले साप्ताहिक सत्र।',
    'community.adoption': 'गैर-तकनीकी AI अपनाना',
    'community.adoptionDesc': 'गैर-तकनीकी लोगों के लिए AI उपकरणों को आत्मविश्वास से अपनाने के लिए व्यावहारिक गाइड और मार्गदर्शन।',
    'community.launch': 'लॉन्च दस्तावेजीकरण',
    'community.launchDesc': 'विचार से अंतिम ऐप तक की पूरी श्रृंखला, टेम्प्लेट और सामुदायिक योगदान के साथ।',
    'resources.title': 'डाउनलोड योग्य संसाधन',
    'resources.manifesto': 'संप्रभु घोषणापत्र',
    'resources.guides': 'AI अपनाने के गाइड',
    'resources.templates': 'लॉन्च टेम्प्लेट',
    'resources.failures': 'विफलता केस स्टडी',
    'signup.title': 'नेटवर्क में शामिल हों',
    'signup.subtitle': 'सामूहिकता में प्रवेश करें। विकास, उद्यम और विशेष रचनाकार अर्थव्यवस्था अंतर्दृष्टि पर अपडेट प्राप्त करें।',
    'signup.placeholder': 'आपका@email.com',
    'signup.button': 'कनेक्ट करें',
    'signup.disclaimer': 'कोई स्पैम नहीं। केवल सिग्नल। किसी भी समय अनसब्सक्राइब करें।',
    'contact.title': 'कनेक्ट करें',
    'contact.subtitle': 'को-इवॉल्व करने के लिए तैयार? आइए मिलकर निर्माण करते हैं।',
    'contact.email': 'ईमेल भेजें',
    'contact.linkedin': 'लिंक्डइन',
    'contact.barcelona': 'बार्सिलोना हब'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('coevolve-language') as Language;
    if (savedLang && translations[savedLang]) {
      setLanguage(savedLang);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('coevolve-language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};