import re

with open('app.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

results = []
for i, line in enumerate(lines):
    # Search for an isolated 'n' right after a tag closure or on a new line
    # or before a tag closure
    # or just `>n<` or `>\n n\n<`
    # We will just look for `n` with surrounding non-alphanumeric chars that usually denote an orphan.
    if re.search(r'>\s*n\s*<', line) or re.search(r'^\s*n\s*$', line) or re.search(r'>n\s*', line) or re.search(r'\s*n<', line):
        results.append(f'Line {i+1}: {line.strip()}')

with open('n_search.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(results))
