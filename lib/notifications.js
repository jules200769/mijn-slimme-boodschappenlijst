import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notificationTriggers from './notificationTriggers';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

class NotificationService {
  constructor() {
    this.notificationListener = null;
    this.responseListener = null;
  }

  // Request permissions for local notifications only
  async registerForPushNotificationsAsync() {
    let hasPermissions = false;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#37af29',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Failed to get notification permissions!');
        return null;
      }
      
      hasPermissions = true;
      console.log('Notification permissions granted');
    } else {
      console.log('Must use physical device for notifications');
    }

    return hasPermissions ? 'local-notifications-enabled' : null;
  }

  // Save notification status to AsyncStorage
  async saveNotificationStatus(status) {
    try {
      await AsyncStorage.setItem('notificationStatus', status);
    } catch (error) {
      console.error('Error saving notification status:', error);
    }
  }

  // Get saved notification status
  async getNotificationStatus() {
    try {
      return await AsyncStorage.getItem('notificationStatus');
    } catch (error) {
      console.error('Error getting notification status:', error);
      return null;
    }
  }

  // Send local notification
  async sendLocalNotification(title, body, data = {}) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: title,
          body: body,
          data: data,
          sound: true,
        },
        trigger: null, // Send immediately
      });
      console.log('Local notification sent:', title);
    } catch (error) {
      console.error('Error sending local notification:', error);
    }
  }

  // Schedule notification for later
  async scheduleNotification(title, body, trigger, data = {}) {
    try {
      return await Notifications.scheduleNotificationAsync({
        content: {
          title: title,
          body: body,
          data: data,
          sound: true,
        },
        trigger: trigger,
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  // Cancel scheduled notification
  async cancelNotification(notificationId) {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  }

  // Cancel all scheduled notifications
  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  }

  // Handle inactivity check when scheduled notification is received
  async handleInactivityCheck() {
    try {
      await notificationTriggers.checkInactivityAndNotify();
    } catch (error) {
      console.error('Error handling inactivity check:', error);
    }
  }

  // Set up notification listeners
  setupNotificationListeners() {
    // Listener for when notification is received while app is running
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      
      // Check if this is an inactivity check notification
      const data = notification.request.content.data;
      if (data && data.type === 'inactivity_check') {
        // Handle inactivity check silently
        this.handleInactivityCheck();
        return;
      }
      
      // Hier kun je custom logic toevoegen voor wanneer een notificatie binnenkomt
    });

    // Listener for when user taps on notification
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      
      const data = response.notification.request.content.data;
      
      // Handle inactivity check if user taps on it
      if (data && data.type === 'inactivity_check') {
        this.handleInactivityCheck();
        return;
      }
      
      // Hier kun je navigatie logic toevoegen wanneer gebruiker op notificatie tapt
      if (data.screen) {
        // Navigate to specific screen
        // navigation.navigate(data.screen, data.params);
      }
    });
  }

  // Clean up listeners
  cleanup() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }

  // Get notification permissions status
  async getNotificationPermissions() {
    return await Notifications.getPermissionsAsync();
  }

  // Check if notifications are enabled
  async areNotificationsEnabled() {
    const permissions = await this.getNotificationPermissions();
    return permissions.status === 'granted';
  }

  // Send test notification
  async sendTestNotification() {
    await this.sendLocalNotification(
      'Test Notificatie',
      'Dit is een test notificatie van je boodschappenlijst app!',
      { type: 'test' }
    );
  }

  // Send shopping list reminder
  async sendShoppingReminder(listName) {
    await this.sendLocalNotification(
      'Boodschappen Herinnering',
      `Vergeet niet je boodschappenlijst "${listName}" mee te nemen!`,
      { type: 'shopping_reminder', listName }
    );
  }

  // Send item added notification
  async sendItemAddedNotification(itemName, listName) {
    await this.sendLocalNotification(
      'Item Toegevoegd',
      `"${itemName}" is toegevoegd aan "${listName}"`,
      { type: 'item_added', itemName, listName }
    );
  }

  // Send list shared notification
  async sendListSharedNotification(listName, sharedBy) {
    await this.sendLocalNotification(
      'Lijst Gedeeld',
      `${sharedBy} heeft de lijst "${listName}" met je gedeeld`,
      { type: 'list_shared', listName, sharedBy }
    );
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService; 