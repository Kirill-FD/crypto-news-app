import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../contexts/LanguageContext';
import ThemeToggle from '../components/ThemeToggle';
import styles from './SettingsScreen.style';

const SettingsScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t, language, setLanguage, availableLanguages } = useTranslation();
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);

  const selectedLanguage = availableLanguages.find(item => item.value === language);

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{t('settingsHeaderTitle')}</Text>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{t('languageLabel')}</Text>
            <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
              {t('languageDescription')}
            </Text>
          </View>

          <View style={[styles.dropdown, { borderColor: colors.border, backgroundColor: colors.background }]}>
            <TouchableOpacity
              onPress={() => setIsLanguageOpen(!isLanguageOpen)}
              activeOpacity={0.8}
              style={styles.dropdownTrigger}
            >
              <Text style={[styles.dropdownText, { color: colors.textPrimary }]}>
                {selectedLanguage?.label ?? t('selectLanguage')}
              </Text>
              <Text style={[styles.dropdownCaret, { color: colors.textSecondary }]}>▼</Text>
            </TouchableOpacity>

            {isLanguageOpen && (
              <View style={[styles.dropdownList, { borderColor: colors.border, backgroundColor: colors.card }]}>
                {availableLanguages.map(option => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => {
                      setLanguage(option.value);
                      setIsLanguageOpen(false);
                    }}
                    style={styles.dropdownItem}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        { color: option.value === language ? colors.primary : colors.textPrimary },
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{t('themeLabel')}</Text>
            <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
              {t('themeDescription')}
            </Text>
          </View>

          <View style={styles.themeToggleRow}>
            <ThemeToggle label />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;