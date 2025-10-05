import { Stack } from "expo-router";
import "./global.css";
import { HeaderTitle } from "@react-navigation/elements";

export default function RootLayout() {
  return (
    <Stack 
    screenOptions={{ headerShown: false }}
    >
      <>
        <Stack.Screen name="home"/>
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="selectUserType" options={{ headerShown: true, title: "Select User Type", headerTitleAlign: "center", headerTitleStyle: { fontWeight: "bold" } }} />
        <Stack.Screen name="customerDashboard" options={{ headerShown: false }} />
        <Stack.Screen name="providerDashboard" options={{ headerShown: false }} />
      </>
    </Stack>
  );
}
