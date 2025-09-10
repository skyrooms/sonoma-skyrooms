import { Meteor } from 'meteor/meteor';
import {IMessage, PumpChatClient} from './pumpchat'
import { PumpMessage } from '/imports/api/collections/collections';

let client: PumpChatClient
let messages: IMessage[] = [];

export function extractMessages(): PumpMessage[] {
    const extracted: PumpMessage[] = [];
    for (const message of messages) {
        extracted.push({
            sender: message.username,
            text: message.message
        });
    }
    messages = [];
    return extracted;
}

export function initPumpChat() {
    const roomId = Meteor.settings.private?.pumpfunRoomId;
    if (!roomId) {
        throw new Error('Room ID not selected. Please check your settings.json file.');
    }
    client = new PumpChatClient({
        roomId: roomId
    });
    client.on('message', (message: IMessage) => {
        const messages = getMessages();
        messages.push(message);
        console.log(`[NEW PUMP.FUN MESSAGE] ${message.username}: ${message.message}`);
    });
    client.on('connected', () => {
        console.log('PUMPCHAT: connected');
    });
    client.on('disconnected', () => {
        console.log('PUMPCHAT: disconnected');
    });
    client.on('tryReconnect', () => {
        console.log('PUMPCHAT: trying to reconnect...');
    });
    client.on('tryRecomaxReconnectAttemptsReachednnect', () => {
        console.log("PUMPCHAT: CRITICAL FAILURE, can't reconnect");
    });
    client.connect();
}

function getMessages() {
    return messages;
}