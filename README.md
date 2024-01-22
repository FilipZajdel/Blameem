# Blame'em README

Blame'em is a nice and sweet little extension that lets you know who to blame for introducing bugs or letting others to introduce bugs in currently displayed file.

## Features

Blame'em checks if the currently focused file has any collaborators or maintainers and displays them in the status bar
at the bottom. The maintainers and collaborators are loaded from the YAML file (defaults to `MAINTAINERS.yml`) found in the workspace.

## Requirements

* "@types/mocha": "^10.0.6",
* "@types/node": "18.x",
* "@types/vscode": "^1.85.0",
* "@typescript-eslint/eslint-plugin": "^6.15.0",
* "@typescript-eslint/parser": "^6.15.0",
* "@vscode/test-cli": "^0.0.4",
* "@vscode/test-electron": "^2.3.8",
* "eslint": "^8.56.0",
* "typescript": "^5.3.3",
* "yaml": "^2.3.4"

## Extension Settings

* `blameem.participantsSource`: The maintainers file search pattern. Defaults to `*/**/MAINTAINERS.yml`

**Enjoy!**
