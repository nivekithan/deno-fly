#!/usr/bin/env -S deno run

import { readline } from "https://deno.land/x/readline@v1.1.0/mod.ts";
import { AllInputMessagesSchema } from "./message.ts";
import { match } from "npm:ts-pattern";
import {
  handleEchoMessage,
  handleGenerateMessage,
  handleInitMessage,
  handleTopologyMessage,
} from "./handler/index.ts";
import { handleBroadcast, handleRead } from "./handler/broadcast.ts";

const stdlin = Deno.stdin;

export type NodeData = {
  nodeId?: string;
  allNodes: Array<string>;
  sequence: number;
  topology: Array<string>;
  msgId: number;
  uniqueMsgId(): number;
};

const nodeData: NodeData = {
  sequence: 0,
  allNodes: [],
  topology: [],
  msgId: 0,
  uniqueMsgId() {
    return this.msgId++;
  },
};

for await (const encodedLine of readline(stdlin)) {
  const line = new TextDecoder().decode(encodedLine);
  console.error(line);
  const message = AllInputMessagesSchema.parse(JSON.parse(line));

  match(message)
    .with({ body: { type: "init" } }, (message) => {
      const { nodeId, allNodes } = handleInitMessage(message);
      nodeData.nodeId = nodeId;
      nodeData.allNodes = allNodes;
    })
    .with({ body: { type: "echo" } }, handleEchoMessage)
    .with({ body: { type: "generate" } }, (message) => {
      handleGenerateMessage(message, nodeData);
    })
    .with({ body: { type: "topology" } }, (message) => {
      handleTopologyMessage(message, nodeData);
    })
    .with({ body: { type: "broadcast" } }, (message) => {
      handleBroadcast(message, nodeData);
    })
    .with({ body: { type: "read" } }, handleRead)
    .exhaustive();
}
