// Hulpfuncties voor automatisch inloggen-voorkeur
import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTO_LOGIN_KEY = 'auto_login_enabled';

export async function setAutoLoginEnabled(enabled) {
  try {
    await AsyncStorage.setItem(AUTO_LOGIN_KEY, enabled ? '1' : '0');
  } catch (e) {
    // Fout bij opslaan
  }
}

export async function getAutoLoginEnabled() {
  try {
    const value = await AsyncStorage.getItem(AUTO_LOGIN_KEY);
    return value === '1';
  } catch (e) {
    return false;
  }
}

export async function clearAutoLogin() {
  try {
    await AsyncStorage.removeItem(AUTO_LOGIN_KEY);
  } catch (e) {}
} 