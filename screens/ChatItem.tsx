import React from "react"
import { countPdfsInMessage, extractAllPdfDetails, extractPdfDetails, workoutPdfMessage } from "../app/api-calls/helper"
import { Image, StyleSheet, TouchableOpacity, View, Text, Dimensions } from "react-native"
import { FontAwesome5 } from "@expo/vector-icons"
import * as WebBrowser from 'expo-web-browser';





const ChatItem = React.memo(({ message, index, user, toggleAudio }) => {
    let pdfDetails = workoutPdfMessage(message?.response)
    let pdfCheck = extractPdfDetails(message?.response)
    let bloodTestQuery = message?.bloodWorkQuery
    let pdfCount = countPdfsInMessage(message?.response)
    let pdfArray: any = []
    if (pdfCount > 1) {
        pdfArray = extractAllPdfDetails(message?.response)
    }




    if (typeof message?.query === "object") {
        console.log("HEHHEHHEHE", message)
    }

    console.log("MESSAGE <QUERY", message?.query);



    return (
        <View style={styles.messageBubbleContainer}>
            {/* My Message */}
            <View style={styles.myMessageBubble}>
                <Text style={styles.messageSender}>{user?.name}</Text>
                {bloodTestQuery ? (
                    <TouchableOpacity>
                        <Text>You uploaded blood test {bloodTestQuery?.file?.name}</Text>
                    </TouchableOpacity>
                ) : (
                    <Text>
                        {typeof message?.query === "string"
                            ? message?.query :
                            message?.query?.query ? message?.query?.query :
                                JSON.stringify(message.query)}
                    </Text>
                )}
                {message?.imagePath && (
                    <Image source={{ uri: message?.imagePath }} style={styles.messageImage} />
                )}
            </View>

            {/* ONE's Message */}
            <View style={styles.oneMessageBubble}>
                <View style={styles.oneMessageHeader}>
                    <Text style={styles.messageSender}>ONE</Text>
                    {message?.audioUrl && (
                        <TouchableOpacity onPress={() => toggleAudio(message?.audioUrl)} style={styles.audioButton}>
                            {/* Play/Stop icon */}
                        </TouchableOpacity>
                    )}
                </View>

                {pdfArray?.length > 1 ? (
                    <View>
                        {pdfArray.map((pdf: any, idx: number) => (
                            <TouchableOpacity
                                key={`${message.id || index}-pdf-${idx}`}
                                onPress={() => WebBrowser.openBrowserAsync(pdf?.url || "")}
                                style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, borderWidth: 1, padding: 10, borderRadius: 10 }}>
                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                    <FontAwesome5 name={"file-pdf"} size={20} />
                                    <Text style={{ maxWidth: "80%", marginLeft: 10 }}>{pdf?.displayName}</Text>
                                </View>
                                <FontAwesome5 name={"download"} size={15} />
                            </TouchableOpacity>
                        ))}
                    </View>
                ) : message?.pdf || pdfCheck ? (
                    <View>
                        <Text>{message?.pdfDetails?.beforePdf || pdfDetails?.beforePdf}</Text>
                        <TouchableOpacity
                            onPress={() => WebBrowser.openBrowserAsync(pdfDetails?.response?.url || "")}
                            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, borderWidth: 1, padding: 10, borderRadius: 10 }}>


                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <FontAwesome5 name={"file-pdf"} size={20} />
                                <Text style={{ maxWidth: "80%", marginLeft: 10 }}>
                                    {message?.pdfDetails?.response?.displayName || pdfDetails?.response?.displayName}
                                </Text>
                            </View>
                            <FontAwesome5 name={"download"} size={15} />
                        </TouchableOpacity>
                        {message?.pdfDetails?.afterPdf && <Text>{message?.pdfDetails?.afterPdf}</Text>}
                    </View>
                ) : (
                    <Text>
                        {typeof message?.response === "string"
                            ? message?.response :
                            message?.response?.response ? message?.response?.response :
                                JSON.stringify(message?.response)}
                    </Text>
                )}
            </View>
        </View>
    )
})


export default ChatItem

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "row",
        backgroundColor: "#F3F4F6",
        paddingHorizontal: 16,

    },
    mainContent: {
        // flex: 1,
        padding: 16,
        height: Dimensions.get("window").height * 1
        // marginLeft: 64, // Adjust based on sidebar width
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginLeft: 8,
    },
    chatContainer: {
        flex: 1,
        height: Dimensions.get("window").height * 0.8

    },
    chatCard: {
        flex: 1,
        height: "100%",
        borderWidth: 1,
        borderColor: 'red'
    },
    chatContent: {
        flex: 1,
        justifyContent: "space-between",
    },
    messagesScrollView: {
        flex: 1,
        paddingRight: 10,
    },
    messageBubbleContainer: {
        marginBottom: 10,
    },
    myMessageBubble: {
        backgroundColor: "#DCF8C6",
        padding: 10,
        borderRadius: 8,
        alignSelf: "flex-end",
        maxWidth: "90%",
    },
    oneMessageBubble: {
        backgroundColor: "#E5E7EB",
        padding: 10,
        borderRadius: 8,
        alignSelf: "flex-start",
        maxWidth: "90%",
        marginTop: 5,
    },
    messageSender: {
        fontWeight: "bold",
        marginBottom: 5,
    },
    messageImage: {
        width: 150,
        height: 150,
        borderRadius: 8,
        marginTop: 10,
    },
    oneMessageHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 5,
    },
    audioButton: {
        padding: 5,
    },
    thinkingContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 10,
    },
    thinkingText: {
        marginLeft: 5,
        color: "gray",
    },
    controlsContainer: {
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: "#EEEEEE",
    },
    voiceLocationContainer: {
        flexDirection: "row",
        alignItems: "center",
        width: '100%',
        justifyContent: 'space-between',
        marginTop: 10
    },
    switchLabelContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
    },
    label: {
        fontSize: 16,
    },
    locationButton: {
        borderWidth: 1,
        borderColor: "black",
        justifyContent: "center",
        alignItems: "center",
        width: 30,
        height: 30,
        borderRadius: 8,
    },
    locationEnabledButton: {
        borderWidth: 1,
        borderColor: "black",
        justifyContent: "center",
        alignItems: "center",
        width: 30,
        height: 30,
        borderRadius: 8,
        backgroundColor: "#007BFF"
    },
    locationButtonText: {
        color: "black",
    },
    locationEnabledButtonText: {
        color: "white",
    },
    imagePreviewContainer: {
        position: "relative",
        marginBottom: 10,
    },
    imagePreview: {
        width: 80,
        height: 80,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#EEEEEE",
    },
    clearImageButton: {
        position: "absolute",
        top: -10,
        right: -10,
        // backgroundColor: "red",
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: "center",
        alignItems: "center",
    },
    inputButtonContainer: {
        flexDirection: "row",
        gap: 10,
        borderWidth: 1,
        borderRadius: 8,
        alignItems: 'center',
        paddingHorizontal: 10,

    },
    textInput: {
        flex: 1,
        // borderWidth: 1,
        // borderColor: "gray",
        // borderRadius: 8,
        // paddingHorizontal: 10,s

    },
    recordingButton: {
        backgroundColor: "#FFCCCC",
    },
    recordingButtonTouchable: {
        // padding: 10,
        borderWidth: 1,
        borderColor: "black",
        justifyContent: "center",
        alignItems: "center",
        width: 30,
        height: 30,
        borderRadius: 8,
        backgroundColor: 'white'
    },
    preparingButton: {
        backgroundColor: "#F0F0F0",
        opacity: 0.7,
    },
    quickAccessContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        // marginTop: 20,
    },
    quickAccessCard: {
        width: "30%", // Adjust as needed
        marginBottom: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "red",
        backgroundColor: "white",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.20,
        shadowRadius: 1.41,
        elevation: 2,
    },
    quickAccessCardContent: {
        padding: 15,
        alignItems: "center",
    },
    quickAccessCardTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginTop: 10,
    },
    quickAccessCardDescription: {
        fontSize: 12,
        color: "gray",
        textAlign: "center",
        marginTop: 5,
    },
    recordingTip: {
        fontSize: 12,
        color: "#666",
        fontStyle: "italic",
        textAlign: "center",
        marginTop: 5,
    },
    icon: {
        width: 20,
        height: 20,
        marginRight: 6
    },
});
