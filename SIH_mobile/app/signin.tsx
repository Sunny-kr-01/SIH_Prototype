import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { getLanguageCode, translate } from "../constants/translations";

const DEMO_OTP = "123456";

export default function SignInScreen() {
  const { language, role } = useLocalSearchParams<{ language?: string; role?: string }>();
  const selectedLanguage = getLanguageCode(language);
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");

  const sendOtp = () => {
    if (!/^\d{10}$/.test(mobile)) {
      setError(translate(selectedLanguage, "invalidMobile"));
      return;
    }
    setError("");
    setOtpSent(true);
  };

  const verifyOtp = () => {
    if (otp !== DEMO_OTP) {
      setError(translate(selectedLanguage, "invalidOtp"));
      return;
    }
    router.replace({
      pathname: role === "artisan" ? "/artisan" : "/buyer",
      params: { language: selectedLanguage },
    });
  };

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <Text style={styles.brand}>SIH</Text>
          <Text style={styles.title}>{translate(selectedLanguage, "signIn")}</Text>
          <Text style={styles.subtitle}>{translate(selectedLanguage, "mobileNumber")}</Text>

          <TextInput
            value={mobile}
            onChangeText={(value) => {
              setMobile(value.replace(/\D/g, "").slice(0, 10));
              setError("");
            }}
            keyboardType="phone-pad"
            maxLength={10}
            placeholder="10-digit mobile number"
            placeholderTextColor="#8A8A84"
            style={styles.input}
            accessibilityLabel={translate(selectedLanguage, "mobileNumber")}
          />

          {!otpSent ? (
            <TouchableOpacity style={styles.primaryButton} onPress={sendOtp} activeOpacity={0.8}>
              <Text style={styles.primaryText}>{translate(selectedLanguage, "sendOtp")}</Text>
            </TouchableOpacity>
          ) : (
            <>
              <Text style={styles.sentText}>{translate(selectedLanguage, "demoOtpHint")}</Text>
              <TextInput
                value={otp}
                onChangeText={(value) => {
                  setOtp(value.replace(/\D/g, "").slice(0, 6));
                  setError("");
                }}
                keyboardType="number-pad"
                maxLength={6}
                placeholder={translate(selectedLanguage, "enterOtp")}
                placeholderTextColor="#8A8A84"
                style={styles.input}
                accessibilityLabel={translate(selectedLanguage, "enterOtp")}
              />
              <TouchableOpacity style={styles.primaryButton} onPress={verifyOtp} activeOpacity={0.8}>
                <Text style={styles.primaryText}>{translate(selectedLanguage, "verifyOtp")}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={sendOtp} style={styles.resendButton}>
                <Text style={styles.resendText}>{translate(selectedLanguage, "resendOtp")}</Text>
              </TouchableOpacity>
            </>
          )}

          {!!error && <Text style={styles.error}>{error}</Text>}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: "#F7F5EF", flex: 1 },
  keyboardView: { flex: 1 },
  content: { flex: 1, justifyContent: "center", padding: 24 },
  brand: { color: "#087F5B", fontSize: 28, fontWeight: "800", textAlign: "center" },
  title: { color: "#173B35", fontSize: 28, fontWeight: "800", marginTop: 18, textAlign: "center" },
  subtitle: { color: "#63706A", fontSize: 15, marginTop: 10, textAlign: "center" },
  input: { backgroundColor: "#FFFFFF", borderColor: "#D8DED8", borderRadius: 12, borderWidth: 1, color: "#173B35", fontSize: 17, marginTop: 22, paddingHorizontal: 15, paddingVertical: 14 },
  primaryButton: { alignItems: "center", backgroundColor: "#087F5B", borderRadius: 12, marginTop: 16, paddingVertical: 15 },
  primaryText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  sentText: { color: "#087F5B", fontSize: 14, marginTop: 18, textAlign: "center" },
  resendButton: { alignItems: "center", marginTop: 18, padding: 8 },
  resendText: { color: "#087F5B", fontSize: 15, fontWeight: "700" },
  error: { color: "#B13D2E", fontSize: 14, marginTop: 16, textAlign: "center" },
});