"""Run: python -X utf8 tests/manual-network.py

Execute the Python examples stored in network.json using direct HTTP-handler
fixtures and a real temporary SQLite database. No socket, HTTP server, browser,
LAN, public host, real account or persistent classroom data is used. These tests
do not establish browser layout, live networking or cross-device operation.
"""

import contextlib
import http.server
import io
import json
from pathlib import Path
import tempfile
import unittest
from unittest import mock


ROOT = Path(__file__).resolve().parents[1]
BOOK = json.loads((ROOT / "course-manual/data/network.json").read_text(encoding="utf-8"))
UNITS = {unit["id"]: unit for unit in BOOK["units"]}


class NoSocketServer:
    """Prevent eb-1's top-level demonstration startup from binding a socket."""

    def __init__(self, address, handler):
        assert address == ("127.0.0.1", 8000), "Example must remain a local demonstration"

    def serve_forever(self):
        pass


def load_example(source, filename):
    namespace = {"__name__": "manual_fixture", "__file__": str(filename)}
    with mock.patch.object(http.server, "ThreadingHTTPServer", NoSocketServer):
        with contextlib.redirect_stdout(io.StringIO()):
            exec(compile(source, str(filename), "exec"), namespace)
    return namespace


def request(namespace, method, path, data=None, cookie=None, raw=None):
    """Call the actual example handler with in-memory request/response streams."""
    handler = namespace["Handler"].__new__(namespace["Handler"])
    handler.path = path
    payload = raw if raw is not None else (
        json.dumps(data).encode("utf-8") if data is not None else b""
    )
    handler.headers = {
        "Content-Length": str(len(payload)),
        "Content-Type": "application/json",
    }
    if cookie:
        handler.headers["Cookie"] = cookie
    handler.rfile = io.BytesIO(payload)
    handler.wfile = io.BytesIO()
    response = {"headers": {}}
    handler.send_response = lambda code: response.update(status=code)
    handler.send_header = lambda key, value: response["headers"].update({key: value})
    handler.end_headers = lambda: None
    getattr(handler, "do_" + method)()
    body = handler.wfile.getvalue()
    assert int(response["headers"]["Content-Length"]) == len(body)
    try:
        response["body"] = json.loads(body)
    except ValueError:
        response["body"] = body.decode("utf-8")
    return response


def cookie_from(response):
    return response["headers"]["Set-Cookie"].split(";", 1)[0]


class ManualNetworkExamples(unittest.TestCase):
    def test_all_embedded_python_compiles(self):
        for unit in BOOK["units"]:
            for section in unit["sections"]:
                code = section.get("code", {})
                if code.get("language") == "python":
                    with self.subTest(unit=unit["id"], section=section["id"]):
                        compile(code["text"], unit["id"] + "/" + section["id"], "exec")

    def test_eb1_http_service_handler(self):
        source = next(section["code"]["text"] for section in UNITS["eb-1"]["sections"]
                      if section.get("code"))
        with tempfile.TemporaryDirectory(prefix="ict-manual-network-") as temporary:
            namespace = load_example(source, Path(temporary) / "service.py")
            self.assertEqual(request(namespace, "GET", "/")["status"], 200)
            info = request(namespace, "GET", "/api/info")
            self.assertEqual(info["status"], 200)
            self.assertEqual(info["body"], {"service": "exhibition", "mode": "local-demo"})
            echo = request(namespace, "POST", "/api/echo", {"message": " demo "})
            self.assertEqual((echo["status"], echo["body"]), (200, {"received": "demo"}))
            for data in ({"message": " "}, {"message": "x" * 21}, {"message": 3}, []):
                with self.subTest(data=data):
                    self.assertEqual(request(namespace, "POST", "/api/echo", data)["status"], 400)
            self.assertEqual(request(namespace, "POST", "/api/echo", raw=b"{")["status"], 400)
            self.assertEqual(request(namespace, "GET", "/missing")["status"], 404)

    def test_eb2_authorisation_validation_sessions_and_sqlite(self):
        sections = {section["id"]: section for section in UNITS["eb-2"]["sections"]}
        with tempfile.TemporaryDirectory(prefix="ict-manual-network-") as temporary:
            folder = Path(temporary)
            for section_id, filename in (
                ("interface", "index.html"), ("shared-css", "style.css"), ("javascript", "app.js")
            ):
                (folder / filename).write_text(sections[section_id]["code"]["text"], encoding="utf-8")
            source = sections["server"]["code"]["text"]
            namespace = load_example(source, folder / "server.py")
            for path in ("/", "/style.css", "/app.js"):
                self.assertEqual(request(namespace, "GET", path)["status"], 200)
            self.assertEqual(request(namespace, "GET", "/api/profile")["status"], 401)
            self.assertEqual(request(namespace, "GET", "/profiles.sqlite3")["status"], 404)
            bad_login = request(namespace, "POST", "/api/login", {"username": "alice", "password": "bad"})
            self.assertEqual(bad_login["status"], 401)

            def login(username):
                result = request(namespace, "POST", "/api/login", {
                    "username": username, "password": "learn-only"
                })
                self.assertEqual(result["status"], 200)
                self.assertIn("HttpOnly", result["headers"]["Set-Cookie"])
                self.assertIn("SameSite=Lax", result["headers"]["Set-Cookie"])
                return cookie_from(result)

            alice = login("alice")
            self.assertEqual(request(namespace, "GET", "/api/profile", cookie=alice)["body"]["age"], 16)
            for age in (12, 100, 18):
                result = request(namespace, "POST", "/api/profile", {"age": age}, alice)
                self.assertEqual((result["status"], result["body"]["age"]), (200, age))
            for age in (11, 101, 16.5, "16", True, None):
                with self.subTest(age=age):
                    self.assertEqual(request(namespace, "POST", "/api/profile", {"age": age}, alice)["status"], 400)
                    self.assertEqual(request(namespace, "GET", "/api/profile", cookie=alice)["body"]["age"], 18)

            tampered = request(namespace, "POST", "/api/profile", {"age": 18, "studentId": "S02"}, alice)
            self.assertEqual(tampered["body"]["studentId"], "S01")
            bob = login("bob")
            self.assertEqual(request(namespace, "GET", "/api/profile", cookie=bob)["body"]["age"], 17)
            self.assertEqual(request(namespace, "POST", "/api/logout", {}, alice)["status"], 200)
            self.assertEqual(request(namespace, "GET", "/api/profile", cookie=alice)["status"], 401)

            # Controlled clock state: expire the actual example's server-side session.
            namespace["SESSIONS"][bob.split("=", 1)[1]] = ("S02", 0)
            self.assertEqual(request(namespace, "GET", "/api/profile", cookie=bob)["status"], 401)
            bob = login("bob")
            self.assertEqual(request(namespace, "GET", "/api/profile", cookie=bob)["status"], 200)

            # Reload the exact example with the same SQLite file, as a restart would.
            namespace = load_example(source, folder / "server.py")
            self.assertEqual(request(namespace, "GET", "/api/profile", cookie=bob)["status"], 401)
            alice = login("alice")
            self.assertEqual(request(namespace, "GET", "/api/profile", cookie=alice)["body"]["age"], 18)
        # Successful TemporaryDirectory cleanup also detects leaked SQLite handles on Windows.


if __name__ == "__main__":
    unittest.main(verbosity=2)
