import { BgentRuntime, Content, Message, SqlJsDatabaseAdapter, State, composeContext, embeddingZeroVector, messageHandlerTemplate, parseJSONObjectFromText, zeroUuid, zeroUuidPlus1 } from 'bgent';
// import * as crypto from 'crypto';
import express from 'express';
import initSqlJs from 'sql.js/dist/sql-asm.js';
import form from './form'

const key = "f35f293df258e07d7b75c7e9b613a314:d19b2510af1298856d3058dd68f7866be9e913500f9b7ea3e65072f0d2a85f0dc15077eea898a60ae26f2ba5e7dc368fdec5d2e53757d5a9b6abda9cd7217cfd";
// Decryption function
// function decrypt(text: string, secretKey: crypto.BinaryLike) {
//   const textParts = text.split(':');
//   if (!textParts) {
//     throw new Error('Invalid text');
//   }
//   // @ts-expect-error - idk prolly bad
//   const iv = Buffer.from(textParts.shift(), 'hex');
//   const encryptedText = textParts.join(':');
//   const key = crypto.scryptSync(secretKey, 'salt', 32);
//   const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
//   let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
//   decrypted += decipher.final('utf8');
//   return decrypted;
// }
/**
 * Handle an incoming message, processing it and returning a response.
 * @param message The message to handle.
 * @param state The state of the agent.
 * @returns The response to the message.
 */

async function handleMessage(
  runtime: BgentRuntime,
  message: Message,
  state?: State
) {
  const _saveRequestMessage = async (message: Message, state: State) => {
    const { content, userId, room_id } = message;
    if (content) {
      await runtime.messageManager.createMemory({
        user_id: userId!,
        content,
        room_id,
        embedding: embeddingZeroVector,
      });
      await runtime.evaluate(message, state);
    }
  };

  await _saveRequestMessage(message, state as State);
  if (!state) {
    state = (await runtime.composeState(message)) as State;
  }

  const context = composeContext({
    state,
    template: messageHandlerTemplate,
  });

  let responseContent: Content | null = null;
  const { userId, room_id } = message;

  for (let triesLeft = 3; triesLeft > 0; triesLeft--) {
    const response = await runtime.completion({
      context,
      stop: [],
    });

    runtime.databaseAdapter.log({
      body: { message, context, response },
      user_id: userId,
      room_id,
      type: "simple_agent_main_completion",
    });

    const parsedResponse = parseJSONObjectFromText(
      response
    ) as unknown as Content;

    if ((parsedResponse.user as string)?.includes(
      (state as State).agentName as string
    )) {
      responseContent = {
        content: parsedResponse.content,
        action: parsedResponse.action,
      };
      break;
    }
  }

  if (!responseContent) {
    responseContent = {
      content: "",
      action: "IGNORE",
    };
  }

  const _saveResponseMessage = async (
    message: Message,
    state: State,
    responseContent: Content
  ) => {
    const { room_id } = message;

    responseContent.content = responseContent.content?.trim();

    if (responseContent.content) {
      await runtime.messageManager.createMemory({
        user_id: runtime.agentId,
        content: responseContent,
        room_id,
        embedding: embeddingZeroVector,
      });
      await runtime.evaluate(message, { ...state, responseContent });
    } else {
      console.warn("Empty response, skipping");
    }
  };

  await _saveResponseMessage(message, state, responseContent);
  await runtime.processActions(message, responseContent);

  return responseContent;
}
export const setupServer = async (port: number | undefined = undefined) => {
  const app = express();
  const SQL = await initSqlJs({});
  const db = new SQL.Database();
  const adapter = new SqlJsDatabaseAdapter(db as any);
  const runtime = new BgentRuntime({
    serverUrl: "https://api.openai.com/v1",
    databaseAdapter: adapter,
    token: key // decrypt(key, 'secret'),
  });

  // if account doesn't exist with zeroUuidPlus1, create it
  let accountExists = false;
  let zeroUuidPlus1Account = null;
  try {
    zeroUuidPlus1Account = await runtime.databaseAdapter.getAccountById(zeroUuidPlus1);
    if (zeroUuidPlus1Account) {
      accountExists = true;
    }
  } catch (error) {
    console.log("Accounts table not created yet")
  }
  
  if (!zeroUuidPlus1Account) {
    await runtime.databaseAdapter.createAccount({
      id: zeroUuidPlus1,
      name: "Zero",
      email: "testaccount2@test.com"
    });
  }

  app.get('/', async (req, res) => {
    res.send(form);
  });

  app.get('/message', async (req, res) => {
    try {

      // Get the message from the request
      const { message } = req.query;
      if (!message) {
        throw new Error('No message provided');
      }

      // Create a message object
      const messageObject = {
        content: { content: message as string, action: "WAIT" },
        userId: zeroUuidPlus1,
        room_id: zeroUuid,
      };

      // Handle the message
      const response = await handleMessage(runtime, messageObject);
      console.log(response);

      // Send the response
      res.send(JSON.stringify(response.content));
    } catch (error) {
      console.error(error);
    }
  });
  if(port) return app.listen(port);
  return app.listen();
};
