export type ChangeEventPayload = {
  value: string;
};

export type SharedInfo = {
  files: Array<{ path?: string }> | null;
  text: string | null;
};
