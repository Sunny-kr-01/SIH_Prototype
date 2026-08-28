import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Image, Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { getLanguageCode, translate } from "../../constants/translations";

const API_URL = "http://10.5.65.32:5000";
type Product = { _id?: string; title?: string; category?: string; description?: string; images?: string[]; pricing?: { suggestedPrice?: number; currency?: string }; translations?: { language?: string; title?: string; category?: string }[] };
const text = (item: unknown, fallback = "") => typeof item === "string" ? item.trim() : fallback;

export default function ArtisanProducts() {
  const { language } = useLocalSearchParams<{ language?: string }>();
  const selectedLanguage = getLanguageCode(language);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const loadProducts = useCallback(async () => {
    try { setLoading(true); setFailed(false); const response = await fetch(`${API_URL}/api/catalog/products`); const data = await response.json(); if (!response.ok) throw new Error(); setProducts(Array.isArray(data.products) ? data.products : []); }
    catch { setFailed(true); }
    finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { loadProducts(); }, [loadProducts]));

  const renderProduct = ({ item }: { item: Product }) => {
    const image = Array.isArray(item.images) ? text(item.images[0]) : "";
    const price = item.pricing?.suggestedPrice;
    const translation = item.translations?.find((entry) => getLanguageCode(entry.language) === selectedLanguage);
    return <Pressable style={({ pressed }) => [styles.card, pressed && styles.pressed]} onPress={() => router.push({ pathname: "/artisan/product", params: { product: JSON.stringify(item), language: selectedLanguage } })}>
      {image ? <Image source={{ uri: image }} style={styles.image} /> : <View style={styles.placeholder}><Text style={styles.placeholderText}>SIH</Text></View>}
      <View style={styles.body}><Text style={styles.title} numberOfLines={1}>{text(translation?.title, text(item.title, translate(selectedLanguage, "untitledProduct")))}</Text><Text style={styles.category}>{text(translation?.category, text(item.category, translate(selectedLanguage, "handcrafted")))}</Text><Text style={styles.price}>{typeof price === "number" ? `${text(item.pricing?.currency, "INR")} ${price}` : translate(selectedLanguage, "priceNotAvailable")}</Text><Text style={styles.status}>{translate(selectedLanguage, "active")}</Text></View>
    </Pressable>;
  };

  return <SafeAreaView style={styles.screen}><View style={styles.header}><Pressable onPress={() => router.back()}><Text style={styles.back}>‹ {translate(selectedLanguage, "back")}</Text></Pressable><Text style={styles.heading}>{translate(selectedLanguage, "myProducts")}</Text><Text style={styles.subtitle}>{translate(selectedLanguage, "myProductsDescription")}</Text></View>
    {loading ? <View style={styles.state}><ActivityIndicator size="large" color="#087F5B" /><Text style={styles.stateText}>{translate(selectedLanguage, "loadingProducts")}</Text></View> : failed ? <View style={styles.state}><Text style={styles.stateTitle}>{translate(selectedLanguage, "unableToLoad")}</Text><Pressable onPress={loadProducts} style={styles.retry}><Text style={styles.retryText}>{translate(selectedLanguage, "retry")}</Text></Pressable></View> : products.length === 0 ? <View style={styles.state}><Text style={styles.stateTitle}>{translate(selectedLanguage, "noProducts")}</Text><Text style={styles.stateText}>{translate(selectedLanguage, "productCreatedText")}</Text></View> : <FlatList data={products} keyExtractor={(item, index) => item._id || String(index)} renderItem={renderProduct} contentContainerStyle={styles.list} />}
  </SafeAreaView>;
}

const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: "#F7F5EF" }, header: { padding: 20, paddingBottom: 12 }, back: { color: "#087F5B", fontSize: 17, fontWeight: "700", paddingVertical: 8 }, heading: { color: "#173B35", fontSize: 30, fontWeight: "800", marginTop: 12 }, subtitle: { color: "#63706A", fontSize: 15, marginTop: 6 }, list: { gap: 14, padding: 20, paddingTop: 4 }, card: { backgroundColor: "#FFF", borderRadius: 14, flexDirection: "row", overflow: "hidden", elevation: 2 }, pressed: { opacity: 0.82 }, image: { backgroundColor: "#E7ECE5", height: 130, width: 115 }, placeholder: { alignItems: "center", backgroundColor: "#DDEBE2", height: 130, justifyContent: "center", width: 115 }, placeholderText: { color: "#087F5B", fontSize: 23, fontWeight: "800" }, body: { flex: 1, padding: 14 }, title: { color: "#173B35", fontSize: 18, fontWeight: "700" }, category: { color: "#087F5B", fontSize: 13, marginTop: 5 }, price: { color: "#B6532C", fontSize: 15, fontWeight: "700", marginTop: 12 }, status: { alignSelf: "flex-start", backgroundColor: "#E7F1EA", borderRadius: 8, color: "#087F5B", fontSize: 12, fontWeight: "700", marginTop: 8, overflow: "hidden", paddingHorizontal: 7, paddingVertical: 3 }, state: { alignItems: "center", flex: 1, justifyContent: "center", padding: 30 }, stateTitle: { color: "#173B35", fontSize: 19, fontWeight: "700", textAlign: "center" }, stateText: { color: "#69736E", fontSize: 15, marginTop: 10, textAlign: "center" }, retry: { backgroundColor: "#087F5B", borderRadius: 10, marginTop: 18, paddingHorizontal: 24, paddingVertical: 12 }, retryText: { color: "#FFF", fontSize: 16, fontWeight: "700" } });