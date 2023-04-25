import invariant from "npm:tiny-invariant";
import { NodeData } from "../index.ts";
import { BroadcastMessage, ReadMessage, respond } from "../message.ts";

const nodeMessage = new Set<number>();
const messageRecords = new Map<number, Set<string>>();

export function handleBroadcast(
  broadcastMessage: Readonly<BroadcastMessage>,
  nodeData: NodeData
) {
  const message = broadcastMessage.body.message;
  const isMessageAlreadyPresent = nodeMessage.has(message);

  const isSrcAnotherNode = nodeData.allNodes.includes(broadcastMessage.src);

  if (!isMessageAlreadyPresent) {
    nodeMessage.add(message);

    if (isSrcAnotherNode) {
      sendMessageToNodes(message, nodeData, [broadcastMessage.src]);
    } else {
      propagate({ nodeData, message });
    }
  }

  addNodesToMessageRecord(broadcastMessage);

  if (isSrcAnotherNode) {
    return;
  }

  respond(broadcastMessage, {
    type: "broadcast_ok",
    in_reply_to: broadcastMessage.body.msg_id,
  });
}

function sendMessageToNodes(
  messageValue: number,
  nodeData: NodeData,
  nodes: Array<string>
) {
  const srcNodeId = nodeData.nodeId;
  invariant(srcNodeId, "NodeId is not yet set");

  nodes.forEach((destNodeId) => {
    const isDestAnotherNode = nodeData.allNodes.find(
      (value) => value === destNodeId
    );

    if (!isDestAnotherNode) {
      return;
    }

    const broadcastMesasge: BroadcastMessage = {
      src: srcNodeId,
      dest: destNodeId,
      body: {
        message: messageValue,
        type: "broadcast",
        msg_id: nodeData.uniqueMsgId(),
      },
    };

    console.log(JSON.stringify(broadcastMesasge));
  });
}

type PropagateArgs = {
  nodeData: Readonly<NodeData>;
  message: number;
};

function propagate({ nodeData, message }: PropagateArgs) {
  const nodesToSend = nodeData.allNodes.filter((nodeId) => {
    const messageRecord = getRecord(message);
    return !messageRecord.has(nodeId);
  });

  if (nodesToSend.length === 0) {
    return;
  }

  sendMessageToNodes(message, nodeData, nodesToSend);

  setTimeout(() => propagate({ nodeData, message }), 250);
}

function getRecord(message: number) {
  if (messageRecords.has(message)) {
    const messageRecord = messageRecords.get(message);

    invariant(messageRecord, "Unreachable: Expected Set to be present");

    return messageRecord;
  }

  messageRecords.set(message, new Set());

  const messageRecord = messageRecords.get(message);

  invariant(
    messageRecord,
    "Unreachable: Expected default set (Empty Set) to present"
  );

  return messageRecord;
}

function addNodesToMessageRecord(message: BroadcastMessage) {
  const srcNodeId = message.src;
  const destNodeId = message.dest;
  const messageValue = message.body.message;

  const messageRecord = getRecord(messageValue);

  messageRecord.add(srcNodeId);
  messageRecord.add(destNodeId);
}

export function handleRead(readMessage: Readonly<ReadMessage>) {
  const message = Array.from(nodeMessage);

  respond(readMessage, {
    type: "read_ok",
    in_reply_to: readMessage.body.msg_id,
    messages: message,
  });
}
