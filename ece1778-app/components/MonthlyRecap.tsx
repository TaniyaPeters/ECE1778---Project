import { View, StyleSheet, ViewProps, Text } from "react-native";
import { globalStyles } from "@app/styles/globalStyles";
import { colorsType, Review } from "@app/types/types";
import Carousel from "./Carousel";
import ReviewListItem from "./ReviewListItem";
import { useEffect, useState } from "react";
import { Tables } from "@app/types/database.types";
import StarRating from "./starRating";
import { useSelector } from "react-redux";
import { RootState } from "@app/store/store";
import { selectTheme } from "@app/features/theme/themeSlice";
type Movie = Tables<"movies">;

type MonthlyRecapProps = ViewProps & {
  type: "Movie" | "Book";
  action: "Watched" | "Read";
  review?: Review[],
  data?: any
  highestRating?:number
  highestRatedMedia?:any[]
};


export default function MonthlyRecap({ type, action, review, data, highestRatedMedia, highestRating = 0}: MonthlyRecapProps) {
  useEffect(() => {
    setDataMovies(data)
    setReviews(review)
    setHighestRatedMedia(highestRatedMedia)
    setHighestRating(highestRating)
  }, [data, review, highestRatedMedia, highestRating]);
  const [newData, setDataMovies] = useState<Movie[]>();
  const [newReview, setReviews] = useState<Review[]>();
  const [newHighestRatedMedia, setHighestRatedMedia] = useState<Movie[]>();
  const [newHighestRating, setHighestRating] = useState<number>(0);

  const previousMonth = new Date(new Date().getFullYear(), new Date().getMonth() - 1)
  const monthToString = new Intl.DateTimeFormat("en-US", { month: "long", year: 'numeric' }).format(previousMonth);
  const numberHighestRated: number = newHighestRatedMedia ? Object.keys(newHighestRatedMedia).length : 0;
  const lastReview:Review |undefined = newReview? newReview.find((index)=>(index.review!=null)):undefined;
  
  const colors = useSelector((state:RootState)=>selectTheme(state));
  const styles = getStyles(colors)
  const setGlobalStyles = globalStyles()

  return (
     <View style={styles.card}>
      <View style={styles.headerView}>
        <Text style={styles.headerText}>{monthToString} {type} Recap</Text>
      </View>
      <View>
        <View style={{flexDirection:'row', justifyContent:'space-between'}}>
          <Text style={setGlobalStyles.paragraph}>{type}s {action}:</Text>
          <Text style={styles.emphasisText}>{newData ? Object.keys(newData).length.toString() : '-'}</Text>
        </View>
        <View style={{paddingTop:10, paddingBottom:20}}>
          <Carousel cards={newData}></Carousel>
        </View>
        <View style={{flexDirection:'row'}}>
          <View style={{flexDirection:'column', justifyContent:'flex-end'}}>
            <Text style={styles.emphasisText}>{numberHighestRated.toString()}</Text>
          </View>
          <View style={{flexDirection:'column', justifyContent:'flex-end'}}>
            <Text style={setGlobalStyles.paragraph}>  {type}s Rated  </Text>
          </View>
          <View style={{flexDirection:'column', justifyContent:'flex-end', paddingBottom:10}}>
            <StarRating rating={newHighestRating} color={colors.secondary}></StarRating>
          </View>
        </View>
        <Carousel cards={newHighestRatedMedia}></Carousel>
        <Text style={[setGlobalStyles.paragraph, { alignItems: "flex-end" }]}>Number of {type} Reviews Left:</Text>
        <Text style={styles.emphasisText}>{newReview ? Object.keys(newReview.filter((index) => index.review !=null)).length.toString() : 0}</Text>
        <Text style={[setGlobalStyles.paragraph, { alignItems: "flex-end" }]}>Last {type} Review Left:</Text>
        {lastReview ? <ReviewListItem review={lastReview}></ReviewListItem>:null}
      </View>
    </View>
  );
}

function getStyles(colors:colorsType){
  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.tertiary,
      borderRadius: 8,
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 5,
      elevation: 3,
      marginLeft:5,
      marginRight:5,
      marginBottom: 10,
      padding: 10,
    },
    headerText: {
      fontSize: 30,
      fontWeight: "bold",
      color: colors.secondary
    },
    headerView: {
      borderColor: colors.secondary,
      borderBottomWidth: 1,
      margin: 0,
    },
    emphasisText: {
      fontSize: 50,
      color: colors.secondary,
      textAlign: "right",
      fontWeight: 'bold'
    },
  });
  return styles
}
