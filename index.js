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

// var webhook_url = 'https://hooks.slack.com/services/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';

// function(bot, message) {
//     var matches = message.text.match(/call me (.*)/i);
//     var name = matches[1];
//     controller.storage.users.get(message.user,function(err, user) {
//         if (!user) {
//             user = {
//                 id: message.user,
//             };
//         }
//         user.name = name;
//         controller.storage.users.save(user,function(err, id) {
//             bot.reply(message,'**cough** I will call you ' + user.name + ' from now on.');
//         });
//     });
// }

// var passInfection = function(bot, message) {
//     controller.storage.users.get(message.user,function(err, user) {
//         if (!user) {
//           user = {
//             id: message.user
//           };
//         }
//         if (!user.infected) {
//             user.infected = true;
//             user.infectionTime = new Date();
//             bot.reply(message,'someone was infected at ' + user.infectionTime.toUTCString());
//             bot.reply(message,'someone was infected at ' + user.infectionTime.toUTCString());
//         } else {
//             // user.infected = false;
//             bot.reply(message,'someone has been infected since ' + user.infectionTime.toUTCString());
//         }
//         controller.storage.users.save(user,function(err, id) {
//             bot.reply(message,'passInfection Ended');
//         });
//     });
// }
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
                id: message.user
            };
        }
        if (user.timerIsActive==false) {
          user.timerIsActive = true;
          user.timerStartTime = new Date();
          controller.storage.users.save(user,function(err, id) {
            bot.reply(message,'Timer started.');
          });
        } else {
          bot.reply(message, user.timerIsActive);
          // bot.reply(message, 'You already have a timer running.');
        }
    });
}
controller.hears(['start timer'],privateMsg, startTimer);

var sayCurrentTimerTime = function(bot, message) {
    controller.storage.users.get(message.user,function(err, user) {
        if (!user) {
            user = {
                id: message.user
            };
        }
        if (user.timerIsActive===true) {
          bot.reply(message,'Current timer has been running for ' + user.timerStartTime - new Date());
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
                id: message.user
            };
        }
        if (user.timerIsActive===true) {
          user.timerIsActive = false;
          user.timerStopTime = new Date();
          controller.storage.users.save(user,function(err, id) {
            bot.reply(message,'Timer was stopped after ' + user.timerStartTime - user.timerStopTime);
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
                id: message.user
            };
        }
        if (user.timerIsActive===false && user.timerStartTime && user.timer.timerStopTime) {
          bot.reply(message,'Your last timer ran for ' + user.timerStartTime - user.timerStopTime);
        } else {
          bot.reply(message, 'You have a timer running currently.');
        }
    });
}
controller.hears(['previous timer'], privateMsg, sayPreviousTimerTime);

// var coughOn = function(bot, message) {
//   var matches = message.text.match(/cough on (.*)/i);
//   var name = matches[1];
//   bot.reply(message,'<@' + name + '> **cough**');
// }
// controller.hears(['cough on (.*)'],'direct_message,direct_mention,mention,ambient', coughOn);


// var cough = {
//   listenType: publicMsg,
//   listenFor: ['cough on (.*)'],
//   action: coughOn
// };

// var time = {
//   listenType: publicMsg,
//   listenFor: ['time'],
//   action: sayCurrentTime
// };

// var happyHr = {
//   listenType: publicMsg,
//   listenFor: ['drink', 'thirsty', 'happy'],
//   action: sayCurrentHappyHour
// };

// var roleReply = {
//   listenType: publicMsg,
//   listenFor: ['role call'],
//   action: roleCall
// }

// setInterval(function(){
//   bot.configureIncomingWebhook({url: webhook_url});
//   bot.sendWebhook({
//     text: '**cough**',
//     channel: 'general',
//   },function(err,res) {
//     // handle error
//   });
//   }, 5000);

// setInterval(function(){
//   bot.say({
//     text: new Date().toISOString(),
//     channel: 'C0J9Q6VPC',
//   },function(err,res) {
//     // handle error

//   });
//   }, 3600000);






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