import { Meteor } from 'meteor/meteor';
import type { ChatCompletionMessageParam } from 'openai/resources/chat';
import { Rooms, Messages, Room } from '../../imports/api/collections/collections';
import { getChatCompletion } from '../utils/openrouter';
import { extractMessages } from '../utils/pumpchat-queue';


const config = Meteor.settings.private?.conversation;
const narrator = config?.agents.narrator;
const observer = config?.agents.observer;
const triggerCount = config?.triggerCount;


async function createNewRoom(echo: string | null = null) {
  if (!narrator || !observer) {
    throw new Meteor.Error('configuration-error', 'Agent configurations are missing from settings.json.');
  }

  const roomId = await Rooms.insertAsync({
    status: 'active',
    echo: echo || 'A start of the profound dabate.',
    previousRoomId: undefined,
    observerMessageCount: 0,
    createdAt: new Date(),
  });

  let narratorPrompt: ChatCompletionMessageParam[] = [
    { role: 'system', content: narrator.persona },
    {
      role: 'user',
      content: echo ?
        `The last conversation concluded with a high-level summary: "${echo}". Based on this, bring up a new topic to discuss on.` :
        narrator.kickstartMessage,
    },
  ];

  const narratorResponse = await getChatCompletion(narratorPrompt);
  const narratorMessageContent = narratorResponse.choices[0]?.message.content;

  if (narratorMessageContent) {
    
    await Messages.insertAsync({
      roomId,
      senderId: 'narrator',
      content: narratorMessageContent,
      pumpMessages: [],
      timestamp: new Date(),
    });

    let observerPrompt: ChatCompletionMessageParam[] = [
      { role: 'system', content: observer.persona },
      { role: 'user', content: narratorMessageContent },
    ];

    const observerResponse = await getChatCompletion(observerPrompt);
    console.log("Observer: " + observerResponse.choices[0]?.message.content);
    const observerMessageContent = observerResponse.choices[0]?.message.content;

    if (observerMessageContent) {
      await Messages.insertAsync({
        roomId,
        senderId: 'observer',
        pumpMessages: [],
        content: observerMessageContent,
        timestamp: new Date(),
      });
      await Rooms.updateAsync(roomId, { $inc: { observerMessageCount: 1 } });
    }
  }
}


async function continueConversation(room: Room) {
  if (!narrator || !observer) {
    throw new Meteor.Error('configuration-error', 'Agent configurations are missing from settings.json.');
  }

  const pumpMessages = extractMessages();
  let questions = "Here are the questions and messages from the pump chat:\n";
  for (const msg of pumpMessages) {
    questions = questions + `${msg.sender}: ${msg.text}\n`;
  }

  const history = await Messages.find({ roomId: room._id }, { sort: { timestamp: 1 } }).fetchAsync();
  const lastMessage = history[history.length - 1];
  
  if (lastMessage?.senderId === 'observer') { // narrators response
    const narratorPrompt: ChatCompletionMessageParam[] = [
      { role: 'system', content: narrator.persona },
      ...history.map(msg => ({ role: (msg.senderId === 'narrator' ? 'assistant' : 'user') as 'assistant' | 'user', content: msg.content })),
    ];
    if (pumpMessages.length > 0) {
        narratorPrompt.push({
            role: 'user',
            name: 'pumpfun',
            content: questions
        });
    }
    
    const narratorResponse = await getChatCompletion(narratorPrompt);
    console.log("Narrator: " + narratorResponse.choices[0]?.message.content);
    const narratorMessageContent = narratorResponse.choices[0]?.message.content;

    if (narratorMessageContent) {
      await Messages.insertAsync({
        roomId: room._id,
        pumpMessages,
        senderId: 'narrator',
        content: narratorMessageContent,
        timestamp: new Date(),
      });
    }

  } else { //observers response
    const isAnomalyTurn = room.observerMessageCount >= triggerCount;
    
    let observerPrompt: ChatCompletionMessageParam[] = [
      { role: 'system', content: observer.persona },
      ...history.map(msg => ({ role: (msg.senderId === 'observer' ? 'assistant' : 'user') as 'assistant' | 'user', content: msg.content })),
    ];
    if (pumpMessages.length > 0) {
        observerPrompt.push({
            role: 'user',
            name: 'pumpfun',
            content: questions
        });
    }

    if (isAnomalyTurn) {
      observerPrompt.push({
        role: 'user',
        content: 'This is your final response for this topic. Come up with a text, that concludes this conversation.',
      });
    }
    
    const observerResponse = await getChatCompletion(observerPrompt);
    console.log("Observer: " + observerResponse.choices[0]?.message.content);
    const observerMessageContent = observerResponse.choices[0]?.message.content;

    if (observerMessageContent) {
      Messages.insertAsync({
        roomId: room._id,
        pumpMessages,
        senderId: 'observer',
        content: observerMessageContent,
        timestamp: new Date(),
      });

      await Rooms.updateAsync(room._id, { $inc: { observerMessageCount: 1 } });

      if (isAnomalyTurn) {
        await concludeAndTransitionRoom(room._id);

      }
    }
  }
}

async function concludeAndTransitionRoom(roomId: string) {
  const room = await Rooms.findOneAsync(roomId);
  if (!room) return;

  const history = await Messages.find({ roomId }, { sort: { timestamp: 1 } }).fetchAsync();
  const summaryPrompt: ChatCompletionMessageParam[] = [
    { role: 'system', content: 'You are a summarization bot. Based on the following conversation, provide a single, high-level summary description of the conversation, and most importantly, main points and conclusions. Be concise.' },
    ...history.map(msg => ({ role: (msg.senderId === 'narrator' ? 'assistant' : 'user') as 'assistant' | 'user', content: msg.content })),
  ];
  
  const summaryResponse = await getChatCompletion(summaryPrompt);
  console.log("ECHO: " + summaryResponse.choices[0]?.message.content);
  const echoSummary = summaryResponse.choices[0]?.message.content;

  await Rooms.updateAsync(roomId, {
    $set: {
      status: 'archived',
      echo: echoSummary || room.echo
    }
  });

  await createNewRoom(echoSummary);
  console.log(`Room ${roomId} archived. A new room has been created.`);

}

export async function startScheduler() {
  if (!config?.scheduleInterval) {
    console.error('`scheduleInterval` not set in settings.json. Defaulting to 1 minute.');
  }
  await schedulerTurn();
  Meteor.setInterval(async () => {
    await schedulerTurn();
  }, config?.scheduleInterval || 60000);
}


async function schedulerTurn() {
    const activeRoom = await Rooms.findOneAsync({ status: 'active' });

    if (!activeRoom) {
      console.log('No active room found. Creating a new one...');
      await createNewRoom();
    } else {
      console.log(`Processing active room: ${activeRoom._id}`);
      await continueConversation(activeRoom);
    }   
}