import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

import { useAuth } from '@/hooks/use-auth';
import { fetchAdvantages, verifyGoogleToken, signInWithEmail } from '@/services/auth-api';
import { IconSymbol } from '@/components/ui/icon-symbol';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID';

interface Props {
  visible: boolean;
  onClose: () => void;
}

type ModalView = 'main' | 'email';

export function AuthModal({ visible, onClose }: Props) {
  const { user, signIn, signOut } = useAuth();
  const [view, setView] = useState<ModalView>('main');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const discovery = AuthSession.useAutoDiscovery('https://accounts.google.com');
  const redirectUri = AuthSession.makeRedirectUri();

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: GOOGLE_CLIENT_ID,
      redirectUri,
      scopes: ['openid', 'profile', 'email'],
      responseType: AuthSession.ResponseType.IdToken,
    },
    discovery,
  );

  // Handle Google auth response
  useEffect(() => {
    if (response?.type === 'success' && response.params.id_token) {
      const authUser = verifyGoogleToken(response.params.id_token);
      if (authUser) {
        signIn(authUser);
        onClose();
      } else {
        setError('Nu am putut verifica contul Google.');
      }
    }
  }, [response]);

  // Fetch advantages when modal opens
  useEffect(() => {
    if (visible) {
      fetchAdvantages().then((data) => {
        if (data) console.log('[AuthModal] advantages:', data);
      });
    }
    if (!visible) {
      setView('main');
      setEmail('');
      setPassword('');
      setError(null);
    }
  }, [visible]);

  const handleGoogleSignIn = () => {
    setError(null);
    promptAsync();
  };

  const handleEmailSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Completează email-ul și parola.');
      return;
    }
    setLoading(true);
    setError(null);
    const authUser = await signInWithEmail(email.trim(), password.trim());
    setLoading(false);
    if (authUser) {
      signIn(authUser);
      onClose();
    } else {
      setError('Autentificarea cu email nu este disponibilă momentan.');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  // Authenticated view
  if (user) {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <Pressable style={styles.overlay} onPress={onClose}>
          <Pressable style={styles.modal} onPress={(e) => e.stopPropagation()}>
            <View style={styles.handle} />
            <Text style={styles.title}>Contul tău</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            {user.name && <Text style={styles.userName}>{user.name}</Text>}
            <Pressable
              onPress={handleSignOut}
              style={({ pressed }) => [
                styles.signOutButton,
                { opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Text style={styles.signOutText}>Deconectează-te</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modal} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />

          {view === 'main' ? (
            <>
              <Text style={styles.title}>
                Conectează-te pentru a descoperi mai multe!
              </Text>
              <Text style={styles.subtitle}>
                Prin conectare, ești de acord cu{' '}
                <Text
                  style={styles.link}
                  onPress={() => Linking.openURL('https://hope.study/privacy')}
                >
                  Politica de confidențialitate
                </Text>
                {' '}și{' '}
                <Text
                  style={styles.link}
                  onPress={() => Linking.openURL('https://hope.study/terms')}
                >
                  Termeni de utilizare
                </Text>
              </Text>

              {error && <Text style={styles.error}>{error}</Text>}

              <Pressable
                onPress={handleGoogleSignIn}
                disabled={!request}
                style={({ pressed }) => [
                  styles.authButton,
                  styles.googleButton,
                  { opacity: pressed ? 0.8 : 1 },
                ]}
              >
                <Text style={styles.googleG}>G</Text>
                <Text style={styles.authButtonText}>Continuă cu Google</Text>
              </Pressable>

              <Pressable
                onPress={() => { setError(null); setView('email'); }}
                style={({ pressed }) => [
                  styles.authButton,
                  styles.emailButton,
                  { opacity: pressed ? 0.8 : 1 },
                ]}
              >
                <IconSymbol name="envelope.fill" size={18} color="#FFFFFF" />
                <Text style={styles.authButtonText}>Continuă cu Email</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Pressable
                onPress={() => { setError(null); setView('main'); }}
                style={styles.backButton}
              >
                <Text style={styles.backText}>← Înapoi</Text>
              </Pressable>

              <Text style={styles.title}>Conectare cu Email</Text>

              {error && <Text style={styles.error}>{error}</Text>}

              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#888"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
              />
              <TextInput
                style={styles.input}
                placeholder="Parolă"
                placeholderTextColor="#888"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />

              <Pressable
                onPress={handleEmailSignIn}
                disabled={loading}
                style={({ pressed }) => [
                  styles.authButton,
                  styles.submitButton,
                  { opacity: pressed || loading ? 0.7 : 1 },
                ]}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.authButtonText}>Conectează-te</Text>
                )}
              </Pressable>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#1A1A2E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#555',
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    color: '#AAAAAA',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  link: {
    color: '#7B6FE8',
    textDecorationLine: 'underline',
  },
  error: {
    color: '#FF6B6B',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 12,
  },
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 12,
    gap: 10,
  },
  googleButton: {
    backgroundColor: '#2f2482',
  },
  emailButton: {
    backgroundColor: '#333355',
  },
  submitButton: {
    backgroundColor: '#2f2482',
  },
  googleG: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  authButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  backText: {
    color: '#7B6FE8',
    fontSize: 15,
  },
  input: {
    backgroundColor: '#2A2A3E',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#FFFFFF',
    fontSize: 15,
    marginBottom: 12,
  },
  // Authenticated state
  userEmail: {
    color: '#CCCCCC',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 4,
  },
  userName: {
    color: '#888888',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  signOutButton: {
    backgroundColor: '#333355',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  signOutText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: '600',
  },
});
