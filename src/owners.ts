/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 */

import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import * as yaml from "yaml";
import { promisify } from "util";
import { FileParticipants, FileMaintainers } from "./models";

const readFile = promisify(fs.readFile);
const lstat = promisify(fs.lstat);

class FileOwners {
  private _owners: Map<string, FileParticipants> = new Map();
  private _root: string = "";

  loadFromYaml(ymlData: string) {
    const parsed = yaml.parse(ymlData) as FileMaintainers;

    Object.values(parsed).forEach(
      (entry: FileMaintainers) => {
        if (entry.status === "maintained") {
          entry.files.forEach(file => {
            this._owners.set(
              file, {
              collaborators: entry.collaborators,
              maintainers: entry.maintainers
            });
          });
        }
      }
    );
  }

  async load(participantsSearchPath: string): Promise<void> {
    return vscode.workspace.findFiles(participantsSearchPath).then(
      (files: vscode.Uri[]) => {
        if (files.length === 0) {
          return Promise.reject(`${participantsSearchPath} could not be found`);
        }

        return this.loadFromFile(files[0]);
      }
    );
  }

  private async loadFromFile(ownersUri: vscode.Uri): Promise<void> {

    await lstat(ownersUri.path);

    return readFile(ownersUri.path)
      .then(
        (buffer) => {
          this.loadFromYaml(buffer.toString());
          this._root = path.parse(ownersUri.path).dir;
          return Promise.resolve();
        },
        (reason) => { return Promise.reject(reason); }
      );
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
