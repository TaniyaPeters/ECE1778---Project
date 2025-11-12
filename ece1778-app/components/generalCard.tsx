import React from "react";
import { View, Text, Pressable } from "react-native";
import StarRating from "./starRating";
import AutoImage from "./autoScaledImage";
import { FontAwesome } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { StyleSheet, Image } from "react-native";
import { getLocalImage } from "../constants/postersMap";
import { globalStyles } from "@app/styles/globalStyles";

type GeneralCardProps = {
  image: string;
  localPath: boolean;
  name: string;
  leftSubText?: string;
  rightSubText?: string;
  views?: boolean;
  del?: boolean;
  delFunction?: () => void;
  add?: boolean;
  addFunction?: () => void;
  starRating?: number;
  backgroundColor?: string;
};

const GeneralCard = ({
  image,
  localPath,
  name,
  leftSubText = "",
  rightSubText = "",
  views = false,
  del = false,
  delFunction = () => {},
  add = false,
  addFunction = () => {},
  starRating,
  backgroundColor,
}: GeneralCardProps) => {
  return (
    <View style={[
      styles.card, 
      globalStyles.center,
      backgroundColor ? { backgroundColor } : {}
    ]}>
      <AutoImage
        style={{ width: 60 }}
        source={localPath ? getLocalImage(image) : { uri: image }}
      />
      <View style={styles.cardHeader}>
        <Text 
          style={styles.cardHeaderText}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {name}
        </Text>
        <Text style={styles.cardSubText}>{leftSubText}</Text>
      </View>
      <View style={styles.cardFooter}>
        {add && (
          <Pressable onPress={addFunction}>
            <Image
              source={require("../assets/addIcon.png")}
              style={{ width: 24, height: 24 }}
            />
          </Pressable>
        )}
        {starRating !== undefined && (
          <StarRating rating={starRating} color={colors.light.background} />
        )}
        {del && (
          <Pressable onPress={delFunction}>
            <Image
              source={require("../assets/trashIcon.png")}
              style={{ width: 24, height: 24 }}
            />
          </Pressable>
        )}

        <Text style={styles.cardSubText}>
          {rightSubText}
          {views && (
            <>
              {"  "}
              <FontAwesome
                name="eye"
                size={20}
                color={colors.light.secondary}
              />
            </>
          )}
        </Text>
      </View>
    </View>
  );
};

export default GeneralCard;

// or use this in AutoImage for external urls source={{ uri: 'https://example.com/pic.jpg' }}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: colors.light.primary,
    borderRadius: 8,
    padding: 10,
    justifyContent: "center",
    shadowColor: colors.light.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
    margin: 15,
    marginTop:0,
  },
  cardHeader: {
    flex: 1,
    marginLeft: 15,
    paddingVertical: 10,
    justifyContent: "flex-start",
    gap: 10,
  },
  cardFooter: {
    flex: 1,
    marginRight: 10,
    paddingVertical: 10,
    justifyContent: "center",
    alignItems: "flex-end",
    gap: 10,
  },
  cardHeaderText: {
    color: colors.light.secondary,
    fontSize: 25,
    fontWeight: "bold",
  },
  cardSubText: {
    color: colors.light.secondary,
    fontSize: 15,
  },
});
