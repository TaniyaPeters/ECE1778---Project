import { colors } from "@app/constants/colors";
import { globalStyles } from "@app/styles/globalStyles";
import {
	View,
	StyleSheet,
	Text,
	Pressable,
	FlatList,
	Image,
	Modal,
	TextInput,
	TouchableWithoutFeedback,
	Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { accountStyles } from "@app/styles/accountStyles";
import { router } from "expo-router";
import ProfileCard from "@app/components/ProfileCard";
import { useEffect, useState } from "react";
import { supabase } from "@lib/supabase.web";
import { useAuthContext } from "@app/contexts/AuthContext";

type Friend = {
	id: string;
	avatar_url: string;
	username: string;
};

export default function EditFriendsScreen() {
	const { session } = useAuthContext();
	const [modalVisible, setModalVisible] = useState(false);
	const [addFriendInput, setAddFriendInput] = useState("");
	const [friends, setFriends] = useState<Array<Friend>>([]);

	const getProfileById = async (id: string) => {
		let { data, error } = await supabase
			.from("profiles")
			.select("*")
			.eq("id", id)
			.single();

		if (error) {
			Alert.alert("Error", error.message);
			return;
		}

		return data;
	};

	const getFriends = async () => {
		if (!session) return [];

		const { data, error } = await supabase
			.from("friends")
			.select("friend_id")
			.eq("id", session.user.id);

		if (error) {
			Alert.alert("Error", error.message);
			return [];
		}

		const friendsList: Array<Friend> = [];
		friends.forEach(async (f) => {
			const friendData = await getProfileById(f.id);
			if (!friendData) return;

			friendsList.push({
				id: friendData.id,
				avatar_url: friendData.avatar_url ?? "",
				username: friendData.username,
			});
		});

		// const data = await Promise.all(friendsList);
		setFriends(friendsList);

		return data;
	};

	const getUserByUsername = async (username: string) => {
		const { data, error } = await supabase
			.from("profiles")
			.select("*")
			.eq("username", username)
			.single();

		if (error) {
			Alert.alert("Error", error.message);
			return null;
		}

		return data;
	};

	const addFriend = async () => {
		if (!session) return;

		const friend = await getUserByUsername(addFriendInput);
		if (!friend) {
			return;
		}

		const { data, error } = await supabase
			.from("friends")
			.insert([{ id: session.user.id, friend_id: friend.id }])
			.select();

		if (error) {
			Alert.alert("Error", error.message);
			return;
		}

		setAddFriendInput("");
		setModalVisible(false);
		getFriends();
	};

	useEffect(() => {
		getFriends();
	}, [session]);

	return (
		<SafeAreaView style={[globalStyles.container, { paddingTop: 0 }]}>
			<View style={[accountStyles.container, accountStyles.bgLight]}>
				<Modal
					animationType="slide"
					transparent={true}
					visible={modalVisible}
					onRequestClose={() => {
						setModalVisible(false);
					}}
				>
					<TouchableWithoutFeedback
						onPress={() => setModalVisible(false)}
					>
						<View style={accountStyles.container}>
							<View style={styles.modal}>
								<TextInput
									style={[
										styles.input,
										{ borderColor: colors.light.secondary },
									]}
									placeholder="Enter a username..."
									value={addFriendInput}
									onChangeText={setAddFriendInput}
								/>
								<Pressable onPress={addFriend}>
									<Image
										source={require("@assets/plus.png")}
										style={accountStyles.icon}
									/>
								</Pressable>
							</View>
						</View>
					</TouchableWithoutFeedback>
				</Modal>

				<View style={[accountStyles.row, { width: "100%" }]}>
					<View style={{ flex: 1 }} />
					<Text
						style={[
							accountStyles.header,
							accountStyles.textLight,
							{ flex: 3 },
						]}
					>
						Friends
					</Text>
					<Pressable
						style={{
							flex: 1,
							alignItems: "flex-end",
							paddingBottom: 10,
						}}
						onPress={() => setModalVisible(true)}
					>
						<Image
							source={require("@assets/add-friend.png")}
							style={accountStyles.icon}
						/>
					</Pressable>
				</View>
				<FlatList
					data={friends}
					contentContainerStyle={styles.list}
					renderItem={({ item }) => (
						<Pressable
							onPress={() => router.push(`/account/${item.id}`)}
						>
							<ProfileCard
								avatar_url={item.avatar_url}
								username={item.username}
							/>
						</Pressable>
					)}
					keyExtractor={(item) => item.id}
				/>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	modal: {
		margin: 20,
		backgroundColor: "white",
		borderRadius: 20,
		padding: 35,
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 5,
		width: 300,
		height: 60,
		justifyContent: "center",
		flexDirection: "row",
	},
	input: {
		width: 250,
		height: 40,
		padding: 10,
	},
	list: {
		width: 350,
		gap: 10,
	},
});
