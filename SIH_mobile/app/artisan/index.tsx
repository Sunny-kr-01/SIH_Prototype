import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { getLanguageCode, getLanguageName, translate } from "../../constants/translations";

const API_URL = "http://10.5.65.32:5000";

export default function ArtisanHome() {
    const { language } = useLocalSearchParams<{ language?: string }>();
    const selectedLanguage = getLanguageCode(language);
    const [productCount, setProductCount] = useState<number | null>(null);

    useEffect(() => {
        fetch(`${API_URL}/api/catalog/products`)
            .then((response) => response.json())
            .then((data) => setProductCount(Array.isArray(data.products) ? data.products.length : 0))
            .catch(() => setProductCount(0));
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.greeting}>{translate(selectedLanguage, "welcomeArtisan")}</Text>

            <Text style={styles.subtitle}>{translate(selectedLanguage, "artisanHomeSubtitle")}</Text>

            <View style={styles.statsCard}>
                <Text style={styles.statsLabel}>{translate(selectedLanguage, "totalListings")}</Text>
                {productCount === null ? <ActivityIndicator color="#087F5B" /> : <Text style={styles.statsValue}>{productCount}</Text>}
                <Text style={styles.activeText}>{translate(selectedLanguage, "allActive")}</Text>
            </View>

            <TouchableOpacity
                style={styles.card}
                onPress={() =>
                    router.push({
                        pathname: "/artisan/create-product",
                        params: { language: selectedLanguage },
                    })
                }
                activeOpacity={0.8}
            >
                <Text style={styles.icon}>📸</Text>

                <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{translate(selectedLanguage, "createProduct")}</Text>

                    <Text style={styles.cardDescription}>{translate(selectedLanguage, "createProductDescription")}</Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.card}
                onPress={() => router.push({ pathname: "/artisan/products", params: { language: selectedLanguage } })}
                activeOpacity={0.8}
            >
                <Text style={styles.icon}>📦</Text>

                <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{translate(selectedLanguage, "myProducts")}</Text>

                    <Text style={styles.cardDescription}>{translate(selectedLanguage, "myProductsDescription")}</Text>
                </View>
            </TouchableOpacity>

            <Text style={styles.language}>{translate(selectedLanguage, "selectedLanguage").replace("{language}", getLanguageName(selectedLanguage))}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        padding: 24,
        paddingTop: 70,
    },

    greeting: {
        fontSize: 28,
        fontWeight: "700",
    },

    subtitle: {
        fontSize: 16,
        color: "#666666",
        marginTop: 8,
        marginBottom: 35,
    },

    statsCard: {
        backgroundColor: "#E7F1EA",
        borderRadius: 16,
        padding: 18,
        marginBottom: 24,
    },

    statsLabel: { color: "#46645A", fontSize: 14, fontWeight: "600" },

    statsValue: { color: "#173B35", fontSize: 34, fontWeight: "800", marginTop: 4 },

    activeText: { color: "#087F5B", fontSize: 13, marginTop: 2 },

    card: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#DDDDDD",
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
    },

    icon: {
        fontSize: 34,
        marginRight: 18,
    },

    cardContent: {
        flex: 1,
    },

    cardTitle: {
        fontSize: 18,
        fontWeight: "700",
    },

    cardDescription: {
        fontSize: 14,
        color: "#666666",
        marginTop: 5,
        lineHeight: 20,
    },

    language: {
        marginTop: 20,
        color: "#888888",
        fontSize: 13,
        textAlign: "center",
    },
});