import importlib.util
import pathlib
import tempfile
import unittest
from unittest.mock import patch

SRC = pathlib.Path(__file__).resolve().parents[1] / "source" / "signalscope.py"
spec = importlib.util.spec_from_file_location("signalscope", SRC)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

class SignalScopeTests(unittest.TestCase):
    def test_extract_text(self):
        html = "<h1>News</h1><script>secret</script><p>Hello <b>world</b></p>"
        output = module.extract_text(html)
        self.assertIn("News", output)
        self.assertIn("Hello world", output)
        self.assertNotIn("secret", output)

    def test_snapshots(self):
        with tempfile.TemporaryDirectory() as d:
            database = str(pathlib.Path(d) / "test.db")
            url = "https://example.org/"
            with patch.object(module, "permitted", return_value=True), patch.object(module, "fetch", side_effect=[
                ("<h1>One</h1>", url), ("<h1>One</h1>", url), ("<h1>Two</h1>", url)]):
                self.assertEqual(module.check(url, database)["status"], "first_snapshot")
                self.assertEqual(module.check(url, database)["status"], "unchanged")
                changed = module.check(url, database)
                self.assertEqual(changed["status"], "changed")
                self.assertIn("+Two", changed["diff"])
            self.assertEqual(len(module.history(url, database)), 2)

if __name__ == "__main__":
    unittest.main()
