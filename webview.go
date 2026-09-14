package main

import (
	"fmt"
	"net"
	"net/http"
	"os/exec"
	"runtime"
	"strconv"
	"strings"
)

const htmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>IMEI 工具 (生成 & 校验)</title>
<style>
  :root {
    --bg-gradient: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
    --card-bg: rgba(30, 41, 59, 0.85);
    --primary: #38bdf8;
    --primary-hover: #0ea5e9;
    --accent: #818cf8;
    --text: #f1f5f9;
    --text-muted: #94a3b8;
    --border: rgba(148, 163, 184, 0.15);
    --input-bg: rgba(15, 23, 42, 0.6);
  }
  * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
  body {
    background: var(--bg-gradient);
    color: var(--text);
    min-height: 100vh;
    padding: 30px 20px;
    display: flex;
    justify-content: center;
  }
  .container {
    width: 100%;
    max-width: 800px;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  .card {
    background: var(--card-bg);
    backdrop-filter: blur(12px);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  }
  h1 {
    font-size: 1.6rem;
    font-weight: 700;
    color: var(--text);
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
  }
  p.desc {
    color: var(--text-muted);
    font-size: 0.9rem;
    margin-bottom: 20px;
  }
  .tabs {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
    border-bottom: 1px solid var(--border);
    padding-bottom: 12px;
  }
  .tab-btn {
    background: none;
    border: none;
    color: var(--text-muted);
    font-size: 1rem;
    font-weight: 600;
    padding: 8px 16px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .tab-btn.active {
    background: rgba(56, 189, 248, 0.15);
    color: var(--primary);
  }
  .form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 20px;
  }
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  label {
    font-size: 0.85rem;
    color: var(--text-muted);
    font-weight: 500;
  }
  input, select {
    background: var(--input-bg);
    border: 1px solid var(--border);
    border-radius: 8px;
    color: var(--text);
    padding: 10px 14px;
    font-size: 0.95rem;
    outline: none;
    transition: border 0.2s;
  }
  input:focus, select:focus {
    border-color: var(--primary);
  }
  .btn-row {
    display: flex;
    gap: 12px;
  }
  .btn {
    background: var(--primary);
    color: #0f172a;
    border: none;
    border-radius: 8px;
    padding: 12px 24px;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  .btn:hover { background: var(--primary-hover); }
  .btn-secondary {
    background: rgba(255,255,255,0.08);
    color: var(--text);
  }
  .btn-secondary:hover {
    background: rgba(255,255,255,0.15);
  }
  .results-box {
    margin-top: 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .result-textarea {
    width: 100%;
    height: 220px;
    background: var(--input-bg);
    border: 1px solid var(--border);
    border-radius: 8px;
    color: #38bdf8;
    padding: 12px;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 0.95rem;
    resize: vertical;
    outline: none;
  }
  .status-badge {
    padding: 10px 16px;
    border-radius: 8px;
    font-size: 0.95rem;
    font-weight: 500;
    margin-top: 14px;
    display: none;
  }
  .status-badge.success {
    display: block;
    background: rgba(34, 197, 94, 0.15);
    color: #4ade80;
    border: 1px solid rgba(34, 197, 94, 0.3);
  }
  .status-badge.error {
    display: block;
    background: rgba(239, 68, 68, 0.15);
    color: #f87171;
    border: 1px solid rgba(239, 68, 68, 0.3);
  }
</style>
</head>
<body>

<div class="container">
  <div class="card">
    <h1>📱 IMEI 桌面端小工具</h1>
    <p class="desc">支持按品牌分配码、自定义 TAC 生成与 Luhn 模 10 校验</p>

    <div class="tabs">
      <button class="tab-btn active" id="tab-gen-btn" onclick="switchTab('gen')">🎲 随机生成</button>
      <button class="tab-btn" id="tab-val-btn" onclick="switchTab('val')">🔍 校验 IMEI</button>
    </div>

    <!-- 生成面板 -->
    <div id="panel-gen">
      <div class="form-grid">
        <div class="form-group">
          <label>预设品牌 (TAC)</label>
          <select id="brand-select">
            <option value="">随机任意品牌</option>
            <option value="apple">Apple (苹果)</option>
            <option value="samsung">Samsung (三星)</option>
            <option value="huawei">Huawei (华为)</option>
            <option value="xiaomi">Xiaomi (小米)</option>
            <option value="google">Google (谷歌)</option>
          </select>
        </div>
        <div class="form-group">
          <label>自定义 TAC (8位，留空使用品牌)</label>
          <input type="text" id="custom-tac" placeholder="例如: 35414849" maxlength="8">
        </div>
        <div class="form-group">
          <label>生成数量</label>
          <input type="number" id="count-input" value="10" min="1" max="500">
        </div>
        <div class="form-group" style="justify-content: flex-end;">
          <label style="display:flex; align-items:center; gap:8px; cursor:pointer; height:42px;">
            <input type="checkbox" id="format-check" style="width:18px; height:18px;">
            格式化输出 (带横杠)
          </label>
        </div>
      </div>

      <div class="btn-row">
        <button class="btn" onclick="generateIMEIs()">⚡ 开始生成</button>
        <button class="btn btn-secondary" onclick="copyResults()">📋 一键复制全部</button>
        <button class="btn btn-secondary" onclick="clearResults()">🧹 清空</button>
      </div>

      <div class="results-box">
        <label>生成结果列表</label>
        <textarea id="results-area" class="result-textarea" readonly placeholder="点击'开始生成'显示结果..."></textarea>
      </div>
    </div>

    <!-- 校验面板 -->
    <div id="panel-val" style="display:none;">
      <div class="form-group" style="margin-bottom: 16px;">
        <label>输入待校验的 15 位 IMEI</label>
        <input type="text" id="validate-input" placeholder="例如: 354148491014741" maxlength="18">
      </div>
      <div class="btn-row">
        <button class="btn" onclick="checkIMEI()">🔍 校验有效性</button>
      </div>
      <div id="validate-badge" class="status-badge"></div>
    </div>
  </div>
</div>

<script>
function switchTab(t) {
  if (t === 'gen') {
    document.getElementById('panel-gen').style.display = 'block';
    document.getElementById('panel-val').style.display = 'none';
    document.getElementById('tab-gen-btn').classList.add('active');
    document.getElementById('tab-val-btn').classList.remove('active');
  } else {
    document.getElementById('panel-gen').style.display = 'none';
    document.getElementById('panel-val').style.display = 'block';
    document.getElementById('tab-gen-btn').classList.remove('active');
    document.getElementById('tab-val-btn').classList.add('active');
  }
}

async function generateIMEIs() {
  const brand = document.getElementById('brand-select').value;
  const tac = document.getElementById('custom-tac').value.trim();
  const count = document.getElementById('count-input').value;
  const formatted = document.getElementById('format-check').checked;

  const res = await fetch('/api/generate?brand=' + encodeURIComponent(brand) + 
                          '&tac=' + encodeURIComponent(tac) + 
                          '&n=' + encodeURIComponent(count) + 
                          '&f=' + (formatted ? '1' : '0'));
  const data = await res.json();
  if (data.error) {
    alert('生成错误: ' + data.error);
    return;
  }
  document.getElementById('results-area').value = data.imeis.join('\n');
}

async function checkIMEI() {
  const imei = document.getElementById('validate-input').value.trim();
  if (!imei) return;
  const res = await fetch('/api/validate?imei=' + encodeURIComponent(imei));
  const data = await res.json();
  const badge = document.getElementById('validate-badge');
  if (data.valid) {
    badge.className = 'status-badge success';
    badge.textContent = '✓ 校验通过！该 IMEI 结构合法且符合 Luhn 算法。';
  } else {
    badge.className = 'status-badge error';
    badge.textContent = '✗ 校验失败！该 IMEI 长度不是 15 位数字或校验位不正确。';
  }
}

function copyResults() {
  const area = document.getElementById('results-area');
  if (!area.value) return;
  navigator.clipboard.writeText(area.value);
  alert('已复制到剪贴板！');
}

function clearResults() {
  document.getElementById('results-area').value = '';
}
</script>

</body>
</html>
`

func openBrowser(url string) {
	var err error
	switch runtime.GOOS {
	case "linux":
		err = exec.Command("xdg-open", url).Start()
	case "windows":
		err = exec.Command("rundll32", "url.dll,FileProtocolHandler", url).Start()
	case "darwin":
		err = exec.Command("open", url).Start()
	}
	if err != nil {
		fmt.Printf("无法自动打开浏览器，请手动访问: %s\n", url)
	}
}

func startGUI() {
	listener, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		fmt.Printf("无法启动本地服务器: %v\n", err)
		return
	}
	port := listener.Addr().(*net.TCPAddr).Port
	url := fmt.Sprintf("http://127.0.0.1:%d", port)

	mux := http.NewServeMux()
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		w.Write([]byte(htmlContent))
	})

	mux.HandleFunc("/api/generate", func(w http.ResponseWriter, r *http.Request) {
		q := r.URL.Query()
		brand := q.Get("brand")
		tac := q.Get("tac")
		formatted := q.Get("f") == "1"
		count, _ := strconv.Atoi(q.Get("n"))
		if count <= 0 {
			count = 1
		}
		if count > 1000 {
			count = 1000
		}

		var imeis []string
		for i := 0; i < count; i++ {
			val, err := GenerateIMEI(brand, tac)
			if err != nil {
				w.Header().Set("Content-Type", "application/json")
				w.Write([]byte(fmt.Sprintf(`{"error": %q}`, err.Error())))
				return
			}
			if formatted {
				imeis = append(imeis, fmt.Sprintf("%s-%s-%s-%s", val[:2], val[2:8], val[8:14], val[14:]))
			} else {
				imeis = append(imeis, val)
			}
		}

		w.Header().Set("Content-Type", "application/json")
		b := strings.Builder{}
		b.WriteString(`{"imeis":[`)
		for i, v := range imeis {
			if i > 0 {
				b.WriteString(",")
			}
			b.WriteString(fmt.Sprintf("%q", v))
		}
		b.WriteString(`]}`)
		w.Write([]byte(b.String()))
	})

	mux.HandleFunc("/api/validate", func(w http.ResponseWriter, r *http.Request) {
		imei := r.URL.Query().Get("imei")
		// Clean dashes or spaces
		clean := strings.ReplaceAll(strings.ReplaceAll(imei, "-", ""), " ", "")
		valid := ValidateIMEI(clean)
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(fmt.Sprintf(`{"valid": %t}`, valid)))
	})

	server := &http.Server{Handler: mux}

	fmt.Println("==================================================")
	fmt.Printf("🚀 IMEI 生成器图形界面已启动: %s\n", url)
	fmt.Println("正在为您自动唤起本地窗口/浏览器...")
	fmt.Println("提示: 在终端按 Ctrl+C 即可关闭退出程序。")
	fmt.Println("==================================================")

	go func() {
		openBrowser(url)
	}()

	if err := server.Serve(listener); err != nil && err != http.ErrServerClosed {
		fmt.Printf("服务器错误: %v\n", err)
	}
}
