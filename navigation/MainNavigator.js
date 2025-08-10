import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import * as Linking from 'expo-linking';
import { createStackNavigator } from '@react-navigation/stack';

import GroceryListScreen from '../screens/GroceryListScreen';
import SettingsScreen from '../screens/SettingsScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import EditNameScreen from '../screens/EditNameScreen';
import EditEmailScreen from '../screens/EditEmailScreen';
import EditPasswordScreen from '../screens/EditPasswordScreen';
import FeedbackScreen from '../screens/FeedbackScreen';
import AboutScreen from '../screens/AboutScreen';
import NotificationSettingsScreen from '../screens/NotificationSettingsScreen';
import HelpSupportScreen from '../screens/HelpSupportScreen';

const RootStack = createStackNavigator();

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
      <SettingsStackNav.Screen name="HelpSupport" component={HelpSupportScreen} />

    </SettingsStackNav.Navigator>
  );
}

function Tabs() {
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
          backgroundColor: colors.background,
          borderTopWidth: 0,
          paddingBottom: 12,
          paddingTop: 6,
          height: 68,
        },
        tabBarBackground: () => (
          <View style={{ flex: 1, backgroundColor: colors.background }} />
        ),
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen 
        name="Groceries" 
        component={GroceryListScreen}
        options={{ title: 'Lijsten' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsStack}
        options={{ title: 'Instellingen', tabBarItemStyle: { paddingLeft: 6 } }}
      />
    </Tab.Navigator>
  );
}

function JoinHandlerScreen({ route, navigation }) {
  const code = route.params?.code;
  useEffect(() => {
    // TODO: Use code to join shared list, then go to groceries
    navigation.replace('Groceries');
  }, [code]);
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Bezig met openen…</Text>
    </View>
  );
}

export default function MainNavigator() {
  const { signOut } = useAuth();
  const { colors } = useTheme();

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="Tabs" component={Tabs} />
      <RootStack.Screen name="Join" component={JoinHandlerScreen} />
    </RootStack.Navigator>
  );
} 