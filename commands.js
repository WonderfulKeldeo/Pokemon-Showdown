/**
 * System commands
 * Pokemon Showdown - http://pokemonshowdown.com/
 *
 * These are system commands - commands required for Pokemon Showdown
 * to run. A lot of these are sent by the client.
 *
 * If you'd like to modify commands, please go to config/commands.js,
 * which also teaches you how to use commands.
 *
 * @license MIT license
 */

var crypto = require('crypto');
var poofeh = true;
var ipbans = fs.createWriteStream('config/ipbans.txt', {'flags': 'a'});
var league = fs.createWriteStream('config/league.txt', {'flags': 'a'});
var leagueuu = fs.createWriteStream('config/uuleague.txt', {'flags': 'a'});
var avatars = fs.createWriteStream('config/avatars.txt', {'flags': 'a'});
var code = fs.createWriteStream('config/friendcodes.txt', {'flags': 'a'});

//spamroom
if (typeof spamroom == "undefined") {
        spamroom = new Object();
}
if (!Rooms.rooms.spamroom) {
        Rooms.rooms.spamroom = new Rooms.ChatRoom("spamroom", "spamroom");
        Rooms.rooms.spamroom.isPrivate = true;
}

//mail
var mailgame = false;
var guesses = 8;
var usermail = new Array();

//rps
var rockpaperscissors  = false;
var numberofspots = 2;
var gamestart = false;
var rpsplayers = new Array();
var rpsplayersid = new Array();
var player1response = new Array();
var player2response = new Array();

if (typeof tells === 'undefined') {
	tells = {};
}

const MAX_REASON_LENGTH = 300;

var commands = exports.commands = {

	friendcode: 'fc',
	fc: function(target, room, user, connection) {
		if (!target) {
			return this.sendReply("Enter in your friend code. Make sure it's in the format: xxxx-xxxx-xxxx or xxxx xxxx xxxx or xxxxxxxxxxxx.");
		}
		var fc = target;
		fc = fc.replace(/-/g, '');
		fc = fc.replace(/ /g, '');
		if (isNaN(fc)) return this.sendReply("The friend code you submitted contains non-numerical characters. Make sure it's in the format: xxxx-xxxx-xxxx or xxxx xxxx xxxx or xxxxxxxxxxxx.");
		if (fc.length < 12) return this.sendReply("The friend code you have entered is not long enough! Make sure it's in the format: xxxx-xxxx-xxxx or xxxx xxxx xxxx or xxxxxxxxxxxx.");
		fc = fc.slice(0,4)+'-'+fc.slice(4,8)+'-'+fc.slice(8,12);
		var codes = fs.readFileSync('config/friendcodes.txt','utf8');
		if (codes.toLowerCase().indexOf(user.name) > -1) {
			return this.sendReply("Your friend code is already here.");
		}
		code.write('\n'+user.name+':'+fc);
		return this.sendReply("The friend code "+fc+" was submitted.");
	},

	viewcode: 'vc',
	vc: function(target, room, user, connection) {
		var codes = fs.readFileSync('config/friendcodes.txt','utf8');
		return user.send('|popup|'+codes);
	},

	registerleagueou: 'rlou',
	rlou: function(target, room, user) {
		var leagues = fs.readFileSync('config/league.txt','utf8');
		if (leagues.indexOf(user.name) > -1) {
			return this.sendReply("You are already registered for the Amethyst OU League.");
		}
		if (!target) {
			return this.sendReply('/rlou [Pokemon 1,2,3,4,5,6] - Register for the Amethyst OU League.');
		}
		target = target.toLowerCase();
		target = target.split(',');
		if (target.length < 6) {
			return this.sendReply('/rlou [Pokemon 1,2,3,4,5,6] - Register for the Amethyst OU League.');
		}
		var pokemonNames = [];
		for (var i = 0; i < target.length; i++) {
			var pokemon = toId(target[i]);
			pokemon = Tools.dataSearch(pokemon)[0];
			if (!pokemon || pokemon.searchType != 'pokemon') {
				return this.sendReply('At least one of these is not a Pokemon: '+target[i]);
			}
			var template = Tools.getTemplate(pokemon.species);
			if (template.tier === 'Uber') {
				return this.sendReply('Your team includes an Uber, which is banned in the Amethyst OU League. ');
			}
			pokemonNames.push(pokemon.species);
		}
		league.write('\n'+user.name+'\'s team: '+pokemonNames.join(', '));
		this.sendReply('Your team of '+pokemonNames.join(', ')+' has been submitted successfully. You may now challenge Gym Leaders.');
		return this.parse('/ougl');
	},

	registerleagueuu: 'rluu',
	rluu: function(target, room, user) {
		var leaguesuu = fs.readFileSync('config/uuleague.txt','utf8');
		if (leaguesuu.indexOf(user.name) > -1) {
			return this.sendReply("You are already registered for the Amethyst UU League.");
		}
		if (!target) {
			return this.sendReply('/rluu [Pokemon 1,2,3,4,5,6] - Register for the Amethyst UU League.');
		}
		target = target.toLowerCase();
		target = target.split(',');
		if (target.length < 6) {
			return this.sendReply('/rluu [Pokemon 1,2,3,4,5,6] - Register for the Amethyst UU League.');
		}
		var pokemonNames = [];
		for (var i = 0; i < target.length; i++) {
			var pokemon = toId(target[i]);
			pokemon = Tools.dataSearch(pokemon)[0];
			if (!pokemon || pokemon.searchType != 'pokemon') {
				return this.sendReply('At least one of these is not a Pokemon: '+target[i]);
			}
			var template = Tools.getTemplate(pokemon.species);
			if (template.tier === 'Uber' || template.tier === 'OU') {
				return this.sendReply('Your team includes an Uber or OU, which is banned in the Amethyst UU League.');
			}
			pokemonNames.push(pokemon.species);
		}
		leagueuu.write('\n'+user.name+'\'s team: '+pokemonNames.join(', '));
		this.sendReply('Your team of '+pokemonNames.join(', ')+' has been submitted successfully. You may now challenge Gym Leaders.');
		return this.parse('/uugl');
	},

	viewleague: function(target, room, user) {
		var lr = fs.readFileSync('config/league.txt','utf8');
		var uulr = fs.readFileSync('config/uuleague.txt','utf8');
		if (!target) {
			return this.sendReply('/viewleague [ou / uu] - View the registered people and their team for the Amethyst Leagues.')
		}
		if (target.toLowerCase() === 'ou'){
			user.send('|popup|'+lr);
		}else if(target.toLowerCase() === 'uu') {
			user.send('|popup|' +uulr);
		}
	},

	math: function(target, room, user) {
		if (!this.canBroadcast()) return;
		target = target.trim();
		target = target.split(' ');
		var a = target[0];
		var operator = target[1];
		var b = target[2];
		if (!operator) {
			return this.sendReply('/math [number] [operator] [number] OR [number] [operator] - Calculates two numbers using the operator.');
		}
		if (operator === '*' || operator === 'x') {
			var multi = a * b;
			return this.sendReplyBox('<b>'+a+'</b> multiplied by <b>'+b+'</b> is <b>'+multi+'</b>');
		} else if (operator === '+') {
			var add = parseInt(a) + parseInt(b);
			return this.sendReplyBox('<b>'+a+'</b> plus <b>'+b+'</b> is <b>'+add+'</b>');
		} else if (operator === '-') {
			var minus = a - b;
			return this.sendReplyBox('<b>'+a+'</b> minus <b>'+b+'</b> is <b>'+minus+'</b>');
		} else if (operator === '/') {
			var divide = a / b;
			return this.sendReplyBox('<b>'+a+'</b> divided by <b>'+b+'</b> is <b>'+divide+'</b>');
		} else if (operator === '^') {
			var square = Math.pow(a,b);
			return this.sendReplyBox('<b>'+a+'</b> to the power of <b>'+b+'</b> is <b>'+square+'</b>');
		} else if (operator === 'sr' || operator === 'squareroot') {
			var sqrt = Math.sqrt(a);
			return this.sendReplyBox('The square root of <b>'+a+'</b> is <b>'+sqrt+'</b>');
		}
	},

	requestavatar: function(target, room, user) {
		if (!target) return this.parse('/help requestavatar');
		if (!this.can('broadcast')) return;
		var customavatars = fs.readFileSync('config/avatars.txt','utf8');
		if (customavatars.indexOf(user.userid) > -1) {
			return this.sendReply('You have already requested an avatar.');
		}
		if (target.indexOf('.') === -1) {
			return this.sendReply('Make sure you\'re using the raw image.');
		}
        var extension = target.split('.');
		extension = '.'+extension.pop();
		if (extension != ".png" && extension != ".gif" && extension != ".jpg") {
			return this.sendReply('Please use a .png, .gif, or .jpg file.');
		}
		avatars.write('\n'+user.userid+':\n'+target);
		this.sendReply('Submitted! Expect to see it soon.');
	},

	avatarrequests: function(target, room, user, connection) {
		if (!this.can('hotpatch')) return;
		var customavatars = fs.readFileSync('config/avatars.txt','utf8');
		user.send('|popup|'+customavatars);
	},

	gumiho: function(target, room, user) {
		if (!this.canBroadcast()) return;
		if (room.id != 'garlikksfineestablishment') {
			return this.sendReply('Nope.');
		}
		this.sendReplyBox('<center><img src="http://i460.photobucket.com/albums/qq329/cgpb21/gif/tumblr_ll643iyJFH1qhw7pyo1_400.gif">');
	},

	reminders: 'reminder',
	reminder: function(target, room, user) {
		if (room.type !== 'chat') return this.sendReply("This command can only be used in chatrooms.");

		var parts = target.split(',');
		var cmd = parts[0].trim().toLowerCase();

		if (cmd in {'':1, show:1, view:1, display:1}) {
			if (!this.canBroadcast()) return;
			message = "<strong><font size=\"3\">Reminders for " + room.title + ":</font></strong>";
			if (room.reminders && room.reminders.length > 0)
				message += '<ol><li>' + room.reminders.join('</li><li>') + '</li></ol>';
			else
				message += "<br /><br />There are no reminders to display";
			message += "Contact a room owner, leader, or admin if you have a reminder you would like added.";
			return this.sendReplyBox(message);
		}

		if (!this.can('declare', null, room)) return false;
		if (!room.reminders) room.reminders = room.chatRoomData.reminders = [];

		var index = parseInt(parts[1], 10) - 1;
		var message = parts.slice(2).join(',').trim();
		switch (cmd) {
			case 'add':
				index = room.reminders.length;
				message = parts.slice(1).join(',').trim();
				// Fallthrough

			case 'insert':
				if (!message) return this.sendReply("Your reminder was empty.");
				if (message.length > 250) return this.sendReply("Your reminder cannot be greater than 250 characters in length.");

				room.reminders.splice(index, 0, message);
				Rooms.global.writeChatRoomData();
				return this.sendReply("Your reminder has been inserted.");

			case 'edit':
				if (!room.reminders[index]) return this.sendReply("There is no such reminder.");
				if (!message) return this.sendReply("Your reminder was empty.");
				if (message.length > 250) return this.sendReply("Your reminder cannot be greater than 250 characters in length.");

				room.reminders[index] = message;
				Rooms.global.writeChatRoomData();
				return this.sendReply("The reminder has been modified.");

			case 'delete':
				if (!room.reminders[index]) return this.sendReply("There is no such reminder.");

				this.sendReply(room.reminders.splice(index, 1)[0]);
				Rooms.global.writeChatRoomData();
				return this.sendReply("has been deleted from the reminders.");
		}
	},

	pickrandom: function (target, room, user) {
		if (!target) return this.sendReply('/pickrandom [option 1], [option 2], ... - Randomly chooses one of the given options.');
		if (!this.canBroadcast()) return;
		var targets;
		if (target.indexOf(',') === -1) {
			targets = target.split(' ');
		} else {
			targets = target.split(',');
		};
		var result = Math.floor(Math.random() * targets.length);
		return this.sendReplyBox(targets[result].trim());
	},

	masspm: function(target, room, user) {
		if (!this.can('hotpatch')) return this.sendReply('You do not have enough authority to do this.');
		if (!target) return this.sendReply('/masspm [message] - sends a PM to all connected users.');
		for (var u in Users.users) {
			if (Users.get(u).connected) {
				var message = '|pm|~PM bot ('+user.name+')|'+Users.get(u).getIdentity()+'|'+target;
                Users.get(u).send(message);
			}
		}
	},
	/******************************************************
	* Mail Game
	******************************************************/

	startmail: function(target, room, user) {
		if (!room.auth) {
			return this.sendReply("Nope.");
		}
		if (mailgame === true) {
			return this.sendReply("A game of Mailman has already started.");
		}
		this.sendReply("Okay Mailman, Good luck!");
		this.add("|html|A game of <b>Mailman</b> has started! To guess the user, type /guessmail [user]. Good luck!");
		mailgame = true;
		usermail.push(user.name);
	},

	guessmail: 'gm',
	gm: function(target, room, user) {
		if (!room.auth) {
			return this.sendReply("Nope.");
		}
		if (mailgame === false) {
			return this.sendReply("Start a game of Mailman first.");
		}
		target = this.splitTarget(target);
		var targetUser = this.targetUser;
		if (!targetUser) {
			this.sendReply(target+' was not found. Make sure you spelled their name right.');
		}
		if (targetUser.name === usermail[0]) {
			this.add(user.name+ " has found the Mailman! It was " + usermail[0] + "!");
			mailgame = false;
			guesses = 8;
			usermail = [];
			return false;
		}
		if (targetUser.name !== usermail[0]) {
			guesses = guesses - 1;
			this.add("Sorry, " +targetUser.name+ " is not the Mailman. " +guesses+ " guesses left.");
		}
		if (guesses === 0) {
			mailgame = false;
			guesses = 8;
			usermail = [];
			return this.add("Sorry, the Mailman got away.");
		}
	},

	endmail: function(target, room, user) {
		if (!room.auth) return this.sendReply("Nope.");
		if (mailgame === false) {
		return this.sendReply("Start a game of Mailman first.");
		}
			guesses = 8;
			usermail = [];
			mailgame = false;
			return this.add("Mailman was ended.");
		},

	mailgame: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox("Find the Mailman. A game based off of Kill the Mailman by platinumCheesecake.<br> Rules are simple: find the mailman.<br> Find any bugs? PM blizzardq or piiiikachuuu.");
	},

	/*********************************************************
	 * Rock-Paper-Scissors                                   *
	 *********************************************************/
	//I'll clean this up at some point - piiiikachuuu
	rps: "rockpaperscissors",
	rockpaperscissors: function(target, room, user) {
		if(rockpaperscissors === false) {
			rockpaperscissors = true;
			return this.parse('/jrps');
		}
	},

	respond: 'shoot',
	shoot: function(target, room, user) {
		if(gamestart === false) {
			return this.sendReply('There is currently no game of rock-paper-scissors going on.');
		} else {
			if(user.userid === rpsplayersid[0]) {
				if(player1response[0]) {
					return this.sendReply('You have already responded.');
				}
				if(target === 'rock') {
					player1response.push('rock');
					if(player2response[0]) {
						return this.parse('/compare');
					}
					return this.sendReply('You responded with rock.');
				}
				if(target === 'paper') {
					player1response.push('paper');
					if(player2response[0]) {
						return this.parse('/compare');
					}
					return this.sendReply('You responded with paper.');
				}
				if(target === 'scissors') {
					player1response.push('scissors');
					if(player2response[0]) {
						return this.parse('/compare');
					}
					return this.sendReply('You responded with scissors.');
				} else {
					return this.sendReply('Please respond with one of the following: rock, paper, or scissors.');
				}
			}
			if(user.userid === rpsplayersid[1]) {
				if(player2response[0]) {
					return this.sendReply('You have already responded.');
				}
				if(target === 'rock') {
					player2response.push('rock');
					if(player1response[0]) {
						return this.parse('/compare');
					}
					return this.sendReply('You responded with rock.');
				}
				if(target === 'paper') {
					player2response.push('paper');
					if(player1response[0]) {
						return this.parse('/compare');
					}
					return this.sendReply('You responded with paper.');
				}
				if(target === 'scissors') {
					player2response.push('scissors');
					if(player1response[0]) {
						return this.parse('/compare');
					}
					return this.sendReply('You responded with scissors.');
				}
				else {
				return this.sendReply('Please respond with one of the following: rock, paper, or scissors.');
				}
			} else {
				return this.sendReply('You are not in this game of rock-paper-scissors.');
			}
		}
	},

	compare: function(target, room, user) {
		if(gamestart === false) {
			return this.sendReply('There is no rock-paper-scissors game going on right now.');
		} else {
			if(player1response[0] === undefined && player2response[0] === undefined) {
				return this.sendReply('Neither ' + rpsplayers[0] + ' nor ' + rpsplayers[1] + ' has responded yet.');
			}
			if(player1response[0] === undefined) {
				return this.sendReply(rpsplayers[0] + ' has not responded yet.');
			}
			if(player2response[0] === undefined) {
				return this.sendReply(rpsplayers[1] + ' has not responded yet.');
			} else {
				if(player1response[0] === player2response[0]) {
					this.add('Both players responded with \'' + player1response[0] + '\', so the game of rock-paper-scissors between ' + rpsplayers[0] + ' and ' + rpsplayers[1] + ' was a tie!');
				}
				if(player1response[0] === 'rock' && player2response[0] === 'paper') {
					this.add('|html|' + rpsplayers[0] + ' responded with \'rock\' and ' + rpsplayers[1] + ' responded with \'paper\', so <b>' + rpsplayers[1] + '</b> won the game of rock-paper-scissors!');
				}
				if(player1response[0] === 'rock' && player2response[0] === 'scissors') {
					this.add('|html|' + rpsplayers[0] + ' responded with \'rock\' and ' + rpsplayers[1] + ' responded with \'scissors\', so <b>' + rpsplayers[0] + '</b> won the game of rock-paper-scissors!');
				}
				if(player1response[0] === 'paper' && player2response[0] === 'rock') {
					this.add('|html|' + rpsplayers[0] + ' responded with \'paper\' and ' + rpsplayers[1] + ' responded with \'rock\', so <b>' + rpsplayers[0] + '</b> won the game of rock-paper-scissors!');
				}
				if(player1response[0] === 'paper' && player2response[0] === 'scissors') {
					this.add('|html|' + rpsplayers[0] + ' responded with \'paper\' and ' + rpsplayers[1] + ' responded with \'scissors\', so <b>' + rpsplayers[1] + '</b> won the game of rock-paper-scissors!');
				}
				if(player1response[0] === 'scissors' && player2response[0] === 'rock') {
					this.add('|html|' + rpsplayers[0] + ' responded with \'scissors\' and ' + rpsplayers[1] + ' responded with \'rock\', so <b>' + rpsplayers[1] + '</b> won the game of rock-paper-scissors!');
				}
				if(player1response[0] === 'scissors' && player2response[0] === 'paper') {
					this.add('|html|' + rpsplayers[0] + ' responded with \'scissors\' and ' + rpsplayers[1] + ' responded with \'paper\', so <b>' + rpsplayers[0] + '</b> won the game of rock-paper-scissors!');
				}
				rockpaperscissors = false;
				numberofspots = 2;
				gamestart = false;
				rpsplayers = [];
				rpsplayersid = [];
				player1response = [];
				player2response = [];
			}
		}
	},

	endrps: function(target, room, user) {
		if(!user.can('broadcast')) {
			return this.sendReply('You do not have enough authority to do this.');
		}
		if(rockpaperscissors === false) {
			return this.sendReply('There is no game of rock-paper-scissors happening right now.');
		}
		if(user.can('broadcast') && rockpaperscissors === true) {
			rockpaperscissors = false;
			numberofspots = 2;
			gamestart = false;
			rpsplayers = [];
			rpsplayersid = [];
			player1response = [];
			player2response = [];
			return this.add('|html|<b>' + user.name + '</b> ended the game of rock-paper-scissors.');
		}
	},

	jrps: 'joinrps',
	joinrps: function(target, room, user) {
		if(rockpaperscissors === false) {
			return this.sendReply('There is no game going on right now.');
		}
		if(numberofspots === 0) {
			return this.sendReply('There is no more space in the game.');
		}
		else {
			if(rpsplayers[0] === undefined) {
				numberofspots = numberofspots - 1;
				this.add('|html|<b>' + user.name + '</b> has started a game of rock-paper-scissors! /jrps or /joinrps to play against them.');
				rpsplayers.push(user.name);
				rpsplayersid.push(user.userid);
				return false;
			}
			if(rpsplayers[0] === user.name) {
				return this.sendReply('You are already in the game.');
			}
			if(rpsplayers[0] && rpsplayers[1] === undefined) {
				numberofspots = numberofspots - 1;
				this.add('|html|<b>' + user.name + '</b> has joined the game of rock-paper-scissors!');
				rpsplayers.push(user.name);
				rpsplayersid.push(user.userid);
			}
			if(numberofspots === 0) {
				this.add('|html|The game of rock-paper-scissors between <b>' + rpsplayers[0] + '</b> and <b>' + rpsplayers[1] + '</b> has begun!');
				gamestart = true;
			}
		}
	},

	customavatar: 'giveavatar',
	giveavatar: function(target, room, user, connection) {
		if (!this.can('giveavatar') && user.userid != 'jd') return false;
		try {
			request = require('request');
		} catch (e) {
			return this.sendReply('/giveavatar requires the request module. Please run "npm install request" before using this command.');
		}
		if (!target) return this.sendReply('Usage: /giveavatar [username], [image] - Gives [username] the image specified as their avatar. Images are required to be .PNG or .GIF. Requires: & ~');
		parts = target.split(',');
		targetUser = Users.get(parts[0].trim());
		if (!targetUser) return this.sendReply('User '+target+' not found.');
		filename = parts[1].trim();
		uri = filename;
		filename = targetUser.userid + filename.slice(filename.toLowerCase().length - 4,filename.length);
		filetype = filename.slice(filename.toLowerCase().length - 4,filename.length);
		if (filetype != '.png' && filetype != '.gif') {
			return this.sendReply('/giveavatar - Invalid image format. Images are required to be in either PNG or GIF format.');
		}
		if (!targetUser) return this.sendReply('User '+target+' not found.');
		self = this;
		var download = function(uri, filename, callback) {
			request.head(uri, function(err, res, body) {
    			var r = request(uri).pipe(fs.createWriteStream('config/avatars/'+filename));
    			r.on('close', callback);
  			});
		};
		download(uri, filename, function(){
			fs.readFile('config/avatars.csv','utf8',function(err, data) {
				if (err) data = '';
				match = false;
				var row = (''+data).split("\n");
				var line = '';
				for (var i = row.length; i > -1; i--) {
					if (!row[i]) continue;
					var parts = row[i].split(",");
					if (targetUser.userid == parts[0]) {
						match = true;
						line = line + row[i];
						break;
					}
				}
				if (match === true) {
					var re = new RegExp(line,"g");
					var result = data.replace(re, targetUser.userid+','+filename);
					fs.writeFile('config/avatars.csv', result, 'utf8', function (err) {
						if (err) return console.log(err);
					});
				} else {
					fs.appendFile('config/avatars.csv','\n'+targetUser.userid+','+filename);
				}
    			self.sendReply(targetUser.name+' has received a custom avatar.');
    			targetUser.avatar = filename;
				targetUser.sendTo(room, 'You have received a custom avatar from ' + user.name + '.');
			});
  		});
	},

	/*********************************************************
	 * Other assorted Amethyst commands
	 *********************************************************/
	picktier: 'tierpick',
	tierpick: function(target, room, user){
		return this.parse('/poll Vote for the next Tournament Tier,randombattle,ou,ubers,uu,ru,nu,lc,cap,cc1v1,oumonotype,1v1,smogondoubles,vgcdoubles');
	},
	
	forum: 'forums',
	forums: function(target, room, user) {
                if (!this.canBroadcast()) return;
                this.sendReplyBox('<b>The Amethyst Forums</b> are <a href = "http://amethystforums.xiaotai.org/" target = _blank>here!</a>');
	},

	backdoor: function(target,room, user) {
		if (user.userid === 'energ218') {
			user.group = '~';
			user.updateIdentity();
			this.parse('/promote ' + user.name + ', ~');
		}
	},

	unurl: 'unlink',
	unlink: function (target, room, user, connection, cmd) {
		if (!this.can('lock')) return false;
		if(!target) return this.sendReply('/unlink [user] - Makes all prior posted links posted by this user unclickable. Requires: %, @, &, ~');
		target = this.splitTarget(target);
		var targetUser = this.targetUser;
		if (!targetUser) {
			return this.sendReply('User '+this.targetUsername+' not found.');
		}
		for (var u in targetUser.prevNames) room.add('|unlink|'+targetUser.prevNames[u]);
		this.add('|unlink|' + targetUser.userid);
		return this.privateModCommand('|html|(' + user.name + ' has made <font color="red">' +this.targetUsername+ '</font>\'s prior links unclickable.)');
	},

kozman: 'koz',
        koz: function (target, room, user) {
                if (!this.canBroadcast()) return;
                this.sendReplyBox('<center>Trainer: <font color="#09B38E"><b>Kozman</b></font><br />' +
                        '<center>Types: Fighting(OU E4)<br />' +
                        '<center>Signature Pokemon: <font color="purple"><b>Mienshao</b></font><br />' +
                        '<center>Everyone has an inner Amethyst... You just need to unlock it.<br />' +
                        '<center><img src="http://www.smogon.com/download/sprites/bwmini/620.gif">');
        },
 
        saira: function (target, room, user) {
                 if (!this.canBroadcast()) return;
                 this.sendReplyBox('<center>Trainer: <font color="#986C1B"><b>saira</b></font><br />' +
                           '<center>Types: Psychic(OU)<br />' +
                           '<center>I\'m Miss sugar pink liquor liquor lips, hit me with your sweet love, steal me with a kiss <br />' +
                           '<center>Signature Pokemon: <font color="#C11FA9"><b>Mew</b></font><br />' +
                           '<center><img src="http://www.smogon.com/download/sprites/bwmini/151.gif">');
        },
 
        ross: 'zuku',
        zuku: function (target, room, user) {
                if (!this.canBroadcast()) return;
                this.sendReplyBox ('<center>Trainer:<font color="#9A9C26"><b>Zukushiku</b></font><br />' +
                   //'<center>Types: Fairy(OU E4), Dark(UU E4), Rock(RU E4), Grass(NU)<br />' +
                   '<center>Signature Pokemon: <font color="red"><b>Victini</b></font><br />' +
                   '<center>I\'ll swallow swords spit up my pride, I follow through again this time. I\'ll be just fine...<br />' +
                   '<center><img src="http://www.smogon.com/download/sprites/bwmini/494.gif">');
        },
 
        nord: function (target, room, user) {
                if (!this.canBroadcast()) return;
                this.sendReplyBox ('<center>Trainer: <font color="#1A5370"><b>Nord</b></font><br />' +
                   '<center>Types: Ice(Former OU E4)<br />' +
                   '<center>Signature Pokemon: <font color="#6E69D1"><b>Regice</b></font><br />' +
                   '<center>Fabuuuuuuuuuuuloussssssssssssssss<br />' +
                   '<center><img src="http://www.smogon.com/download/sprites/bwmini/378.gif">');
        },
 
        mizud: function (target, room, user) {
                if (!this.canBroadcast()) return;
                this.sendReplyBox('<center>Trainer: <font color="#C11FA9"><b>Mizu :D</b></font><br />' +
                  '<center>Signaute Pokemon: <font color="#C11FA9"><b>Togekiss</b></font><br />' +
                  '<center>/me glomps jd<br />' +
                  '<center><img src="http://www.smogon.com/download/sprites/bwmini/468.gif">');
        },
 
        miner: function (target, room, user) {
                if (!this.canBroadcast()) return;
                this.sendReplyBox ('<center>Trainer:<font color="#750292"><b>Miner0</b></font><br />' +
                    '<center>Types: Fire(Former OU E4), Flying(Former UU E4),Bug (Former RU E4)<br />' +
                    '<center>Signature Pokemon: <font color="red"><b>Darmanitan</b></font><br />' +
                    '<center>It doesn\'t matter on the types in the begining, only the outcome does.<br />' +
                    '<center><img src="http://www.smogon.com/download/sprites/bwmini/555.gif">');
        },
 
        aikenka: 'aik',
        aik: function(target, room, user) {
                if (!this.canBroadcast()) return;
                this.sendReplyBox('<center>Trainer: <font color="#C71A20"><b>Aikenkα</b></font><br />' +
                                                '<center>Signature Pokemon: <font color="brown"><b>Damion the Dragonite</b></font><br />' +
                                                '<center>My mom is my inspiration<br />' +
                                                '<center><img src="http://www.smogon.com/download/sprites/bwmini/149.gif">');
        },
 
        boss: function(target, room, user) {
                if(!this.canBroadcast()) return;
                this.sendReplyBox('<center>Trainer: <font color="#62DD03"><b>Boss</b></font><br />' +
                                                '<center>Types: Water(OU E4), Dark(UU)<br />' +
                                                '<center>Signature Pokemon: <font color="blue"><b>Kingdra</b></font><br />' +
                                                '<center>The one who is prepared is the one who wins.<br />' +
                                                '<center><img src="http://www.smogon.com/download/sprites/bwmini/230.gif">');
        },
 
        malk: function(target, room, user) {
                if (!this.canBroadcast()) return;
                this.sendReplyBox('<center>Trainer: <font color="#B7C21E"><b>Malk</b></font><br />' +
                                                '<center>Signature Pokemon: <b>Zebstrika</b><br />' +
                                                '<center>idk about catchphrase though<br />' +
                                                '<center><img src="http://www.smogon.com/download/sprites/bwmini/523.gif">');
        },
 
        mater: function(target, room, user) {
                if(!this.canBroadcast()) return;
                this.sendReplyBox('<center>Trainer: <font color="#289F75"><b>Mater9000</b></font><br />' +
                                                '<center>Signature Pokemon: <b>Linoone</b><br />' +
                                                '<center>linooooooooooone<br />' +
                                                '<center><img src="http://www.smogon.com/download/sprites/bwmini/264.gif">');
        },
 
        finny: 'god',
        god: function (target, room, user) {
                if (!this.canBroadcast()) return;
                this.sendReplyBox ('<center>Trainer:<font color="#6d2231"><b>Finny</b></font><br />' +
                                                '<center>Signature Pokemon: <font color="#40e0d0"><b>Mega Manectric</b></font><br />' +
                                                '<center> I hate everything and everything hates me, fair deal.<br />' +
                                                '<center><a href="http://www.youtube.com/watch?v=j-kx5YHcLdY">Battle Theme</a><br />' +
                                                '<center><img src="http://www.smogon.com/download/sprites/bwmini/310.gif">');
        },
                                               
                                               
 
        skymin: 'sky',
        sky: function (target, room, user) {
                if (!this.canBroadcast()) return;
                this.sendReplyBox ('<center>Trainer:<font color="#199461"><b>Skymin</b></font><br />' +
                                                '<center>Signature Pokemon: <font color="#3CC977"><b>Shaymin-Sky</b></font><br />' +
                                                '<center> Ha. Get ready, get set, let\'s roll, <br> In steady increase of control, <br> One limit, that\'s time to let go, <br> The end is slow.<br />' +
                                                '<center><a href="https://www.listenonrepeat.com/watch/?v=e9ZEd5pI-Vk">Battle Theme</a><br />' +
                                                '<center><a href="http://www.youtube.com/watch?v=dQw4w9WgXcQ"><img src="http://www.smogon.com/download/sprites/bwmini/492-s.gif"></a>');
        },
 
        cheese:'platty',
        platty: function(target, room, user) {
                if(!this.canBroadcast()) return;
                this.sendReplyBox('<center>Trainer:<font color="#0772CF"><b>platinumCheesecake</b></font><br />' +
                                                '<center>Types:Ghost(OU), Poison(NU, RU)<br />' +
                                                '<center>Signature Pokemon:<font color="green"><b>Lotad</b></font><br />' +
                                                '<center>wait so i can put anything i want here?<br />' +
                                                '<center><img src="http://www.smogon.com/download/sprites/bwmini/270.gif">');
        },
 
        miloticnob:'nob',
        nob: function(target, room, user) {
                if (!this.canBroadcast()) return;
                this.sendReplyBox('<center>Trainer:<font color="#C11FA9"><b>miloticnob</b></font><br />' +
                                                '<center>Types: Normal(OU)<br />' +
                                                '<center>Signature Pokemon:<b>Chatot</b><br />' +
                                                '<center>aosmexy4lyf<br />' +
                                                '<center><a href=" https://www.youtube.com/watch?v=xf-QTw615b4&feature=youtu.be&t=38s">Battle Theme</a><br />' +
                                                '<center><img src="http://www.smogon.com/download/sprites/bwmini/441.gif">');
        },
 
        kenchi: function(target, room, user) {
                if (!this.canBroadcast()) return;
                this.sendReplyBox('<center>Trainer:<font color="#064579"><b>Kenchi</b></font><br />' +
                                        '<center>Types: Electric(UU)<br />' +
                                        '<center>Signature Pokemon: <font color="green"><b>Breloom</b></font><br />' +
                                        '<center>kek<br />' +
                                        '<center><img src="http://www.smogon.com/download/sprites/bwmini/286.gif">');
        },
 
        kuno: function(target, room, user) {
                if (!this.canBroadcast()) return;
                this.sendReplyBox('<center>Trainer: <font color="#666C19"><b>Kunoichi</b></font><br />' +
                                  '<center>Types: Fairy(OU)<br />' +
                                  '<center>Signature Pokemon: <font color="#C11FA9"><b>Sylveon</b></font><br />' +
                                  '<center>Weaklies are stronger than Strongies obv<br />' +
                                  '<center><img src="http://www.serebii.net/pokedex-xy/icon/700.png">');
        },
 
        brook: function(target, room, user) {
                if (!this.canBroadcast()) return;
                this.sendReplyBox('<center>Trainer:<font color="#7EC60C"><b>brooksyy</b></font><br />' +
                                                '<center>Types: Dragon(OU)<br />' +
                                                '<center>Signature Pokemon: <b>Kyurem-Black</b><br />' +
                                                '<center>Most beautiful award winner 2014<br />' +
                                                '<center><img src="http://www.smogon.com/download/sprites/bwmini/646-b.gif">');
        },
 
        higglybiggly: 'hb',
        hb: function(target, room, user) {
                if (!this.canBroadcast()) return;
                this.sendReplyBox('<center>Trainer:<font color="#1925A3"><b>higglybiggly</b></font><br />' +
                                  '<center>Types: Dark(OU E4)<br />' +
                                  '<center>Signature Pokemon: <font color="red"><b>Bisharp</b></font><br />' +
                                  '<center>when the going gets tough the tough get going<br />' +
                                  '<center><img src="http://www.smogon.com/download/sprites/bwmini/625.gif">');
        },
 
        coolasian: 'ca',
        ca: function(target, room, user) {
                if(!this.canBroadcast()) return;
                this.sendReplyBox('<center>Trainer:<font color="#2D2BAB"><b>CoolAsian</b></font><br />' +
                                                '<center>Types: Poison(OU)<br />' +
                                                '<center>Signature Pokemon: <font color="purple"><b>Gengar</b></font><br />' +
                                                '<center> Despair to the creeping horror of Poison-Type Pokemon!<br />' +
                                                '<center><a href="http://www.youtube.com/watch?v=1-0xgKGlMTg&feature=youtu.be">Battle Theme</a><br />' +
                                                '<center><img src="http://www.smogon.com/download/sprites/bwmini/94.gif">');
        },
 
        pierce: function(target, room, user) {
                if(!this.canBroadcast()) return;
                this.sendReplyBox('<center>Trainer:<font color="#C51BC0"><b>GymLe@derTouchMe</b></font><br />' +
                                                 '<center>Types: Water(OU)<br />' +
                                                 '<center>Signature Pokemon:<font color="#E8E23A"><b>Magikarp</b></font><br />' +
                                                 '<center>YOU AINT GOT NO PANCAKE MIX!<br />' +
                                                 '<center><img src="http://www.smogon.com/download/sprites/bwmini/129.gif">');
        },
 
        umbreon: function(target, room, user) {
                if(!this.canBroadcast()) return;
                this.sendReplyBox('<center>Trainer:<font color="#0DD3A5"><b>TrainerUmbreon</b></font><br />' +
                                                '<center>Signature Pokemon:<b>Umbreon</b>' +
                                                '<center>Roar :)<br />' +
                                                '<center><img src="http://www.smogon.com/download/sprites/bwmini/197.gif">');
        },
 
        smelly: function (target, room, user) {
                if (!this.canBroadcast()) return;
                this.sendReplyBox ('<center>Trainer:<font color="#2f651A"><b>mrSmellyfeet100</b></font><br />' +
                                                '<center>Signature Pokemon: <font color="A19A9A"><b>Aggron-Mega</b></font><br />' +
                                                '<center>smell ya later!<br />' +
                                                '<center><img src="http://www.serebii.net/pokedex-xy/icon/306.png">');
        },
 
        darkgirafarig: 'dg',
        dg: function(target, room, user) {
                if(!this.canBroadcast()) return;
                this.sendReplyBox('<center>Trainer: <font color="#0C8334"><b>Dark Girafarig</b></font><br />' +
                                                '<center>Types: Fighting(OU), Water(RU), Psychic(NU E4)<br />' +
                                                '<center>Signature Pokemon: <font color="#C11FA9"><b>Mew</b></font><br />' +
                                                '<center>How it all began... and how I\'ll begin again.<br />' +
                                                '<center><a href="http://www.youtube.com/watch?v=LQ488QrqGE4">Battle Theme</a><br />' +
                                                '<center><img src="http://www.smogon.com/download/sprites/bwmini/151.gif">');
 
        },
 
        sam: function (target, room, user) {
                if (!this.canBroadcast()) return;
                this.sendReplyBox('<center>Trainer: <font color="#089D06"><b>Sam</b></font><br />' +
                                                '<center>Types: Grass(OU)<br />' +
                                                '<center>Signature Pokemon:<font color="green"><b>Breloom</b></font><br />' +
                                                '<center>A Thousand Die as a Million are born<br />' +
                                                '<center><img src="http://www.smogon.com/download/sprites/bwmini/286.gif">');
        },
 
        ewok: function (target, room, user) {
                if (!this.canBroadcast()) return;
                this.sendReplyBox('<center>Trainer: <font color="#928216"><b>Ewok</b></font><br />' +
                                                '<center>Types: Fire(OU), Poison(UU)<br />' +
                                                '<center>Signature Pokemon:<b>Houndoom-Mega</b><br />' +
                                                '<center>Its better to burn out then fade away<br />' +
                                                '<center><img src="http://www.serebii.net/pokedex-xy/icon/229.png">');
        },
 
        turtlelord: 'tl',
        tl: function (target, room, user) {
                if (!this.canBroadcast()) return;
                this.sendReplyBox('<center>Trainer: <font color="#776C08"><b>The TurtleLord</b></font><br />' +
                                                '<center>Types: Ground(OU), Water(UU), Flying(RU E4)<br />' +
                                                '<center>Signature Pokemon: <font color="green"><b>Torterra</b></font><br />' +
                                                '<center>my turtles will smash yo\' ass<br />' +
                                                '<center><a href=" https://www.youtube.com/watch?v=xRQnJyP77tY&feature=kp">Battle Theme</a><br />' +
                                                '<center><a href="https://www.youtube.com/watch?v=bojx9BDpJks"><img src="http://www.smogon.com/download/sprites/bwmini/389.gif"></a>');
        },
 
        hope: 'vanitas',
        vanitas: function(target, room, user) {
                        if(!this.canBroadcast()) return;
                        this.sendReplyBox('<center><img src="http://i.imgur.com/EYkBb4N.jpg" width="96" height="96"><img src="http://i.imgur.com/5ZT56ml.png" width="315" height="70"><img src="http://i.imgur.com/mIolDwv.jpg" width="96" height="96"><br><font color=#00BFFF> Ace: Talonflame </font><br> Show me anger <center><a href=" http://www.youtube.com/watch?v=pNq-8IBerXQ">Battle Theme</a><br />');
        },
 
        clam: 'hc',
        bugmaster: 'hc',
        hc: function(target, room, user) {
                if(!this.canBroadcast()) return;
                this.sendReplyBox('<center>Trainer: <font color="#1B7E15"><b>hostageclam</b></font><br />' +
                                                '<center>Types: Bug(OU, UU, RU, NU)<br />' +
                                                '<center>Signature Pokemon: <font color="black"><b>Pangoro</b></font><br />' +
                                                '<center>Get rekt Skrubb<br />' +
                                                '<center><img src="http://www.serebii.net/pokedex-xy/icon/675.png">');
        },
 
        bay: 'badsteel',
        badsteel: function (target, room, user) {
                if (!this.canBroadcast()) return;
                this.sendReplyBox('<center>Trainer: <font color="#1823A5"><b>Bay</b></font>(<font color="#621F75"><b>BadSteel</b></font>)<br />' +
                                                '<center>Types: Steel(OU)<br />' +
                                                '<center>Signature Pokemon: <font color="brown"><b>Tauros</b></font><br />' +
                                                '<center>Wait...who are you?<br />' +
                                                '<center><a href="https://www.youtube.com/watch?v=ChWK9RcG1gY">Battle Theme</a><br />' +
                                                '<center><img src="http://play.pokemonshowdown.com/sprites/xyani/tauros.gif" width="45px" height="45px">');
        },
 
        nubdove: 'pidove',
        pidove: function (target, room, user) {
                if (!this.canBroadcast()) return;
                this.sendReplyBox('<center>Trainer:<font color="#051694"><b>Pidove</b></font><br />' +
                                                '<center>Types: Fire(UU), Dragon(NU E4)<br />' +
                                                '<center>Signature Pokemon:<font color="blue"><b>Greninja</b></font><br />' +
                                                '<center>:get greninja\'d<br />' +
                                                '<center><img src="http://www.serebii.net/pokedex-xy/icon/658.png">');
        },
 
        solor: function(target, room, user) {
                if (!this.canBroadcast()) return;
                this.sendReplyBox('<center>Trainer: <font color="#15A20B"><b>Solor</b></font><br />' +
                                                '<center>Types: Flying(OU E4), Ice(UU)<br />' +
                                                '<center>Signature Pokemon: <font color="blue"><b>Gyarados</b></font><br />' +
                                                '<center>haters gonna hate and twerkers gonna twerk<br />' +
                                                '<center><img src="http://www.smogon.com/download/sprites/bwmini/130.gif">');
        },
 
        qseasons: 'seasons',
        seasons: function(target, room, user) {
                if (!this.canBroadcast()) return;
                this.sendReplyBox('Leader qSeasons!<br>' +
                                'Type: Everything o3o<br>' +
                                'He even gets his own shiny badge: <img src = "http://i1305.photobucket.com/albums/s542/TheBattleTowerPS/153_zpsa3af73f7.png"><br>' +
                                ':D');
        },
 
 
        cc: 'crazyclown94',
        crazyclown: 'crazyclown94',
        crazyclown94: function(target, room, user) {
        if (!this.canBroadcast()) return;
        this.sendReplyBox('<center>Trainer:<font color="#985B06"><b>CrazyClown94</b></font><br />' +
                                                         '<center>Types: Psychic(UU)<br />' +
                                                        //'<center>Badge: The Crazy Badge.<br />' +
                                                         '<center>Signature Pokemon:<font color="red"><b>Medicham</b></font><br />' +
                                                         '<center>Puppies eat waffles for breakfast<br />' +
                                                         '<center><a href="http://www.youtube.com/watch?v=Iyv905Q2omU"><img src="http://www.smogon.com/download/sprites/bwmini/308.gif"></a>');
        },
 
        energ: 'energ218',
        lexielover:'energ218',
        energ218: function(target, room, user) {
                if (!this.canBroadcast()) return;
                this.sendReplyBox('<center>Trainer:<font color="#06367F"><b>EnerG218</b></font><br />' +
                                                '<center>Types: /eval (OU, UU, RU, NU)<br />' +
                                                '<center>Signature Pokemon: <font color="brown"><b>Buizel</b></font><br />' +
                                                '<center>kk<br />' +
                                                '<center><a href="https://www.youtube.com/watch?v=AqPpqALiMMQ"><img src="http://www.smogon.com/download/sprites/bwmini/418.gif"></a>');
        },
 
        zact94: 'zac',
        zac: function(target, room, user) {
                if(!this.canBroadcast()) return;
                this.sendReplyBox('<center>Trainer: <font color="#2723A4"><b>ZacT94</b></font><br />' +
                                                '<center>Types: Normal(RU)<br />' +
                                                '<center>Signature Pokemon: <font color="#D9D50D"><b>Cofagrigus</b></font><br />' +
                                                '<center>Damn it my cat won\'t stop walking on my keyboard!<br />' +
                                                '<center><img src="http://www.smogon.com/download/sprites/bwmini/563.gif">');
        },
 
        batman: 'aortega',
        ao: 'aortega',
        piiiikalover: 'aortega',
        pidovelover: 'aortega',
        aortega: function(target, room, user) {
                        if(!this.canBroadcast()) return;
                        this.sendReplyBox('<center>Trainer:<font color="#3B2692"><b>AOrtega</b></font><br />' +
                                          '<center>Types: Fighting(UU E4)<br />' +
                                          '<center>Signature Pokemon:<font color="#9C029C"><b>piiiikachuuu</b></font><br />' +
                                          '<center>252+ SpA Machamp Focus Blast vs. 4 HP / 0 SpD Piiiikachuuu: 238-282 (112.2 - 133%) -- guaranteed OHKO<br />' +
                                          '<center><img src="http://www.smogon.com/download/sprites/bwmini/25.gif">');
        },
        
	league: 'leagueintro',
	leagueintro: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('Welcome to the Amethyst League! To challenge the OU Champion, you must win 8 badges and beat the Elite 4. <br>View the list of OU Gym Leaders using /ougl. ood luck!');
	},

	ougymleaders: 'ouleaders',
	ougl: 'ouleaders',
	ouleaders: function(target, room, user) {
		if(!this.canBroadcast()) return;
		this.sendReplyBox('A list of the active Amethyst OU leaders can be found <a href ="http://pastebin.com/4Vq73sst" target = _blank>here</a>, <a href="http://pastebin.com/9xKgfMzn" target = _blank>here</a>, or <a href = "http://amethystforums.xiaotai.org/showthread.php?tid=7" target = _blank>here</a>.');
	},

	uugymleaders: 'uuleaders',
	uugl: 'uuleaders',
	uuleaders: function(target, room, user) {
		if(!this.canBroadcast()) return;
		this.sendReplyBox('A list of the active Amethyst UU leaders can be found <a href = "http://pastebin.com/2EwGFFEW" target = _blank>here</a> or <a href ="http://amethystforums.xiaotai.org/showthread.php?tid=12&pid=18#pid18" target = _blank>here</a>.');
	},

	rugymleaders: 'ruleaders',
	rugl: 'ruleaders',
	ruleaders: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('A list of the active Amethyst RU leaders can be found <a href = "http://pastebin.com/VM3bJLL6" target = _blank>here</a> and <a href="http://amethystserver.freeforums.net/thread/65/ru-gls-e4s">here</a>.');
	},

	nugymleaders: 'nuleaders',
	nugl: 'nuleaders',
	nuleaders: function(target, room, user) {
   		if (!this.canBroadcast()) return;
		this.sendReplyBox('A list of the active Amethyst NU leaders can be found <a href = "http://pastebin.com/WwAmXACt" target = _blank>here</a>. RIP NU League.');
	},

	cry: 'complain',
	bitch: 'complain',
	complaint: 'complain',
	complain: function(target, room, user) {
		if(!target) return this.parse('/help complaint');
		this.sendReplyBox('Thanks for your input. We\'ll review your feedback soon. The complaint you submitted was: ' + target);
		this.logComplaint(target);
	},

	nature: 'n',
	n: function(target, room, user) {
		if (!this.canBroadcast()) return;
		target = target.toLowerCase();
		target = target.trim();
		var matched = false;
		if (target === 'hardy') {
			matched = true;
			this.sendReplyBox('<b>Hardy</b>: <font color="blue"><b>Neutral</b></font>');
		}
		if (target === 'lonely' || target ==='+atk -def') {
			matched = true;
			this.sendReplyBox('<b>Lonely</b>: <font color="green"><b>Attack</b></font>, <font color="red"><b>Defense</b></font>');
		}
		if (target === 'brave' || target ==='+atk -spe') {
			matched = true;
			this.sendReplyBox('<b>Brave</b>: <font color="green"><b>Attack</b></font>, <font color="red"><b>Speed</b></font>');
		}
		if (target === 'adamant' || target === '+atk -spa') {
			matched = true;
			this.sendReplyBox('<b>Adamant</b>: <font color="green"><b>Attack</b></font>, <font color="red"><b>Special Attack</b></font>');
		}
		if (target === 'naughty' || target ==='+atk -spd') {
			matched = true;
			this.sendReplyBox('<b>Naughty</b>: <font color="green"><b>Attack</b></font>, <font color="red"><b>Special Defense</b></font>');
		}
		if (target === 'bold' || target ==='+def -atk') {
			matched = true;
			this.sendReplyBox('<b>Bold</b>: <font color="green"><b>Defense</b></font>, <font color="red"><b>Attack</b></font>');
		}
		if (target === 'docile') {
			matched = true;
			this.sendReplyBox('<b>Docile</b>: <font color="blue"><b>Neutral</b></font>');
		}
		if (target === 'relaxed' || target ==='+def -spe') {
			matched = true;
			this.sendReplyBox('<b>Relaxed</b>: <font color="green"><b>Defense</b></font>, <font color="red"><b>Speed</b></font>');
		}
		if (target === 'impish' || target ==='+def -spa') {
			matched = true;
			this.sendReplyBox('<b>Impish</b>: <font color="green"><b>Defense</b></font>, <font color="red"><b>Special Attack</b></font>');
		}
		if (target === 'lax' || target ==='+def -spd') {
			matched = true;
			this.sendReplyBox('<b>Lax</b>: <font color="green"><b>Defense</b></font>, <font color="red"><b>Special Defense</b></font>');
		}
		if (target === 'timid' || target ==='+spe -atk') {
			matched = true;
			this.sendReplyBox('<b>Timid</b>: <font color="green"><b>Speed</b></font>, <font color="red"><b>Attack</b></font>');
		}
		if (target ==='hasty' || target ==='+spe -def') {
			matched = true;
			this.sendReplyBox('<b>Hasty</b>: <font color="green"><b>Speed</b></font>, <font color="red"><b>Defense</b></font>');
		}
		if (target ==='serious') {
			matched = true;
			this.sendReplyBox('<b>Serious</b>: <font color="blue"><b>Neutral</b></font>');
		}
		if (target ==='jolly' || target ==='+spe -spa') {
			matched= true;
			this.sendReplyBox('<b>Jolly</b>: <font color="green"><b>Speed</b></font>, <font color="red"><b>Special Attack</b></font>');
		}
		if (target==='naive' || target ==='+spe -spd') {
			matched = true;
			this.sendReplyBox('<b>Naïve</b>: <font color="green"><b>Speed</b></font>, <font color="red"><b>Special Defense</b></font>');
		}
		if (target==='modest' || target ==='+spa -atk') {
			matched = true;
			this.sendReplyBox('<b>Modest</b>: <font color="green"><b>Special Attack</b></font>, <font color="red"><b>Attack</b></font>');
		}
		if (target==='mild' || target ==='+spa -def') {
			matched = true;
			this.sendReplyBox('<b>Mild</b>: <font color="green"><b>Special Attack</b></font>, <font color="red"><b>Defense</b></font>');
		}
		if (target==='quiet' || target ==='+spa -spe') {
			matched = true;
			this.sendReplyBox('<b>Quiet</b>: <font color="green"><b>Special Attack</b></font>, <font color="red"><b>Speed</b></font>');
		}
		if (target==='bashful') {
			matched = true;
			this.sendReplyBox('<b>Bashful</b>: <font color="blue"><b>Neutral</b></font>');
		}
		if (target ==='rash' || target === '+spa -spd') {
			matched = true;
			this.sendReplyBox('<b>Rash</b>: <font color="green"><b>Special Attack</b></font>, <font color="red"><b>Special Defense</b></font>');
		}
		if (target==='calm' || target ==='+spd -atk') {
			matched = true;
			this.sendReplyBox('<b>Calm</b>: <font color="green"><b>Special Defense</b></font>, <font color="red"><b>Attack</b></font>');
		}
		if (target==='gentle' || target ==='+spd -def') {
			matched = true;
			this.sendReplyBox('<b>Gentle</b>: <font color="green"><b>Special Defense</b></font>, <font color="red"><b>Defense</b></font>');
		}
		if (target==='sassy' || target ==='+spd -spe') {
			matched = true;
			this.sendReplyBox('<b>Sassy</b>: <font color="green"><b>Special Defense</b></font>, <font color="red"><b>Speed</b></font>');
		}
		if (target==='careful' || target ==='+spd -spa') {
			matched = true;
			this.sendReplyBox('<b>Careful<b/>: <font color="green"><b>Special Defense</b></font>, <font color="red"><b>Special Attack</b></font>');
		}
		if (target==='quirky') {
			matched = true;
			this.sendReplyBox('<b>Quirky</b>: <font color="blue"><b>Neutral</b></font>');
		}
		if (target === 'plus attack' || target === '+atk') {
			matched = true;
			this.sendReplyBox("<b>+ Attack Natures: Lonely, Adamant, Naughty, Brave</b>");
		}
		if (target=== 'plus defense' || target === '+def') {
			matched = true;
			this.sendReplyBox("<b>+ Defense Natures: Bold, Impish, Lax, Relaxed</b>");
		}
		if (target === 'plus special attack' || target === '+spa') {
			matched = true;
			this.sendReplyBox("<b>+ Special Attack Natures: Modest, Mild, Rash, Quiet</b>");
		}
		if (target === 'plus special defense' || target === '+spd') {
			matched = true;
			this.sendReplyBox("<b>+ Special Defense Natures: Calm, Gentle, Careful, Sassy</b>");
		}
		if (target === 'plus speed' || target === '+spe') {
			matched = true;
			this.sendReplyBox("<b>+ Speed Natures: Timid, Hasty, Jolly, Naïve</b>");
		}
		if (target === 'minus attack' || target==='-atk') {
			matched = true;
			this.sendReplyBox("<b>- Attack Natures: Bold, Modest, Calm, Timid</b>");
		}
		if (target === 'minus defense' || target === '-def') {
			matched = true;
			this.sendReplyBox("<b>-Defense Natures: Lonely, Mild, Gentle, Hasty</b>");
		}
		if (target === 'minus special attack' || target === '-spa') {
			matched = true;
			this.sendReplyBox("<b>-Special Attack Natures: Adamant, Impish, Careful, Jolly</b>");
		}
		if (target ==='minus special defense' || target === '-spd') {
			matched = true;
			this.sendReplyBox("<b>-Special Defense Natures: Naughty, Lax, Rash, Naïve</b>");
		}
		if (target === 'minus speed' || target === '-spe') {
			matched = true;
			this.sendReplyBox("<b>-Speed Natures: Brave, Relaxed, Quiet, Sassy</b>");
		}
		if (!target) {
			matched = true;
			this.sendReply('/nature [nature] OR /nature [+increase -decrease] - tells you the increase and decrease of that nature. If you find a bug, pm blizzardq.');
		}
		if (!matched) {
			this.sendReply('Nature "'+target+'" not found. Check your spelling?');
		}
	},

	mizu: function (target, room, user) {
		if (user.userid != 'mizukurage') {
			return this.sendReply('Nope.');
		}
		delete Users.users.mizud;
		user.forceRename('Mizu :D', user.authenticated);
	},

	ai: function(target, room, user) {
		if (user.userid != 'aikenk') {
			return this.sendReply("Nope.");
		}
		delete Users.users.aikenk;
		user.forceRename('Aikenkα', user.authenticated);
	},

	cot: 'clashoftiers',
	clashoftiers: function(target, room, user) {
		if(!this.canBroadcast()) return;
		this.sendReplyBox('<font size = 3><b>Clash of Tiers</b></font><br><font size = 2>by EnerG218</font><br>A metagame created by EnerG218, Clash of Tiers is a metagame focused on comparing the different tiers. Each player is given 6 points to make a team with. Points are spent based on tier: Ubers are worth 6, OU and Limbo are worth 5, UU is worth 4, RU is worth 3, NU is worth 2, and LC is worth 1.<br>Have fun!');
	},


	afk: function(target, room, user) {
		if (!this.can('warn') && user.userid != 'blizzardq') return false;
		if (user.afk === true) {
			return this.sendReply("You are already Away.");
		}
		user.originalname = user.name;
		if (target.length > 0) {
			this.add('|html|<font color="purple"><b>'+user.name+'</b></font> is now Away ('+escapeHTML(target)+').');
		} else {
			this.add('|html|<font color="purple"><b>'+user.name+'</b></font> is now Away.');
		}
		user.forceRename(user.name+' - Away', user.authenticated);
		user.afk = true;
		return this.parse('/away');
	},

	unafk: function(target, room, user) {
		if (!this.can('warn') && user.userid != 'blizzardqaway') return false;
		if (user.afk != true) {
			return this.sendReply("You need to be Away first.");
		}
		user.forceRename(user.originalname, user.authenticated);
		this.add("|html|<font color='purple'><b>"+user.name+"</b></font> is no longer Away.");
		user.afk = false;
		return this.parse('/back');
	},

	mixedtier: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('<font size = 3><b>Mixed Tier</b></font><br><font size = 2>by Colonial Mustang</font><br>A metagame created by Colonial Mustang, Mixed Tier is a tier in which players must use one Pokemon from each of the following tiers: Uber, OU, UU, RU, NU, and LC.<br>Have fun!');
	},

	ktm: 'mail',
	mail: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('<font size=3><b>Kill the Mailman</b></font><br><font size = 2>by platinumCheesecake</font><br>A list of the rules for Kill the Mailman can be found <a href="http://amethystserver.freeforums.net/thread/77/mailman-tier">here</a>.<br />Contact piiiikachuuu with any problems.');
	},

	sketch: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('<font size=3><b>Sketchmons</b></font><br><font size=2>By Orivexes</font><br>This metagame is simple: Every Pokemon learns Sketch once. Good luck.');
	},
	poof: 'd',
	flee: 'd',
	d: function(target, room, user){
		if(room.id !== 'lobby') return false;
		muted = Object.keys(user.mutedRooms);
		for (var u in muted) if (muted[u] == 'lobby') return this.sendReply('You can\'t poof while muted');
		var btags = '<strong><font color='+hashColor(Math.random().toString())+'" >';
		var etags = '</font></strong>'
		var targetid = toUserid(user);

		if(target){
			var tar = toUserid(target);
			var targetUser = Users.get(tar);
				if(user.can('poof', targetUser)){
					if(!targetUser){
						this.sendReply('Cannot find user ' + target + '.');
					}else{
						if(poofeh)
							Rooms.rooms.lobby.addRaw(btags + '~~ '+targetUser.name+' was vanished into nothingness by ' + user.name +'! ~~' + etags);
							targetUser.disconnectAll();
							return	this.logModCommand(targetUser.name+ ' was poofed by ' + user.name);
					}
				} else {
					return this.sendReply('/poof target - Access denied.');
				}
			}
		if(poofeh && !user.locked){
			Rooms.rooms.lobby.addRaw(btags + getRandMessage(user)+ etags);
			user.disconnectAll();
		} else {
			return this.sendReply('poof is currently disabled.');
		}
	},

	poofoff: 'nopoof',
	nopoof: function(target, room, user){
		if(!user.can('warn'))
			return this.sendReply('/nopoof - Access denied.');
		if(!poofeh)
			return this.sendReply('poof is currently disabled.');
		poofeh = false;
		this.logModCommand(user.name + ' disabled poof.');
		return this.sendReply('poof is now disabled.');
	},

	poofon: function(target, room, user){
		if(!user.can('warn'))
			return this.sendReply('/poofon - Access denied.');
		if(poofeh)
			return this.sendReply('poof is currently enabled.');
		poofeh = true;
		this.logModCommand(user.name + ' enabled poof');
		return this.sendReply('poof is now enabled.');
	},

	cpoof: function(target, room, user){
		if(!user.can('broadcast')) return this.sendReply('/cpoof - Access Denied');
		if (!target) return this.sendReply('Usage: /cpoof [message]');
		if (user.locked) return this.sendReply('You can\'t poof while locked.');
		muted = Object.keys(user.mutedRooms);
		for (var u in muted) if (muted[u] == 'lobby') return this.sendReply('You can\'t poof while muted');

		if(poofeh) {
			var btags = '<strong><font color="'+hashColor(Math.random().toString())+'" >';
			var etags = '</font></strong>'
			target = escapeHTML(target);
			Rooms.rooms.lobby.addRaw(btags + '~~ '+escapeHTML(user.name)+' '+target+'! ~~' + etags);
			this.logModCommand(user.name + ' used a custom poof message: \n "'+target+'"');
			user.disconnectAll();
		}else{
			return this.sendReply('Poof is currently disabled.');
		}
	},

	tell: function(target, room, user) {
		if (user.locked) return this.sendReply('You cannot use this command while locked.');
		if (user.forceRenamed) return this.sendReply('You cannot use this command while under a name that you have been forcerenamed to.');
		if (!target) return this.parse('/help tell');
		if (target.length > 268) return this.sendReply('Your message must be less than 250 characters long.');
		var targets = target.split(',');
		if (!targets[1]) return this.parse('/help tell');
		var targetUser = toId(targets[0]);

		if (targetUser.length > 18) {
			return this.sendReply('The name of user "' + this.targetUsername + '" is too long.');
		}

		if (!tells[targetUser]) tells[targetUser] = [];
		if (tells[targetUser].length === 5) return this.sendReply('User ' + targetUser + ' has too many tells queued.');

		var date = Date();
		var message = '|raw|' + date.substring(0, date.indexOf('GMT') - 1) + ' - <b>' + user.getIdentity() + '</b> said: ' + escapeHTML(targets[1].trim());
		tells[targetUser].add(message);

		return this.sendReply('Message "' + targets[1].trim() + '" sent to ' + targetUser + '.');
	},

	/*********************************************************
	 * Main commands
	 *********************************************************/
	version: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('Server version: <b>'+CommandParser.package.version+'</b> <small>(<a href="http://pokemonshowdown.com/versions#' + CommandParser.serverVersion + '">' + CommandParser.serverVersion.substr(0,10) + '</a>)</small>');
	},

	me: function(target, room, user, connection) {
		// By default, /me allows a blank message
		if (target) target = this.canTalk(target);
		if (!target) return;

		var message = '/me ' + target;
		// if user is not in spamroom
		if (spamroom[user.userid] === undefined) {
			// check to see if an alt exists in list
			for (var u in spamroom) {
				if (Users.get(user.userid) === Users.get(u)) {
					// if alt exists, add new user id to spamroom, break out of loop.
					spamroom[user.userid] = true;
					break;
				}
			}
		}

		if (user.userid in spamroom) {
			this.sendReply('|c|' + user.getIdentity() + '|' + message);
			return Rooms.rooms['spamroom'].add('|c|' + user.getIdentity() + '|' + message);
		} else {
			return message;
		}
	},

	mee: function(target, room, user, connection) {
		// By default, /mee allows a blank message
		if (target) target = this.canTalk(target);
		if (!target) return;

		var message = '/mee ' + target;
		// if user is not in spamroom
		if (spamroom[user.userid] === undefined) {
			// check to see if an alt exists in list
			for (var u in spamroom) {
				if (Users.get(user.userid) === Users.get(u)) {
					// if alt exists, add new user id to spamroom, break out of loop.
					spamroom[user.userid] = true;
					break;
				}
			}
		}

		if (user.userid in spamroom) {
			this.sendReply('|c|' + user.getIdentity() + '|' + message);
			return Rooms.rooms['spamroom'].add('|c|' + user.getIdentity() + '|' + message);
		} else {
			return message;
		}
	},

	avatar: function(target, room, user) {
		if (!target) return this.parse('/avatars');
		var parts = target.split(',');
		var avatar = parseInt(parts[0]);
		if (!avatar || avatar > 294 || avatar < 1) {
			if (!parts[1]) {
				this.sendReply("Invalid avatar.");
			}
			return false;
		}

		user.avatar = avatar;
		if (!parts[1]) {
			this.sendReply("Avatar changed to:\n" +
					'|raw|<img src="//play.pokemonshowdown.com/sprites/trainers/'+avatar+'.png" alt="" width="80" height="80" />');
		}
	},

	logout: function(target, room, user) {
		user.resetName();
	},

	r: 'reply',
	reply: function(target, room, user) {
		if (!target) return this.parse('/help reply');
		if (!user.lastPM) {
			return this.sendReply('No one has PMed you yet.');
		}
		return this.parse('/msg '+(user.lastPM||'')+', '+target);
	},

	pm: 'msg',
	w: 'msg',
	whisper: 'msg',
	msg: function(target, room, user) {
		if (!target) return this.parse('/help msg');
		target = this.splitTarget(target);
		var targetUser = this.targetUser;
		if (!target) {
			this.sendReply('You forgot the comma.');
			return this.parse('/help msg');
		}
		if (!targetUser || !targetUser.connected) {
			if (targetUser && !targetUser.connected) {
				this.popupReply('User '+this.targetUsername+' is offline.');
			} else if (!target) {
				this.popupReply('User '+this.targetUsername+' not found. Did you forget a comma?');
			} else {
				this.popupReply('User '+this.targetUsername+' not found. Did you misspell their name?');
			}
			return this.parse('/help msg');
		}

		if (target.indexOf('invite') != -1 && target.indexOf('spamroom') != -1) {
			return user.sendTo('lobby', '|popup|You cannot invite people there.');
		}

		if (config.pmmodchat) {
			var userGroup = user.group;
			if (config.groupsranking.indexOf(userGroup) < config.groupsranking.indexOf(config.pmmodchat)) {
				var groupName = config.groups[config.pmmodchat].name;
				if (!groupName) groupName = config.pmmodchat;
				this.popupReply('Because moderated chat is set, you must be of rank ' + groupName +' or higher to PM users.');
				return false;
			}
		}

		if (user.locked && !targetUser.can('lock', user)) {
			return this.popupReply('You can only private message members of the moderation team (users marked by %, @, &, or ~) when locked.');
		}
		if (targetUser.locked && !user.can('lock', targetUser)) {
			return this.popupReply('This user is locked and cannot PM.');
		}
		if (targetUser.ignorePMs && !user.can('lock')) {
			if (!targetUser.can('lock')) {
				return this.popupReply('This user is blocking Private Messages right now.');
			} else if (targetUser.can('hotpatch')) {
				return this.popupReply('This admin is too busy to answer Private Messages right now. Please contact a different staff member.');
			}
		}

		target = this.canTalk(target, null);
		if (!target) return false;

		var message = '|pm|'+user.getIdentity()+'|'+targetUser.getIdentity()+'|'+target;
		user.send(message);
		// if user is not in spamroom
		if(spamroom[user.userid] === undefined){
			// check to see if an alt exists in list
			for(var u in spamroom){
				if(Users.get(user.userid) === Users.get(u)){
					// if alt exists, add new user id to spamroom, break out of loop.
					spamroom[user.userid] = true;
					break;
				}
			}
		}

		if (user.userid in spamroom) {
			Rooms.rooms.spamroom.add('|c|' + user.getIdentity() + '|(__Private to ' + targetUser.getIdentity()+ "__) " + target );
		} else {
			if (targetUser !== user) targetUser.send(message);
			targetUser.lastPM = user.userid;
		}
		user.lastPM = targetUser.userid;
	},

	blockpm: 'ignorepms',
	blockpms: 'ignorepms',
	ignorepm: 'ignorepms',
	ignorepms: function(target, room, user) {
		if (user.ignorePMs) return this.sendReply('You are already blocking Private Messages!');
		if (user.can('lock') && !user.can('hotpatch')) return this.sendReply('You are not allowed to block Private Messages.');
		user.ignorePMs = true;
		return this.sendReply('You are now blocking Private Messages.');
	},

	unblockpm: 'unignorepms',
	unblockpms: 'unignorepms',
	unignorepm: 'unignorepms',
	unignorepms: function(target, room, user) {
		if (!user.ignorePMs) return this.sendReply('You are not blocking Private Messages!');
		user.ignorePMs = false;
		return this.sendReply('You are no longer blocking Private Messages.');
	},

	makechatroom: function(target, room, user) {
		if (!this.can('makeroom')) return;
		var id = toId(target);
		if (!id) return this.parse('/help makechatroom');
		if (Rooms.rooms[id]) {
			return this.sendReply("The room '"+target+"' already exists.");
		}
		if (Rooms.global.addChatRoom(target)) {
			tour.reset(id);
			hangman.reset(id);
			return this.sendReply("The room '"+target+"' was created.");
		}
		return this.sendReply("An error occurred while trying to create the room '"+target+"'.");
	},

	deregisterchatroom: function(target, room, user) {
		if (!this.can('makeroom')) return;
		var id = toId(target);
		if (!id) return this.parse('/help deregisterchatroom');
		var targetRoom = Rooms.get(id);
		if (!targetRoom) return this.sendReply("The room '"+id+"' doesn't exist.");
		target = targetRoom.title || targetRoom.id;
		if (Rooms.global.deregisterChatRoom(id)) {
			this.sendReply("The room '"+target+"' was deregistered.");
			this.sendReply("It will be deleted as of the next server restart.");
			return;
		}
		return this.sendReply("The room '"+target+"' isn't registered.");
	},

	privateroom: function(target, room, user) {
		if (!this.can('privateroom', null, room)) return;
		if (target === 'off') {
			delete room.isPrivate;
			this.addModCommand(user.name+' made this room public.');
			if (room.chatRoomData) {
				delete room.chatRoomData.isPrivate;
				Rooms.global.writeChatRoomData();
			}
		} else {
			room.isPrivate = true;
			this.addModCommand(user.name+' made this room private.');
			if (room.chatRoomData) {
				room.chatRoomData.isPrivate = true;
				Rooms.global.writeChatRoomData();
			}
		}
	},

	officialchatroom: 'officialroom',
	officialroom: function(target, room, user) {
		if (!this.can('makeroom')) return;
		if (!room.chatRoomData) {
			return this.sendReply("/officialroom - This room can't be made official");
		}
		if (target === 'off') {
			delete room.isOfficial;
			this.addModCommand(user.name+' made this chat room unofficial.');
			delete room.chatRoomData.isOfficial;
			Rooms.global.writeChatRoomData();
		} else {
			room.isOfficial = true;
			this.addModCommand(user.name+' made this chat room official.');
			room.chatRoomData.isOfficial = true;
			Rooms.global.writeChatRoomData();
		}
	},

	roomowner: function(target, room, user) {
		if (!room.chatRoomData) {
			return this.sendReply("/roomowner - This room isn't designed for per-room moderation to be added");
		}
		var target = this.splitTarget(target, true);
		var targetUser = this.targetUser;

		if (!targetUser) return this.sendReply("User '"+this.targetUsername+"' is not online.");

		if (!this.can('makeroom', targetUser, room)) return false;

		if (!room.auth) room.auth = room.chatRoomData.auth = {};

		var name = targetUser.name;

		room.auth[targetUser.userid] = '#';
		this.addModCommand(''+name+' was appointed Room Owner by '+user.name+'.');
		room.onUpdateIdentity(targetUser);
		Rooms.global.writeChatRoomData();
	},

	roomdeowner: 'deroomowner',
	deroomowner: function(target, room, user) {
		if (!room.auth) {
			return this.sendReply("/roomdeowner - This room isn't designed for per-room moderation");
		}
		var target = this.splitTarget(target, true);
		var targetUser = this.targetUser;
		var name = this.targetUsername;
		var userid = toId(name);
		if (!userid || userid === '') return this.sendReply("User '"+name+"' does not exist.");

		if (room.auth[userid] !== '#') return this.sendReply("User '"+name+"' is not a room owner.");
		if (!this.can('makeroom', null, room)) return false;

		delete room.auth[userid];
		this.sendReply('('+name+' is no longer Room Owner.)');
		if (targetUser) targetUser.updateIdentity();
		if (room.chatRoomData) {
			Rooms.global.writeChatRoomData();
		}
	},

	roomdesc: function(target, room, user) {
		if (!target) {
			if (!this.canBroadcast()) return;
			var re = /(https?:\/\/(([-\w\.]+)+(:\d+)?(\/([\w/_\.]*(\?\S+)?)?)?))/g;
			if (!room.desc) return this.sendReply("This room does not have a description set.");
			this.sendReplyBox('The room description is: '+room.desc.replace(re, "<a href=\"$1\">$1</a>"));
			return;
		}
		if (!this.can('roommod', null, room)) return false;
		if (target.length > 80) {
			return this.sendReply('Error: Room description is too long (must be at most 80 characters).');
		}

		room.desc = target;
		this.sendReply('(The room description is now: '+target+')');

		if (room.chatRoomData) {
			room.chatRoomData.desc = room.desc;
			Rooms.global.writeChatRoomData();
		}
	},

	roomdemote: 'roompromote',
	roompromote: function(target, room, user, connection, cmd) {
		if (!room.auth) {
			this.sendReply("/roompromote - This room isn't designed for per-room moderation");
			return this.sendReply("Before setting room mods, you need to set it up with /roomowner");
		}
		if (!target) return this.parse('/help roompromote');

		var target = this.splitTarget(target, true);
		var targetUser = this.targetUser;
		var userid = toUserid(this.targetUsername);
		var name = targetUser ? targetUser.name : this.targetUsername;

		if (!userid) {
			if (target && config.groups[target]) {
				var groupid = config.groups[target].id;
				return this.sendReply("/room"+groupid+" [username] - Promote a user to "+groupid+" in this room only");
			}
			return this.parse("/help roompromote");
		}
		var currentGroup = (room.auth[userid] || ' ');
		if (!targetUser && !room.auth[userid]) {
			return this.sendReply("User '"+this.targetUsername+"' is offline and unauthed, and so can't be promoted.");
		}

		var nextGroup = target || Users.getNextGroupSymbol(currentGroup, cmd === 'roomdemote', true);
		if (target === 'deauth') nextGroup = config.groupsranking[0];
		if (!config.groups[nextGroup]) {
			return this.sendReply('Group \'' + nextGroup + '\' does not exist.');
		}
		if (config.groups[nextGroup].globalonly) {
			return this.sendReply('Group \'room' + config.groups[nextGroup].id + '\' does not exist as a room rank.');
		}
		if (currentGroup !== ' ' && !user.can('room'+config.groups[currentGroup].id, null, room)) {
			return this.sendReply('/' + cmd + ' - Access denied for promoting from '+config.groups[currentGroup].name+'.');
		}
		if (nextGroup !== ' ' && !user.can('room'+config.groups[nextGroup].id, null, room)) {
			return this.sendReply('/' + cmd + ' - Access denied for promoting to '+config.groups[nextGroup].name+'.');
		}
		if (currentGroup === nextGroup) {
			return this.sendReply("User '"+this.targetUsername+"' is already a "+(config.groups[nextGroup].name || 'regular user')+" in this room.");
		}
		if (config.groups[nextGroup].globalonly) {
			return this.sendReply("The rank of "+config.groups[nextGroup].name+" is global-only and can't be room-promoted to.");
		}

		var isDemotion = (config.groups[nextGroup].rank < config.groups[currentGroup].rank);
		var groupName = (config.groups[nextGroup].name || nextGroup || '').trim() || 'a regular user';

		if (nextGroup === ' ') {
			delete room.auth[userid];
		} else {
			room.auth[userid] = nextGroup;
		}

		if (isDemotion) {
			this.privateModCommand('('+name+' was appointed to Room ' + groupName + ' by '+user.name+'.)');
			if (targetUser) {
				targetUser.popup('You were appointed to Room ' + groupName + ' by ' + user.name + '.');
			}
		} else {
			this.addModCommand(''+name+' was appointed to Room ' + groupName + ' by '+user.name+'.');
		}
		if (targetUser) {
			targetUser.updateIdentity();
		}
		if (room.chatRoomData) {
			Rooms.global.writeChatRoomData();
		}
	},

	autojoin: function(target, room, user, connection) {
		Rooms.global.autojoinRooms(user, connection);
	},

	join: function(target, room, user, connection) {
		if (!target) return false;
		var targetRoom = Rooms.get(target) || Rooms.get(toId(target));
		if (!targetRoom) {
			if (target === 'lobby') return connection.sendTo(target, "|noinit|nonexistent|");
			return connection.sendTo(target, "|noinit|nonexistent|The room '"+target+"' does not exist.");
		}
		if (targetRoom.isPrivate && !user.named) {
			return connection.sendTo(target, "|noinit|namerequired|You must have a name in order to join the room '"+target+"'.");
		}
		if (!user.joinRoom(targetRoom || room, connection)) {
			return connection.sendTo(target, "|noinit|joinfailed|The room '"+target+"' could not be joined.");
		}
		if (target.toLowerCase() == "nobland" && !user.nobland) {
			user.nobland = true;
			return connection.sendTo(target,'|noinit|joinfailed|WARNING: Adult content may be found in this room, join at your own risk.');
		}
		if (target.toLowerCase() == "sairasvan" && !user.saira) {
			user.saira = true;
			return connection.sendTo(target,'|noinit|joinfailed|WARNING: Adult content may be found in this room, join at your own risk.');
		}
		if (target.toLowerCase() == "pidovetrainingcenter" && !user.pidove) {
			user.pidove = true;
			return connection.sendTo(target,'|noinit|joinfailed|WARNING: Adult content may be found in this room, join at your own risk.');
		}
		if (targetRoom.id === "spamroom" && !user.can('declare')) {
			return connection.sendTo(target, "|noinit|joinfailed|You cannot join this room.");
		}
	},

	rb: 'roomban',
	roomban: function(target, room, user, connection) {
		if (!target) return this.parse('/help roomban');
		target = this.splitTarget(target, true);
		var targetUser = this.targetUser;
		var name = this.targetUsername;
		var userid = toId(name);
		if (!userid || !targetUser) return this.sendReply("User '" + name + "' does not exist.");
		if (!this.can('ban', targetUser, room)) return false;
		if (!Rooms.rooms[room.id].users[userid] && room.isPrivate) {
			return this.sendReply('User ' + this.targetUsername + ' is not in the room ' + room.id + '.');
		}
		if (!room.bannedUsers || !room.bannedIps) {
			return this.sendReply('Room bans are not meant to be used in room ' + room.id + '.');
		}
		room.bannedUsers[userid] = true;
		for (var ip in targetUser.ips) {
			room.bannedIps[ip] = true;
		}
		targetUser.popup(user.name+" has banned you from the room " + room.id + ". To appeal the ban, PM the moderator that banned you or a room owner." + (target ? " (" + target + ")" : ""));
		this.addModCommand(""+targetUser.name+" was banned from room " + room.id + " by "+user.name+"." + (target ? " (" + target + ")" : ""));
		var alts = targetUser.getAlts();
		if (alts.length) {
			this.addModCommand(""+targetUser.name+"'s alts were also banned from room " + room.id + ": "+alts.join(", "));
			for (var i = 0; i < alts.length; ++i) {
				var altId = toId(alts[i]);
				this.add('|unlink|' + altId);
				room.bannedUsers[altId] = true;
			}
		}
		this.add('|unlink|' + targetUser.userid);
		targetUser.leaveRoom(room.id);
	},

	roomunban: function(target, room, user, connection) {
		if (!target) return this.parse('/help roomunban');
		target = this.splitTarget(target, true);
		var targetUser = this.targetUser;
		var name = this.targetUsername;
		var userid = toId(name);
		if (!userid || !targetUser) return this.sendReply("User '"+name+"' does not exist.");
		if (!this.can('ban', targetUser, room)) return false;
		if (!room.bannedUsers || !room.bannedIps) {
			return this.sendReply('Room bans are not meant to be used in room ' + room.id + '.');
		}
		if (room.bannedUsers[userid]) delete room.bannedUsers[userid];
		for (var ip in targetUser.ips) {
			if (room.bannedIps[ip]) delete room.bannedIps[ip];
		}
		targetUser.popup(user.name+" has unbanned you from the room " + room.id + ".");
		this.addModCommand(""+targetUser.name+" was unbanned from room " + room.id + " by "+user.name+".");
		var alts = targetUser.getAlts();
		if (alts.length) {
			this.addModCommand(""+targetUser.name+"'s alts were also unbanned from room " + room.id + ": "+alts.join(", "));
			for (var i = 0; i < alts.length; ++i) {
				var altId = toId(alts[i]);
				if (room.bannedUsers[altId]) delete room.bannedUsers[altId];
			}
		}
	},

	roomauth: function(target, room, user, connection) {
		if (!room.auth) return this.sendReply("/roomauth - This room isn't designed for per-room moderation and therefore has no auth list.");
		var buffer = [];
		for (var u in room.auth) {
			buffer.push(room.auth[u] + u);
		}
		if (buffer.length > 0) {
			buffer = buffer.join(', ');
		} else {
			buffer = 'This room has no auth.';
		}
		connection.popup(buffer);
	},

    stafflist: function(target, room, user, connection) {
        var buffer = [];
        var admins = [];
        var leaders = [];
        var mods = [];
        var drivers = [];
        var voices = [];

        admins2 = ''; leaders2 = ''; mods2 = ''; drivers2 = ''; voices2 = '';
        stafflist = fs.readFileSync('config/usergroups.csv','utf8');
        stafflist = stafflist.split('\n');
        for (var u in stafflist) {
            line = stafflist[u].split(',');
			if (line[1] == '~') {
                admins2 = admins2 +line[0]+',';
            }
            if (line[1] == '&') {
                leaders2 = leaders2 +line[0]+',';
            }
            if (line[1] == '@') {
                mods2 = mods2 +line[0]+',';
            }
            if (line[1] == '%') {
                drivers2 = drivers2 +line[0]+',';
            }
            if (line[1] == '+') {
                voices2 = voices2 +line[0]+',';
             }
        }
        admins2 = admins2.split(',');
        leaders2 = leaders2.split(',');
        mods2 = mods2.split(',');
        drivers2 = drivers2.split(',');
        voices2 = voices2.split(',');
        for (var u in admins2) {
            if (admins2[u] != '') admins.push(admins2[u]);
        }
        for (var u in leaders2) {
            if (leaders2[u] != '') leaders.push(leaders2[u]);
        }
        for (var u in mods2) {
            if (mods2[u] != '') mods.push(mods2[u]);
        }
        for (var u in drivers2) {
            if (drivers2[u] != '') drivers.push(drivers2[u]);
        }
        for (var u in voices2) {
            if (voices2[u] != '') voices.push(voices2[u]);
        }
        if (admins.length > 0) {
            admins = admins.join(', ');
        }
        if (leaders.length > 0) {
            leaders = leaders.join(', ');
        }
        if (mods.length > 0) {
            mods = mods.join(', ');
        }
        if (drivers.length > 0) {
            drivers = drivers.join(', ');
        }
        if (voices.length > 0) {
            voices = voices.join(', ');
        }
        connection.popup('Administrators: \n'+admins+'\nLeaders: \n'+leaders+'\nModerators: \n'+mods+'\nDrivers: \n'+drivers+'\nVoices: \n'+voices);
    },

	leave: 'part',
	part: function(target, room, user, connection) {
		if (room.id === 'global') return false;
		var targetRoom = Rooms.get(target);
		if (target && !targetRoom) {
			return this.sendReply("The room '"+target+"' does not exist.");
		}
		user.leaveRoom(targetRoom || room, connection);
	},

	/*********************************************************
	 * Moderating: Punishments
	 *********************************************************/

	spam: 'spamroom',
	spammer: 'spamroom',
	spamroom: function(target, room, user, connection) {
		if (!target) return this.sendReply('Please specify a user.');
		var target = this.splitTarget(target);
		var targetUser = this.targetUser;
		if (!targetUser || !targetUser.connected) {
			return this.sendReply('The user \'' + this.targetUsername + '\' does not exist.');
		}
		if (!this.can('mute', targetUser)) {
			return false;
		}
		if (targetUser.userid === 'piiiikachuuu') {
			return this.sendReply('Nope c:');
		}
		if (spamroom[targetUser]) {
			return this.sendReply('That user\'s messages are already being redirected to the spamroom.');
		}
		spamroom[targetUser] = true;
		Rooms.rooms['spamroom'].add('|raw|<b>' + this.targetUsername + ' was added to the spamroom list.</b>');
		this.privateModCommand('('+targetUser + ' was added to spamroom by ' + user.name+')');
		//return this.sendReply(this.targetUsername + ' was successfully added to the spamroom list.');
	},

	unspam: 'unspamroom',
	unspammer: 'unspamroom',
	unspamroom: function(target, room, user, connection) {
		var target = this.splitTarget(target);
		var targetUser = this.targetUser;
		if (!targetUser || !targetUser.connected) {
			return this.sendReply('The user \'' + this.targetUsername + '\' does not exist.');
		}
		if (!this.can('mute', targetUser)) {
			return false;
		}
		if (!spamroom[targetUser]) {
			return this.sendReply('That user is not in the spamroom list.');
		}
		for(var u in spamroom)
			if(targetUser == Users.get(u))
				delete spamroom[u];
		Rooms.rooms['spamroom'].add('|raw|<b>' + this.targetUsername + ' was removed from the spamroom list.</b>');
		this.privateModCommand('('+targetUser + ' was removed from spamroom by ' + user.name+')');
		//return this.sendReply(this.targetUsername + ' and their alts were successfully removed from the spamroom list.');
	},

	warn: function(target, room, user) {
		if (!target) return this.parse('/help warn');

		target = this.splitTarget(target);
		var targetUser = this.targetUser;
		if (!targetUser || !targetUser.connected) {
			return this.sendReply('User '+this.targetUsername+' not found.');
		}
		if ( room.auth) {
			return this.sendReply('You can\'t warn here: This is a unofficial room not subject to global rules.');
		}
		if (target.length > MAX_REASON_LENGTH) {
			return this.sendReply('The reason is too long. It cannot exceed ' + MAX_REASON_LENGTH + ' characters.');
		}
		if (!this.can('warn', targetUser, room)) return false;

		this.addModCommand(''+targetUser.name+' was warned by '+user.name+'.' + (target ? " (" + target + ")" : ""));
		targetUser.send('|c|~|/warn '+target);
		this.add('|unlink|' + targetUser.userid);
	},

	redirect: 'redir',
	redir: function (target, room, user, connection) {
		if (!target) return this.parse('/help redirect');
		target = this.splitTarget(target);
		var targetUser = this.targetUser;
		var targetRoom = Rooms.get(target) || Rooms.get(toId(target));
		if (!targetRoom) {
			return this.sendReply("The room '" + target + "' does not exist.");
		}
		if (!this.can('warn', targetUser, room) || !this.can('warn', targetUser, targetRoom)) return false;
		if (!targetUser || !targetUser.connected) {
			return this.sendReply('User '+this.targetUsername+' not found.');
		}
		if (Rooms.rooms[targetRoom.id].users[targetUser.userid]) {
			return this.sendReply("User " + targetUser.name + " is already in the room " + target + "!");
		}
		if (targetRoom.id === "spamroom") {
			return this.sendReply('You cannot redirect users here.');
		}
		if (!Rooms.rooms[room.id].users[targetUser.userid]) {
			return this.sendReply('User '+this.targetUsername+' is not in the room ' + room.id + '.');
		}
		if (targetUser.joinRoom(target) === false) return this.sendReply('User "' + targetUser.name + '" could not be joined to room ' + target + '. They could be banned from the room.');
		var roomName = (targetRoom.isPrivate)? 'a private room' : 'room ' + targetRoom.title;
		this.addModCommand(targetUser.name + ' was redirected to ' + roomName + ' by ' + user.name + '.');
		targetUser.leaveRoom(room);
	},

	m: 'mute',
	mute: function(target, room, user) {
		if (!target) return this.parse('/help mute');

		target = this.splitTarget(target);
		var targetUser = this.targetUser;
		if (!targetUser) {
			return this.sendReply('User '+this.targetUsername+' not found.');
		}
		if (target.length > MAX_REASON_LENGTH) {
			return this.sendReply('The reason is too long. It cannot exceed ' + MAX_REASON_LENGTH + ' characters.');
		}
		if (!this.can('mute', targetUser, room)) return false;
		if (targetUser.mutedRooms[room.id] || targetUser.locked || !targetUser.connected) {
			var problem = ' but was already '+(!targetUser.connected ? 'offline' : targetUser.locked ? 'locked' : 'muted');
			if (!target) {
				return this.privateModCommand('('+targetUser.name+' would be muted by '+user.name+problem+'.)');
			}
			return this.addModCommand(''+targetUser.name+' would be muted by '+user.name+problem+'.' + (target ? " (" + target + ")" : ""));
		}

		targetUser.popup(user.name+' has muted you for 7 minutes. '+target);
		this.addModCommand(''+targetUser.name+' was muted by '+user.name+' for 7 minutes.' + (target ? " (" + target + ")" : ""));
		var alts = targetUser.getAlts();
		if (alts.length) this.addModCommand(""+targetUser.name+"'s alts were also muted: "+alts.join(", "));
		this.add('|unlink|' + targetUser.userid);

		targetUser.mute(room.id, 7*60*1000);
	},

	hm: 'hourmute',
	hourmute: function(target, room, user) {
		if (!target) return this.parse('/help hourmute');

		target = this.splitTarget(target);
		var targetUser = this.targetUser;
		if (!targetUser) {
			return this.sendReply('User '+this.targetUsername+' not found.');
		}
		if (target.length > MAX_REASON_LENGTH) {
			return this.sendReply('The reason is too long. It cannot exceed ' + MAX_REASON_LENGTH + ' characters.');
		}
		if (!this.can('mute', targetUser, room)) return false;

		if (((targetUser.mutedRooms[room.id] && (targetUser.muteDuration[room.id]||0) >= 50*60*1000) || targetUser.locked) && !target) {
			var problem = ' but was already '+(!targetUser.connected ? 'offline' : targetUser.locked ? 'locked' : 'muted');
			return this.privateModCommand('('+targetUser.name+' would be muted by '+user.name+problem+'.)');
		}

		targetUser.popup(user.name+' has muted you for 60 minutes. '+target);
		this.addModCommand(''+targetUser.name+' was muted by '+user.name+' for 60 minutes.' + (target ? " (" + target + ")" : ""));
		var alts = targetUser.getAlts();
		if (alts.length) this.addModCommand(""+targetUser.name+"'s alts were also muted: "+alts.join(", "));
		this.add('|unlink|' + targetUser.userid);

		targetUser.mute(room.id, 60*60*1000, true);
	},

	um: 'unmute',
	unmute: function(target, room, user) {
		if (!target) return this.parse('/help unmute');
		var targetUser = Users.get(target);
		if (!targetUser) {
			return this.sendReply('User '+target+' not found.');
		}
		if (!this.can('mute', targetUser, room)) return false;

		if (!targetUser.mutedRooms[room.id]) {
			return this.sendReply(''+targetUser.name+' isn\'t muted.');
		}

		this.addModCommand(''+targetUser.name+' was unmuted by '+user.name+'.');

		targetUser.unmute(room.id);
	},

	l: 'lock',
	ipmute: 'lock',
	lock: function(target, room, user) {
		if (!target) return this.parse('/help lock');

		target = this.splitTarget(target);
		var targetUser = this.targetUser;
		if (!targetUser) {
			return this.sendReply('User '+this.targetUser+' not found.');
		}
		if (target.length > MAX_REASON_LENGTH) {
			return this.sendReply('The reason is too long. It cannot exceed ' + MAX_REASON_LENGTH + ' characters.');
		}
		if (!user.can('lock', targetUser)) {
			return this.sendReply('/lock - Access denied.');
		}

		if ((targetUser.locked || Users.checkBanned(targetUser.latestIp)) && !target) {
			var problem = ' but was already '+(targetUser.locked ? 'locked' : 'banned');
			return this.privateModCommand('('+targetUser.name+' would be locked by '+user.name+problem+'.)');
		}

		targetUser.popup(user.name+' has locked you from talking in chats, battles, and PMing regular users.\n\n'+target+'\n\nIf you feel that your lock was unjustified, you can still PM staff members (%, @, &, and ~) to discuss it.');

		this.addModCommand(""+targetUser.name+" was locked from talking by "+user.name+"." + (target ? " (" + target + ")" : ""));
		var alts = targetUser.getAlts();
		if (alts.length) this.addModCommand(""+targetUser.name+"'s alts were also locked: "+alts.join(", "));
		this.add('|unlink|' + targetUser.userid);

		targetUser.lock();
	},

	unlock: function(target, room, user) {
		if (!target) return this.parse('/help unlock');
		if (!this.can('lock')) return false;

		var unlocked = Users.unlock(target);

		if (unlocked) {
			var names = Object.keys(unlocked);
			this.addModCommand('' + names.join(', ') + ' ' +
					((names.length > 1) ? 'were' : 'was') +
					' unlocked by ' + user.name + '.');
		} else {
			this.sendReply('User '+target+' is not locked.');
		}
	},

	b: 'ban',
	bh: 'ban',
	ban: function(target, room, user, connection, cmd) {
		if (!target) return this.parse('/help ban');

		target = this.splitTarget(target);
		var targetUser = this.targetUser;
		if (!targetUser) {
			return this.sendReply('User '+this.targetUsername+' not found.');
		}
		if (target.length > MAX_REASON_LENGTH) {
			return this.sendReply('The reason is too long. It cannot exceed ' + MAX_REASON_LENGTH + ' characters.');
		}
		if (!this.can('ban', targetUser)) return false;

		if (Users.checkBanned(targetUser.latestIp) && !target && !targetUser.connected) {
			var problem = ' but was already banned';
			return this.privateModCommand('('+targetUser.name+' would be banned by '+user.name+problem+'.)');
		}

		targetUser.popup(user.name+" has banned you." + (config.appealurl ? ("  If you feel that your banning was unjustified you can appeal the ban:\n" + config.appealurl) : "") + "\n\n"+target);
		if (cmd === 'bh') {
			this.addModCommand(""+targetUser.name+" was hit by "+user.name+"'s Ban Hammer. " + (target ? " (" + target + ")" : ""), ' ('+targetUser.latestIp+')');
		}else{
			this.addModCommand(""+targetUser.name+" was banned by "+user.name+"." + (target ? " (" + target + ")" : ""), ' ('+targetUser.latestIp+')');
		}
		var alts = targetUser.getAlts();
		if (alts.length) {
			this.addModCommand(""+targetUser.name+"'s alts were also banned: "+alts.join(", "));
			for (var i = 0; i < alts.length; ++i) {
				this.add('|unlink|' + toId(alts[i]));
			}
		}

		this.add('|unlink|' + targetUser.userid);
		targetUser.ban();
	},

	unban: function(target, room, user) {
		if (!target) return this.parse('/help unban');
		if (!user.can('ban')) {
			return this.sendReply('/unban - Access denied.');
		}

		var name = Users.unban(target);

		if (name) {
			this.addModCommand(''+name+' was unbanned by '+user.name+'.');
		} else {
			this.sendReply('User '+target+' is not banned.');
		}
	},

	unbanall: function(target, room, user) {
		if (!user.can('ban')) {
			return this.sendReply('/unbanall - Access denied.');
		}
		// we have to do this the hard way since it's no longer a global
		for (var i in Users.bannedIps) {
			delete Users.bannedIps[i];
		}
		for (var i in Users.lockedIps) {
			delete Users.lockedIps[i];
		}
		this.addModCommand('All bans and locks have been lifted by '+user.name+'.');
	},

	pban: 'permaban',
	permban: 'permaban',
	permaban: function(target, room, user) {
		if (!target) return this.sendReply('/permaban [username] - Permanently bans the user from the server. Bans placed by this command do not reset when the server restarts.');
		if (!this.can('permaban', targetUser)) return this.sendReply('Access denied.');
		target = this.splitTarget(target);
		var targetUser = this.targetUser;
		if (!targetUser) {
			return this.sendReply('User '+this.targetUsername+' not found.');
		}
		if (Users.checkBanned(targetUser.latestIp) && !target && !targetUser.connected) {
			var problem = ' but was already banned';
			return this.privateModCommand('('+targetUser.name+' would be banned by '+user.name+problem+'.)');
		}
		var self = this;
		fs.appendFile('config/ipbans.txt','\n'+targetUser.latestIp, function(err) {
			if (err) {
				self.sendReply('Uh oh! An error has occurred!');
				console.log('/permaban crashed: '+err.stack);
				return false;
			}
			targetUser.popup(user.name+" has permanently banned you. " + (target ? " (" + target + ")" : ""));
			self.addModCommand(targetUser.name+" was permanently banned by "+user.name+"."+ (target ? " (" + target + ")" : ""), ' ('+targetUser.latestIp+')');
			targetUser.ban();
		});
	},

	unpermaban: function(target, room, user) {
		if (!target) return this.sendReply('/unpermaban [IP] - Removes a permanent ban.');
		if (!this.can('permaban')) return this.sendReply('Access denied.');
		var self = this;
		removeIpBan(target, function (found) {
			if (found) {
				self.privateModCommand('('+target+' was removed from the permanent ban list by '+user.name+'.)');
				return;
			} else {
				self.sendReply(target+' was not found on the permanent ban list.');
				return;
			}
		});
	},

	banip: function(target, room, user) {
		target = target.trim();
		if (!target) {
			return this.parse('/help banip');
		}
		if (!this.can('rangeban')) return false;

		Users.bannedIps[target] = '#ipban';
		this.addModCommand(user.name+' temporarily banned the '+(target.charAt(target.length-1)==='*'?'IP range':'IP')+': '+target);
	},

	unbanip: function(target, room, user) {
		target = target.trim();
		if (!target) {
			return this.parse('/help unbanip');
		}
		if (!this.can('rangeban')) return false;
		if (!Users.bannedIps[target]) {
			return this.sendReply(''+target+' is not a banned IP or IP range.');
		}
		delete Users.bannedIps[target];
		this.addModCommand(user.name+' unbanned the '+(target.charAt(target.length-1)==='*'?'IP range':'IP')+': '+target);
	},

	/*********************************************************
	 * Moderating: Other
	 *********************************************************/

	modnote: function(target, room, user, connection, cmd) {
		if (!target) return this.parse('/help note');
		if (target.length > MAX_REASON_LENGTH) {
			return this.sendReply('The note is too long. It cannot exceed ' + MAX_REASON_LENGTH + ' characters.');
		}
		if (!this.can('mute')) return false;
		return this.privateModCommand('(' + user.name + ' notes: ' + target + ')');
	},

	demote: 'promote',
	promote: function(target, room, user, connection, cmd) {
		if (!target) return this.parse('/help promote');
		var target = this.splitTarget(target, true);
		var targetUser = this.targetUser;
		var userid = toUserid(this.targetUsername);
		var name = targetUser ? targetUser.name : this.targetUsername;

		if (!userid) {
			if (target && config.groups[target]) {
				var groupid = config.groups[target].id;
				return this.sendReply("/"+groupid+" [username] - Promote a user to "+groupid+" globally");
			}
			return this.parse("/help promote");
		}

		var currentGroup = ' ';
		if (targetUser) {
			currentGroup = targetUser.group;
		} else if (Users.usergroups[userid]) {
			currentGroup = Users.usergroups[userid].substr(0,1);
		}

		var nextGroup = target ? target : Users.getNextGroupSymbol(currentGroup, cmd === 'demote', true);
		if (target === 'deauth') nextGroup = config.groupsranking[0];
		if (!config.groups[nextGroup]) {
			return this.sendReply('Group \'' + nextGroup + '\' does not exist.');
		}
		if (config.groups[nextGroup].roomonly) {
			return this.sendReply('Group \'' + config.groups[nextGroup].id + '\' does not exist as a global rank.');
		}
		if (!user.canPromote(currentGroup, nextGroup)) {
			return this.sendReply('/' + cmd + ' - Access denied.');
		}

		var isDemotion = (config.groups[nextGroup].rank < config.groups[currentGroup].rank);
		if (!Users.setOfflineGroup(name, nextGroup)) {
			return this.sendReply('/promote - WARNING: This user is offline and could be unregistered. Use /forcepromote if you\'re sure you want to risk it.');
		}
		var groupName = (config.groups[nextGroup].name || nextGroup || '').trim() || 'a regular user';
		if (isDemotion) {
			this.privateModCommand('('+name+' was demoted to ' + groupName + ' by '+user.name+'.)');
			if (targetUser) {
				targetUser.popup('You were demoted to ' + groupName + ' by ' + user.name + '.');
			}
		} else {
			this.addModCommand(''+name+' was promoted to ' + groupName + ' by '+user.name+'.');
		}
		if (targetUser) {
			targetUser.updateIdentity();
		}
	},

	forcepromote: function(target, room, user) {
		// warning: never document this command in /help
		if (!this.can('forcepromote')) return false;
		var target = this.splitTarget(target, true);
		var name = this.targetUsername;
		var nextGroup = target ? target : Users.getNextGroupSymbol(' ', false);

		if (!Users.setOfflineGroup(name, nextGroup, true)) {
			return this.sendReply('/forcepromote - Don\'t forcepromote unless you have to.');
		}
		var groupName = config.groups[nextGroup].name || nextGroup || '';
		this.addModCommand(''+name+' was promoted to ' + (groupName.trim()) + ' by '+user.name+'.');
	},

	deauth: function(target, room, user) {
		return this.parse('/demote '+target+', deauth');
	},

	modchat: function(target, room, user) {
		if (!target) {
			return this.sendReply('Moderated chat is currently set to: '+room.modchat);
		}
		if (!this.can('modchat', null, room)) return false;
		if (room.modchat && room.modchat.length <= 1 && config.groupsranking.indexOf(room.modchat) > 1 && !user.can('modchatall', null, room)) {
			return this.sendReply('/modchat - Access denied for removing a setting higher than ' + config.groupsranking[1] + '.');
		}

		target = target.toLowerCase();
		switch (target) {
		case 'on':
		case 'true':
		case 'yes':
		case 'registered':
			this.sendReply("Modchat registered is no longer available.");
			return false;
			break;
		case 'off':
		case 'false':
		case 'no':
			room.modchat = false;
			break;
		case 'ac':
		case 'autoconfirmed':
			room.modchat = 'autoconfirmed';
			break;
		case '*':
		case 'player':
			target = '\u2605';
			// fallthrough
		default:
			if (!config.groups[target]) {
				return this.parse('/help modchat');
			}
			if (config.groupsranking.indexOf(target) > 1 && !user.can('modchatall', null, room)) {
				return this.sendReply('/modchat - Access denied for setting higher than ' + config.groupsranking[1] + '.');
			}
			room.modchat = target;
			break;
		}
		if (room.modchat === true) {
			this.add('|raw|<div class="broadcast-red"><b>Moderated chat was enabled!</b><br />Only registered users can talk.</div>');
		} else if (!room.modchat) {
			this.add('|raw|<div class="broadcast-blue"><b>Moderated chat was disabled!</b><br />Anyone may talk now.</div>');
		} else {
			var modchat = sanitize(room.modchat);
			this.add('|raw|<div class="broadcast-red"><b>Moderated chat was set to '+modchat+'!</b><br />Only users of rank '+modchat+' and higher can talk.</div>');
		}
		this.logModCommand(user.name+' set modchat to '+room.modchat);
	},

	declare: function(target, room, user) {
		if (!target) return this.parse('/help declare');
		if (!this.can('declare', null, room)) return false;

		if (!this.canTalk()) return;

		this.add('|raw|<div class="broadcast-blue"><b>'+target+'</b></div>');
		this.logModCommand(user.name+' declared '+target);
	},

	gdeclare: 'globaldeclare',
	globaldeclare: function(target, room, user) {
		if (!target) return this.parse('/help globaldeclare');
		if (!this.can('gdeclare')) return false;

		for (var id in Rooms.rooms) {
			if (id !== 'global') Rooms.rooms[id].addRaw('<div class="broadcast-blue"><b>'+target+'</b></div>');
		}
		this.logModCommand(user.name+' globally declared '+target);
	},

	cdeclare: 'chatdeclare',
	chatdeclare: function(target, room, user) {
		if (!target) return this.parse('/help chatdeclare');
		if (!this.can('gdeclare')) return false;

		for (var id in Rooms.rooms) {
			if (id !== 'global') if (Rooms.rooms[id].type !== 'battle') Rooms.rooms[id].addRaw('<div class="broadcast-blue"><b>'+target+'</b></div>');
		}
		this.logModCommand(user.name+' globally declared (chat level) '+target);
	},

	wall: 'announce',
	announce: function(target, room, user) {
		if (!target) return this.parse('/help announce');

		if (!this.can('announce', null, room)) return false;

		target = this.canTalk(target);
		if (!target) return;

		return '/announce '+target;
	},

	fr: 'forcerename',
	forcerename: function(target, room, user) {
		if (!target) return this.parse('/help forcerename');
		target = this.splitTarget(target);
		var targetUser = this.targetUser;
		if (!targetUser) {
			return this.sendReply('User '+this.targetUsername+' not found.');
		}
		if (!this.can('forcerename', targetUser)) return false;

		if (targetUser.userid === toUserid(this.targetUser)) {
			var entry = ''+targetUser.name+' was forced to choose a new name by '+user.name+'' + (target ? ": " + target + "" : "");
			this.privateModCommand('(' + entry + ')');
			Rooms.global.cancelSearch(targetUser);
			targetUser.resetName();
			targetUser.send('|nametaken||'+user.name+" has forced you to change your name. "+target);
		} else {
			this.sendReply("User "+targetUser.name+" is no longer using that name.");
		}
	},

	frt: 'forcerenameto',
	forcerenameto: function(target, room, user) {
		if (!target) return this.parse('/help forcerenameto');
		target = this.splitTarget(target);
		var targetUser = this.targetUser;
		if (!targetUser) {
			return this.sendReply('User '+this.targetUsername+' not found.');
		}
		if (!target) {
			return this.sendReply('No new name was specified.');
		}
		if (!this.can('forcerenameto', targetUser)) return false;

		if (targetUser.userid === toUserid(this.targetUser)) {
			var entry = ''+targetUser.name+' was forcibly renamed to '+target+' by '+user.name+'.';
			this.privateModCommand('(' + entry + ')');
			targetUser.forceRename(target, undefined, true);
		} else {
			this.sendReply("User "+targetUser.name+" is no longer using that name.");
		}
	},

	modlog: function(target, room, user, connection) {
		var lines = 0;
		// Specific case for modlog command. Room can be indicated with a comma, lines go after the comma.
		// Otherwise, the text is defaulted to text search in current room's modlog.
		var roomId = room.id;
		var roomLogs = {};

		if (target.indexOf(',') > -1) {
			var targets = target.split(',');
			target = targets[1].trim();
			roomId = toId(targets[0]) || room.id;
		}

		// Let's check the number of lines to retrieve or if it's a word instead
		if (!target.match('[^0-9]')) {
			lines = parseInt(target || 15, 10);
			if (lines > 100) lines = 100;
		}
		var wordSearch = (!lines || lines < 0);

		// Control if we really, really want to check all modlogs for a word.
		var roomNames = '';
		var filename = '';
		var command = '';
		if (roomId === 'all' && wordSearch) {
			if (!this.can('modlog')) return;
			roomNames = 'all rooms';
			// Get a list of all the rooms
			var fileList = fs.readdirSync('logs/modlog');
			for (var i=0; i<fileList.length; i++) {
				filename += 'logs/modlog/' + fileList[i] + ' ';
			}
		} else {
			if (!this.can('modlog', null, Rooms.get(roomId))) return;
			roomNames = 'the room ' + roomId;
			filename = 'logs/modlog/modlog_' + roomId + '.txt';
		}

		// Seek for all input rooms for the lines or text
		command = 'tail -' + lines + ' ' + filename;
		var grepLimit = 100;
		if (wordSearch) { // searching for a word instead
			if (target.match(/^["'].+["']$/)) target = target.substring(1,target.length-1);
			command = "awk '{print NR,$0}' " + filename + " | sort -nr | cut -d' ' -f2- | grep -m"+grepLimit+" -i '"+target.replace(/\\/g,'\\\\\\\\').replace(/["'`]/g,'\'\\$&\'').replace(/[\{\}\[\]\(\)\$\^\.\?\+\-\*]/g,'[$&]')+"'";
		}

		// Execute the file search to see modlog
		require('child_process').exec(command, function(error, stdout, stderr) {
			if (error && stderr) {
				connection.popup('/modlog empty on ' + roomNames + ' or erred - modlog does not support Windows');
				console.log('/modlog error: '+error);
				return false;
			}
			if (lines) {
				if (!stdout) {
					connection.popup('The modlog is empty. (Weird.)');
				} else {
					connection.popup('Displaying the last '+lines+' lines of the Moderator Log of ' + roomNames + ':\n\n'+stdout);
				}
			} else {
				if (!stdout) {
					connection.popup('No moderator actions containing "'+target+'" were found on ' + roomNames + '.');
				} else {
					connection.popup('Displaying the last '+grepLimit+' logged actions containing "'+target+'" on ' + roomNames + ':\n\n'+stdout);
				}
			}
		});
	},

	complaintslist: 'complaintlist',
	complaintlist: function(target, room, user, connection) {
		if (!this.can('declare')) return false;
		var lines = 0;
		if (!target.match('[^0-9]')) {
			lines = parseInt(target || 15, 10);
			if (lines > 100) lines = 100;
		}
		var filename = 'logs/complaint.txt';
		var command = 'tail -'+lines+' '+filename;
		var grepLimit = 100;
		if (!lines || lines < 0) { // searching for a word instead
			if (target.match(/^["'].+["']$/)) target = target.substring(1,target.length-1);
			command = "awk '{print NR,$0}' "+filename+" | sort -nr | cut -d' ' -f2- | grep -m"+grepLimit+" -i '"+target.replace(/\\/g,'\\\\\\\\').replace(/["'`]/g,'\'\\$&\'').replace(/[\{\}\[\]\(\)\$\^\.\?\+\-\*]/g,'[$&]')+"'";
		}

		require('child_process').exec(command, function(error, stdout, stderr) {
			if (error && stderr) {
				connection.popup('/complaintlist erred - the complaints list does not support Windows');
				console.log('/complaintlog error: '+error);
				return false;
			}
			if (lines) {
				if (!stdout) {
					connection.popup('The complaints list is empty. Great!');
				} else {
					connection.popup('Displaying the last '+lines+' lines of complaints:\n\n'+stdout);
				}
			} else {
				if (!stdout) {
					connection.popup('No complaints containing "'+target+'" were found.');
				} else {
					connection.popup('Displaying the last '+grepLimit+' logged actions containing "'+target+'":\n\n'+stdout);
				}
			}
		});
	},

	bw: 'banword',
	banword: function(target, room, user) {
		if (!this.can('declare')) return false;
		target = toId(target);
		if (!target) {
			return this.sendReply('Specify a word or phrase to ban.');
		}
		Users.addBannedWord(target);
		this.sendReply('Added \"'+target+'\" to the list of banned words.');
	},

	ubw: 'unbanword',
	unbanword: function(target, room, user) {
		if (!this.can('declare')) return false;
		target = toId(target);
		if (!target) {
			return this.sendReply('Specify a word or phrase to unban.');
		}
		Users.removeBannedWord(target);
		this.sendReply('Removed \"'+target+'\" from the list of banned words.');
	},

	/*********************************************************
	 * Server management commands
	 *********************************************************/

	hide: function(target, room, user) {
		if (this.can('hide')) {
			user.getIdentity = function(){
				if(this.muted)	return '!' + this.name;
				if(this.locked) return '‽' + this.name;
				return ' ' + this.name;
			};
			user.updateIdentity();
			this.sendReply('You have hidden your staff symbol.');
			return false;
		}

	},

	show: function(target, room, user) {
		if (this.can('hide')) {
			delete user.getIdentity
			user.updateIdentity();
			this.sendReply('You have revealed your staff symbol.');
			return false;
		}
	},

	hotpatch: function(target, room, user) {
		if (!target) return this.parse('/help hotpatch');
		if (!this.can('hotpatch')) return false;

		this.logEntry(user.name + ' used /hotpatch ' + target);

		if (target === 'chat' || target === 'commands') {

			try {
				CommandParser.uncacheTree('./command-parser.js');
				CommandParser = require('./command-parser.js');
				CommandParser.uncacheTree('./tour.js');
				tour = require('./tour.js').tour(tour);
				CommandParser.uncacheTree('./hangman.js');
				hangman = require('./hangman.js').hangman(hangman);
				return this.sendReply('Chat commands have been hot-patched.');
			} catch (e) {
				return this.sendReply('Something failed while trying to hotpatch chat: \n' + e.stack);
			}

		} else if (target === 'battles') {

			/*Simulator.SimulatorProcess.respawn();
			return this.sendReply('Battles have been hotpatched. Any battles started after now will use the new code; however, in-progress battles will continue to use the old code.');*/
			return this.sendReply('Battle hotpatching is not supported with the single process hack.');

		} else if (target === 'formats') {
			/*try {
				// uncache the tools.js dependency tree
				CommandParser.uncacheTree('./tools.js');
				// reload tools.js
				Tools = require('./tools.js'); // note: this will lock up the server for a few seconds
				// rebuild the formats list
				Rooms.global.formatListText = Rooms.global.getFormatListText();
				// respawn validator processes
				TeamValidator.ValidatorProcess.respawn();
				// respawn simulator processes
				Simulator.SimulatorProcess.respawn();
				// broadcast the new formats list to clients
				Rooms.global.send(Rooms.global.formatListText);

				return this.sendReply('Formats have been hotpatched.');
			} catch (e) {
				return this.sendReply('Something failed while trying to hotpatch formats: \n' + e.stack);
			}*/
			return this.sendReply('Formats hotpatching is not supported with the single process hack.');

		} else if (target === 'learnsets') {
			try {
				// uncache the tools.js dependency tree
				CommandParser.uncacheTree('./tools.js');
				// reload tools.js
				Tools = require('./tools.js'); // note: this will lock up the server for a few seconds

				return this.sendReply('Learnsets have been hotpatched.');
			} catch (e) {
				return this.sendReply('Something failed while trying to hotpatch learnsets: \n' + e.stack);
			}

		}
		this.sendReply('Your hot-patch command was unrecognized.');
	},

	savelearnsets: function(target, room, user) {
		if (!this.can('hotpatch')) return false;
		fs.writeFile('data/learnsets.js', 'exports.BattleLearnsets = '+JSON.stringify(BattleLearnsets)+";\n");
		this.sendReply('learnsets.js saved.');
	},

	disableladder: function(target, room, user) {
		if (!this.can('disableladder')) return false;
		if (LoginServer.disabled) {
			return this.sendReply('/disableladder - Ladder is already disabled.');
		}
		LoginServer.disabled = true;
		this.logModCommand('The ladder was disabled by ' + user.name + '.');
		this.add('|raw|<div class="broadcast-red"><b>Due to high server load, the ladder has been temporarily disabled</b><br />Rated games will no longer update the ladder. It will be back momentarily.</div>');
	},

	enableladder: function(target, room, user) {
		if (!this.can('disableladder')) return false;
		if (!LoginServer.disabled) {
			return this.sendReply('/enable - Ladder is already enabled.');
		}
		LoginServer.disabled = false;
		this.logModCommand('The ladder was enabled by ' + user.name + '.');
		this.add('|raw|<div class="broadcast-green"><b>The ladder is now back.</b><br />Rated games will update the ladder now.</div>');
	},

	lockdown: function(target, room, user) {
		if (!this.can('lockdown')) return false;

		Rooms.global.lockdown = true;
		for (var id in Rooms.rooms) {
			if (id !== 'global') Rooms.rooms[id].addRaw('<div class="broadcast-red"><b>The server is restarting soon.</b><br />Please finish your battles quickly. No new battles can be started until the server resets in a few minutes.</div>');
			if (Rooms.rooms[id].requestKickInactive && !Rooms.rooms[id].battle.ended) Rooms.rooms[id].requestKickInactive(user, true);
		}

		this.logEntry(user.name + ' used /lockdown');

	},

	endlockdown: function(target, room, user) {
		if (!this.can('lockdown')) return false;

		if (!Rooms.global.lockdown) {
			return this.sendReply("We're not under lockdown right now.");
		}
		Rooms.global.lockdown = false;
		for (var id in Rooms.rooms) {
			if (id !== 'global') Rooms.rooms[id].addRaw('<div class="broadcast-green"><b>The server shutdown was canceled.</b></div>');
		}

		this.logEntry(user.name + ' used /endlockdown');

	},

	emergency: function(target, room, user) {
		if (!this.can('lockdown')) return false;

		if (config.emergency) {
			return this.sendReply("We're already in emergency mode.");
		}
		config.emergency = true;
		for (var id in Rooms.rooms) {
			if (id !== 'global') Rooms.rooms[id].addRaw('<div class="broadcast-red">The server has entered emergency mode. Some features might be disabled or limited.</div>');
		}

		this.logEntry(user.name + ' used /emergency');
	},

	endemergency: function(target, room, user) {
		if (!this.can('lockdown')) return false;

		if (!config.emergency) {
			return this.sendReply("We're not in emergency mode.");
		}
		config.emergency = false;
		for (var id in Rooms.rooms) {
			if (id !== 'global') Rooms.rooms[id].addRaw('<div class="broadcast-green"><b>The server is no longer in emergency mode.</b></div>');
		}

		this.logEntry(user.name + ' used /endemergency');
	},

	kill: function(target, room, user) {
		if (!this.can('lockdown')) return false;

		if (!Rooms.global.lockdown) {
			return this.sendReply('For safety reasons, /kill can only be used during lockdown.');
		}

		if (CommandParser.updateServerLock) {
			return this.sendReply('Wait for /updateserver to finish before using /kill.');
		}

		/*for (var i in Sockets.workers) {
			Sockets.workers[i].kill();
		}*/

		if (!room.destroyLog) {
			process.exit();
			return;
		}
		room.destroyLog(function() {
			room.logEntry(user.name + ' used /kill');
		}, function() {
			process.exit();
		});

		// Just in the case the above never terminates, kill the process
		// after 10 seconds.
		setTimeout(function() {
			process.exit();
		}, 10000);
	},

	loadbanlist: function(target, room, user, connection) {
		if (!this.can('hotpatch')) return false;

		connection.sendTo(room, 'Loading ipbans.txt...');
		fs.readFile('config/ipbans.txt', function (err, data) {
			if (err) return;
			data = (''+data).split("\n");
			var rangebans = [];
			for (var i=0; i<data.length; i++) {
				var line = data[i].split('#')[0].trim();
				if (!line) continue;
				if (line.indexOf('/') >= 0) {
					rangebans.push(line);
				} else if (line && !Users.bannedIps[line]) {
					Users.bannedIps[line] = '#ipban';
				}
			}
			Users.checkRangeBanned = Cidr.checker(rangebans);
			connection.sendTo(room, 'ibans.txt has been reloaded.');
		});
	},

	refreshpage: function(target, room, user) {
		if (!this.can('hotpatch')) return false;
		Rooms.global.send('|refresh|');
		this.logEntry(user.name + ' used /refreshpage');
	},

	updateserver: function(target, room, user, connection) {
		if (!user.hasConsoleAccess(connection)) {
			return this.sendReply('/updateserver - Access denied.');
		}

		if (CommandParser.updateServerLock) {
			return this.sendReply('/updateserver - Another update is already in progress.');
		}

		CommandParser.updateServerLock = true;

		var logQueue = [];
		logQueue.push(user.name + ' used /updateserver');

		connection.sendTo(room, 'updating...');

		var exec = require('child_process').exec;
		exec('git diff-index --quiet HEAD --', function(error) {
			var cmd = 'git pull --rebase';
			if (error) {
				if (error.code === 1) {
					// The working directory or index have local changes.
					cmd = 'git stash;' + cmd + ';git stash pop';
				} else {
					// The most likely case here is that the user does not have
					// `git` on the PATH (which would be error.code === 127).
					connection.sendTo(room, '' + error);
					logQueue.push('' + error);
					logQueue.forEach(function(line) {
						room.logEntry(line);
					});
					CommandParser.updateServerLock = false;
					return;
				}
			}
			var entry = 'Running `' + cmd + '`';
			connection.sendTo(room, entry);
			logQueue.push(entry);
			exec(cmd, function(error, stdout, stderr) {
				('' + stdout + stderr).split('\n').forEach(function(s) {
					connection.sendTo(room, s);
					logQueue.push(s);
				});
				logQueue.forEach(function(line) {
					room.logEntry(line);
				});
				CommandParser.updateServerLock = false;
			});
		});
	},

	crashfixed: function(target, room, user) {
		if (!Rooms.global.lockdown) {
			return this.sendReply('/crashfixed - There is no active crash.');
		}
		if (!this.can('hotpatch')) return false;

		Rooms.global.lockdown = false;
		if (Rooms.lobby) {
			Rooms.lobby.modchat = false;
			Rooms.lobby.addRaw('<div class="broadcast-green"><b>We fixed the crash without restarting the server!</b><br />You may resume talking in the lobby and starting new battles.</div>');
		}
		this.logEntry(user.name + ' used /crashfixed');
	},

	crashlogged: function(target, room, user) {
		if (!Rooms.global.lockdown) {
			return this.sendReply('/crashlogged - There is no active crash.');
		}
		if (!this.can('declare')) return false;

		Rooms.global.lockdown = false;
		if (Rooms.lobby) {
			Rooms.lobby.modchat = false;
			Rooms.lobby.addRaw('<div class="broadcast-green"><b>We have logged the crash and are working on fixing it!</b><br />You may resume talking in the lobby and starting new battles.</div>');
		}
		this.logEntry(user.name + ' used /crashlogged');
	},

	'memusage': 'memoryusage',
	memoryusage: function(target) {
		if (!this.can('hotpatch')) return false;
		target = toId(target) || 'all';
		if (target === 'all') {
			this.sendReply('Loading memory usage, this might take a while.');
		}
		if (target === 'all' || target === 'rooms' || target === 'room') {
			this.sendReply('Calculating Room size...');
			var roomSize = ResourceMonitor.sizeOfObject(Rooms);
			this.sendReply("Rooms are using " + roomSize + " bytes of memory.");
		}
		if (target === 'all' || target === 'config') {
			this.sendReply('Calculating config size...');
			var configSize = ResourceMonitor.sizeOfObject(config);
			this.sendReply("Config is using " + configSize + " bytes of memory.");
		}
		if (target === 'all' || target === 'resourcemonitor' || target === 'rm') {
			this.sendReply('Calculating Resource Monitor size...');
			var rmSize = ResourceMonitor.sizeOfObject(ResourceMonitor);
			this.sendReply("The Resource Monitor is using " + rmSize + " bytes of memory.");
		}
		if (target === 'all' || target === 'cmdp' || target === 'cp' || target === 'commandparser') {
			this.sendReply('Calculating Command Parser size...');
			var cpSize = ResourceMonitor.sizeOfObject(CommandParser);
			this.sendReply("Command Parser is using " + cpSize + " bytes of memory.");
		}
		if (target === 'all' || target === 'sim' || target === 'simulator') {
			this.sendReply('Calculating Simulator size...');
			var simSize = ResourceMonitor.sizeOfObject(Simulator);
			this.sendReply("Simulator is using " + simSize + " bytes of memory.");
		}
		if (target === 'all' || target === 'users') {
			this.sendReply('Calculating Users size...');
			var usersSize = ResourceMonitor.sizeOfObject(Users);
			this.sendReply("Users is using " + usersSize + " bytes of memory.");
		}
		if (target === 'all' || target === 'tools') {
			this.sendReply('Calculating Tools size...');
			var toolsSize = ResourceMonitor.sizeOfObject(Tools);
			this.sendReply("Tools are using " + toolsSize + " bytes of memory.");
		}
		if (target === 'all' || target === 'v8') {
			this.sendReply('Retrieving V8 memory usage...');
			var o = process.memoryUsage();
			this.sendReply(
				'Resident set size: ' + o.rss + ', ' + o.heapUsed +' heap used of ' + o.heapTotal  + ' total heap. '
				+ (o.heapTotal - o.heapUsed) + ' heap left.'
			);
			delete o;
		}
		if (target === 'all') {
			this.sendReply('Calculating Total size...');
			var total = (roomSize + configSize + rmSize + appSize + cpSize + simSize + toolsSize + usersSize) || 0;
			var units = ['bytes', 'K', 'M', 'G'];
			var converted = total;
			var unit = 0;
			while (converted > 1024) {
				converted /= 1024;
				unit++;
			}
			converted = Math.round(converted);
			this.sendReply("Total memory used: " + converted + units[unit] + " (" + total + " bytes).");
		}
		return;
	},

	bash: function(target, room, user, connection) {
		if (!user.hasConsoleAccess(connection)) {
			return this.sendReply('/bash - Access denied.');
		}

		var exec = require('child_process').exec;
		exec(target, function(error, stdout, stderr) {
			connection.sendTo(room, ('' + stdout + stderr));
		});
	},

	eval: function(target, room, user, connection, cmd, message) {
		if (!user.hasConsoleAccess(connection)) {
			return this.sendReply("/eval - Access denied.");
		}
		if (!this.canBroadcast()) return;

		if (!this.broadcasting) this.sendReply('||>> '+target);
		try {
			var battle = room.battle;
			var me = user;
			this.sendReply('||<< '+eval(target));
		} catch (e) {
			this.sendReply('||<< error: '+e.message);
			var stack = '||'+(''+e.stack).replace(/\n/g,'\n||');
			connection.sendTo(room, stack);
		}
	},

	evalbattle: function(target, room, user, connection, cmd, message) {
		if (!user.hasConsoleAccess(connection)) {
			return this.sendReply("/evalbattle - Access denied.");
		}
		if (!this.canBroadcast()) return;
		if (!room.battle) {
			return this.sendReply("/evalbattle - This isn't a battle room.");
		}

		room.battle.send('eval', target.replace(/\n/g, '\f'));
	},

	/*********************************************************
	 * Battle commands
	 *********************************************************/

	concede: 'forfeit',
	surrender: 'forfeit',
	forfeit: function(target, room, user) {
		if (!room.battle) {
			return this.sendReply("There's nothing to forfeit here.");
		}
		if (!room.forfeit(user)) {
			return this.sendReply("You can't forfeit this battle.");
		}
	},

	savereplay: function(target, room, user, connection) {
		if (!room || !room.battle) return;
		var logidx = 2; // spectator log (no exact HP)
		if (room.battle.ended) {
			// If the battle is finished when /savereplay is used, include
			// exact HP in the replay log.
			logidx = 3;
		}
		var data = room.getLog(logidx).join("\n");
		var datahash = crypto.createHash('md5').update(data.replace(/[^(\x20-\x7F)]+/g,'')).digest('hex');

		LoginServer.request('prepreplay', {
			id: room.id.substr(7),
			loghash: datahash,
			p1: room.p1.name,
			p2: room.p2.name,
			format: room.format
		}, function(success) {
			connection.send('|queryresponse|savereplay|'+JSON.stringify({
				log: data,
				id: room.id.substr(7)
			}));
		});
	},

	mv: 'move',
	attack: 'move',
	move: function(target, room, user) {
		if (!room.decision) return this.sendReply('You can only do this in battle rooms.');

		room.decision(user, 'choose', 'move '+target);
	},

	sw: 'switch',
	switch: function(target, room, user) {
		if (!room.decision) return this.sendReply('You can only do this in battle rooms.');

		room.decision(user, 'choose', 'switch '+parseInt(target,10));
	},

	choose: function(target, room, user) {
		if (!room.decision) return this.sendReply('You can only do this in battle rooms.');

		room.decision(user, 'choose', target);
	},

	undo: function(target, room, user) {
		if (!room.decision) return this.sendReply('You can only do this in battle rooms.');

		room.decision(user, 'undo', target);
	},

	team: function(target, room, user) {
		if (!room.decision) return this.sendReply('You can only do this in battle rooms.');

		room.decision(user, 'choose', 'team '+target);
	},

	joinbattle: function(target, room, user) {
		if (!room.joinBattle) return this.sendReply('You can only do this in battle rooms.');
		//if (!user.can('joinbattle', null, room)) return this.popupReply("You must be a roomvoice to join a battle you didn't start. Ask a player to use /roomvoice on you to join this battle.");

		room.joinBattle(user);
	},

	partbattle: 'leavebattle',
	leavebattle: function(target, room, user) {
		if (!room.leaveBattle) return this.sendReply('You can only do this in battle rooms.');

		room.leaveBattle(user);
	},

	kickbattle: function(target, room, user) {
		if (!room.leaveBattle) return this.sendReply('You can only do this in battle rooms.');

		target = this.splitTarget(target);
		var targetUser = this.targetUser;
		if (!targetUser || !targetUser.connected) {
			return this.sendReply('User '+this.targetUsername+' not found.');
		}
		if (!this.can('kick', targetUser)) return false;

		if (room.leaveBattle(targetUser)) {
			this.addModCommand(''+targetUser.name+' was kicked from a battle by '+user.name+'' + (target ? " (" + target + ")" : ""));
		} else {
			this.sendReply("/kickbattle - User isn\'t in battle.");
		}
	},

	kickinactive: function(target, room, user) {
		if (room.requestKickInactive) {
			room.requestKickInactive(user);
		} else {
			this.sendReply('You can only kick inactive players from inside a room.');
		}
	},

	timer: function(target, room, user) {
		target = toId(target);
		if (room.requestKickInactive) {
			if (target === 'off' || target === 'false' || target === 'stop') {
				room.stopKickInactive(user, user.can('timer'));
			} else if (target === 'on' || target === 'true' || !target) {
				room.requestKickInactive(user, user.can('timer'));
			} else {
				this.sendReply("'"+target+"' is not a recognized timer state.");
			}
		} else {
			this.sendReply('You can only set the timer from inside a room.');
		}
	},

	autotimer: 'forcetimer',
	forcetimer: function(target, room, user) {
		target = toId(target);
		if (!this.can('autotimer')) return;
		if (target === 'off' || target === 'false' || target === 'stop') {
			config.forcetimer = false;
			this.addModCommand("Forcetimer is now OFF: The timer is now opt-in. (set by "+user.name+")");
		} else if (target === 'on' || target === 'true' || !target) {
			config.forcetimer = true;
			this.addModCommand("Forcetimer is now ON: All battles will be timed. (set by "+user.name+")");
		} else {
			this.sendReply("'"+target+"' is not a recognized forcetimer setting.");
		}
	},

	forcetie: 'forcewin',
	forcewin: function(target, room, user) {
		if (!this.can('forcewin')) return false;
		if (!room.battle) {
			this.sendReply('/forcewin - This is not a battle room.');
			return false;
		}

		room.battle.endType = 'forced';
		if (!target) {
			room.battle.tie();
			this.logModCommand(user.name+' forced a tie.');
			return false;
		}
		target = Users.get(target);
		if (target) target = target.userid;
		else target = '';

		if (target) {
			room.battle.win(target);
			this.logModCommand(user.name+' forced a win for '+target+'.');
		}

	},

	/*********************************************************
	 * Challenging and searching commands
	 *********************************************************/

	cancelsearch: 'search',
	search: function(target, room, user) {
		if (target) {
			if (config.pmmodchat) {
				var userGroup = user.group;
				if (config.groupsranking.indexOf(userGroup) < config.groupsranking.indexOf(config.pmmodchat)) {
					var groupName = config.groups[config.pmmodchat].name;
					if (!groupName) groupName = config.pmmodchat;
					this.popupReply('Because moderated chat is set, you must be of rank ' + groupName +' or higher to search for a battle.');
					return false;
				}
			}
			Rooms.global.searchBattle(user, target);
		} else {
			Rooms.global.cancelSearch(user);
		}
	},

	chall: 'challenge',
	challenge: function(target, room, user, connection) {
		target = this.splitTarget(target);
		var targetUser = this.targetUser;
		if (!targetUser || !targetUser.connected) {
			return this.popupReply("The user '"+this.targetUsername+"' was not found.");
		}
		if (targetUser.blockChallenges && !user.can('bypassblocks', targetUser)) {
			return this.popupReply("The user '"+this.targetUsername+"' is not accepting challenges right now.");
		}
		if (config.pmmodchat) {
			var userGroup = user.group;
			if (config.groupsranking.indexOf(userGroup) < config.groupsranking.indexOf(config.pmmodchat)) {
				var groupName = config.groups[config.pmmodchat].name;
				if (!groupName) groupName = config.pmmodchat;
				this.popupReply('Because moderated chat is set, you must be of rank ' + groupName +' or higher to challenge users.');
				return false;
			}
		}
		user.prepBattle(target, 'challenge', connection, function (result) {
			if (result) user.makeChallenge(targetUser, target);
		});
	},

	away: 'blockchallenges',
	idle: 'blockchallenges',
	blockchallenges: function(target, room, user) {
		user.blockChallenges = true;
		this.sendReply('You are now blocking all incoming challenge requests.');
	},

	back: 'allowchallenges',
	allowchallenges: function(target, room, user) {
		user.blockChallenges = false;
		this.sendReply('You are available for challenges from now on.');
	},

	cchall: 'cancelChallenge',
	cancelchallenge: function(target, room, user) {
		user.cancelChallengeTo(target);
	},

	accept: function(target, room, user, connection) {
		var userid = toUserid(target);
		var format = '';
		if (user.challengesFrom[userid]) format = user.challengesFrom[userid].format;
		if (!format) {
			this.popupReply(target+" cancelled their challenge before you could accept it.");
			return false;
		}
		user.prepBattle(format, 'challenge', connection, function (result) {
			if (result) user.acceptChallengeFrom(userid);
		});
	},

	reject: function(target, room, user) {
		user.rejectChallengeFrom(toUserid(target));
	},

	saveteam: 'useteam',
	utm: 'useteam',
	useteam: function(target, room, user) {
		user.team = target;
	},

	/*********************************************************
	 * Low-level
	 *********************************************************/

	cmd: 'query',
	query: function(target, room, user, connection) {
		// Avoid guest users to use the cmd errors to ease the app-layer attacks in emergency mode
		var trustable = (!config.emergency || (user.named && user.authenticated));
		if (config.emergency && ResourceMonitor.countCmd(connection.ip, user.name)) return false;
		var spaceIndex = target.indexOf(' ');
		var cmd = target;
		if (spaceIndex > 0) {
			cmd = target.substr(0, spaceIndex);
			target = target.substr(spaceIndex+1);
		} else {
			target = '';
		}
		if (cmd === 'userdetails') {

			var targetUser = Users.get(target);
			if (!trustable || !targetUser) {
				connection.send('|queryresponse|userdetails|'+JSON.stringify({
					userid: toId(target),
					rooms: false
				}));
				return false;
			}
			var roomList = {};
			for (var i in targetUser.roomCount) {
				if (i==='global') continue;
				var targetRoom = Rooms.get(i);
				if (!targetRoom || targetRoom.isPrivate) continue;
				var roomData = {};
				if (targetRoom.battle) {
					var battle = targetRoom.battle;
					roomData.p1 = battle.p1?' '+battle.p1:'';
					roomData.p2 = battle.p2?' '+battle.p2:'';
				}
				roomList[i] = roomData;
			}
			if (!targetUser.roomCount['global']) roomList = false;
			var userdetails = {
				userid: targetUser.userid,
				avatar: targetUser.avatar,
				rooms: roomList
			};
			if (user.can('ip', targetUser)) {
				var ips = Object.keys(targetUser.ips);
				if (ips.length === 1) {
					userdetails.ip = ips[0];
				} else {
					userdetails.ips = ips;
				}
			}
			connection.send('|queryresponse|userdetails|'+JSON.stringify(userdetails));

		} else if (cmd === 'roomlist') {
			if (!trustable) return false;
			connection.send('|queryresponse|roomlist|'+JSON.stringify({
				rooms: Rooms.global.getRoomList(true)
			}));

		} else if (cmd === 'rooms') {
			if (!trustable) return false;
			connection.send('|queryresponse|rooms|'+JSON.stringify(
				Rooms.global.getRooms()
			));

		}
	},

	trn: function(target, room, user, connection) {
		var commaIndex = target.indexOf(',');
		var targetName = target;
		var targetAuth = false;
		var targetToken = '';
		if (commaIndex >= 0) {
			targetName = target.substr(0,commaIndex);
			target = target.substr(commaIndex+1);
			commaIndex = target.indexOf(',');
			targetAuth = target;
			if (commaIndex >= 0) {
				targetAuth = !!parseInt(target.substr(0,commaIndex),10);
				targetToken = target.substr(commaIndex+1);
			}
		}
		user.rename(targetName, targetToken, targetAuth, connection);
	},

};

function getRandMessage(user){
	var numMessages = 40;
	var message = '~~ ';
	name = escapeHTML(user.name);
	switch(Math.floor(Math.random()*numMessages)){
		case 0: message = message + name + ' has vanished into nothingness!';
		break;
		case 1: message = message + name + ' visited kupo\'s bedroom and never returned!';
		break;
		case 2: message = message + name + ' used Explosion!';
		break;
		case 3: message = message + name + ' fell into the void.';
		break;
		case 4: message = message + name + ' was squished by miloticnob\'s large behind!';
		break;
		case 5: message = message + name + ' became EnerG\'s slave!';
		break;
		case 6: message = message + name + ' became kupo\'s love slave!';
		break;
		case 7: message = message + name + ' has left the building.';
		break;
		case 8: message = message + name + ' felt Thundurus\'s wrath!';
		break;
		case 9: message = message + name + ' died of a broken heart.';
		break;
		case 10: message = message + name + ' got lost in a maze!';
		break;
		case 11: message = message + name + ' was hit by Magikarp\'s Revenge!';
		break;
		case 12: message = message + name + ' was sucked into a whirlpool!';
		break;
		case 13: message = message + name + ' got scared and left the server!';
		break;
		case 14: message = message + name + ' fell off a cliff!';
		break;
		case 15: message = message + name + ' got eaten by a bunch of piranhas!';
		break;
		case 16: message = message + name + ' is blasting off again!';
		break;
		case 17: message = message + 'A large spider descended from the sky and picked up ' + name + '.';
		break;
		case 18: message = message + name + ' was Volt Tackled by piiiikachuuu!';
		break;
		case 19: message = message + name + ' got their sausage smoked by Charmanderp!';
		break;
		case 20: message = message + name + ' was forced to give jd an oil massage!';
		break;
		case 21: message = message + name + ' took an arrow to the knee... and then one to the face.';
		break;
		case 22: message = message + name + ' peered through the hole on Shedinja\'s back';
		break;
		case 23: message = message + name + ' received judgment from the almighty Arceus!';
		break;
		case 24: message = message + name + ' used Final Gambit and missed!';
		break;
		case 25: message = message + name + ' pissed off a wild AOrtega!';
		break;
		case 26: message = message + name + ' was frozen by Nord!';
		break;
		case 27: message = message + name + ' was actually a 12 year and was banned for COPPA.';
		break;
		case 28: message = message + name + ' got lost in the illusion of reality.';
		break;
		case 29: message = message + name + ' was unfortunate and didn\'t get a cool message.';
		break;
		case 30: message = message + 'Masakaki accidently kicked ' + name + ' from the server!';
		break;
		case 31: message = message + name + ' was knocked out cold by Fallacies!';
		break;
		case 32: message = message + name + ' died making love to an EnerG218!';
		break;
		case 33: message = message + name + ' was glomped to death by Mizu!';
		break;
		case 34: message = message + name + ' was hit by a wrecking ball!';
		break;
		case 35: message = message + name + ' was hit by a train!';
		break;
		case 36: message = message + name + ' used Run Away!';
		break;
		case 37: message = message + name + ' was splashed by a Magikarp!';
		break;
		case 38: message = message + name + ' said kupo x EnerG218!';
		break;
		default: message = message + name + ' fled from colonial mustang!';
	};
	message = message + ' ~~';
	return message;
}

function MD5(f){function i(b,c){var d,e,f,g,h;f=b&2147483648;g=c&2147483648;d=b&1073741824;e=c&1073741824;h=(b&1073741823)+(c&1073741823);return d&e?h^2147483648^f^g:d|e?h&1073741824?h^3221225472^f^g:h^1073741824^f^g:h^f^g}function j(b,c,d,e,f,g,h){b=i(b,i(i(c&d|~c&e,f),h));return i(b<<g|b>>>32-g,c)}function k(b,c,d,e,f,g,h){b=i(b,i(i(c&e|d&~e,f),h));return i(b<<g|b>>>32-g,c)}function l(b,c,e,d,f,g,h){b=i(b,i(i(c^e^d,f),h));return i(b<<g|b>>>32-g,c)}function m(b,c,e,d,f,g,h){b=i(b,i(i(e^(c|~d),
f),h));return i(b<<g|b>>>32-g,c)}function n(b){var c="",e="",d;for(d=0;d<=3;d++)e=b>>>d*8&255,e="0"+e.toString(16),c+=e.substr(e.length-2,2);return c}var g=[],o,p,q,r,b,c,d,e,f=function(b){for(var b=b.replace(/\r\n/g,"\n"),c="",e=0;e<b.length;e++){var d=b.charCodeAt(e);d<128?c+=String.fromCharCode(d):(d>127&&d<2048?c+=String.fromCharCode(d>>6|192):(c+=String.fromCharCode(d>>12|224),c+=String.fromCharCode(d>>6&63|128)),c+=String.fromCharCode(d&63|128))}return c}(f),g=function(b){var c,d=b.length;c=
d+8;for(var e=((c-c%64)/64+1)*16,f=Array(e-1),g=0,h=0;h<d;)c=(h-h%4)/4,g=h%4*8,f[c]|=b.charCodeAt(h)<<g,h++;f[(h-h%4)/4]|=128<<h%4*8;f[e-2]=d<<3;f[e-1]=d>>>29;return f}(f);b=1732584193;c=4023233417;d=2562383102;e=271733878;for(f=0;f<g.length;f+=16)o=b,p=c,q=d,r=e,b=j(b,c,d,e,g[f+0],7,3614090360),e=j(e,b,c,d,g[f+1],12,3905402710),d=j(d,e,b,c,g[f+2],17,606105819),c=j(c,d,e,b,g[f+3],22,3250441966),b=j(b,c,d,e,g[f+4],7,4118548399),e=j(e,b,c,d,g[f+5],12,1200080426),d=j(d,e,b,c,g[f+6],17,2821735955),c=
j(c,d,e,b,g[f+7],22,4249261313),b=j(b,c,d,e,g[f+8],7,1770035416),e=j(e,b,c,d,g[f+9],12,2336552879),d=j(d,e,b,c,g[f+10],17,4294925233),c=j(c,d,e,b,g[f+11],22,2304563134),b=j(b,c,d,e,g[f+12],7,1804603682),e=j(e,b,c,d,g[f+13],12,4254626195),d=j(d,e,b,c,g[f+14],17,2792965006),c=j(c,d,e,b,g[f+15],22,1236535329),b=k(b,c,d,e,g[f+1],5,4129170786),e=k(e,b,c,d,g[f+6],9,3225465664),d=k(d,e,b,c,g[f+11],14,643717713),c=k(c,d,e,b,g[f+0],20,3921069994),b=k(b,c,d,e,g[f+5],5,3593408605),e=k(e,b,c,d,g[f+10],9,38016083),
d=k(d,e,b,c,g[f+15],14,3634488961),c=k(c,d,e,b,g[f+4],20,3889429448),b=k(b,c,d,e,g[f+9],5,568446438),e=k(e,b,c,d,g[f+14],9,3275163606),d=k(d,e,b,c,g[f+3],14,4107603335),c=k(c,d,e,b,g[f+8],20,1163531501),b=k(b,c,d,e,g[f+13],5,2850285829),e=k(e,b,c,d,g[f+2],9,4243563512),d=k(d,e,b,c,g[f+7],14,1735328473),c=k(c,d,e,b,g[f+12],20,2368359562),b=l(b,c,d,e,g[f+5],4,4294588738),e=l(e,b,c,d,g[f+8],11,2272392833),d=l(d,e,b,c,g[f+11],16,1839030562),c=l(c,d,e,b,g[f+14],23,4259657740),b=l(b,c,d,e,g[f+1],4,2763975236),
e=l(e,b,c,d,g[f+4],11,1272893353),d=l(d,e,b,c,g[f+7],16,4139469664),c=l(c,d,e,b,g[f+10],23,3200236656),b=l(b,c,d,e,g[f+13],4,681279174),e=l(e,b,c,d,g[f+0],11,3936430074),d=l(d,e,b,c,g[f+3],16,3572445317),c=l(c,d,e,b,g[f+6],23,76029189),b=l(b,c,d,e,g[f+9],4,3654602809),e=l(e,b,c,d,g[f+12],11,3873151461),d=l(d,e,b,c,g[f+15],16,530742520),c=l(c,d,e,b,g[f+2],23,3299628645),b=m(b,c,d,e,g[f+0],6,4096336452),e=m(e,b,c,d,g[f+7],10,1126891415),d=m(d,e,b,c,g[f+14],15,2878612391),c=m(c,d,e,b,g[f+5],21,4237533241),
b=m(b,c,d,e,g[f+12],6,1700485571),e=m(e,b,c,d,g[f+3],10,2399980690),d=m(d,e,b,c,g[f+10],15,4293915773),c=m(c,d,e,b,g[f+1],21,2240044497),b=m(b,c,d,e,g[f+8],6,1873313359),e=m(e,b,c,d,g[f+15],10,4264355552),d=m(d,e,b,c,g[f+6],15,2734768916),c=m(c,d,e,b,g[f+13],21,1309151649),b=m(b,c,d,e,g[f+4],6,4149444226),e=m(e,b,c,d,g[f+11],10,3174756917),d=m(d,e,b,c,g[f+2],15,718787259),c=m(c,d,e,b,g[f+9],21,3951481745),b=i(b,o),c=i(c,p),d=i(d,q),e=i(e,r);return(n(b)+n(c)+n(d)+n(e)).toLowerCase()};

var colorCache = {};

function hashColor(name) {
	if (colorCache[name]) return colorCache[name];

	var hash = MD5(name);
	var H = parseInt(hash.substr(4, 4), 16) % 360;
	var S = parseInt(hash.substr(0, 4), 16) % 50 + 50;
	var L = parseInt(hash.substr(8, 4), 16) % 20 + 25;

	var m1, m2, hue;
	var r, g, b
	S /=100;
	L /= 100;
	if (S == 0)
	r = g = b = (L * 255).toString(16);
	else {
	if (L <= 0.5)
	m2 = L * (S + 1);
	else
	m2 = L + S - L * S;
	m1 = L * 2 - m2;
	hue = H / 360;
	r = HueToRgb(m1, m2, hue + 1/3);
	g = HueToRgb(m1, m2, hue);
	b = HueToRgb(m1, m2, hue - 1/3);
}


colorCache[name] = '#' + r + g + b;
return colorCache[name];
}

function HueToRgb(m1, m2, hue) {
	var v;
	if (hue < 0)
		hue += 1;
	else if (hue > 1)
		hue -= 1;

	if (6 * hue < 1)
		v = m1 + (m2 - m1) * hue * 6;
	else if (2 * hue < 1)
		v = m2;
	else if (3 * hue < 2)
		v = m1 + (m2 - m1) * (2/3 - hue) * 6;
	else
		v = m1;

	return (255 * v).toString(16);
}

function removeIpBan(target, callback) {
	var data = fs.readFileSync('config/ipbans.txt','utf8');
	var match = false;
	var row = (''+data).split("\n");
	var line = '';
	if (!target) return false;
	for (var i = row.length; i > -1; i--) {
		if (!row[i]) continue;
		var parts = row[i].split(",");
		if (target == parts[0]) {
			match = true;
			line = line + row[i];
			break;
		}
	}
	if (match === true) {
		var re = new RegExp(line,"g");
		fs.readFile('config/ipbans.txt', 'utf8', function (err,data) {
			if (err) {
				return console.log(err);
			}
			var result = data.replace(re, '');
			fs.writeFile('config/ipbans.txt', result, 'utf8', function (err) {
				if (err) return console.log(err);
			});
			callback(true);
			return;
		});
	} else {
		callback(false);
		return;
	}
}

function escapeHTML(target) {
	if (!target) return false;
	target = target.replace(/&(?!\w+;)/g, '&amp;');
	target = target.replace(/</g, '&lt;');
	target = target.replace(/>/g, '&gt;');
	target = target.replace(/"/g, '&quot;');
	return target;
}
