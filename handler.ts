import { NodeData } from "./index.ts";
import {
  EchoMessage,
  GenerateMessage,
  InitMessage,
  respond,
} from "./message.ts";

export function handleInitMessage(initMessageBody: InitMessage) {
  const nodeId = initMessageBody.body.node_id;

  respond(initMessageBody, {
    type: "init_ok",
    in_reply_to: initMessageBody.body.msg_id,
  });

  return nodeId;
}

export function handleEchoMessage(echoMessageBody: EchoMessage) {
  respond(echoMessageBody, {
    type: "echo_ok",
    echo: echoMessageBody.body.echo,
    in_reply_to: echoMessageBody.body.msg_id,
  });
}

export function handleGenerateMessage(
  generateMessageBody: GenerateMessage,
  nodeData: NodeData
) {
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

function generateTimeStamp() {
  const newYear2023InUTC = "2023-01-01T00:00:00.000Z";
  const timeAt2023 = new Date(newYear2023InUTC);

  return new Date().getTime() - timeAt2023.getTime();
}
