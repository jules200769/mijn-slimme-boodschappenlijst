import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

import GroceryListScreen from '../screens/GroceryListScreen';
import SettingsScreen from '../screens/SettingsScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import EditNameScreen from '../screens/EditNameScreen';
import EditEmailScreen from '../screens/EditEmailScreen';
import EditPasswordScreen from '../screens/EditPasswordScreen';
import FeedbackScreen from '../screens/FeedbackScreen';
import AboutScreen from '../screens/AboutScreen';
import NotificationSettingsScreen from '../screens/NotificationSettingsScreen';
import { createStackNavigator } from '@react-navigation/stack';

const Tab = createBottomTabNavigator();
const SettingsStackNav = createStackNavigator();

function SettingsStack() {
  return (
    <SettingsStackNav.Navigator screenOptions={{ headerShown: false }}>
      <SettingsStackNav.Screen name="SettingsMain" component={SettingsScreen} />
      <SettingsStackNav.Screen name="EditProfile" component={EditProfileScreen} />
      <SettingsStackNav.Screen name="EditName" component={EditNameScreen} />
      <SettingsStackNav.Screen name="EditEmail" component={EditEmailScreen} />
      <SettingsStackNav.Screen name="EditPassword" component={EditPasswordScreen} />
      <SettingsStackNav.Screen name="Feedback" component={FeedbackScreen} />
      <SettingsStackNav.Screen name="About" component={AboutScreen} />
      <SettingsStackNav.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
    </SettingsStackNav.Navigator>
  );
}

export default function MainNavigator() {
  const { signOut } = useAuth();
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Groceries') {
            iconName = focused ? 'cart' : 'cart-outline';
          } else if (route.name === 'Home') {
            iconName = focused ? 'chat' : 'chat-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'cog' : 'cog-outline';
          } else if (route.name === 'About') {
            iconName = focused ? 'information' : 'information-outline';
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.success,
        tabBarInactiveTintColor: colors.textTertiary,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.divider,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen 
        name="Groceries" 
        component={GroceryListScreen}
        options={{
          title: 'Lijsten',
        }}
      />
      {/* NutritionFactsScreen tab verwijderd */}
      <Tab.Screen 
        name="Settings" 
        component={SettingsStack}
        options={{
          title: 'Instellingen',
        }}
      />
      {/* About tab verwijderd */}
    </Tab.Navigator>
  );
} 