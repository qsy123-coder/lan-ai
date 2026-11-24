import json
import os
import subprocess
import tempfile

import clash_api as K

node = "🇭🇰 香港Anytls 01"
body = json.dumps({"name": node}, ensure_ascii=False)
extra = "Content-Type: application/json\r\nContent-Length: %d\r\n" % len(body.encode("utf-8"))
fd, of = tempfile.mkstemp(suffix=".http")
os.close(fd)
ps = (K._PS_TMPL.replace("@PIPE@", "verge-mihomo")
      .replace("@METHOD@", "PUT")
      .replace("@PATH@", "/proxies/GLOBAL")
      .replace("@EXTRA@", extra)
      .replace("@BODY@", body)
      .replace("@OUTFILE@", of.replace("\\", "\\\\")))
r = subprocess.run(["powershell", "-NoProfile", "-Command", ps], capture_output=True, timeout=60)
print("rc", r.returncode)
print("stderr", r.stderr.decode("utf-8", "replace")[:400])
try:
    raw = open(of, "rb").read()
    print("outfile len", len(raw))
    print(repr(raw[:400]))
except Exception as e:
    print("read err", e)
try:
    os.unlink(of)
except Exception:
    pass
