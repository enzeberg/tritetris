function Block(shape,squareSide,gap,cx){
  this.squareSide=squareSide;
  this.gap=gap;
  this.cx=cx;
  var cvHeight=cx.canvas.height;
  var color;
  var col, row;
  var pattern1,pattern2,pattern3,pattern4;
  this.patterns=[];
  this.pattern="";
  this.squares=[];
  this.still=true; //a new block is still by default.
  switch(shape){
    case "I":
      color="wheat";
      pattern1="00010203";
      pattern2="00102030";
      pattern3=pattern1;
      pattern4=pattern2;
      break;
    case "J":
      color="hotpink";
      pattern1="10111202";
      pattern2="00011121";
      pattern3="00010210";
      pattern4="00102021";
      break;
    case "L":
      color="aqua";
      pattern1="00010212";
      pattern2="00102001";
      pattern3="00101112";
      pattern4="01112120";
      break;
    case "O":
      color="mediumpurple";
      pattern1="00011011";
      pattern2="00100111";
      pattern3="00101101";
      pattern4="00011110";
      break;
    case "S":
      color="olive";
      pattern1="01111020";
      pattern2="00011112";
      pattern3=pattern1;
      pattern4=pattern2;
      break;
    case "Z":
      color="navajowhite";
      pattern1="00101121";
      pattern2="10110102";
      pattern3=pattern1;
      pattern4=pattern2;
      break;
    case "T":
      color="tomato";
      pattern1="01111021";
      pattern2="00010211";
      pattern3="00102011";
      pattern4="01101112";
      break;
  }
  this.patterns.push(pattern1,pattern2,pattern3,pattern4);
  this.pattern=this.patterns[0];
  //this.topleft=new Vector(-this.squareSide, -cvHeight/2);
  var triSide=this.squareSide*10+this.gap*11;
  var startY=-10*this.squareSide-9*this.gap-triSide-3;
  //console.log('startY', startY);
  this.topleft=new Vector(-this.squareSide, startY);
  var maxCol=this.pattern[0], maxRow=this.pattern[1];
  for(var i=0;i<4;i++){
    col=this.pattern[2*i]; row=this.pattern[2*i+1];

    var s=new Square(new Vector(this.topleft.x+col*squareSide, 
                                this.topleft.y+row*squareSide), squareSide, color, cx);
    this.squares.push(s);
    maxCol=Math.max(maxCol, col); maxRow=Math.max(maxRow, row);

  }
  this.width=(maxCol+1)*this.squareSide+maxCol*this.gap;
  this.height=(maxRow+1)*this.squareSide+maxRow*this.gap;
}
Block.prototype.disappear=function(){  //精确考虑的话，需要调用Square的disappear方法
  this.squares.forEach(function(s){
    s.disappear();
  });
};
Block.prototype.display=function(){
  this.squares.forEach(function(s){
    s.display();
  });
};
Block.prototype.rotate=function(angle){
  if(this.still){
    this.squares.forEach(function(square){
      square.rotate(angle);
    });
  }
};
/*Block.prototype.deform=function(){
  this.disappear();
  for(var i=0;i<this.patterns.length;i++){
    if(this.pattern==this.patterns[i]){
      this.pattern=this.patterns[i+1]?this.patterns[i+1]:this.patterns[0];
      break;
    }
  }
  this.setSquareCoors();
  this.display();
};*/

Block.prototype.setSquareCoors=function(){
  var maxCol=this.pattern[0], maxRow=this.pattern[1];
  for(var i=0;i<4;i++){
    var col=this.pattern[2*i]; var row=this.pattern[2*i+1];
    this.squares[i].topleft.x=this.topleft.x+col*this.squareSide+col*this.gap;
    this.squares[i].topleft.y=this.topleft.y+row*this.squareSide+row*this.gap;
    this.squares[i].moveApexes();
    maxCol=Math.max(maxCol, col); maxRow=Math.max(maxRow, row);
  }
  this.width=(maxCol+1)*this.squareSide+maxCol*this.gap;
  this.height=(maxRow+1)*this.squareSide+maxRow*this.gap;
};
