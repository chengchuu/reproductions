# python3 repro.py [URI to open], in a directory with a tsconfig.json
import json, os, subprocess, sys

p = subprocess.Popen(["tsc", "--lsp", "--stdio"], stdin=subprocess.PIPE, stdout=subprocess.PIPE)

def send(msg):
    body = json.dumps({"jsonrpc": "2.0", **msg}).encode()
    p.stdin.write(b"Content-Length: %d\r\n\r\n%s" % (len(body), body))
    p.stdin.flush()

def reply(id):
    while True:
        length = None
        while (line := p.stdout.readline()) not in (b"\r\n", b""):
            if line.lower().startswith(b"content-length:"):
                length = int(line.split(b":")[1])
        if length is None:
            return None  # the server is gone
        msg = json.loads(p.stdout.read(length))
        if "method" in msg and "id" in msg:  # a request from the server
            send({"id": msg["id"], "result": None})
        elif msg.get("id") == id:
            return msg

root = "file://" + os.getcwd()
send({"id": 1, "method": "initialize", "params": {"processId": os.getpid(), "rootUri": root, "capabilities": {}}})
reply(1)
send({"method": "initialized", "params": {}})
if len(sys.argv) > 1:
    doc = {"uri": sys.argv[1], "languageId": "typescript", "version": 0, "text": "const x = 1;\n"}
    send({"method": "textDocument/didOpen", "params": {"textDocument": doc}})
send({"id": 2, "method": "shutdown"})
if reply(2) is not None:
    send({"method": "exit"})
print("exit code:", p.wait())
