import React, { useEffect } from "react";
import { View, Text, Button, StyleSheet, Alert } from "react-native";
import { useBodyMetrics } from "../hooks/useBodyMetrics";
import HealthKit, { HealthKitPermissions } from "react-native-health";

export default function ConnectHealth() {
    const { connected, metrics, connect, refresh } = useBodyMetrics();



    return (
        <View style={styles.container}>
            <Text style={styles.title}>Connect Health Device</Text>

            <Button
                title={connected ? "Connected ✅" : "Connect"}
                onPress={connect}
                disabled={connected}
            />

            {connected && (
                <Button title="Get Latest Metrics" onPress={refresh} />
            )}

            {metrics && (
                <View style={styles.metrics}>

                    <Text>Weight: {metrics.weight_kg} kg</Text>
                    <Text>Body Fat: {metrics.body_fat_pct}%</Text>
                    <Text>BMI: {metrics.bmi} %</Text>
                    <Text>Height: {metrics.height} m</Text>
                    {metrics.lean_mass_kg && <Text>Muscle: {metrics.lean_mass_kg} kg</Text>}
                    {/* {metrics.water && <Text>Water: {metrics.water}%</Text>} */}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", alignItems: "center" },
    title: { fontSize: 20, marginBottom: 20 },
    metrics: { marginTop: 20 },
});
