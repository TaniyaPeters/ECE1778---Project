import { MaterialIcons } from "@expo/vector-icons";
import { Platform } from "react-native";
import { NativeTabs, Icon, Label, VectorIcon } from "expo-router/unstable-native-tabs";
import { useSelector } from "react-redux";
import { RootState } from "@app/store/store";
import { selectTheme } from "@app/features/theme/themeSlice";
	
export default function MainLayout() {
	const colors = useSelector((state:RootState)=>selectTheme(state));
	return (
		<NativeTabs
			iconColor={colors.secondary}
			backgroundColor={colors.background}
			labelStyle={{color:colors.secondary}}
			indicatorColor={colors.secondary+'30'}
			>
			<NativeTabs.Trigger name="(tabs)/(home)">
				<Label>Home</Label>
				{Platform.select({
					ios: <Icon sf="house.fill" />,
					android: (
						<Icon
							src={
								<VectorIcon
									family={MaterialIcons}
									name="home"
								/>
							}
						/>
					),
				})}
			</NativeTabs.Trigger>
			<NativeTabs.Trigger name="(tabs)/(search)">
				<Label>Search</Label>
				{Platform.select({
					ios: <Icon sf="magnifyingglass" />,
					android: (
						<Icon
							src={
								<VectorIcon
									family={MaterialIcons}
									name="search"
								/>
							}
						/>
					),
				})}
			</NativeTabs.Trigger>
			<NativeTabs.Trigger name="(tabs)/(library)">
				<Label>Library</Label>
				{Platform.select({
					ios: <Icon sf="folder.fill" />,
					android: (
						<Icon
							src={
								<VectorIcon
									family={MaterialIcons}
									name="book"
								/>
							}
						/>
					),
				})}
			</NativeTabs.Trigger>
			<NativeTabs.Trigger name="(tabs)/account">
				<Label>Account</Label>
				{Platform.select({
					ios: <Icon sf="person.bust.fill" />,
					android: (
						<Icon
							src={
								<VectorIcon
									family={MaterialIcons}
									name="person"
								/>
							}
						/>
					),
				})}
			</NativeTabs.Trigger>
		</NativeTabs>
	);
}