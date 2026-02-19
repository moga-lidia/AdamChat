import { getTranslation } from "@/i18n";
import { saveAuthTokens } from "@/services/auth-storage";
import type {
  AdvantagesResponse,
  AuthTokens,
  AuthUser,
  RegisterRequest,
  TokenResponse,
  UserSelfResponse,
} from "@/types/auth";
import type { Lang } from "@/types/chat";

const API_BASE = "https://backoffice-v2-api.hope.study";
const ORIGIN = "https://academiasperanta.ro";
const ENVIRONMENT_ID = "DnPBv0mKWa";
const WEBSITE = "https://academiasperanta.ro/ro/";

const ADVANTAGES_URL =
  "https://lpm-api.hope.study/environments/DnPBv0mKWa/pages/Alias/advantages?withComponents=false";

export async function fetchAdvantages(): Promise<AdvantagesResponse | null> {
  try {
    const res = await fetch(ADVANTAGES_URL);
    if (!res.ok) return null;
    return (await res.json()) as AdvantagesResponse;
  } catch {
    return null;
  }
}

/** Decode a Google ID token (JWT) to extract user info. */
export function verifyGoogleToken(idToken: string): AuthUser | null {
  try {
    const parts = idToken.split(".");
    if (parts.length !== 3) return null;

    // base64url → base64
    let payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    while (payload.length % 4 !== 0) payload += "=";

    const decoded = JSON.parse(atob(payload));
    return {
      id: decoded.sub,
      email: decoded.email,
      name: decoded.name ?? null,
      picture: decoded.picture ?? null,
      provider: "google",
    };
  } catch {
    return null;
  }
}

/** Register a new user with email/password. */
export async function registerWithEmail(
  data: RegisterRequest,
  lang: Lang = "ro",
): Promise<{ user: AuthUser; tokens: AuthTokens } | { error: string }> {
  const t = getTranslation(lang);
  try {
    const url = `${API_BASE}/users/register/disciple?website=${encodeURIComponent(WEBSITE)}&environmentId=${ENVIRONMENT_ID}`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: ORIGIN,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      return {
        error: body?.message ?? `${t.errors.registration} (${res.status})`,
      };
    }

    const tokenData = (await res.json()) as TokenResponse;
    const tokens: AuthTokens = {
      accessToken: tokenData.accessToken,
      refreshToken: tokenData.refreshToken,
      expire: tokenData.expire,
    };
    await saveAuthTokens(tokens);

    const user: AuthUser = {
      id: tokenData.userId,
      email: data.email,
      name: `${data.firstName} ${data.lastName}`,
      picture: null,
      provider: "email",
    };

    return { user, tokens };
  } catch {
    return { error: t.errors.connection };
  }
}

/** Sign in with email/password. */
export async function signInWithEmail(
  email: string,
  password: string,
  lang: Lang = "ro",
): Promise<{ user: AuthUser; tokens: AuthTokens } | { error: string }> {
  const t = getTranslation(lang);
  try {
    const res = await fetch(`${API_BASE}/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: ORIGIN,
      },
      body: JSON.stringify({ email, password, grantType: "password" }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      return {
        error: body?.message ?? `${t.errors.wrongCredentials} (${res.status})`,
      };
    }

    const tokenData = (await res.json()) as TokenResponse;
    const tokens: AuthTokens = {
      accessToken: tokenData.accessToken,
      refreshToken: tokenData.refreshToken,
      expire: tokenData.expire,
    };
    await saveAuthTokens(tokens);

    // Fetch user profile with the access token
    const user = await fetchUserSelf(tokens.accessToken);
    if (!user) {
      return { error: t.errors.profileLoad };
    }

    return { user, tokens };
  } catch {
    return { error: t.errors.connection };
  }
}

/** Fetch the authenticated user's profile. */
async function fetchUserSelf(accessToken: string): Promise<AuthUser | null> {
  try {
    const res = await fetch(`${API_BASE}/users/self`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Origin: ORIGIN,
      },
    });

    if (!res.ok) return null;

    const data = (await res.json()) as UserSelfResponse;
    const name =
      [data.firstName, data.lastName].filter(Boolean).join(" ") || null;

    return {
      id: data.id,
      email: data.email,
      name,
      picture: data.picture ?? null,
      provider: "email",
    };
  } catch {
    return null;
  }
}
