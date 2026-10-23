"""Open and close three files and report unrelated project rebuilds."""

import argparse
import json
import os
from pathlib import Path
import queue
import subprocess
import threading


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--tsc", default="tsc", help="TypeScript native executable")
    parser.add_argument("--log", type=Path, help="Save server log messages")
    args = parser.parse_args()
    root = Path(__file__).resolve().parent
    messages = queue.Queue()
    logs = []
    process = subprocess.Popen(
        [args.tsc, "--lsp", "--stdio"], cwd=root,
        stdin=subprocess.PIPE, stdout=subprocess.PIPE,
    )

    def read_messages():
        try:
            while True:
                headers = {}
                while True:
                    line = process.stdout.readline()
                    if not line:
                        raise EOFError("Language server closed stdout")
                    if line == b"\r\n":
                        break
                    key, value = line.decode().split(":", 1)
                    headers[key.lower()] = value.strip()
                messages.put(json.loads(process.stdout.read(int(headers["content-length"]))))
        except Exception as error:
            messages.put(error)

    threading.Thread(target=read_messages, daemon=True).start()

    def send(message):
        body = json.dumps({"jsonrpc": "2.0", **message}).encode()
        process.stdin.write(b"Content-Length: %d\r\n\r\n" % len(body) + body)
        process.stdin.flush()

    def wait_for_response(request_id):
        while True:
            message = messages.get(timeout=30)
            if isinstance(message, Exception):
                raise message
            if message.get("method") == "window/logMessage":
                logs.append(message["params"]["message"])
            if "method" in message and "id" in message:
                # Acknowledge server requests before waiting for our response.
                send({"id": message["id"], "result": None})
            elif message.get("id") == request_id:
                if "error" in message:
                    raise RuntimeError(message["error"])
                return message.get("result")

    try:
        send({"id": 1, "method": "initialize", "params": {
            "processId": os.getpid(), "rootUri": root.as_uri(),
            "capabilities": {}, "initializationOptions": {"logVerbosity": 2},
        }})
        wait_for_response(1)
        send({"method": "initialized", "params": {}})
        for request_id, path in enumerate(sorted((root / "src").glob("*.ts")), 2):
            document = {"uri": path.as_uri()}
            send({"method": "textDocument/didOpen", "params": {"textDocument": {
                **document, "languageId": "typescript", "version": 1,
                "text": path.read_text(),
            }}})
            # Wait for a real language-service response before closing the file.
            send({"id": request_id, "method": "textDocument/documentSymbol",
                  "params": {"textDocument": document}})
            symbols = wait_for_response(request_id)
            if not symbols:
                raise RuntimeError("No document symbols returned for " + path.name)
            print(path.name + ": documentSymbol succeeded")
            send({"method": "textDocument/didClose", "params": {"textDocument": document}})
        send({"id": 100, "method": "shutdown"})
        wait_for_response(100)
        # End the transport after shutdown; exit-notification behavior is unrelated.
        process.stdin.close()
        process.wait(timeout=10)
    finally:
        if process.poll() is None:
            process.kill()
            process.wait()
        if args.log:
            args.log.write_text("\n".join(logs) + "\n")

    # Project IDs in logs can be lowercased on case-insensitive filesystems.
    text = "\n".join(logs).casefold()
    config = str(root / "tsconfig.node.json").casefold()
    counts = {
        "created": text.count("creating configuredproject: " + config),
        "updated": text.count("program update for " + config + " completed"),
        "deleted": text.count("deleting configured project: " + config),
    }
    for action, count in counts.items():
        print("tsconfig.node.json " + action + ": " + str(count))
    reproduced = all(count >= 3 for count in counts.values())
    print("Issue reproduced" if reproduced else "Repeated rebuild pattern not observed")
    return 0 if reproduced else 1


if __name__ == "__main__":
    raise SystemExit(main())
