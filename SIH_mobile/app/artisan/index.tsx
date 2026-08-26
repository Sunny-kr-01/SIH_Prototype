import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

const API_URL = "http://10.5.65.32:5000";

export default function ArtisanHome() {
    const { language } = useLocalSearchParams<{ language?: string }>();
    const isHindi = language === "hi";
    const [productCount, setProductCount] = useState<number | null>(null);

    useEffect(() => {
        fetch(`${API_URL}/api/catalog/products`)
            .then((response) => response.json())
            .then((data) => setProductCount(Array.isArray(data.products) ? data.products.length : 0))
            .catch(() => setProductCount(0));
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.greeting}>{isHindi ? "स्वागत है, कारीगर" : "Welcome, Artisan"}</Text>

            <Text style={styles.subtitle}>
                {isHindi ? "AI के साथ अपने उत्पाद बनाएं और संभालें।" : "Create and manage your products with AI."}
            </Text>

            <View style={styles.statsCard}>
                <Text style={styles.statsLabel}>{isHindi ? "कुल लिस्टिंग" : "Total listings"}</Text>
                {productCount === null ? <ActivityIndicator color="#087F5B" /> : <Text style={styles.statsValue}>{productCount}</Text>}
                <Text style={styles.activeText}>{isHindi ? "सभी लिस्टिंग सक्रिय हैं" : "All saved listings are Active"}</Text>
            </View>

            {/* CREATE PRODUCT */}
            <TouchableOpacity
                style={styles.card}
                onPress={() =>
                    router.push({
                        pathname: "/artisan/create-product",
                        params: { language },
                    })
                }
                activeOpacity={0.8}
            >
                <Text style={styles.icon}>📸</Text>

                <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{isHindi ? "उत्पाद बनाएं" : "Create Product"}</Text>

                    <Text style={styles.cardDescription}>
                        {isHindi ? "उत्पाद की तस्वीर डालें और आवाज़ में विवरण दें।" : "Upload an image and describe it using your voice."}
                    </Text>
                </View>
            </TouchableOpacity>

            {/* MY PRODUCTS */}
            <TouchableOpacity
                style={styles.card}
                onPress={() => router.push({ pathname: "/artisan/products", params: { language } })}
                activeOpacity={0.8}
            >
                <Text style={styles.icon}>📦</Text>

                <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{isHindi ? "मेरे उत्पाद" : "My Products"}</Text>

                    <Text style={styles.cardDescription}>
                        {isHindi ? "अपने उत्पाद लिस्टिंग देखें।" : "View your saved product listings."}
                    </Text>
                </View>
            </TouchableOpacity>

            <Text style={styles.language}>
                {isHindi ? "चयनित भाषा: हिन्दी" : `Selected language: ${language || "English"}`}
            </Text>
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