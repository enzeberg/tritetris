function Line(length, r2center, color, cx){
	this.length=length;
	this.r2center=r2center;
	this.color=color;
	this.cx=cx;
}
Line.prototype.display=function(){
	var cx=this.cx;
	cx.strokeStyle=this.color;
	cx.lineWidth=1;
	cx.beginPath();
	cx.moveTo(-this.length/2, -this.r2center);
	cx.lineTo(this.length/2, -this.r2center);
	cx.stroke();
};