import json
import os

log_file = r"C:\Users\Hatemi\.gemini\antigravity\brain\4191de2e-e63c-407f-83d7-cdc38e0c5a81\.system_generated\logs\transcript_full.jsonl"
target_file = r"C:\Users\Hatemi\Desktop\emlak düzenlemeleri için uygulama\emlak-studiom v7-0\core\drag.js"
last_content = None

if os.path.exists(log_file):
    with open(log_file, 'r', encoding='utf-8') as f:
        for line in f:
            try:
                data = json.loads(line)
                if data.get("type") == "TOOL_RESPONSE":
                    responses = data.get("tool_responses", [])
                    for tr in responses:
                        if tr.get("name") == "default_api:view_file":
                            out = tr.get("output", "")
                            if target_file.replace("\\", "/") in out.replace("\\", "/") or "core/drag.js" in out:
                                last_content = out
            except Exception as e:
                pass

if last_content:
    with open("drag_recovered.txt", "w", encoding='utf-8') as f:
        f.write(last_content)
    print("Recovered drag.js!")
else:
    print("Could not find tool response for drag.js")
