function Game(squareSide, cx) {
  this.squareSide = squareSide;
  this.numOfSquareRow = 10;
  this.cx = cx;
  this.gap = 0.25 * this.squareSide;

  this.initialize();
  this.setup();
}

Game.prototype.initialize = function() {
  var startX = -this.squareSide,
      startY = -this.cx.canvas.height / 2
               - 4 * this.squareSide - 3 * this.gap + 3;
  this.blockTopleft = new Vector(startX, startY);

  this.triangleSide = this.squareSide * this.numOfSquareRow
                + this.gap * (this.numOfSquareRow + 1);
  
  this.inputManager = new InputManager;
  this.storageManager = new StorageManager;
  this.uiManager = new UIManager;

  this.storageManager.init();
  var bestScore = this.storageManager.getBestScore();
  this.uiManager.displayBest(bestScore);

  this.prepareTriangle();
  this.prepareLine();

  this.addEvents();
  
  window.focus();
}

Game.prototype.setup = function() {
  this.gameOver = false;
  this.paused = false;
  
  // save the squares that are already still on the triangle.
  this.stillSquares = [];
  this.score = 0;
  this.uiManager.displayScore(this.score);

  this.fallingInterval = 1000; 

  this.decideNextBlock();
  this.prepareBlock();
  this.uiManager.showLandingInterval(this.fallingInterval);
  this.giveBlockHint();

  this.line.reset();
  this.triangle.display();
};

Game.prototype.addEvents = function() {
  this.inputManager.on('rotate', this.rotate.bind(this));
  this.inputManager.on('move', this.moveBlock.bind(this));
  this.inputManager.on('deform', this.deformBlock.bind(this));
  this.inputManager.on('pause', this.pause.bind(this));
  this.inputManager.on('continue', this.continue.bind(this));
  this.inputManager.on('replay', this.replay.bind(this));
}

Game.prototype.pause = function() {
  if (this.gameOver) return;
  if (this.interval) clearInterval(this.interval);
  this.paused = true;
  
  this.uiManager.changeInnerText('.pause-or-continue-btn', 'Continue');
};

Game.prototype.continue = function() {
  if (this.gameOver) return;
  this.paused = false;
  this.makeBlockFall();

  this.uiManager.changeInnerText('.pause-or-continue-btn', 'Pause');
};

Game.prototype.replay = function() {
  this.uiManager.removeDialog();
  this.uiManager.clearContext(this.cx);
  this.setup();
}

Game.prototype.prepareTriangle = function() {
  var r = Math.sqrt(3) / 3 * this.triangleSide;
  this.triangle = new Triangle(Math.PI / 2, r, "gray", this.cx);
  this.triangle.display();
};

Game.prototype.prepareLine = function() {
  var r2center = this.triangleSide / (Math.sqrt(3) * 2)
                 + 4 * this.squareSide + 4 * this.gap + 6.5;
  this.line = new Line(this.triangleSide, r2center, "gray", this.cx);
  this.line.display();
};

Game.prototype.prepareBlock = function() {
  this.fallingBlock = 
    new Block(this.blockTopleft.copy(),
              this.nextBlockType, this.squareSide, this.gap, this.cx);
  this.makeBlockFall();
};

Game.prototype.makeBlockFall = function() {
  var block = this.fallingBlock;
  var step = this.squareSide + this.gap;
  var self = this;
  var velocity = new Vector(0, step);

  self.interval = setInterval(function() {

    if (self.canFall(velocity)) {
      block.move(velocity);
    } else {
      clearInterval(self.interval);
      block.squares.forEach(function(s) {
        self.stillSquares.push(s);
      });
      if (!self.lose()) {
        self.checkIfShouldClear();
        self.prepareBlock();
        self.giveBlockHint();
      }
   
    }

  }, self.fallingInterval);
  
  self.line.reset();
};

Game.prototype.deformBlock = function() {
  if (this.gameOver || this.paused) return;
  var block = this.fallingBlock;
  var oldBlockWidth = block.width;
  if (this.canDeform()) {
    block.deform();
    if (this.blockHitsRightEdge(block)) {

      // move left to avoid going across the right edge
      block.move(new Vector(-(block.width - oldBlockWidth), 0));
    }
  }
};

Game.prototype.moveBlock = function(direction) {
  if (this.gameOver || this.paused) return;
  if (!direction) return;
  var block = this.fallingBlock;
  var step = this.squareSide + this.gap;
  var velocity;
  switch(direction) {
    case "left":
      velocity = new Vector(-step, 0);
      break;
    case "right":
      velocity = new Vector(step, 0);
      break;
    case "down":
      velocity = new Vector(0, step);
      break;
  }
  if (this.canMove(velocity)) {
    block.move(velocity);
  }
  this.line.reset();
};

Game.prototype.rotate = function(angle) {
  if (this.gameOver || this.paused) return;
  
  if (this.canRotate()) {
    this.triangle.rotate(angle);
    var self = this;
    this.stillSquares.forEach(function(s_s) {
      self.rotateSquare(s_s, angle);
    });
  }
};

Game.prototype.rotateSquare = function(square, angle) {
  var step, maxStep = 0.08, rest, anglePassed = 0, requestID;
  var self = this;
  function animate() {
    self.fallingBlock.display();
    self.line.reset();
    rest = Math.abs(angle - anglePassed);
    step = angle > 0 ? Math.min(maxStep, rest) : -Math.min(maxStep, rest);
    square.rotate(step);
    anglePassed += step;
    if (anglePassed === angle) {
      cancelAnimationFrame(requestID);
      if (self.blockHitsSquare(self.fallingBlock)) {

        // the falling block goes up to avoid hitting the still squares
        self.fallingBlock
            .move(new Vector(0, -(self.fallingBlock.height + self.gap)));
        self.stillSquares.forEach(function(s) {
          s.display();
        });
      }
    } else {
      requestID = requestAnimationFrame(animate);
    }
  }
  requestID = requestAnimationFrame(animate);
};

Game.prototype.canRotate = function() {
  if (this.fallingBlock.topleft.y >= -this.line.r2center) {
    return false;
  } else {
    return true;
  }
};


Game.prototype.checkIfShouldClear = function() {
  var numOfClearedLines = 0, scoreAddition = 0,
      step = this.squareSide + this.gap,
      bottomY = -this.triangleSide / (Math.sqrt(3) * 2),
      minStillY = this.getMinStillY();
  var self = this;

  for (var y = minStillY; y < bottomY; y += step) {
    var numAtSameY = 0;
    this.stillSquares.forEach(function(s) {
      if (self.approximatelyEqual(y, s.topleft.y)) numAtSameY++;
    });
    if (numAtSameY === 10) {
      this.stillSquares = this.stillSquares.filter(function(s) {
        if (self.approximatelyEqual(y, s.topleft.y)) {
          s.disappear();
        } else {
          return true;
        }
      });

      //因为下降会用到disappear方法，所以需要逐层下降
      for (var yy = y - step; yy >= minStillY; yy -= step) {
        self.stillSquares.forEach(function(s) {
          if (self.approximatelyEqual(yy, s.topleft.y)) {
            s.fall(step);
          }
        });
      }

      numOfClearedLines++;
      scoreAddition += numOfClearedLines * 10;
       
      if (self.fallingInterval > 500) {
        self.fallingInterval -= 20;
        self.uiManager.showLandingInterval(self.fallingInterval);
      }
    }
  }
  if (scoreAddition > 0) {
    self.uiManager.displayScoreAddition(scoreAddition);
    self.score += scoreAddition;
    self.uiManager.displayScore(self.score);
    self.checkForUpdatingBest();
  }
};


Game.prototype.lose = function() {
  var loseEdge = -this.cx.canvas.height / 2;
  if (this.getMinStillY() < loseEdge) {
    this.afterLosing();
    return true;
  }
};

Game.prototype.decideNextBlock = function() {
  var blockTypes = ["I", "J", "L", "O", "S", "Z", "T"];
  this.nextBlockType = blockTypes[Math.floor(Math.random() * 7)];
};

Game.prototype.giveBlockHint = function() {
  this.decideNextBlock();
  if (this.hintBlock) {
    this.hintBlock.disappear();
  }
  var hintBlockTopleft = new Vector(0, 0); // just temporary
  this.hintBlock =
    new Block(hintBlockTopleft, this.nextBlockType,
              this.squareSide, this.gap, this.cx);
  this.hintBlock.setTopleft(-this.hintBlock.width / 2, -this.squareSide * 2);
  this.hintBlock.setSquareCoors();
  this.hintBlock.display();
};

Game.prototype.afterLosing = function() {
  this.gameOver = true;
  this.uiManager.lose();
};

Game.prototype.checkForUpdatingBest = function() {
  if (this.score > this.storageManager.getBestScore()) {
    this.storageManager.updateBestScore(this.score);
    this.uiManager.displayBest(this.score);
  }
}

Game.prototype.approximatelyEqual = function(num1, num2) {
  return Math.abs(num1 - num2) < 0.1;
}

Game.prototype.getMinStillY = function() {
  var minStillY = 0;
  this.stillSquares.forEach(function(s) {
    if (s.topleft.y < minStillY) {
      minStillY = s.topleft.y;
    }
  });
  return minStillY;
}

// can the falling block fall by itself?
Game.prototype.canFall = function(velocity) {
  var tempBlock = this.fallingBlock.copy();
  tempBlock.invisiblyMove(velocity);
  return (this.blockHitsSquare(tempBlock) || this.blockHitsBottom(tempBlock))
          ? false : true;
}

// can the player move the falling block?
Game.prototype.canMove = function(velocity) {
  var tempBlock = this.fallingBlock.copy();
  tempBlock.invisiblyMove(velocity);
  return (this.blockHitsSquare(tempBlock)   ||
          this.blockHitsBottom(tempBlock)   ||
          this.blockHitsLeftEdge(tempBlock) ||
          this.blockHitsRightEdge(tempBlock))
          ? false : true;
}

// can the player deform the falling block?
Game.prototype.canDeform = function() {
  var tempBlock = this.fallingBlock.copy();
  tempBlock.invisiblyDeform();
  return (this.blockHitsSquare(tempBlock) || this.blockHitsBottom(tempBlock))
          ? false : true;

}

Game.prototype.blockHitsSquare = function(block) {
  var bottomY = -this.triangleSide / (Math.sqrt(3) * 2);
  for (var ii = 0, nn = block.squares.length; ii < nn; ii++) {
    var fallingX = block.squares[ii].topleft.x;
    var fallingY = block.squares[ii].topleft.y;
    for (var i = 0; i < this.stillSquares.length; i++) {
      var stillX = this.stillSquares[i].topleft.x;
      var stillY = this.stillSquares[i].topleft.y;
      if (stillY < bottomY) {
        if (this.approximatelyEqual(fallingX, stillX)
            && this.approximatelyEqual(fallingY, stillY)) {
          return true;
        }
      }
    }  
  }
  return false;
}

Game.prototype.blockHitsBottom = function(block) {
  var bottomY = -this.triangleSide / (Math.sqrt(3) * 2);
  if (block.topleft.y + block.height > bottomY) {
    return true;
  }
  return false;
}

Game.prototype.blockHitsLeftEdge = function(block) {
  if (block.topleft.x < -this.triangleSide / 2) {
    return true;
  }
  return false;
}

Game.prototype.blockHitsRightEdge = function(block) {
  if (block.topleft.x + block.width > this.triangleSide / 2) {
    return true;
  }
  return false;
}