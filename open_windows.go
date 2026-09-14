//go:build windows

package main

import (
	"os/exec"
)

func openBrowser(url string) {
	// 在 Windows 上，cmd.exe /c start 会通过系统默认浏览器打开 URL
	// 使用 exec.Command("cmd", "/c", "start", "", url) 是 Windows 下最可靠的唤起默认浏览器方式
	cmd := exec.Command("cmd", "/c", "start", "", url)
	_ = cmd.Start()
}
