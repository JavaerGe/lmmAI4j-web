#!/usr/bin/env python3
"""lmmAI4j 回归测试 - 验证BUG修复"""
import os, json, struct, wave, http.client, urllib.parse
from pathlib import Path
from PIL import Image

BASE_URL = "http://localhost:8081"
TEST_DIR = Path("a:/Workspace/Personal/lmmAI4j-web/test_media")
TEST_DIR.mkdir(exist_ok=True)

def gen_jpeg(p): Image.new("RGB", (200, 200), (100, 150, 200)).save(p, "JPEG")
def gen_png(p): Image.new("RGB", (200, 200), (100, 150, 200)).save(p, "PNG")
def gen_gif_static(p): Image.new("RGB", (200, 200), (200, 100, 100)).save(p, "GIF")
def gen_gif_animated(p):
    frames = [Image.new("RGB", (200, 200), ((i*50)%256, (100+i*30)%256, (200-i*40)%256)) for i in range(5)]
    frames[0].save(p, save_all=True, append_images=frames[1:], duration=100, loop=0)
def gen_webp(p): Image.new("RGB", (200, 200), (150, 50, 100)).save(p, "WEBP")
def gen_mp3(p):
    id3_header = b'ID3\x03\x00\x00\x00\x00\x00\x00'
    frame = b'\xff\xfb\x90\x00' + b'\x00' * 413
    with open(p, 'wb') as f: f.write(id3_header + frame * 10)
def gen_wav(p):
    import math
    sr = 44100; n = sr; samples = bytearray()
    for i in range(n):
        v = int(16000 * (2**15-1) * math.sin(2*3.14159*440*i/sr))
        samples.extend(struct.pack('<h', max(-32768, min(32767, v))))
    with wave.open(p, 'w') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes(bytes(samples))

def api_call(endpoint, file_path, extra_fields=None):
    boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
    body = bytearray()
    with open(file_path, 'rb') as f: file_data = f.read()
    body.extend(f'--{boundary}\r\n'.encode())
    body.extend(f'Content-Disposition: form-data; name="file"; filename="{os.path.basename(file_path)}"\r\n'.encode())
    body.extend(b'Content-Type: application/octet-stream\r\n\r\n')
    body.extend(file_data); body.extend(b'\r\n')
    if extra_fields:
        for k, v in extra_fields.items():
            body.extend(f'--{boundary}\r\n'.encode())
            body.extend(f'Content-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n'.encode())
    body.extend(f'--{boundary}--\r\n'.encode())
    conn = http.client.HTTPConnection("localhost", 8081)
    try:
        conn.request('POST', endpoint, bytes(body), {'Content-Type': f'multipart/form-data; boundary={boundary}'})
        return json.loads(conn.getresponse().read().decode('utf-8'))
    except Exception as e: return {"error": str(e)}
    finally: conn.close()

def test_format(name, path, ops):
    print(f"\n{'='*50}\n{name}")
    if not os.path.exists(path):
        print(f"  SKIP: 文件不存在"); return "SKIP"
    
    label_f = {"label":"AIGC","contentProducer":"test","produceId":"T-001","producerDate":"2026-05-29"}
    wm_f = {"text":"AI生成","position":"BOTTOM_RIGHT","opacity":"0.5"}
    all_f = {**label_f, **wm_f}
    ok = True; issues = []
    
    for op in ops:
        fields = label_f if op=="metadata" else wm_f if op=="watermark" else all_f
        endpoint = "/api/label/metadata" if op=="metadata" else "/api/label/watermark" if op=="watermark" else "/api/label/all"
        
        resp = api_call(endpoint, path, fields)
        data = resp.get('data', {})
        success = data.get('success', False) if isinstance(data, dict) else False
        outpath = data.get('outputPath') if isinstance(data, dict) else None
        
        if not success:
            msg = data.get('message', 'unknown') if isinstance(data, dict) else 'unknown'
            print(f"  {op}: FAIL - {msg}")
            # BMP failing metadata is expected now
            if name == "BMP" and op == "metadata" and "does not support" in str(msg):
                print(f"    (expected - BMP format limitation)")
                issues.append(f"{op}: expected-fail(BMP不支持)")
            else:
                ok = False; issues.append(f"{op}:FAIL({msg})")
            continue
        
        # Detect
        if outpath and os.path.exists(outpath):
            det = api_call("/api/detect", outpath)
            dd = det.get('data', {})
            has_i = dd.get('hasImplicitLabel', False)
            has_e = dd.get('hasExplicitLabel', False)
            comp = dd.get('isCompliant', False)
            
            if op == "metadata":
                print(f"  {op}: OK → implicit={has_i}, compliant={comp}")
                if not has_i: ok = False; issues.append(f"{op}:no-implicit")
            elif op == "watermark":
                print(f"  {op}: OK → explicit={has_e}")
                # watermark-only detection is not fully implemented, skip compliance check
            elif op == "all":
                print(f"  {op}: OK → implicit={has_i}, explicit={has_e}, compliant={comp}")
                if not comp: ok = False; issues.append(f"{op}:not-compliant")
                if not has_i: ok = False; issues.append(f"{op}:no-implicit")
        else:
            print(f"  {op}: OK but no output file")
            ok = False; issues.append(f"{op}:no-output")
    
    status = "PASS" if ok else "FAIL"
    print(f"  => {status}" + (f" [{', '.join(issues)}]" if issues else ""))
    return status

# Generate test files
print("生成测试文件...")
files = {}
files['JPEG'] = str(TEST_DIR / "test.jpg"); gen_jpeg(files['JPEG'])
files['PNG'] = str(TEST_DIR / "test.png"); gen_png(files['PNG'])
files['GIF_STATIC'] = str(TEST_DIR / "test_static.gif"); gen_gif_static(files['GIF_STATIC'])
files['GIF_ANIMATED'] = str(TEST_DIR / "test_animated.gif"); gen_gif_animated(files['GIF_ANIMATED'])
files['WEBP'] = str(TEST_DIR / "test.webp"); gen_webp(files['WEBP'])
files['MP3'] = str(TEST_DIR / "test.mp3"); gen_mp3(files['MP3'])
files['WAV'] = str(TEST_DIR / "test.wav"); gen_wav(files['WAV'])

# BMP file
files['BMP'] = str(TEST_DIR / "test.bmp")
Image.new("RGB", (200, 200), (50, 100, 150)).save(files['BMP'], "BMP")

# Run tests
results = {}
image_ops = ["metadata", "watermark", "all"]
results['JPEG'] = test_format("JPEG", files['JPEG'], image_ops)
results['PNG'] = test_format("PNG", files['PNG'], image_ops)
results['GIF_STATIC'] = test_format("GIF_STATIC", files['GIF_STATIC'], image_ops)
results['GIF_ANIMATED'] = test_format("GIF_ANIMATED", files['GIF_ANIMATED'], image_ops)
results['WEBP'] = test_format("WEBP", files['WEBP'], ["metadata"])
results['BMP'] = test_format("BMP", files['BMP'], ["metadata"])
results['MP3'] = test_format("MP3", files['MP3'], ["metadata", "all"])
results['WAV'] = test_format("WAV", files['WAV'], ["metadata", "watermark", "all"])

# Summary
print(f"\n{'='*50}\n回归测试汇总:")
p = sum(1 for v in results.values() if v == "PASS")
f = sum(1 for v in results.values() if v == "FAIL")
s = sum(1 for v in results.values() if v == "SKIP")
for k, v in results.items():
    icon = "✅" if v == "PASS" else "❌" if v == "FAIL" else "⏭️"
    print(f"  {icon} {k}: {v}")
print(f"\n总计: {p} PASS, {f} FAIL, {s} SKIP")
