import os
import json
import uuid
import boto3
from botocore.config import Config
from datetime import datetime

aws_config = Config(retries={"max_attempts": 3, "mode": "standard"})
polly = boto3.client("polly", config=aws_config)
translate = boto3.client("translate", config=aws_config)
s3 = boto3.client("s3", config=aws_config)

OUTPUT_BUCKET = os.environ.get("OUTPUT_BUCKET")
PRESIGNED_EXPIRE = int(os.environ.get("PRESIGNED_EXPIRE", "3600"))
DEFAULT_HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
}

def _normalize_lang_code(code: str) -> str:
    c = (code or "").lower()
    # Keep zh-tw explicitly; map zh-cn and other zh-* to zh
    if c.startswith("zh"):
        if c in ("zh-tw",):
            return "zh-tw"
        return "zh"
    # Use base language for others (e.g., en-us -> en)
    return c.split("-")[0]

# Build a dynamic mapping of normalized language code -> preferred default voice
# Preference order: Neural female, Neural male, then any Standard
def _discover_default_voices() -> dict:
    language_to_voices = {}

    next_token = None
    while True:
        kwargs = {"IncludeAdditionalLanguageCodes": True}
        if next_token:
            kwargs["NextToken"] = next_token
        resp = polly.describe_voices(**kwargs)
        for v in resp.get("Voices", []):
            # Some voices support multiple language codes
            language_codes = v.get("AdditionalLanguageCodes", [])
            primary = v.get("LanguageCode")
            if primary and primary not in language_codes:
                language_codes.append(primary)

            for lc in language_codes:
                norm = _normalize_lang_code(lc)
                voices_for_lang = language_to_voices.setdefault(norm, [])
                voices_for_lang.append({
                    "Id": v.get("Id"),
                    "Gender": (v.get("Gender") or ""),
                    "SupportedEngines": set(e.lower() for e in (v.get("SupportedEngines") or []))
                })

        next_token = resp.get("NextToken")
        if not next_token:
            break

    defaults = {}
    for lc, voices in language_to_voices.items():
        # Prefer Neural voices if available, female first
        neural_female = [vx for vx in voices if "neural" in vx["SupportedEngines"] and vx["Gender"].lower() == "female"]
        neural_male = [vx for vx in voices if "neural" in vx["SupportedEngines"] and vx["Gender"].lower() == "male"]
        neural_any = [vx for vx in voices if "neural" in vx["SupportedEngines"]]
        std_any = voices

        selected = None
        for group in (neural_female, neural_male, neural_any, std_any):
            if group:
                selected = group[0]["Id"]
                break
        if selected:
            defaults[lc] = selected

    return defaults

def _list_translate_languages() -> set:
    langs = set()
    next_token = None
    while True:
        kwargs = {"DisplayLanguageCode": "en"}
        if next_token:
            kwargs["NextToken"] = next_token
        resp = translate.list_languages(**kwargs)
        for item in resp.get("Languages", []):
            code = item.get("LanguageCode")
            if code:
                langs.add(_normalize_lang_code(code))
        next_token = resp.get("NextToken")
        if not next_token:
            break
    return langs

# Cache at init to avoid per-request calls
DEFAULT_VOICE_BY_LANG = _discover_default_voices()
TRANSLATE_LANGS = _list_translate_languages()

# Intersection: languages supported by both Polly (voices) and Translate
SUPPORTED_LANGUAGES = {
    lc: voice_id for lc, voice_id in DEFAULT_VOICE_BY_LANG.items() if lc in TRANSLATE_LANGS
}

def lambda_handler(event, context):
    try:
        body = event.get("body")
        if isinstance(body, str):
            body = json.loads(body)

        if not body or "text" not in body:
            return {
                "statusCode": 400,
                "headers": DEFAULT_HEADERS,
                "body": json.dumps({"error": "Missing 'text' in request body"})
            }

        text = body["text"]
        target_language = body.get("target_language", "en").lower()
        requested_voice = body.get("voice")

        # --- Determine voice ---
        engine = body.get("engine", "neural").lower()
        output_format = body.get("format", "mp3")

        if requested_voice:
            voice = requested_voice
        else:
            voice = SUPPORTED_LANGUAGES.get(target_language)
            if not voice:
                return {
                    "statusCode": 400,
                    "headers": DEFAULT_HEADERS,
                    "body": json.dumps({
                        "error": f"Language '{target_language}' is not supported."
                    })
                }

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
        key = f"tts/{timestamp}_{uuid.uuid4().hex}.{output_format}"

        # Polly synthesis
        try:
            polly_resp = polly.synthesize_speech(
                Text=text,
                OutputFormat=output_format,
                VoiceId=voice,
                Engine=("neural" if engine == "neural" else "standard")
            )
        except Exception:
            # Fallback to standard engine if neural not supported for voice
            polly_resp = polly.synthesize_speech(
                Text=text,
                OutputFormat=output_format,
                VoiceId=voice,
                Engine="standard"
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

        return {
            "statusCode": 200,
            "headers": DEFAULT_HEADERS,
            "body": json.dumps({"audio_key": key, "url": url, "voice": voice})
        }

    except Exception as e:
        print("Error:", str(e))
        return {
            "statusCode": 500,
            "headers": DEFAULT_HEADERS,
            "body": json.dumps({"error": str(e)})
        }
