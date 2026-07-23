import json
import sys

transcript_path = 'C:/Users/Hatemi/.gemini/antigravity/brain/4191de2e-e63c-407f-83d7-cdc38e0c5a81/.system_generated/logs/transcript_full.jsonl'

with open(transcript_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

for line in reversed(lines):
    if '"file_content"' in line and 'core.js' in line:
        try:
            data = json.loads(line)
            # Find the tool response containing file_content
            for item in data.get('tool_calls', []) + [data]:
                # In tool response it's in content
                pass
            if 'content' in data:
                print('Found file content!')
                
        except Exception as e:
            pass
