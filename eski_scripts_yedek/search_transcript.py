import json
import os

log_file = r"C:\Users\Hatemi\.gemini\antigravity\brain\4191de2e-e63c-407f-83d7-cdc38e0c5a81\.system_generated\logs\transcript_full.jsonl"
if os.path.exists(log_file):
    with open(log_file, 'r', encoding='utf-8') as f:
        for line in f:
            if "drag.js" in line and "TOOL_RESPONSE" in line:
                try:
                    data = json.loads(line)
                    if data.get("type") == "TOOL_RESPONSE":
                        print(data.keys())
                        for res in data.get("tool_responses", []):
                            print(res.keys())
                            print(res.get("name", "NO NAME"))
                        break
                except:
                    pass
