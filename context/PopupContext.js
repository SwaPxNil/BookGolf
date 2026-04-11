import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../theme/ThemeContext";

const PopupContext = createContext({
  showPopup: (_options) => {},
  closePopup: () => {},
});

const defaultButtons = [{ text: "OK", role: "primary" }];

export function PopupProvider({ children }) {
  const { theme, mode } = useTheme();
  const [popupState, setPopupState] = useState({
    visible: false,
    title: "",
    message: "",
    buttons: defaultButtons,
  });

  const closePopup = useCallback(() => {
    setPopupState((prev) => ({ ...prev, visible: false }));
  }, []);

  const showPopup = useCallback((options = {}) => {
    setPopupState({
      visible: true,
      title: options.title || "Notice",
      message: options.message || "",
      buttons: Array.isArray(options.buttons) && options.buttons.length ? options.buttons : defaultButtons,
    });
  }, []);

  const handleButtonPress = (button) => {
    closePopup();
    if (typeof button?.onPress === "function") {
      setTimeout(() => button.onPress(), 0);
    }
  };

  const value = useMemo(() => ({ showPopup, closePopup }), [showPopup, closePopup]);

  return (
    <PopupContext.Provider value={value}>
      {children}
      <Modal
        visible={popupState.visible}
        transparent
        animationType="fade"
        onRequestClose={closePopup}
      >
        <View style={styles.backdrop}>
          <View
            style={[
              styles.card,
              {
                backgroundColor: mode === "dark" ? "#222924" : "#FAF6E8",
                borderColor: theme.line,
              },
            ]}
          >
            <Text style={[styles.title, { color: theme.textPrimary }]}>{popupState.title}</Text>
            <Text style={[styles.message, { color: theme.textSecondary }]}>{popupState.message}</Text>

            <View style={styles.footer}>
              {popupState.buttons.map((button, index) => {
                const role = button?.role || (button?.style === "destructive" ? "destructive" : "primary");
                const isDestructive = role === "destructive";
                const isSecondary = role === "secondary" || role === "cancel";

                return (
                  <TouchableOpacity
                    key={`${button?.text || "btn"}-${index}`}
                    style={[
                      styles.button,
                      isDestructive
                        ? styles.destructiveBtn
                        : isSecondary
                        ? [styles.secondaryBtn, { borderColor: theme.line }]
                        : [styles.primaryBtn, { backgroundColor: theme.accent }],
                    ]}
                    onPress={() => handleButtonPress(button)}
                  >
                    <Text
                      style={[
                        styles.buttonText,
                        isDestructive
                          ? styles.destructiveText
                          : isSecondary
                          ? { color: theme.textPrimary }
                          : styles.primaryText,
                      ]}
                    >
                      {button?.text || "OK"}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    </PopupContext.Provider>
  );
}

export function usePopup() {
  return useContext(PopupContext);
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 20, 16, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  title: {
    fontFamily: "Bebas",
    fontSize: 34,
    letterSpacing: 0.6,
  },
  message: {
    marginTop: 6,
    fontFamily: "Abel",
    fontSize: 17,
    lineHeight: 22,
  },
  footer: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  button: {
    minWidth: 90,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  primaryBtn: {
    borderColor: "transparent",
  },
  secondaryBtn: {
    backgroundColor: "transparent",
  },
  destructiveBtn: {
    borderColor: "transparent",
    backgroundColor: "#A33C3C",
  },
  buttonText: {
    fontFamily: "Bebas",
    fontSize: 20,
    letterSpacing: 0.4,
  },
  primaryText: {
    color: "#fff",
  },
  destructiveText: {
    color: "#fff",
  },
});
