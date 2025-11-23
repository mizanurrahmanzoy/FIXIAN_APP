import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

// Import your screens
import Dashboard from "./dashboard";
import Orders from "./orders";
import Chats from "./Chats";
import Profile from "./profile";

const Tab = createBottomTabNavigator();

export default function CustomerTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false, // Hide top header
        tabBarActiveTintColor: "#007bff",
        tabBarInactiveTintColor: "#000",
        tabBarStyle: { height: 70, paddingBottom: 10 },
        tabBarIcon: ({ color, size }) => {
          let iconName: string = "";

          switch (route.name) {
            case "Dashboard":
              iconName = "home";
              break;
            case "Orders":
              iconName = "briefcase-outline";
              break;
            case "Chats":
              iconName = "chatbubble-outline";
              break;
            case "Profile":
              iconName = "person-outline";
              break;
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={Dashboard} />
      <Tab.Screen name="Orders" component={Orders} />
      <Tab.Screen name="Chats" component={Chats} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}
