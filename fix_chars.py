import os
import glob

def fix_corrupted_chars():
    files = [
        'docs/evaluation.md',
        'frontend/src/features/simulator/SimulatorPage.tsx',
        'frontend/src/features/proof/ProofModePage.tsx',
        'frontend/src/features/payments/PaymentsPage.tsx',
        'README.md'
    ]
    for filepath in files:
        if os.path.exists(filepath):
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # The exact corrupted sequence
            corrupted = "—"
            
            if corrupted in content:
                content = content.replace(corrupted, "-")
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Fixed {filepath}")
            else:
                print(f"No corruption found in {filepath}")

if __name__ == '__main__':
    fix_corrupted_chars()
