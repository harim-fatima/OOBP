const prompts = require('prompts');

class Actor {
  constructor(actorName, hitPoints, attackDamage, chanceOfAttackHit) {
    this.actorName = actorName;
    this.hitPoints = hitPoints;
    this.attackDamage = attackDamage;
    this.chanceOfAttackHit = chanceOfAttackHit;
  }
  attack(opponent) {
    if (this.hit()) {
      opponent.hitPoints = opponent.hitPoints - this.attackDamage
      console.log(this.actorName + ' hits ' + opponent.actorName + ' with ' + this.attackDamage + ' points.')
      console.log(opponent.actorName + ' is hit and has ' + opponent.hitPoints + ' remaining.')
    }
    else {
      console.log(this.actorName + ' attack misses');
    }

  }

  hit() {
    // check if attach probability is under hit change randomaly 
    if (Math.floor(Math.random() * 101) < this.chanceOfAttackHit) {
      return true
    }
    else {
      return false
    }
  }
}

class Player extends Actor {
  constructor(actorName, hitPoints, attackDamage, chanceOfAttackHit) {
    super(actorName, hitPoints, attackDamage, chanceOfAttackHit)
  }
  moveToRoom(room) {
    this.room = room;
    this.lookAround();
  }
  lookAround() {
    console.log('You looked Around')
    console.log(this.room.roomDescription)
    let roomEnemies = this.room.getEnemies()
    if (this.room.getConnectedRooms().length > 0) {
      this.room.displayConnectedRooms()
    }
    if (roomEnemies.length > 0) {
      console.log('\nYou See:\n');
      for (let i = 0; i < roomEnemies.length; i++) {
        console.log('a ' + roomEnemies[i].actorName);
        roomEnemies[i].attack(this)
      }
    }
  }
}

class Enemy extends Actor {
  constructor(actorName, hitPoints, attackDamage, chanceOfAttackHit) {
    super(actorName, hitPoints, attackDamage, chanceOfAttackHit)
  }
}


class Room {
  constructor(roomName, roomDescription) {
    this.roomName = roomName;
    this.roomDescription = roomDescription;
    this.roomEnemies = [];
    this.connectedRooms = [];
  }

  addEnemy(enemy) {
    this.roomEnemies.push(enemy)
  }
  destroyEnemy(enemy) {
    const index = this.roomEnemies.indexOf(enemy);
    if (index > -1) {
      this.roomEnemies.splice(index, 1);
      console.log(enemy.actorName + 'is destoryed')
    }

  }
  getEnemies() {
    return this.roomEnemies;
  }
  connectRoom(room) {
    this.connectedRooms.push(room);
    room.connectedRooms.push(this)
  }
  displayConnectedRooms() {
    if (this.connectedRooms.length > 0) {
      console.log('There are doorways leading to:\n');
      for (let i = 0; i < this.connectedRooms.length; i++) {
        console.log(this.connectedRooms[i].roomName);
      }
    }
  }
  getConnectedRooms() {
    return this.connectedRooms;
  }
}


let player = new Player(actorName = "Player", hitPoints = 10, attackDamage = 2, chanceOfAttackHit = 75);
let sewerRat = new Enemy(actorName = "Small Sewer Rat", hitPoints = 2, attackDamage = 1, chanceOfAttackHit = 50);
let giantDragon = new Enemy(actorName = "Giant Dragon", hitPoints = 4, attackDamage = 8, chanceOfAttackHit = 90);



let dungeon = new Room(roomName = 'Dungeon', roomDescription = 'You are in The dungeon and it is a big and damp room with broken statues all around')
let hallway = new Room(roomName = 'Hallway', roomDescription = 'You are in Hallway and it is a long and dark hallway with dark pools of water on the floor and some fungus growing on the walls')
let chamber = new Room(roomName = 'Chamber', roomDescription = 'You are in the Chamber and it is a small chamber, which is illuminated by a glowing portal of somekind')
let portal = new Room(roomName = 'Glowing Portal', roomDescription = 'You are in The dungeon and it is a big and damp room with broken statues all around')

dungeon.connectRoom(hallway)
hallway.connectRoom(chamber)
chamber.connectRoom(portal)

hallway.addEnemy(sewerRat)
chamber.addEnemy(giantDragon)


// Player start with dungeon room
player.moveToRoom(dungeon);

async function goToRoom() {
  const roomChoices = []
  for (let i = 0; i < player.room.connectedRooms.length; i++) {
    roomChoices.push({ title: player.room.connectedRooms[i].roomName, value: player.room.connectedRooms[i].roomName });
  }
  const response = await prompts({
    type: 'select',
    name: 'value',
    message: 'Which room you want to go?',
    choices: roomChoices
  });
  console.log('You choose ' + response.value);
  switch (response.value) {
    case 'Dungeon':
      player.moveToRoom(dungeon);
      if (player.hitPoints <= 0) {
        console.log('Game Over Player Died')
        break;
      }
      gameLoop();
      break;

    case 'Hallway':
      player.moveToRoom(hallway);
      if (player.hitPoints <= 0) {
        console.log('Game Over Player Died')
        break;
      }
      gameLoop();
      break;

    case 'Chamber':
      player.moveToRoom(chamber);
      if (player.hitPoints <= 0) {
        console.log('Game Over Player Died')
        break;
      }
      gameLoop();
      break;

    case 'Glowing Portal':
      player.moveToRoom(portal);
      console.log('Congratulations, you made through the dungeons');
      break;
  }

}

async function playerAttack() {
  const enemyChoices = []
  let enemies = player.room.getEnemies()
  if (enemies.length >= 1) {
    for (let i = 0; i < enemies.length; i++) {
      enemyChoices.push({ title: enemies[i].actorName, value: enemies[i].actorName });
    }
    const response = await prompts({
      type: 'select',
      name: 'value',
      message: 'Which enemy you want to attack?',
      choices: enemyChoices
    });
    console.log('You choose ' + response.value);
    switch (response.value) {
      case 'Small Sewer Rat':
        player.attack(sewerRat);
        if (sewerRat.hitPoints <= 0) {
          player.room.destroyEnemy(sewerRat)
        }
        gameLoop();
        break;

      case 'Giant Dragon':
        player.attack(giantDragon);
        if (giantDragon.hitPoints <= 0) {
          player.room.destroyEnemy(giantDragon)
        }
        gameLoop();
        break;
    }

  } else {
    console.log('No enemy found in the room')
    gameLoop();
  }

}

async function gameLoop() {
  let continueGame = true;
  const initialActionChoices = [
    { title: 'Look Around', value: 'Look Around' },
    { title: 'Go to room', value: 'Go to Room' },
    { title: 'Attack', value: 'Attack' },
    { title: 'Exit game', value: 'Exit' }
  ];
  const response = await prompts({
    type: 'select',
    name: 'value',
    message: 'Choose your action',
    choices: initialActionChoices
  });
  console.log('You choose ' + response.value);
  switch (response.value) {
    case 'Look Around':
      player.lookAround();
      if (player.hitPoints <= 0) {
        console.log('Game Over Player Died');
        continueGame = false;
      }
      break;

    case 'Go to Room':
      goToRoom();
      continueGame = false;
      break;

    case 'Attack':
      console.log('You bravely attack');
      playerAttack();
      continueGame = false;
      break;

    case 'Exit':
      continueGame = false;
      break;
  }

  if (continueGame) {
    gameLoop();
  }
}


process.stdout.write('\033c');
console.log('WELCOME TO THE DUNGEONS OF LORD OBJECT ORIENTUS!')
console.log('================================================')
console.log('You walk down the stairs to the dungeons')
gameLoop();