import React from "react";
import { useClerk, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import {
	StyleSheet,
	Text,
	View,
	TouchableOpacity,
	Image,
	ScrollView,
} from "react-native";
import { Photos } from "@/components/Photos";

export default function Page() {
	const { user } = useUser();
	const clerk = useClerk();
	const router = useRouter();

	async function handleSignOut() {
		await clerk.signOut();
		router.replace("/");
	}

	if (user === undefined) {
		return <Text>Loading...</Text>;
	}

	if (user === null) {
		return <Text>Not signed in</Text>;
	}

	return (
		<ScrollView style={styles.container}>
			<View style={styles.header}>
				<Image source={{ uri: user.imageUrl }} style={styles.profileImage} />
				<Text style={styles.name}>{user.fullName || "User"}</Text>
			</View>

			<View>
				<Photos />
			</View>

			<TouchableOpacity
				style={styles.backButton}
				onPress={() => router.push("/")}
			>
				<Text style={styles.backButtonText}>Back</Text>
			</TouchableOpacity>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f5f5f5",
	},
	header: {
		alignItems: "center",
		padding: 20,
		backgroundColor: "#fff",
	},
	profileImage: {
		width: 100,
		height: 100,
		borderRadius: 50,
		marginBottom: 10,
	},
	name: {
		fontSize: 22,
		fontWeight: "bold",
		marginBottom: 5,
	},
	email: {
		fontSize: 16,
		color: "gray",
	},
	infoSection: {
		backgroundColor: "#fff",
		marginTop: 20,
		padding: 20,
	},
	infoItem: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 10,
	},
	infoLabel: {
		fontWeight: "bold",
	},
	infoValue: {
		color: "gray",
	},
	signOutButton: {
		backgroundColor: "rgba(0, 0, 0, 0.8)",
		padding: 15,
		borderRadius: 8,
		margin: 20,
		alignItems: "center",
	},
	signOutButtonText: {
		color: "white",
		fontSize: 16,
		fontWeight: "bold",
	},
	backButton: {
		alignItems: "center",
		margin: 20,
		padding: 12,
		borderRadius: 8,
		backgroundColor: "white",
		borderWidth: 1,
		borderColor: "#e0e0e0",
	},
	backButtonText: {
		color: "black",
		fontWeight: "bold",
	},
});
