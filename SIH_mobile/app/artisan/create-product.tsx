import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  ActivityIndicator,
  Platform,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import {
  useAudioRecorder,
  AudioModule,
  RecordingPresets,
} from "expo-audio";
import { getLanguageCode, translate } from "../../constants/translations";

const API_URL = "http://10.5.65.32:5000";

export default function CreateProduct() {
  const { language } = useLocalSearchParams();
  const selectedLanguage = getLanguageCode(language);

  const [images, setImages] = useState<string[]>([]);
  const [recording, setRecording] = useState(false);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  // -----------------------------
  // -----------------------------
  // SELECT OR CAPTURE PRODUCT IMAGES
  // -----------------------------
  const addImages = async (source: "camera" | "gallery") => {
    if (images.length >= 4) return;

    if (source === "camera") {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(translate(selectedLanguage, "permissionRequired"), translate(selectedLanguage, "allowCamera"));
        return;
      }
    } else {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(translate(selectedLanguage, "permissionRequired"), translate(selectedLanguage, "allowPhotos"));
        return;
      }
    }

    const result = source === "camera"
      ? await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.8 })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsMultipleSelection: true,
          selectionLimit: 4 - images.length,
          quality: 0.8,
        });

    if (!result.canceled) {
      const selectedUris = result.assets.map((asset) => asset.uri);
      setImages((current) => [...current, ...selectedUris].slice(0, 4));
    }
  };

  const chooseImage = async () => {
    if (images.length >= 4) {
      Alert.alert(translate(selectedLanguage, "photoLimitReached"), translate(selectedLanguage, "photoLimitMessage"));
      return;
    }

    if (Platform.OS === "web") {
      await addImages("gallery");
      return;
    }

    Alert.alert(translate(selectedLanguage, "addProductPhotos"), translate(selectedLanguage, "choosePhotoSource"), [
      { text: translate(selectedLanguage, "takePhoto"), onPress: () => addImages("camera") },
      { text: translate(selectedLanguage, "chooseFromGallery"), onPress: () => addImages("gallery") },
      { text: translate(selectedLanguage, "cancel"), style: "cancel" },
    ]);
  };

  const removeImage = (uri: string) => {
    setImages((current) => current.filter((item) => item !== uri));
  };

  // -----------------------------
  // START RECORDING
  // -----------------------------
  const startRecording = async () => {
    const permission =
      await AudioModule.requestRecordingPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        translate(selectedLanguage, "permissionRequired"),
        translate(selectedLanguage, "allowMicrophone")
      );
      return;
    }

    try {
      await recorder.prepareToRecordAsync();
      recorder.record();

      setRecording(true);
      setAudioUri(null);
    } catch (error) {
      console.error("Recording start error:", error);

      Alert.alert(
        translate(selectedLanguage, "recordingError"),
        translate(selectedLanguage, "startRecordingError")
      );
    }
  };

  // -----------------------------
  // STOP RECORDING
  // -----------------------------
  const stopRecording = async () => {
    try {
      await recorder.stop();

      setRecording(false);
      setAudioUri(recorder.uri);
    } catch (error) {
      console.error("Recording stop error:", error);

      Alert.alert(
        translate(selectedLanguage, "recordingError"),
        translate(selectedLanguage, "stopRecordingError")
      );
    }
  };

  // -----------------------------
  // SEND TO BACKEND
  // -----------------------------
  const generateListing = async () => {
    if (!images.length) {
      Alert.alert(
        translate(selectedLanguage, "missingImage"),
        translate(selectedLanguage, "addImageFirst")
      );
      return;
    }

    if (!audioUri) {
      Alert.alert(
        translate(selectedLanguage, "missingAudio"),
        translate(selectedLanguage, "recordDescriptionFirst")
      );
      return;
    }

    try {
      setGenerating(true);

      const formData = new FormData();

      images.forEach((uri, index) => formData.append("image", {
        uri,
        name: `product-${index + 1}.jpg`,
        type: "image/jpeg",
      } as any));

      formData.append("audio", {
        uri: audioUri,
        name: "artisan-audio.m4a",
        type: "audio/m4a",
      } as any);

      formData.append(
        "language",
        selectedLanguage
      );

      console.log("Sending product to:", API_URL);
      console.log("Language:", language);

      const response = await fetch(
        `${API_URL}/api/catalog/generate`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      console.log("Backend response:", data);

      if (!response.ok) {
        throw new Error(
          data.error ||
            translate(selectedLanguage, "generationFailed")
        );
      }

      router.push({
  pathname: "/artisan/result",
  params: {
    image: images[0],
    images: JSON.stringify(data.product?.images || []),
    productId: data.product?._id,
    translations: JSON.stringify(data.product?.translations || data.result.translations || []),
    title: data.result.title,
    category: data.result.category,
    material: data.result.material,
    craft: data.result.craft,
    detectedLanguage: data.result.detectedLanguage,
    transcriptOriginal: data.result.transcriptOriginal,
    descriptionEnglish: data.result.descriptionEnglish,
    descriptionHindi: data.result.descriptionHindi,
    descriptionOriginal: data.result.descriptionOriginal,
    keywords: data.result.keywords.join("|||"),
    language: selectedLanguage,
  },
});

      console.log(
        "Generated product:",
        data.result
      );
    } catch (error: any) {
      console.error(
        "GENERATE PRODUCT ERROR:",
        error
      );

      Alert.alert(
        translate(selectedLanguage, "connectionError"),
        error?.message || translate(selectedLanguage, "backendConnectionError")
      );
    } finally {
      setGenerating(false);
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
    >
      <Text style={styles.title}>{translate(selectedLanguage, "createProduct")}</Text>

      <Text style={styles.subtitle}>{translate(selectedLanguage, "createProductDescription")}</Text>

      {/* IMAGE */}

      <Text style={styles.sectionTitle}>1. {translate(selectedLanguage, "productImage")}</Text>

      <TouchableOpacity
        style={styles.imageBox}
        onPress={chooseImage}
        activeOpacity={0.8}
      >
        {images.length ? (
          <View style={styles.previewGrid}>
            {images.map((uri, index) => (
              <TouchableOpacity key={uri} onPress={() => removeImage(uri)} style={styles.previewItem}>
                <Image source={{ uri }} style={styles.preview} />
                <Text style={styles.removePhoto}>×</Text>
                {index === 0 && <Text style={styles.primaryPhoto}>{translate(selectedLanguage, "primaryPhoto")}</Text>}
              </TouchableOpacity>
            ))}
            {images.length < 4 && <Text style={styles.addMoreHint}>{translate(selectedLanguage, "addMorePhotos")}</Text>}
          </View>
        ) : (
          <>
            <Text style={styles.imageIcon}>
              📸
            </Text>

            <Text style={styles.imageText}>{translate(selectedLanguage, "chooseProductImage")}</Text>

            <Text style={styles.hint}>{translate(selectedLanguage, "choosePhotoSource")}</Text>
          </>
        )}
      </TouchableOpacity>

      {/* AUDIO */}

      <Text style={styles.sectionTitle}>2. {translate(selectedLanguage, "artisanDescriptionTitle")}</Text>

      <Text style={styles.descriptionHint}>{translate(selectedLanguage, "describeInOwnLanguage")}</Text>

      <TouchableOpacity
        style={[
          styles.recordButton,
          recording &&
            styles.recordingButton,
        ]}
        onPress={
          recording
            ? stopRecording
            : startRecording
        }
        activeOpacity={0.8}
      >
        <Text style={styles.recordIcon}>
          {recording ? "⏹️" : "🎙️"}
        </Text>

        <Text style={styles.recordText}>
          {recording
            ? translate(selectedLanguage, "stopRecording")
            : translate(selectedLanguage, "startRecording")}
        </Text>
      </TouchableOpacity>

      {recording && (
        <View style={styles.recordingStatus}>
          <View style={styles.recordingDot} />

          <Text style={styles.recordingStatusText}>{translate(selectedLanguage, "recording")}</Text>
        </View>
      )}

      {audioUri && !recording && (
        <Text style={styles.recordedText}>✓ {translate(selectedLanguage, "voiceReady")}</Text>
      )}

      {/* GENERATE */}

      <TouchableOpacity
        style={[
          styles.generateButton,
          generating &&
            styles.generateButtonDisabled,
        ]}
        onPress={generateListing}
        disabled={generating}
        activeOpacity={0.8}
      >
        {generating ? (
          <>
            <ActivityIndicator
              color="#FFFFFF"
              style={styles.loader}
            />

            <Text style={styles.generateText}>{translate(selectedLanguage, "generating")}</Text>
          </>
        ) : (
          <Text style={styles.generateText}>{translate(selectedLanguage, "generateProductListing")}</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  container: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 30,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111111",
  },

  subtitle: {
    fontSize: 15,
    color: "#666666",
    marginTop: 8,
    marginBottom: 30,
    lineHeight: 21,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111111",
    marginBottom: 10,
  },

  descriptionHint: {
    fontSize: 14,
    color: "#777777",
    marginBottom: 12,
    lineHeight: 20,
  },

  imageBox: {
    height: 210,
    borderWidth: 1.5,
    borderColor: "#CCCCCC",
    borderRadius: 16,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginBottom: 30,
    backgroundColor: "#FAFAFA",
  },

  imageIcon: {
    fontSize: 40,
    marginBottom: 10,
  },

  imageText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#222222",
  },

  hint: {
    color: "#888888",
    marginTop: 6,
    fontSize: 14,
  },

  preview: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  previewGrid: {
    width: "100%",
    height: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    padding: 6,
  },

  previewItem: {
    width: "48%",
    height: "48%",
    position: "relative",
  },

  removePhoto: {
    position: "absolute",
    right: 4,
    top: 2,
    color: "#FFFFFF",
    backgroundColor: "#B33A2B",
    borderRadius: 12,
    fontSize: 20,
    lineHeight: 22,
    textAlign: "center",
    width: 23,
  },

  primaryPhoto: {
    position: "absolute",
    bottom: 4,
    left: 4,
    color: "#FFFFFF",
    backgroundColor: "#087F5B",
    fontSize: 11,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },

  addMoreHint: {
    alignSelf: "center",
    color: "#087F5B",
    fontSize: 12,
  },

  recordButton: {
    height: 65,
    borderRadius: 14,
    backgroundColor: "#F2F2F2",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  recordingButton: {
    backgroundColor: "#FFE5E5",
  },

  recordIcon: {
    fontSize: 25,
    marginRight: 10,
  },

  recordText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#222222",
  },

  recordingStatus: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  recordingDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#E53935",
    marginRight: 7,
  },

  recordingStatusText: {
    color: "#E53935",
    fontWeight: "600",
  },

  recordedText: {
    color: "#007A5E",
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "600",
  },

  generateButton: {
    backgroundColor: "#007A5E",
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 35,
  },

  generateButtonDisabled: {
    opacity: 0.7,
  },

  loader: {
    marginRight: 10,
  },

  generateText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
});