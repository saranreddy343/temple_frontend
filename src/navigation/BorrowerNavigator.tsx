import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "../theme";

import BorrowerDashboardScreen from "../screens/borrower/BorrowerDashboardScreen";
import MyLoanScreen from "../screens/borrower/MyLoanScreen";
import BorrowerNotificationsScreen from "../screens/borrower/BorrowerNotificationsScreen";
import BorrowerProfileScreen from "../screens/borrower/BorrowerProfileScreen";
import ExpenseListScreen from "../screens/admin/ExpenseListScreen";
import ExpenseDetailsScreen from "../screens/admin/ExpenseDetailsScreen";
import LoanDetailsScreen from "../screens/admin/LoanDetailsScreen";
import PaymentHistoryScreen from "../screens/borrower/PaymentHistoryScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TAB_ICONS: Record<string, string> = {
  Dashboard: "view-dashboard",
  "My Loans": "cash-multiple",
  Expenses: "file-document-multiple",
  Notifications: "bell",
  Profile: "account-circle",
};

function BorrowerTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: "transparent",
          height: 74,
          paddingBottom: 12,
          paddingTop: 10,
          marginHorizontal: 14,
          marginBottom: 12,
          borderRadius: 24,
          position: "absolute",
          shadowColor: Colors.shadow,
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.12,
          shadowRadius: 22,
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "800",
        },
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons
            name={(TAB_ICONS[route.name] ?? "circle") as never}
            size={size}
            color={color}
          />
        ),
      })}
    >
      <Tab.Screen name="Dashboard" component={BorrowerDashboardScreen} />
      <Tab.Screen name="My Loans" component={MyLoanScreen} />
      <Tab.Screen name="Expenses" component={ExpenseListScreen} />
      <Tab.Screen name="Notifications" component={BorrowerNotificationsScreen} />
      <Tab.Screen name="Profile" component={BorrowerProfileScreen} />
    </Tab.Navigator>
  );
}

export default function BorrowerNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BorrowerTabs" component={BorrowerTabs} />
      <Stack.Screen name="BorrowerNotifications" component={BorrowerNotificationsScreen} />
      <Stack.Screen name="MyLoans" component={MyLoanScreen} />
      <Stack.Screen name="LoanDetails" component={LoanDetailsScreen} />
      <Stack.Screen name="ExpenseList" component={ExpenseListScreen} />
      <Stack.Screen name="ExpenseDetails" component={ExpenseDetailsScreen} />
      <Stack.Screen name="PaymentHistory" component={PaymentHistoryScreen} />
    </Stack.Navigator>
  );
}
