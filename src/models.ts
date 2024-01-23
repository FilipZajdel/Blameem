/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 */

import { WorkspaceConfiguration } from "vscode";

export interface FileParticipants {
  maintainers: Array<string>;
  collaborators: Array<string>;
}

export interface FileMaintainers extends FileParticipants {
  files: Array<string>;
  status?: string;
  labels?: Array<string>;
}

export interface BlameemConfiguration extends WorkspaceConfiguration {
  participantsSource: string;
}
