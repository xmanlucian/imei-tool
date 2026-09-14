package main

import (
	"crypto/rand"
	"flag"
	"fmt"
	"math/big"
	"os"
	"strings"
)

// BrandTACs holds commonly known genuine TAC (Type Allocation Code) prefixes for major brands.
var BrandTACs = map[string][]string{
	"apple": {
		"35304610", // iPhone 11
		"35674311", // iPhone 12
		"35212562", // iPhone 13 Pro
		"35054365", // iPhone 14 Pro
		"35414849", // iPhone 15 Pro
		"35920668", // iPhone 16 Pro
	},
	"samsung": {
		"35824005", // Galaxy S9
		"35492410", // Galaxy S20
		"35084221", // Galaxy S21
		"35174780", // Galaxy S22 Ultra
		"35287661", // Galaxy S23
		"35123488", // Galaxy S24
	},
	"huawei": {
		"86734503", // Mate 20
		"86265004", // P30 Pro
		"86641204", // Mate 30 Pro
		"86175905", // P40 Pro
		"86498106", // Mate 60 Pro
	},
	"xiaomi": {
		"86820403", // Mi 9
		"86423404", // Mi 10
		"86361205", // Mi 11
		"86548106", // Xiaomi 13
		"86912307", // Xiaomi 14
	},
	"google": {
		"35824209", // Pixel 4
		"35275311", // Pixel 5
		"35472851", // Pixel 6
		"35091763", // Pixel 7 Pro
		"35811774", // Pixel 8 Pro
	},
}

// calculateLuhnCheckDigit computes the 15th digit for a 14-digit IMEI using Luhn algorithm (Mod 10).
func calculateLuhnCheckDigit(imei14 string) int {
	sum := 0
	for i := 0; i < 14; i++ {
		digit := int(imei14[i] - '0')
		if i%2 == 1 { // 偶数位（1-indexed: 2, 4, 6, 8, 10, 12, 14）
			doubled := digit * 2
			if doubled >= 10 {
				doubled -= 9
			}
			sum += doubled
		} else {
			sum += digit
		}
	}
	return (10 - (sum % 10)) % 10
}

// secureRandomDigits generates n random numerical digits as string.
func secureRandomDigits(n int) string {
	var b strings.Builder
	for i := 0; i < n; i++ {
		num, err := rand.Int(rand.Reader, big.NewInt(10))
		if err != nil {
			panic(err)
		}
		b.WriteString(fmt.Sprintf("%d", num.Int64()))
	}
	return b.String()
}

// GenerateIMEI creates a valid 15-digit IMEI.
// If tac is provided and valid, it is used; otherwise a random or brand-specific TAC is used.
func GenerateIMEI(brand string, customTAC string) (string, error) {
	var tac string

	if customTAC != "" {
		if len(customTAC) != 8 || !isNumeric(customTAC) {
			return "", fmt.Errorf("自定义 TAC 必须是 8 位数字: %s", customTAC)
		}
		tac = customTAC
	} else if brand != "" {
		list, ok := BrandTACs[strings.ToLower(brand)]
		if !ok {
			var available []string
			for k := range BrandTACs {
				available = append(available, k)
			}
			return "", fmt.Errorf("未知品牌 '%s'。可选品牌: %s", brand, strings.Join(available, ", "))
		}
		idx, err := rand.Int(rand.Reader, big.NewInt(int64(len(list))))
		if err != nil {
			return "", err
		}
		tac = list[idx.Int64()]
	} else {
		// 随机 TAC：前2位为常用RBI前缀
		prefixes := []string{"35", "86", "01", "49", "50", "52"}
		idx, _ := rand.Int(rand.Reader, big.NewInt(int64(len(prefixes))))
		tac = prefixes[idx.Int64()] + secureRandomDigits(6)
	}

	// SNR: 6 位随机序列号
	snr := secureRandomDigits(6)
	imei14 := tac + snr
	cd := calculateLuhnCheckDigit(imei14)

	return fmt.Sprintf("%s%d", imei14, cd), nil
}

// ValidateIMEI checks if a 15-digit IMEI has a valid Luhn checksum.
func ValidateIMEI(imei string) bool {
	if len(imei) != 15 || !isNumeric(imei) {
		return false
	}
	expectedCD := calculateLuhnCheckDigit(imei[:14])
	return int(imei[14]-'0') == expectedCD
}

func isNumeric(s string) bool {
	for _, c := range s {
		if c < '0' || c > '9' {
			return false
		}
	}
	return true
}

func main() {
	guiFlag := flag.Bool("gui", false, "以图形界面 (GUI) 模式启动")
	count := flag.Int("n", 1, "生成数量 (CLI 模式)")
	brand := flag.String("brand", "", "指定品牌 TAC (可选: apple, samsung, huawei, xiaomi, google)")
	tac := flag.String("tac", "", "指定自定义 8 位 TAC 码 (如: -tac 35414849)")
	validate := flag.String("check", "", "校验指定的 15 位 IMEI 是否有效 (如: -check 354148491234567)")
	formatted := flag.Bool("f", false, "格式化输出 (AA-BBBBBB-CCCCCC-D)")

	flag.Usage = func() {
		fmt.Fprintf(os.Stderr, "Usage of %s:\n", os.Args[0])
		fmt.Fprintf(os.Stderr, "  随机 IMEI 生成与校验工具 (支持 GUI 界面与 CLI 命令行)\n\n")
		fmt.Fprintf(os.Stderr, "Options:\n")
		flag.PrintDefaults()
		fmt.Fprintf(os.Stderr, "\nExamples:\n")
		fmt.Fprintf(os.Stderr, "  %s -gui                     # 打开图形界面 (GUI)\n", os.Args[0])
		fmt.Fprintf(os.Stderr, "  %s -n 5                     # CLI 模式: 随机生成 5 个有效 IMEI\n", os.Args[0])
		fmt.Fprintf(os.Stderr, "  %s -brand apple -n 3        # CLI 模式: 生成 3 个苹果设备 TAC 的 IMEI\n", os.Args[0])
		fmt.Fprintf(os.Stderr, "  %s -tac 35414849 -f         # CLI 模式: 使用指定 TAC 并格式化输出\n", os.Args[0])
		fmt.Fprintf(os.Stderr, "  %s -check 354148491014741   # CLI 模式: 校验 IMEI 校验位是否正确\n", os.Args[0])
	}

	flag.Parse()

	// 如果没有传任何命令行参数，或者显式指定了 -gui，并且是在双击/交互启动时，若无任何flag传参则可根据需求处理
	// 为保持用户体验：如果传了 -gui，启动 GUI；或者如果没有任何参数且不是输入重定向，我们提供 -gui 选项
	if *guiFlag || (len(os.Args) == 1) {
		startGUI()
		return
	}

	if *validate != "" {
		clean := strings.ReplaceAll(strings.ReplaceAll(*validate, "-", ""), " ", "")
		if ValidateIMEI(clean) {
			fmt.Printf("✓ IMEI 有效: %s\n", *validate)
			os.Exit(0)
		} else {
			fmt.Printf("✗ IMEI 无效 (长度不对或 Luhn 校验位错误): %s\n", *validate)
			os.Exit(1)
		}
	}

	if *count <= 0 {
		fmt.Fprintf(os.Stderr, "生成数量 -n 必须大于 0\n")
		os.Exit(1)
	}

	for i := 0; i < *count; i++ {
		imei, err := GenerateIMEI(*brand, *tac)
		if err != nil {
			fmt.Fprintf(os.Stderr, "错误: %v\n", err)
			os.Exit(1)
		}

		if *formatted {
			// AA-BBBBBB-CCCCCC-D (2-6-6-1)
			fmt.Printf("%s-%s-%s-%s\n", imei[:2], imei[2:8], imei[8:14], imei[14:])
		} else {
			fmt.Println(imei)
		}
	}
}
