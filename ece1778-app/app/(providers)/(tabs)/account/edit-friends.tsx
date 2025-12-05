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
import { useSelector } from "react-redux";
import { RootState } from "@app/store/store";
import { selectTheme } from "@app/features/theme/themeSlice";
import { colorsType } from "@app/types/types";

type Friend = {
	id: string;
	avatar_url: string | null;
	username: string;
};

export default function EditFriendsScreen() {
	const { fetchProfile, session } = useAuthContext();
	const [modalVisible, setModalVisible] = useState(false);
	const [addFriendInput, setAddFriendInput] = useState("");
	const [friends, setFriends] = useState<Array<Friend>>([]);
	const colors = useSelector((state:RootState)=>selectTheme(state));
  	const setGlobalStyles = globalStyles()
	const styles = getStyles(colors)

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

		const { data: data2, error: error2 } = await supabase
			.from("profiles")
			.update({ friends: friends.length + 1 })
			.eq("id", session.user.id)
			.select();

		if (error2) {
			Alert.alert("Error", error2.message);
			return;
		}

		setAddFriendInput("");
		setModalVisible(false);
		fetchProfile();
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

		const { data: data2, error: error2 } = await supabase
			.from("profiles")
			.update({ friends: friends.length - 1 })
			.eq("id", session.user.id)
			.select();

		if (error2) {
			Alert.alert("Error", error2.message);
			return;
		}

		fetchProfile();
		getFriends();
	};

	useEffect(() => {
		getFriends();
	}, [session]);

	return (
		<SafeAreaView
			style={[
				setGlobalStyles.container,
				{
					paddingTop: 0,
					backgroundColor:colors.background
				},
			]}
		>
			<View
				style={[
					accountStyles.container,
					{backgroundColor: colors.background},
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
										{ color: colors.secondary },
										
									]}
									placeholder="Enter a username..."
									placeholderTextColor={colors.secondary}
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
										source={colors.name === "dark" ? 
											require("@assets/addIconWhite.png") 
											: require("@assets/addIconBlue.png")}
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
							{color: colors.text},
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
								colors.name === "light"
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

function getStyles(colors:colorsType){
	const styles = StyleSheet.create({
		modal: {
			margin: 20,
			backgroundColor: colors.background,
			borderWidth: 2,
  			borderColor: colors.secondary,
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
	return styles
}