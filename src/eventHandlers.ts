import * as vscode from "vscode";
import * as path from "path";

import { fileOwners } from "./owners";
import { view } from "./view";

async function updateCurrentOwners(filePath: string | undefined) {
  if (filePath) {
    const owners = fileOwners.getMaintainers(filePath);
    view.update(owners);
  }
}

export function activate() {
  updateCurrentOwners(vscode.window.activeTextEditor.document.fileName);

  vscode.window.onDidChangeActiveTextEditor(event => {
    if (event && event.document) {
      updateCurrentOwners(event.document.fileName);
    }
  });
}
