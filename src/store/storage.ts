import { MMKV } from 'react-native-mmkv';
import { Platform } from 'react-native';

type StorageLike = {
	set: (key: string, value: string) => void;
	getString: (key: string) => string | undefined;
	delete: (key: string) => void;
	clearAll: () => void;
};

class MemoryStorage implements StorageLike {
	private map = new Map<string, string>();
	set(key: string, value: string) { this.map.set(key, value); }
	getString(key: string) { return this.map.get(key); }
	delete(key: string) { this.map.delete(key); }
	clearAll() { this.map.clear(); }
}

// Initialize storage with a safe fallback if MMKV cannot start (e.g., remote debugging)
const createStorage = (): StorageLike => {
	if (Platform.OS === 'web') {
		return new MemoryStorage();
	}
	try {
		return new MMKV({ id: 'crypto-news-storage', encryptionKey: 'crypto-news-encryption-key-2024' });
	} catch (e) {
		// Fallback to in-memory storage when JSI is not available (remote debugger)
		return new MemoryStorage();
	}
};

export const storage: StorageLike = createStorage();

// Storage utilities
export const storageKeys = {
  USER_PREFERENCES: 'user_preferences',
  CACHE_TIMESTAMP: 'cache_timestamp',
  OFFLINE_DATA: 'offline_data',
} as const;

// Helper functions for storage operations
export const setStorageItem = (key: string, value: any): void => {
  try {
    const jsonValue = JSON.stringify(value);
    storage.set(key, jsonValue);
  } catch (error) {
    console.error('Error setting storage item:', error);
  }
};

export const getStorageItem = <T>(key: string): T | null => {
  try {
    const jsonValue = storage.getString(key);
    return jsonValue ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error('Error getting storage item:', error);
    return null;
  }
};

export const removeStorageItem = (key: string): void => {
  try {
    storage.delete(key);
  } catch (error) {
    console.error('Error removing storage item:', error);
  }
};

export const clearStorage = (): void => {
  try {
    storage.clearAll();
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
};

// User preferences interface
export interface UserPreferences {
  theme: 'light' | 'dark';
  notifications: boolean;
  autoRefresh: boolean;
  refreshInterval: number; // in minutes
  cacheExpiry: number; // in hours
}

// Default user preferences
export const defaultUserPreferences: UserPreferences = {
  theme: 'light',
  notifications: true,
  autoRefresh: true,
  refreshInterval: 5,
  cacheExpiry: 24,
};

// User preferences helpers
export const getUserPreferences = (): UserPreferences => {
  const preferences = getStorageItem<UserPreferences>(storageKeys.USER_PREFERENCES);
  return preferences || defaultUserPreferences;
};

export const setUserPreferences = (preferences: Partial<UserPreferences>): void => {
  const currentPreferences = getUserPreferences();
  const updatedPreferences = { ...currentPreferences, ...preferences };
  setStorageItem(storageKeys.USER_PREFERENCES, updatedPreferences);
};

// Cache management
export const setCacheTimestamp = (key: string, timestamp: number = Date.now()): void => {
  const cacheTimestamps = getStorageItem<Record<string, number>>(storageKeys.CACHE_TIMESTAMP) || {};
  cacheTimestamps[key] = timestamp;
  setStorageItem(storageKeys.CACHE_TIMESTAMP, cacheTimestamps);
};

export const getCacheTimestamp = (key: string): number | null => {
  const cacheTimestamps = getStorageItem<Record<string, number>>(storageKeys.CACHE_TIMESTAMP) || {};
  return cacheTimestamps[key] || null;
};

export const isCacheValid = (key: string, expiryHours: number = 24): boolean => {
  const timestamp = getCacheTimestamp(key);
  if (!timestamp) return false;
  
  const expiryTime = expiryHours * 60 * 60 * 1000; // Convert hours to milliseconds
  return Date.now() - timestamp < expiryTime;
};



