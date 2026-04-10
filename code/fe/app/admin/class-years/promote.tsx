import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState, useEffect, useCallback } from "react";
import { classYearService } from "../../../services/classYear.service";
import { ClassYearResponse } from "../../../types/classYear";
import { SCHOOL_YEAR } from "../../../constants/config";

interface MappingRule {
  id: string; // Internal local ID for list management
  fromClassYearId: string;
  toClassId: string;
}

export default function AdminPromoteScreen() {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Years
  const targetYearStr = SCHOOL_YEAR;
  const sourceYearInt = parseInt(targetYearStr.split("-")[0], 10) - 1;
  const sourceYearStr = sourceYearInt.toString();

  // Data
  const [sourceClasses, setSourceClasses] = useState<ClassYearResponse[]>([]);
  const [targetClasses, setTargetClasses] = useState<ClassYearResponse[]>([]);

  // Mappings
  const [mappings, setMappings] = useState<MappingRule[]>([
    { id: Math.random().toString(), fromClassYearId: "", toClassId: "" },
  ]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [sourceRes, targetRes] = await Promise.all([
        classYearService.getClassYears({ schoolYear: sourceYearStr }),
        classYearService.getClassYears({ schoolYear: targetYearStr }),
      ]);
      setSourceClasses(sourceRes);
      setTargetClasses(targetRes);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to fetch class lists");
    } finally {
      setLoading(false);
    }
  }, [sourceYearStr, targetYearStr]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addMapping = () => {
    setMappings([
      ...mappings,
      { id: Math.random().toString(), fromClassYearId: "", toClassId: "" },
    ]);
  };

  const removeMapping = (id: string) => {
    if (mappings.length === 1) return;
    setMappings(mappings.filter((m) => m.id !== id));
  };

  const updateMapping = (
    id: string,
    field: keyof MappingRule,
    value: string,
  ) => {
    setMappings(
      mappings.map((m) => (m.id === id ? { ...m, [field]: value } : m)),
    );
  };

  const handlePromote = async () => {
    const validMappings = mappings.filter(
      (m) => m.fromClassYearId && m.toClassId,
    );
    if (validMappings.length === 0) {
      Alert.alert("Validation", "Please select at least one valid class pair.");
      return;
    }

    try {
      setSubmitting(true);
      await classYearService.promote({
        currentSystemYear: parseInt(targetYearStr.split("-")[0], 10),
        classPromotes: validMappings.map((m) => ({
          fromClassYearId: m.fromClassYearId,
          toClassYearId: m.toClassId,
        })),
      });
      Alert.alert("Success", "Promotion completed successfully!");
      router.back();
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Promotion failed.";
      Alert.alert("Error", msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text
          style={{ fontFamily: "Poppins-Bold" }}
          className="text-black text-lg flex-1"
        >
          Class Promotion
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
      >
        {/* Year Info */}
        <View className="bg-blue-50 p-4 rounded-2xl mb-6 flex-row justify-between items-center border border-blue-100">
          <View>
            <Text
              style={{ fontFamily: "Poppins-Medium" }}
              className="text-blue-400 text-[10px] uppercase"
            >
              From Year
            </Text>
            <Text
              style={{ fontFamily: "Poppins-Bold" }}
              className="text-blue-700 text-lg"
            >
              {sourceYearStr}
            </Text>
          </View>
          <Ionicons name="arrow-forward" size={24} color="#136ADA" />
          <View className="items-end">
            <Text
              style={{ fontFamily: "Poppins-Medium" }}
              className="text-blue-400 text-[10px] uppercase"
            >
              To Year
            </Text>
            <Text
              style={{ fontFamily: "Poppins-Bold" }}
              className="text-blue-700 text-lg"
            >
              {targetYearStr}
            </Text>
          </View>
        </View>

        <Text
          style={{ fontFamily: "Poppins-SemiBold" }}
          className="text-gray-500 text-xs mb-4 uppercase tracking-wider"
        >
          Promotion Rules
        </Text>

        {loading ? (
          <ActivityIndicator color="#136ADA" className="mt-10" />
        ) : (
          <View className="gap-4">
            {mappings.map((mapping, index) => (
              <View
                key={mapping.id}
                className="bg-white p-5 rounded-2xl border border-gray-100 relative shadow-sm"
              >
                <View className="flex-row items-center justify-between mb-4">
                  <Text
                    style={{ fontFamily: "Poppins-Bold" }}
                    className="text-gray-300 text-xs"
                  >
                    Rule #{index + 1}
                  </Text>
                  {mappings.length > 1 && (
                    <TouchableOpacity onPress={() => removeMapping(mapping.id)}>
                      <Ionicons
                        name="trash-outline"
                        size={18}
                        color="#EF4444"
                      />
                    </TouchableOpacity>
                  )}
                </View>

                <View className="gap-3">
                  {/* From Class */}
                  <View>
                    <Text
                      style={{ fontFamily: "Poppins-Medium" }}
                      className="text-gray-500 text-[10px] mb-1 ml-1"
                    >
                      SOURCE CLASS ({sourceYearStr})
                    </Text>
                    <Selector
                      data={sourceClasses}
                      selectedValue={mapping.fromClassYearId}
                      onSelect={(id) =>
                        updateMapping(mapping.id, "fromClassYearId", id)
                      }
                      placeholder="Select source class..."
                    />
                  </View>

                  <View className="items-center py-1">
                    <Ionicons name="chevron-down" size={16} color="#D1D5DB" />
                  </View>

                  {/* To Class */}
                  <View>
                    <Text
                      style={{ fontFamily: "Poppins-Medium" }}
                      className="text-gray-500 text-[10px] mb-1 ml-1"
                    >
                      DESTINATION CLASS ({targetYearStr})
                    </Text>
                    <Selector
                      data={targetClasses.filter((c) => {
                        const fromClass = sourceClasses.find(
                          (sc) => sc.classYearId === mapping.fromClassYearId,
                        );
                        // Must be grade = grade + 1
                        if (!fromClass) return true;
                        return c.grade === fromClass.grade + 1;
                      })}
                      disabled={!mapping.fromClassYearId}
                      selectedValue={mapping.toClassId}
                      onSelect={(id) =>
                        updateMapping(mapping.id, "toClassId", id)
                      }
                      placeholder="Select destination class..."
                    />
                  </View>
                </View>
              </View>
            ))}

            <TouchableOpacity
              onPress={addMapping}
              className="flex-row items-center justify-center py-4 border-2 border-dashed border-gray-200 rounded-2xl"
            >
              <Ionicons name="add" size={20} color="#9CA3AF" />
              <Text
                style={{ fontFamily: "Poppins-Medium" }}
                className="text-gray-400 ml-1"
              >
                Add Another Rule
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Footer Bottom Bar */}
      {!loading && (
        <View className="absolute bottom-0 left-0 right-0 bg-white p-6 border-t border-gray-100">
          <TouchableOpacity
            onPress={handlePromote}
            className={`py-4 rounded-3xl items-center shadow-md ${submitting ? "bg-gray-300" : "bg-bright-blue"}`}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text
                style={{ fontFamily: "Poppins-Bold" }}
                className="text-white text-base"
              >
                Confirm Promotion
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

function Selector({
  data,
  selectedValue,
  onSelect,
  placeholder,
  disabled,
}: {
  data: ClassYearResponse[];
  selectedValue: string;
  onSelect: (id: string) => void;
  placeholder: string;
  disabled?: boolean;
}) {
  const [modalVisible, setModalVisible] = useState(false);
  const selectedItem = data.find((c) => c.classYearId === selectedValue);

  return (
    <>
      <TouchableOpacity
        disabled={disabled}
        onPress={() => setModalVisible(true)}
        className={`flex-row items-center justify-between px-4 py-3 rounded-xl border border-gray-100 ${disabled ? "bg-gray-50" : "bg-white"}`}
      >
        <Text
          style={{ fontFamily: "Poppins-Regular" }}
          className={`text-sm ${selectedItem ? "text-black" : "text-gray-400"}`}
        >
          {selectedItem
            ? `${selectedItem.className} (Grade ${selectedItem.grade})`
            : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/40 justify-center px-6">
          <View className="bg-white rounded-3xl p-6 max-h-[70%]">
            <View className="flex-row justify-between items-center mb-4">
              <Text
                style={{ fontFamily: "Poppins-Bold" }}
                className="text-lg text-black"
              >
                Select Class
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="black" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={data}
              keyExtractor={(item) => item.classYearId}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className={`py-4 border-b border-gray-50 ${selectedValue === item.classYearId ? "bg-blue-50/50 -mx-6 px-6" : ""}`}
                  onPress={() => {
                    onSelect(item.classYearId);
                    setModalVisible(false);
                  }}
                >
                  <Text
                    style={{
                      fontFamily:
                        selectedValue === item.classYearId
                          ? "Poppins-SemiBold"
                          : "Poppins-Regular",
                    }}
                    className={`text-base ${selectedValue === item.classYearId ? "text-bright-blue" : "text-gray-700"}`}
                  >
                    {item.className} - Grade {item.grade}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}
