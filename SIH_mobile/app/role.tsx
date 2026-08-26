import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

export default function RoleScreen() {
  const { language } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>How will you use SIH?</Text>

      <Text style={styles.subtitle}>
        Choose an option to continue
      </Text>

      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          router.push({
            pathname: "/artisan",
            params: { language },
          })
        }
      >
        <Text style={styles.emoji}>🎨</Text>

        <View>
          <Text style={styles.cardTitle}>I'm an Artisan</Text>
          <Text style={styles.cardDescription}>
            Create and manage your products
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          router.push({
            pathname: "/buyer",
            params: { language },
          })
        }
      >
        <Text style={styles.emoji}>🛍️</Text>

        <View>
          <Text style={styles.cardTitle}>I'm a Buyer</Text>
          <Text style={styles.cardDescription}>
            Discover products from artisans
          </Text>
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