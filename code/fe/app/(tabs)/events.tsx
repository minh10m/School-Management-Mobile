import { Ionicons } from "@expo/vector-icons";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const EVENTS_DATA = [
  { id: "1", title: "Sports Day", date: "July 10, 2024", image: "basketball-outline", bg: "bg-orange-100", iconColor: "#F97316" },
  { id: "2", title: "Quiz Day", date: "July 22, 2024", image: "help-circle-outline", bg: "bg-yellow-100", iconColor: "#EAB308" },
];

export default function EventsTab() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 py-4 border-b border-gray-100">
        <Text className="text-black text-lg" style={{ fontFamily: "Poppins-Bold" }}>Events</Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
        <View className="pb-20">
          {EVENTS_DATA.map((event) => (
            <View
              key={event.id}
              className="bg-white border border-gray-100 rounded-2xl p-4 mb-4 shadow-sm flex-row items-center"
            >
              <View className={`${event.bg} w-24 h-24 rounded-xl items-center justify-center mr-4`}>
                <Ionicons name={event.image as any} size={40} color={event.iconColor} />
              </View>
              <View className="flex-1">
                <Text className="text-black text-base mb-1" style={{ fontFamily: "Poppins-Bold" }}>{event.title}</Text>
                <Text className="text-gray-500 text-xs" style={{ fontFamily: "Poppins-Regular" }}>{event.date}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
