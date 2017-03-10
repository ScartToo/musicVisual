function $(s){
	return document.querySelectorAll(s);
}
var lis = $("#list li");
for (var i = 0,len = lis.length; i < len; i++) {
	lis[i].onclick = function(){
		for (var j = 0; j < len; j++) {
			lis[j].className = "";
		}
		this.className = "selected";
		load("/media/"+this.title);
	}
}
var xhr = new XMLHttpRequest();
var ac = new (window.AudioContext || window.wenkitAudioContext)();
var gainNode = ac[ac.createGain?"createGain":"createGainNode"]();
gainNode.connect(ac.destination);
var analyser = ac.createAnalyser();
var size = 128 ;
analyser.fftSize = size * 2;
analyser.connect(gainNode);
var source = null;
var count = 0;//记录第几首歌
var box= $("#box")[0];
var height,width;
//加入canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
box.appendChild(canvas);
var Dots = [];
function random(m,n){
	return Math.round(Math.random()*(n-m) + m);
}
function getDots(){
	Dots = [];
	for (var i = 0; i < size; i++) {
		var x = random(0, width);
		var y = random(0, height);
		var color = "rgb("+random(0,255)+","+random(0,255)+","+random(0,255)+")";
		Dots.push({
			x: x,
			y: y,
			color: color
		});
	}
}
var line;
function resize(){
	height = box.clientHeight;
	width = box.clientWidth;
	canvas.height = height;
	canvas.width = width;
	line = ctx.createLinearGradient(0,0,0,height);
	line.addColorStop(0,"red");
	line.addColorStop(0.5,"yellow");
	line.addColorStop(1,"green");
	getDots();
};
resize();
window.onresize = resize;
//绘画canvas
function draw(arr){
	ctx.clearRect(0,0,width,height);
	var w = width / size;
	ctx.fillStyle = line;
	for (var i = 0; i < size; i++) {
		if (draw.type == "column") {
			var h = arr[i] / 256 *height;
			ctx.fillRect(w * i, height - h, w*0.6, h);
		}else if(draw.type == "dot"){
			ctx.beginPath();
			var o = Dots[i];
			var r = arr[i]/256*50;
			ctx.arc(o.x, o.y, r,0,Math.PI*2, true);
			var g = ctx.createRadialGradient(o.x, o.y,0,o.x, o.y, r);
			g.addColorStop(0,"#fff");
			g.addColorStop(1,o.color);
			ctx.fillStyle = g;
			ctx.fill();
			//ctx.strokeStyle = "#fff";
			//ctx.stroke();
		}
	}
}
draw.type = "column";
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
//获取音频数据
function load(url){
	//bug:点击其他音频一起播放
	var n = ++count;
	source && source[source.stop ?"stop":"noteOff"]();
	xhr.abort();
	xhr.open("GET",url);
	//f返回值类型
	xhr.responseType = "arraybuffer";
	//请求成功的回调函数
	xhr.onload = function () {
		//解决音频一起播放bug
		if (n != count) retuen ;
		ac.decodeAudioData(xhr.response, function (buffer){
			//创建音频聚集地
			var bufferSource = ac.createBufferSource();
			bufferSource.buffer = buffer;
			//bufferSource.connect(ac.destination);	
			//bufferSource.connect(gainNode);analyser已经相连了
			bufferSource.connect(analyser);
			bufferSource[bufferSource.start?"start":"noteOn"](0);
			source = bufferSource;
		},function (err){
			console.log(err);
		});
	}
	xhr.send();
}
//实时获取音频数据
function visualizer(){
	var arr= new Uint8Array(analyser.frequencyBinCount);
	//arr 音频数据
	//requestAnimationFrame绘制动画
	requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;
	function v(){
		analyser.getByteFrequencyData(arr);
		requestAnimationFrame(v);
		draw(arr);
	}
	requestAnimationFrame(v);
}
visualizer();
function changeVolume(percent){
	gainNode.gain.value = percent * percent;
}
$("#volume")[0].onchange = function () {
	changeVolume(this.value/this.max);
}
$("#volume")[0].onchange(); 