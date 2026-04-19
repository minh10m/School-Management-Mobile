import React from 'react';
import { View, Text, TouchableOpacity, Dimensions, StyleSheet, Modal, Alert, TextInput, ActivityIndicator } from 'react-native';
import Animated, { 
    SlideInLeft,
    SlideOutLeft,
    FadeIn,
    FadeOut
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { useConfigStore } from '../store/configStore';
import { schoolYearInfoService } from '../services/schoolYearInfo.service';
import { useState } from 'react';

const { width, height } = Dimensions.get('window');
const MENU_WIDTH = width * 0.8;

interface SideMenuProps {
    visible: boolean;
    onClose: () => void;
}

interface MenuItem {
    icon: string;
    label: string;
    route?: string;
    onPress?: () => void;
}

export default function SideMenu({ visible, onClose }: SideMenuProps) {
    const { userInfo, clearAuth } = useAuthStore();
    const { updateConfig } = useConfigStore();
    const displayName = userInfo?.fullName ?? 'User';
    const role = userInfo?.role?.toUpperCase() || 'STUDENT';

    const [isConfigVisible, setConfigVisible] = useState(false);
    const [configData, setConfigData] = useState({ id: '', schoolYear: 2026, term: 1 });
    const [isSaving, setIsSaving] = useState(false);

    const handleOpenConfig = async () => {
        try {
            const data = await schoolYearInfoService.getSchoolYearInfo();
            if (data) {
                setConfigData({ id: data.id, schoolYear: data.schoolYear, term: data.term });
            }
            setConfigVisible(true);
        } catch (err) {
            Alert.alert('Lỗi', 'Không thể lấy thông tin năm học');
        }
    };

    const handleSaveConfig = async () => {
        try {
            setIsSaving(true);
            if (configData.id) {
                await schoolYearInfoService.updateSchoolYearInfo(configData.id, {
                    schoolYear: configData.schoolYear,
                    term: configData.term,
                });
            } else {
                await schoolYearInfoService.createSchoolYearInfo({
                    schoolYear: configData.schoolYear,
                    term: configData.term,
                });
            }
            updateConfig(configData.schoolYear, configData.term);
            Alert.alert('Thành công', 'Cập nhật thông tin năm học thành công.');
            setConfigVisible(false);
        } catch (err) {
            Alert.alert('Lỗi', 'Cập nhật thất bại');
        } finally {
            setIsSaving(false);
        }
    };

    let menuItems: MenuItem[] = [
        { icon: 'settings-outline', label: 'Cài đặt', route: '/settings' },
    ];

    if (role === 'STUDENT') {
        menuItems = [
            { icon: 'card-outline', label: 'Lịch sử thanh toán', route: '/student/payment' },
            ...menuItems
        ];
    }

    if (role === 'ADMIN') {
        menuItems = [
            { icon: 'calendar-outline', label: 'Cấu hình năm học', onPress: handleOpenConfig },
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
                                    if (item.onPress) {
                                        item.onPress();
                                    } else if (item.route) {
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

            {/* Inner Configuration Modal */}
            <Modal
                visible={isConfigVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setConfigVisible(false)}
            >
                <View className="flex-1 bg-black/50 items-center justify-center px-6">
                    <View className="bg-white w-full rounded-3xl p-6 shadow-xl">
                        <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-xl mb-4 text-black">Cấu hình năm học</Text>
                        
                        <View className="mb-4">
                            <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-500 text-xs mb-1 uppercase tracking-wider">Năm học (VD: 2026)</Text>
                            <TextInput
                                className="bg-gray-50 p-4 rounded-2xl text-black border border-gray-100"
                                style={{ fontFamily: 'Poppins-Regular' }}
                                keyboardType="numeric"
                                value={configData.schoolYear.toString()}
                                onChangeText={(text) => setConfigData({ ...configData, schoolYear: parseInt(text, 10) || 0 })}
                            />
                        </View>

                        <View className="mb-6">
                            <Text style={{ fontFamily: 'Poppins-Medium' }} className="text-gray-500 text-xs mb-1 uppercase tracking-wider">Học kỳ (1 hoặc 2)</Text>
                            <TextInput
                                className="bg-gray-50 p-4 rounded-2xl text-black border border-gray-100"
                                style={{ fontFamily: 'Poppins-Regular' }}
                                keyboardType="numeric"
                                value={configData.term.toString()}
                                onChangeText={(text) => setConfigData({ ...configData, term: parseInt(text, 10) || 1 })}
                            />
                        </View>

                        <View className="flex-row gap-3">
                            <TouchableOpacity 
                                className="flex-1 bg-gray-100 py-4 rounded-2xl items-center"
                                onPress={() => setConfigVisible(false)}
                            >
                                <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-gray-600">Hủy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                className="flex-1 bg-blue-600 py-4 rounded-2xl items-center shadow-lg shadow-blue-200"
                                onPress={handleSaveConfig}
                                disabled={isSaving}
                            >
                                {isSaving ? (
                                    <ActivityIndicator size="small" color="white" />
                                ) : (
                                    <Text style={{ fontFamily: 'Poppins-SemiBold' }} className="text-white">Lưu thay đổi</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
