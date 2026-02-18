export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  picture: string | null;
  provider: 'google' | 'email';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expire: string;
}

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface TokenResponse {
  id: string;
  userId: string;
  accessToken: string;
  refreshToken: string;
  expire: string;
}

export interface UserSelfResponse {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  picture?: string | null;
}

export interface AdvantagesResponse {
  id: string;
  alias: string;
  title: string;
  components: unknown[];
}
