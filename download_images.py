import urllib.request
import os
import time

urls = {
    "bg-stadium-night.jpg": "https://images.unsplash.com/photo-1518605368461-1ee7e543666f?q=80&w=2000&auto=format&fit=crop",
    "bg-trophy.jpg": "https://images.unsplash.com/photo-1614632537423-1e6c2e7e0aab?q=80&w=2000&auto=format&fit=crop",
    "bg-crowd.jpg": "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?q=80&w=2000&auto=format&fit=crop",
    "bg-tunnel.jpg": "https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=2000&auto=format&fit=crop"
}

out_dir = r"c:\Users\JOHANN\Documents\wc26\frontend\public\images"
os.makedirs(out_dir, exist_ok=True)

req_headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}

for filename, url in urls.items():
    out_path = os.path.join(out_dir, filename)
    print(f"Downloading {filename}...")
    req = urllib.request.Request(url, headers=req_headers)
    success = False
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req) as response, open(out_path, 'wb') as out_file:
                out_file.write(response.read())
            print(f"Saved to {out_path}")
            success = True
            time.sleep(1)
            break
        except Exception as e:
            print(f"Failed attempt {attempt+1}: {e}")
            time.sleep(2)
