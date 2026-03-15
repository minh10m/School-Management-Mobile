import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity,  Dimensions, StyleSheet, Platform, Modal } from 'react-native';
import Animated, { 
    useSharedValue, 
    useAnimatedStyle, 
    withTiming, 
    withSpring,
    runOnJS,
    SlideInLeft,
    SlideOutLeft,
    FadeIn,
    FadeOut
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');
const MENU_WIDTH = width * 0.8;

interface SideMenuProps {
    visible: boolean;
    onClose: () => void;
}

const MENU_ITEMS = [
    { icon: 'swap-horizontal-outline', label: 'Switch Profile' },
    { icon: 'person-add-outline', label: 'Add Account' },
    { icon: 'school-outline', label: 'Teacher info' },
    { icon: 'card-outline', label: 'Payment History' },
    { icon: 'settings-outline', label: 'Setting' },
];

export default function SideMenu({ visible, onClose }: SideMenuProps) {

    return (
        <Modal
            transparent
            visible={visible}
            animationType="none"
            onRequestClose={onClose}
        >
            <View style={styles.overlay} pointerEvents="box-none">
                {/* Backdrop */}
                <Animated.View 
                    entering={FadeIn}
                    exiting={FadeOut}
                    style={styles.backdrop}
                >
                    <TouchableOpacity style={{ flex: 1 }} onPress={onClose} activeOpacity={1} />
                </Animated.View>

                {/* Drawer */}
                <Animated.View 
                    entering={SlideInLeft}
                    exiting={SlideOutLeft}
                    style={[styles.drawer]}
                >
                    {/* Header */}
                    <View className="pt-12 px-6 pb-8 border-b border-gray-100">
                        <View className="flex-row items-center gap-4">
                            <View className="p-1 rounded-full border-2 border-bright-blue">
                                <View className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
                                    <Image 
                                        source={require('../assets/images/on-boarding-1.png')} 
                                        style={{ width: '100%', height: '100%' }}
                                        contentFit="cover"
                                    />
                                </View>
                            </View>
                            <View>
                                <Text className="text-black text-lg" style={{ fontFamily: 'Poppins-Bold' }}>Dinesh Kumar</Text>
                                <TouchableOpacity>
                                    <Text className="text-gray-400 text-sm" style={{ fontFamily: 'Poppins-Regular' }}>View Profile</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {/* Menu Items */}
                    <View className="flex-1 px-6 py-6">
                        {MENU_ITEMS.map((item, index) => (
                            <TouchableOpacity key={index} className="flex-row items-center justify-between py-4 active:bg-gray-50 rounded-xl px-2">
                                 <View className="flex-row items-center gap-4">
                                    <Ionicons name={item.icon as any} size={22} color="#6B7280" />
                                    <Text className="text-gray-600 text-base" style={{ fontFamily: 'Poppins-Medium' }}>{item.label}</Text>
                                 </View>
                                 <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Footer */}
                    <View className="px-6 pb-10 pt-4 border-t border-gray-200">
                         <TouchableOpacity className="flex-row items-center justify-between py-2" onPress={() => {
                             onClose();
                             router.replace('/login');
                         }}>
                            <View className="flex-row items-center gap-4">
                                <View className="w-8 h-8 items-center justify-center rounded-lg border border-black">
                                    <Ionicons name="log-out-outline" size={18} color="black" />
                                </View>
                                <Text className="text-black text-base" style={{ fontFamily: 'Poppins-Medium' }}>Log Out</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="black" />
                         </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-start',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    drawer: {
        width: MENU_WIDTH,
        height: '100%',
        backgroundColor: 'white',
        borderTopRightRadius: 30,
        borderBottomRightRadius: 30,
        shadowColor: "#000",
        shadowOffset: {
            width: 5,
            height: 0,
        },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    }
});
