/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 */

export interface FileParticipants {
  maintainers: Array<string>;
  collaborators: Array<string>;
}

export interface BlameemConfiguration {
  participantsSource: string;
}
