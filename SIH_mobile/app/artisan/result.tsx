import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Image,
    Pressable,
    TextInput,
} from "react-native";

import { useLocalSearchParams, router } from "expo-router";
import { useState } from "react";
import {
    AudioModule,
    RecordingPresets,
    useAudioRecorder,
} from "expo-audio";

const API_URL = "http://10.5.65.32:5000";

export default function ProductResult() {
    const params = useLocalSearchParams();

    const title = params.title || "Untitled Product";
    const category = params.category || "Unknown";
    const material = params.material || "Not specified";
    const craft = params.craft || "Not specified";
    const language = params.detectedLanguage || "Unknown";
    const transcript = params.transcriptOriginal || "";
    const descriptionEnglish =
        params.descriptionEnglish || "";
    const descriptionHindi =
        params.descriptionHindi || "";
    const image = params.image ? String(params.image) : "";
    const productId = params.productId ? String(params.productId) : "";

    const keywords = params.keywords
        ? String(params.keywords).split("|||")
        : [];

    const [saving, setSaving] = useState(false);
    const [pricing, setPricing] = useState<any>(null);
    const [materialCost, setMaterialCost] = useState("");
    const [workingDays, setWorkingDays] = useState("");
    const [hoursPerDay, setHoursPerDay] = useState("");
    const [otherCosts, setOtherCosts] = useState("");
    const [priceDraft, setPriceDraft] = useState("");
    const [pricingLoading, setPricingLoading] = useState(false);
    const [pricingError, setPricingError] = useState("");
    const [recording, setRecording] = useState(false);
    const [audioUri, setAudioUri] = useState<string | null>(null);
    const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

    const getPriceSuggestion = async (voiceUri?: string | null) => {
        const hasFormValue = [materialCost, workingDays, hoursPerDay, otherCosts]
            .some((value) => value.trim());
        if (!productId || (!hasFormValue && !voiceUri)) {
            setPricingError("Fill in at least one cost field or record your voice to get a recommendation.");
            return;
        }

        try {
            setPricingLoading(true);
            setPricingError("");
            const formData = new FormData();
            formData.append("productId", productId);
            formData.append(
                "description",
                String(descriptionEnglish)
            );

            formData.append(
                "productTitle",
                String(title)
            );

            formData.append(
                "category",
                String(category)
            );

            formData.append(
                "material",
                String(material)
            );

            formData.append(
                "craft",
                String(craft)
            );
            if (materialCost.trim()) formData.append("materialCost", materialCost);
            if (workingDays.trim()) formData.append("workingDays", workingDays);
            if (hoursPerDay.trim()) formData.append("hoursPerDay", hoursPerDay);
            if (otherCosts.trim()) formData.append("otherCosts", otherCosts);
            if (voiceUri) {
                formData.append("audio", {
                    uri: voiceUri,
                    name: "pricing-audio.m4a",
                    type: "audio/m4a",
                } as any);
            }

            const response = await fetch(`${API_URL}/api/pricing/suggest`, {
                method: "POST",
                body: formData,
            });
            const data = await response.json();
            if (!response.ok || !data.success || !data.price?.suggestedPrice) {
                throw new Error(data.error || "Unable to calculate price");
            }
            setPricing(data.price);
            setPriceDraft(String(data.price.suggestedPrice));
        } catch (error: any) {
            setPricingError(error?.message || "Unable to calculate price");
        } finally {
            setPricingLoading(false);
        }
    };

    const toggleRecording = async () => {
        if (recording) {
            try {
                await recorder.stop();
                setRecording(false);
                setAudioUri(recorder.uri);
            } catch {
                setPricingError("Could not stop recording.");
            }
            return;
        }

        const permission = await AudioModule.requestRecordingPermissionsAsync();
        if (!permission.granted) {
            Alert.alert("Permission required", "Please allow microphone access.");
            return;
        }

        try {
            await recorder.prepareToRecordAsync();
            recorder.record();
            setRecording(true);
            setAudioUri(null);
        } catch {
            setPricingError("Could not start recording.");
        }
    };

    const applyPrice = () => {
        const selectedPrice = Number(priceDraft);
        if (!Number.isFinite(selectedPrice) || selectedPrice < 0) {
            Alert.alert("Invalid price", "Enter a valid price before saving.");
            return false;
        }
        return true;
    };

    const saveProduct = async () => {
        if (pricing && !applyPrice()) return;
        try {
            setSaving(true);

            const product = {
                title: String(title),
                description: String(descriptionEnglish),
                category: String(category),

                originalLanguage: String(language),

                translations: [
                    {
                        language: "en",
                        title: String(title),
                        description: String(descriptionEnglish),
                    },
                    {
                        language: "hi",
                        title: String(title),
                        description: String(descriptionHindi),
                    },
                ],

                images: image ? [image] : [],

                pricing: pricing
                    ? {
                        ...pricing,
                        suggestedPrice: Number(priceDraft),
                        currency: pricing.currency || "INR",
                    }
                    : undefined,

                materials: [
                    {
                        name: String(material),
                        quantity: "",
                    },
                ],

                artisan: {},
            };

            const response = await fetch(
                productId
                    ? `${API_URL}/api/catalog/${productId}`
                    : `${API_URL}/api/catalog/save`,
                {
                    method: productId ? "PUT" : "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(product),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Failed to save product"
                );
            }

            Alert.alert(
                "Product Saved 🎉",
                "Your product has been saved successfully.",
                [
                    {
                        text: "OK",
                        onPress: () => router.replace("/artisan"),
                    },
                ]
            );
        } catch (error: any) {
            console.error("SAVE PRODUCT ERROR:", error);

            Alert.alert(
                "Save Failed",
                error?.message || "Could not save the product."
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <ScrollView
            style={styles.screen}
            contentContainerStyle={styles.container}
        >
            {/* HEADER */}

            <Text style={styles.heading}>
                Generated Product
            </Text>

            <Text style={styles.subheading}>
                Review the information generated from
                your image and voice description.
            </Text>

            {image ? (
                <Image
                    source={{ uri: image }}
                    style={styles.productImage}
                />
            ) : null}

            {/* TITLE */}

            <View style={styles.card}>
                <Text style={styles.label}>
                    Product Title
                </Text>

                <Text style={styles.title}>
                    {title}
                </Text>
            </View>

            {/* BASIC INFO */}

            <View style={styles.card}>
                <Text style={styles.cardHeading}>
                    Product Information
                </Text>

                <InfoRow
                    label="Category"
                    value={String(category)}
                />

                <InfoRow
                    label="Material"
                    value={String(material)}
                />

                <InfoRow
                    label="Craft"
                    value={String(craft)}
                />

                <InfoRow
                    label="Detected Language"
                    value={String(language)}
                />
            </View>

            {/* TRANSCRIPT */}

            {transcript ? (
                <View style={styles.card}>
                    <Text style={styles.cardHeading}>
                        Artisan&apos;s Description
                    </Text>

                    <Text style={styles.languageBadge}>
                        {String(language)}
                    </Text>

                    <Text style={styles.bodyText}>
                        {String(transcript)}
                    </Text>
                </View>
            ) : null}

            {/* ENGLISH DESCRIPTION */}

            <View style={styles.card}>
                <Text style={styles.cardHeading}>
                    English Description
                </Text>

                <Text style={styles.bodyText}>
                    {String(descriptionEnglish)}
                </Text>
            </View>

            {/* HINDI DESCRIPTION */}

            <View style={styles.card}>
                <Text style={styles.cardHeading}>
                    Hindi Description
                </Text>

                <Text style={styles.bodyText}>
                    {String(descriptionHindi)}
                </Text>
            </View>

            {/* KEYWORDS */}

            {keywords.length > 0 && (
                <View style={styles.card}>
                    <Text style={styles.cardHeading}>
                        Keywords
                    </Text>

                    <View style={styles.keywordContainer}>
                        {keywords.map((keyword, index) => (
                            <View
                                key={`${keyword}-${index}`}
                                style={styles.keyword}
                            >
                                <Text style={styles.keywordText}>
                                    {keyword}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}

            {/* ACTION */}

            <View style={styles.pricingCard}>
                <Text style={styles.cardHeading}>AI Price Recommendation</Text>
                <Text style={styles.pricingHint}>
                    Enter the costs and time used to make this product.
                </Text>
                <TextInput value={materialCost} onChangeText={setMaterialCost} keyboardType="decimal-pad" placeholder="Material cost (INR)" placeholderTextColor="#8A8A84" style={styles.pricingInput} />
                <TextInput value={workingDays} onChangeText={setWorkingDays} keyboardType="decimal-pad" placeholder="Working days" placeholderTextColor="#8A8A84" style={styles.pricingInput} />
                <TextInput value={hoursPerDay} onChangeText={setHoursPerDay} keyboardType="decimal-pad" placeholder="Working hours per day" placeholderTextColor="#8A8A84" style={styles.pricingInput} />
                <TextInput value={otherCosts} onChangeText={setOtherCosts} keyboardType="decimal-pad" placeholder="Other costs (INR)" placeholderTextColor="#8A8A84" style={styles.pricingInput} />
                <Pressable
                    onPress={toggleRecording}
                    style={[styles.voiceButton, recording && styles.recordingButton]}
                >
                    <Text style={styles.voiceButtonText}>
                        {recording ? "Stop Recording" : audioUri ? "Voice Recording Ready" : "Record Voice"}
                    </Text>
                </Pressable>
                {audioUri && !recording ? (
                    <Pressable onPress={() => getPriceSuggestion(audioUri)} style={styles.recommendButton}>
                        <Text style={styles.recommendButtonText}>Use Voice for Recommendation</Text>
                    </Pressable>
                ) : null}
                <Pressable onPress={() => getPriceSuggestion()} disabled={pricingLoading} style={styles.recommendButton}>
                    <Text style={styles.recommendButtonText}>Calculate From Form</Text>
                </Pressable>
                {pricingLoading ? <ActivityIndicator color="#007A5E" style={styles.pricingLoader} /> : null}
                {pricingError ? <Text style={styles.pricingError}>{pricingError}</Text> : null}
                {pricing ? (
                    <>
                        <Text style={styles.suggestionLabel}>Suggested Price</Text>
                        <Text style={styles.suggestedPrice}>
                            {pricing.currency || "INR"} {pricing.suggestedPrice}
                        </Text>
                        {pricing.minimumPrice && pricing.maximumPrice ? (
                            <Text style={styles.recommendedRange}>
                                Recommended Range: {pricing.currency || "INR"} {pricing.minimumPrice} - {pricing.maximumPrice}
                            </Text>
                        ) : null}
                        <Text style={styles.finalPriceLabel}>Your final price</Text>
                        <TextInput
                            value={priceDraft}
                            onChangeText={setPriceDraft}
                            keyboardType="decimal-pad"
                            style={styles.priceInput}
                            placeholder="Enter final price"
                        />
                        <Text style={styles.pricingNote}>
                            AI provides a recommendation; you choose the final price.
                        </Text>
                    </>
                ) : null}
            </View>

            <TouchableOpacity
                style={[
                    styles.saveButton,
                    saving && styles.saveButtonDisabled,
                ]}
                onPress={saveProduct}
                disabled={saving}
            >
                {saving ? (
                    <>
                        <ActivityIndicator
                            color="#FFFFFF"
                            style={{ marginRight: 8 }}
                        />

                        <Text style={styles.saveButtonText}>
                            Saving...
                        </Text>
                    </>
                ) : (
                    <Text style={styles.saveButtonText}>
                        Save Product
                    </Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
            >
                <Text style={styles.backButtonText}>
                    Back to Edit
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

function InfoRow({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
                {label}
            </Text>

            <Text style={styles.infoValue}>
                {value}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: "#F7F8F7",
    },

    container: {
        padding: 20,
        paddingTop: 60,
        paddingBottom: 40,
    },

    heading: {
        fontSize: 28,
        fontWeight: "700",
        color: "#111111",
    },

    subheading: {
        fontSize: 14,
        color: "#666666",
        lineHeight: 20,
        marginTop: 8,
        marginBottom: 20,
    },

    pricingCard: {
        backgroundColor: "#EAF4EE",
        borderRadius: 16,
        padding: 18,
        marginBottom: 18,
    },

    pricingHint: { color: "#5F7168", fontSize: 14, lineHeight: 20, marginBottom: 12 },
    pricingInput: { backgroundColor: "#FFFFFF", borderColor: "#D8DED8", borderRadius: 10, borderWidth: 1, color: "#173B35", fontSize: 15, marginTop: 8, padding: 12 },
    voiceButton: { alignItems: "center", borderColor: "#007A5E", borderRadius: 10, borderWidth: 1, marginTop: 12, padding: 12 },
    recordingButton: { backgroundColor: "#FFE5E5", borderColor: "#B33A2B" },
    voiceButtonText: { color: "#007A5E", fontWeight: "700" },
    recommendButton: { alignItems: "center", backgroundColor: "#D9EEE2", borderRadius: 10, marginTop: 10, padding: 12 },
    recommendButtonText: { color: "#007A5E", fontSize: 13, fontWeight: "700" },
    pricingLoader: { marginTop: 14 },
    pricingError: { color: "#B33A2B", fontSize: 13, marginTop: 10 },
    suggestionLabel: { color: "#5F7168", fontSize: 13, fontWeight: "600", marginTop: 16 },
    suggestedPrice: { color: "#B6532C", fontSize: 29, fontWeight: "800", marginTop: 4 },
    recommendedRange: { color: "#173B35", fontSize: 15, fontWeight: "700", marginTop: 8 },
    finalPriceLabel: { color: "#173B35", fontSize: 14, fontWeight: "700", marginTop: 16 },
    priceInput: { backgroundColor: "#FFFFFF", borderColor: "#B9CEC0", borderRadius: 10, borderWidth: 1, color: "#173B35", fontSize: 18, marginTop: 7, padding: 12 },
    pricingNote: { color: "#69736E", fontSize: 13, lineHeight: 18, marginTop: 10 },

    productImage: {
        width: "100%",
        height: 220,
        borderRadius: 16,
        marginBottom: 18,
        resizeMode: "cover",
    },

    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 18,
        marginBottom: 14,
    },

    label: {
        fontSize: 13,
        color: "#777777",
        marginBottom: 6,
    },

    title: {
        fontSize: 21,
        fontWeight: "700",
        color: "#111111",
        lineHeight: 29,
    },

    cardHeading: {
        fontSize: 17,
        fontWeight: "700",
        color: "#111111",
        marginBottom: 14,
    },

    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#EEEEEE",
    },

    infoLabel: {
        color: "#777777",
        fontSize: 14,
        flex: 1,
    },

    infoValue: {
        color: "#222222",
        fontSize: 14,
        fontWeight: "600",
        flex: 1,
        textAlign: "right",
    },

    languageBadge: {
        alignSelf: "flex-start",
        backgroundColor: "#E8F5F0",
        color: "#007A5E",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        fontSize: 12,
        fontWeight: "600",
        marginBottom: 12,
    },

    bodyText: {
        fontSize: 15,
        color: "#444444",
        lineHeight: 23,
    },

    keywordContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },

    keyword: {
        backgroundColor: "#F1F3F2",
        paddingHorizontal: 11,
        paddingVertical: 7,
        borderRadius: 20,
    },

    keywordText: {
        fontSize: 13,
        color: "#444444",
    },

    saveButton: {
        backgroundColor: "#007A5E",
        borderRadius: 14,
        paddingVertical: 17,
        alignItems: "center",
        marginTop: 10,
    },

    saveButtonText: {
        color: "#FFFFFF",
        fontSize: 17,
        fontWeight: "700",
    },

    saveButtonDisabled: {
        opacity: 0.7,
    },

    backButton: {
        paddingVertical: 16,
        alignItems: "center",
    },

    backButtonText: {
        color: "#007A5E",
        fontSize: 15,
        fontWeight: "600",
    },
});