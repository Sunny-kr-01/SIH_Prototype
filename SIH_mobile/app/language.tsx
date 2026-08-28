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
import { SUPPORTED_LANGUAGES, translate } from "../constants/translations";

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
      <View style={styles.content}>
        <Text style={styles.progress}>2 of 4</Text>
        <Text style={styles.title}>{translate(selectedLanguage, "chooseLanguage")}</Text>
        <Text style={styles.subtitle}>{translate(selectedLanguage, "chooseLanguageSubtitle")}</Text>
        <ScrollView style={styles.languageScroll} contentContainerStyle={styles.languageList} showsVerticalScrollIndicator={false}>
          {SUPPORTED_LANGUAGES.map((language) => {
            const selected = selectedLanguage === language.code;
            return <TouchableOpacity key={language.code} style={[styles.languageCard, selected && styles.selectedLanguage]} onPress={() => setSelectedLanguage(language.code)} activeOpacity={0.8}>
              <Text style={styles.flag}>🇮🇳</Text>
              <Text style={[styles.languageText, selected && styles.selectedLanguageText]}>{language.native}</Text>
              <Text style={styles.englishText}>{language.english}</Text>
              {selected && <Text style={styles.check}>✓</Text>}
            </TouchableOpacity>;
          })}
        </ScrollView>
      </View>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.continueButton} onPress={continueToRole} activeOpacity={0.8}>
          <Text style={styles.continueText}>{translate(selectedLanguage, "continue")} →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FBFAF7" },
  content: { flex: 1, paddingHorizontal: 32, paddingTop: 18 },
  progress: { color: "#087F5B", fontSize: 15, fontWeight: "700", textAlign: "center", marginBottom: 28 },
  title: { color: "#173B35", fontSize: 28, fontWeight: "800", textAlign: "center" },
  subtitle: { color: "#7A817E", fontSize: 15, textAlign: "center", marginTop: 10, marginBottom: 26, lineHeight: 22 },
  languageScroll: { width: "100%" },
  languageList: { width: "100%", flexDirection: "row", flexWrap: "wrap", columnGap: 18, rowGap: 18, paddingBottom: 24 },
  languageCard: { width: "46%", minHeight: 164, borderWidth: 1.5, borderColor: "#E0E1DE", borderRadius: 22, padding: 20, backgroundColor: "#FFFFFF", shadowColor: "#173B35", shadowOpacity: 0.08, shadowRadius: 5, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  selectedLanguage: { borderColor: "#087F5B", backgroundColor: "#E8F5F1" },
  flag: { fontSize: 30 },
  languageText: { color: "#101D1A", fontSize: 22, fontWeight: "800", marginTop: 10 },
  selectedLanguageText: { color: "#087F5B" },
  englishText: { color: "#7A817E", fontSize: 16, marginTop: 6 },
  check: { color: "#FFFFFF", backgroundColor: "#087F5B", borderRadius: 20, fontSize: 20, fontWeight: "800", padding: 7, position: "absolute", right: 14, top: 14 },
  footer: { borderTopWidth: 1, borderTopColor: "#E2E4E1", paddingHorizontal: 32, paddingVertical: 18, backgroundColor: "#FFFFFF" },
  continueButton: { width: "100%", backgroundColor: "#087F5B", borderRadius: 20, paddingVertical: 17, alignItems: "center" },
  continueText: { color: "#FFFFFF", fontSize: 17, fontWeight: "700" },
});