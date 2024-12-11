import { createFeatureSelector, createSelector } from "@ngrx/store";
import { AuthState } from "../models/auth-state.model";
import { AUTH_FEATURE_KEY } from "./auth.reducers";


export const selectAuth = createFeatureSelector<AuthState>(AUTH_FEATURE_KEY);

export const isAuthenticated = createSelector(selectAuth, state => state.isAuthenticated);

// export const authUser = createSelector()

export const isLoading = createSelector(selectAuth, state => state.isLoading);

export const user = createSelector(selectAuth, state => state.user);