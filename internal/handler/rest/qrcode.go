package rest

import (
	"fmt"
	"log"

	"github.com/skip2/go-qrcode"
)

func GenerateQRCode() {
	//data yang akan diubah menjadi qrcode
	text := "https://example.com"

	//buat QR code dengan level koreksi kesalahan standar dan ukuran 256x256 pixel
	err := qrcode.WriteFile(text, qrcode.Medium, 256, "qrcode.png")
	if err != nil {
		log.Fatal(err)

	}
	fmt.Println("QR code berhasil dibuat dan disimpan sebagai qrcode.png")
}
