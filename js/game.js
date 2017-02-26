function Game(squareSide, cx){
	this.squareSide=squareSide;
	this.numOfSquareRow=10;
	this.cx=cx;
	this.gap=1/4*this.squareSide;

	this.inputManager = new InputManager;
	this.storageManager = new StorageManager;
	this.uiManager = new UIManager;

	this.initialize();
	this.setup();
}

Game.prototype.initialize = function () {
	window.focus();

	this.storageManager.init();
	var bestScore=this.storageManager.getBestScore();
	this.uiManager.displayBest(bestScore);

	this.prepareTriangle();
	this.prepareLine();

	this.addEvents();
}

Game.prototype.setup = function () {
	this.gameOver = false;
	this.paused = false;
	this.stillSquares=[];//save the squares that are already still on the triangle.
	this.score=0;
	this.uiManager.displayScore(this.score);
	
	this.fallingInterval=1000; 
	
	this.decideNextBlock();
	this.prepareBlock();
	this.uiManager.showLandingInterval(this.fallingInterval);
	this.giveBlockHint();
	
	this.line.display();
	this.triangle.display();
};

Game.prototype.addEvents = function () {
	this.inputManager.on('rotate', this.rotate.bind(this));
	this.inputManager.on('move', this.moveBlock.bind(this));
	this.inputManager.on('deform', this.deformBlock.bind(this));
	this.inputManager.on('pause', this.pause.bind(this));
	this.inputManager.on('continue', this.continue.bind(this));
	this.inputManager.on('replay', this.replay.bind(this));
}

Game.prototype.pause=function(){
	if (this.gameOver) return;
	if(this.interval)	clearInterval(this.interval);
	this.paused = true;
	
	this.uiManager.changeInnerText('.pause-or-continue-btn', 'Continue');
};

Game.prototype.continue=function(){
	if (this.gameOver) return;
	this.paused = false;
	this.makeBlockFall();
	
	this.uiManager.changeInnerText('.pause-or-continue-btn', 'Pause');
};

Game.prototype.replay = function () {
	this.uiManager.removeDialog();
	this.uiManager.clearContext(this.cx);
	this.setup();
}

Game.prototype.prepareTriangle=function(){
	var triSide=this.squareSide*this.numOfSquareRow+this.gap*(this.numOfSquareRow+1);
	var r=Math.sqrt(3)/3*triSide;
	this.triangle=new Triangle(Math.PI/2, r, "gray", this.cx);
	this.triangle.display();
};

Game.prototype.prepareLine=function(){
	var triSide=this.squareSide*this.numOfSquareRow+this.gap*(this.numOfSquareRow+1);
	var r2center=triSide/(Math.sqrt(3)*2)+5*this.squareSide+4*this.gap+10.2;
	this.line=new Line(triSide, r2center, "gray", this.cx);
	this.line.display();
};

Game.prototype.prepareBlock=function(){
	this.fallingBlock=new Block(this.nextBlockType, this.squareSide, this.gap, cx);
	this.makeBlockFall();
};

Game.prototype.makeBlockFall=function(){
	console.log(this.stillSquares.length);
	// if(!this.fallingBlock) return;
  var block = this.fallingBlock;
	var step=this.squareSide+this.gap;
	var self=this;

	var hitted=false;
	self.interval=setInterval(function(){  //window.setInterval
		var coorRecord=new Vector(block.topleft.x, block.topleft.y);	
		block.disappear();
		block.topleft.y+=step;
		block.setSquareCoors();
		hitted=self.hitTest(block);
		if(hitted){
			block.topleft.x=coorRecord.x;
			block.topleft.y=coorRecord.y;
			block.setSquareCoors();
		}
		block.display();	
		if(hitted){
			clearInterval(self.interval);
			block.squares.forEach(function(s){
				self.stillSquares.push(s);
			});
			if(!self.checkIfLose()){
				self.checkIfShouldClear();
				self.prepareBlock();
				self.giveBlockHint();
			}
			
		}
					
	},	self.fallingInterval);
	self.line.display();
};

Game.prototype.deformBlock=function(){
	if(this.gameOver || this.paused) return;
  var block = this.fallingBlock;
	var halfOfTriangleSide=0.5*(this.squareSide*this.numOfSquareRow+this.gap*(this.numOfSquareRow+1));
	var rightEdgeToRightLimit=halfOfTriangleSide-(block.topleft.x+block.width);
	block.disappear();
	var patternRecord=block.pattern;
	for(var i=0, n=block.patterns.length; i<n; i++){
		if(block.pattern==block.patterns[i]){
		  block.pattern=block.patterns[i+1]?block.patterns[i+1]:block.patterns[0];
		  break;
		}
	}
	block.setSquareCoors();
	if(block.topleft.x+block.width>halfOfTriangleSide){ //避免有些情况下右侧的方块不能变形
		// block.topleft.x=halfOfTriangleSide-block.width;
		block.topleft.x-=block.topleft.x+block.width-halfOfTriangleSide+rightEdgeToRightLimit;
		block.setSquareCoors();
	}
	if(this.hitTest(block)){
		block.pattern=patternRecord;
		block.setSquareCoors();
	}
	block.display();
};

Game.prototype.moveBlock=function(direction){

	if(this.gameOver || this.paused) return;
	if (!direction) return;
  var block = this.fallingBlock;
	block.disappear();
	var coorRecord=new Vector(block.topleft.x, block.topleft.y);
	var step=this.squareSide+this.gap;
	switch(direction){
		case "left":
			block.topleft.x-=step;
			break;
		case "right":
			block.topleft.x+=step;
			break;
		case "down":
			block.topleft.y+=step;
			break;
	}
	block.setSquareCoors();
	if(this.hitTest(block)){
		block.topleft.x=coorRecord.x;
		block.topleft.y=coorRecord.y;
		block.setSquareCoors();
	}
	block.display();
	this.line.display();
};

Game.prototype.rotateSquare=function(s_square, angle){
	var step;
	var absAng1=0.08, absAng2;
	var anglePassed=0;
	var requestID;
	var self=this;
	function animate(){
		s_square.disappear(); 
		absAng2=Math.abs(angle-anglePassed);
		step=angle>0?Math.min(absAng1,absAng2):-Math.min(absAng1,absAng2);
		for(var i=0;i<4;i++){
		  s_square.thetas[i]+=step;
		}
		s_square.rotateApexes();
		s_square.display();
		anglePassed+=step;
		if(anglePassed==angle){
		  	cancelAnimationFrame(requestID);
			if(self.hitTest(self.fallingBlock)){
				self.fallingBlock.disappear();
				self.fallingBlock.topleft.y-=(self.fallingBlock.height+self.gap);
				self.fallingBlock.setSquareCoors();
				self.fallingBlock.display();
				self.stillSquares.forEach(function(s){
					s.display();
				});
			}
		}else{
		  	requestID=requestAnimationFrame(animate);
		}
	}
	requestID=requestAnimationFrame(animate);
};

Game.prototype.rotate=function(angle){
	if(this.gameOver || this.paused) return;
	
	if (this.canRotate(this.fallingBlock)){
		this.triangle.rotate(angle);
		var self=this;
		this.stillSquares.forEach(function(s_s){
			self.rotateSquare(s_s, angle);
			// s_s.display();
		});
	}
};

Game.prototype.hitTest=function(block, lastCoor){
	var distance;
	for(var ii=0, nn=block.squares.length; ii<nn; ii++){
		var fallingX=block.squares[ii].topleft.x;
		var fallingY=block.squares[ii].topleft.y;
		for(var i=0; i<this.stillSquares.length; i++){
			var stillX=this.stillSquares[i].topleft.x;
			var stillY=this.stillSquares[i].topleft.y;
			distance=Math.sqrt((fallingX-stillX)*(fallingX-stillX)+
							    (fallingY-stillY)*(fallingY-stillY));
			if(distance<0.1){
				return true;
			}
		}

	}
	var halfOfTriangleSide=0.5*(this.squareSide*this.numOfSquareRow+this.gap*(this.numOfSquareRow+1));
	var yLimit=-halfOfTriangleSide/Math.sqrt(3)-this.gap;
	// console.log(yLimit);
	if(block.topleft.y+block.height>yLimit){
		// console.log('block.topleft.y+block.height', block.topleft.y+block.height);
		return true;
	}
	if(block.topleft.x<-halfOfTriangleSide||block.topleft.x+block.width>halfOfTriangleSide)
		return true;
	return false;
};

Game.prototype.canRotate=function(f_block){
	if(!f_block)
		return;
	if(f_block.topleft.y>=-this.line.r2center){
		return false;
	}
	return true;
};

Game.prototype.checkIfShouldClear=function(){
	var ys=[];
	var linesClearedNum=0;//消除的行数越多，加的分数越多。
	var scoreAddition=0;
	var step=this.squareSide+this.gap;
	var self=this;
	this.stillSquares.forEach(function(s){
		ys.push(s.topleft.y);
	});
	var triSide=this.squareSide*this.numOfSquareRow+this.gap*(this.numOfSquareRow+1);
	for(var y=Math.min(...ys), bottomY=-triSide/(Math.sqrt(3)*2); y<bottomY; y+=step){
		var numAtSameY=0;
		this.stillSquares.forEach(function(s){
			if(self.approximatelyEqual(y, s.topleft.y)) numAtSameY++;
		});
		if(numAtSameY==10){
			this.stillSquares=this.stillSquares.filter(function(s){
				if(self.approximatelyEqual(y, s.topleft.y)){
					s.disappear();
				}else
					return true;
			});
			for(var yy=y-step, minStillY=Math.min(...ys); yy>=minStillY; yy-=step){//因为下降会用到disappear方法，所以需要逐层下降
				self.stillSquares.forEach(function(s){
					if(self.approximatelyEqual(yy, s.topleft.y)){
						s.disappear();
						s.topleft.y+=step;
						s.moveApexes();
						s.display();
					}
				});
			}
			linesClearedNum++;
			scoreAddition+=linesClearedNum*10;
			
			if(self.fallingInterval>400){
				self.fallingInterval-=20;
				self.uiManager.showLandingInterval(self.fallingInterval);
			}
		}
	}
	if(scoreAddition>0){
		self.uiManager.displayScoreAddition(scoreAddition);
		self.score+=scoreAddition;
		self.uiManager.displayScore(self.score);
		self.checkForUpdatingBest();		
	}
};

Game.prototype.checkIfLose=function(){
	var loseEdge=-this.cx.canvas.height/2;
	var minStillY=0;
	this.stillSquares.forEach(function(s){
		minStillY=s.topleft.y<minStillY? s.topleft.y: minStillY;
	});

	if(minStillY<loseEdge){
		this.afterLosing();
		return true;
	}
};

Game.prototype.decideNextBlock=function(){
	var blockTypes=["I", "J", "L", "O", "S", "Z", "T"];
	this.nextBlockType=blockTypes[Math.floor(Math.random()*7)];
	//this.nextBlockType='L';
};

Game.prototype.giveBlockHint=function(){
	this.decideNextBlock();
	if(this.hintBlock)
		this.hintBlock.disappear();	
	this.hintBlock=new Block(this.nextBlockType, this.squareSide, this.gap, this.cx);
	this.hintBlock.topleft.x=-this.hintBlock.width/2;
	this.hintBlock.topleft.y=-this.squareSide*2;
	this.hintBlock.setSquareCoors();
	this.hintBlock.display();
};

Game.prototype.afterLosing=function(){
	this.gameOver = true;
	this.uiManager.lose();
};

Game.prototype.checkForUpdatingBest = function () {
	if (this.score > this.storageManager.getBestScore()) {
		this.storageManager.updateBestScore(this.score);
		this.uiManager.displayBest(this.score);
	}
}

Game.prototype.approximatelyEqual = function (num1, num2) {
	return Math.abs(num1 - num2) < 0.1;
}