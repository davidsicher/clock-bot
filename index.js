if (!process.env.token) {
    console.log('Error: Specify token in environment');
    process.exit(1);
}

var Botkit = require('botkit');
var os = require('os');

var controller = Botkit.slackbot({
    debug: true,
});

var bot = controller.spawn({
    token: process.env.token
}).startRTM();

var privateMsg = 'direct_message,direct_mention,mention';
var publicMsg = 'direct_message,direct_mention,mention,ambient';

var sayRollCall = function(bot, message) {
  bot.reply(message, '*tick* *tock* *tick* *tock*');
}
controller.hears(['roll call','role call'], publicMsg, sayRollCall);

var sayCurrentTime = function(bot, message) {
  bot.reply(message, 'ding it is ' + (((new Date().getHours()+3)%13)+1) + ' oclock');
}
controller.hears(['what time is it'], publicMsg, sayCurrentTime);

var happyHours = ['Anchorage', 'Los Angeles', 'Phoenix', 'Winnipeg', 'Havana', 'Halifax', 'Buenos Aires', 'Sao Paulo', 'Rio de Janeiro', 'Reykjavik', 'Algiers', 'Cairo', 'Minsk', 'Dubai', 'Islamabad', 'Dhaka', 'Bangkok', 'Beijing', 'Tokyo', 'Brisbane', 'Melbourne', 'Anadyr', 'Auckland', 'Kiritimati']
var sayCurrentHappyHour = function(bot, message) {
  bot.reply(message, 'its always happy hour somewhere! right now its happy hour in: ' + happyHours[new Date().getUTCHours()]);
}
controller.hears(['drink', 'thirsty', 'happy'], publicMsg, sayCurrentHappyHour);

var startTimer = function(bot, message) {
    controller.storage.users.get(message.user,function(err, user) {
        if (!user) {
            user = {
                id: message.user,
                timerIsActive: false,
                timerStartTime: 0,
                timerStopTime: 0
            };
        }
        if (user.timerIsActive==false) {
          user.timerIsActive = true;
          user.timerStartTime = new Date();
          controller.storage.users.save(user,function(err, id) {
            bot.reply(message,'Timer started.');
          });
        } else {
          bot.reply(message, 'You already have a timer running.');
        }
    });
}
controller.hears(['start timer'],privateMsg, startTimer);

var sayCurrentTimerTime = function(bot, message) {
    controller.storage.users.get(message.user,function(err, user) {
        if (!user) {
            user = {
                id: message.user,
                timerIsActive: false,
                timerStartTime: 0,
                timerStopTime: 0
            };
        }
        if (user.timerIsActive===true) {
          // bot.reply(message,'Current timer has been running');
          bot.reply(message,'Current timer has been running for ' + (new Date() - user.timerStartTime).toString() + 'ms'));
        } else {
          bot.reply(message, 'You do not have a timer running.');
        }
    });
}
controller.hears(['current timer'], privateMsg, sayCurrentTimerTime);

var stopCurrentTimer = function(bot, message) {
    controller.storage.users.get(message.user,function(err, user) {
        if (!user) {
            user = {
                id: message.user,
                timerIsActive: false,
                timerStartTime: 0,
                timerStopTime: 0
            };
        }
        if (user.timerIsActive===true) {
          user.timerIsActive = false;
          user.timerStopTime = new Date();
          controller.storage.users.save(user,function(err, id) {
            // bot.reply(message,'Timer was stopped');
            bot.reply(message,'Timer was stopped after ' + (user.timerStopTime).toString() - user.timerStartTime) + 'ms';
          });
        } else {
          bot.reply(message, 'You do not have a timer running.');
        }
    });
}
controller.hears(['stop timer'], privateMsg, stopCurrentTimer);

var sayPreviousTimerTime = function(bot, message) {
    controller.storage.users.get(message.user,function(err, user) {
        if (!user) {
            user = {
                id: message.user,
                timerIsActive: false,
                timerStartTime: 0,
                timerStopTime: 0
            };
        }
        if (user.timerIsActive===false && user.timerStartTime && user.timer.timerStopTime) {
          // bot.reply(message,'Your last timer ran');
          bot.reply(message,'Your last timer ran for ' + (user.timerStopTime).toString() - user.timerStartTime) + 'ms';
        } else if(!user.timerStartTime) {
          bot.reply(message, 'You have never run a timer.');
        } else {
          bot.reply(message, 'You have a timer running currently.');
        }
    });
}
controller.hears(['previous timer'], privateMsg, sayPreviousTimerTime);

controller.hears(['hello','hi'],'direct_message,direct_mention,mention',function(bot, message) {
    controller.storage.users.get(message.user,function(err, user) {
        if (user && user.name) {
            bot.reply(message,'**cough** ' + user.name + '!!');
        } else {
            bot.reply(message,'**cough**');
        }
    });
});

controller.hears(['shutdown'],'direct_message,direct_mention,mention',function(bot, message) {

    bot.startConversation(message,function(err, convo) {
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

controller.setupWebserver(process.env.PORT,function(err,express_webserver) {
  controller.createWebhookEndpoints(express_webserver);
});