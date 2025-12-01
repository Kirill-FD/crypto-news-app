import React, { useEffect, useMemo, useRef } from 'react';
import { View, Text, Pressable, Animated, Easing } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../contexts/LanguageContext';


interface ThemeToggleProps {
  label?: boolean;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ label = false }) => {
  const { theme, setTheme, colors } = useTheme();
  const { t } = useTranslation();
  const isDark = theme === 'dark';

  const anim = useRef(new Animated.Value(isDark ? 1 : 0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: isDark ? 1 : 0,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [isDark]);

  const trackWidth = 64;
  const trackHeight = 32;
  const thumbSize = 28;
  const horizontalPadding = 2;
  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [horizontalPadding, trackWidth - thumbSize - horizontalPadding],
  });
  const trackBg = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#cbd5e1', '#60a5fa'],
  });
  const sunOpacity = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.4] });
  const moonOpacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });

  const onToggle = () => setTheme(!isDark ? 'dark' : 'light');

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 8 }}>
      {label && (
        <Text style={{ color: colors.textSecondary, marginRight: 8 }}>
          {/* {isDark ? 'Dark' : 'Light'} */}
          {isDark ? t('themeDark') : t('themeLight')}
        </Text>
      )}
      <Pressable onPress={onToggle} hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Animated.View
          style={{
            width: trackWidth,
            height: trackHeight,
            borderRadius: trackHeight / 2,
            backgroundColor: trackBg as any,
            justifyContent: 'center',
            paddingHorizontal: horizontalPadding,
          }}
        >
          <Animated.View
            style={{
              width: thumbSize,
              height: thumbSize,
              borderRadius: thumbSize / 2,
              backgroundColor: isDark ? '#111827' : '#f9fafb',
              transform: [{ translateX }],
              shadowColor: '#000',
              shadowOpacity: 0.15,
              shadowOffset: { width: 0, height: 1 },
              shadowRadius: 2,
              elevation: 2,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Animated.Text style={{ position: 'absolute', opacity: sunOpacity, fontSize: 14 }}>☀️</Animated.Text>
            <Animated.Text style={{ position: 'absolute', opacity: moonOpacity, fontSize: 14 }}>🌙</Animated.Text>
          </Animated.View>
        </Animated.View>
      </Pressable>
    </View>
  );
};

export default ThemeToggle;


