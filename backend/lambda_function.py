import os
import json
import uuid
import boto3
from datetime import datetime

polly = boto3.client("polly")
translate = boto3.client("translate")
s3 = boto3.client("s3")
cloudwatch = boto3.client("cloudwatch")

OUTPUT_BUCKET = os.environ.get("OUTPUT_BUCKET")
PRESIGNED_EXPIRE = int(os.environ.get("PRESIGNED_EXPIRE", "3600"))

# Supported languages and default Polly voice
SUPPORTED_LANGUAGES = {
    "en": "Joanna",
    "fr": "Lea",
    "de": "Hans",
    "es": "Conchita",
    "it": "Carla",
    "pt": "Ines",
    "ja": "Mizuki",
    "ko": "Seoyeon",
    "ar": "Zeina",
    "ru": "Maxim",
    "nl": "Lotte"
}

def publish_metric(name: str, value: float, unit: str = "Count", dimensions=None):
    """Helper to push custom CloudWatch metrics."""
    try:
        metric_data = {
            "MetricName": name,
            "Unit": unit,
            "Value": value,
        }
        if dimensions:
            metric_data["Dimensions"] = dimensions

        cloudwatch.put_metric_data(
            Namespace="TTSApp",
            MetricData=[metric_data]
        )
    except Exception as e:
        print(f"Failed to publish metric {name}: {e}")

def lambda_handler(event, context):
    try:
        body = event.get("body")
        if isinstance(body, str):
            body = json.loads(body)

        if not body or "text" not in body:
            publish_metric("Failures", 1)
            return {
                "statusCode": 400,
                "headers": {"Content-Type": "application/json"},
                "body": json.dumps({"error": "Missing 'text' in request body"})
            }

        text = body["text"]
        target_language = body.get("target_language", "en").lower()

        # Count every request
        publish_metric("Requests", 1, dimensions=[{"Name": "Language", "Value": target_language}])

        # --- Check if language is supported ---
        if target_language not in SUPPORTED_LANGUAGES:
            publish_metric("Failures", 1)
            return {
                "statusCode": 400,
                "headers": {"Content-Type": "application/json"},
                "body": json.dumps({
                    "error": f"Language '{target_language}' is not supported for TTS."
                })
            }

        voice = SUPPORTED_LANGUAGES[target_language]
        output_format = body.get("format", "mp3")
        engine = body.get("engine", "neural")

        # --- Translate if not English ---
        if target_language != "en":
            translate_resp = translate.translate_text(
                Text=text,
                SourceLanguageCode="auto",
                TargetLanguageCode=target_language
            )
            text = translate_resp["TranslatedText"]

        # Unique S3 key
        timestamp = datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
        key = f"tts/{timestamp}_{uuid.uuid4().hex}.mp3"

        # Polly synthesis
        polly_resp = polly.synthesize_speech(
            Text=text,
            OutputFormat=output_format,
            VoiceId=voice,
            Engine=engine
        )

        audio_stream = polly_resp.get("AudioStream")
        if audio_stream is None:
            raise RuntimeError("No audio returned from Polly")

        audio_bytes = audio_stream.read()
        s3.put_object(
            Bucket=OUTPUT_BUCKET,
            Key=key,
            Body=audio_bytes,
            ContentType="audio/mpeg"
        )

        url = s3.generate_presigned_url(
            "get_object",
            Params={"Bucket": OUTPUT_BUCKET, "Key": key},
            ExpiresIn=PRESIGNED_EXPIRE
        )

        # Successful processing
        publish_metric("Successes", 1, dimensions=[{"Name": "Language", "Value": target_language}])

        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"audio_key": key, "url": url, "voice": voice})
        }

    except Exception as e:
        print("Error:", str(e))
        publish_metric("Failures", 1)
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"error": str(e)})
        }
