var protobot = require('proto-bot');
var clockbot = new protobot({
  botName: 'tick-tock',
  debug: true
});

clockbot.rollCallResponse = function () {
  return '*tick* *tock* *tick* *tock*';
}

var defaultUser = function(id) {
return {
    id: id,
    timerIsActive: false,
    timerStartTime: 0,
    timerStopTime: 0
  }
};

function sayCurrentTime(bot, incomingMessage) {
  bot.reply(incomingMessage, 'ding it is ' + (((new Date().getUTCHours()-9)%12)+1) + ' oclock');
}
clockbot.addUntaggedTrigger(['what time is it'], sayCurrentTime);

var happyHourVerbs = ['ale', 'lager', 'a fifth', 'wasted', 'happy', 'hopped up', 'blasted', 'sauced', 'rum', 'wrecked', 'an appletini', 'crunk', 'mashed', 'drunk', 'islay', 'whacka', 'blitzed', 'a bad hangover', 'tossed', 'bonkers', 'marmite', 'amped', 'awful', 'crazy']
var happyHourLocations = ['Anchorage', 'Los Angeles', 'Phoenix', 'Winnipeg', 'Havana', 'Halifax', 'Buenos Aires', 'Sao Paulo', 'Rio de Janeiro', 'Reykjavik', 'Algiers', 'Cairo', 'Minsk', 'Dubai', 'Islamabad', 'Dhaka', 'Bangkok', 'Beijing', 'Tokyo', 'Brisbane', 'Melbourne', 'Anadyr', 'Auckland', 'Kiritimati']
function sayCurrentHappyHour(bot, incomingMessage) {
  bot.reply(incomingMessage, 'its always happy hour somewhere! right now you could be getting ' + happyHourVerbs[(new Date().getUTCHours()-8)%24] + ' in ' + happyHourLocations[(new Date().getUTCHours()-8)%24]);
}
clockbot.addUntaggedTrigger(['drink', 'thirsty', 'happy'], sayCurrentHappyHour);

function sayHappyHourFromTime(bot, incomingMessage) {
  var matches = incomingMessage.text.split(' ');
  var number = matches[7];
  if (number>=0&&number<24) {
    bot.reply(incomingMessage, 'if it was ' + number + ' oclock in LA you could be getting ' + happyHourVerbs[number] + ' in ' + happyHourLocations[number]);
  } else {
    bot.reply(incomingMessage, 'thats not how time works');
  }
}
clockbot.addTaggedTrigger(['where can I get drunk if its (.*)'], sayHappyHourFromTime);


function startTimer(bot, incomingMessage) {
    clockbot.botListener.storage.users.get(incomingMessage.user,function(err, user) {
        if (!user) {
            user = defaultUser(incomingMessage.user);
        }
        if (user.timerIsActive===false) {
          user.timerIsActive = true;
          user.timerStartTime = new Date();
          clockbot.botListener.storage.users.save(user,function(err, id) {
            bot.reply(incomingMessage,'Timer started.');
          });
        } else {
          bot.reply(incomingMessage, 'You already have a timer running.');
        }
    });
}
clockbot.addTaggedTrigger(['start'], startTimer);

function sayCurrentTimerTime(bot, incomingMessage) {
    clockbot.botListener.storage.users.get(incomingMessage.user,function(err, user) {
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
clockbot.addTaggedTrigger(['current', 'lap'], sayCurrentTimerTime);

function stopCurrentTimer(bot, incomingMessage) {
    clockbot.botListener.storage.users.get(incomingMessage.user,function(err, user) {
        if (!user) {
            user = defaultUser(incomingMessage.user);
        }
        if (user.timerIsActive===true) {
          user.timerIsActive = false;
          user.timerStopTime = new Date();
          clockbot.botListener.storage.users.save(user,function(err, id) {
            bot.reply(incomingMessage,'Timer was stopped after ' + (user.timerStopTime - user.timerStartTime).toString() + 'ms');
          });
        } else {
          bot.reply(incomingMessage, 'You do not have a timer running.');
        }
    });
}
clockbot.addTaggedTrigger(['stop'], stopCurrentTimer);

var sayPreviousTimerTime = function(bot, incomingMessage) {
    clockbot.botListener.storage.users.get(incomingMessage.user,function(err, user) {
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
clockbot.addTaggedTrigger(['previous'], sayPreviousTimerTime);