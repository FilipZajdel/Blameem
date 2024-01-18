
import * as vscode from "vscode";
import OwnersIf from "./models";

export class View {
    statusBarItem: vscode.StatusBarItem | undefined = undefined;
    tooltipMd: string = "";

    constructor() {}

    async update(owners: OwnersIf) {
        if (!this.statusBarItem) return;

        if (owners.maintainers.length > 0 || owners.collaborators.length > 0) {
            this.statusBarItem.tooltip = owners.maintainers.toString() + owners.collaborators.toString();
            this.statusBarItem.show();
        } else {
            this.statusBarItem.hide();
        }
    }

    async activate(size: number = 100) {
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, size);
        this.statusBarItem.text = "$(mark-github)";
        this.statusBarItem.tooltip = "Maintained";
    }
}

export let view = new View();
