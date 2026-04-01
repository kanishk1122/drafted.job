import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UIState {
  sidebarMode: 'default' | 'mini' | 'hover';
  notificationsEnabled: boolean;
  theme: 'dark' | 'light' | 'system';
}

const initialState: UIState = {
  sidebarMode: 'default',
  notificationsEnabled: true,
  theme: 'dark',
};

// Use localStorage to persist simple UI preferences across sessions
const savedState = typeof window !== 'undefined' ? localStorage.getItem('drafted_ui_prefs') : null;
const finalInitialState = savedState ? { ...initialState, ...JSON.parse(savedState) } : initialState;

const uiSlice = createSlice({
  name: 'ui',
  initialState: finalInitialState,
  reducers: {
    setSidebarMode: (state, action: PayloadAction<'default' | 'mini' | 'hover'>) => {
      state.sidebarMode = action.payload;
      localStorage.setItem('drafted_ui_prefs', JSON.stringify(state));
    },
    setNotificationsEnabled: (state, action: PayloadAction<boolean>) => {
      state.notificationsEnabled = action.payload;
      localStorage.setItem('drafted_ui_prefs', JSON.stringify(state));
    },
    setTheme: (state, action: PayloadAction<'dark' | 'light' | 'system'>) => {
      state.theme = action.payload;
      localStorage.setItem('drafted_ui_prefs', JSON.stringify(state));
    },
  },
});

export const { setSidebarMode, setNotificationsEnabled, setTheme } = uiSlice.actions;
export default uiSlice.reducer;
