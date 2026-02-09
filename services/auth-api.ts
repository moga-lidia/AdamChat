import type { AuthUser, AdvantagesResponse } from '@/types/auth';

const ADVANTAGES_URL =
  'https://lpm-api.hope.study/environments/DnPBv0mKWa/pages/Alias/advantages?withComponents=false';

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
    const parts = idToken.split('.');
    if (parts.length !== 3) return null;

    // base64url → base64
    let payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (payload.length % 4 !== 0) payload += '=';

    const decoded = JSON.parse(atob(payload));
    return {
      id: decoded.sub,
      email: decoded.email,
      name: decoded.name ?? null,
      picture: decoded.picture ?? null,
      provider: 'google',
    };
  } catch {
    return null;
  }
}

/** Placeholder for future backend email/password authentication. */
export async function signInWithEmail(
  _email: string,
  _password: string,
): Promise<AuthUser | null> {
  // TODO: integrate with backend auth endpoint
  return null;
}
