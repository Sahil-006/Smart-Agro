#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include "DHT.h"

// ===== WIFI CREDENTIALS =====
// IMPORTANT: Use your MOBILE HOTSPOT if the university Wi-Fi still gives -1
const char* ssid = "Vivo T1 5G";
const char* password = "sahil567";
const char* pi_url = "http://10.126.220.121:5001/upload"; // Verify IP with 'hostname -I'

// ===== SENSOR SETUP =====
#define DHTPIN 4        // Data pin for DHT22
#define DHTTYPE DHT22   // Using DHT22
DHT dht(DHTPIN, DHTTYPE);

#define SOIL_PIN 34     // Analog pin for YL-69

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n--- Smart Agro Node Starting ---");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected!");
  dht.begin();
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    float t = dht.readTemperature();
    float h = dht.readHumidity();
    int rawSoil = analogRead(SOIL_PIN);

    // Skip if sensors fail
    if (isnan(t) || isnan(h)) {
      Serial.println("Failed to read DHT22!");
      delay(2000);
      return;
    }

    // Mapping Soil Moisture: ESP32 ADC is 12-bit (0-4095)
    // 0% = 4095 (Dry), 100% = 1200 (Wet) - Calibrate as needed
    int moisturePercent = map(rawSoil, 4095, 1200, 0, 100);
    moisturePercent = constrain(moisturePercent, 0, 100);

    // Create JSON Packet
    StaticJsonDocument<200> doc;
    doc["temperature"] = t;
    doc["humidity"] = h;
    doc["moisture"] = moisturePercent;

    String jsonString;
    serializeJson(doc, jsonString);

    // Send to Raspberry Pi Gateway
    HTTPClient http;
    http.begin(pi_url);
    http.addHeader("Content-Type", "application/json");
    http.setTimeout(5000); // 5 second timeout to avoid hanging

    int httpResponseCode = http.POST(jsonString);

    if (httpResponseCode > 0) {
      Serial.print("Data Sent Successfully! Response: ");
      Serial.println(httpResponseCode);
    } else {
      Serial.print("Error sending POST: ");
      Serial.println(httpResponseCode);
      Serial.println("TIP: Check if Pi script is running and on the SAME network.");
    }

    http.end();
  }
  delay(5000); // Send data every 5 seconds
}