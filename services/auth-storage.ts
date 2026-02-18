import type { AuthTokens, AuthUser } from "@/types/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AUTH_USER_KEY = "adam_auth_user";
const AUTH_TOKENS_KEY = "adam_auth_tokens";

export async function loadAuthUser(): Promise<AuthUser | null> {
  try {
    const raw = await AsyncStorage.getItem(AUTH_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export async function saveAuthUser(user: AuthUser): Promise<void> {
  try {
    await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  } catch {
    // silently fail — non-critical
  }
}

export async function loadAuthTokens(): Promise<AuthTokens | null> {
  try {
    const raw = await AsyncStorage.getItem(AUTH_TOKENS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthTokens;
  } catch {
    return null;
  }
}

export async function saveAuthTokens(tokens: AuthTokens): Promise<void> {
  try {
    await AsyncStorage.setItem(AUTH_TOKENS_KEY, JSON.stringify(tokens));
  } catch {
    // silently fail — non-critical
  }
}

export async function clearAuthUser(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([AUTH_USER_KEY, AUTH_TOKENS_KEY]);
  } catch {
    // silently fail
  }
}
