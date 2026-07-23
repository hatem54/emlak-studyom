import json
log_file = r'C:\Users\Hatemi\.gemini\antigravity\brain\4191de2e-e63c-407f-83d7-cdc38e0c5a81\.system_generated\logs\transcript_full.jsonl'
lines = open(log_file, 'r', encoding='utf-8').readlines()
lines.reverse()
for l in lines:
    try:
        data = json.loads(l)
        if data.get('type') == 'PLANNER_RESPONSE':
            for tc in data.get('tool_calls', []):
                if tc.get('name') == 'write_to_file' and 'draw.js' in tc.get('args', {}).get('TargetFile', ''):
                    content = tc.get('args', {}).get('CodeContent', '')
                    if 'createSVGFromPath' in content:
                        with open('extracted_draw.js', 'w', encoding='utf-8') as f:
                            f.write(content)
                        print("Extracted from write_to_file to extracted_draw.js")
                        exit(0)
    except Exception as e:
        pass
print("Did not find write_to_file with createSVGFromPath in TargetFile draw.js")
