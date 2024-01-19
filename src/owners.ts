/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 */

import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import * as yaml from "yaml";

import { FileParticipants } from "./models";

class FileOwners {
  owners: Map<string, FileParticipants> = new Map();
  root: string = "";

  async loadYaml(ymlData: string) {
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

          this.owners.set(file.value, {
            collaborators: collaborators ? collaborators.items : [],
            maintainers: maintainers ? maintainers.items : []
          });
        });
      }
    });
  }

  async load(ownersUri: vscode.Uri,
    onLoad: (err: NodeJS.ErrnoException | null) => void) {
    fs.lstat(ownersUri.path, (err, stats) => {
      if (err) {
        onLoad(err);
      } else {
        fs.readFile(ownersUri.path, async (err, buffer) => {
          if (err) {
            onLoad(err);
          } else {
            this.loadYaml(buffer.toString());
            this.root = path.parse(ownersUri.path).dir;
            onLoad(err);
          }
        });
      }
    });
  }

  getMaintainers(filepathAbs: string): FileParticipants {
    if (this.root === "" || !filepathAbs.startsWith(this.root)) {
      return { collaborators: [], maintainers: [] };
    }

    let relative = path.relative(this.root, filepathAbs);

    while (filepathAbs !== this.root) {

      const owners = this.owners.get(relative);

      if (owners) {
        return owners;
      }

      filepathAbs = path.parse(filepathAbs).dir;
      relative = path.relative(this.root, filepathAbs) + "/";
    }

    return { collaborators: [], maintainers: [] };
  }

  hasMaintainers(filepathAbs: string): boolean {
    return this.getMaintainers(filepathAbs) !== undefined;
  }
}

export const fileOwners = new FileOwners();
