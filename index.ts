#!/usr/bin/env -S deno run

import { readline } from "https://deno.land/x/readline@v1.1.0/mod.ts";
import { AllInputMessagesSchema } from "./message.ts";
import { match } from "npm:ts-pattern";
import {
  handleEchoMessage,
  handleGenerateMessage,
  handleInitMessage,
} from "./handler.ts";

const stdlin = Deno.stdin;

export type NodeData = {
  nodeId?: string;
  sequence: number;
};

const nodeData: NodeData = { sequence: 0 };

for await (const encodedLine of readline(stdlin)) {
  const line = new TextDecoder().decode(encodedLine);
  const message = AllInputMessagesSchema.parse(JSON.parse(line));

  match(message)
    .with({ body: { type: "init" } }, (message) => {
      const nodeId = handleInitMessage(message);
      nodeData.nodeId = nodeId;
    })
    .with({ body: { type: "echo" } }, handleEchoMessage)
    .with({ body: { type: "generate" } }, (message) => {
      handleGenerateMessage(message, nodeData);
    })
    .exhaustive();
}
