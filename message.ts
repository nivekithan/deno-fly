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

export const AllInputMessagesSchema = z.object({
  src: z.string(),
  dest: z.string(),
  body: z.union([InitMessageBody, EchoMessageBody, GenerateMessageBody]),
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

export const InitOkMessageSchema = getMessageSchema(InitOkResponseBody);
export type InitOkMessage = z.infer<typeof InitOkMessageSchema>;

export const EchoOkMessageSchema = getMessageSchema(EchoOkResponseBody);
export type EchoOkMessage = z.infer<typeof EchoOkMessageSchema>;

export const GenerateOkMessageSchema = getMessageSchema(GenerateOkResponseBody);
export type GenerateOkMessage = z.infer<typeof GenerateOkMessageSchema>;

type GetResponseType<Message extends AllInputMessage> =
  Message["body"]["type"] extends "init"
    ? InitOkMessage
    : Message["body"]["type"] extends "echo"
    ? EchoOkMessage
    : Message["body"]["type"] extends "generate"
    ? GenerateOkMessage
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
