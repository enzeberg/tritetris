function makeClosedPath(cx){
	cx.beginPath();
	cx.moveTo(arguments[1].x, arguments[1].y);
	for(var i=1;i<arguments.length;i++){
		cx.lineTo(arguments[i].x, arguments[i].y);
	}
	cx.closePath();
}
function makeLinePath(cx){
	cx.beginPath();
	cx.moveTo(arguments[1].x, arguments[1].y);
	cx.lineTo(arguments[2].x, arguments[2].y);
}
function maxFromAry(array){
	var max=array[0];
	for(var i=1; i<array.length; i++){
		max=Math.max(max, array[i]);
	}
	return max;
}
function minFromAry(array){
	var min=array[0];
	for(var i=0; i<array.length; i++){
		min=Math.min(min, array[i]);
	}
	return min;
}
function areSimilar(val1, val2){
	var difference=Math.abs(val1-val2);
	if(difference<0.1)
		return true;
}