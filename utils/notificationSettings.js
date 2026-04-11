import AsyncStorage from "@react-native-async-storage/async-storage";

const NOTIFICATION_ENABLED_KEY = "notifications_enabled_v1";
const NOTIFICATION_PREFERENCE_KEY = "notifications_preference_v1";

export const NOTIFICATION_PREFERENCES = {
  ALL: "ALL",
  BOOKINGS_ONLY: "BOOKINGS_ONLY",
};

const DEFAULT_SETTINGS = {
  enabled: true,
  preference: NOTIFICATION_PREFERENCES.ALL,
};

export const getNotificationSettings = async () => {
  try {
    const [enabledRaw, preferenceRaw] = await Promise.all([
      AsyncStorage.getItem(NOTIFICATION_ENABLED_KEY),
      AsyncStorage.getItem(NOTIFICATION_PREFERENCE_KEY),
    ]);

    const enabled =
      enabledRaw === null
        ? DEFAULT_SETTINGS.enabled
        : String(enabledRaw).toLowerCase() === "true";

    const preference =
      preferenceRaw === NOTIFICATION_PREFERENCES.BOOKINGS_ONLY
        ? NOTIFICATION_PREFERENCES.BOOKINGS_ONLY
        : NOTIFICATION_PREFERENCES.ALL;

    return { enabled, preference };
  } catch (_error) {
    return { ...DEFAULT_SETTINGS };
  }
};

export const setNotificationEnabled = async (enabled) => {
  await AsyncStorage.setItem(NOTIFICATION_ENABLED_KEY, String(Boolean(enabled)));
};

export const setNotificationPreference = async (preference) => {
  const normalized =
    preference === NOTIFICATION_PREFERENCES.BOOKINGS_ONLY
      ? NOTIFICATION_PREFERENCES.BOOKINGS_ONLY
      : NOTIFICATION_PREFERENCES.ALL;

  await AsyncStorage.setItem(NOTIFICATION_PREFERENCE_KEY, normalized);
};

export const shouldScheduleBookingReminder = (settings) => {
  if (!settings?.enabled) {
    return false;
  }

  return (
    settings.preference === NOTIFICATION_PREFERENCES.ALL ||
    settings.preference === NOTIFICATION_PREFERENCES.BOOKINGS_ONLY
  );
};
