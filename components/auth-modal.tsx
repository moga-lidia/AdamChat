import * as AuthSession from "expo-auth-session";
import Constants from "expo-constants";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAuth } from "@/hooks/use-auth";
import {
  registerWithEmail,
  signInWithEmail,
  verifyGoogleToken,
} from "@/services/auth-api";

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID =
  Constants.expoConfig?.extra?.googleClientId ??
  Constants.manifest?.extra?.googleClientId ??
  (
    Constants.manifest2?.extra?.expoClient?.extra as
      | Record<string, string>
      | undefined
  )?.googleClientId ??
  "";

interface Props {
  visible: boolean;
  onClose: () => void;
}

type ModalView = "main" | "email" | "register" | "forgot";

export function AuthModal({ visible, onClose }: Props) {
  const { user, signIn, signOut } = useAuth();
  const [view, setView] = useState<ModalView>("main");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const discovery = AuthSession.useAutoDiscovery("https://accounts.google.com");
  const redirectUri = AuthSession.makeRedirectUri();

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: GOOGLE_CLIENT_ID,
      redirectUri,
      scopes: ["openid", "profile", "email"],
      responseType: AuthSession.ResponseType.IdToken,
    },
    discovery,
  );

  useEffect(() => {
    if (response?.type === "success" && response.params.id_token) {
      const authUser = verifyGoogleToken(response.params.id_token);
      if (authUser) {
        signIn(authUser);
        onClose();
      } else {
        setError("Nu am putut verifica contul Google.");
      }
    }
  }, [response]);

  useEffect(() => {
    // TODO: re-enable fetchAdvantages() once the API endpoint is live
    if (!visible) {
      setView("main");
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setShowPassword(false);
      setError(null);
    }
  }, [visible]);

  const handleGoogleSignIn = () => {
    setError(null);
    promptAsync();
  };

  const handleEmailSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Completeaza email-ul si parola.");
      return;
    }
    setLoading(true);
    setError(null);
    const result = await signInWithEmail(email.trim(), password.trim());
    setLoading(false);
    if ("error" in result) {
      setError(result.error);
    } else {
      signIn(result.user);
      onClose();
    }
  };

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  // Authenticated view
  if (user) {
    const initial =
      user.name?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase();
    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <Pressable style={styles.backdrop} onPress={onClose}>
          <View style={styles.dialog} onStartShouldSetResponder={() => true}>
            <View style={styles.dialogHeader}>
              <View />
              <Pressable
                onPress={onClose}
                style={({ pressed }) => [
                  styles.closeButton,
                  { opacity: pressed ? 0.6 : 1 },
                ]}
              >
                <IconSymbol name="xmark" size={18} color="#666" />
              </Pressable>
            </View>

            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
            <Text style={styles.userName}>{user.name ?? "Utilizator"}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>

            <Pressable
              onPress={handleSignOut}
              style={({ pressed }) => [
                styles.signOutButton,
                { opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Text style={styles.signOutText}>Deconecteaza-te</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.dialog} onStartShouldSetResponder={() => true}>
          <View style={styles.dialogHeader}>
            {view !== "main" ? (
              <Pressable
                onPress={() => {
                  setError(null);
                  setView(view === "email" ? "main" : "email");
                }}
                style={({ pressed }) => [
                  styles.backButton,
                  { opacity: pressed ? 0.6 : 1 },
                ]}
              >
                <IconSymbol name="chevron.left" size={16} color="#2f2482" />
                <Text style={styles.backText}>Inapoi</Text>
              </Pressable>
            ) : (
              <View />
            )}
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                styles.closeButton,
                { opacity: pressed ? 0.6 : 1 },
              ]}
            >
              <IconSymbol name="xmark" size={18} color="#666" />
            </Pressable>
          </View>

          {view === "main" && (
            <>
              <Image
                source={require("@/assets/images/logo-speranta.jpg")}
                style={styles.logo}
              />
              <Text style={styles.title}>Bine ai venit!</Text>
              <Text style={styles.subtitle}>
                Conecteaza-te pentru a descoperi mai multe
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
                <Text style={styles.googleButtonText}>Continua cu Google</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setError(null);
                  setView("email");
                }}
                style={({ pressed }) => [
                  styles.authButton,
                  styles.emailButton,
                  { opacity: pressed ? 0.8 : 1 },
                ]}
              >
                <IconSymbol name="envelope.fill" size={18} color="#2f2482" />
                <Text style={styles.emailButtonText}>Continua cu Email</Text>
              </Pressable>

              <Text style={styles.terms}>
                Prin conectare, esti de acord cu{" "}
                <Text
                  style={styles.link}
                  onPress={() => Linking.openURL("https://hope.study/privacy")}
                >
                  Politica de confidentialitate
                </Text>{" "}
                si{" "}
                <Text
                  style={styles.link}
                  onPress={() => Linking.openURL("https://hope.study/terms")}
                >
                  Termenii de utilizare
                </Text>
              </Text>
            </>
          )}

          {view === "email" && (
            <>
              {error && <Text style={styles.error}>{error}</Text>}

              <View style={styles.inputRow}>
                <TextInput
                  style={styles.inputField}
                  placeholder="E-mail *"
                  placeholderTextColor="#999"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={setEmail}
                />
                <View style={styles.inputIconDivider} />
                <View style={styles.inputIconWrap}>
                  <IconSymbol name="envelope.fill" size={18} color="#999" />
                </View>
              </View>

              <View style={styles.inputRow}>
                <TextInput
                  style={styles.inputField}
                  placeholder="Parola *"
                  placeholderTextColor="#999"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <View style={styles.inputIconDivider} />
                <Pressable
                  onPress={() => setShowPassword((v) => !v)}
                  style={styles.inputIconWrap}
                >
                  <IconSymbol
                    name={showPassword ? "eye.fill" : "eye.slash.fill"}
                    size={18}
                    color="#999"
                  />
                </Pressable>
              </View>

              <Pressable
                onPress={handleEmailSignIn}
                disabled={loading}
                style={({ pressed }) => [
                  styles.submitButton,
                  { opacity: pressed || loading ? 0.7 : 1 },
                ]}
              >
                {loading ? (
                  <ActivityIndicator color="#2f2482" size="small" />
                ) : (
                  <Text style={styles.submitButtonText}>Autentificare</Text>
                )}
              </Pressable>

              <View style={styles.linksRow}>
                <Pressable
                  onPress={() => {
                    setError(null);
                    setView("register");
                  }}
                  style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
                >
                  <Text style={styles.linkText}>Creeaza un cont</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setError(null);
                    setView("forgot");
                  }}
                  style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
                >
                  <Text style={styles.linkText}>Ai uitat parola</Text>
                </Pressable>
              </View>
            </>
          )}

          {view === "register" && (
            <>
              {error && <Text style={styles.error}>{error}</Text>}

              <View style={styles.inputRow}>
                <TextInput
                  style={styles.inputField}
                  placeholder="Prenume *"
                  placeholderTextColor="#999"
                  autoCapitalize="words"
                  value={firstName}
                  onChangeText={setFirstName}
                />
              </View>

              <View style={styles.inputRow}>
                <TextInput
                  style={styles.inputField}
                  placeholder="Nume *"
                  placeholderTextColor="#999"
                  autoCapitalize="words"
                  value={lastName}
                  onChangeText={setLastName}
                />
              </View>

              <View style={styles.inputRow}>
                <TextInput
                  style={styles.inputField}
                  placeholder="E-mail *"
                  placeholderTextColor="#999"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <View style={styles.inputRow}>
                <TextInput
                  style={styles.inputField}
                  placeholder="Parola *"
                  placeholderTextColor="#999"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <View style={styles.inputIconDivider} />
                <Pressable
                  onPress={() => setShowPassword((v) => !v)}
                  style={styles.inputIconWrap}
                >
                  <IconSymbol
                    name={showPassword ? "eye.fill" : "eye.slash.fill"}
                    size={18}
                    color="#999"
                  />
                </Pressable>
              </View>

              <Text style={styles.termsSmall}>
                Prin semnare, esti de acord cu{" "}
                <Text
                  style={styles.link}
                  onPress={() => Linking.openURL("https://hope.study/privacy")}
                >
                  Politica de confidentialitate
                </Text>{" "}
                si{" "}
                <Text
                  style={styles.link}
                  onPress={() => Linking.openURL("https://hope.study/terms")}
                >
                  Termeni de utilizare
                </Text>
              </Text>

              <Pressable
                onPress={async () => {
                  if (
                    !firstName.trim() ||
                    !lastName.trim() ||
                    !email.trim() ||
                    !password.trim()
                  ) {
                    setError("Completeaza toate campurile.");
                    return;
                  }
                  setLoading(true);
                  setError(null);
                  const result = await registerWithEmail({
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    email: email.trim(),
                    password: password.trim(),
                  });
                  setLoading(false);
                  if ("error" in result) {
                    setError(result.error);
                  } else {
                    signIn(result.user);
                    onClose();
                  }
                }}
                disabled={loading}
                style={({ pressed }) => [
                  styles.submitButton,
                  { opacity: pressed || loading ? 0.7 : 1 },
                ]}
              >
                {loading ? (
                  <ActivityIndicator color="#2f2482" size="small" />
                ) : (
                  <Text style={styles.submitButtonText}>Creeaza un cont</Text>
                )}
              </Pressable>

              <View style={styles.bottomLinkRow}>
                <Text style={styles.bottomLinkLabel}>Ai un cont? </Text>
                <Pressable
                  onPress={() => {
                    setError(null);
                    setView("email");
                  }}
                  style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
                >
                  <Text style={styles.linkText}>Autentificare</Text>
                </Pressable>
              </View>
            </>
          )}

          {view === "forgot" && (
            <>
              {error && <Text style={styles.error}>{error}</Text>}

              <View style={styles.inputRow}>
                <TextInput
                  style={styles.inputField}
                  placeholder="E-mail *"
                  placeholderTextColor="#999"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={setEmail}
                />
                <View style={styles.inputIconDivider} />
                <View style={styles.inputIconWrap}>
                  <IconSymbol name="envelope.fill" size={18} color="#999" />
                </View>
              </View>

              <Pressable
                onPress={() => {
                  // TODO: integrate with backend password reset endpoint
                  setError("Resetarea parolei nu este disponibila momentan.");
                }}
                disabled={loading}
                style={({ pressed }) => [
                  styles.submitButton,
                  { opacity: pressed || loading ? 0.7 : 1 },
                ]}
              >
                {loading ? (
                  <ActivityIndicator color="#2f2482" size="small" />
                ) : (
                  <Text style={styles.submitButtonText}>Trimite cererea</Text>
                )}
              </Pressable>

              <View style={styles.bottomLinkRow}>
                <Pressable
                  onPress={() => {
                    setError(null);
                    setView("email");
                  }}
                  style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
                >
                  <Text style={styles.linkText}>Autentificare</Text>
                </Pressable>
              </View>
            </>
          )}
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  dialog: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    boxShadow: "0px 8px 24px rgba(0,0,0,0.15)",
    elevation: 12,
    alignItems: "center",
  },
  dialogHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    alignSelf: "stretch",
    marginBottom: 4,
  },
  closeButton: {
    padding: 4,
  },
  logo: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginBottom: 16,
  },
  title: {
    color: "#1A1A1A",
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    color: "#777",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
  },
  error: {
    color: "#D32F2F",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 12,
    backgroundColor: "#FDECEA",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    overflow: "hidden",
    alignSelf: "stretch",
  },
  authButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 10,
    gap: 10,
    alignSelf: "stretch",
  },
  googleButton: {
    backgroundColor: "#2f2482",
  },
  googleG: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  googleButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  emailButton: {
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  emailButtonText: {
    color: "#2f2482",
    fontSize: 15,
    fontWeight: "600",
  },
  terms: {
    color: "#999",
    fontSize: 11,
    textAlign: "center",
    lineHeight: 17,
    marginTop: 12,
    paddingHorizontal: 8,
  },
  link: {
    color: "#2f2482",
    textDecorationLine: "underline",
  },
  // Email view
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  backText: {
    color: "#2f2482",
    fontSize: 14,
    fontWeight: "600",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "stretch",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginBottom: 14,
    overflow: "hidden",
  },
  inputField: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    color: "#1A1A1A",
    fontSize: 15,
  },
  inputIconDivider: {
    width: 1,
    height: 28,
    backgroundColor: "#E0E0E0",
  },
  inputIconWrap: {
    paddingHorizontal: 14,
  },
  submitButton: {
    alignSelf: "stretch",
    borderWidth: 2,
    borderColor: "#2f2482",
    borderRadius: 28,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    marginBottom: 16,
  },
  submitButtonText: {
    color: "#2f2482",
    fontSize: 16,
    fontWeight: "600",
  },
  linksRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignSelf: "stretch",
    paddingHorizontal: 4,
  },
  linkText: {
    color: "#2f2482",
    fontSize: 13,
    fontWeight: "500",
  },
  termsSmall: {
    color: "#777",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 16,
    alignSelf: "stretch",
  },
  bottomLinkRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  bottomLinkLabel: {
    color: "#777",
    fontSize: 13,
  },
  // Authenticated state
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#2f2482",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
  },
  userName: {
    color: "#1A1A1A",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  userEmail: {
    color: "#777",
    fontSize: 14,
    marginBottom: 24,
  },
  signOutButton: {
    backgroundColor: "#FFF0F0",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    alignSelf: "stretch",
  },
  signOutText: {
    color: "#D32F2F",
    fontSize: 15,
    fontWeight: "600",
  },
});
