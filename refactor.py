import os
import re

base_dir = r"c:\Users\Saira\Desktop\Zoqel\backend\src\main\java\com\zoqel"

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def write_file(path, content):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

# Update WorkspaceController to have /me
wc_path = os.path.join(base_dir, "workspace", "WorkspaceController.java")
wc = read_file(wc_path)
wc = wc.replace('@GetMapping("/{id}")', '@GetMapping("/me")')
wc = wc.replace('public ResponseEntity<Workspace> getWorkspace(@PathVariable String id) {', 
'''public ResponseEntity<Workspace> getWorkspace(Authentication auth) {
        com.zoqel.auth.AppUser user = com.zoqel.auth.AppUserRepository.class.cast(org.springframework.web.context.support.WebApplicationContextUtils.getRequiredWebApplicationContext(org.springframework.web.context.request.RequestContextHolder.currentRequestAttributes().getAttribute("org.springframework.web.servlet.DispatcherServlet.CONTEXT", 0)).getBean(com.zoqel.auth.AppUserRepository.class)).findById(auth.getName()).orElseThrow();
        return ResponseEntity.ok(workspaceService.getWorkspace(user.getWorkspaceId()));
    }''')
# That's a bit hacky. Let's do it properly by injecting CurrentUserService.

