import { Meteor } from 'meteor/meteor';
import { startScheduler } from './jobs/scheduler';
import { initSonoma } from './utils/openrouter';
import './publications/publications.ts';
import { initPumpChat } from './utils/pumpchat-queue';

Meteor.startup(() => {

  initSonoma();
  initPumpChat();

  //startScheduler();
});