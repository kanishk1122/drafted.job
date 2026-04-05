import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import authReducer from './slices/authSlice';
import pipelineReducer from './slices/pipelineSlice';
import profileReducer from './slices/profileSlice';
import resumeReducer from './slices/resumeSlice';
import jobReducer from './slices/jobSlice';
import browserReducer from './slices/browserSlice';
import aiReducer from './slices/aiSlice';
import uiReducer from './slices/uiSlice';
import notificationReducer from './slices/notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    pipeline: pipelineReducer,
    profile: profileReducer,
    resume: resumeReducer,
    job: jobReducer,
    browser: browserReducer,
    ai: aiReducer,
    ui: uiReducer,
    notification: notificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
