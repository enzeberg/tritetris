function Square(topleft, side, color, cx){
  this.topleft=new Vector(topleft.x,topleft.y);
  this.side=side;
  this.color=color;
  this.cx=cx;
  this.apex1=new Vector(topleft.x, topleft.y);
  this.apex2=new Vector(topleft.x+side, topleft.y);
  this.apex3=new Vector(topleft.x+side, topleft.y+side);
  this.apex4=new Vector(topleft.x, topleft.y+side);
  this.apexes=[];
  this.apexes.push(this.apex1, this.apex2, this.apex3, this.apex4);
  this.thetas=[];
}
Square.prototype.disappear=function(){
  var cx=this.cx;
  //cx.fillStyle=cx.canvas.style.backgroundColor;
  cx.strokeStyle=cx.canvas.style.backgroundColor;
  cx.lineWidth=3.5;
  makeClosedPath(cx, this.apex1, this.apex2, this.apex3, this.apex4);
  //cx.fill();
  cx.stroke();//这样做可以清楚Square旋转而留下的痕迹，痕迹可能是边框造成的（虽然display中没有stroke边框）。
}
Square.prototype.display=function(){
  var cx=this.cx;
  cx.strokeStyle=this.color;
  cx.lineWidth=2;
  cx.lineJoin="miter";
  //cx.fillStyle=this.color;
  makeClosedPath(cx, this.apex1, this.apex2, this.apex3, this.apex4);
  cx.stroke();
  //cx.fill();//fill总会造成方块间存在间隙，甚至是一些很不好的形状。
};
Square.prototype.rotate=function(angle){
  var step;
  var absAng1=0.08, absAng2;
  var self=this;
  var anglePassed=0;
  var requestID;
  function animate(){
    self.disappear(); 
    absAng2=Math.abs(angle-anglePassed);
    step=angle>0?Math.min(absAng1,absAng2):-Math.min(absAng1,absAng2);
    for(var i=0;i<4;i++){
      self.thetas[i]+=step;
    }
    self.rotateApexes();
    self.display();
    anglePassed+=step;
    if(anglePassed==angle)
      cancelAnimationFrame(requestID);
    else
      requestID=requestAnimationFrame(animate);
  }
  requestID=requestAnimationFrame(animate);
};
Square.prototype.moveApexes=function(){
  this.apex1.x=this.topleft.x; this.apex1.y=this.topleft.y;
  this.apex2.x=this.topleft.x+this.side; this.apex2.y=this.topleft.y;
  this.apex3.x=this.topleft.x+this.side; this.apex3.y=this.topleft.y+this.side;
  this.apex4.x=this.topleft.x; this.apex4.y=this.topleft.y+this.side;
  this.setThetasBasedOnApexes();
};
Square.prototype.rotateApexes=function(){
  var r0=Math.sqrt(this.topleft.x*this.topleft.x+this.topleft.y*this.topleft.y);
  this.topleft.x=r0*Math.cos(this.thetas[0]);
  this.topleft.y=r0*Math.sin(this.thetas[0]);
  for(var i=0;i<4;i++){
    var apex=this.apexes[i];
    var r=Math.sqrt(apex.x*apex.x+apex.y*apex.y);
    apex.x=r*Math.cos(this.thetas[i]);
    apex.y=r*Math.sin(this.thetas[i]);
  }
  //在该函数调用之前，thetas就已经更新了，如果再更新，就会出现错误。
  //this.setThetasBasedOnApexes();
};
Square.prototype.setThetasBasedOnApexes=function(){
  if(this.thetas.length!=0)
    this.thetas.length=0;
  var theta1=this.apex1.x===0?-Math.PI/2:Math.atan(this.apex1.y/this.apex1.x);
  var theta2=this.apex2.x===0?-Math.PI/2:Math.atan(this.apex2.y/this.apex2.x);
  var theta3=this.apex3.x===0?-Math.PI/2:Math.atan(this.apex3.y/this.apex3.x);
  var theta4=this.apex4.x===0?-Math.PI/2:Math.atan(this.apex4.y/this.apex4.x);
  
  this.thetas.push(theta1, theta2, theta3, theta4);
  for(var i=0;i<4;i++){
    if(this.thetas[i]>0){
      this.thetas[i]=-(Math.PI-this.thetas[i]);
    }
  }
};
