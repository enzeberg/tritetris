function Game(squareSide, cx){
	this.squareSide=squareSide;
	this.numOfSquareRow=10;
	this.cx=cx;
	// this.gap=4;
	this.gap=1/4*this.squareSide;
}
Game.prototype.start=function(){
	this.stillSquares=[];//save the squares that are already still on the triangle.
	this.score=0;
	ui.displayScore(this.score);
	this.initBestStorage();
	this.bestScore=localStorage.getItem("t_best")||0;
	ui.displayBest(this.bestScore);
	this.fallingInterval=1000; 
	this.prepareTriangle();
	this.prepareLine();
	this.decideNextBlock();
	this.prepareBlocks();
	ui.showLandingInterval(this.fallingInterval);
	this.giveBlockHint();
	this.onKeyboard();
	this.onTouchScreen();
	this.onMouse();
	window.focus();
};
Game.prototype.pause=function(){
	if(this.interval)
		clearInterval(this.interval);
	if(this.fallingBlock){
		this.hoverBlock=this.fallingBlock;
		this.fallingBlock=null;
	}
};
Game.prototype.continue=function(){
	this.makeBlockFall(this.hoverBlock);
	this.hoverBlock=null;
};
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
Game.prototype.prepareBlocks=function(){
	var block=new Block(this.nextBlockType, this.squareSide, this.gap, cx);
	this.makeBlockFall(block);
};
Game.prototype.makeBlockFall=function(block){
	// block.still=false;
	console.log(this.stillSquares.length);
	if(!block) return;
	var step=this.squareSide+this.gap;
	var self=this;
	self.fallingBlock=block;
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
			// block.still=true;
			block.squares.forEach(function(s){
				self.stillSquares.push(s);
			});
			if(!self.checkIfLose()){
				self.checkIfShouldClear();
				self.newBlock();
				self.giveBlockHint();
			}
			
		}
					
	},	self.fallingInterval);
	self.line.display();
};
Game.prototype.deformBlock=function(block){
	if(!block)
		return;
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
Game.prototype.newBlock=function(){
	var block=new Block(this.nextBlockType, this.squareSide, this.gap, cx);
	this.makeBlockFall(block);
};
Game.prototype.moveBlock=function(block, direction){
	/*if(block.still)
    	return;*/
    if(!block) return;
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
	this.triangle.rotate(angle);
	var self=this;
	this.stillSquares.forEach(function(s_s){
		self.rotateSquare(s_s, angle);
		// s_s.display();
	});
};
Game.prototype.onKeyboard=function(){
	var self=this;
	// addEventListener("keyup", function(e){
	$(window).bind('keyup', function(e){
		if(self.canRotate(self.fallingBlock)){
			switch(e.keyCode){
				case 65:
					self.rotate(Math.PI*2/3);
					break;
				case 68:
					self.rotate(-Math.PI*2/3);
					break;
			}
		}
	});
	// addEventListener("keydown",function(e){
	$(window).bind('keydown', function(e){
		switch(e.keyCode){
			case 38:
			e.preventDefault();
			self.deformBlock(self.fallingBlock);
			break;
			case 37:
			e.preventDefault();
			self.moveBlock(self.fallingBlock, "left");
			break;
			case 39:
			e.preventDefault();
			self.moveBlock(self.fallingBlock, "right");
			break;
			case 40:
			e.preventDefault();
			self.moveBlock(self.fallingBlock, "down");
			break;
		}
	});

};
Game.prototype.onTouchScreen=function(){
	var self=this;
	var canvas=self.cx.canvas;
	var startTouch;
	var deformDiv=document.querySelector('.deform');
	// deformDiv.addEventListener('touchstart', function(e){
	$(deformDiv).bind('touchstart', function(e){
		e.preventDefault();
		self.deformBlock(self.fallingBlock);
	})
	// canvas.addEventListener('touchstart', function(e){
	$(canvas).bind('touchstart', function(e){
		e.preventDefault();
		startTouch=e.changedTouches[0];
	});
	// canvas.addEventListener('touchmove', function(e){
	$(canvas).bind('touchmove', function(e){
		var currentTouch=e.changedTouches[0];
		var touchType=judgeTouchType(startTouch, currentTouch, self.squareSide*4);
		if(touchType=='up'){
			self.deformBlock(self.fallingBlock);
			startTouch=currentTouch;
		}else if(touchType=='left'){
			self.moveBlock(self.fallingBlock, 'left');
			startTouch=currentTouch;
		}else if(touchType=='right'){
			self.moveBlock(self.fallingBlock, 'right');
			startTouch=currentTouch;
		}else if(touchType=='down'){
			self.moveBlock(self.fallingBlock, 'down');
			startTouch=currentTouch;
		}
		
	});
	// canvas.addEventListener('touchend', function(e){
	$(canvas).bind('touchend', function(e){
		startTouch=null;
	});
	var shunBtn=document.querySelector('#shun');
	var niBtn=document.querySelector('#ni');
	// shunBtn.addEventListener('touchstart', function(e){
	$(shunBtn).bind('touchstart', function(e){
		e.preventDefault();
		if(self.canRotate(self.fallingBlock)){
			self.rotate(Math.PI*2/3);
		}
	});
	// niBtn.addEventListener('touchstart', function(e){
	$(niBtn).bind('touchstart', function(e){
		e.preventDefault();
		if(self.canRotate(self.fallingBlock)){
			self.rotate(-Math.PI*2/3);
		}
	})
};
Game.prototype.onMouse=function(){
	var self=this;
	var pauseBtn=document.querySelector('.pause');
	var pauseBtnSpan=pauseBtn.querySelector('span');
	$(pauseBtn).bind('click', function(){
		if(pauseBtnSpan.innerText=='Pause'){
			self.pause();
			pauseBtnSpan.innerText='Continue';
		}else if(pauseBtnSpan.innerText=='Continue'){
			self.continue();
			pauseBtnSpan.innerText='Pause';
		}
	})
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
	for(var y=minFromAry(ys), bottomY=-triSide/(Math.sqrt(3)*2); y<bottomY; y+=step){
		var numAtSameY=0;
		this.stillSquares.forEach(function(s){
			if(areSimilar(y, s.topleft.y)) numAtSameY++;
		});
		if(numAtSameY==10){
			this.stillSquares=this.stillSquares.filter(function(s){
				if(areSimilar(y, s.topleft.y)){
					s.disappear();
				}else
					return true;
			});
			for(var yy=y-step, minStillY=minFromAry(ys); yy>=minStillY; yy-=step){//因为下降会用到disappear方法，所以需要逐层下降
				self.stillSquares.forEach(function(s){
					if(areSimilar(yy, s.topleft.y)){
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
				ui.showLandingInterval(self.fallingInterval);
			}
		}
	}
	if(scoreAddition>0){
		ui.displayScoreAddition(scoreAddition);
		self.score+=scoreAddition;
		ui.displayScore(self.score);
		self.handleBestStorage();
		ui.displayBest(self.bestScore);
	}

};
Game.prototype.checkIfLose=function(){
	// var triSide=this.squareSide*this.numOfSquareRow+this.gap*(this.numOfSquareRow+1);
	// var loseEdge=-triSide/(Math.sqrt(3)*2)-10*this.squareSide-9*this.gap;
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
Game.prototype.initBestStorage=function(){
	if(window.localStorage){
		if(localStorage.getItem("t_best")==null)
			localStorage.setItem("t_best", 0);
	}
};
Game.prototype.handleBestStorage=function(){
	if(localStorage.getItem("t_best")){
		if(this.score>parseInt(localStorage.getItem("t_best"))){
			localStorage.setItem("t_best", this.score);
		}
	}
	this.bestScore=localStorage.getItem("t_best");
}

Game.prototype.afterLosing=function(){
	
	ui.lose();
	$(window).unbind();
	$('canvas').unbind();
	$('.deform').unbind();
	$('#shun').unbind();
	$('#ni').unbind();
	$('.pause').unbind();
};






