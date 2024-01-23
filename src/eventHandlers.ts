/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 */

import * as vscode from "vscode";

import { fileOwners } from "./owners";
import { view } from "./view";
import { BlameemConfiguration } from "./models";

function updateCurrentOwners() {
  if (
    vscode.window.activeTextEditor &&
    vscode.window.activeTextEditor.document.fileName
  ) {
    const owners = fileOwners.findMaintainers(
      vscode.window.activeTextEditor.document.fileName
    );
    view.update(owners);
  }
}

async function onDidChangeConfiguration(
  event: vscode.ConfigurationChangeEvent
) {
  if (event.affectsConfiguration("blameem.participantsSource")) {
    const configuration = vscode.workspace.getConfiguration(
      "blameem"
    ) as BlameemConfiguration;
    fileOwners.load(configuration.participantsSource).then(
      async () => {
        updateCurrentOwners();
        console.log("Successfully updated maintainers");
      },
      (reason) => console.log(reason)
    );
  }
}

export async function activate() {
  const configuration = vscode.workspace.getConfiguration(
    "blameem"
  ) as BlameemConfiguration;

  fileOwners.load(configuration.participantsSource).then(
    async () => {
      console.log("Successfully loaded participants");
      updateCurrentOwners();
    },
    reason => console.log(reason)
  );

  vscode.workspace.onDidChangeConfiguration(onDidChangeConfiguration);
  vscode.window.onDidChangeActiveTextEditor(event => {
    if (event && event.document) {
      updateCurrentOwners();
    }
  });
}
