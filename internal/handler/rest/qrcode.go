package rest

import (
	"bytes"
	"encoding/base64"

	"github.com/skip2/go-qrcode"
)

func GenerateQRCode(url string) (string, error) {
	// buffer to hold the QR code image
	var pngBuffer bytes.Buffer

	// generate the QR code with medium error correction and 256x256 size
	png, err := qrcode.Encode(url, qrcode.Medium, 256)
	if err != nil {
		return "", err
	}

	// Write the QR code to the buffer
	_, err = pngBuffer.Write(png)
	if err != nil {
		return "", err
	}

	// Encode the QR code image to base64
	qrCodeBase64 := base64.StdEncoding.EncodeToString(pngBuffer.Bytes())

	return qrCodeBase64, nil
}
