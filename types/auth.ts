export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  picture: string | null;
  provider: 'google' | 'email';
}

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
}

export interface AdvantagesResponse {
  id: string;
  alias: string;
  title: string;
  components: unknown[];
}
