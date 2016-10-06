function Triline(side, r2center, color, cx){
	this.side=side;
	this.r2center=r2center;
	this.color=color;
	this.cx=cx;
	this.initPointsAndThetas();
}
Triline.prototype.disappear=function(){
	var cx=this.cx;
	cx.lineWidth=5.5;
	cx.strokeStyle=cx.canvas.style.backgroundColor;
	for(var i=0;i<6;i+=2){
		makeLinePath(cx, this.points[i], this.points[i+1]);
		cx.stroke();
	}
};
Triline.prototype.display=function(){
	var cx=this.cx;
	cx.lineWidth=1;
	cx.lineCap="round";
	cx.strokeStyle=this.color;
	for(var i=0;i<6;i+=2){
		makeLinePath(cx, this.points[i], this.points[i+1]);
		cx.stroke();
	}
};
Triline.prototype.rotate=function(angle){
	var step;
	var absAng1=0.08, absAng2;
	var self=this;
	var anglePassed=0;
	var requestID;
	function animate(){
	self.disappear(); 
	absAng2=Math.abs(angle-anglePassed);
	step=angle>0?Math.min(absAng1,absAng2):-Math.min(absAng1,absAng2);
	for(var i=0;i<6;i++){
	  self.thetas[i]+=step;
	}
	self.rotatePoints();
	self.display();
	anglePassed+=step;
	if(anglePassed==angle)
	  cancelAnimationFrame(requestID);
	else
	  requestID=requestAnimationFrame(animate);
	}
	requestID=requestAnimationFrame(animate);
}
Triline.prototype.initPointsAndThetas=function(){
	this.points=[];
	this.thetas=[];
	this.points[0]=new Vector(-this.side/2, -this.r2center);
	this.points[1]=new Vector(this.side/2, -this.r2center);
	var r=Math.sqrt(this.points[0].x*this.points[0].x+this.points[0].y*this.points[0].y);
	this.thetas[0]=Math.atan(this.points[0].y/this.points[0].x);
	this.thetas[0]=-(Math.PI-this.thetas[0]);
	this.thetas[1]=Math.atan(this.points[1].y/this.points[1].x);
	for(var i=2;i<6;i++){
		this.thetas[i]=this.thetas[i-2]+2*Math.PI/3;
		this.points[i]=new Vector(r*Math.cos(this.thetas[i]), r*Math.sin(this.thetas[i]));
		
	}
};
Triline.prototype.rotatePoints=function(){
	var r=Math.sqrt(this.points[0].x*this.points[0].x+this.points[0].y*this.points[0].y);
	for(var i=0; i<6; i++){
		this.points[i].x=r*Math.cos(this.thetas[i]);
		this.points[i].y=r*Math.sin(this.thetas[i]);
	}
}