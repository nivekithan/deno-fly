import { NodeData } from "../index.ts";
import { BroadcastMessage, ReadMessage, respond } from "../message.ts";

export function handleBroadcast(
  broadcastMessage: Readonly<BroadcastMessage>,
  nodeData: NodeData
) {
  const message = broadcastMessage.body.message;

  nodeData.broadcastMessages.add(message);

  respond(broadcastMessage, {
    type: "broadcast_ok",
    in_reply_to: broadcastMessage.body.msg_id,
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
