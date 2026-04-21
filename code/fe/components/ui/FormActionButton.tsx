import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface FormActionButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  color?: string;
}

export const FormActionButton: React.FC<FormActionButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  color = '#136ADA'
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View 
      style={{ 
        paddingHorizontal: 24, 
        paddingTop: 12,
        paddingBottom: Math.max(insets.bottom, 24),
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9'
      }}
    >
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={{
          backgroundColor: color,
          height: 58,
          borderRadius: 20,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: color,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 8,
          opacity: disabled ? 0.6 : 1
        }}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text
            style={{
              color: 'white',
              fontSize: 16,
              fontFamily: 'Poppins-Bold',
              letterSpacing: 0.5
            }}
          >
            {title}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};
