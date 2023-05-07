import { KafkaProducer, ProducerConfig } from "@dinedrop/shared";

const producerConfig: ProducerConfig = {
  clientId: "dinedrop-kafka",
  brokers: ["my-cluster-kafka-bootstrap.kafka:9092"],
  maxInFlightRequests: 1,
  idempotent: true,
};

const producer = new KafkaProducer(producerConfig);

async function sendMessageToKafkaTopic(
  topic: string,
  message: any
): Promise<void> {
  await producer.connect();

  await producer.produce(topic, message);

  await producer.disconnect();
}

export { sendMessageToKafkaTopic };
