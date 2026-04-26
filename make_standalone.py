import urllib.request
import base64

# Download Tailwind
print("Downloading Tailwind...")
tailwind_req = urllib.request.Request("https://cdn.tailwindcss.com", headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(tailwind_req) as response:
    tailwind_script = response.read().decode('utf-8')

# Download FontAwesome CSS
print("Downloading FontAwesome CSS...")
fa_css_req = urllib.request.Request("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css", headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(fa_css_req) as response:
    fa_css = response.read().decode('utf-8')

import re
# Find font urls
font_urls = re.findall(r'url\(([^)]+\.(?:woff2|ttf|woff))\)', fa_css)
font_urls = list(set(font_urls))

print(f"Found font urls: {font_urls}")

# Download and base64 encode fonts
font_base64 = {}
for url in font_urls:
    # URL is relative like ../webfonts/fa-solid-900.woff2
    full_url = url.replace('../webfonts/', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/webfonts/')
    # Remove quotes if any
    full_url = full_url.strip("'\"")
    print(f"Downloading {full_url}...")
    try:
        req = urllib.request.Request(full_url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            font_data = response.read()
            b64_data = base64.b64encode(font_data).decode('utf-8')
            ext = url.split('.')[-1].strip("'\"")
            mime_type = "font/woff2" if ext == "woff2" else f"font/{ext}"
            font_base64[url] = f"data:{mime_type};charset=utf-8;base64,{b64_data}"
    except Exception as e:
        print(f"Failed to download {full_url}: {e}")

# Replace URLs in CSS
for url, b64 in font_base64.items():
    fa_css = fa_css.replace(url, b64)

# Now read index.html and replace external links
with open('index.html', 'r') as f:
    html = f.read()

# Replace Tailwind
html = html.replace('<script src="https://cdn.tailwindcss.com"></script>',
              f'<script>\n{tailwind_script}\n</script>')

# Replace FontAwesome
html = html.replace('<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">',
              f'<style>\n{fa_css}\n</style>')

with open('index.html', 'w') as f:
    f.write(html)

print("Done!")
