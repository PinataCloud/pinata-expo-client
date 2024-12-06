import { useAuth } from "@clerk/clerk-expo";
import * as ImagePicker from "expo-image-picker";
import React, { useCallback, useEffect, useState } from "react";
import {
	StyleSheet,
	TouchableOpacity,
	ActivityIndicator,
	Image,
	Platform,
	View,
	Text,
	ScrollView,
	RefreshControl,
	Dimensions,
} from "react-native";

type FileItem = {
	url: string;
};

const screenWidth = Dimensions.get("window").width;

export function Photos() {
	const [uploading, setUploading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [files, setFiles] = useState<FileItem[]>([]);
	const [loading, setLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const { getToken } = useAuth();

	const fetchFiles = async () => {
		try {
			setLoading(true);
			const token = await getToken();
			const request = await fetch(
				"https://steve-macbook-pro-1.dachshund-deneb.ts.net/files",
				{
					method: "GET",
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			);
			if (!request.ok) {
				throw new Error(`Failed to fetch files: ${request.status}`);
			}
			const data = await request.json();
			setFiles(data);
		} catch (e) {
			console.error("Error fetching files:", e);
			setError(e instanceof Error ? e.message : "Failed to load files");
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	};

	const pickAndUploadImage = async () => {
		try {
			setError(null);
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

			const { uri } = pickerResult.assets[0];

			const formData = new FormData();

			if (Platform.OS === "ios") {
				const uriParts = uri.split(".");
				const fileType = uriParts[uriParts.length - 1];
				formData.append("file", {
					uri,
					name: `upload.${fileType}`,
					type: `image/${fileType}`,
				} as any);
				formData.append("name", "File from Expo");
			} else {
				const fileData = await fetch(uri);
				if (!fileData) {
					console.error("Error loading file.", fileData);
					return;
				}
				const blob = await fileData.blob();
				formData.append("file", blob);
				formData.append("name", "File from Expo");
			}

			const token = await getToken();

			const response = await fetch(
				"https://steve-macbook-pro-1.dachshund-deneb.ts.net/files",
				{
					method: "POST",
					headers: {
						Authorization: `Bearer ${token}`,
					},
					body: formData,
				},
			);

			if (!response.ok) {
				throw new Error(`Upload failed with status ${response.status}`);
			}
			setUploading(false);
			await fetchFiles();
		} catch (e) {
			console.error("Upload error:", e);
			setError(
				e instanceof Error ? e.message : "An error occurred during upload",
			);
		}
	};

	useEffect(() => {
		fetchFiles();
	}, []);

	const onRefresh = useCallback(() => {
		setRefreshing(true);
		fetchFiles();
	}, []);

	return (
		<ScrollView
			style={styles.container}
			refreshControl={
				<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
			}
		>
			<View style={styles.uploadSection}>
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
			</View>

			<View style={styles.filesContainer}>
				<Text style={styles.sectionTitle}>Your Files</Text>
				{loading && (
					<ActivityIndicator size="large" color="rgba(0, 0, 0, 0.8)" />
				)}
				{error && <Text style={styles.errorMessage}>{error}</Text>}
				{files?.map((file) => (
					<View key={file.url} style={styles.fileItem}>
						<Image
							source={{
								uri: file.url,
							}}
							style={styles.image}
						/>
					</View>
				))}
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		width: "100%",
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
	filesContainer: {
		marginBottom: 20,
	},
	sectionTitle: {
		fontSize: 20,
		fontWeight: "bold",
		marginBottom: 15,
	},
	fileItem: {
		marginBottom: 20,
	},
	image: {
		width: screenWidth - 40,
		height: screenWidth - 40,
		borderRadius: 8,
	},
	uploadSection: {
		marginTop: 20,
	},
});
