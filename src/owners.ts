import * as vscode from "vscode";

const path = require("node:path");
const fs = require("fs");

interface FileOwners {
  maintainers: Array<string>;
  collaborators: Array<string>;
}

class FileMaintainers {
  owners: Map<string, FileOwners>;
  root: string;

  constructor(maintainersFilePath: string) {
    if (fs.existsSync(maintainersFilePath)) {
      // Load the owners and maintainers from a file
      this.owners = new Map();
      this.root = "";
    } else {
      vscode.window.showWarningMessage(
        `Failed to load ${maintainersFilePath}. Make sure the file exists. Using dummy data!`
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
          "doc/hardware/arch/arc-support-status.rst",
          {
            maintainers: ["ruuddw"],
            collaborators: ["abrodkin", "evgeniy-paltsev", "SiyuanCheng-CN"]
          }
        ]
      ]);

      this.root = "/home/filipzajdel/zephyrproject/zephyr";
    }
  }

  getMaintainers(filepathAbs: string): FileOwners | undefined {
    if (!filepathAbs.startsWith(this.root)) {
      return undefined;
    }

    while (filepathAbs !== this.root) {
      let relative = path.relative(this.root, filepathAbs) + "/";

      const owners = this.owners.get(relative);
      if (owners) return owners;

      filepathAbs = path.parse(filepathAbs).dir;
    }

    return undefined;
  }

  hasMaintainers(filepathAbs: string): boolean {
    return this.getMaintainers(filepathAbs) !== undefined;
  }
}

export const fileMaintainers = new FileMaintainers("");
