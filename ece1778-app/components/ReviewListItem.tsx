import { View, Text, StyleSheet } from "react-native";
import { Review } from "../types";
import Card from "./Card";
import { colors } from "../constants/colors";
import { globalStyles } from "../styles/globalStyles";

type Props = {
  review: Review;
};

export default function ReviewListItem({ review }: Props) {
  return (
    <Card style={styles.card}>
      <View style={styles.content}>
        {/* User who wrote review */}
        <Text style={[globalStyles.paragraph, styles.text]}>{review.user}</Text>
        {/* Divider line */}
        <View style={styles.line} />
        {/* Review text */}
        <Text style={[globalStyles.paragraph, styles.text]}>{review.text}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  content: {
    flex: 1,
    flexDirection: "column",
  },
  text: {
    fontSize: 17,
    marginVertical: 3,
  },
  line: {
    height: 1,
    backgroundColor: colors.light.black,
    width: "100%",
    marginVertical: 10,
  },
});
