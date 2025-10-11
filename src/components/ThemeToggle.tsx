import React from 'react';
import { View, Text, Switch } from 'react-native';
import { useTheme } from '../App';

interface ThemeToggleProps {
  label?: boolean;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ label = false }) => {
  const { theme, setTheme, colors } = useTheme();
  const isDark = theme === 'dark';

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {label && (
        <Text style={{ color: colors.textSecondary, marginRight: 8 }}>
          {isDark ? 'Dark' : 'Light'}
        </Text>
      )}
      <Switch
        value={isDark}
        onValueChange={(v) => setTheme(v ? 'dark' : 'light')}
        thumbColor={isDark ? '#111827' : '#f9fafb'}
        trackColor={{ false: '#cbd5e1', true: '#60a5fa' }}
      />
    </View>
  );
};

export default ThemeToggle;


