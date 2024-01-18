import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import * as yaml from "yaml";

import OwnersIf from "./models";

class FileOwners {
  owners: Map<string, OwnersIf> = new Map();
  root: string = "";

  async loadYaml(ymlData: string) {
    const document = yaml.parseDocument(ymlData);

    if (!document.contents) return;

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

    console.log(`Loaded owners from a file`);
  }

  async loadDummy(ownersUri: vscode.Uri) {
    // Load from the local variable
    vscode.window.showWarningMessage(
      `Failed to load ${ownersUri}. Make sure the file exists. Using dummy data!`
    );

    this.owners = new Map([
      [
        "arch/arc/",
        {
          maintainers: ["ruuddw"],
          collaborators: ["abrodkin", "evgeniy-paltsev", "SiyuanCheng-CN"]
        }
      ],
      [
        "include/zephyr/arch/arc/",
        {
          maintainers: ["ruuddw"],
          collaborators: ["abrodkin", "evgeniy-paltsev", "SiyuanCheng-CN"]
        }
      ],
      [
        "tests/arch/arc/",
        {
          maintainers: ["ruuddw"],
          collaborators: ["abrodkin", "evgeniy-paltsev", "SiyuanCheng-CN"]
        }
      ],
      [
        "dts/arc/synopsys/",
        {
          maintainers: ["ruuddw"],
          collaborators: ["abrodkin", "evgeniy-paltsev", "SiyuanCheng-CN"]
        }
      ],
      [
        "doc/hardware/arch/",
        {
          maintainers: ["ruuddw"],
          collaborators: ["aaa", "bbb", "ccc"]
        }
      ]
    ]);

    this.root = "/home/filipzajdel/zephyrproject/zephyr";
  }

  async load(ownersUri: vscode.Uri) {
    fs.lstat(ownersUri.path, (err, stats) => {
      if (err) {
        console.error(`Could not access ${ownersUri}: ${err}`);
        this.loadDummy(ownersUri);
      } else {
        fs.readFile(ownersUri.path, (err, buffer) => {
          if (err) {
            console.error(`Could not read ${ownersUri}: ${err}`);
            this.loadDummy(ownersUri);
          } else {
            this.loadYaml(buffer.toString());
            this.root = path.parse(ownersUri.path).dir;
          }
        });
      }
    });
  }

  getMaintainers(filepathAbs: string): OwnersIf {
    if (this.root === "" || !filepathAbs.startsWith(this.root)) {
      return { collaborators: [], maintainers: [] };
    }

    let relative = path.relative(this.root, filepathAbs);

    while (filepathAbs !== this.root) {

      const owners = this.owners.get(relative);
      if (owners) return owners;

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
