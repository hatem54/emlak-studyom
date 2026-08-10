import os
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

print('--- 1. logo-icon.png in app.html ---')
with open('app.html', 'r', encoding='utf-8', errors='ignore') as f:
    lines = f.readlines()
    count = 0
    for i, line in enumerate(lines):
        if 'logo-icon.png' in line or 'assets/logo/' in line:
            print(f'Satır {i+1}: {line.strip()}')
            count += 1
    print(f'Toplam: {count} adet')

print('\n--- 2. Emlak Stüdyom in app.html ---')
with open('app.html', 'r', encoding='utf-8', errors='ignore') as f:
    lines = f.readlines()
    count = 0
    for i, line in enumerate(lines):
        if re.search(r'Emlak\s*St.dyom', line, re.I) or 'Emlak' in line:
            if 'Emlak' in line and 'Stüdyom' in line:
                print(f'Satır {i+1}: {line.strip()}')
                count += 1
            elif re.search(r'Emlak\s*St.dyom', line, re.I):
                print(f'Satır {i+1}: {line.strip()}')
                count += 1
    print(f'Toplam: {count} adet')

print('\n--- 3. Header elementleri in app.html ---')
with open('app.html', 'r', encoding='utf-8', errors='ignore') as f:
    lines = f.readlines()
    count = 0
    for i, line in enumerate(lines):
        if re.search(r'<header|<div[^>]*(class|id)=[\"\'][^\"\']*(header|top-bar)[^\"\']*[\"\']', line, re.I):
            print(f'Satır {i+1}: {line.strip()}')
            count += 1
    print(f'Toplam: {count} adet')

print('\n--- 4. JS Dosyalarında createElement ---')
for root, dirs, files in os.walk('.'):
    if '.git' in root or 'node_modules' in root: continue
    for file in files:
        if file.endswith('.js'):
            try:
                with open(os.path.join(root, file), 'r', encoding='utf-8', errors='ignore') as f:
                    lines = f.readlines()
                    for i, line in enumerate(lines):
                        if 'createElement' in line and ('header' in line.lower() or 'logo' in line.lower()):
                            print(f'{file} - Satır {i+1}: {line.strip()}')
            except:
                pass

print('\n--- 5. CSS Dosyalarında content: logo ---')
for root, dirs, files in os.walk('.'):
    if '.git' in root or 'node_modules' in root: continue
    for file in files:
        if file.endswith('.css'):
            try:
                with open(os.path.join(root, file), 'r', encoding='latin-1') as f:
                    lines = f.readlines()
                    for i, line in enumerate(lines):
                        if 'content' in line and ('url' in line or 'logo' in line.lower() or 'header' in line.lower()):
                            print(f'{file} - Satır {i+1}: {line.strip()}')
            except:
                pass
