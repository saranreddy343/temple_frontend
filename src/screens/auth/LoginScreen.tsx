import React, { useState } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from "react-native";
import { Text, TextInput, Button } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { Formik } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppDispatch, RootState } from "../../store";
import { adminLogin } from "../../store/slices/authSlice";
import { authAPI } from "../../api/auth.api";
import { AuthStackParamList } from "../../types";

const { width } = Dimensions.get("window");

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, "Login">;
};

const adminSchema = Yup.object({
  mobile: Yup.string()
    .matches(/^[0-9]{10}$/, "Enter 10-digit mobile")
    .required("Required"),
  password: Yup.string().min(6, "Min 6 characters").required("Required"),
});

const borrowerSchema = Yup.object({
  mobile: Yup.string()
    .matches(/^[0-9]{10}$/, "Enter 10-digit mobile")
    .required("Required"),
});

// Design tokens
const C = {
  bg: "#0B1120",
  card: "#131C2E",
  cardBorder: "#1E2D45",
  primary: "#00C896",
  primaryGlow: "#00C89620",
  gold: "#F0B429",
  text: "#F0F4FF",
  textSub: "#8A9BB8",
  inputBg: "#0D1525",
  inputBorder: "#1E2D45",
  inputFocus: "#00C896",
  error: "#FF6B6B",
  tab: "#0D1525",
  tabActive: "#00C896",
};

export default function LoginScreen({ navigation }: Props) {
  const [mode, setMode] = useState<"admin" | "borrower">("admin");
  const [otpLoading, setOtpLoading] = useState(false);
  const [secureText, setSecureText] = useState(true);
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading } = useSelector((state: RootState) => state.auth);

  const handleAdminLogin = async (values: {
    mobile: string;
    password: string;
  }) => {
    const result = await dispatch(adminLogin(values));
    if (adminLogin.rejected.match(result)) {
      Alert.alert("Login Failed", result.payload as string);
    }
  };

  const handleSendOTP = async (values: { mobile: string }) => {
    setOtpLoading(true);
    try {
      const res = await authAPI.sendOTP({ mobile: values.mobile });
      const data = res.data.data;
      navigation.navigate("OTPVerification", {
        mobile: values.mobile,
        devOtp: data?.devOtp,
        expiresIn: data?.expiresIn,
      });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      Alert.alert("Error", err.response?.data?.message ?? "Failed to send OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <LinearGradient
        colors={["#0B1120", "#0D1A30", "#0B1120"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Glow accent top */}
      <View style={styles.glowTop} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo block */}
        <View style={styles.logoBlock}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>🏛</Text>
          </View>
          <Text style={styles.appName}>Temple Finance</Text>
          <Text style={styles.appTagline}>
            Trusted • Transparent • Community
          </Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          {/* Tab switcher */}
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, mode === "admin" && styles.tabActive]}
              onPress={() => setMode("admin")}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabText,
                  mode === "admin" && styles.tabTextActive,
                ]}
              >
                Admin
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, mode === "borrower" && styles.tabActive]}
              onPress={() => setMode("borrower")}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabText,
                  mode === "borrower" && styles.tabTextActive,
                ]}
              >
                Villager
              </Text>
            </TouchableOpacity>
          </View>

          {mode === "admin" ? (
            <Formik
              initialValues={{ mobile: "", password: "" }}
              validationSchema={adminSchema}
              onSubmit={handleAdminLogin}
            >
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                values,
                errors,
                touched,
              }) => (
                <View style={styles.form}>
                  <Text style={styles.formTitle}>Welcome back</Text>
                  <Text style={styles.formSub}>
                    Sign in to your admin account
                  </Text>

                  <View style={styles.fieldGroup}>
                    <Text style={styles.label}>MOBILE NUMBER</Text>
                    <TextInput
                      value={values.mobile}
                      onChangeText={handleChange("mobile")}
                      onBlur={handleBlur("mobile")}
                      mode="outlined"
                      keyboardType="number-pad"
                      maxLength={10}
                      placeholder="10-digit mobile"
                      placeholderTextColor={C.textSub}
                      left={<TextInput.Icon icon="phone" color={C.primary} />}
                      error={touched.mobile && !!errors.mobile}
                      style={styles.input}
                      outlineColor={C.inputBorder}
                      activeOutlineColor={C.primary}
                      theme={{
                        colors: {
                          onSurfaceVariant: C.textSub,
                          background: C.inputBg,
                        },
                      }}
                      textColor={C.text}
                    />
                    {touched.mobile && errors.mobile && (
                      <Text style={styles.errorText}>{errors.mobile}</Text>
                    )}
                  </View>

                  <View style={styles.fieldGroup}>
                    <Text style={styles.label}>PASSWORD</Text>
                    <TextInput
                      value={values.password}
                      onChangeText={handleChange("password")}
                      onBlur={handleBlur("password")}
                      mode="outlined"
                      secureTextEntry={secureText}
                      placeholder="Enter password"
                      placeholderTextColor={C.textSub}
                      left={<TextInput.Icon icon="lock" color={C.primary} />}
                      right={
                        <TextInput.Icon
                          icon={secureText ? "eye-outline" : "eye-off-outline"}
                          color={C.textSub}
                          onPress={() => setSecureText(!secureText)}
                        />
                      }
                      error={touched.password && !!errors.password}
                      style={styles.input}
                      outlineColor={C.inputBorder}
                      activeOutlineColor={C.primary}
                      theme={{
                        colors: {
                          onSurfaceVariant: C.textSub,
                          background: C.inputBg,
                        },
                      }}
                      textColor={C.text}
                    />
                    {touched.password && errors.password && (
                      <Text style={styles.errorText}>{errors.password}</Text>
                    )}
                  </View>

                  <TouchableOpacity
                    onPress={() => handleSubmit()}
                    disabled={isLoading}
                    activeOpacity={0.85}
                    style={[
                      styles.loginBtn,
                      isLoading && styles.loginBtnDisabled,
                    ]}
                  >
                    <LinearGradient
                      colors={["#00C896", "#00A87C"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.loginBtnGradient}
                    >
                      <Text style={styles.loginBtnText}>
                        {isLoading ? "Signing in…" : "Sign In"}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <View style={styles.hint}>
                    <Text style={styles.hintText}>
                      Test: 9000000001 / Test@1234
                    </Text>
                  </View>
                </View>
              )}
            </Formik>
          ) : (
            <Formik
              initialValues={{ mobile: "" }}
              validationSchema={borrowerSchema}
              onSubmit={handleSendOTP}
            >
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                values,
                errors,
                touched,
              }) => (
                <View style={styles.form}>
                  <Text style={styles.formTitle}>Villager Login</Text>
                  <Text style={styles.formSub}>
                    We'll send an OTP to your registered number
                  </Text>

                  <View style={styles.fieldGroup}>
                    <Text style={styles.label}>MOBILE NUMBER</Text>
                    <TextInput
                      value={values.mobile}
                      onChangeText={handleChange("mobile")}
                      onBlur={handleBlur("mobile")}
                      mode="outlined"
                      keyboardType="number-pad"
                      maxLength={10}
                      placeholder="10-digit mobile"
                      placeholderTextColor={C.textSub}
                      left={<TextInput.Icon icon="phone" color={C.primary} />}
                      error={touched.mobile && !!errors.mobile}
                      style={styles.input}
                      outlineColor={C.inputBorder}
                      activeOutlineColor={C.primary}
                      theme={{
                        colors: {
                          onSurfaceVariant: C.textSub,
                          background: C.inputBg,
                        },
                      }}
                      textColor={C.text}
                    />
                    {touched.mobile && errors.mobile && (
                      <Text style={styles.errorText}>{errors.mobile}</Text>
                    )}
                  </View>

                  <TouchableOpacity
                    onPress={() => handleSubmit()}
                    disabled={otpLoading}
                    activeOpacity={0.85}
                    style={[
                      styles.loginBtn,
                      otpLoading && styles.loginBtnDisabled,
                    ]}
                  >
                    <LinearGradient
                      colors={["#F0B429", "#D4980A"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.loginBtnGradient}
                    >
                      <Text style={styles.loginBtnText}>
                        {otpLoading ? "Sending OTP…" : "Send OTP"}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <View style={styles.hint}>
                    <Text style={styles.hintText}>
                      Test: 9000000002, 9000000003, 9000000004
                    </Text>
                  </View>
                </View>
              )}
            </Formik>
          )}
        </View>

        <Text style={styles.footer}>Temple Finance Management System v1.0</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  glowTop: {
    position: "absolute",
    top: -120,
    left: width / 2 - 150,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "#00C89612",
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
    justifyContent: "center",
    minHeight: "100%",
  },
  logoBlock: { alignItems: "center", paddingTop: 60, paddingBottom: 36 },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: C.primaryGlow,
    borderWidth: 1.5,
    borderColor: C.primary + "50",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  logoEmoji: { fontSize: 36 },
  appName: {
    fontSize: 28,
    fontWeight: "800",
    color: C.text,
    letterSpacing: -0.5,
  },
  appTagline: {
    fontSize: 12,
    color: C.textSub,
    marginTop: 6,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  card: {
    backgroundColor: C.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: C.cardBorder,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 20,
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: C.tab,
    margin: 16,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  tabText: { fontSize: 14, fontWeight: "600", color: C.textSub },
  tabTextActive: { color: C.primary },
  form: { paddingHorizontal: 20, paddingBottom: 28 },
  formTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: C.text,
    marginBottom: 4,
  },
  formSub: { fontSize: 13, color: C.textSub, marginBottom: 24 },
  fieldGroup: { marginBottom: 16 },
  label: {
    fontSize: 11,
    fontWeight: "700",
    color: C.textSub,
    letterSpacing: 1,
    marginBottom: 6,
  },
  input: { backgroundColor: C.inputBg },
  errorText: { fontSize: 12, color: C.error, marginTop: 4, marginLeft: 2 },
  loginBtn: {
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 8,
    shadowColor: "#00C896",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  loginBtnDisabled: { opacity: 0.6 },
  loginBtnGradient: {
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  loginBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  hint: {
    marginTop: 16,
    padding: 10,
    backgroundColor: C.primaryGlow,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.primary + "30",
    alignItems: "center",
  },
  hintText: { fontSize: 12, color: C.primary, fontFamily: "monospace" },
  footer: {
    textAlign: "center",
    color: C.textSub,
    fontSize: 11,
    marginTop: 28,
    letterSpacing: 0.3,
  },
});
