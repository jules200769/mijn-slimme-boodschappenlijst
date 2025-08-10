import notificationService from './notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

class NotificationTriggers {
  constructor() {
    this.settings = null;
  }

  // Load notification settings
  async loadSettings() {
    try {
      const savedSettings = await AsyncStorage.getItem('notificationSettings');
      this.settings = savedSettings ? JSON.parse(savedSettings) : {
        shoppingReminders: true,
        itemAdded: false, // Standaard uit voor nieuwe gebruikers
        listShared: true,
        weeklyReminders: false,
        inactivityReminders: true, // New setting for inactivity notifications
      };
    } catch (error) {
      console.error('Error loading notification settings:', error);
      this.settings = {
        shoppingReminders: true,
        itemAdded: false, // Standaard uit voor nieuwe gebruikers
        listShared: true,
        weeklyReminders: false,
        inactivityReminders: true, // New setting for inactivity notifications
      };
    }
  }

  // Check if app-level notifications are enabled
  async isAppNotificationsEnabled() {
    try {
      const appNotificationEnabled = await AsyncStorage.getItem('appNotificationEnabled');
      return appNotificationEnabled ? JSON.parse(appNotificationEnabled) : false;
    } catch (error) {
      console.error('Error checking app notification setting:', error);
      return false;
    }
  }

  // Check if notifications are enabled for a specific type
  async isNotificationEnabled(type) {
    // First check if app-level notifications are enabled
    const appEnabled = await this.isAppNotificationsEnabled();
    
    if (!appEnabled) {
      return false;
    }

    // Always reload settings to ensure we have the latest
    await this.forceReloadSettings();
    
    return this.settings[type] || false;
  }

  // Force reload settings from AsyncStorage
  async forceReloadSettings() {
    this.settings = null;
    await this.loadSettings();
  }

  // Debug function to check all notification settings
  async debugNotificationSettings() {
    console.log('=== DEBUG: Notification Settings ===');
    
    // Force reload settings to ensure we have the latest
    await this.forceReloadSettings();
    
    const appEnabled = await this.isAppNotificationsEnabled();
    console.log('App notifications enabled:', appEnabled);
    
    // Check each notification type
    const types = ['shoppingReminders', 'itemAdded', 'listShared', 'weeklyReminders', 'inactivityReminders'];
    for (const type of types) {
      const enabled = await this.isNotificationEnabled(type);
      console.log(`${type}: ${enabled}`);
    }
    console.log('=== END DEBUG ===');
  }

  // Track user activity (call this when user opens app or performs actions)
  async trackUserActivity() {
    try {
      const now = new Date().toISOString();
      await AsyncStorage.setItem('lastUserActivity', now);
      console.log('User activity tracked:', now);
    } catch (error) {
      console.error('Error tracking user activity:', error);
    }
  }

  // Check if user has been inactive for 1 week and send notification
  async checkInactivityAndNotify() {
    if (!(await this.isNotificationEnabled('inactivityReminders'))) {
      return;
    }

    try {
      const lastActivity = await AsyncStorage.getItem('lastUserActivity');
      if (!lastActivity) {
        // First time user, set current time
        await this.trackUserActivity();
        return;
      }

      const lastActivityDate = new Date(lastActivity);
      const now = new Date();
      const daysSinceLastActivity = (now - lastActivityDate) / (1000 * 60 * 60 * 24);

      // If exactly 7 days (1 week) have passed since last activity
      if (daysSinceLastActivity >= 7 && daysSinceLastActivity < 8) {
        await this.triggerInactivityNotification();
      }
    } catch (error) {
      console.error('Error checking inactivity:', error);
    }
  }

  // Trigger inactivity notification
  async triggerInactivityNotification() {
    try {
      await notificationService.sendLocalNotification(
        'Vergeet je boodschappenlijst niet!',
        'Het is al een week geleden dat je je boodschappenlijst hebt gebruikt. Tijd om een nieuwe lijst te maken!',
        { 
          type: 'inactivity_reminder',
          timestamp: new Date().toISOString()
        }
      );
      console.log('Inactivity notification sent');
    } catch (error) {
      console.error('Error sending inactivity notification:', error);
    }
  }

  // Schedule daily inactivity check
  async scheduleInactivityCheck() {
    if (!(await this.isNotificationEnabled('inactivityReminders'))) {
      return;
    }

    try {
      // Schedule a daily check at 10:00 AM
      const now = new Date();
      const checkTime = new Date(now);
      checkTime.setHours(10, 0, 0, 0);

      // If it's already past 10 AM today, schedule for tomorrow
      if (checkTime <= now) {
        checkTime.setDate(checkTime.getDate() + 1);
      }

      await notificationService.scheduleNotification(
        'Inactivity Check',
        '', // Empty body, this notification won't be shown to user
        {
          date: checkTime,
          repeats: true,
          repeatInterval: 'day'
        },
        { 
          type: 'inactivity_check',
          silent: true
        }
      );
    } catch (error) {
      console.error('Error scheduling inactivity check:', error);
    }
  }

  // Trigger notification when item is added to list
  async triggerItemAddedNotification(itemName, listName, addedBy = null) {
    if (!(await this.isNotificationEnabled('itemAdded'))) {
      return;
    }

    try {
      const message = addedBy 
        ? `${addedBy} heeft "${itemName}" toegevoegd aan "${listName}"`
        : `"${itemName}" is toegevoegd aan "${listName}"`;

      await notificationService.sendLocalNotification(
        'Item Toegevoegd',
        message,
        { 
          type: 'item_added', 
          itemName, 
          listName,
          addedBy 
        }
      );
    } catch (error) {
      console.error('Error sending item added notification:', error);
    }
  }

  // Trigger notification when list is shared
  async triggerListSharedNotification(listName, sharedBy, shareCode) {
    if (!(await this.isNotificationEnabled('listShared'))) {
      return;
    }

    try {
      await notificationService.sendLocalNotification(
        'Lijst Gedeeld',
        `${sharedBy} heeft de lijst "${listName}" met je gedeeld (Code: ${shareCode})`,
        { 
          type: 'list_shared', 
          listName, 
          sharedBy,
          shareCode 
        }
      );
    } catch (error) {
      console.error('Error sending list shared notification:', error);
    }
  }

  // Trigger notification when someone joins a list
  async triggerListJoinedNotification(listName, joinedBy) {
    if (!(await this.isNotificationEnabled('listShared'))) {
      return;
    }

    try {
      await notificationService.sendLocalNotification(
        'Lid Toegevoegd',
        `${joinedBy} is lid geworden van "${listName}"`,
        { 
          type: 'list_joined', 
          listName, 
          joinedBy 
        }
      );
    } catch (error) {
      console.error('Error sending list joined notification:', error);
    }
  }

  // Trigger shopping reminder notification
  async triggerShoppingReminderNotification(listName, itemsCount = 0) {
    if (!(await this.isNotificationEnabled('shoppingReminders'))) {
      return;
    }

    try {
      const message = itemsCount > 0 
        ? `Vergeet niet je boodschappenlijst "${listName}" mee te nemen! (${itemsCount} items)`
        : `Vergeet niet je boodschappenlijst "${listName}" mee te nemen!`;

      await notificationService.sendLocalNotification(
        'Boodschappen Herinnering',
        message,
        { 
          type: 'shopping_reminder', 
          listName,
          itemsCount 
        }
      );
    } catch (error) {
      console.error('Error sending shopping reminder notification:', error);
    }
  }

  // Schedule weekly reminder
  async scheduleWeeklyReminder() {
    if (!(await this.isNotificationEnabled('weeklyReminders'))) {
      return;
    }

    try {
      // Schedule for next Monday at 9:00 AM
      const now = new Date();
      const nextMonday = new Date(now);
      nextMonday.setDate(now.getDate() + (8 - now.getDay()) % 7);
      nextMonday.setHours(9, 0, 0, 0);

      // If it's already past Monday 9 AM, schedule for next week
      if (nextMonday <= now) {
        nextMonday.setDate(nextMonday.getDate() + 7);
      }

      await notificationService.scheduleNotification(
        'Wekelijkse Boodschappen Herinnering',
        'Tijd om je boodschappenlijst te checken!',
        {
          date: nextMonday,
          repeats: true,
          repeatInterval: 'week'
        },
        { 
          type: 'weekly_reminder' 
        }
      );
    } catch (error) {
      console.error('Error scheduling weekly reminder:', error);
    }
  }

  // Trigger notification when list is completed
  async triggerListCompletedNotification(listName, completedItemsCount) {
    if (!(await this.isNotificationEnabled('shoppingReminders'))) {
      return;
    }

    try {
      await notificationService.sendLocalNotification(
        'Lijst Voltooid',
        `Gefeliciteerd! Je hebt alle ${completedItemsCount} items van "${listName}" afgevinkt!`,
        { 
          type: 'list_completed', 
          listName,
          completedItemsCount 
        }
      );
    } catch (error) {
      console.error('Error sending list completed notification:', error);
    }
  }

  // Trigger notification when list is almost empty
  async triggerListAlmostEmptyNotification(listName, remainingItemsCount) {
    if (!(await this.isNotificationEnabled('shoppingReminders'))) {
      return;
    }

    try {
      await notificationService.sendLocalNotification(
        'Bijna Klaar!',
        `Je hebt nog maar ${remainingItemsCount} items over in "${listName}"!`,
        { 
          type: 'list_almost_empty', 
          listName,
          remainingItemsCount 
        }
      );
    } catch (error) {
      console.error('Error sending list almost empty notification:', error);
    }
  }

  // Trigger notification when item is removed
  async triggerItemRemovedNotification(itemName, listName, removedBy = null) {
    if (!(await this.isNotificationEnabled('itemAdded'))) {
      return;
    }

    try {
      const message = removedBy 
        ? `${removedBy} heeft "${itemName}" verwijderd uit "${listName}"`
        : `"${itemName}" is verwijderd uit "${listName}"`;

      await notificationService.sendLocalNotification(
        'Item Verwijderd',
        message,
        { 
          type: 'item_removed', 
          itemName, 
          listName,
          removedBy 
        }
      );
    } catch (error) {
      console.error('Error sending item removed notification:', error);
    }
  }

  // Trigger notification when list is deleted
  async triggerListDeletedNotification(listName, deletedBy = null) {
    if (!(await this.isNotificationEnabled('listShared'))) {
      return;
    }

    try {
      const message = deletedBy 
        ? `${deletedBy} heeft de lijst "${listName}" verwijderd`
        : `De lijst "${listName}" is verwijderd`;

      await notificationService.sendLocalNotification(
        'Lijst Verwijderd',
        message,
        { 
          type: 'list_deleted', 
          listName,
          deletedBy 
        }
      );
    } catch (error) {
      console.error('Error sending list deleted notification:', error);
    }
  }

  // Trigger notification when list name is changed
  async triggerListRenamedNotification(oldName, newName, renamedBy = null) {
    if (!(await this.isNotificationEnabled('listShared'))) {
      return;
    }

    try {
      const message = renamedBy 
        ? `${renamedBy} heeft "${oldName}" hernoemd naar "${newName}"`
        : `"${oldName}" is hernoemd naar "${newName}"`;

      await notificationService.sendLocalNotification(
        'Lijst Hernoemd',
        message,
        { 
          type: 'list_renamed', 
          oldName,
          newName,
          renamedBy 
        }
      );
    } catch (error) {
      console.error('Error sending list renamed notification:', error);
    }
  }
}

// Create singleton instance
const notificationTriggers = new NotificationTriggers();

export default notificationTriggers; 