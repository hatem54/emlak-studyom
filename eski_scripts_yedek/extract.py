import json
log_file = r'C:\Users\Hatemi\.gemini\antigravity\brain\4191de2e-e63c-407f-83d7-cdc38e0c5a81\.system_generated\logs\transcript_full.jsonl'
lines = open(log_file, 'r', encoding='utf-8').readlines()
lines.reverse()
for l in lines:
    if 'function createSVGFromPath' in l:
        print("Found line matching createSVGFromPath! Length:", len(l))
        try:
            data = json.loads(l)
            if data.get('type') == 'TOOL_RESPONSE':
                for tr in data.get('tool_responses', []):
                    if 'createSVGFromPath' in tr.get('output', ''):
                        with open('extracted_draw.js', 'w', encoding='utf-8') as f:
                            f.write(tr.get('output'))
                        print("Extracted to extracted_draw.js")
                        exit(0)
        except Exception as e:
            print("Error parsing json:", e)
