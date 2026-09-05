import os
import re

base_dir = r"c:\Users\Saira\Desktop\Zoqel\backend\src\main\java\com\zoqel"

controllers = [
    "dashboard/DashboardController.java",
    "policy/PolicyController.java",
    "recovery/RecoveryCaseController.java",
    "simulator/SimulatorController.java",
    "customer/CustomerController.java"
]

for c in controllers:
    path = os.path.join(base_dir, c.replace('/', os.sep))
    if not os.path.exists(path):
        print(f"Skipping {path}")
        continue
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Add CurrentUserService injection if missing
    if "CurrentUserService" not in content:
        content = content.replace("import lombok.RequiredArgsConstructor;", "import com.zoqel.workspace.CurrentUserService;\nimport lombok.RequiredArgsConstructor;")
        content = re.sub(r'public class (\w+Controller) \{', r'public class \1 {\n\n    private final CurrentUserService currentUserService;', content)
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
        print(f"Injected CurrentUserService into {c}")
