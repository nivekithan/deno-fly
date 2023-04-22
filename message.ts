import z from "https://deno.land/x/zod@v3.21.4/index.ts";
import {
  ZodObject,
  ZodRawShape,
} from "https://deno.land/x/zod@v3.21.4/types.ts";

const InitMessageBody = z.object({
  type: z.literal("init"),
  msg_id: z.number(),
  node_id: z.string(),
  node_ids: z.array(z.string()),
});

const EchoMessageBody = z.object({
  type: z.literal("echo"),
  msg_id: z.number(),
  echo: z.string(),
});

const GenerateMessageBody = z.object({
  type: z.literal("generate"),
  msg_id: z.number(),
});

const TopologyMessageBody = z.object({
  type: z.literal("topology"),
  topology: z.record(z.string(), z.array(z.string())),
  msg_id: z.number(),
});

const BroadcastMessageBody = z.object({
  type: z.literal("broadcast"),
  message: z.number(),
  msg_id: z.number(),
});

const ReadMessageBody = z.object({
  type: z.literal("read"),
  msg_id: z.number(),
});

function getMessageSchema<RawShape extends ZodRawShape>(
  zodObject: ZodObject<RawShape>
) {
  return z.object({ src: z.string(), dest: z.string(), body: zodObject });
}

export const InitMessageSchema = getMessageSchema(InitMessageBody);
export type InitMessage = z.infer<typeof InitMessageSchema>;

export const EchoMessageSchema = getMessageSchema(EchoMessageBody);
export type EchoMessage = z.infer<typeof EchoMessageSchema>;

export const GenerateMessageSchema = getMessageSchema(GenerateMessageBody);
export type GenerateMessage = z.infer<typeof GenerateMessageSchema>;

export const TopologyMessageSchema = getMessageSchema(TopologyMessageBody);
export type TopologyMessage = z.infer<typeof TopologyMessageSchema>;

export const BroadcastMessageSchema = getMessageSchema(BroadcastMessageBody);
export type BroadcastMessage = z.infer<typeof BroadcastMessageSchema>;

export const ReadMessageSchema = getMessageSchema(ReadMessageBody);
export type ReadMessage = z.infer<typeof ReadMessageSchema>;

export const AllInputMessagesSchema = z.object({
  src: z.string(),
  dest: z.string(),
  body: z.union([
    InitMessageBody,
    EchoMessageBody,
    GenerateMessageBody,
    TopologyMessageBody,
    BroadcastMessageBody,
    ReadMessageBody,
  ]),
});
export type AllInputMessage = z.infer<typeof AllInputMessagesSchema>;

// ------------------------------------Response Starts-----------------------------
const InitOkResponseBody = z.object({
  type: z.literal("init_ok"),
  in_reply_to: z.number(),
});

const EchoOkResponseBody = z.object({
  type: z.literal("echo_ok"),
  in_reply_to: z.number(),
  echo: z.string(),
});

const GenerateOkResponseBody = z.object({
  type: z.literal("generate_ok"),
  in_reply_to: z.number(),
  id: z.string(),
});

const TopologyOkResponseBody = z.object({
  type: z.literal("topology_ok"),
  in_reply_to: z.number(),
});

const BroadcastOkResponseBody = z.object({
  type: z.literal("broadcast_ok"),
  in_reply_to: z.number(),
});

const ReadOkResponseBody = z.object({
  type: z.literal("read_ok"),
  in_reply_to: z.number(),
  messages: z.array(z.number()),
});

export const InitOkMessageSchema = getMessageSchema(InitOkResponseBody);
export type InitOkMessage = z.infer<typeof InitOkMessageSchema>;

export const EchoOkMessageSchema = getMessageSchema(EchoOkResponseBody);
export type EchoOkMessage = z.infer<typeof EchoOkMessageSchema>;

export const GenerateOkMessageSchema = getMessageSchema(GenerateOkResponseBody);
export type GenerateOkMessage = z.infer<typeof GenerateOkMessageSchema>;

export const TopologyOkMessageSchema = getMessageSchema(TopologyOkResponseBody);
export type TopologyOkMessage = z.infer<typeof TopologyOkMessageSchema>;

export const BroadcastOkMessageSchema = getMessageSchema(
  BroadcastOkResponseBody
);
export type BroadcastOkMessage = z.infer<typeof BroadcastOkMessageSchema>;

export const ReadOkMessageSchema = getMessageSchema(ReadOkResponseBody);
export type ReadOkMessage = z.infer<typeof ReadOkMessageSchema>;

type GetResponseType<Message extends AllInputMessage> =
  Message["body"]["type"] extends "init"
    ? InitOkMessage
    : Message["body"]["type"] extends "echo"
    ? EchoOkMessage
    : Message["body"]["type"] extends "generate"
    ? GenerateOkMessage
    : Message["body"]["type"] extends "topology"
    ? TopologyOkMessage
    : Message["body"]["type"] extends "broadcast"
    ? BroadcastOkMessage
    : Message["body"]["type"] extends "read"
    ? ReadOkMessage
    : never;

export function respond<Message extends AllInputMessage>(
  message: Readonly<Message>,
  responseBody: Readonly<GetResponseType<Message>["body"]>
) {
  const response = {
    src: message.dest,
    dest: message.src,
    body: responseBody,
  };

  console.log(JSON.stringify(response));

  return response;
}
