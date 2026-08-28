import { useState } from "react";
import { Image, Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { getLanguageCode, getNativeLanguageName, translate } from "../../constants/translations";

type Product = {
  title?: string; description?: string; category?: string; craft?: string; images?: string[];
  originalLanguage?: string; materials?: { name?: string; quantity?: string }[];
  artisan?: { name?: string; location?: string };
  pricing?: { suggestedPrice?: number; currency?: string; bulkPricing?: { "10-24"?: number; "25-49"?: number; "50+"?: number } };
  translations?: { language?: string; title?: string; description?: string; category?: string; material?: string; craft?: string }[];
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
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const imageUri = !imageFailed ? images[selectedImageIndex] || images[0] || "" : "";
  const translation = product.translations?.find((item) => getLanguageCode(item.language) === selectedLanguage) ?? product.translations?.find((item) => getLanguageCode(item.language) === "en");
  const title = value(translation?.title) || value(product.title) || translate(selectedLanguage, "product");
  const description = value(translation?.description) || value(product.description);
  const availableDescriptions = product.translations?.filter((item) => value(item.description)) || [];
  const [descriptionLanguage, setDescriptionLanguage] = useState<string>(
    availableDescriptions.find((item) => getLanguageCode(item.language) === selectedLanguage)?.language || availableDescriptions[0]?.language || selectedLanguage
  );
  const selectedDescription = availableDescriptions.find((item) => getLanguageCode(item.language) === getLanguageCode(descriptionLanguage))?.description || description;
  const contentLanguage = getLanguageCode(descriptionLanguage);
  const price = product.pricing?.suggestedPrice;
  const materials = value(translation?.material) || product.materials?.map((item) => value(item.name)).filter(Boolean).join(", ");
  const artisan = [value(product.artisan?.name), value(product.artisan?.location)].filter(Boolean).join(" | ");

  return <SafeAreaView style={styles.screen}>
    <ScrollView contentContainerStyle={styles.content}>
      <Pressable onPress={() => router.back()} style={styles.back}><Text style={styles.backText}>‹ {translate(selectedLanguage, "back")}</Text></Pressable>
      <View style={styles.galleryCard}>
        {imageUri ? <Pressable onPress={() => setGalleryVisible(true)} accessibilityLabel={translate(selectedLanguage, "viewPhotos")}><Image source={{ uri: imageUri }} onError={() => setImageFailed(true)} style={styles.image} /></Pressable> : <View style={[styles.image, styles.placeholder]}><Text style={styles.placeholderText}>SIH</Text></View>}
        {images.length > 1 ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbnails}>{images.map((uri, index) => <Pressable key={`${uri}-${index}`} onPress={() => { setSelectedImageIndex(index); setImageFailed(false); }} style={[styles.thumbnail, selectedImageIndex === index && styles.thumbnailActive]}><Image source={{ uri }} style={styles.thumbnailImage} /><Text style={styles.thumbnailLabel}>{index === 0 ? "Main" : index === 1 ? "Detail" : "Angle"}</Text></Pressable>)}</ScrollView> : null}
      </View>
      <View style={styles.summaryCard}>
        {value(translation?.category) || value(product.category) ? <Text style={styles.category}>🎨 {value(translation?.category) || value(product.category)}</Text> : null}
        <Text style={styles.title}>{title}</Text>
        {typeof price === "number" ? <Text style={styles.price}>{value(product.pricing?.currency) || "INR"} {price.toLocaleString()}</Text> : null}
        {product.pricing?.bulkPricing ? <View style={styles.bulkBlock}><Text style={styles.bulkTitle}>Wholesale B2B Volume Pricing</Text><View style={styles.bulkRow}>{[["10-24 units", product.pricing.bulkPricing["10-24"]], ["25-49 units", product.pricing.bulkPricing["25-49"]], ["50+ units", product.pricing.bulkPricing["50+"]]].map(([label, bulkPrice]) => bulkPrice ? <View key={String(label)} style={styles.bulkItem}><Text style={styles.bulkLabel}>{label}</Text><Text style={styles.bulkPrice}>{value(product.pricing?.currency) || "INR"}{Number(bulkPrice).toLocaleString()}/pc</Text></View> : null)}</View></View> : null}
      </View>
      {description ? <View style={styles.descriptionCard}>
        <View style={styles.languageTabs}>
          {availableDescriptions.map((item) => (
            <Pressable key={item.language} onPress={() => setDescriptionLanguage(item.language || selectedLanguage)} style={[styles.languageTab, getLanguageCode(descriptionLanguage) === getLanguageCode(item.language) && styles.languageTabActive]}>
              <Text style={[styles.languageTabText, getLanguageCode(descriptionLanguage) === getLanguageCode(item.language) && styles.languageTabTextActive]}>{getNativeLanguageName(item.language)}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.body}>{selectedDescription}</Text>
      </View> : null}
      {materials ? <Section title={translate(contentLanguage, "materials")} text={materials} /> : null}
      {value(translation?.craft) || value(product.craft) ? <Section title={translate(contentLanguage, "craft")} text={value(translation?.craft) || value(product.craft)} /> : null}
      {artisan ? <Section title={translate(contentLanguage, "artisanLabel")} text={artisan} /> : null}
      {value(product.originalLanguage) ? <Section title={translate(contentLanguage, "originalLanguage")} text={value(product.originalLanguage)} /> : null}
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

const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: "#F7F5EF" }, content: { padding: 20, paddingBottom: 40 }, back: { paddingVertical: 8 }, backText: { color: "#087F5B", fontSize: 17, fontWeight: "700" }, galleryCard: { backgroundColor: "#FFFFFF", borderColor: "#E1E3DD", borderRadius: 24, borderWidth: 1, marginTop: 8, overflow: "hidden", padding: 14 }, image: { backgroundColor: "#E7ECE5", borderRadius: 18, height: 300, marginTop: 0, width: "100%" }, placeholder: { alignItems: "center", justifyContent: "center" }, placeholderText: { color: "#087F5B", fontSize: 40, fontWeight: "800" }, thumbnails: { gap: 10, paddingTop: 14 }, thumbnail: { alignItems: "center", borderColor: "transparent", borderRadius: 14, borderWidth: 3, padding: 4, width: 92 }, thumbnailActive: { borderColor: "#087F5B" }, thumbnailImage: { borderRadius: 9, height: 76, width: 76 }, thumbnailLabel: { color: "#59655F", fontSize: 12, fontWeight: "700", marginTop: 5 }, summaryCard: { backgroundColor: "#FFFFFF", borderColor: "#E1E3DD", borderRadius: 24, borderWidth: 1, marginTop: 18, padding: 24 }, title: { color: "#132F2A", fontSize: 29, fontWeight: "800", lineHeight: 37, marginTop: 12 }, category: { color: "#087F5B", fontSize: 15, fontWeight: "700" }, price: { color: "#087F5B", fontSize: 34, fontWeight: "800", marginTop: 18 }, bulkBlock: { borderTopColor: "#E1E3DD", borderTopWidth: 1, marginTop: 26, paddingTop: 20 }, bulkTitle: { color: "#172D29", fontSize: 18, fontWeight: "800" }, bulkRow: { flexDirection: "row", gap: 10, marginTop: 14 }, bulkItem: { backgroundColor: "#F0F8F4", borderRadius: 14, flex: 1, minHeight: 82, padding: 10 }, bulkLabel: { color: "#59655F", fontSize: 12, textAlign: "center" }, bulkPrice: { color: "#087F5B", fontSize: 15, fontWeight: "800", marginTop: 10, textAlign: "center" }, descriptionCard: { backgroundColor: "#FFFFFF", borderColor: "#E1E3DD", borderRadius: 24, borderWidth: 1, marginTop: 18, padding: 24 }, cardHeading: { color: "#173B35", fontSize: 21, fontWeight: "800", marginBottom: 16 }, section: { backgroundColor: "#FFFFFF", borderColor: "#E1E3DD", borderRadius: 24, borderWidth: 1, marginTop: 18, padding: 24 }, sectionTitle: { color: "#173B35", fontSize: 19, fontWeight: "800" }, body: { color: "#59655F", fontSize: 16, lineHeight: 25, marginTop: 7 }, languageTabs: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 }, languageTab: { borderColor: "#D8DED8", borderRadius: 8, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 7 }, languageTabActive: { backgroundColor: "#087F5B", borderColor: "#087F5B" }, languageTabText: { color: "#59655F", fontSize: 13, fontWeight: "600" }, languageTabTextActive: { color: "#FFFFFF" }, galleryScreen: { backgroundColor: "#F7F5EF", flex: 1 }, galleryHeader: { alignItems: "center", borderBottomColor: "#D8DED8", borderBottomWidth: 1, flexDirection: "row", justifyContent: "space-between", padding: 20 }, galleryTitle: { color: "#173B35", fontSize: 20, fontWeight: "800" }, closeText: { color: "#087F5B", fontSize: 16, fontWeight: "700" }, galleryList: { gap: 16, padding: 20 }, galleryImage: { backgroundColor: "#E7ECE5", borderRadius: 12, height: 300, width: "100%" } });