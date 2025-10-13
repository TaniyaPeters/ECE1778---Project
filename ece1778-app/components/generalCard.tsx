import React from 'react';
import { View, Text } from 'react-native';
import StarRating from './starRating';
import AutoImage from './autoScaledImage';
import { FontAwesome } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { StyleSheet } from "react-native";
import { dimentions } from "../constants/dimentions";
import { getLocalImage } from '../constants/postersMap';

type GeneralCardProps = {
  image: string;
  localPath: boolean;
  name: string;
  leftSubText?: string;
  rightSubText?: string;
  views?: boolean;
  starRating?: number;
};

const GeneralCard = ({ image, localPath, name, leftSubText = '', rightSubText = '', views = false, starRating }: GeneralCardProps) => {
  return (
    <View style={styles.card}>
        <AutoImage style={{ width: 60 }} source={ localPath ? getLocalImage(image) : { uri: image } } /> 
        <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderText}>{name}</Text>
            <Text style={styles.cardSubText}>{leftSubText}</Text>
        </View>
        <View style={styles.cardFooter}>
            {starRating && (
                <StarRating rating={starRating} color={colors.light.background} />
            )}

            <Text style={styles.cardSubText}>
                {rightSubText}
                {views && (
                <> 
                    {' '}
                    <FontAwesome name="eye" size={24} color={colors.light.text} />
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
        flexDirection: 'row',
        backgroundColor: colors.light.secondary,
        borderRadius: 5,
        width: dimentions.windowWidth * 0.95,
        // height: dimentions.windowHeight * 0.1,
        padding: 10,
        justifyContent: 'center',
        // alignItems: 'center',
        margin: 5,
    },
    cardHeader: {
        flex: 1, 
        marginLeft: 15, 
        paddingVertical: 10,
        justifyContent: 'flex-start', 
        gap: 10,
    },
    cardFooter: {
        flex: 1, 
        marginRight: 10,
        paddingVertical: 10,
        justifyContent: 'center', 
        alignItems: 'flex-end',
        gap: 10,
    },
    cardHeaderText: {
        color: colors.light.text,
        fontSize: 25,
        fontWeight: "bold",
    },
    cardSubText: {
        color: colors.light.text,
        fontSize: 15,
    },
});