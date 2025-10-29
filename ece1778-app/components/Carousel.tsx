import { colors } from "@app/constants/colors";
import { useEffect, useRef } from "react";
import {ScrollView, StyleSheet, ViewProps, Text, StyleProp, ViewStyle, View, Button, Dimensions,} from "react-native";

type Props = ViewProps & {
  style?: StyleProp<ViewStyle>;
};


export default function Carousel({ children, style, ...props }: Props) {
  if(!children){
    children = <Text>There is Nothing to Show</Text>
  }

  return (
    <ScrollView horizontal={true} pagingEnabled={true} snapToStart={true} snapToEnd={true} snapToInterval={200} style={[styles.carousel, style]} {...props}>
      {children}
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  carousel:{
    flexDirection:'row',
    backgroundColor:colors.light.background,
    padding:5,
  }
});
