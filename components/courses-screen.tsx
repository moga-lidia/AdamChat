import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useI18n } from "@/hooks/use-i18n";
import { useThemeColor } from "@/hooks/use-theme-color";

const BASE_URL = "https://academiasperanta.ro/ro";

interface Course {
  id: string;
  title: string;
  category: string;
  lessons: number;
  duration: number;
  imageUrl: string;
  courseUrl: string;
}

const COURSES: Course[] = [
  {
    id: "1",
    title: "Isus ne-a învățat",
    category: "Biblie",
    lessons: 9,
    duration: 270,
    imageUrl: "https://assets.hope.study/images/HsSqEhR1N.png",
    courseUrl: `${BASE_URL}/courses/Isus-ne-a-invatat/`,
  },
  {
    id: "2",
    title: "Biblia – mit, manipulare sau mesaj divin?",
    category: "Biblie",
    lessons: 4,
    duration: 34,
    imageUrl: "https://assets.hope.study/images/M8fU7dnOj.jpg",
    courseUrl: `${BASE_URL}/courses/Biblia-mit-manipulare-sau-mesaj-divin/`,
  },
  {
    id: "3",
    title: "Conflictul Cosmic. Te include și pe TINE",
    category: "Credință",
    lessons: 8,
    duration: 240,
    imageUrl: "https://assets.hope.study/images/pkV-MruaF.png",
    courseUrl: `${BASE_URL}/courses/conflictul/`,
  },
  {
    id: "4",
    title: "Credință și dovezi: confirmări arheologice ale Bibliei",
    category: "Arheologie",
    lessons: 8,
    duration: 240,
    imageUrl: "https://assets.hope.study/images/eMigtomPR.png",
    courseUrl: `${BASE_URL}/courses/credinta-si-dovezi/`,
  },
  {
    id: "5",
    title: "Cu Dumnezeu în suferință",
    category: "Credință",
    lessons: 8,
    duration: 235,
    imageUrl: "https://assets.hope.study/images/Xz3qrQcrH.png",
    courseUrl: `${BASE_URL}/courses/Cu-Dumnezeu-in-suferinta/`,
  },
  {
    id: "6",
    title: "Când viața doare: 7 adevăruri biblice despre suferință",
    category: "Credință",
    lessons: 7,
    duration: 37,
    imageUrl: "https://assets.hope.study/images/CODBb1ei6.jpg",
    courseUrl: `${BASE_URL}/courses/cand-viata-doare-7-adevaruri-biblice-despre-suferinta/`,
  },
  {
    id: "7",
    title: "Isus printre noi: revoluția relațiilor umane",
    category: "Biblie",
    lessons: 8,
    duration: 360,
    imageUrl: "https://assets.hope.study/images/jF1hsLrvP.png",
    courseUrl: `${BASE_URL}/courses/Isus-printre-noi-revolutia-relatiilor-umane/`,
  },
  {
    id: "8",
    title: "Masterclass de comunicare. Autenticitate, empatie, succes.",
    category: "Dezvoltare Personală",
    lessons: 8,
    duration: 240,
    imageUrl: "https://assets.hope.study/images/T8_K0WAIK.png",
    courseUrl: `${BASE_URL}/courses/masterclass-de-comunicare-autenticitate-empatie-succes/`,
  },
  {
    id: "9",
    title: "Masterclass microbiom",
    category: "Sănătate",
    lessons: 7,
    duration: 315,
    imageUrl: "https://assets.hope.study/images/fQuZ_cTKP.jpg",
    courseUrl: `${BASE_URL}/courses/masterclass-microbiom/`,
  },
  {
    id: "10",
    title: "Prima ta întâlnire cu Biblia - ce trebuie să știi",
    category: "Biblie",
    lessons: 5,
    duration: 38,
    imageUrl: "https://assets.hope.study/images/hWc7mkyuz.png",
    courseUrl: `${BASE_URL}/courses/prima-ta-intalnire-cu-Biblia-ce-trebuie-sa-stii/`,
  },
  {
    id: "11",
    title: "Un vis străvechi arată viitorul",
    category: "Profeție",
    lessons: 3,
    duration: 15,
    imageUrl: "https://assets.hope.study/images/QxdQNr53k.png",
    courseUrl: `${BASE_URL}/courses/un-vis-stravechi/`,
  },
  {
    id: "12",
    title: "Unicitatea uitată a creștinismului",
    category: "Credință",
    lessons: 8,
    duration: 240,
    imageUrl: "https://assets.hope.study/images/addEWkAX.jpg",
    courseUrl: `${BASE_URL}/courses/unicitatea-uitata-a-crestinismului/`,
  },
];

// Maps Romanian category names to the translation index
const CATEGORY_INDEX: Record<string, number> = {
  Biblie: 1,
  Arheologie: 2,
  Credință: 3,
  "Dezvoltare Personală": 4,
  Sănătate: 5,
  Profeție: 6,
};

const CATEGORY_COLORS: Record<string, string> = {
  Biblie: "#2f2482",
  Arheologie: "#8B6914",
  Credință: "#1B7A4A",
  "Dezvoltare Personală": "#C2185B",
  Sănătate: "#00838F",
  Profeție: "#6A1B9A",
};

export function CoursesScreen() {
  const { t } = useI18n();
  const [activeCategory, setActiveCategory] = useState(0);
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    setIsOnline(null);
    let cancelled = false;
    fetch("https://academiasperanta.ro", { method: "HEAD" })
      .then(() => {
        if (!cancelled) setIsOnline(true);
      })
      .catch(() => {
        if (!cancelled) setIsOnline(false);
      });
    return () => {
      cancelled = true;
    };
  }, [retryKey]);

  const handleRetry = useCallback(() => {
    setRetryKey((k) => k + 1);
  }, []);

  const cardBg = useThemeColor(
    { light: "#FFFFFF", dark: "#2A2A2A" },
    "background",
  );
  const textColor = useThemeColor({}, "text");
  const subtitleColor = useThemeColor(
    { light: "#7B7799", dark: "#9B99B0" },
    "icon",
  );
  const chipBg = useThemeColor(
    { light: "rgba(47,36,130,0.08)", dark: "rgba(181,183,221,0.12)" },
    "background",
  );
  const chipActiveBg = useThemeColor(
    { light: "#2f2482", dark: "#B5B7DD" },
    "tint",
  );
  const chipActiveText = useThemeColor(
    { light: "#FFFFFF", dark: "#1A1A2E" },
    "text",
  );
  const screenBg = useThemeColor(
    { light: "#f7f7f5", dark: "#111" },
    "background",
  );

  const categories = t.courses.categories;

  const filteredCourses =
    activeCategory === 0
      ? COURSES
      : COURSES.filter((c) => CATEGORY_INDEX[c.category] === activeCategory);

  const getCategoryLabel = (roCategory: string) => {
    const idx = CATEGORY_INDEX[roCategory];
    return idx !== undefined ? categories[idx] : roCategory;
  };

  const renderCourse = ({ item }: { item: Course }) => (
    <Pressable
      onPress={() => Linking.openURL(item.courseUrl)}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: cardBg, opacity: pressed ? 0.9 : 1 },
      ]}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.courseImage}
          resizeMode="cover"
        />
        <View
          style={[
            styles.categoryBadge,
            { backgroundColor: CATEGORY_COLORS[item.category] ?? "#2f2482" },
          ]}
        >
          <Text style={styles.categoryBadgeText}>
            {getCategoryLabel(item.category)}
          </Text>
        </View>
        <View style={styles.titleOverlay}>
          <Text style={styles.courseTitle} numberOfLines={2}>
            {item.title}
          </Text>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <Text style={[styles.footerText, { color: subtitleColor }]}>
          {item.lessons} {t.courses.lessons} · {item.duration}{" "}
          {t.courses.minutes}
        </Text>
        <View style={styles.freeBadge}>
          <Text style={styles.freeBadgeText}>{t.courses.free}</Text>
        </View>
      </View>
    </Pressable>
  );

  if (isOnline === null) {
    return (
      <View
        style={[
          styles.container,
          styles.loadingContainer,
          { backgroundColor: screenBg },
        ]}
      >
        <ActivityIndicator size="large" color="#2f2482" />
      </View>
    );
  }

  if (!isOnline) {
    return (
      <View
        style={[
          styles.container,
          styles.loadingContainer,
          { backgroundColor: screenBg },
        ]}
      >
        <Text style={[styles.offlineText, { color: subtitleColor }]}>
          {t.courses.noConnection}
        </Text>
        <Pressable
          onPress={handleRetry}
          style={({ pressed }) => [
            styles.retryButton,
            { opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Text style={styles.retryButtonText}>{t.courses.retry}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: screenBg }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
        style={styles.chipScroll}
      >
        {categories.map((cat, idx) => {
          const isActive = idx === activeCategory;
          return (
            <Pressable
              key={cat}
              onPress={() => setActiveCategory(idx)}
              style={[
                styles.chip,
                {
                  backgroundColor: isActive ? chipActiveBg : chipBg,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  {
                    color: isActive ? chipActiveText : textColor,
                  },
                ]}
              >
                {cat}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <FlatList
        data={filteredCourses}
        keyExtractor={(item) => item.id}
        renderItem={renderCourse}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  offlineText: {
    fontSize: 15,
    fontFamily: "Poppins_500Medium",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
    paddingHorizontal: 32,
  },
  retryButton: {
    backgroundColor: "#2f2482",
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 22,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
  },
  chipScroll: {
    flexGrow: 0,
  },
  chipRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  chipText: {
    fontSize: 13,
    fontFamily: "Poppins_500Medium",
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 16,
  },
  card: {
    borderRadius: 16,
    overflow: "hidden",
    boxShadow: "0px 2px 8px rgba(0,0,0,0.1)",
    elevation: 4,
  },
  imageContainer: {
    height: 180,
    position: "relative",
  },
  courseImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  categoryBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontFamily: "Poppins_600SemiBold",
  },
  titleOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  courseTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
    lineHeight: 22,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  footerText: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
  },
  freeBadge: {
    backgroundColor: "#1B7A4A",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  freeBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontFamily: "Poppins_700Bold",
  },
});
