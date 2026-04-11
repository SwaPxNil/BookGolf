import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const THEME_KEY = "app_theme_mode";

const THEMES = {
  light: {
    mode: "light",
    bg: "#E7E2D3",
    card: "#262B27",
    cardSoft: "#FFF8E7",
    primary: "#2E4A37",
    accent: "#798D3D",
    textPrimary: "#1A1A1A",
    textSecondary: "#333",
    icon: "#000",
    line: "rgba(46,74,55,0.18)",
  },
  dark: {
    mode: "dark",
    bg: "#171C19",
    card: "#242A25",
    cardSoft: "#2F3831",
    primary: "#3F5E49",
    accent: "#98B24E",
    textPrimary: "#F2F4EE",
    textSecondary: "#CBD3C2",
    icon: "#F2F4EE",
    line: "rgba(203,211,194,0.2)",
  },
};

const ThemeContext = createContext({
  theme: THEMES.light,
  mode: "light",
  toggleTheme: () => {},
  setThemeMode: () => {},
});

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState("light");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadThemeMode() {
      try {
        const stored = await AsyncStorage.getItem(THEME_KEY);
        if (mounted && (stored === "light" || stored === "dark")) {
          setMode(stored);
        }
      } finally {
        if (mounted) {
          setIsReady(true);
        }
      }
    }

    loadThemeMode();

    return () => {
      mounted = false;
    };
  }, []);

  const setThemeMode = async (nextMode) => {
    if (nextMode !== "light" && nextMode !== "dark") {
      return;
    }

    setMode(nextMode);
    await AsyncStorage.setItem(THEME_KEY, nextMode);
  };

  const toggleTheme = async () => {
    const nextMode = mode === "light" ? "dark" : "light";
    await setThemeMode(nextMode);
  };

  const value = useMemo(
    () => ({
      theme: THEMES[mode] || THEMES.light,
      mode,
      toggleTheme,
      setThemeMode,
      isReady,
    }),
    [mode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
