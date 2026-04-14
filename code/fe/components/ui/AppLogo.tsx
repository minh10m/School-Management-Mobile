import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from "@expo/vector-icons";

interface AppLogoProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  textColor?: string;
}

export const AppLogo: React.FC<AppLogoProps> = ({ 
  size = 'medium', 
  color = '#136ADA', 
  textColor = '#136ADA' 
}) => {
  const iconSize = size === 'small' ? 20 : size === 'medium' ? 24 : 32;
  const fontSize = size === 'small' ? 16 : size === 'medium' ? 20 : 28;

  return (
    <View className="flex-row items-center gap-2">
      <Ionicons name="book" size={iconSize} color={color} />
      <Text
        style={{ fontFamily: "Poppins-Bold", color: textColor }}
        className={size === 'small' ? 'text-base' : size === 'medium' ? 'text-xl' : 'text-2xl'}
      >
        EDU Manage
      </Text>
    </View>
  );
};
