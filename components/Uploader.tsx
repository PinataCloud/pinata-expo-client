import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
	StyleSheet,
	TouchableOpacity,
	ActivityIndicator,
	Image,
	Platform,
	View,
	Text,
} from "react-native";

export function Uploader() {
	const [uploading, setUploading] = useState(false);
	const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const pickAndUploadImage = async () => {
		try {
			setError(null);
			setUploadedUrl(null);

			const permissionResult =
				await ImagePicker.requestMediaLibraryPermissionsAsync();
			if (!permissionResult.granted) {
				setError("Permission to access camera roll is required!");
				return;
			}

			const pickerResult = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ImagePicker.MediaTypeOptions.Images,
				allowsEditing: true,
				quality: 1,
			});

			if (pickerResult.canceled) {
				return;
			}

			setUploading(true);

			const { uri, mimeType } = pickerResult.assets[0];
			const filename = `upload-${Date.now()}${Platform.OS === "ios" ? ".jpg" : ""}`;

			setUploadedUrl("");
		} catch (e) {
			console.error("Upload error:", e);
			setError(
				e instanceof Error ? e.message : "An error occurred during upload",
			);
		} finally {
			setUploading(false);
		}
	};

	return (
		<View style={styles.container}>
			<View style={styles.headerContainer}>
				<Text style={styles.title}>Upload Image</Text>
				<Text style={styles.subtitle}>
					Select an image from your device to upload
				</Text>
			</View>

			<TouchableOpacity
				style={styles.uploadButton}
				onPress={pickAndUploadImage}
				disabled={uploading}
			>
				{uploading ? (
					<ActivityIndicator color="white" />
				) : (
					<Text style={styles.uploadButtonText}>Choose Image</Text>
				)}
			</TouchableOpacity>

			{error && (
				<View style={styles.errorContainer}>
					<Text style={styles.errorMessage}>
						<Text>• </Text>
						<Text>{error}</Text>
					</Text>
				</View>
			)}

			{uploadedUrl && (
				<View style={styles.resultContainer}>
					<Text style={styles.successMessage}>Upload successful!</Text>
					<Image
						source={{ uri: uploadedUrl }}
						style={styles.previewImage}
						resizeMode="cover"
					/>
					<TouchableOpacity style={styles.urlButton}>
						<Text style={styles.urlButtonText}>View on IPFS</Text>
					</TouchableOpacity>
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		width: "100%",
		alignSelf: "center",
	},
	headerContainer: {
		marginBottom: 20,
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		textAlign: "center",
		marginBottom: 10,
	},
	subtitle: {
		fontSize: 16,
		color: "gray",
		textAlign: "center",
	},
	uploadButton: {
		backgroundColor: "rgba(0, 0, 0, 0.8)",
		padding: 12,
		borderRadius: 8,
		alignItems: "center",
		marginBottom: 15,
	},
	uploadButtonText: {
		color: "white",
		fontSize: 16,
		fontWeight: "bold",
	},
	errorContainer: {
		marginBottom: 15,
	},
	errorMessage: {
		color: "red",
		fontSize: 14,
		marginBottom: 5,
	},
	resultContainer: {
		marginTop: 20,
		alignItems: "center",
	},
	successMessage: {
		fontSize: 16,
		color: "green",
		marginBottom: 15,
	},
	previewImage: {
		width: "100%",
		height: 300,
		borderRadius: 8,
		marginBottom: 15,
		backgroundColor: "#f5f5f5",
	},
	urlButton: {
		padding: 12,
		borderRadius: 8,
		backgroundColor: "white",
		borderWidth: 1,
		borderColor: "#e0e0e0",
		width: "100%",
		alignItems: "center",
	},
	urlButtonText: {
		color: "black",
		fontSize: 16,
		fontWeight: "bold",
	},
});
