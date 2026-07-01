import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ActivityIndicator, View } from "react-native";
import { RootState, AppDispatch } from "../store";
import { restoreAuth } from "../store/slices/authSlice";
import AuthNavigator from "./AuthNavigator";
import AdminNavigator from "./AdminNavigator";
import BorrowerNavigator from "./BorrowerNavigator";
import { Colors } from "../theme";

export default function AppNavigator() {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, user, isLoading } = useSelector(
    (state: RootState) => state.auth,
  );

  useEffect(() => {
    dispatch(restoreAuth());
  }, [dispatch]);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: Colors.background,
        }}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated) return <AuthNavigator />;
  if (user?.role === "ADMIN") return <AdminNavigator />;
  return <BorrowerNavigator />;
}
