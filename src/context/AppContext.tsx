import { createContext, useContext, useReducer, ReactNode } from 'react';
import { Language } from '@/components/LanguageToggle';

export type AppStep = 
  | 'welcome'
  | 'time'
  | 'topic'
  | 'source'
  | 'reflection'
  | 'journal'
  | 'profile';

interface LearningSession {
  id: string;
  sourceTitle: string;
  topic: string;
  timeSpent: number;
  reflection?: string;
  tags?: string[];
  status: 'saved' | 'learned' | 'reflected';
  createdAt: Date;
}

interface AppState {
  currentStep: AppStep;
  language: Language;
  selectedTime: number | null;
  selectedTopic: string | null;
  currentSource: string;
  sessions: LearningSession[];
  user: {
    id?: string;
    name?: string;
    email?: string;
    preferences: {
      theme: 'light' | 'dark' | 'system';
      notifications: boolean;
      dailyGoal: number;
    };
  };
  ui: {
    isLoading: boolean;
    error: string | null;
    notifications: Array<{
      id: string;
      type: 'success' | 'error' | 'info' | 'warning';
      message: string;
      timestamp: Date;
    }>;
  };
}

type AppAction =
  | { type: 'SET_STEP'; payload: AppStep }
  | { type: 'SET_LANGUAGE'; payload: Language }
  | { type: 'SET_TIME'; payload: number }
  | { type: 'SET_TOPIC'; payload: string }
  | { type: 'SET_SOURCE'; payload: string }
  | { type: 'ADD_SESSION'; payload: Omit<LearningSession, 'id' | 'createdAt'> }
  | { type: 'UPDATE_SESSION'; payload: { id: string; updates: Partial<LearningSession> } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' }
  | { type: 'ADD_NOTIFICATION'; payload: Omit<AppState['ui']['notifications'][0], 'id' | 'timestamp'> }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'UPDATE_USER_PREFERENCES'; payload: Partial<AppState['user']['preferences']> }
  | { type: 'RESET_SESSION' };

const initialState: AppState = {
  currentStep: 'welcome',
  language: 'en',
  selectedTime: null,
  selectedTopic: null,
  currentSource: '',
  sessions: [],
  user: {
    preferences: {
      theme: 'light',
      notifications: true,
      dailyGoal: 15
    }
  },
  ui: {
    isLoading: false,
    error: null,
    notifications: []
  }
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };
    
    case 'SET_LANGUAGE':
      return { ...state, language: action.payload };
    
    case 'SET_TIME':
      return { ...state, selectedTime: action.payload };
    
    case 'SET_TOPIC':
      return { ...state, selectedTopic: action.payload };
    
    case 'SET_SOURCE':
      return { ...state, currentSource: action.payload };
    
    case 'ADD_SESSION':
      const newSession: LearningSession = {
        ...action.payload,
        id: Date.now().toString(),
        createdAt: new Date()
      };
      return {
        ...state,
        sessions: [newSession, ...state.sessions]
      };
    
    case 'UPDATE_SESSION':
      return {
        ...state,
        sessions: state.sessions.map(session =>
          session.id === action.payload.id
            ? { ...session, ...action.payload.updates }
            : session
        )
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        ui: { ...state.ui, isLoading: action.payload }
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        ui: { ...state.ui, error: action.payload }
      };
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        ui: { ...state.ui, error: null }
      };
    
    case 'ADD_NOTIFICATION':
      const notification = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: new Date()
      };
      return {
        ...state,
        ui: {
          ...state.ui,
          notifications: [notification, ...state.ui.notifications].slice(0, 5) // Keep only 5 latest
        }
      };
    
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        ui: {
          ...state.ui,
          notifications: state.ui.notifications.filter(n => n.id !== action.payload)
        }
      };
    
    case 'UPDATE_USER_PREFERENCES':
      return {
        ...state,
        user: {
          ...state.user,
          preferences: { ...state.user.preferences, ...action.payload }
        }
      };
    
    case 'RESET_SESSION':
      return {
        ...state,
        selectedTime: null,
        selectedTopic: null,
        currentSource: '',
        currentStep: 'welcome'
      };
    
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  actions: {
    setStep: (step: AppStep) => void;
    setLanguage: (language: Language) => void;
    setTime: (time: number) => void;
    setTopic: (topic: string) => void;
    setSource: (source: string) => void;
    addSession: (session: Omit<LearningSession, 'id' | 'createdAt'>) => void;
    updateSession: (id: string, updates: Partial<LearningSession>) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    clearError: () => void;
    addNotification: (notification: Omit<AppState['ui']['notifications'][0], 'id' | 'timestamp'>) => void;
    removeNotification: (id: string) => void;
    updateUserPreferences: (preferences: Partial<AppState['user']['preferences']>) => void;
    resetSession: () => void;
    goToPreviousStep: () => void;
    goToNextStep: () => void;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const actions = {
    setStep: (step: AppStep) => dispatch({ type: 'SET_STEP', payload: step }),
    setLanguage: (language: Language) => dispatch({ type: 'SET_LANGUAGE', payload: language }),
    setTime: (time: number) => dispatch({ type: 'SET_TIME', payload: time }),
    setTopic: (topic: string) => dispatch({ type: 'SET_TOPIC', payload: topic }),
    setSource: (source: string) => dispatch({ type: 'SET_SOURCE', payload: source }),
    addSession: (session: Omit<LearningSession, 'id' | 'createdAt'>) =>
      dispatch({ type: 'ADD_SESSION', payload: session }),
    updateSession: (id: string, updates: Partial<LearningSession>) =>
      dispatch({ type: 'UPDATE_SESSION', payload: { id, updates } }),
    setLoading: (loading: boolean) => dispatch({ type: 'SET_LOADING', payload: loading }),
    setError: (error: string | null) => dispatch({ type: 'SET_ERROR', payload: error }),
    clearError: () => dispatch({ type: 'CLEAR_ERROR' }),
    addNotification: (notification: Omit<AppState['ui']['notifications'][0], 'id' | 'timestamp'>) =>
      dispatch({ type: 'ADD_NOTIFICATION', payload: notification }),
    removeNotification: (id: string) => dispatch({ type: 'REMOVE_NOTIFICATION', payload: id }),
    updateUserPreferences: (preferences: Partial<AppState['user']['preferences']>) =>
      dispatch({ type: 'UPDATE_USER_PREFERENCES', payload: preferences }),
    resetSession: () => dispatch({ type: 'RESET_SESSION' }),
    
    goToPreviousStep: () => {
      const stepOrder: AppStep[] = ['welcome', 'time', 'topic', 'source', 'reflection'];
      const currentIndex = stepOrder.indexOf(state.currentStep);
      if (currentIndex > 0) {
        dispatch({ type: 'SET_STEP', payload: stepOrder[currentIndex - 1] });
      }
    },
    
    goToNextStep: () => {
      const stepOrder: AppStep[] = ['welcome', 'time', 'topic', 'source', 'reflection'];
      const currentIndex = stepOrder.indexOf(state.currentStep);
      if (currentIndex >= 0 && currentIndex < stepOrder.length - 1) {
        dispatch({ type: 'SET_STEP', payload: stepOrder[currentIndex + 1] });
      }
    }
  };

  return (
    <AppContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}