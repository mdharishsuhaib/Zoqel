import os

exts = ['.md', '.ts', '.tsx', '.json', '.html', '.py', '.java']
targets = ['â', 'Â', 'Ã', '€', '—', '₹', '·']

for root, dirs, files in os.walk('.'):
    if any(x in root for x in ['node_modules', '.git', 'dist', 'target', '.gemini']):
        continue
    for f in files:
        if any(f.endswith(e) for e in exts):
            filepath = os.path.join(root, f)
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as file:
                lines = file.readlines()
            
            for i, line in enumerate(lines):
                for t in targets:
                    if t in line:
                        print(f"{filepath}:{i+1} found {t.encode('utf-8')}")
                        break
