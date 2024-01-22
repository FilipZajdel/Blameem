/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 */

import * as vscode from "vscode";
import * as path from "path";

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

function onInitialOwnersLoad(err: NodeJS.ErrnoException | null) {
  if (err) {
    console.log("Failed to load maintainers file");
  } else {
    updateCurrentOwners();

    vscode.window.onDidChangeActiveTextEditor(event => {
      if (event && event.document) {
        updateCurrentOwners();
      }
    });
  }
}

async function onDidChangeConfiguration(
  event: vscode.ConfigurationChangeEvent
) {
  if (event.affectsConfiguration("blameem.participantsSource")) {
    const configuration = vscode.workspace.getConfiguration(
      "blameem"
    ) as BlameemConfiguration;
    fileOwners.load(configuration.participantsSource, err => {
      if (err) {
        console.log(`Failed to found maintainers file: ${err}`);
      } else {
        updateCurrentOwners();
      }
    });
  }
}

export async function activate() {
  const configuration = vscode.workspace.getConfiguration(
    "blameem"
  ) as BlameemConfiguration;

  fileOwners.load(configuration.participantsSource, onInitialOwnersLoad);

  vscode.workspace.onDidChangeConfiguration(onDidChangeConfiguration);
}
