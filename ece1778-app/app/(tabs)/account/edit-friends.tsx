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
import { useTheme } from "@contexts/ThemeContext";

type Friend = {
	id: string;
	avatar_url: string | null;
	username: string;
};

export default function EditFriendsScreen() {
	const { session } = useAuthContext();
	const { theme } = useTheme();
	const [modalVisible, setModalVisible] = useState(false);
	const [addFriendInput, setAddFriendInput] = useState("");
	const [friends, setFriends] = useState<Array<Friend>>([]);

	const getProfileByIds = async (ids: string[]) => {
		let { data, error } = await supabase
			.from("profiles")
			.select("id, avatar_url, username")
			.in("id", ids);

		if (error) {
			Alert.alert("Error", error.message);
			return [];
		}

		return data ?? [];
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

		const friendsList = await getProfileByIds(
			data.map((friend) => friend.friend_id)
		);

		setFriends(friendsList);
	};

	const getUserByUsername = async (username: string) => {
		const { data, error } = await supabase
			.from("profiles")
			.select("*")
			.eq("username", username)
			.single();

		if (error) {
			return null;
		}

		return data;
	};

	const addFriend = async () => {
		if (!session) return;

		const friend = await getUserByUsername(addFriendInput);
		if (!friend) {
			Alert.alert("Error", "User not found");
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

	const removeFriend = async (friend_id: string) => {
		if (!session) return;

		const { data, error } = await supabase
			.from("friends")
			.delete()
			.eq("id", session.user.id)
			.eq("friend_id", friend_id)
			.select();

		if (error) {
			Alert.alert("Error", error.message);
			return;
		}

		getFriends();
	};

	useEffect(() => {
		getFriends();
	}, [session]);

	return (
		<SafeAreaView
			style={[
				globalStyles.container,
				{
					paddingTop: 0,
					backgroundColor:
						theme === "light"
							? accountStyles.bgLight.backgroundColor
							: accountStyles.bgDark.backgroundColor,
				},
			]}
		>
			<View
				style={[
					accountStyles.container,
					theme === "light"
						? accountStyles.bgLight
						: accountStyles.bgDark,
				]}
			>
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
								<Pressable
									style={({ pressed }) => [
										{ opacity: pressed ? 0.6 : 1 },
									]}
									onPress={addFriend}
								>
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
							theme === "light"
								? accountStyles.textLight
								: accountStyles.textDark,
							{ flex: 3 },
						]}
					>
						Friends
					</Text>
					<Pressable
						style={({ pressed }) => [
							{
								flex: 1,
								alignItems: "flex-end",
								paddingBottom: 10,
								opacity: pressed ? 0.6 : 1,
							},
						]}
						onPress={() => setModalVisible(true)}
					>
						<Image
							source={
								theme === "light"
									? require("@assets/add-friend-dark.png")
									: require("@assets/add-friend-white.png")
							}
							style={accountStyles.icon}
						/>
					</Pressable>
				</View>
				<FlatList
					data={friends}
					contentContainerStyle={styles.list}
					renderItem={({ item }) => (
						<Pressable
							style={({ pressed }) => [
								{ opacity: pressed ? 0.6 : 1 },
							]}
							onPress={() => router.push(`/account/${item.id}`)}
						>
							<ProfileCard
								avatar_url={item.avatar_url ?? ""}
								username={item.username}
								removeFriend={() => removeFriend(item.id)}
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
