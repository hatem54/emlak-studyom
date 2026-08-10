with open('main.js', 'r', encoding='utf-8') as f:
    data = f.read()

# Fix logoInput manually
idx = data.find("const f=e.target.files[0];", data.find("$('logoInput').addEventListener"))
if idx == -1:
    idx = data.find("const f = e.target.files[0];", data.find("$('logoInput').addEventListener"))

if idx != -1:
    idx2 = data.find("if(!f) return;", idx)
    if idx2 != -1:
        if "validateImageUpload" not in data[idx2:idx2+100]:
            data = data[:idx2 + 14] + "\n            if(!window.validateImageUpload(f)) { e.target.value = ''; return; }" + data[idx2 + 14:]

# Fix imageInput manually
idx = data.find("const f=e.target.files[0];", data.find("$('imageInput').addEventListener"))
if idx == -1:
    idx = data.find("const f = e.target.files[0];", data.find("$('imageInput').addEventListener"))

if idx != -1:
    idx2 = data.find("if(!f) return;", idx)
    if idx2 != -1:
        if "validateImageUpload" not in data[idx2:idx2+100]:
            data = data[:idx2 + 14] + "\n            if(!window.validateImageUpload(f)) { e.target.value = ''; return; }" + data[idx2 + 14:]

with open('main.js', 'w', encoding='utf-8') as f:
    f.write(data)
