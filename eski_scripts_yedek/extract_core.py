import os
import re

log_file = r"C:\Users\Hatemi\.gemini\antigravity\brain\4191de2e-e63c-407f-83d7-cdc38e0c5a81\.system_generated\tasks\task-1482.log"
out_file = r"C:\Users\Hatemi\Desktop\emlak düzenlemeleri için uygulama\emlak-studiom v7-0\core.js"

with open(log_file, "r", encoding="utf-8") as f:
    lines = f.readlines()

drag_lines = []
in_core = False

for line in lines:
    line_stripped = line.rstrip("\n")
    if "FOUND IN C:/Users/Hatemi/Desktop/emlak düzenlemeleri için uygulama/emlak-studiom v7-0/core.js" in line_stripped:
        in_core = True
        continue
    if in_core:
        if "FOUND IN " in line_stripped:
            break
        
        match = re.match(r"^\d+:\s(.*)$", line_stripped)
        if match:
            drag_lines.append(match.group(1))
        else:
            if re.match(r"^\d+:$", line_stripped):
                drag_lines.append("")
            else:
                drag_lines.append(line_stripped)

with open(out_file, "w", encoding="utf-8") as f:
    f.write("\n".join(drag_lines))

print("Recovered core.js lines:", len(drag_lines))
