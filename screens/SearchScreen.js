import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  ImageBackground,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useCourses } from "../hooks/useCourse";
import { useTheme } from "../theme/ThemeContext";

export default function SearchScreen({ navigation }) {
  const { width, height } = useWindowDimensions();
  const { theme, mode } = useTheme();
  const [query, setQuery] = useState("");
  const { data } = useCourses({ retry: false });

  const courses = Array.isArray(data?.data?.data)
    ? data.data.data
    : Array.isArray(data?.data)
    ? data.data
    : [];

  const normalizedCourses = courses.map((course, index) => ({
    id: String(course?._id ?? course?.id ?? `course-${index}`),
    name: course?.name ?? course?.course_name ?? "Unnamed course",
    location: course?.location || "Location unavailable",
    rating: Number(course?.course_rating ?? 0),
    imageUrl: course?.image_url || null,
    raw: course,
  }));

  const filteredCourses = normalizedCourses.filter((course) => {
    const courseName = `${course?.name ?? ""}`;
    return courseName.toLowerCase().includes(query.toLowerCase());
  });

  const handleCoursePress = (course) => {
    navigation.navigate("ReservationScreen", {
      course: {
        ...(course.raw || {}),
        id: course.id,
        _id: course.id,
        name: course.name,
        location: course.location,
        course_rating: course.rating,
        image_url: course.imageUrl,
      },
      courseId: course.id,
    });
  };

  return (
    <SafeAreaView style={[styles.container, { paddingHorizontal: width * 0.06, backgroundColor: theme.bg }]}>
      <StatusBar style={mode === "dark" ? "light" : "dark"} />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Image
            source={require("../assets/icons/Back.png")}
            style={[styles.backIcon, { tintColor: theme.icon }]}
          />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { fontSize: width * 0.08, color: theme.textPrimary }]}>
          SEARCH COURSES
        </Text>
      </View>

      {/* SEARCH INPUT */}
      <View
        style={[
          styles.searchBox,
          { height: height * 0.065, borderRadius: width * 0.04, backgroundColor: theme.cardSoft },
        ]}
      >
        <Ionicons name="search" size={20} color={theme.textSecondary} />
        <TextInput
          placeholder="Search golf courses in Nepal"
          placeholderTextColor={theme.textSecondary}
          value={query}
          onChangeText={setQuery}
          style={[styles.input, { fontSize: width * 0.04, color: theme.textPrimary }]}
        />
      </View>

      {/* RESULTS */}
      <FlatList
        data={filteredCourses}
        keyExtractor={(item, index) =>
          `${item?.id ?? item?._id ?? item?.name ?? "course"}-${index}`
        }
        contentContainerStyle={{ marginTop: 20 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => handleCoursePress(item)}
            style={[
              styles.courseCard,
              { borderRadius: width * 0.05 },
            ]}
          >
            <ImageBackground
              source={
                item.imageUrl
                  ? { uri: item.imageUrl }
                  : require("../assets/images/course1.png")
              }
              style={styles.courseImageBg}
              imageStyle={styles.courseImage}
            >
              <View style={styles.courseOverlay} />

              <View style={styles.ratingChip}>
                <Ionicons name="star" size={15} color="#FFD700" />
                <Text style={styles.ratingChipText}>{Number(item.rating || 0).toFixed(1)}</Text>
              </View>

              <View style={styles.courseContent}>
                <Text style={[styles.courseText, { fontSize: width * 0.053, color: "#fff" }]} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.courseMeta} numberOfLines={1}>
                  {item.location}
                </Text>
              </View>

            </ImageBackground>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E7E2D3",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  backIcon: {
    width: 32,
    height: 32,
  },

  headerTitle: {
    marginLeft: 16,
    fontFamily: "Bebas",
    color: "#000",
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    marginTop: 30,
  },

  input: {
    marginLeft: 10,
    flex: 1,
    fontFamily: "Abel",
    color: "#000",
  },

  courseCard: {
    backgroundColor: "#575757",
    overflow: "hidden",
    marginBottom: 12,
    height: 165,
  },

  courseImageBg: {
    width: "100%",
    height: "100%",
    justifyContent: "space-between",
  },

  courseImage: {
    borderRadius: 20,
  },

  courseOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.38)",
  },

  ratingChip: {
    alignSelf: "flex-end",
    marginTop: 12,
    marginRight: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(10, 12, 11, 0.72)",
    flexDirection: "row",
    alignItems: "center",
  },

  ratingChipText: {
    marginLeft: 5,
    fontFamily: "Abel",
    color: "#F7F9F4",
    fontSize: 15,
  },

  courseContent: {
    paddingHorizontal: 14,
    paddingBottom: 14,
  },

  courseText: {
    fontFamily: "Bebas",
    color: "#fff",
  },

  courseMeta: {
    fontFamily: "Abel",
    fontSize: 18,
    marginTop: 2,
    color: "#E9EEE5",
  },
});
