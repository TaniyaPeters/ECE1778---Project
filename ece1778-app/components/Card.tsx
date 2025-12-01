import { selectTheme } from "@app/features/theme/themeSlice";
import { RootState } from "@app/store/store";
import { colorsType } from "@app/types/types";
import {
  View,
  StyleSheet,
  ViewProps,
  StyleProp,
  ViewStyle,
} from "react-native";
import { useSelector } from "react-redux";

type Props = ViewProps & {
  style?: StyleProp<ViewStyle>;
};

export default function Card({ children, style, ...props }: Props) {
  const colors = useSelector((state:RootState)=>selectTheme(state));
  const styles = getStyles(colors)

  return (
    <View style={[styles.card, style]} {...props}>
      {children}
    </View>
  );
}

function getStyles(colors:colorsType){  
  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      padding: 10,
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 5,
      elevation: 3,
      margin: 15,
    },
  });
  return styles
}