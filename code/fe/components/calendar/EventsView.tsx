import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

const EVENTS_DATA = [
  {
    id: "1",
    title: "Sports day",
    date: "July 10 , 2024",
    image: "basketball-outline",
    bg: "bg-orange-100",
    iconColor: "#F97316",
  },
  {
    id: "2",
    title: "Quiz day",
    date: "July 22 , 2024",
    image: "help-circle-outline",
    bg: "bg-yellow-100",
    iconColor: "#EAB308",
  },
];

export default function EventsView() {
  return (
    <View className="px-6">
      <View className="bg-white border border-gray-100 rounded-2xl p-4 mb-4 flex-row justify-between items-center">
        <Text
          className="text-black text-sm"
          style={{ fontFamily: "Poppins-Bold" }}
        >
          Select Month
        </Text>
        <Ionicons name="chevron-down" size={20} color="black" />
      </View>

      <Text
        className="text-black text-sm mb-4"
        style={{ fontFamily: "Poppins-Medium" }}
      >
        July , 2024
      </Text>

      <View className="pb-10">
        {EVENTS_DATA.map((event) => (
          <View
            key={event.id}
            className="bg-white border border-gray-100 rounded-2xl p-4 mb-4 shadow-sm flex-row items-center"
          >
            <View
              className={`${event.bg} w-24 h-24 rounded-xl items-center justify-center mr-4`}
            >
              <Ionicons
                name={event.image as any}
                size={40}
                color={event.iconColor}
              />
            </View>

            <View className="flex-1">
              <Text
                className="text-black text-base mb-1"
                style={{ fontFamily: "Poppins-Bold" }}
              >
                {event.title}
              </Text>
              <Text
                className="text-gray-500 text-xs"
                style={{ fontFamily: "Poppins-Regular" }}
              >
                {event.date}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
