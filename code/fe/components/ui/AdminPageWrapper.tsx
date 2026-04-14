import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StyleProp,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { AppLogo } from "./AppLogo";

interface AdminPageWrapperProps {
  title?: string;
  onBack?: () => void;
  leftComponent?: React.ReactNode;
  centerComponent?: React.ReactNode;
  rightComponent?: React.ReactNode;
  showLogo?: boolean;
  searchProps?: {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    onFilterPress?: () => void;
  };
  children: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
}

export const AdminPageWrapper: React.FC<AdminPageWrapperProps> = ({
  title,
  onBack,
  leftComponent,
  centerComponent,
  rightComponent,
  showLogo,
  searchProps,
  children,
  containerStyle,
}) => {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      {/* Standardized Header */}
      <View className="px-6 py-4 flex-row items-center justify-between border-b border-gray-100 bg-white min-h-[64px]">
        {/* Left Section */}
        <View className="flex-1 flex-row items-center">
          {leftComponent ? (
            <View>{leftComponent}</View>
          ) : onBack ? (
            <TouchableOpacity
              onPress={onBack}
              className="p-1"
            >
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
          ) : router.canGoBack() ? (
            <TouchableOpacity
              onPress={() => router.back()}
              className="p-1"
            >
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
          ) : null}
          
          {title && !showLogo && (
            <Text
              style={{ fontFamily: "Poppins-Bold" }}
              className="text-xl text-black ml-3"
            >
              {title}
            </Text>
          )}
        </View>

        {/* Center Section */}
        <View className="absolute left-0 right-0 items-center justify-center pointer-events-none" style={{ height: 64 }}>
          {showLogo ? (
            <AppLogo size="medium" />
          ) : centerComponent ? (
            centerComponent
          ) : null}
        </View>

        {/* Right Section */}
        <View className="flex-1 flex-row items-center justify-end">
          {rightComponent}
        </View>
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
      <View style={[{ flex: 1, backgroundColor: "white" }, containerStyle]}>
        {children}
      </View>
    </SafeAreaView>
  );
};
