import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface AdminLayoutProps {
  title: string;
  onBack?: () => void;
  rightComponent?: React.ReactNode;
  searchProps?: {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    onFilterPress?: () => void;
  };
  children: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  title,
  onBack,
  rightComponent,
  searchProps,
  children,
  containerStyle,
}) => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      {/* Standardized Header */}
      <View className="px-6 py-4 flex-row items-center justify-between border-b border-gray-100 bg-white">
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={onBack || (() => router.back())} 
            className="mr-4 p-1"
          >
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={{ fontFamily: "Poppins-Bold" }} className="text-xl text-black">
            {title}
          </Text>
        </View>
        {rightComponent}
      </View>

      {/* Standardized Search Bar Section */}
      {searchProps && (
        <View className="bg-white border-b border-gray-100 pb-2">
          <View className="px-6 pt-4 pb-2 flex-row items-center gap-4">
            <View className="flex-1 bg-white flex-row items-center px-4 py-2.5 rounded-2xl border border-gray-200">
              <Ionicons name="search-outline" size={20} color="#9ca3af" />
              <TextInput
                placeholder={searchProps.placeholder || "Tìm kiếm..."}
                className="flex-1 ml-2 text-black text-sm"
                style={{ fontFamily: "Poppins-Regular" }}
                value={searchProps.value}
                onChangeText={searchProps.onChangeText}
              />
            </View>
            {searchProps.onFilterPress && (
              <TouchableOpacity
                onPress={searchProps.onFilterPress}
                className="bg-white w-11 h-11 rounded-2xl items-center justify-center border border-gray-200 shadow-sm"
              >
                <Ionicons name="options-outline" size={22} color="#136ADA" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Content */}
      <View style={[{ flex: 1, backgroundColor: 'white' }, containerStyle]}>
        {children}
      </View>
    </SafeAreaView>
  );
};
