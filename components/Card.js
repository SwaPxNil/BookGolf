import { View, StyleSheet, useWindowDimensions, Text } from "react-native";

export default function CoachCard({ cardWidth, title, subtitle }) {
  const { width, height } = useWindowDimensions();

  const w = cardWidth || width * 0.3;
  const h = w * 1.2; // height proportional to width
  const borderRadius = w * 0.14;
  const marginRight = width * 0.04;

  return (
    <View style={[styles.card, { width: w, height: h, borderRadius, marginRight }]}>
      <Text numberOfLines={2} style={styles.title}>
        {title || "N/A"}
      </Text>
      <Text numberOfLines={2} style={styles.subtitle}>
        {subtitle || ""}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#575757",
    padding: 12,
    justifyContent: "space-between",
  },
  title: {
    color: "#fff",
    fontFamily: "Bebas",
    fontSize: 24,
  },
  subtitle: {
    color: "#d5d5d5",
    fontFamily: "Abel",
    fontSize: 14,
  },
});
