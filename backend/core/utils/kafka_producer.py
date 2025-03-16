from kafka import KafkaProducer
import json
import os


class KafkaProducerSingleton:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = KafkaProducer(
                bootstrap_servers=os.getenv(
                    "KAFKA_BROKER_URL", "kafka:9092,kafka2:9092"
                ).split(","),
                value_serializer=lambda v: json.dumps(v).encode("utf-8"),
                acks=1,
            )
        return cls._instance


producer = KafkaProducerSingleton()
