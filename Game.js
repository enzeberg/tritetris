function Game(squareSide, cx){
	this.squareSide=squareSide;
	this.numOfSquareRow=10;
	this.cx=cx;
	this.gap=4;
}
Game.prototype.start=function(){
	this.stillSquares=[];//save the squares that are already still on the triangle.
	this.score=0;
	this.fallingInterval=1000;
	this.prepareTriangle();
	this.prepareTriline();
	this.designNextBlock();
	this.prepareBlocks();
	this.giveBlockHint();
	this.onKeyboard();
	this.displayScore();
	document.focus();
};
Game.prototype.prepareTriangle=function(){
	var triSide=this.squareSide*this.numOfSquareRow+this.gap*(this.numOfSquareRow+1);
	var r=Math.sqrt(3)/3*triSide;
	this.triangle=new Triangle(Math.PI/2, r, "gray", this.cx);
	this.triangle.display();
};
Game.prototype.prepareTriline=function(){
	var triSide=this.squareSide*this.numOfSquareRow+this.gap*(this.numOfSquareRow+1);
	this.triline=new Triline(triSide, 142, "gray", this.cx);
	this.triline.display();
};
Game.prototype.prepareBlocks=function(){
	var block=new Block(this.nextBlockType, this.squareSide, this.gap, cx);
	this.makeBlockFall(block);
};
Game.prototype.makeBlockFall=function(block){
	// block.still=false;
	var interval;
	var step=this.squareSide+this.gap;
	var self=this;
	self.fallingBlock=block;
	var hitted=false;
	interval=setInterval(function(){
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
			clearInterval(interval);
			// block.still=true;
			for(var k in block.squares){
			  self.stillSquares.push(block.squares[k]);
			}
			if(!self.checkIfLose()){
				self.checkIfShouldClear();
				self.newBlock();
				self.giveBlockHint();
			}
			clearTimeout(timeout);
				
		}
					
	},	self.fallingInterval);
	
	self.triline.display();
};
Game.prototype.makeBlockDeform=function(block){
	block.disappear();
	var patternRecord=block.pattern;
	for(var i=0;i<block.patterns.length;i++){
		if(block.pattern==block.patterns[i]){
		  block.pattern=block.patterns[i+1]?block.patterns[i+1]:block.patterns[0];
		  break;
		}
	}
	block.setSquareCoors();
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
Game.prototype.makeBlockMove=function(block, direction){
	/*if(block.still)
    	return;*/
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
	this.triline.display();

};
Game.prototype.onKeyboard=function(){
	var yLimit=-this.triangle.r/2-4;
	var self=this;
	addEventListener("keyup", function(e){
		if(self.canRotate(self.fallingBlock)){
			switch(e.keyCode){
				case 65:
					self.triangle.rotate(2*Math.PI/3);
					self.triline.rotate(2*Math.PI/3);
					self.stillSquares.forEach(function(square){
						square.rotate(2*Math.PI/3);
					});
					break;
				case 68:
					self.triangle.rotate(-2*Math.PI/3);
					self.triline.rotate(-2*Math.PI/3);
					self.stillSquares.forEach(function(square){
						square.rotate(-2*Math.PI/3);
					});
					break;
			}
		}
	});
	addEventListener("keydown",function(e){
		switch(e.keyCode){
		  case 38:
		    e.preventDefault();
		    self.makeBlockDeform(self.fallingBlock);
		    break;
		  case 37:
		    e.preventDefault();
		    self.makeBlockMove(self.fallingBlock, "left");
		    break;
		  case 39:
		    e.preventDefault();
		    self.makeBlockMove(self.fallingBlock, "right");
		    break;
		  case 40:
		    e.preventDefault();
		    self.makeBlockMove(self.fallingBlock, "down");
		    break;
		}
	});

};
Game.prototype.hitTest=function(block, lastCoor){
	var distance;
	for(var k in block.squares){
		var fallingX=block.squares[k].topleft.x;
		var fallingY=block.squares[k].topleft.y;
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
	if(block.topleft.y+block.height>-60)
		return true;
	if(block.topleft.x<-100||block.topleft.x+block.width>100)
		return true;
	return false;
};
Game.prototype.canRotate=function(f_block){
	if(f_block.topleft.y>=-this.triline.r2center){
		return false;
	}
	return true;
};
Game.prototype.checkIfShouldClear=function(){
	var ys=[];
	var step=this.squareSide+this.gap;
	var self=this;
	for(var i=0; i<this.stillSquares.length; i++){
		ys.push(this.stillSquares[i].topleft.y);
	}
	var squaresAtSameY=[];
	for(var y=minFromAry(ys); y<-60; y+=step){
		squaresAtSameY.length=0;
		for(var k in this.stillSquares){
			var difference=Math.abs(y-this.stillSquares[k].topleft.y);
			if(difference<0.1){
				squaresAtSameY.push(this.stillSquares[k]);
			}
		}
		if(squaresAtSameY.length==10){
			squaresAtSameY.forEach(function(s){
				for(var i=0; i<self.stillSquares.length; i++){
					var stillSquare=self.stillSquares[i];					
					if(stillSquare.topleft.x==s.topleft.x&&stillSquare.topleft.y==s.topleft.y){
						stillSquare.disappear();
						self.stillSquares.splice(i, 1);
					}
				}
			});	
			for(var yy=y-step; yy>=minFromAry(ys); yy-=step){
				for(var i=0; i<self.stillSquares.length; i++){
					var difference=Math.abs(yy-self.stillSquares[i].topleft.y);
					if(difference<0.1){
						self.stillSquares[i].disappear();
						self.stillSquares[i].topleft.y+=step;
						self.stillSquares[i].moveApexes();
						self.stillSquares[i].display();
					}
				}
			}
			this.score+=10;
			self.displayScore();
			if(this.fallingInterval>200)
				this.fallingInterval-=20;
		}
	}
};
Game.prototype.checkIfLose=function(){
	var minStillY=-80;
	for(var k in this.stillSquares){
		minStillY=this.stillSquares[k].topleft.y<minStillY?
					this.stillSquares[k].topleft.y:
					minStillY;
	}
	if(minStillY<-(this.cx.canvas.height/2-this.squareSide)){
		this.afterLosing();
		return true;
	}
};
Game.prototype.designNextBlock=function(){
	var blockTypes=["I", "J", "L", "O", "S", "Z", "T"];
	this.nextBlockType=blockTypes[Math.floor(Math.random()*7)];
};
Game.prototype.giveBlockHint=function(){
	this.designNextBlock();
	if(this.hintBlock)
		this.hintBlock.disappear();	
	this.hintBlock=new Block(this.nextBlockType, this.squareSide, this.gap, this.cx);
	this.hintBlock.topleft.x=-this.hintBlock.width/2;
	this.hintBlock.topleft.y=-30;
	this.hintBlock.setSquareCoors();
	this.hintBlock.display();
};
Game.prototype.displayScore=function(){	
	var scoreArea=document.querySelector("#score");
	scoreArea.innerText=this.score;	
};
Game.prototype.afterLosing=function(){
	var loseInterface=document.querySelector("#lose");
	loseInterface.style.display="block";
};



