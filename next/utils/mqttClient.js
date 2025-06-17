import mqtt from "mqtt";

let client = null;

const getMqttClient = () => {
    if (!client) {
        const brokerUrl = process.env.MQTT_BROKER_URL || "wss://broker.emqx.io:8084/mqtt";
        const clientId = `nextjs-server-${Math.random().toString(16).slice(2, 10)}`;

        client = mqtt.connect(brokerUrl, {
            clientId,
            clean: true,
            connectTimeout: 4000,
            reconnectPeriod: 1000,
        });

        client.on("connect", () => {
            console.log("MQTT Server Client Connected");
        });

        client.on("error", (err) => {
            console.error("MQTT Server Client Error:", err);
        });
    }
    return client;
};

export const publishMessage = (topic, message) => {
    const mqttClient = getMqttClient();
    if (mqttClient && mqttClient.connected) {
        mqttClient.publish(topic, message, { qos: 0 }, (err) => {
            if (err) {
                console.error(`Failed to publish message to ${topic}:`, err);
            } else {
                console.log(`Message published to ${topic}`);
            }
        });
    } else {
        console.error("MQTT client not connected");
    }
};
