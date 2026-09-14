//go:build !windows

package main

import (
	"fmt"
	"os/exec"
	"runtime"
)

func openBrowser(url string) {
	var err error
	switch runtime.GOOS {
	case "darwin":
		err = exec.Command("open", url).Start()
	case "linux":
		err = exec.Command("xdg-open", url).Start()
	}
	if err != nil {
		fmt.Printf("无法自动打开浏览器，请手动访问: %s\n", url)
	}
}
