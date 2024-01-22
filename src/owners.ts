/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 */

import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import * as yaml from "yaml";

import { FileParticipants } from "./models";

class FileOwners {
  private _owners: Map<string, FileParticipants> = new Map();
  private _root: string = "";

  async loadFromYaml(ymlData: string) {
    const document = yaml.parseDocument(ymlData);

    if (!document.contents) {
      return;
    }

    document.contents.items.forEach(item => {
      const files = item.value.get("files");
      const isMaintained = item.value.get("status") === "maintained";

      if (isMaintained) {
        files.items.forEach(file => {
          const collaborators = item.value.get("collaborators");
          const maintainers = item.value.get("maintainers");

          this._owners.set(file.value, {
            collaborators: collaborators ? collaborators.items : [],
            maintainers: maintainers ? maintainers.items : []
          });
        });
      }
    });
  }

  async load(participantsSearchPath: string, onLoad: (err: NodeJS.ErrnoException | null) => void) {
    vscode.workspace.findFiles(participantsSearchPath).then(
      async (files: vscode.Uri[]) => {
        // @TODO: decide what to do with other results, currently we're using the first one,
        // which - in most cases - is the only returned.
        if (files.length > 0) {
          this.loadFromFile(files[0], async err => {
            if (err) {
              console.error(
                `Failed to load ${participantsSearchPath}, reason: ${err}`
              );
            } else {
              onLoad(err);
              console.log(`Loaded maintainers from: ${files[0].toString()}`);
            }
          });
        } else {
          console.error(`Failed to load ${participantsSearchPath}`);
        }
      },
      reason => {
        console.error(
          `Failed to load ${participantsSearchPath}, reason ${reason}`
        );
      }
    );
  }

  private async loadFromFile(
    ownersUri: vscode.Uri,
    onLoad: (err: NodeJS.ErrnoException | null) => void
  ) {
    fs.lstat(ownersUri.path, (err, stats) => {
      if (err) {
        onLoad(err);
      } else {
        fs.readFile(ownersUri.path, async (err, buffer) => {
          if (err) {
            onLoad(err);
          } else {
            this.loadFromYaml(buffer.toString());
            this._root = path.parse(ownersUri.path).dir;
            onLoad(err);
          }
        });
      }
    });
  }

  findMaintainers(filepathAbs: string): FileParticipants {
    if (this._root === "" || !filepathAbs.startsWith(this._root)) {
      return { collaborators: [], maintainers: [] };
    }

    let relative = path.relative(this._root, filepathAbs);

    while (filepathAbs !== this._root) {
      const owners = this._owners.get(relative);

      if (owners) {
        return owners;
      }

      filepathAbs = path.parse(filepathAbs).dir;
      relative = path.relative(this._root, filepathAbs) + "/";
    }

    return { collaborators: [], maintainers: [] };
  }

  hasMaintainers(filepathAbs: string): boolean {
    return this.findMaintainers(filepathAbs) !== undefined;
  }
}

export const fileOwners = new FileOwners();
