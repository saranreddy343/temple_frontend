import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "../theme";
import { AdminStackParamList } from "../types";

import AdminDashboardScreen from "../screens/admin/AdminDashboardScreen";
import VillagerListScreen from "../screens/admin/VillagerListScreen";
import VillagerDetailsScreen from "../screens/admin/VillagerDetailsScreen";
import AddVillagerScreen from "../screens/admin/AddVillagerScreen";
import LoanListScreen from "../screens/admin/LoanListScreen";
import CreateLoanScreen from "../screens/admin/CreateLoanScreen";
import LoanDetailsScreen from "../screens/admin/LoanDetailsScreen";
import CloseLoanScreen from "../screens/admin/CloseLoanScreen";
import InterestCollectionScreen from "../screens/admin/InterestCollectionScreen";
import PrincipalCollectionScreen from "../screens/admin/PrincipalCollectionScreen";
import ExpenseListScreen from "../screens/admin/ExpenseListScreen";
import AddExpenseScreen from "../screens/admin/AddExpenseScreen";
import ExpenseDetailsScreen from "../screens/admin/ExpenseDetailsScreen";
import ReportsScreen from "../screens/admin/ReportsScreen";
import AdminNotificationsScreen from "../screens/admin/AdminNotificationsScreen";
import BroadcastNotificationScreen from "../screens/admin/BroadcastNotificationScreen";
import ProfileScreen from "../screens/admin/ProfileScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<AdminStackParamList>();

function AdminTabs() {
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
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, string> = {
            Dashboard: "view-dashboard",
            Villagers: "account-group",
            Loans: "cash-multiple",
            Expenses: "file-document-multiple",
            Reports: "chart-bar",
            Profile: "account-circle",
          };
          return (
            <MaterialCommunityIcons
              name={icons[route.name] as never}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={AdminDashboardScreen} />
      {/* <Tab.Screen name="Villagers" component={VillagerListScreen} />
       */}
      <Tab.Screen name="Villagers" component={VillagerListScreen} />
      <Tab.Screen name="Loans" component={LoanListScreen} />
      <Tab.Screen name="Expenses" component={ExpenseListScreen} />
      {/* <Tab.Screen name="Reports" component={ReportsScreen} /> */}
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AdminNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminTabs" component={AdminTabs} />
      <Stack.Screen name="AddVillager" component={AddVillagerScreen} />
      <Stack.Screen name="EditVillager" component={AddVillagerScreen} />
      <Stack.Screen name="VillagerDetails" component={VillagerDetailsScreen} />
      <Stack.Screen name="CreateLoan" component={CreateLoanScreen} />
      <Stack.Screen name="LoanDetails" component={LoanDetailsScreen} />
      <Stack.Screen name="EditLoan" component={CreateLoanScreen} />
      <Stack.Screen name="CloseLoan" component={CloseLoanScreen} />
      <Stack.Screen
        name="InterestCollection"
        component={InterestCollectionScreen}
      />
      <Stack.Screen
        name="PrincipalCollection"
        component={PrincipalCollectionScreen}
      />
      <Stack.Screen name="AddExpense" component={AddExpenseScreen} />
      <Stack.Screen name="ExpenseDetails" component={ExpenseDetailsScreen} />
      <Stack.Screen
        name="AdminNotifications"
        component={AdminNotificationsScreen}
      />
      <Stack.Screen
        name="BroadcastNotification"
        component={BroadcastNotificationScreen}
      />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
}

// const Tab = createBottomTabNavigator();
// const Stack = createNativeStackNavigator<AdminStackParamList>();

// function AdminTabs() {
//   return (
//     <Tab.Navigator
//       screenOptions={({ route }) => ({
//         headerShown: false,
//         tabBarActiveTintColor: Colors.primary,
//         tabBarInactiveTintColor: Colors.textMuted,
//         tabBarStyle: {
//           backgroundColor: Colors.surface,
//           borderTopColor: Colors.border,
//           height: 60,
//           paddingBottom: 8,
//         },
//         tabBarIcon: ({ color, size }) => {
//           const icons: Record<string, string> = {
//             Dashboard: "view-dashboard",
//             Villagers: "account-group",
//             Loans: "cash-multiple",
//             Reports: "chart-bar",
//             Profile: "account-circle",
//           };
//           return (
//             <MaterialCommunityIcons
//               name={icons[route.name] as never}
//               size={size}
//               color={color}
//             />
//           );
//         },
//       })}
//     >
//       <Tab.Screen name="Dashboard" component={AdminDashboardScreen} />
//       <Tab.Screen name="Villagers" component={VillagerListScreen} />
//       <Tab.Screen name="Loans" component={LoanListScreen} />
//       <Tab.Screen name="Reports" component={ReportsScreen} />
//       <Tab.Screen name="Profile" component={ProfileScreen} />
//     </Tab.Navigator>
//   );
// }

// export default function AdminNavigator() {
//   return (
//     <Stack.Navigator screenOptions={{ headerShown: false }}>
//       <Stack.Screen name="AdminTabs" component={AdminTabs} />
//       <Stack.Screen name="AddVillager" component={AddVillagerScreen} />
//       <Stack.Screen name="CreateLoan" component={CreateLoanScreen} />
//       <Stack.Screen name="LoanDetails" component={LoanDetailsScreen} />
//       <Stack.Screen
//         name="InterestCollection"
//         component={InterestCollectionScreen}
//       />
//       <Stack.Screen
//         name="PrincipalCollection"
//         component={PrincipalCollectionScreen}
//       />
//       <Stack.Screen
//         name="AdminNotifications"
//         component={AdminNotificationsScreen}
//       />
//     </Stack.Navigator>
//   );
// }
