import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { getNotificationSettings, shouldScheduleBookingReminder } from "./notificationSettings";

const REMINDER_KEY = "booking_reminder_keys_v1";
const REMINDER_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours
const DEFAULT_LEAD_TIME_MS = 2 * 60 * 60 * 1000; // 2 hours before booking

const parseStoredReminderKeys = async () => {
  try {
    const raw = await AsyncStorage.getItem(REMINDER_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch (_error) {
    return new Set();
  }
};

export const buildReminderKeyFromBooking = (booking) => {
  if (!booking?._id) {
    return null;
  }

  const slotRaw = booking?.slot || booking?.booking_datetime;
  const slotDate = new Date(slotRaw);
  if (Number.isNaN(slotDate.getTime())) {
    return null;
  }

  return `${booking._id}:${slotDate.toISOString()}`;
};

export const getScheduledReminderKeys = async () => {
  const keySet = await parseStoredReminderKeys();
  return Array.from(keySet);
};

const saveReminderKeys = async (keysSet) => {
  const list = Array.from(keysSet);
  await AsyncStorage.setItem(REMINDER_KEY, JSON.stringify(list));
};

const getReminderLabel = (booking) => {
  if (booking?.booking_type === "TEE_TIME") {
    return booking?.service_details?.course?.name || booking?.course_id?.name || "tee time";
  }

  if (booking?.booking_type === "COACH") {
    return (
      booking?.service_details?.lesson?.title ||
      booking?.lesson?.title ||
      booking?.coach_id?.full_name ||
      "coach session"
    );
  }

  return booking?.service_details?.caddie?.full_name || booking?.caddie_id?.full_name || "caddie booking";
};

export const syncBookingReminderNotifications = async (bookings = []) => {
  if (!Array.isArray(bookings) || bookings.length === 0) {
    return;
  }

  const notificationSettings = await getNotificationSettings();
  if (!shouldScheduleBookingReminder(notificationSettings)) {
    return;
  }

  const permission = await Notifications.getPermissionsAsync();
  const granted = permission.granted || permission.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
  if (!granted) {
    const asked = await Notifications.requestPermissionsAsync();
    const newlyGranted = asked.granted || asked.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
    if (!newlyGranted) {
      return;
    }
  }

  const storedReminderKeys = await parseStoredReminderKeys();
  const now = Date.now();

  for (const booking of bookings) {
    if (booking?.status !== "CONFIRMED") {
      continue;
    }

    const slotRaw = booking?.slot || booking?.booking_datetime;
    const slotDate = new Date(slotRaw);
    if (Number.isNaN(slotDate.getTime())) {
      continue;
    }

    const slotMs = slotDate.getTime();
    const untilBooking = slotMs - now;
    if (untilBooking <= 0 || untilBooking > REMINDER_WINDOW_MS) {
      continue;
    }

    const reminderKey = buildReminderKeyFromBooking(booking);
    if (!reminderKey) {
      continue;
    }
    if (storedReminderKeys.has(reminderKey)) {
      continue;
    }

    const reminderAtMs = Math.max(now + 15000, slotMs - DEFAULT_LEAD_TIME_MS);
    const bookingLabel = getReminderLabel(booking);
    const bookingTimeLabel = slotDate.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Booking Reminder",
        body: `You have ${bookingLabel} at ${bookingTimeLabel}.`,
        sound: true,
        data: {
          type: "BOOKING_REMINDER",
          bookingId: booking?._id,
          reminderKey,
        },
      },
      trigger: new Date(reminderAtMs),
    });

    storedReminderKeys.add(reminderKey);
  }

  await saveReminderKeys(storedReminderKeys);
};
