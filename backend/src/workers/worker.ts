import {
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from "@aws-sdk/client-sqs";

import { sqsClient } from "../config/aws";

import { env } from "../config/env";

import { processDocument } from "./document.worker";

import { DocumentUploadedMessage } from "../types/ingestion";

const WAIT_TIME_SECONDS = 30;

const MAX_NUMBER_OF_MESSAGES = 5;

const VISIBILITY_TIMEOUT_SECONDS = 300;

async function pollMessages() {
  console.log(`[Worker] SQS worker started`);

  while (true) {
    try {
      const response = await sqsClient.send(
        new ReceiveMessageCommand({
          QueueUrl: env.SQS_DOCUMENT_QUEUE_URL,

          MaxNumberOfMessages: MAX_NUMBER_OF_MESSAGES,

          WaitTimeSeconds: WAIT_TIME_SECONDS,

          VisibilityTimeout: VISIBILITY_TIMEOUT_SECONDS,
        }),
      );

      const messages = response.Messages ?? [];

      if (messages.length === 0) {
        continue;
      }

      console.log(`[Worker] Recived ${messages.length} message(s)`);

      for (const message of messages) {
        if (!message.Body) {
          continue;
        }

        try {
          const payload = JSON.parse(message.Body) as DocumentUploadedMessage;

          console.log(`[Worker] Processing message: ${payload}`);

          await processDocument(payload);

          if (message.ReceiptHandle) {
            await sqsClient.send(
              new DeleteMessageCommand({
                QueueUrl: env.SQS_DOCUMENT_QUEUE_URL,

                ReceiptHandle: message.ReceiptHandle,
              }),
            );
          }

          console.log(`[Worker] Message deleted`);
        } catch (error) {
          console.error(`[Worker] Message processing failed`, error);
        }
      }
    } catch (error) {
      console.error(`[Worker] SQS polling error`, error);

      await sleep(5000);
    }
  }
}

function sleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

pollMessages().catch((error) => {
  console.error(`[Worker] Fatal worker error`, error);

  process.exit(1);
});
