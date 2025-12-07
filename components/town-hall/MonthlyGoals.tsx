import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card"
import { useGetMyGoals } from "../../app/api-calls/FitnessTracking/FitnessTracking"
import { Progress } from "../ui/Progress"





const MonthlyGoals = () => {

    const { data: goals } = useGetMyGoals()
    console.log("GOALSSS", goals);

    return (
        <SafeAreaView style={[styles.container, {
            minHeight: goals?.length > 0 ? 200 : 0
        }]}>

            <ScrollView style={styles.messagesContainer}>
                {goals?.length > 0 && goals?.map((goal: any) => (
                    <View key={goal?.id} style={styles.goalItem}>
                        <View style={styles.goalTextContainer}>
                            <Text>{goal?.month}</Text>
                            <Text>
                                {Object.values(goal?.achieved || {}).filter(Boolean).length} / 2
                            </Text>
                        </View>
                        <Progress
                            value={
                                (Object.values(goal?.achieved || {}).filter(Boolean).length / 2) *
                                100
                            }
                        />
                    </View>
                ))
                }
            </ScrollView>

        </SafeAreaView>
    )

}

export default MonthlyGoals


const styles = StyleSheet.create({
    container: {
        flex: 1,
        maxHeight: 400,
    },
    noGoalsContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    card: {
        marginBottom: 16,
    },
    messagesContainer: {
        flex: 1,
        padding: 34,
        // padding:
    },
    goalItem: {
        marginVertical: 10,
    },
    goalTextContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 5,
    },
})