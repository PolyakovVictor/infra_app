from confluent_kafka import Producer
import json
import logging

logger = logging.getLogger(__name__)

producer = Producer({'bootstrap.servers': 'kafka:9092'})

def delivery_report(err, msg):
    if err is not None:
        logger.error(f"Delivery failed: {err}")
    else:
        logger.debug(f"Message delivered to {msg.topic()} [{msg.partition()}]")

def send_kafka_event(topic: str, data: dict):
    try:
        print(f'######## RECIVED send kafka event topic: {topic}, data: {data}')
        json_data = json.dumps(data).encode('utf-8')
        producer.produce(
            topic=topic,
            value=json_data,
            callback=delivery_report
        )
        producer.poll(0)
        producer.flush()
    except Exception as e:
        logger.exception(f"Error sending event to Kafka topic '{topic}': {e}")
