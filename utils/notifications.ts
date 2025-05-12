import * as Notifications from 'expo-notifications';

export async function sendImmediateNotification(title: string, body: string) {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    let finalStatus = status;

    if (status !== 'granted') {
      const { status: newStatus } = await Notifications.requestPermissionsAsync();
      finalStatus = newStatus;
    }

    if (finalStatus !== 'granted') {
      console.warn('🔕 Notification permission not granted.');
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
      },
      trigger: null,
    });
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
}