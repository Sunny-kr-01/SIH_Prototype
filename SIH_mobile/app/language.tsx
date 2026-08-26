import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { router } from "expo-router";

const languages = [
  { name: "English", code: "en" },
  { name: "हिन्दी", code: "hi" },
  { name: "বাংলা", code: "bn" },
  { name: "मराठी", code: "mr" },
  { name: "தமிழ்", code: "ta" },
  { name: "తెలుగు", code: "te" },
  { name: "ಕನ್ನಡ", code: "kn" },
  { name: "ଓଡ଼ିଆ", code: "or" },
];

export default function LanguageScreen() {
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  const continueToRole = () => {
    router.push({
      pathname: "/role",
      params: {
        language: selectedLanguage,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.logo}>SIH</Text>

        <Text style={styles.title}>
          Choose your language
        </Text>

        <Text style={styles.subtitle}>
          Select the language you are most comfortable with.
        </Text>

        <View style={styles.languageList}>
          {languages.map((language) => (
            <TouchableOpacity
              key={language.code}
              style={[
                styles.languageButton,
                selectedLanguage === language.code &&
                  styles.selectedLanguage,
              ]}
              onPress={() =>
                setSelectedLanguage(language.code)
              }
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.languageText,
                  selectedLanguage === language.code &&
                    styles.selectedLanguageText,
                ]}
              >
                {language.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={continueToRole}
          activeOpacity={0.8}
        >
          <Text style={styles.continueText}>
            Continue
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  content: {
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 30,
  },

  logo: {
    fontSize: 32,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 35,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
  },

  subtitle: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 30,
    lineHeight: 22,
  },

  languageList: {
    gap: 12,
  },

  languageButton: {
    borderWidth: 1,
    borderColor: "#D0D0D0",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },

  selectedLanguage: {
    borderColor: "#007A5E",
    backgroundColor: "#E8F5F1",
  },

  languageText: {
    fontSize: 17,
    fontWeight: "500",
  },

  selectedLanguageText: {
    color: "#007A5E",
    fontWeight: "700",
  },

  continueButton: {
    marginTop: 30,
    backgroundColor: "#007A5E",
    borderRadius: 12,
    paddingVertical: 17,
    alignItems: "center",
  },

  continueText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
});