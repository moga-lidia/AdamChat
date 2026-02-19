import type { Lang } from "@/types/chat";

export interface QuickAction {
  label: string;
  prompt: string;
}

export interface WelcomeFeature {
  icon: string;
  text: string;
}

export interface TranslationKeys {
  welcome: {
    title: string;
    subtitle: string;
    featuresTitle: string;
    features: WelcomeFeature[];
    start: string;
  };
  chat: {
    welcomeMessage: string;
    inputPlaceholder: string;
    streamingPlaceholder: string;
    errorMessage: string;
  };
  quickActions: QuickAction[];
  menu: {
    signOut: string;
    signIn: string;
    settings: string;
    newChat: string;
    signOutConfirmTitle: string;
    signOutConfirmMessage: string;
    newChatConfirmTitle: string;
    newChatConfirmMessage: string;
    cancel: string;
    confirm: string;
  };
  settings: {
    title: string;
    fontSize: string;
    contrast: string;
    brightness: string;
    language: string;
  };
  auth: {
    welcomeTitle: string;
    welcomeSubtitle: string;
    continueWithGoogle: string;
    continueWithEmail: string;
    termsText: string;
    privacyPolicy: string;
    termsOfUse: string;
    and: string;
    back: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    signIn: string;
    createAccount: string;
    forgotPassword: string;
    haveAccount: string;
    sendRequest: string;
    signOut: string;
    user: string;
    fillEmailAndPassword: string;
    fillAllFields: string;
    googleVerifyError: string;
    termsConsent: string;
    passwordResetUnavailable: string;
  };
  errors: {
    registration: string;
    connection: string;
    wrongCredentials: string;
    profileLoad: string;
  };
}

export const translations: Record<Lang, TranslationKeys> = {
  ro: {
    welcome: {
      title: "Bine ai venit!",
      subtitle:
        "Sunt Adam, asistentul biblic AI dezvoltat de Academia Speranța.",
      featuresTitle: "Sunt aici să te ajut cu:",
      features: [
        { icon: "book.fill", text: "Explicații biblice clare" },
        {
          icon: "lightbulb.fill",
          text: "Răspunsuri argumentate la întrebări despre credință, morală și sens",
        },
      ],
      start: "START",
    },
    chat: {
      welcomeMessage:
        "Bună! Sunt aici să te ajut cu răspunsuri la întrebări despre Biblie și viața spirituală. Spune-mi, te rog, cu ce pot începe?",
      inputPlaceholder: "Pune o întrebare biblică...",
      streamingPlaceholder: "Se generează răspunsul, te rog să aștepți...",
      errorMessage: "Ne pare rău, a apărut o eroare. Încearcă din nou.",
    },
    quickActions: [
      { label: "Motivează-mă", prompt: "MOTIVATION" },
      { label: "Spune-mi ceva ce nu știu", prompt: "TELL_ME_SOMETHING" },
      { label: "Meditația zilei", prompt: "DAILY_MEDITATION" },
    ],
    menu: {
      signOut: "Deconectează-te",
      signIn: "Autentifică-te",
      settings: "Setări",
      newChat: "Conversație nouă",
      signOutConfirmTitle: "Deconectare",
      signOutConfirmMessage: "Ești sigur că vrei să te deconectezi?",
      newChatConfirmTitle: "Conversație nouă",
      newChatConfirmMessage: "Sigur vrei să ștergi conversația curentă?",
      cancel: "Anulează",
      confirm: "Da",
    },
    settings: {
      title: "Setări",
      fontSize: "Mărime Font",
      contrast: "Contrast",
      brightness: "Luminozitate",
      language: "Limbă",
    },
    auth: {
      welcomeTitle: "Bine ai venit!",
      welcomeSubtitle: "Conectează-te pentru a descoperi mai multe",
      continueWithGoogle: "Continuă cu Google",
      continueWithEmail: "Continuă cu Email",
      termsText: "Prin conectare, ești de acord cu",
      privacyPolicy: "Politica de confidențialitate",
      termsOfUse: "Termenii de utilizare",
      and: "și",
      back: "Înapoi",
      email: "E-mail *",
      password: "Parolă *",
      firstName: "Prenume *",
      lastName: "Nume *",
      signIn: "Autentificare",
      createAccount: "Creează un cont",
      forgotPassword: "Ai uitat parola",
      haveAccount: "Ai un cont? ",
      sendRequest: "Trimite cererea",
      signOut: "Deconectează-te",
      user: "Utilizator",
      fillEmailAndPassword: "Completează email-ul și parola.",
      fillAllFields: "Completează toate câmpurile.",
      googleVerifyError: "Nu am putut verifica contul Google.",
      termsConsent: "Prin semnare, ești de acord cu",
      passwordResetUnavailable:
        "Resetarea parolei nu este disponibilă momentan.",
    },
    errors: {
      registration: "Eroare la înregistrare",
      connection: "Eroare de conexiune. Încearcă din nou.",
      wrongCredentials: "Email sau parolă incorectă.",
      profileLoad: "Nu am putut încărca profilul utilizatorului.",
    },
  },
  en: {
    welcome: {
      title: "Welcome!",
      subtitle:
        "I'm Adam, the AI Bible assistant developed by Academia Speranța.",
      featuresTitle: "I'm here to help you with:",
      features: [
        { icon: "book.fill", text: "Clear biblical explanations" },
        {
          icon: "lightbulb.fill",
          text: "Well-reasoned answers to questions about faith, morality and meaning",
        },
      ],
      start: "START",
    },
    chat: {
      welcomeMessage:
        "Hello! I am here to help you with answers to questions about the Bible and spiritual life. Please tell me, how can I help?",
      inputPlaceholder: "Ask a biblical question...",
      streamingPlaceholder: "Generating response, please wait...",
      errorMessage: "Sorry, an error occurred. Please try again.",
    },
    quickActions: [
      { label: "Motivate me", prompt: "MOTIVATION" },
      { label: "Tell me something I don't know", prompt: "TELL_ME_SOMETHING" },
      { label: "Daily meditation", prompt: "DAILY_MEDITATION" },
    ],
    menu: {
      signOut: "Sign out",
      signIn: "Sign in",
      settings: "Settings",
      newChat: "New conversation",
      signOutConfirmTitle: "Sign out",
      signOutConfirmMessage: "Are you sure you want to sign out?",
      newChatConfirmTitle: "New conversation",
      newChatConfirmMessage:
        "Are you sure you want to delete the current conversation?",
      cancel: "Cancel",
      confirm: "Yes",
    },
    settings: {
      title: "Settings",
      fontSize: "Font Size",
      contrast: "Contrast",
      brightness: "Brightness",
      language: "Language",
    },
    auth: {
      welcomeTitle: "Welcome!",
      welcomeSubtitle: "Sign in to discover more",
      continueWithGoogle: "Continue with Google",
      continueWithEmail: "Continue with Email",
      termsText: "By signing in, you agree to the",
      privacyPolicy: "Privacy Policy",
      termsOfUse: "Terms of Use",
      and: "and",
      back: "Back",
      email: "E-mail *",
      password: "Password *",
      firstName: "First name *",
      lastName: "Last name *",
      signIn: "Sign in",
      createAccount: "Create an account",
      forgotPassword: "Forgot password",
      haveAccount: "Have an account? ",
      sendRequest: "Send request",
      signOut: "Sign out",
      user: "User",
      fillEmailAndPassword: "Please fill in your email and password.",
      fillAllFields: "Please fill in all fields.",
      googleVerifyError: "Could not verify your Google account.",
      termsConsent: "By signing up, you agree to the",
      passwordResetUnavailable:
        "Password reset is not available at the moment.",
    },
    errors: {
      registration: "Registration error",
      connection: "Connection error. Please try again.",
      wrongCredentials: "Wrong email or password.",
      profileLoad: "Could not load user profile.",
    },
  },
  hu: {
    welcome: {
      title: "Isten hozott!",
      subtitle: "Adam vagyok, az Academia Speranța AI bibliai asszisztense.",
      featuresTitle: "Azért vagyok itt, hogy segítsek:",
      features: [
        { icon: "book.fill", text: "Világos bibliai magyarázatok" },
        {
          icon: "lightbulb.fill",
          text: "Megalapozott válaszok a hitről, erkölcsről és életértelemről szóló kérdésekre",
        },
      ],
      start: "START",
    },
    chat: {
      welcomeMessage:
        "Szia! Azért vagyok itt, hogy segítsek a Bibliával és a lelki élettel kapcsolatos kérdéseidben. Kérlek, mondd el, miben segíthetek?",
      inputPlaceholder: "Tegyél fel egy bibliai kérdést...",
      streamingPlaceholder: "Válasz generálása, kérlek várj...",
      errorMessage: "Sajnáljuk, hiba történt. Kérlek, próbáld újra.",
    },
    quickActions: [
      { label: "Motiválj", prompt: "MOTIVATION" },
      { label: "Mondj valamit, amit nem tudok", prompt: "TELL_ME_SOMETHING" },
      { label: "A nap meditációja", prompt: "DAILY_MEDITATION" },
    ],
    menu: {
      signOut: "Kijelentkezés",
      signIn: "Bejelentkezés",
      settings: "Beállítások",
      newChat: "Új beszélgetés",
      signOutConfirmTitle: "Kijelentkezés",
      signOutConfirmMessage: "Biztosan ki szeretnél jelentkezni?",
      newChatConfirmTitle: "Új beszélgetés",
      newChatConfirmMessage:
        "Biztosan törölni szeretnéd a jelenlegi beszélgetést?",
      cancel: "Mégsem",
      confirm: "Igen",
    },
    settings: {
      title: "Beállítások",
      fontSize: "Betűméret",
      contrast: "Kontraszt",
      brightness: "Fényerő",
      language: "Nyelv",
    },
    auth: {
      welcomeTitle: "Isten hozott!",
      welcomeSubtitle: "Jelentkezz be, hogy többet felfedezz",
      continueWithGoogle: "Folytatás Google-lal",
      continueWithEmail: "Folytatás e-maillel",
      termsText: "A bejelentkezéssel elfogadod a",
      privacyPolicy: "Adatvédelmi irányelvek",
      termsOfUse: "Felhasználási feltételek",
      and: "és",
      back: "Vissza",
      email: "E-mail *",
      password: "Jelszó *",
      firstName: "Keresztnév *",
      lastName: "Vezetéknév *",
      signIn: "Bejelentkezés",
      createAccount: "Fiók létrehozása",
      forgotPassword: "Elfelejtett jelszó",
      haveAccount: "Van fiókod? ",
      sendRequest: "Kérelem küldése",
      signOut: "Kijelentkezés",
      user: "Felhasználó",
      fillEmailAndPassword: "Kérjük, töltsd ki az e-mail és jelszó mezőket.",
      fillAllFields: "Kérjük, tölts ki minden mezőt.",
      googleVerifyError: "Nem sikerült ellenőrizni a Google fiókodat.",
      termsConsent: "A regisztrációval elfogadod a",
      passwordResetUnavailable: "A jelszó visszaállítás jelenleg nem elérhető.",
    },
    errors: {
      registration: "Regisztrációs hiba",
      connection: "Csatlakozási hiba. Kérlek, próbáld újra.",
      wrongCredentials: "Hibás e-mail vagy jelszó.",
      profileLoad: "Nem sikerült betölteni a felhasználói profilt.",
    },
  },
};
