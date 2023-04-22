import { NodeData } from "../index.ts";
import invariant from "npm:tiny-invariant";
import {
  EchoMessage,
  GenerateMessage,
  InitMessage,
  TopologyMessage,
  respond,
} from "../message.ts";

export function handleInitMessage(initMessageBody: Readonly<InitMessage>) {
  const nodeId = initMessageBody.body.node_id;

  respond(initMessageBody, {
    type: "init_ok",
    in_reply_to: initMessageBody.body.msg_id,
  });

  return { nodeId, allNodes: initMessageBody.body.node_ids };
}

export function handleEchoMessage(echoMessageBody: Readonly<EchoMessage>) {
  respond(echoMessageBody, {
    type: "echo_ok",
    echo: echoMessageBody.body.echo,
    in_reply_to: echoMessageBody.body.msg_id,
  });
}

export function handleGenerateMessage(
  generateMessageBody: Readonly<GenerateMessage>,
  nodeData: NodeData
) {
  function generateTimeStamp() {
    const newYear2023InUTC = "2023-01-01T00:00:00.000Z";
    const timeAt2023 = new Date(newYear2023InUTC);

    return new Date().getTime() - timeAt2023.getTime();
  }

  const nodeId = nodeData.nodeId;
  const currentSequence = nodeData.sequence;

  nodeData.sequence++;

  const id = `${nodeId}${generateTimeStamp()}${currentSequence}`;

  respond(generateMessageBody, {
    id,
    in_reply_to: generateMessageBody.body.msg_id,
    type: "generate_ok",
  });
}

export function handleTopologyMessage(
  topologyMessageBody: Readonly<TopologyMessage>,
  nodeData: NodeData
) {
  const nodeId = nodeData.nodeId;
  invariant(nodeId, "Expected nodeId to be set while processing init message");

  const thisNodeTopology = topologyMessageBody.body.topology[nodeId];

  respond(topologyMessageBody, {
    type: "topology_ok",
    in_reply_to: topologyMessageBody.body.msg_id,
  });

  nodeData.topology = thisNodeTopology;

  return thisNodeTopology;
}
