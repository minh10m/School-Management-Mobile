import React from 'react';
import { View, Text, TouchableOpacity, Dimensions, StyleSheet, Modal } from 'react-native';
import Animated, { 
    SlideInLeft,
    SlideOutLeft,
    FadeIn,
    FadeOut
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '../store/authStore';

const { width, height } = Dimensions.get('window');
const MENU_WIDTH = width * 0.8;

interface SideMenuProps {
    visible: boolean;
    onClose: () => void;
}

export default function SideMenu({ visible, onClose }: SideMenuProps) {
    const { userInfo, clearAuth } = useAuthStore();
    const displayName = userInfo?.fullName ?? 'User';
    const role = userInfo?.role?.toUpperCase() || 'STUDENT';

    let menuItems = [
        { icon: 'settings-outline', label: 'Cài đặt', route: '/settings' },
    ];

    if (role === 'STUDENT') {
        menuItems = [
            { icon: 'card-outline', label: 'Lịch sử thanh toán', route: '/student/payment' },
            ...menuItems
        ];
    }

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
                            <View className="w-16 h-16 rounded-full bg-blue-50 items-center justify-center border-2 border-bright-blue">
                                <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 28, color: '#136ADA' }}>
                                    {displayName.charAt(0)}
                                </Text>
                            </View>
                            <View>
                                <Text className="text-black text-lg" style={{ fontFamily: 'Poppins-Bold' }}>{displayName}</Text>
                                <TouchableOpacity onPress={() => { 
                                    onClose(); 
                                    if (role === 'ADMIN') router.push('/admin/profile');
                                    else if (role === 'TEACHER') router.push('/teacher/edit-profile');
                                    else router.push('/(tabs)/profile'); 
                                }}>
                                    <Text className="text-gray-400 text-sm" style={{ fontFamily: 'Poppins-Regular' }}>Xem hồ sơ</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {/* Menu Items */}
                    <View className="flex-1 px-6 py-6">
                    {menuItems.map((item, index) => (
                            <TouchableOpacity key={index} className="flex-row items-center justify-between py-4 active:bg-gray-50 rounded-xl px-2"
                                onPress={() => {
                                    if (item.route) {
                                        onClose();
                                        router.push(item.route as any);
                                    }
                                }}
                            >
                                 <View className="flex-row items-center gap-4">
                                    <Ionicons name={item.icon as any} size={22} color="#6B7280" />
                                    <Text className="text-gray-600 text-base" style={{ fontFamily: 'Poppins-Medium' }}>{item.label}</Text>
                                 </View>
                                 <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Footer - Log Out */}
                    <View className="px-6 pb-10 pt-4 border-t border-gray-200">
                         <TouchableOpacity className="flex-row items-center justify-between py-2" onPress={() => {
                             onClose();
                             clearAuth();
                             router.replace('/login');
                         }}>
                            <View className="flex-row items-center gap-4">
                                <View className="w-8 h-8 items-center justify-center rounded-lg border border-red-500 bg-red-50">
                                    <Ionicons name="log-out-outline" size={18} color="#EF4444" />
                                </View>
                                <Text className="text-red-500 text-base" style={{ fontFamily: 'Poppins-Medium' }}>Đăng xuất</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#EF4444" />
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
