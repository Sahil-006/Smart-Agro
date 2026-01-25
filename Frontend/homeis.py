import json
from deep_translator import GoogleTranslator

# ---------- CONFIG ----------
SOURCE_LANG = "en"
TARGET_LANGS = ["hi", "gu"]

INPUT_FILE = "src/i18n/en.json"
OUTPUT_FILES = {
    "hi": "src/i18n/hi.json",
    "gu": "src/i18n/gu.json",
}
# ----------------------------


def translate_value(value, target_lang):
    """
    Translate a single string safely.
    """
    try:
        return GoogleTranslator(
            source=SOURCE_LANG,
            target=target_lang
        ).translate(value)
    except Exception as e:
        print(f"⚠️ Translation failed for: {value}")
        return value


def translate_json(data, target_lang):
    """
    Recursively translate JSON values.
    Keys are NEVER translated.
    """
    if isinstance(data, dict):
        return {
            key: translate_json(value, target_lang)
            for key, value in data.items()
        }

    if isinstance(data, list):
        return [translate_json(item, target_lang) for item in data]

    if isinstance(data, str):
        return translate_value(data, target_lang)

    # numbers, booleans, null
    return data


def main():
    # Load English source
    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        en_data = json.load(f)

    for lang in TARGET_LANGS:
        print(f"🔁 Translating to {lang}...")

        translated_data = translate_json(en_data, lang)

        with open(OUTPUT_FILES[lang], "w", encoding="utf-8") as f:
            json.dump(translated_data, f, ensure_ascii=False, indent=2)

        print(f"✅ {lang}.json generated successfully")

    print("\n🎉 Translation completed!")


if __name__ == "__main__":
    main()
