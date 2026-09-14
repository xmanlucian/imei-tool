package main

import (
	"testing"
)

func TestCalculateLuhnCheckDigit(t *testing.T) {
	// Example known IMEI: 354148491014741 -> 14 digits: 35414849101474, CD = 1
	cd := calculateLuhnCheckDigit("35414849101474")
	if cd != 1 {
		t.Fatalf("expected 1, got %d", cd)
	}
}

func TestGenerateAndValidate(t *testing.T) {
	brands := []string{"", "apple", "samsung", "huawei", "xiaomi", "google"}
	for _, b := range brands {
		for i := 0; i < 20; i++ {
			imei, err := GenerateIMEI(b, "")
			if err != nil {
				t.Fatalf("GenerateIMEI failed: %v", err)
			}
			if len(imei) != 15 {
				t.Fatalf("IMEI length is %d, expected 15", len(imei))
			}
			if !ValidateIMEI(imei) {
				t.Fatalf("Generated IMEI %s failed validation", imei)
			}
		}
	}
}
