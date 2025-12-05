import { useEffect, useState } from "react";
import { Alert, View, Text, TextInput, StyleSheet, Modal, TouchableOpacity, Pressable } from "react-native";
import { colorsType, Review } from "@app/types/types";
import { globalStyles } from "@styles/globalStyles";
import { useSelector } from "react-redux";
import { RootState } from "@app/store/store";
import { selectTheme } from "@app/features/theme/themeSlice";

type Props = {
    visible: boolean;
    review: Review | null;
    onSubmit: (ratingNew: number, reviewTextNew: string) => void;
    onClose: () => void;
};

export default function RatingReviewPopup ({ visible, review, onClose, onSubmit }: Props) {
    const [rating, setRating] = useState<number>(review?.rating ?? -1);
    const [reviewText, setReviewText] = useState<string>(review?.review ?? "");
	const colors = useSelector((state:RootState)=>selectTheme(state));
	const styles = getStyles(colors)
	const setGlobalStyles = globalStyles()

    useEffect(() => {
        if (visible) {
            setRating(review?.rating ?? -1);
            setReviewText(review?.review ?? "");
        }
    }, [visible, review])

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalBox}>
                    <Text style={[setGlobalStyles.titleText, styles.title]}>Your Rating and Review</Text>
                    
                    {/*Input for rating*/}
                    <Text style={[setGlobalStyles.paragraphBold, styles.labelText, {color: colors.secondary}]}>Rating:</Text>
                    <View style={styles.starsContainer}>
                        {[1, 2, 3, 4, 5].map(num => (
                        <TouchableOpacity key={num} onPress={() => setRating(num)}>
                            <Text style={[styles.star, rating >= num ? styles.filledStar : styles.emptyStar]}>
                            ★
                            </Text>
                        </TouchableOpacity>
                        ))}
                    </View>
                        
                    {/*Input for review*/}
                    <Text style={[setGlobalStyles.paragraphBold, styles.labelText, {color: colors.secondary}]}>Review:</Text>
                    <TextInput
                        placeholder="Write your review..."
                        placeholderTextColor={colors.secondary}
                        value={reviewText}
                        onChangeText={setReviewText}
                        multiline
                        scrollEnabled={true}
                        style={[styles.input, { height: 100, color: colors.secondary, borderColor: colors.secondary }]}
                    />
                
                    {/*Cancel and Submit buttons*/}
                    <View style={styles.buttonContainer}>
                        <Pressable
                            style={({ pressed }: { pressed: boolean }) => [
                                styles.buttonCancel, { opacity: pressed ? 0.6 : 1},
                            ]}
                            onPress={onClose}
                        >
                            <Text style={[setGlobalStyles.paragraphBold, styles.buttonText, {color: colors.white}]}>Cancel</Text>
                        </Pressable>
                        <Pressable
                            style={({ pressed }: { pressed: boolean }) => [
                                styles.buttonSubmit, { opacity: pressed ? 0.6 : 1},
                            ]}
                            onPress={() => {
                                if (rating <=0) {
                                    Alert.alert("Missing rating", "Please select a rating before submitting.");
                                    return;
                                }
                                onSubmit(rating, reviewText)
                            }}
                        >
                            <Text style={[setGlobalStyles.paragraphBold, styles.buttonText, {color: colors.background}]}>Submit</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
    
function getStyles(colors:colorsType){
    const styles = StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
        },
        modalBox: {
            backgroundColor: colors.background,
            width: "85%",
            maxHeight: "80%",
            borderRadius: 12,
            padding: 20,
            shadowColor: colors.black,
            shadowOpacity: 0.3,
            shadowOffset: { width: 0, height: 2 },
            overflow: "hidden"
        },
        title: {
            fontSize: 25,
            marginBottom: 15,
        },
        row: {
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            maxHeight: 100,
            paddingBottom: 20,
        },
        labelText: {
            fontSize: 18,
        },
        starsContainer: {
            flexDirection: "row",
            justifyContent: "center",
            marginVertical: 10,
        },
        star: {
            fontSize: 35,
            marginHorizontal: 5,
        },
        filledStar: {
            color: "#FFD700",
        },
        emptyStar: {
            color: "#CCCCCC",
        },
        input: {
            width: "100%",
            minHeight: 100,
            maxHeight: 250,
            backgroundColor: colors.background,
            borderWidth: 1,
            borderColor: colors.black,
            borderRadius: 8,
            padding: 10,
            marginBottom: 10,
            fontSize: 16,
            color: colors.black,
            textAlignVertical: "top",
            flexShrink: 1,
        },
        buttonContainer: {
            flexDirection: "row",
            justifyContent: "space-between",
        },
        buttonCancel: {
            paddingVertical: 8,
            width: 90,
            height: 50,
            borderRadius: 18,
            alignItems: "center",
            justifyContent: "center",
            marginTop: 16,
            backgroundColor: colors.danger,
        },
        buttonSubmit: {
            paddingVertical: 8,
            width: 90,
            height: 50,
            borderRadius: 18,
            alignItems: "center",
            justifyContent: "center",
            marginTop: 16,
            backgroundColor: colors.secondary,
        },
        buttonText: {
            fontSize: 14,
        }
    });
    return styles
}