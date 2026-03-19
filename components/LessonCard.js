import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function LessonCard({ 
  title, 
  description, 
  time, 
  level, 
  price, 
  bgColor, 
  width, 
  isFirst, 
  onPress // Added onPress prop
}) {
  return (
    <TouchableOpacity 
      activeOpacity={0.9}
      onPress={onPress} // Trigger navigation when tapped
      style={[
        styles.lessonCard, 
        { 
          width: width * 0.75, 
          marginLeft: isFirst ? 0 : 10,
          backgroundColor: bgColor 
        }
      ]}
    >
      <Text style={styles.lessonTitle}>{title}</Text>
      <Text style={styles.lessonDesc}>{description}</Text>

      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Ionicons name="time-outline" size={16} color="#FFF" />
          <Text style={styles.detailText}>{time}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="stats-chart" size={16} color="#FAFF5D" />
          <Text style={[styles.detailText, { color: "#FAFF5D" }]}>{level}</Text>
        </View>
      </View>

      <View style={styles.bottomRow}>
        <Text style={styles.priceText}>Rs. {price}</Text>
        <View style={styles.bookBtn}>
          <Text style={styles.bookBtnText}>BOOK NOW</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  lessonCard: {
    borderRadius: 30,
    padding: 20,
  },
  lessonTitle: {
    color: "#FFF",
    fontFamily: "Bebas",
    fontSize: 18,
    marginBottom: 5,
    letterSpacing: 0.5,
  },
  lessonDesc: {
    color: "#AAA",
    fontFamily: "Abel",
    fontSize: 14,
    marginBottom: 15,
    lineHeight: 20,
  },
  detailsRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  detailText: {
    color: "#FFF",
    fontFamily: "Abel",
    fontSize: 14,
    marginLeft: 5,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceText: {
    color: "#FFF",
    fontFamily: "Abel",
    fontSize: 16,
  },
  bookBtn: {
    backgroundColor: "#798D3D",
    paddingVertical: 6,
    paddingHorizontal: 22,
    borderRadius: 40,
  },
  bookBtnText: {
    color: "#FFF",
    fontFamily: "Bebas",
    fontSize: 16,
    letterSpacing: 0.5,
  },
});