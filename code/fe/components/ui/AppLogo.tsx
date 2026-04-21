import React from 'react';
import { View, Text } from 'react-native';
import { Image } from 'expo-image';

interface AppLogoProps {
  size?: 'small' | 'medium' | 'large' | 'xl';
}

export const AppLogo: React.FC<AppLogoProps> = ({ 
  size = 'medium' 
}) => {
  const dimensions = {
    small: { icon: 28, font: 16 },
    medium: { icon: 34, font: 20 },
    large: { icon: 48, font: 28 },
    xl: { icon: 60, font: 36 },
  }[size];

  return (
    <View className="flex-row items-center gap-2">
      <Image
        source={require("../../assets/images/edu_logo_clean.png")}
        style={{ width: dimensions.icon, height: dimensions.icon }}
        contentFit="contain"
      />
      <Text
        style={{ fontSize: dimensions.font, fontFamily: "Poppins-Bold", color: "#136ADA" }}
        className="ml-1"
      >
        EduManage
      </Text>
    </View>
  );
};
