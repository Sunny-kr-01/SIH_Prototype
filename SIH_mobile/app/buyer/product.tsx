import { useState } from "react";
import { Image, Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { getLanguageCode, getNativeLanguageName, translate } from "../../constants/translations";

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
  const selectedLanguage = getLanguageCode(params.language);
  let product: Product = {};
  try { product = params.product ? JSON.parse(params.product) : {}; } catch { product = {}; }
  const [imageFailed, setImageFailed] = useState(false);
  const [galleryVisible, setGalleryVisible] = useState(false);
  const images = Array.isArray(product.images) ? product.images.map(value).filter(Boolean) : [];
  const imageUri = !imageFailed && Array.isArray(product.images) ? value(product.images[0]) : "";
  const translation = product.translations?.find((item) => getLanguageCode(item.language) === selectedLanguage) ?? product.translations?.find((item) => getLanguageCode(item.language) === "en");
  const title = value(translation?.title) || value(product.title) || translate(selectedLanguage, "product");
  const description = value(translation?.description) || value(product.description);
  const availableDescriptions = product.translations?.filter((item) => value(item.description)) || [];
  const [descriptionLanguage, setDescriptionLanguage] = useState<string>(
    availableDescriptions.find((item) => getLanguageCode(item.language) === selectedLanguage)?.language || availableDescriptions[0]?.language || selectedLanguage
  );
  const selectedDescription = availableDescriptions.find((item) => getLanguageCode(item.language) === getLanguageCode(descriptionLanguage))?.description || description;
  const price = product.pricing?.suggestedPrice;
  const materials = product.materials?.map((item) => value(item.name)).filter(Boolean).join(", ");
  const artisan = [value(product.artisan?.name), value(product.artisan?.location)].filter(Boolean).join(" | ");

  return <SafeAreaView style={styles.screen}>
    <ScrollView contentContainerStyle={styles.content}>
      <Pressable onPress={() => router.back()} style={styles.back}><Text style={styles.backText}>‹ {translate(selectedLanguage, "back")}</Text></Pressable>
      {imageUri ? <Pressable onPress={() => setGalleryVisible(true)} accessibilityLabel={translate(selectedLanguage, "viewPhotos")}><Image source={{ uri: imageUri }} onError={() => setImageFailed(true)} style={styles.image} /></Pressable> : <View style={styles.placeholder}><Text style={styles.placeholderText}>SIH</Text></View>}
      <Text style={styles.title}>{title}</Text>
      {value(product.category) ? <Text style={styles.category}>{product.category}</Text> : null}
      {typeof price === "number" ? <Text style={styles.price}>{value(product.pricing?.currency) || "INR"} {price}</Text> : null}
      {description ? <View style={styles.section}>
        <View style={styles.languageTabs}>
          {availableDescriptions.map((item) => (
            <Pressable key={item.language} onPress={() => setDescriptionLanguage(item.language || selectedLanguage)} style={[styles.languageTab, getLanguageCode(descriptionLanguage) === getLanguageCode(item.language) && styles.languageTabActive]}>
              <Text style={[styles.languageTabText, getLanguageCode(descriptionLanguage) === getLanguageCode(item.language) && styles.languageTabTextActive]}>{getNativeLanguageName(item.language)}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.body}>{selectedDescription}</Text>
      </View> : null}
      {materials ? <Section title={translate(selectedLanguage, "materials")} text={materials} /> : null}
      {artisan ? <Section title={translate(selectedLanguage, "artisanLabel")} text={artisan} /> : null}
      {value(product.originalLanguage) ? <Section title={translate(selectedLanguage, "originalLanguage")} text={value(product.originalLanguage)} /> : null}
    </ScrollView>
    <Modal visible={galleryVisible} animationType="slide" onRequestClose={() => setGalleryVisible(false)}>
      <SafeAreaView style={styles.galleryScreen}>
        <View style={styles.galleryHeader}><Text style={styles.galleryTitle}>{translate(selectedLanguage, "viewPhotos")}</Text><Pressable onPress={() => setGalleryVisible(false)}><Text style={styles.closeText}>{translate(selectedLanguage, "close")}</Text></Pressable></View>
        <ScrollView contentContainerStyle={styles.galleryList}>{images.map((uri, index) => <Image key={`${uri}-${index}`} source={{ uri }} style={styles.galleryImage} />)}</ScrollView>
      </SafeAreaView>
    </Modal>
  </SafeAreaView>;
}

function Section({ title, text }: { title: string; text: string }) { return <View style={styles.section}><Text style={styles.sectionTitle}>{title}</Text><Text style={styles.body}>{text}</Text></View>; }

const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: "#F7F5EF" }, content: { padding: 20, paddingBottom: 40 }, back: { paddingVertical: 8 }, backText: { color: "#087F5B", fontSize: 17, fontWeight: "700" }, image: { backgroundColor: "#E7ECE5", borderRadius: 16, height: 280, marginTop: 10, width: "100%" }, placeholder: { alignItems: "center", backgroundColor: "#DDEBE2", borderRadius: 16, height: 280, justifyContent: "center", marginTop: 10, width: "100%" }, placeholderText: { color: "#087F5B", fontSize: 40, fontWeight: "800" }, title: { color: "#173B35", fontSize: 29, fontWeight: "800", marginTop: 20 }, category: { color: "#087F5B", fontSize: 16, fontWeight: "600", marginTop: 6 }, price: { color: "#B6532C", fontSize: 19, fontWeight: "700", marginTop: 12 }, section: { borderTopColor: "#D8DED8", borderTopWidth: 1, marginTop: 24, paddingTop: 16 }, sectionTitle: { color: "#173B35", fontSize: 17, fontWeight: "700" }, body: { color: "#59655F", fontSize: 16, lineHeight: 24, marginTop: 7 }, languageTabs: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 }, languageTab: { borderColor: "#D8DED8", borderRadius: 8, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 7 }, languageTabActive: { backgroundColor: "#087F5B", borderColor: "#087F5B" }, languageTabText: { color: "#59655F", fontSize: 13, fontWeight: "600" }, languageTabTextActive: { color: "#FFFFFF" }, galleryScreen: { backgroundColor: "#F7F5EF", flex: 1 }, galleryHeader: { alignItems: "center", borderBottomColor: "#D8DED8", borderBottomWidth: 1, flexDirection: "row", justifyContent: "space-between", padding: 20 }, galleryTitle: { color: "#173B35", fontSize: 20, fontWeight: "800" }, closeText: { color: "#087F5B", fontSize: 16, fontWeight: "700" }, galleryList: { gap: 16, padding: 20 }, galleryImage: { backgroundColor: "#E7ECE5", borderRadius: 12, height: 300, width: "100%" } });