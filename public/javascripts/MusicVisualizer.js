function MusicVisualizer(obj) {
	this.source = null;

	this.count = 0;
	this.analyser = MusicVisualizer.ac.createAnalyser();
	this.size = obj.size;
	this.analyser.fftSize = this.size * 2;
	//控制音量节点
	this.gainNode = MusicVisualizer.ac[MusicVisualizer.ac.createGain ? "createGain":"createGainNode"]();
	//节点连接到destination属性上
	this.gainNode.connect(MusicVisualizer.ac.destination);

	this.analyser.connect(this.gainNode);

	this.xhr = new XMLHttpRequest();
	this.visualizer = obj.visualizer;
	this.visualiz();

	//this.initCallback = null;
}

MusicVisualizer.ac = new (window.AudioContext || window.wenkitAudioContext)();
//获取加载资源
MusicVisualizer.prototype.load = function(url,fun){
	this.xhr.abort();
	this.xhr.open("GET",url);
	this.xhr.responseType = "arraybuffer";
	var self = this;
	this.xhr.onload = function (){
		fun(self.xhr.response);
	}		
	this.xhr.send();
}
//解码

MusicVisualizer.prototype.decode = function(arraybuffer, fun){
	MusicVisualizer.ac.decodeAudioData(arraybuffer,function(buffer){
		fun(buffer);
	},function(err){
		console.log(err);
	});
}
//播放-- 请求 + 解码
MusicVisualizer.prototype.play = function(url){
	var self = this;
	var n = ++self.count;
	var stopTime = MusicVisualizer.ac.currentTime;
	this.source && this.stop();
	this.load(url,function(arraybuffer){
		if (n != self.count) return ;
		self.decode(arraybuffer, function(buffer){
			if (n != self.count) return ;
			var bs = MusicVisualizer.ac.createBufferSource();
			bs.connect(self.analyser);
			bs.buffer = buffer;
			bs[bs.start ?"start":"noteOn"](stopTime,stopTime);
			self.source = bs;
			//self.initCallback && !self.source && MusicVisualizer.isFunction(self.initCallback) && self.initCallback();
		})
	})
}
MusicVisualizer.prototype.currentTime = function(url){
	var self = this;
}
MusicVisualizer.prototype.playNext = function(url){
	var self = this;
	var n = ++self.count;
	this.source && this.stop();
	this.load(url,function(arraybuffer){
		if (n != self.count) return ;
		self.decode(arraybuffer, function(buffer){
			if (n != self.count) return ;
			var bs = MusicVisualizer.ac.createBufferSource();
			bs.connect(self.analyser);
			bs.buffer = buffer;
			bs[bs.start ?"start":"noteOn"](0);
			self.source = bs;
			//self.initCallback && !self.source && MusicVisualizer.isFunction(self.initCallback) && self.initCallback();
		})
	})
}
//停止播放
MusicVisualizer.prototype.stop = function(){
	if (this.source) {
		this.source[this.source.stop ?"stop":"noteOff"](0);
	}
	console.log(MusicVisualizer.ac.currentTime);
}
// MusicVisualizer.prototypt.addinit = function(fun){
// 	this.initCallback = fun;
// }
//改变音量
MusicVisualizer.prototype.moveplay = function(){
	var time = stopTime;
	var self = this;
	var n = ++self.count;
	this.source && this.stop();
	this.load(url,function(arraybuffer){
		if (n != self.count) return ;
		self.decode(arraybuffer, function(buffer){
			if (n != self.count) return ;
			var bs = MusicVisualizer.ac.createBufferSource();
			bs.connect(self.analyser);
			bs.buffer = buffer;
			bs[bs.start ?"start":"noteOn"](0);
			self.source = bs;
			//self.initCallback && !self.source && MusicVisualizer.isFunction(self.initCallback) && self.initCallback();
		})
	})
}
MusicVisualizer.prototype.changeVolume = function(percent){
	this.gainNode.gain.value = percent * percent;
}
//可视化
MusicVisualizer.prototype.visualiz = function(){
	var arr= new Uint8Array(this.analyser.frequencyBinCount);
	//arr 音频数据
	//requestAnimationFrame绘制动画
	requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;
	var self = this;
	function v(){
		self.analyser.getByteFrequencyData(arr);		
		self.visualizer(arr);
		requestAnimationFrame(v);

	}
	requestAnimationFrame(v);
}
