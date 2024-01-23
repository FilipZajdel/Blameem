/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 */

import * as vscode from "vscode";
import { FileParticipants } from "./models";

class GithubParticipant {
  private _repr: string;
  private _avatarDimensions = { width: 25, height: 25 };

  constructor(nickname: string) {
    this._repr =
    `<a href=https://github.com/${nickname}>
      <img src=https://github.com/${nickname}.png
          width=${this._avatarDimensions.width}
          height=${this._avatarDimensions.height}>
      ${nickname}
    </a>`;
  }

  toString(): string {
    return this._repr;
  }

  static map(nickname: string): string {
    return new GithubParticipant(nickname).toString();
  }
}

class OwnersTooltip {
  private _statusBarItem: vscode.StatusBarItem;

  constructor(_statusBarItem: vscode.StatusBarItem) {
    this._statusBarItem = _statusBarItem;
    this._statusBarItem.tooltip = new vscode.MarkdownString();
    this._statusBarItem.tooltip.supportHtml = true;
  }

  set participants(participants: FileParticipants) {
    const maintainers = participants.maintainers.map(GithubParticipant.map).join("<br>");
    const collaborators = participants.collaborators.map(GithubParticipant.map).join("<br>");
    const mdTooltip = new vscode.MarkdownString();

    mdTooltip.supportHtml = true;
  
    if (maintainers.length > 0) {
      mdTooltip.appendMarkdown(`### Collaborators\n${maintainers}\n\n`);
    }
    
    if (collaborators.length > 0) {
      mdTooltip.appendMarkdown(`### Maintainers\n${collaborators}\n`);
    }

    this._statusBarItem.tooltip = mdTooltip;
  }

  clear() {
    if (!this._statusBarItem) {
      return;
    }

    this._statusBarItem.tooltip = new vscode.MarkdownString();
  }
}

export class View {
  private _statusBarItem: vscode.StatusBarItem | undefined = undefined;
  private _tooltip: OwnersTooltip;

  constructor(size: number = 100) {
    this._statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      size
    );
    this._statusBarItem.text = "$(mark-github)";
    this._tooltip = new OwnersTooltip(this._statusBarItem);
  }

  update(owners: FileParticipants, label: string = "$(mark-github)") {
    if (!this._statusBarItem) {
      return;
    }

    if (owners.maintainers.length > 0 || owners.collaborators.length > 0) {
      this._tooltip.clear();
      this._tooltip.participants = owners;
      this._statusBarItem.show();
      this._statusBarItem.text = label;
    } else {
      this._statusBarItem.hide();
    }
  }
}

export const view = new View();
