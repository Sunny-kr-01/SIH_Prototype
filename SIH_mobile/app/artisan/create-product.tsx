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
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import {
  useAudioRecorder,
  AudioModule,
  RecordingPresets,
} from "expo-audio";

const API_URL = "http://10.5.65.32:5000";

export default function CreateProduct() {
  const { language } = useLocalSearchParams();

  const [image, setImage] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  // -----------------------------
  // SELECT PRODUCT IMAGE
  // -----------------------------
  const chooseImage = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission required",
        "Please allow access to your photos."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // -----------------------------
  // START RECORDING
  // -----------------------------
  const startRecording = async () => {
    const permission =
      await AudioModule.requestRecordingPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission required",
        "Please allow microphone access."
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
        "Recording error",
        "Could not start the recording."
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
        "Recording error",
        "Could not stop the recording."
      );
    }
  };

  // -----------------------------
  // SEND TO BACKEND
  // -----------------------------
  const generateListing = async () => {
    if (!image) {
      Alert.alert(
        "Missing image",
        "Please add a product image first."
      );
      return;
    }

    if (!audioUri) {
      Alert.alert(
        "Missing audio",
        "Please record a description of your product."
      );
      return;
    }

    try {
      setGenerating(true);

      const formData = new FormData();

      formData.append("image", {
        uri: image,
        name: "product.jpg",
        type: "image/jpeg",
      } as any);

      formData.append("audio", {
        uri: audioUri,
        name: "artisan-audio.m4a",
        type: "audio/m4a",
      } as any);

      formData.append(
        "language",
        typeof language === "string"
          ? language
          : "en"
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
            "Failed to generate product listing"
        );
      }

      router.push({
  pathname: "/artisan/result",
  params: {
    image,
    productId: data.product?._id,
    title: data.result.title,
    category: data.result.category,
    material: data.result.material,
    craft: data.result.craft,
    detectedLanguage: data.result.detectedLanguage,
    transcriptOriginal: data.result.transcriptOriginal,
    descriptionEnglish: data.result.descriptionEnglish,
    descriptionHindi: data.result.descriptionHindi,
    keywords: data.result.keywords.join("|||"),
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
        "Connection Error",
        error?.message ||
          "Could not connect to the backend."
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
      <Text style={styles.title}>
        Create Product
      </Text>

      <Text style={styles.subtitle}>
        Add a product image and describe your
        product using your voice.
      </Text>

      {/* IMAGE */}

      <Text style={styles.sectionTitle}>
        1. Product Image
      </Text>

      <TouchableOpacity
        style={styles.imageBox}
        onPress={chooseImage}
        activeOpacity={0.8}
      >
        {image ? (
          <Image
            source={{ uri: image }}
            style={styles.preview}
          />
        ) : (
          <>
            <Text style={styles.imageIcon}>
              📸
            </Text>

            <Text style={styles.imageText}>
              Choose Product Image
            </Text>

            <Text style={styles.hint}>
              Tap to select from gallery
            </Text>
          </>
        )}
      </TouchableOpacity>

      {/* AUDIO */}

      <Text style={styles.sectionTitle}>
        2. Artisan Description
      </Text>

      <Text style={styles.descriptionHint}>
        Explain your product naturally in your
        own language.
      </Text>

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
            ? "Stop Recording"
            : "Start Recording"}
        </Text>
      </TouchableOpacity>

      {recording && (
        <View style={styles.recordingStatus}>
          <View style={styles.recordingDot} />

          <Text
            style={styles.recordingStatusText}
          >
            Recording...
          </Text>
        </View>
      )}

      {audioUri && !recording && (
        <Text style={styles.recordedText}>
          ✓ Voice recording ready
        </Text>
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

            <Text style={styles.generateText}>
              Generating...
            </Text>
          </>
        ) : (
          <Text style={styles.generateText}>
            Generate Product Listing
          </Text>
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