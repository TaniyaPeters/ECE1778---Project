import {View, StyleSheet, ViewProps, Text, ScrollView} from "react-native";
import { colors } from "../constants/colors";
import { globalStyles } from "@app/styles/globalStyles";
import { Review } from "@app/types";
import Card from "./Card";
import StarRating from "./starRating";
import Carousel from "./Carousel";
import ReviewListItem from "./ReviewListItem";

type MonthlyRecapProps = ViewProps & {
  user:String
  type:"Movie"|"Book";
  action:"Watched"|"Read";
  review?:Review,
};


export default function MonthlyRecap({type, action, review}: MonthlyRecapProps) {
  const views=[
    <View key={0} style={styles.cardCollection}><Text style={globalStyles.paragraph}>{type} Name</Text><Text style={globalStyles.paragraph}>{type} Image</Text><StarRating rating={5}></StarRating></View>, 
    <View key={1} style={styles.cardCollection}><Text style={globalStyles.paragraph}>{type} Name</Text><Text style={globalStyles.paragraph}>{type} Image</Text><StarRating rating={5}></StarRating></View>,
    <View key={2}style={styles.cardCollection}><Text style={globalStyles.paragraph}>{type} Name</Text><Text style={globalStyles.paragraph}>{type} Image</Text><StarRating rating={5}></StarRating></View>,
    <View key={3}style={styles.cardCollection}><Text style={globalStyles.paragraph}>{type} Name</Text><Text style={globalStyles.paragraph}>{type} Image</Text><StarRating rating={5}></StarRating></View>,
    <View key={4}style={styles.cardCollection}><Text style={globalStyles.paragraph}>{type} Name</Text><Text style={globalStyles.paragraph}>{type} Image</Text><StarRating rating={5}></StarRating></View>,
    <View key={5}style={styles.cardCollection}><Text style={globalStyles.paragraph}>{type} Name</Text><Text style={globalStyles.paragraph}>{type} Image</Text><StarRating rating={5}></StarRating></View>,
  ]
  const previousMonth = new Date(new Date().getFullYear(), new Date().getMonth() - 1)
  const monthToString = new Intl.DateTimeFormat("en-US", { month: "long", year:'numeric'}).format(previousMonth);
  if(!review){
    review = {
      id: 1,
      user: "bob123",
      text: "This movie is a delight for those of all ages. I have seen it several times and each time I am enchanted by the characters and magic. The cast is outstanding, the special effects delightful, everything most believable.",
    }
  }
  return (
  <View style={styles.card}>
    <View style={styles.headerView}>
      <Text style={styles.headerText}>{monthToString} {type} Recap</Text>
    </View>
    <View>
      <Text style={[globalStyles.paragraph,{alignItems:"flex-end"}]}>{type}s {action}:</Text>
      <Text style={styles.emphasisText}>25</Text>
      <Text style={[globalStyles.paragraph,{alignItems:"flex-end"}]}>Highest Rated {type}(s): </Text>
      <Carousel children={views}></Carousel>
      <Text style={[globalStyles.paragraph,{alignItems:"flex-end"}]}>Number of Reviews Left:</Text>
      <Text style={styles.emphasisText}>25</Text>
      <Text style={[globalStyles.paragraph,{alignItems:"flex-end"}]}>Last Reviewed {type}:</Text>
      <Text style={[styles.emphasisText]}>{type} Name</Text>
      <ReviewListItem review={review}></ReviewListItem>
    </View>
  </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.light.tertiary,
    borderRadius: 8,
    marginTop:5,
    shadowColor: colors.light.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
    marginBottom:5,
    padding:15,
  },
  headerText:{
    fontSize:30,
    fontWeight:"bold",
    color:colors.light.secondary
  },
  headerView:{
    borderColor:colors.light.secondary,
    borderBottomWidth:1,
    margin:0,
  },
  emphasisText:{
    fontSize:30,
    color:colors.light.secondary,
    textAlign:"right",
    fontWeight:'bold'
  },
  
  cardCollection:{
    borderWidth :1,
    margin:5,
    padding:5,
  },
  carousel:{
    flexDirection:'row',
    backgroundColor:colors.light.background,
    padding:5,
  }
});
