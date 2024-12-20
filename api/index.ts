import {
  middleware,
  MiddlewareConfig,
  WebhookEvent,
  TextMessage,
  MessageAPIResponseBase,
} from "@line/bot-sdk";
import {
  MessagingApiClient,
} from "@line/bot-sdk/dist/messaging-api/api";
import express, { Application, Request, Response } from "express";
import { load } from "ts-dotenv";

const env = load({
  CHANNEL_ACCESS_TOKEN: String,
  CHANNEL_SECRET: String,
  PORT: Number,
});

const PORT = env.PORT || 3000;

const config = {
  channelAccessToken: env.CHANNEL_ACCESS_TOKEN || "",
  channelSecret: env.CHANNEL_SECRET || "",
};
const middlewareConfig: MiddlewareConfig = config;
const client = new MessagingApiClient({
  channelAccessToken: env.CHANNEL_ACCESS_TOKEN || "",
});

const app: Application = express();

app.get("/", async (_: Request, res: Response): Promise<Response> => {
  return res.status(200).send({
    message: "success",
  });
});

const textEventHandler = async (
  event: WebhookEvent
): Promise<MessageAPIResponseBase | undefined> => {
  if (event.type !== "message" || event.message.type !== "text") {
    return;
  }

  const { replyToken } = event;
  const { text } = event.message;

  const resText = text; // オウム返し
  console.log(resText);

  const response: TextMessage = {
    type: "text",
    text: resText,
  };
  await client.replyMessage({
    replyToken: replyToken,
    messages: [response],
  });
};

app.post(
  "/webhook",
  middleware(middlewareConfig),
  async (req: Request, res: Response): Promise<Response> => {
    const events: WebhookEvent[] = req.body.events;
    await Promise.all(events.map(async (event) => {
      try {
        await textEventHandler(event);
      } catch (err) {
        console.error(err);
      }
    }));
    return res.status(200).end();
  }
);

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}/`);
});
