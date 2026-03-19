import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useCourses } from "../hooks/useCourse";

export default function SearchScreen({ navigation }) {
  const { width, height } = useWindowDimensions();
  const [query, setQuery] = useState("");
  const { data } = useCourses({ retry: false });

  const courses = Array.isArray(data?.data?.data)
    ? data.data.data
    : Array.isArray(data?.data)
    ? data.data
    : [];

  const filteredCourses = courses.filter((course) => {
    const courseName = `${course?.name ?? course?.course_name ?? ""}`;
    return courseName.toLowerCase().includes(query.toLowerCase());
  });

  return (
    <SafeAreaView style={[styles.container, { paddingHorizontal: width * 0.06 }]}>
      <StatusBar style="dark" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#000" />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { fontSize: width * 0.08 }]}>
          SEARCH COURSES
        </Text>
      </View>

      {/* SEARCH INPUT */}
      <View
        style={[
          styles.searchBox,
          { height: height * 0.065, borderRadius: width * 0.04 },
        ]}
      >
        <Ionicons name="search" size={20} color="#555" />
        <TextInput
          placeholder="Search golf courses in Nepal"
          value={query}
          onChangeText={setQuery}
          style={[styles.input, { fontSize: width * 0.04 }]}
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
          <View
            style={[
              styles.courseCard,
              { borderRadius: width * 0.05 },
            ]}
          >
            <Text style={[styles.courseText, { fontSize: width * 0.045 }]}>
              {item?.name ?? item?.course_name ?? "Unnamed course"}
            </Text>
          </View>
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
    padding: 20,
    marginBottom: 12,
  },

  courseText: {
    fontFamily: "Abel",
    color: "#fff",
  },
});
