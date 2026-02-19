import { useEffect, useState } from "react";
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
import {
  type Course,
  FALLBACK_COURSES,
  fetchCourses,
} from "@/services/courses-api";

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
  const [courses, setCourses] = useState<Course[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    fetchCourses()
      .then((data) => {
        if (!cancelled) setCourses(data);
      })
      .catch(() => {
        if (!cancelled) setCourses(FALLBACK_COURSES);
      });
    return () => {
      cancelled = true;
    };
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
    courses === null
      ? []
      : activeCategory === 0
        ? courses
        : courses.filter((c) => CATEGORY_INDEX[c.category] === activeCategory);

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

  if (courses === null) {
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

  return (
    <View style={[styles.container, { backgroundColor: screenBg }]}>
      <Text style={[styles.screenTitle, { color: textColor }]}>
        {t.courses.title}
      </Text>
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
  screenTitle: {
    fontSize: 22,
    fontFamily: "Poppins_700Bold",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  chipScroll: {
    flexGrow: 0,
    flexShrink: 0,
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
