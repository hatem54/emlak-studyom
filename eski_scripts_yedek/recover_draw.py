import json
import os
import re

log_file = r"C:\Users\Hatemi\.gemini\antigravity\brain\4191de2e-e63c-407f-83d7-cdc38e0c5a81\.system_generated\logs\transcript_full.jsonl"
target_file = r"C:\Users\Hatemi\Desktop\emlak düzenlemeleri için uygulama\emlak-studiom v7-0\modules\draw.js"
last_content = None

if os.path.exists(log_file):
    with open(log_file, 'r', encoding='utf-8') as f:
        for line in f:
            if "draw.js" in line and "TOOL_RESPONSE" in line:
                try:
                    data = json.loads(line)
                    if data.get("type") == "TOOL_RESPONSE":
                        for tr in data.get("tool_responses", []):
                            out = tr.get("output", "")
                            if "draw.js" in out:
                                # Sometimes it has line numbers added by view_file
                                # "The following code has been modified to include a line number before every line... \n1: ...\n"
                                if "The following code has been modified" in out:
                                    lines = out.split("\n")
                                    cleaned = []
                                    for l in lines:
                                        match = re.match(r"^\d+:\s(.*)$", l)
                                        if match:
                                            cleaned.append(match.group(1))
                                        elif re.match(r"^\d+:$", l):
                                            cleaned.append("")
                                    if cleaned:
                                        last_content = "\n".join(cleaned)
                                else:
                                    last_content = out
                except Exception as e:
                    pass

if last_content:
    with open(r"C:\Users\Hatemi\Desktop\emlak düzenlemeleri için uygulama\emlak-studiom v7-0\modules\draw_recovered.js", "w", encoding='utf-8') as f:
        f.write(last_content)
    print("Recovered draw.js! Lines:", len(last_content.split('\n')))
else:
    print("Could not find tool response for draw.js")
