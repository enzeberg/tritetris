function Triangle(angle,r,color,cx){//r means the radius of its circumcircle
  this.angle=angle;//下面顶点与中心连线与x轴正向的夹角
  this.r=r;
  this.color=color;
  this.cx=cx;
  this.apex1=new Vector(r*Math.cos(angle),r*Math.sin(angle));
  this.apex2=new Vector(r*Math.cos(angle+2*Math.PI/3),r*Math.sin(angle+2*Math.PI/3));
  this.apex3=new Vector(r*Math.cos(angle-2*Math.PI/3),r*Math.sin(angle-2*Math.PI/3));
}
Triangle.prototype.disappear=function(){
  var cx=this.cx;
  cx.strokeStyle=cx.canvas.style.backgroundColor;
  // cx.lineWidth=13.5;
  cx.lineWidth=0.11*this.r;
  makeClosedPath(cx, this.apex1, this.apex2, this.apex3);
  cx.stroke();
};
Triangle.prototype.display=function(){
  var cx=this.cx;
  // cx.lineWidth=10;
  cx.lineWidth=0.08*this.r;
  cx.lineJoin="round";
  cx.strokeStyle=this.color;
  makeClosedPath(cx, this.apex1, this.apex2, this.apex3);
  cx.stroke();
};
Triangle.prototype.rotate=function(angle){
  var step;
  var absAng1=0.08, absAng2;
  var self=this;
  var anglePassed=0;
  var requestID;
  function animate(){
    self.disappear(); 
    absAng2=Math.abs(angle-anglePassed);
    step=angle>0?Math.min(absAng1,absAng2):-Math.min(absAng1,absAng2);
    self.angle+=step;
    self.setApexes();
    self.display();
    anglePassed+=step;
    if(anglePassed==angle)
      cancelAnimationFrame(requestID);
    else
      requestID=requestAnimationFrame(animate);
  }
  requestID=requestAnimationFrame(animate);
};
Triangle.prototype.setApexes=function(){
  var angle=this.angle;
  var r=this.r;
  this.apex1.x=r*Math.cos(angle), this.apex1.y=r*Math.sin(angle);
  this.apex2.x=r*Math.cos(angle+2*Math.PI/3), this.apex2.y=r*Math.sin(angle+2*Math.PI/3);
  this.apex3.x=r*Math.cos(angle-2*Math.PI/3), this.apex3.y=r*Math.sin(angle-2*Math.PI/3);
};