import { useState } from "react";
import { Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

type Product = {
  title?: string; description?: string; category?: string; images?: string[];
  originalLanguage?: string; materials?: { name?: string; quantity?: string }[];
  artisan?: { name?: string; location?: string };
  pricing?: { suggestedPrice?: number; currency?: string };
  translations?: { language?: string; title?: string; description?: string }[];
};

const value = (item: unknown) => typeof item === "string" ? item.trim() : "";

export default function ProductDetails() {
  const params = useLocalSearchParams<{ product?: string; language?: string }>();
  let product: Product = {};
  try { product = params.product ? JSON.parse(params.product) : {}; } catch { product = {}; }
  const [imageFailed, setImageFailed] = useState(false);
  const isHindi = params.language === "hi";
  const imageUri = !imageFailed && Array.isArray(product.images) ? value(product.images[0]) : "";
  const translation = product.translations?.find((item) => item.language === (isHindi ? "hi" : "en"));
  const title = value(translation?.title) || value(product.title) || (isHindi ? "उत्पाद" : "Product");
  const description = value(translation?.description) || value(product.description);
  const price = product.pricing?.suggestedPrice;
  const materials = product.materials?.map((item) => value(item.name)).filter(Boolean).join(", ");
  const artisan = [value(product.artisan?.name), value(product.artisan?.location)].filter(Boolean).join(" | ");

  return <SafeAreaView style={styles.screen}>
    <ScrollView contentContainerStyle={styles.content}>
      <Pressable onPress={() => router.back()} style={styles.back}><Text style={styles.backText}>‹ {isHindi ? "वापस" : "Back"}</Text></Pressable>
      {imageUri ? <Image source={{ uri: imageUri }} onError={() => setImageFailed(true)} style={styles.image} /> : <View style={styles.placeholder}><Text style={styles.placeholderText}>SIH</Text></View>}
      <Text style={styles.title}>{title}</Text>
      {value(product.category) ? <Text style={styles.category}>{product.category}</Text> : null}
      {typeof price === "number" ? <Text style={styles.price}>{value(product.pricing?.currency) || "INR"} {price}</Text> : null}
      {description ? <Section title={isHindi ? "विवरण" : "Description"} text={description} /> : null}
      {materials ? <Section title={isHindi ? "सामग्री" : "Materials"} text={materials} /> : null}
      {artisan ? <Section title={isHindi ? "कारीगर" : "Artisan"} text={artisan} /> : null}
      {value(product.originalLanguage) ? <Section title={isHindi ? "मूल भाषा" : "Original language"} text={value(product.originalLanguage)} /> : null}
    </ScrollView>
  </SafeAreaView>;
}

function Section({ title, text }: { title: string; text: string }) { return <View style={styles.section}><Text style={styles.sectionTitle}>{title}</Text><Text style={styles.body}>{text}</Text></View>; }

const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: "#F7F5EF" }, content: { padding: 20, paddingBottom: 40 }, back: { paddingVertical: 8 }, backText: { color: "#087F5B", fontSize: 17, fontWeight: "700" }, image: { backgroundColor: "#E7ECE5", borderRadius: 16, height: 280, marginTop: 10, width: "100%" }, placeholder: { alignItems: "center", backgroundColor: "#DDEBE2", borderRadius: 16, height: 280, justifyContent: "center", marginTop: 10, width: "100%" }, placeholderText: { color: "#087F5B", fontSize: 40, fontWeight: "800" }, title: { color: "#173B35", fontSize: 29, fontWeight: "800", marginTop: 20 }, category: { color: "#087F5B", fontSize: 16, fontWeight: "600", marginTop: 6 }, price: { color: "#B6532C", fontSize: 19, fontWeight: "700", marginTop: 12 }, section: { borderTopColor: "#D8DED8", borderTopWidth: 1, marginTop: 24, paddingTop: 16 }, sectionTitle: { color: "#173B35", fontSize: 17, fontWeight: "700" }, body: { color: "#59655F", fontSize: 16, lineHeight: 24, marginTop: 7 } });