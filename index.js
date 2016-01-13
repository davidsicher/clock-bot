/*-------------------------------------------------------------------
//
//                      Proto-bot Boilerplate
//                        -- DO NOT EDIT --
//
//-----------------------------------------------------------------*/

if (!process.env.token) {
    console.log('Error: Specify token in environment');
    process.exit(1);
}

var Botkit = require('botkit');
var os = require('os');

var botListener = Botkit.slackbot({
    debug: true,
});

var bot = botListener.spawn({
    token: process.env.token
}).startRTM();

botListener.setupWebserver(process.env.PORT,function(err,express_webserver) {
  botListener.createWebhookEndpoints(express_webserver);
});

var taggedMessage = 'direct_message,direct_mention,mention';
var untaggedMessage = 'direct_message,direct_mention,mention,ambient';

/*-------------------------------------------------------------------
//
//                     Local Storage Defaults
//             -- PUT ANY LOCAL STORAGE OPTIONS HERE --
//
//-----------------------------------------------------------------*/

var defaultUser = function(id) {
return {
    id: id,
    timerIsActive: false,
    timerStartTime: 0,
    timerStopTime: 0
};

/*-------------------------------------------------------------------------------------------------------------
//
//                                                        Bot Logic
//                                      -- PUT YOUR BOT'S CONVERSATION HOOKS HERE --
//
//                                                      Instructions:
//
//  1: Write your bot action and give it a name.
//
//     TIP: The action name must be a single word without spaces or punctuation
//     TIP: Use a descriptive, active name like 'sayBotName'
//
//  || function sayBotName(bot, incomingMessage) {
//  ||   bot.reply(incomingMessage, 'my name is protobot');
//  || }
//
//  2: Tell your bot what to listen for.
//
//                                     (what to listen for)                (tagged or untagged) (your action name)
//                                             |                                    |                  |
//                                             v                                    v                  v
//  || botListener.hears(['trigger words', 'in quotes', 'separated by commas'], untaggedMessage, behaviorName);
//
//
//
//-----------------------------------------------------------------------------------------------------------*/


function reportForDuty(bot, incomingMessage) {
  bot.reply(incomingMessage, '*tick* *tock* *tick* *tock*');
}
botListener.hears(['roll call','role call'], untaggedMessage, reportForDuty);

function sayCurrentTime(bot, incomingMessage) {
  bot.reply(incomingMessage, 'ding it is ' + (((new Date().getUTCHours()-9)%12)+1) + ' oclock');
}
botListener.hears(['what time is it'], untaggedMessage, sayCurrentTime);

var happyHours = ['Anchorage', 'Los Angeles', 'Phoenix', 'Winnipeg', 'Havana', 'Halifax', 'Buenos Aires', 'Sao Paulo', 'Rio de Janeiro', 'Reykjavik', 'Algiers', 'Cairo', 'Minsk', 'Dubai', 'Islamabad', 'Dhaka', 'Bangkok', 'Beijing', 'Tokyo', 'Brisbane', 'Melbourne', 'Anadyr', 'Auckland', 'Kiritimati']
function sayCurrentHappyHour(bot, incomingMessage) {
  bot.reply(incomingMessage, 'its always happy hour somewhere! right now its happy hour in: ' + happyHours[(new Date().getUTCHours()-8)%24]);
}
botListener.hears(['drink', 'thirsty', 'happy'], untaggedMessage, sayCurrentHappyHour);

function startTimer(bot, incomingMessage) {
    botListener.storage.users.get(incomingMessage.user,function(err, user) {
        if (!user) {
            user = defaultUser(incomingMessage.user);
        }
        if (user.timerIsActive===false) {
          user.timerIsActive = true;
          user.timerStartTime = new Date();
          botListener.storage.users.save(user,function(err, id) {
            bot.reply(incomingMessage,'Timer started.');
          });
        } else {
          bot.reply(incomingMessage, 'You already have a timer running.');
        }
    });
}
botListener.hears(['start timer'],taggedMessage, startTimer);

function sayCurrentTimerTime(bot, incomingMessage) {
    botListener.storage.users.get(incomingMessage.user,function(err, user) {
        if (!user) {
            user = defaultUser(incomingMessage.user);
        }
        if (user.timerIsActive===true) {
          bot.reply(incomingMessage,'Current timer has been running for ' + (new Date() - user.timerStartTime).toString() + 'ms');
        } else {
          bot.reply(incomingMessage, 'You do not have a timer running.');
        }
    });
}
botListener.hears(['current timer'], taggedMessage, sayCurrentTimerTime);

function stopCurrentTimer(bot, incomingMessage) {
    botListener.storage.users.get(incomingMessage.user,function(err, user) {
        if (!user) {
            user = defaultUser(incomingMessage.user);
        }
        if (user.timerIsActive===true) {
          user.timerIsActive = false;
          user.timerStopTime = new Date();
          botListener.storage.users.save(user,function(err, id) {
            bot.reply(incomingMessage,'Timer was stopped after ' + (user.timerStopTime - user.timerStartTime).toString() + 'ms');
          });
        } else {
          bot.reply(incomingMessage, 'You do not have a timer running.');
        }
    });
}
botListener.hears(['stop timer'], taggedMessage, stopCurrentTimer);

var sayPreviousTimerTime = function(bot, incomingMessage) {
    botListener.storage.users.get(incomingMessage.user,function(err, user) {
        if (!user) {
            user = defaultUser(incomingMessage.user);
        }
        if (user.timerIsActive===false && user.timerStartTime && user.timerStopTime) {
          bot.reply(incomingMessage,'Your last timer ran for ' + (user.timerStopTime - user.timerStartTime).toString() + 'ms');
        } else if(!user.timerStartTime) {
          bot.reply(incomingMessage, 'You have never run a timer.');
        } else {
          bot.reply(incomingMessage, 'You have a timer running currently.');
        }
    });
}
botListener.hears(['previous timer'], taggedMessage, sayPreviousTimerTime);


var testConvo = function(bot, incomingMessage) {
  bot.startConversation(incomingMessage, function(err,convo) {
    convo.say('Hello!');
    convo.say('Have a nice day!');
  })
}
botListener.hears(['test convo'], untaggedMessage, testConvo);


botListener.hears(['hello','hi'],'direct_message,direct_mention,mention',function(bot, incomingMessage) {
    botListener.storage.users.get(incomingMessage.user,function(err, user) {
        if (user && user.name) {
            bot.reply(incomingMessage,'**cough** ' + user.name + '!!');
        } else {
            bot.reply(incomingMessage,'**cough**');
        }
    });
});

botListener.hears(['shutdown'],'direct_message,direct_mention,mention',function(bot, incomingMessage) {

    bot.startConversation(incomingMessage,function(err, convo) {
        convo.ask('Are you sure you want me to shutdown?',[
            {
                pattern: bot.utterances.yes,
                callback: function(response, convo) {
                    convo.say('Bye!');
                    convo.next();
                    setTimeout(function() {
                        process.exit();
                    },3000);
                }
            },
        {
            pattern: bot.utterances.no,
            default: true,
            callback: function(response, convo) {
                convo.say('*Phew!*');
                convo.next();
            }
        }
        ]);
    });
});