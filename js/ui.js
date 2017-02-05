var ui={};

ui.displayScore=function(score){
	var scoreArea=document.querySelector(".score");
	scoreArea.innerText=score;
}
ui.displayScoreAddition=function(addition){
	// var additionEle=document.querySelector(".score-addition");

	var ScoreAndBest=document.querySelector('.score-and-best');
	if(ScoreAndBest.querySelector('.score-addition')) ScoreAndBest.removeChild(ScoreAndBest.querySelector('.score-addition'));
	var additionEle=document.createElement('div');
	additionEle.setAttribute('class', 'score-addition');
	var color;
	switch(addition){
		case 10:
			color="gray"; break;
		case 30:
			color="olive"; break;
		case 60:
			color="orange"; break;
		case 100:
			color="gold"; break;
	}
	additionEle.style.color=color;
	additionEle.innerText="+"+addition;
	ScoreAndBest.appendChild(additionEle);
	// $(additionEle).show();
	// $(additionEle).hide(2000);
};
ui.displayBest=function(bestScore){
	var bestArea=document.querySelector(".best");
	bestArea.innerText="BEST: "+ bestScore;
	// bestArea.innerText=bestScore;
};
ui.showLandingInterval=function(fallingInterval){
	var speedSpan=document.querySelector('.interval-value');
	speedSpan.innerText=fallingInterval+'ms';
}
ui.lose=function(){
	var loseInterface=document.querySelector(".lose-container");
	loseInterface.style.display="block";
}