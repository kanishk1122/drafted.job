import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import authReducer from './slices/authSlice';
import pipelineReducer from './slices/pipelineSlice';
import profileReducer from './slices/profileSlice';
import resumeReducer from './slices/resumeSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    pipeline: pipelineReducer,
    profile: profileReducer,
    resume: resumeReducer,
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
