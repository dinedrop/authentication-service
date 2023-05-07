import { KafkaProducer, ProducerConfig } from "@dinedrop/shared";

const producerConfig: ProducerConfig = {
  clientId: "dinedrop-kafka",
  brokers: ["localhost:9092"],
  maxInFlightRequests: 1,
  idempotent: true,
};

async function runProducer() {
  const producer = new KafkaProducer(producerConfig);
  await producer.connect();

  const message = { _id: "w09u9032u90f0909j90", name: "Rhythm Shandlya" };

  await producer.produce("quickstart", message);

  await producer.disconnect();
}

runProducer().catch((error) => console.error(error));
