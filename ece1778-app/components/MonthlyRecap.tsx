import {
  View,
  StyleSheet,
  ViewProps,
  StyleProp,
  ViewStyle,
} from "react-native";
import { colors } from "../constants/colors";

type MonthlyRecapProps = ViewProps & {
  style?: StyleProp<ViewStyle>;
};

export default function MonthlyRecap({ children, style, ...props }: MonthlyRecapProps) {
  return (
    <View style={[styles.card, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.light.primary,
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: colors.light.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
});
