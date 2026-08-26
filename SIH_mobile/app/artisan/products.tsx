import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Image, Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";

const API_URL = "http://10.5.65.32:5000";
type Product = { _id?: string; title?: string; category?: string; description?: string; images?: string[]; pricing?: { suggestedPrice?: number; currency?: string } };
const text = (item: unknown, fallback = "") => typeof item === "string" ? item.trim() : fallback;

export default function ArtisanProducts() {
  const { language } = useLocalSearchParams<{ language?: string }>();
  const isHindi = language === "hi";
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
    return <Pressable style={({ pressed }) => [styles.card, pressed && styles.pressed]} onPress={() => router.push({ pathname: "/artisan/product", params: { product: JSON.stringify(item), language: language || "en" } })}>
      {image ? <Image source={{ uri: image }} style={styles.image} /> : <View style={styles.placeholder}><Text style={styles.placeholderText}>SIH</Text></View>}
      <View style={styles.body}><Text style={styles.title} numberOfLines={1}>{text(item.title, isHindi ? "उत्पाद" : "Untitled product")}</Text><Text style={styles.category}>{text(item.category, isHindi ? "शिल्प" : "Handcrafted")}</Text><Text style={styles.price}>{typeof price === "number" ? `${text(item.pricing?.currency, "INR")} ${price}` : (isHindi ? "कीमत उपलब्ध नहीं" : "Price not available")}</Text><Text style={styles.status}>{isHindi ? "सक्रिय" : "Active"}</Text></View>
    </Pressable>;
  };

  return <SafeAreaView style={styles.screen}><View style={styles.header}><Pressable onPress={() => router.back()}><Text style={styles.back}>‹ {isHindi ? "वापस" : "Back"}</Text></Pressable><Text style={styles.heading}>{isHindi ? "मेरे उत्पाद" : "My Products"}</Text><Text style={styles.subtitle}>{isHindi ? "आपकी सभी सहेजी गई लिस्टिंग" : "Your saved product listings"}</Text></View>
    {loading ? <View style={styles.state}><ActivityIndicator size="large" color="#087F5B" /><Text style={styles.stateText}>{isHindi ? "उत्पाद लोड हो रहे हैं..." : "Loading products..."}</Text></View> : failed ? <View style={styles.state}><Text style={styles.stateTitle}>{isHindi ? "उत्पाद लोड नहीं हो सके" : "Unable to load products"}</Text><Pressable onPress={loadProducts} style={styles.retry}><Text style={styles.retryText}>{isHindi ? "फिर कोशिश करें" : "Retry"}</Text></Pressable></View> : products.length === 0 ? <View style={styles.state}><Text style={styles.stateTitle}>{isHindi ? "अभी कोई उत्पाद नहीं" : "No products yet"}</Text><Text style={styles.stateText}>{isHindi ? "नई लिस्टिंग बनाने के लिए डैशबोर्ड पर जाएं।" : "Create a new listing from the dashboard."}</Text></View> : <FlatList data={products} keyExtractor={(item, index) => item._id || String(index)} renderItem={renderProduct} contentContainerStyle={styles.list} />}
  </SafeAreaView>;
}

const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: "#F7F5EF" }, header: { padding: 20, paddingBottom: 12 }, back: { color: "#087F5B", fontSize: 17, fontWeight: "700", paddingVertical: 8 }, heading: { color: "#173B35", fontSize: 30, fontWeight: "800", marginTop: 12 }, subtitle: { color: "#63706A", fontSize: 15, marginTop: 6 }, list: { gap: 14, padding: 20, paddingTop: 4 }, card: { backgroundColor: "#FFF", borderRadius: 14, flexDirection: "row", overflow: "hidden", elevation: 2 }, pressed: { opacity: 0.82 }, image: { backgroundColor: "#E7ECE5", height: 130, width: 115 }, placeholder: { alignItems: "center", backgroundColor: "#DDEBE2", height: 130, justifyContent: "center", width: 115 }, placeholderText: { color: "#087F5B", fontSize: 23, fontWeight: "800" }, body: { flex: 1, padding: 14 }, title: { color: "#173B35", fontSize: 18, fontWeight: "700" }, category: { color: "#087F5B", fontSize: 13, marginTop: 5 }, price: { color: "#B6532C", fontSize: 15, fontWeight: "700", marginTop: 12 }, status: { alignSelf: "flex-start", backgroundColor: "#E7F1EA", borderRadius: 8, color: "#087F5B", fontSize: 12, fontWeight: "700", marginTop: 8, overflow: "hidden", paddingHorizontal: 7, paddingVertical: 3 }, state: { alignItems: "center", flex: 1, justifyContent: "center", padding: 30 }, stateTitle: { color: "#173B35", fontSize: 19, fontWeight: "700", textAlign: "center" }, stateText: { color: "#69736E", fontSize: 15, marginTop: 10, textAlign: "center" }, retry: { backgroundColor: "#087F5B", borderRadius: 10, marginTop: 18, paddingHorizontal: 24, paddingVertical: 12 }, retryText: { color: "#FFF", fontSize: 16, fontWeight: "700" } });