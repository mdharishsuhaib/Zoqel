import os

def fix_mojibake():
    exts = ['.md', '.ts', '.tsx', '.json', '.html', '.py', '.java']
    
    # Common mojibake mappings for UTF-8 read as CP1252
    replacements = {
        '—': '—',
        '→': '→',
        '×': '×',
        '├': '├',
        '─': '─',
        '└': '└',
        '│': '│',
        '✓': '✓',
        '₹': '₹',
        '·': '·'
    }

    count = 0
    for root, dirs, files in os.walk('.'):
        if any(x in root for x in ['node_modules', '.git', 'dist', 'target', '.gemini']):
            continue
        for f in files:
            if any(f.endswith(e) for e in exts):
                filepath = os.path.join(root, f)
                with open(filepath, 'r', encoding='utf-8', errors='ignore') as file:
                    content = file.read()
                
                original_content = content
                for corrupted, correct in replacements.items():
                    if corrupted in content:
                        content = content.replace(corrupted, correct)
                
                if content != original_content:
                    with open(filepath, 'w', encoding='utf-8') as out:
                        out.write(content)
                    print(f'Fixed artifacts in {filepath}')
                    count += 1
                    
    print(f'Successfully repaired {count} files.')

if __name__ == '__main__':
    fix_mojibake()
