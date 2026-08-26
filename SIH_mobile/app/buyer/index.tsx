import { useEffect, useState } from "react";
import {
	ActivityIndicator,
	FlatList,
	Image,
	Pressable,
	SafeAreaView,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";

const API_URL = "http://10.5.65.32:5000";

type Product = {
	_id?: string;
	title?: string;
	description?: string;
	category?: string;
	images?: string[];
	pricing?: { suggestedPrice?: number; currency?: string };
};

const textValue = (value: unknown, fallback = "") =>
	typeof value === "string" ? value.trim() : fallback;

export default function BuyerMarketplace() {
	const { language } = useLocalSearchParams<{ language?: string }>();
	const isHindi = language === "hi";
	const [products, setProducts] = useState<Product[]>([]);
	const [search, setSearch] = useState("");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);

	const fetchProducts = async () => {
		try {
			setLoading(true);
			setError(false);
			const response = await fetch(`${API_URL}/api/catalog/products`);
			const data = await response.json();
			if (!response.ok || data.success !== true) throw new Error("Fetch failed");
			setProducts(Array.isArray(data.products) ? data.products : []);
		} catch (fetchError) {
			console.error("FETCH PRODUCTS ERROR:", fetchError);
			setError(true);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchProducts();
	}, []);

	const filteredProducts = products.filter((product) => {
		const query = search.trim().toLowerCase();
		if (!query) return true;
		return [product.title, product.category, product.description]
			.some((value) => textValue(value).toLowerCase().includes(query));
	});

	const renderProduct = ({ item }: { item: Product }) => {
		const imageUri = Array.isArray(item.images) && typeof item.images[0] === "string"
			? item.images[0].trim()
			: "";
		const price = item.pricing?.suggestedPrice;
		const currency = textValue(item.pricing?.currency, "INR");

		return (
			<Pressable
				style={({ pressed }) => [styles.card, pressed && styles.pressed]}
				onPress={() => router.push({
					pathname: "/buyer/product" as never,
					params: { product: JSON.stringify(item), language: language || "en" },
				})}
			>
				{imageUri ? <Image source={{ uri: imageUri }} style={styles.image} /> : (
					<View style={styles.placeholder}><Text style={styles.placeholderText}>SIH</Text></View>
				)}
				<View style={styles.cardBody}>
					<Text style={styles.productTitle} numberOfLines={1}>{textValue(item.title, isHindi ? "उत्पाद" : "Untitled product")}</Text>
					<Text style={styles.category} numberOfLines={1}>{textValue(item.category, isHindi ? "शिल्प" : "Handcrafted")}</Text>
					<Text style={styles.description} numberOfLines={2}>{textValue(item.description, isHindi ? "विवरण उपलब्ध नहीं है" : "Description not available")}</Text>
					<Text style={styles.price}>{typeof price === "number" ? `${currency} ${price}` : (isHindi ? "कीमत उपलब्ध नहीं" : "Price not available")}</Text>
				</View>
			</Pressable>
		);
	};

	return (
		<SafeAreaView style={styles.screen}>
			<View style={styles.header}>
				<Text style={styles.heading}>{isHindi ? "उत्पाद खोजें" : "Discover Products"}</Text>
				<Text style={styles.subtitle}>{isHindi ? "भारतीय कारीगरों द्वारा बनाए उत्पाद देखें" : "Explore products crafted by Indian artisans"}</Text>
				<TextInput
					value={search}
					onChangeText={setSearch}
					placeholder={isHindi ? "उत्पाद खोजें..." : "Search products..."}
					placeholderTextColor="#8A8A84"
					style={styles.search}
					accessibilityLabel="Search products"
				/>
			</View>
			{loading ? (
				<View style={styles.state}><ActivityIndicator size="large" color="#087F5B" /><Text style={styles.stateText}>{isHindi ? "उत्पाद लोड हो रहे हैं..." : "Loading products..."}</Text></View>
			) : error ? (
				<View style={styles.state}><Text style={styles.stateTitle}>{isHindi ? "उत्पाद लोड नहीं हो सके" : "Unable to load products"}</Text><Pressable style={styles.retry} onPress={fetchProducts}><Text style={styles.retryText}>{isHindi ? "फिर कोशिश करें" : "Retry"}</Text></Pressable></View>
			) : products.length === 0 ? (
				<View style={styles.state}><Text style={styles.stateTitle}>{isHindi ? "अभी कोई उत्पाद नहीं" : "No products yet"}</Text><Text style={styles.stateText}>{isHindi ? "कारीगरों द्वारा बनाए उत्पाद यहां दिखाई देंगे।" : "Products created by artisans will appear here."}</Text></View>
			) : (
				<FlatList data={filteredProducts} keyExtractor={(item, index) => item._id || String(index)} renderItem={renderProduct} contentContainerStyle={styles.list} />
			)}
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	screen: { flex: 1, backgroundColor: "#F7F5EF" },
	header: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 14 },
	heading: { color: "#173B35", fontSize: 30, fontWeight: "800" },
	subtitle: { color: "#63706A", fontSize: 15, marginTop: 6, lineHeight: 21 },
	search: { backgroundColor: "#FFFFFF", borderColor: "#D8DED8", borderRadius: 12, borderWidth: 1, color: "#173B35", fontSize: 16, marginTop: 18, paddingHorizontal: 15, paddingVertical: 12 },
	list: { gap: 14, padding: 20, paddingTop: 4 },
	card: { backgroundColor: "#FFFFFF", borderRadius: 14, flexDirection: "row", overflow: "hidden", shadowColor: "#173B35", shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 },
	pressed: { opacity: 0.82 },
	image: { backgroundColor: "#E7ECE5", height: 150, width: 125 },
	placeholder: { alignItems: "center", backgroundColor: "#DDEBE2", height: 150, justifyContent: "center", width: 125 },
	placeholderText: { color: "#087F5B", fontSize: 24, fontWeight: "800" },
	cardBody: { flex: 1, padding: 14 },
	productTitle: { color: "#173B35", fontSize: 18, fontWeight: "700" },
	category: { color: "#087F5B", fontSize: 13, fontWeight: "600", marginTop: 4 },
	description: { color: "#69736E", fontSize: 13, lineHeight: 18, marginTop: 8 },
	price: { color: "#B6532C", fontSize: 15, fontWeight: "700", marginTop: 8 },
	state: { alignItems: "center", flex: 1, justifyContent: "center", padding: 30 },
	stateTitle: { color: "#173B35", fontSize: 19, fontWeight: "700", textAlign: "center" },
	stateText: { color: "#69736E", fontSize: 15, marginTop: 10, textAlign: "center" },
	retry: { backgroundColor: "#087F5B", borderRadius: 10, marginTop: 18, paddingHorizontal: 24, paddingVertical: 12 },
	retryText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
});
