#!/usr/bin/env python
# -*- coding: utf-8 -*-

from __future__ import print_function

import os
import sys
import logging as log

from os.path import join as pjoin
from pathlib import Path

from setuptools import setup, Command
from setuptools.command.build_py import build_py
from setuptools.command.sdist import sdist

from subprocess import check_call


NAME = "jupyter-sequor"

# -----------------------------------------------------------------------------
# Minimal Python version sanity check
# -----------------------------------------------------------------------------

v = sys.version_info
if v[:2] < (2, 7) or (v[0] >= 3 and v[:2] < (3, 3)):
    error = "ERROR: %s requires Python version 2.7 or 3.3 or above." % NAME
    print(error, file=sys.stderr)
    sys.exit(1)

PY3 = sys.version_info[0] >= 3

# -----------------------------------------------------------------------------
# Continue
# -----------------------------------------------------------------------------

HERE = Path(__file__).parent

README: str = Path(HERE, "README.md").read_text(encoding="utf-8")
REQUIREMENTS: list = Path(HERE, "requirements.txt").read_text().splitlines()

ABOUT = dict()
exec(Path(HERE, NAME, "__about__.py").read_text(), ABOUT)

log.basicConfig(level=log.DEBUG)
log.info("setup.py entered")
log.info("$PATH=%s" % os.environ["PATH"])

REPO_ROOT = os.path.dirname(os.path.abspath(__file__))


def __js_prerelease(command, strict=False):
    """Decorator for building minified js/css prior to another command."""

    class DecoratedCommand(command):
        def run(self):
            jsdeps = self.distribution.get_command_obj("jsdeps")
            if all(os.path.exists(t) for t in jsdeps.targets):
                # sdist, nothing to do
                command.run(self)
                return

            try:
                self.distribution.run_command("jsdeps")
            except Exception as e:
                missing = [t for t in jsdeps.targets if not os.path.exists(t)]
                if strict or missing:
                    log.warn("rebuilding js and css failed")
                    if missing:
                        log.error("missing files: %s" % missing)
                    raise e
                else:
                    log.warn("rebuilding js and css failed (not a problem)")
                    log.warn(str(e))
            command.run(self)

    return DecoratedCommand


class NPM(Command):
    """NPM build installation command class."""

    user_options = []
    targets = [
        pjoin(REPO_ROOT, "static", "extension.js"),
        pjoin(REPO_ROOT, "static", "index.js"),
    ]

    def initialize_options(self):
        pass

    def finalize_options(self):
        pass

    def has_npm(self):
        try:
            # shell=True needs to be passed for windows to look at non .exe files.
            shell = sys.platform == "win32"
            check_call(["npm", "--version"], shell=shell)
            return True
        except:
            return False

    def run(self):
        has_npm = self.has_npm()
        if not has_npm:
            log.error(
                "`npm` unavailable.  If you're running this command using sudo, make sure `npm` is available to sudo"
            )

        else:
            log.info(
                "Installing build dependencies with npm.  This may take a while..."
            )
            check_call(
                ["npm", "install"],
                cwd=REPO_ROOT,
                stdout=sys.stdout,
                stderr=sys.stderr,
                shell=(sys.platform == "win32"),
            )
            check_call(
                ["npm", "run", "build"],
                cwd=REPO_ROOT,
                stdout=sys.stdout,
                stderr=sys.stderr,
                shell=(sys.platform == "win32"),
            )

        for t in self.targets:
            if not os.path.exists(t):
                msg = "Missing file: %s" % t
                if not has_npm:
                    msg += "\nnpm is required to build the extension."
                raise ValueError(msg)


setup_args = dict(
    name=ABOUT["__title__"],
    version=ABOUT["__version__"],
    author=ABOUT["__author__"],
    author_email=ABOUT["__email__"],
    url=ABOUT["__uri__"],
    license=ABOUT["__license__"],
    description=ABOUT["__summary__"],
    long_description=README,
    long_description_content_type="text/markdown",
    classifiers=[
        "Development Status :: 2 - Pre-Alpha",
        "Framework :: IPython",
        "Framework :: Jupyter",
        "License :: OSI Approved :: MIT License",
        "Natural Language :: English",
        "Operating System :: OS Independent",
        "Programming Language :: JavaScript",
        "Topic :: Utilities",
    ],
    cmdclass={
        "build_py": __js_prerelease(build_py),
        "sdist": __js_prerelease(sdist, strict=True),
        "jsdeps": NPM,
    },
    data_files=[
        (
            "share/jupyter/nbextensions/%s" % NAME,
            [REPO_ROOT + "/static/extension.js", REPO_ROOT + "/static/index.js"],
        ),
        (
            "etc/jupyter/nbconfig/notebook.d",
            ["jupyter-config/notebook.d/%s.json" % NAME],
        ),
    ],
    zip_safe=False,
    install_requires=REQUIREMENTS,
)

if __name__ == "__main__":
    setup(**setup_args)
