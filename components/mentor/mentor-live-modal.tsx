import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { useI18n } from "@/hooks/use-i18n";

const MENTOR_DATA_KEY = "adam_mentor_data";

const ROMANIAN_COUNTIES: { name: string; code: string }[] = [
  { name: "Alba", code: "AB" },
  { name: "Arad", code: "AR" },
  { name: "Argeș", code: "AG" },
  { name: "Bacău", code: "BC" },
  { name: "Bihor", code: "BH" },
  { name: "Bistrița-Năsăud", code: "BN" },
  { name: "Botoșani", code: "BT" },
  { name: "Brăila", code: "BR" },
  { name: "Brașov", code: "BV" },
  { name: "București", code: "B" },
  { name: "Buzău", code: "BZ" },
  { name: "Călărași", code: "CL" },
  { name: "Caraș-Severin", code: "CS" },
  { name: "Cluj", code: "CJ" },
  { name: "Constanța", code: "CT" },
  { name: "Covasna", code: "CV" },
  { name: "Dâmbovița", code: "DB" },
  { name: "Dolj", code: "DJ" },
  { name: "Galați", code: "GL" },
  { name: "Giurgiu", code: "GR" },
  { name: "Gorj", code: "GJ" },
  { name: "Harghita", code: "HR" },
  { name: "Hunedoara", code: "HD" },
  { name: "Ialomița", code: "IL" },
  { name: "Iași", code: "IS" },
  { name: "Ilfov", code: "IF" },
  { name: "Maramureș", code: "MM" },
  { name: "Mehedinți", code: "MH" },
  { name: "Mureș", code: "MS" },
  { name: "Neamț", code: "NT" },
  { name: "Olt", code: "OT" },
  { name: "Prahova", code: "PH" },
  { name: "Sălaj", code: "SJ" },
  { name: "Satu Mare", code: "SM" },
  { name: "Sibiu", code: "SB" },
  { name: "Suceava", code: "SV" },
  { name: "Teleorman", code: "TR" },
  { name: "Timiș", code: "TM" },
  { name: "Tulcea", code: "TL" },
  { name: "Vaslui", code: "VS" },
  { name: "Vâlcea", code: "VL" },
  { name: "Vrancea", code: "VN" },
];

export interface MentorData {
  name: string;
  contact: string;
  countyCode: string;
  countyName: string;
}

export async function loadMentorData(): Promise<MentorData | null> {
  try {
    const raw = await AsyncStorage.getItem(MENTOR_DATA_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as MentorData;
  } catch {
    return null;
  }
}

export async function saveMentorData(data: MentorData): Promise<void> {
  try {
    await AsyncStorage.setItem(MENTOR_DATA_KEY, JSON.stringify(data));
  } catch {
    // silently fail
  }
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onConnect: (data: MentorData) => void;
}

export function MentorLiveModal({ visible, onClose, onConnect }: Props) {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [selectedCounty, setSelectedCounty] = useState<{
    name: string;
    code: string;
  } | null>(null);
  const [showCountyPicker, setShowCountyPicker] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const chevronAnim = useRef(new Animated.Value(0)).current;

  const animateIn = useCallback(() => {
    scaleAnim.setValue(0.92);
    opacityAnim.setValue(0);
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        damping: 18,
        stiffness: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, opacityAnim]);

  useEffect(() => {
    if (visible) {
      animateIn();
    } else {
      setName("");
      setContact("");
      setSelectedCounty(null);
      setShowCountyPicker(false);
      setError(null);
      setFocusedField(null);
      chevronAnim.setValue(0);
    }
  }, [visible, animateIn, chevronAnim]);

  useEffect(() => {
    Animated.timing(chevronAnim, {
      toValue: showCountyPicker ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [showCountyPicker, chevronAnim]);

  const handleSubmit = async () => {
    if (!name.trim() || !contact.trim() || !selectedCounty) {
      setError(t.mentor.fillAllFields);
      return;
    }
    const data: MentorData = {
      name: name.trim(),
      contact: contact.trim(),
      countyCode: selectedCounty.code,
      countyName: selectedCounty.name,
    };
    await saveMentorData(data);
    onConnect(data);
  };

  const chevronRotation = chevronAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Pressable
          style={styles.backdrop}
          onPress={() => {
            Keyboard.dismiss();
            onClose();
          }}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View onStartShouldSetResponder={() => true}>
              <Animated.View
                style={[
                  styles.dialog,
                  {
                    opacity: opacityAnim,
                    transform: [{ scale: scaleAnim }],
                  },
                ]}
              >
                {/* Purple accent bar */}
                <View style={styles.accentBar} />

                <View style={styles.dialogContent}>
                  {/* Header */}
                  <View style={styles.dialogHeader}>
                    <View style={styles.titleIcon}>
                      <IconSymbol
                        name="bubble.left.fill"
                        size={22}
                        color="#FFFFFF"
                      />
                    </View>
                    <Text style={styles.title}>{t.mentor.dialogTitle}</Text>
                    <Text style={styles.dialogDescription}>
                      {t.mentor.dialogDescription}
                    </Text>
                  </View>

                  {/* Error */}
                  {error && (
                    <View style={styles.errorBox}>
                      <IconSymbol
                        name="exclamationmark.triangle.fill"
                        size={14}
                        color="#e74c3c"
                      />
                      <Text style={styles.errorText}>{error}</Text>
                    </View>
                  )}

                  {/* Name */}
                  <Text style={styles.fieldLabel}>{t.mentor.name}</Text>
                  <View
                    style={[
                      styles.inputRow,
                      focusedField === "name" && styles.inputRowFocused,
                    ]}
                  >
                    <View style={styles.inputIconLeft}>
                      <IconSymbol
                        name="person.fill"
                        size={16}
                        color="#b0aed0"
                      />
                    </View>
                    <TextInput
                      style={styles.inputField}
                      placeholder={t.mentor.namePlaceholder}
                      placeholderTextColor="#c0c0c0"
                      autoCapitalize="words"
                      value={name}
                      onChangeText={(v) => {
                        setName(v);
                        setError(null);
                      }}
                      onFocus={() => setFocusedField("name")}
                      onBlur={() => setFocusedField(null)}
                    />
                  </View>

                  {/* Contact */}
                  <Text style={styles.fieldLabel}>{t.mentor.contact}</Text>
                  <View
                    style={[
                      styles.inputRow,
                      focusedField === "contact" && styles.inputRowFocused,
                    ]}
                  >
                    <View style={styles.inputIconLeft}>
                      <IconSymbol
                        name="envelope.fill"
                        size={16}
                        color="#b0aed0"
                      />
                    </View>
                    <TextInput
                      style={styles.inputField}
                      placeholder={t.mentor.contactPlaceholder}
                      placeholderTextColor="#c0c0c0"
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType="email-address"
                      value={contact}
                      onChangeText={(v) => {
                        setContact(v);
                        setError(null);
                      }}
                      onFocus={() => setFocusedField("contact")}
                      onBlur={() => setFocusedField(null)}
                    />
                  </View>

                  {/* County */}
                  <Text style={styles.fieldLabel}>{t.mentor.county}</Text>
                  <Pressable
                    style={[
                      styles.inputRow,
                      showCountyPicker && styles.inputRowFocused,
                    ]}
                    onPress={() => setShowCountyPicker((v) => !v)}
                  >
                    <View style={styles.inputIconLeft}>
                      <IconSymbol
                        name="mappin.circle.fill"
                        size={16}
                        color="#b0aed0"
                      />
                    </View>
                    <Text
                      style={[
                        styles.inputField,
                        styles.pickerText,
                        !selectedCounty && styles.placeholderText,
                      ]}
                    >
                      {selectedCounty?.name || t.mentor.countyPlaceholder}
                    </Text>
                    <Animated.View
                      style={[
                        styles.chevronWrap,
                        { transform: [{ rotate: chevronRotation }] },
                      ]}
                    >
                      <IconSymbol name="chevron.down" size={12} color="#999" />
                    </Animated.View>
                  </Pressable>

                  {/* County dropdown */}
                  {showCountyPicker && (
                    <View style={styles.countyDropdown}>
                      <ScrollView
                        style={styles.countyScroll}
                        nestedScrollEnabled
                        showsVerticalScrollIndicator={false}
                      >
                        {ROMANIAN_COUNTIES.map((c, i) => (
                          <Pressable
                            key={c.code}
                            onPress={() => {
                              setSelectedCounty(c);
                              setShowCountyPicker(false);
                              setError(null);
                            }}
                            style={({ pressed }) => [
                              styles.countyItem,
                              i === ROMANIAN_COUNTIES.length - 1 &&
                                styles.countyItemLast,
                              selectedCounty?.code === c.code &&
                                styles.countyItemSelected,
                              pressed && styles.countyItemPressed,
                            ]}
                          >
                            <Text
                              style={[
                                styles.countyText,
                                selectedCounty?.code === c.code &&
                                  styles.countyTextSelected,
                              ]}
                            >
                              {c.name}
                            </Text>
                            {selectedCounty?.code === c.code && (
                              <IconSymbol
                                name="checkmark"
                                size={13}
                                color="#2f2482"
                              />
                            )}
                          </Pressable>
                        ))}
                      </ScrollView>
                    </View>
                  )}

                  {/* Buttons */}
                  <View style={styles.buttonsColumn}>
                    <Pressable
                      onPress={handleSubmit}
                      style={({ pressed }) => [
                        styles.submitButton,
                        pressed && styles.submitButtonPressed,
                      ]}
                    >
                      <Text style={styles.submitText}>{t.mentor.submit}</Text>
                      <IconSymbol
                        name="paperplane.fill"
                        size={16}
                        color="#FFFFFF"
                        style={styles.submitIcon}
                      />
                    </Pressable>

                    <Pressable
                      onPress={onClose}
                      style={({ pressed }) => [
                        styles.cancelButton,
                        { opacity: pressed ? 0.6 : 1 },
                      ]}
                    >
                      <Text style={styles.cancelText}>{t.mentor.cancel}</Text>
                    </Pressable>
                  </View>
                </View>
              </Animated.View>
            </View>
          </TouchableWithoutFeedback>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15,10,40,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  dialog: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#2f2482",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.15,
        shadowRadius: 32,
      },
      android: { elevation: 16 },
      default: { boxShadow: "0px 12px 48px rgba(47,36,130,0.2)" },
    }),
  },
  accentBar: {
    height: 5,
    backgroundColor: "#2f2482",
  },
  dialogContent: {
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 24,
  },
  dialogHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  titleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#2f2482",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  title: {
    color: "#1A1A2E",
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    textAlign: "center",
  },
  dialogDescription: {
    color: "#6B7280",
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    lineHeight: 19,
    textAlign: "center",
    marginTop: 6,
    paddingHorizontal: 8,
  },
  /* Error */
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 18,
  },
  errorText: {
    color: "#dc2626",
    fontSize: 13,
    fontFamily: "Poppins_500Medium",
    flex: 1,
  },

  /* Fields */
  fieldLabel: {
    color: "#1A1A2E",
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
    marginBottom: 7,
    letterSpacing: 0.2,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9fc",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#ededf0",
    marginBottom: 16,
  },
  inputRowFocused: {
    borderColor: "#b0aed0",
    backgroundColor: "#FFFFFF",
  },
  inputIconLeft: {
    paddingLeft: 14,
  },
  inputField: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#1A1A2E",
    fontSize: 15,
    fontFamily: "Poppins_400Regular",
  },
  pickerText: {
    paddingVertical: 10,
  },
  placeholderText: {
    color: "#c0c0c0",
  },
  chevronWrap: {
    paddingRight: 14,
  },

  /* County dropdown */
  countyDropdown: {
    borderWidth: 1.5,
    borderColor: "#ededf0",
    borderRadius: 14,
    marginTop: -8,
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  countyScroll: {
    maxHeight: 200,
  },
  countyItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#f3f3f6",
  },
  countyItemLast: {
    borderBottomWidth: 0,
  },
  countyItemSelected: {
    backgroundColor: "rgba(47,36,130,0.04)",
  },
  countyItemPressed: {
    backgroundColor: "rgba(47,36,130,0.07)",
  },
  countyText: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: "#444",
  },
  countyTextSelected: {
    color: "#2f2482",
    fontFamily: "Poppins_600SemiBold",
  },

  /* Buttons */
  buttonsColumn: {
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },
  submitButton: {
    alignSelf: "stretch",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4a3da6",
    borderRadius: 14,
    paddingVertical: 12,
    gap: 8,
  },
  submitButtonPressed: {
    backgroundColor: "#3d3291",
  },
  submitIcon: {
    marginTop: 1,
    transform: [{ rotate: "45deg" }],
  },
  submitText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "Poppins_700Bold",
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelText: {
    color: "#888",
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
  },
});
