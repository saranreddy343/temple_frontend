import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  TextInput as RNTextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  Alert,
} from "react-native";
import { Text } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { AppDispatch, RootState } from "../../store";
import { verifyOTP } from "../../store/slices/authSlice";
import { authAPI } from "../../api/auth.api";
import { AuthStackParamList } from "../../types";

const { width } = Dimensions.get("window");

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, "OTPVerification">;
  route: RouteProp<AuthStackParamList, "OTPVerification">;
};

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

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
  boxDefault: "#1A2540",
  boxActive: "#00C89625",
  boxFilled: "#00C89618",
  error: "#FF6B6B",
};

export default function OTPVerificationScreen({ navigation, route }: Props) {
  const { mobile, devOtp: routeDevOtp } = route.params;
  const [otp, setOtp] = useState<string[]>(new Array(OTP_LENGTH).fill(""));
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
  const [resending, setResending] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(routeDevOtp ?? null);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputs = useRef<(RNTextInput | null)[]>([]);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading } = useSelector((state: RootState) => state.auth);

  // devOtp comes from route params — no separate API call needed

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 6,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -6,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text.replace(/[^0-9]/g, "").slice(-1);
    setOtp(newOtp);
    if (text && index < OTP_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
      setActiveIndex(index + 1);
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
      setActiveIndex(index - 1);
      const newOtp = [...otp];
      newOtp[index - 1] = "";
      setOtp(newOtp);
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join("");
    if (otpString.length < OTP_LENGTH) {
      shake();
      return;
    }
    const result = await dispatch(verifyOTP({ mobile, otp: otpString }));
    if (verifyOTP.rejected.match(result)) {
      shake();
      setOtp(new Array(OTP_LENGTH).fill(""));
      inputs.current[0]?.focus();
      setActiveIndex(0);
      Alert.alert("Invalid OTP", result.payload as string);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setResending(true);
    try {
      const res = await authAPI.sendOTP({ mobile });
      const data = res.data.data;
      setCountdown(RESEND_COOLDOWN);
      setOtp(new Array(OTP_LENGTH).fill(""));
      setDevOtp(data?.devOtp ?? null);
    } catch {
      Alert.alert("Error", "Failed to resend OTP");
    } finally {
      setResending(false);
    }
  };

  const maskedMobile = `+91 XXXXXX${mobile.slice(-4)}`;
  const otpFilled = otp.join("").length === OTP_LENGTH;
  const progress = otp.filter(Boolean).length;

  const autoFillOtp = () => {
    if (!devOtp) return;
    const filled = devOtp.slice(0, OTP_LENGTH).split("");
    while (filled.length < OTP_LENGTH) filled.push("");
    setOtp(filled);
    setActiveIndex(OTP_LENGTH - 1);
    inputs.current[OTP_LENGTH - 1]?.focus();
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
      <View style={styles.glowTop} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <MaterialCommunityIcons name="arrow-left" size={22} color={C.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        {/* Icon */}
        <View style={styles.iconWrap}>
          <LinearGradient
            colors={["#00C89630", "#00C89610"]}
            style={styles.iconCircle}
          >
            <MaterialCommunityIcons
              name="shield-check"
              size={40}
              color={C.primary}
            />
          </LinearGradient>
        </View>

        <Text style={styles.title}>Verify OTP</Text>
        <Text style={styles.subtitle}>
          Code sent to <Text style={styles.mobileBold}>{maskedMobile}</Text>
        </Text>

        {/* OTP Boxes */}
        <Animated.View
          style={[styles.otpRow, { transform: [{ translateX: shakeAnim }] }]}
        >
          {otp.map((digit, index) => (
            <RNTextInput
              key={index}
              ref={(ref) => {
                inputs.current[index] = ref;
              }}
              style={[
                styles.otpBox,
                activeIndex === index && styles.otpBoxActive,
                digit ? styles.otpBoxFilled : {},
              ]}
              value={digit}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={({ nativeEvent }) =>
                handleKeyPress(nativeEvent.key, index)
              }
              onFocus={() => setActiveIndex(index)}
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
              selectTextOnFocus
              caretHidden
            />
          ))}
        </Animated.View>

        {/* Progress dots */}
        <View style={styles.progressRow}>
          {Array.from({ length: OTP_LENGTH }).map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i < progress && styles.dotFilled]}
            />
          ))}
        </View>

        {/* Development Mode card — auto-fills OTP on tap, only visible in dev builds */}
        {__DEV__ && devOtp ? (
          <TouchableOpacity
            style={styles.devCard}
            onPress={autoFillOtp}
            activeOpacity={0.8}
          >
            <View style={styles.devCardHeader}>
              <MaterialCommunityIcons
                name="bug-outline"
                size={12}
                color={C.gold}
              />
              <Text style={styles.devCardLabel}>DEVELOPMENT MODE</Text>
            </View>
            <View style={styles.devCardBody}>
              <Text style={styles.devCardOtp}>{devOtp}</Text>
              <View style={styles.devCardFillBtn}>
                <Text style={styles.devCardFillBtnText}>Tap to fill</Text>
              </View>
            </View>
          </TouchableOpacity>
        ) : null}

        {/* Verify button */}
        <TouchableOpacity
          onPress={handleVerify}
          disabled={isLoading || !otpFilled}
          activeOpacity={0.85}
          style={[
            styles.verifyBtn,
            (!otpFilled || isLoading) && styles.verifyBtnDisabled,
          ]}
        >
          <LinearGradient
            colors={otpFilled ? ["#00C896", "#00A87C"] : ["#1A2540", "#1A2540"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.verifyBtnGradient}
          >
            <MaterialCommunityIcons
              name="shield-check-outline"
              size={18}
              color={otpFilled ? "#fff" : C.textSub}
              style={{ marginRight: 8 }}
            />
            <Text
              style={[styles.verifyBtnText, !otpFilled && { color: C.textSub }]}
            >
              {isLoading ? "Verifying…" : "Verify & Login"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Resend */}
        <View style={styles.resendRow}>
          {countdown > 0 ? (
            <Text style={styles.resendCountdown}>
              Resend OTP in <Text style={styles.resendTimer}>{countdown}s</Text>
            </Text>
          ) : (
            <TouchableOpacity onPress={handleResend} disabled={resending}>
              <Text style={styles.resendLink}>
                {resending ? "Sending…" : "Resend OTP"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  glowTop: {
    position: "absolute",
    top: -80,
    left: width / 2 - 120,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "#00C89610",
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 56 : 36,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.cardBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 28,
    paddingTop: 20,
  },
  iconWrap: { marginBottom: 20 },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: C.primary + "40",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: C.text,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: C.textSub,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  mobileBold: { color: C.text, fontWeight: "700" },
  devCard: {
    width: "100%",
    backgroundColor: "#F0B42910",
    borderWidth: 1,
    borderColor: "#F0B42945",
    borderRadius: 14,
    padding: 14,
    marginTop: 4,
    marginBottom: 16,
  },
  devCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 10,
  },
  devCardLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: C.gold,
    letterSpacing: 1.5,
  },
  devCardBody: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  devCardOtp: {
    fontSize: 28,
    fontWeight: "900",
    color: C.gold,
    letterSpacing: 8,
  },
  devCardFillBtn: {
    backgroundColor: "#F0B42922",
    borderWidth: 1,
    borderColor: "#F0B42955",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  devCardFillBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: C.gold,
  },
  otpRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
    marginTop: 8,
  },
  otpBox: {
    width: 48,
    height: 58,
    borderWidth: 2,
    borderColor: C.boxDefault,
    borderRadius: 14,
    fontSize: 22,
    fontWeight: "800",
    color: C.text,
    backgroundColor: C.boxDefault,
  },
  otpBoxActive: {
    borderColor: C.primary,
    backgroundColor: C.boxActive,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  otpBoxFilled: {
    borderColor: C.primary,
    backgroundColor: C.boxFilled,
  },
  progressRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 32,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.boxDefault,
  },
  dotFilled: { backgroundColor: C.primary },
  verifyBtn: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 24,
  },
  verifyBtnDisabled: { shadowOpacity: 0, elevation: 0 },
  verifyBtnGradient: {
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  verifyBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  resendRow: { alignItems: "center" },
  resendCountdown: { fontSize: 14, color: C.textSub },
  resendTimer: { color: C.primary, fontWeight: "700" },
  resendLink: { fontSize: 14, color: C.primary, fontWeight: "700" },
});
