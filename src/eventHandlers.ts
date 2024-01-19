import * as vscode from "vscode";
import * as path from "path";

import { fileOwners } from "./owners";
import { view } from "./view";
import { BlameemConfiguration } from "./models";

function updateCurrentOwners(filePath: string | undefined) {
  if (filePath) {
    const owners = fileOwners.getMaintainers(filePath);
    view.update(owners);
  }
}

export async function activate() {
  const configuration = vscode.workspace.getConfiguration("blameem") as BlameemConfiguration;

  const maintainersFiles = await vscode.workspace.findFiles(configuration.participantsSource);

  vscode.workspace.findFiles(configuration.participantsSource)
    .then(async (files: vscode.Uri[]) => {
      // @TODO: decide what to do with other results, currently we're using the first one,
      // which - in most cases - is the only returned.
      if (files.length > 0) {
        fileOwners.load(files[0], async (err) => {
          if (err) {
            console.error(`Failed to load ${configuration.participantsSource}, reason: ${err}`);
          } else {

            if (vscode.window.activeTextEditor && vscode.window.activeTextEditor.document.fileName) {
              updateCurrentOwners(vscode.window.activeTextEditor.document.fileName);
            }

            vscode.window.onDidChangeActiveTextEditor(event => {
              if (event && event.document) {
                updateCurrentOwners(event.document.fileName);
              }
            });
            console.log(`Loaded maintainers from: ${files[0].toString()}`);
          }
        });
      } else {
        console.error(`Failed to load ${configuration.participantsSource}`);
      }

    }, (reason) => {
      console.error(`Failed to load ${configuration.participantsSource}, reason ${reason}`);
    });
}
