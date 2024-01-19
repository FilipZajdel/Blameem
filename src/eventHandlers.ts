import * as vscode from "vscode";
import * as path from "path";

import { fileOwners } from "./owners";
import { view } from "./view";
import { CodeowlersConfiguration } from "./models";

function updateCurrentOwners(filePath: string | undefined) {
  if (filePath) {
    const owners = fileOwners.getMaintainers(filePath);
    view.update(owners);
  }
}

export async function activate() {
  const configuration = vscode.workspace.getConfiguration("codeowlers") as CodeowlersConfiguration;

  const maintainersFiles = await vscode.workspace.findFiles(configuration.maintainersSource);

  vscode.workspace.findFiles(configuration.maintainersSource)
    .then(async (files: vscode.Uri[]) => {
      // @TODO: decide what to do with other results, currently we're using the first one,
      // which - in most cases - is the only returned.
      if (files.length > 0) {
        fileOwners.load(files[0], async (err) => {
          if (err) {
            console.error(`Failed to load ${configuration.maintainersSource}, reason: ${err}`);
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
        console.error(`Failed to load ${configuration.maintainersSource}`);
      }

    }, (reason) => {
      console.error(`Failed to load ${configuration.maintainersSource}, reason ${reason}`);
    });
}
