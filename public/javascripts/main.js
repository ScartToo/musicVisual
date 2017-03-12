function $(s){
	return document.querySelectorAll(s);
}

var lis = $("#list li");
var size = 32 ;
var lisWidth = lis[1].clientWidth;
var box = $("#box")[0];
var height,width;
//加入canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
box.appendChild(canvas);
var Dots = [];
var line;
var mv = new MusicVisualizer({
	size: size,
	visualizer: draw
});
var prev = 0 ;
for (var i = 0,len = lis.length; i < len; i++) {
	lis[i].onclick = function(){
		for (var j = 0; j < len; j++) {
			lis[j].className = "";
		}
		this.className = "selected";
		mv.play("/media/"+this.title);
		prev = this.getAttribute("num");
		toggle();
	}
}
function random(m,n){
	return Math.round(Math.random()*(n-m) + m);
}
function getDots(){
	Dots = [];
	for (var i = 0; i < size; i++) {
		var x = random(0, width);
		var y = random(0, height);
		var color = "rgba("+random(0,255)+","+random(0,255)+","+random(0,255)+",0)";
		Dots.push({
			x: x,
			y: y,
			dx: random(1,2),
			color: color,
			cap: 0,
			dx2: 0,
			dotMode: "move"
		});
	}
}

function resize(){
	height = box.clientHeight;
	width = box.clientWidth - 10;
	canvas.height = height;
	canvas.width = width;
	line = ctx.createLinearGradient(0,0,0,height);
	line.addColorStop(0,"red");
	line.addColorStop(0.3,"pink");
	line.addColorStop(0.8,"yellow");
	line.addColorStop(1,"green");
	getDots();
};
resize();
window.onresize = resize;
//绘画canvas
function draw(arr){
	ctx.clearRect(0,0,width,height);
	var w = width / size;
	var cw = w * 0.6;
	var capH = 10;
	ctx.fillStyle = line;
	for (var i = 0; i < size; i++) {
		var o = Dots[i];
		if (draw.type == "column") {
			var h = arr[i] / 256 *height/1.2;
			ctx.fillRect(w * i+10, height - h, cw, h);
			ctx.fillRect(w * i+10, height - (o.cap+capH), cw, capH);
			o.cap--;
			if (o.cap < 0) {
				o.cap = 0;
			}
			if (h > 0 && o.cap < h + 40) {
				o.cap = h + 40 > height - capH ? height - capH : h + 40; 
			}
		}else if(draw.type == "dot"){
			ctx.beginPath();
			var r = 10 +arr[i]/512 * (height > width ? width : height)/10;
			ctx.arc(o.x, o.y, r,0,Math.PI*2, true);
			var g = ctx.createRadialGradient(o.x, o.y,0,o.x, o.y, r);
			g.addColorStop(0,"#fff");
			g.addColorStop(1,o.color);
			ctx.fillStyle = g;
			ctx.fill();
			o.dx2 = o.dx;
			o.x += o.dx;
			o.x =( o.x > width) ? 0 : o.x;
			//ctx.strokeStyle = "#fff";
			//ctx.stroke();
		}
	}
}
canvas.onclick = function (){
	if (draw.type == "dot") {
		for (var i = 0; i < size; i++) {
			Dots.dotMode == "move" ? Dots[i].dx = 0 : Dots[i].dx = Dots[i].dx2;
		}
		Dots.dotMode = Dots.dotMode == "static" ?  "move" : "static";
	}
}
draw.type = "dot";
var types = $("#type li");
for (var i = 0; i < types.length; i++) {
	types[i].onclick = function(){
		for (var j = 0; j < types.length; j++) {
			types[j].className = "";
		}
		this.className = "selected";
		draw.type = this.getAttribute("data-type");
	}
}
//实现按钮改变正在播放的歌曲与切换歌曲
$("#volume")[0].onchange = function () {
	this.onmousemove = function(){
		mv.changeVolume(this.value/this.max);
	}
}	
var volumeValue = $("#volume")[0].getAttribute("value");
$("#mute")[0].onclick = function () {
	if (this.className == "vlumezero") {
		this.className = "volume";
		mv.changeVolume(volumeValue);
		$("#volume")[0].setAttribute("value",volumeValue);
	}else{
		this.className = "vlumezero";
		mv.changeVolume(0);	
		$("#volume")[0].setAttribute("value","0");
	}
}
$("#volume")[0].addEventListener("touchmove",function(e){
	mv.changeVolume(this.value/this.max);
});
$("#volume")[0].onchange(); 
$("#switch")[0].onclick = function (){
	toggle();
}
function toggle(){
	var tog =  $("#switch")[0];
	if (tog.className == "stop") {
		mv.play("/media/"+lis[prev].title);		
		lis[prev].className = "selected";	
		tog.className = "";
		tog.className = "start";
	}else if (tog.className == "start") {
		mv.stop();
		tog.className = "";
		tog.className = "stop";
	}
}
$(".prev")[0].onclick = function(){
	if (prev == 0) {
		alert("已经是第一首了！");
		return;
	}else{
		for (var j = 0; j < len; j++) {
		lis[j].className = "";
		}
		lis[--prev].className = "selected";
		mv.play("/media/"+lis[prev].title);
	}	
}
$(".next")[0].onclick = function(){
	if (prev == lis.length) {
		alert("已经是最后一首了！");
		return;
	}else{
		for (var j = 0; j < len; j++) {
		lis[j].className = "";
		}
		lis[++prev].className = "selected";
		mv.play("/media/"+lis[prev].title);
	}
}
//屏幕小于720时,修改部分样式
window.onload = function(){
	var sw = screen.width;
	if (sw <= 720) {
		$("#flag")[0].className = "show";
		$("#flag")[0].setAttribute("flag",0);
		$("#flag")[0].onclick = function(){
			var flag = $("#flag")[0].getAttribute("flag");
			showHide("","fadeOutRight","","fadeInRight");
			var list = $("#list")[0];
			list.className ="";
			if (flag == 0) {
				list.className +=" fadeOut720";
			}else{
				list.className +=" fadeIn720";
			}
		}
	}
}
//按钮使清单隐藏与实现
$("#flag")[0].onclick = function(){
	showHide("fadeOut","fadeInRight","fadeIn","fadeOutRight");
}
//清单现实与隐藏函数
function showHide(fadeOut,fadeInRight,fadeIn,fadeOutRight){
	var fg = $("#flag")[0];
	var flag = fg.getAttribute("flag");
	var listNav = $(".content .left")[0];
	var rightBox = $(".content .right")[0];
	listNav.className = "left";
	rightBox.className = "right";
	if (flag == 1 ) {
		fg.className = "show";
		$("#flag")[0].setAttribute("flag",0);
		listNav.className += " fadeOut";
		rightBox.className += " fadeInRight";
	}else {
		fg.className = "hide";
		$("#flag")[0].setAttribute("flag",1);
		listNav.className += " fadeIn";
		rightBox.className += " fadeOutRight";
	}
}
//获取本地音乐文件--未完成
$("#addMusic").onchange = function(){
	stop.preventDefault();
	console.log(this);
	var files = this.files[0];
	var reader = new FileReader();
	reader.readAsBinaryString(file);
	reader.onload = function(e){
		visualizer.play(e.target.result);
	}
	files.readAsArrayBuffer(file);
}

