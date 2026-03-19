// components/Navbar.js
import React from "react";
import { View, TouchableOpacity, StyleSheet, Image } from "react-native";

export default function Navbar({ currentTab, onTabPress, onPressMiddle }) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.navbar}>
        {/* HOME */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => onTabPress("home")}
        >
          <Image
            source={require("../assets/icons/Home.png")}
            style={styles.icon}
            resizeMode="contain"
          />
          {currentTab === "home" && <View style={styles.dot} />}
        </TouchableOpacity>

        {/* TROPHY */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => onTabPress("match")}
        >
          <Image
            source={require("../assets/icons/Score.png")}
            style={styles.icon}
            resizeMode="contain"
          />
          {currentTab === "match" && <View style={styles.dot} />}
        </TouchableOpacity>

        {/* CENTER BUTTON */}
        <TouchableOpacity style={styles.navCenter} onPress={onPressMiddle}>
          <Image
            source={require("../assets/icons/Golf.png")}
            style={styles.centerIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* LEAF */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => onTabPress("coach")}
        >
          <Image
            source={require("../assets/icons/Coach.png")}
            style={styles.icon}
            resizeMode="contain"
          />
          {currentTab === "coach" && <View style={styles.dot} />}
        </TouchableOpacity>

        {/* SETTINGS */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => onTabPress("caddie")}
        >
          <Image
            source={require("../assets/icons/Caddy.png")}
            style={styles.icon}
            resizeMode="contain"
          />
          {currentTab === "caddie" && <View style={styles.dot} />}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: "center",
  },

  navbar: {
    width: "90%",
    height: 70,
    backgroundColor: "#262B27",
    borderRadius: 30,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 10,
  },

  navItem: {
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },

  icon: {
    width: 26,
    height: 26,
    tintColor: "#798D3D", // SAME AS YOUR ICON COLOR
  },

  navCenter: {
    width: 65,
    height: 65,
    backgroundColor: "#798D3D",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 40,
    marginBottom: 30,
    elevation: 10,
  },

  centerIcon: {
    width: 46,
    height: 46,
    tintColor: "#262B27",
  },

  dot: {
    width: 6,
    height: 6,
    backgroundColor: "#798D3D",
    borderRadius: 3,
    marginTop: 3,
  },
});
