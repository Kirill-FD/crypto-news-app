import React from 'react';
import { Pressable, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTheme } from '../contexts/ThemeContext';
import { RootStackParamList } from '../navigation/types';

const SettingsButton: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handlePress = () => {
    navigation.navigate('Settings');
  };

  return (
    <Pressable
      onPress={handlePress}
      hitSlop={10}
      style={{ paddingHorizontal: 8, paddingVertical: 4 }}
    >
      <Text style={{ fontSize: 20, color: colors.textPrimary }}>⚙️</Text>
    </Pressable>
  );
};

export default SettingsButton;