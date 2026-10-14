"""Build-only regression checks. Never launch or install either mesh binary."""
from pathlib import Path
import platform
import shutil
import subprocess
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]


@unittest.skipUnless(
    platform.system() == "Linux"
    and platform.machine().lower() in {"x86_64", "amd64"}
    and shutil.which("gcc")
    and shutil.which("make"),
    "The current mesh Makefile requires Linux, x86-64, GCC and make",
)
class MeshBuildTargetsTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.workspace = tempfile.TemporaryDirectory(prefix="keddeh-mesh-build-")
        cls.addClassCleanup(cls.workspace.cleanup)
        cls.root = Path(cls.workspace.name) / "keddeh"
        shutil.copytree(ROOT / "opt/keddeh", cls.root, ignore=shutil.ignore_patterns("bin"))
        subprocess.run(["make", "all"], cwd=cls.root, check=True, capture_output=True, text=True)

    def test_runtime_binary_is_preserved(self):
        self.assertTrue((self.root / "bin/keddeh_mesh_runtime").is_file())

    def test_daemon_binary_is_built(self):
        self.assertTrue((self.root / "bin/keddeh-mesh-daemon").is_file())

    def test_service_execstart_has_a_matching_build_artifact(self):
        lines = (self.root / "configs/keddeh-mesh.service").read_text().splitlines()
        command = next(line.partition("=")[2] for line in lines if line.startswith("ExecStart="))
        self.assertEqual(command, "/opt/keddeh/bin/keddeh-mesh-daemon")
        relative = Path(command).relative_to("/opt/keddeh")
        self.assertTrue((self.root / relative).is_file(), command)

    def test_binaries_are_separate_elf_artifacts(self):
        runtime = self.root / "bin/keddeh_mesh_runtime"
        daemon = self.root / "bin/keddeh-mesh-daemon"
        self.assertFalse(runtime.is_symlink())
        self.assertFalse(daemon.is_symlink())
        self.assertEqual(runtime.read_bytes()[:4], b"\x7fELF")
        self.assertEqual(daemon.read_bytes()[:4], b"\x7fELF")
        self.assertNotEqual(runtime.read_bytes(), daemon.read_bytes())

    def test_second_make_is_up_to_date(self):
        result = subprocess.run(["make", "--question", "all"], cwd=self.root)
        self.assertEqual(result.returncode, 0)


if __name__ == "__main__":
    unittest.main()
