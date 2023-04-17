import invariant from "npm:tiny-invariant";
import { NodeData } from "../index.ts";
import { BroadcastMessage, ReadMessage, respond } from "../message.ts";

export function handleBroadcast(
  broadcastMessage: Readonly<BroadcastMessage>,
  nodeData: NodeData
) {
  const message = broadcastMessage.body.message;
  const isMessageAlreadyPresent = nodeData.broadcastMessages.has(message);

  if (!isMessageAlreadyPresent) {
    nodeData.broadcastMessages.add(message);
    propagate({ nodeData, message });
  }

  const msgId = broadcastMessage.body.msg_id;

  if (!msgId) {
    return;
  }

  respond(broadcastMessage, {
    type: "broadcast_ok",
    in_reply_to: msgId,
  });
}

type PropagateArgs = {
  nodeData: Readonly<NodeData>;
  message: number;
};

function propagate({ nodeData, message }: PropagateArgs) {
  const currentNodeId = nodeData.nodeId;
  invariant(currentNodeId);

  nodeData.topology.forEach((destNodeId) => {
    const broadcastMesssage: BroadcastMessage = {
      src: currentNodeId,
      body: {
        type: "broadcast",
        message: message,
      },
      dest: destNodeId,
    };

    console.log(JSON.stringify(broadcastMesssage));
  });
}

export function handleRead(
  readMessage: Readonly<ReadMessage>,
  nodeData: Readonly<NodeData>
) {
  const message = Array.from(nodeData.broadcastMessages);

  respond(readMessage, {
    type: "read_ok",
    in_reply_to: readMessage.body.msg_id,
    messages: message,
  });
}
