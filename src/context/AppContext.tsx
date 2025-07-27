import {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useEffect,
} from "react";
import { Language } from "../components/LanguageToggle";

interface AppState {
  language: Language;
  darkMode: boolean;
}

type Action =
  | { type: "setLanguage"; payload: Language }
  | { type: "setDarkMode"; payload: boolean };

const initialState: AppState = {
  language: "en",
  darkMode: false,
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "setLanguage":
      return { ...state, language: action.payload };
    case "setDarkMode":
      return { ...state, darkMode: action.payload };
    default:
      return state;
  }
}

const AppContext = createContext<
  [AppState, React.Dispatch<Action>] | undefined
>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState, (init) => {
    const storedLang = localStorage.getItem("orayta_lang") as Language | null;
    const storedDark = localStorage.getItem("orayta_dark");
    return {
      ...init,
      language: storedLang === "he" ? "he" : "en",
      darkMode: storedDark === "true",
    };
  });

  useEffect(() => {
    localStorage.setItem("orayta_lang", state.language);
    localStorage.setItem("orayta_dark", String(state.darkMode));
    if (state.darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [state.language, state.darkMode]);

  return (
    <AppContext.Provider value={[state, dispatch]}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
};
