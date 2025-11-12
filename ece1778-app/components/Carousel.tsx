import { colors } from "@app/constants/colors";
import { useEffect, useRef } from "react";
import {ScrollView, StyleSheet, ViewProps, Text, StyleProp, ViewStyle, View, Button, Dimensions, FlatList, TouchableOpacity,} from "react-native";
import GeneralCard from "./generalCard";
import { router } from "expo-router";
import { globalStyles } from "@app/styles/globalStyles";
import StarRating from "./starRating";
import AutoImage from "./autoScaledImage";
import { getLocalImage } from "@app/constants/postersMap";

type Props = ViewProps & {
  cards?: any;
  style?: StyleProp<ViewStyle>;
};



export default function Carousel({ cards, style, ...props }: Props) {
  if(!cards){
    cards = <Text>There is Nothing to Show</Text>
  }

  return (
    <ScrollView horizontal={true} pagingEnabled={true} snapToStart={true} snapToEnd={true} snapToInterval={200} style={[styles.carousel, style]} {...props}>
      <FlatList
              data={cards}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false} // Use ScrollView's scrolling instead
              horizontal={true}
              renderItem={({ item }) => {
                // Determine image source for the movie
                let imageSource: string;
                let localPath: boolean = false;

                if (item.poster_path) {
                  // Use TMDB poster URL - poster_path should be a poster path (e.g., "/abc123.jpg")
                  const posterPath = item.poster_path.startsWith("/")
                    ? item.poster_path
                    : `/${item.poster_path}`;
                  imageSource = `https://image.tmdb.org/t/p/w500${posterPath}`;
                  localPath = false;
                } else {
                  // Fallback to local image
                  imageSource = "brokenImage";
                  localPath = true;
                }

                return (
                  <TouchableOpacity
                    onPress={() => router.push(`../movieDetails/${item.id}`)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.cardCollection}>
                      <AutoImage 
                        style={{ width: 60 }}
                        source={localPath ? getLocalImage(imageSource) : { uri: imageSource }}
                      />                      
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  carousel:{
    flexDirection:'row',
    backgroundColor:colors.light.tertiary,
    padding:5,
  },
  cardCollection:{
    borderWidth :0,
    padding:5,
    margin:5,
    elevation:3
  },
});
