import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { getLanguageCode, translate } from "../constants/translations";

export default function RoleScreen() {
  const { language } = useLocalSearchParams();
  const selectedLanguage = getLanguageCode(language);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{translate(selectedLanguage, "howUseSIH")}</Text>

      <Text style={styles.subtitle}>{translate(selectedLanguage, "chooseOption")}</Text>

      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          router.push({
            pathname: "/artisan",
            params: { language: selectedLanguage },
          })
        }
      >
        <Text style={styles.emoji}>🎨</Text>

        <View>
          <Text style={styles.cardTitle}>{translate(selectedLanguage, "artisan")}</Text>
          <Text style={styles.cardDescription}>{translate(selectedLanguage, "artisanDescription")}</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          router.push({
            pathname: "/buyer",
            params: { language: selectedLanguage },
          })
        }
      >
        <Text style={styles.emoji}>🛍️</Text>

        <View>
          <Text style={styles.cardTitle}>{translate(selectedLanguage, "buyer")}</Text>
          <Text style={styles.cardDescription}>{translate(selectedLanguage, "buyerDescription")}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 24,
    paddingTop: 100,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
  },

  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 40,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D5D5D5",
    borderRadius: 16,
    padding: 22,
    marginBottom: 18,
  },

  emoji: {
    fontSize: 40,
    marginRight: 18,
  },

  cardTitle: {
    fontSize: 19,
    fontWeight: "700",
  },

  cardDescription: {
    color: "#666",
    marginTop: 5,
    fontSize: 14,
  },
});