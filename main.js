const maxIts = 12;
var lambdaInc;
var maxLambda;
var minLambda;

var lambda;
var canvas;
var canvasData;
var ctx;
var expressionInput;
var messageEl;
var progressEl;
var elapsedEl;
var expression;
var startTime;
var isGoing = false;
var isStop = false;

function f(x) {
	return lambda * eval(expression);
}

function onLoad() {
	canvas = document.getElementById('canvas');
	canvas.width = window.innerWidth - 20;
	ctx = canvas.getContext('2d');
	canvasData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	expressionInput = document.getElementById('expression');
	messageEl = document.getElementById('message');
	progressEl = document.getElementById('progress');
	elapsedEl = document.getElementById('elapsed');
	reset();
	go();
}

function go() {
	const goButton = document.getElementById('go-button');
	if (isGoing) {
		isStop = true;
	} else {
		isGoing = true;
		goButton.innerHTML = 'STOP';
		message(null);
		startTime = new Date().getTime();
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		canvasData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		expression = expressionInput.value;
		expression = expression.replace(/(sin|sinh|cos|cosh|tan|tanh|sqrt|log1p|log2|log10|abs|acos|acosh|asin|asinh|acos|atan|atan2|atanh|exp|hypot|pow)/g, 'Math.$1');
		var j = 0;
		lambda = minLambda;
		const intervalId = setInterval(() => {
			const screenX = Math.floor(canvas.width * (lambda - minLambda) / (maxLambda - minLambda));
			var x = 0.5;
			for (var i = 0; i < maxIts; i++) {
				try {
					x = f(x);
				} catch (err) {
					isStop = true;
					message('Your expression sucks.  Try harder.');
					expressionInput.focus();
					break;
				}
				const screenY = Math.floor(canvas.height * (1 - x));
				// console.log(screenY);
				const rgb = hsvToRgb(i / maxIts, 1, 1);
				drawPixel(screenX, screenY, rgb.r, rgb.g, rgb.b, 255);
			}
			if (j % 40 == 0) {
				const progress = (100 * lambda / maxLambda).toFixed(2);
				progressEl.innerHTML = `${progress}%`;
				const elapsed = Math.round((new Date().getTime() - startTime) / 1000);
				const secs = (elapsed % 60 < 10 ? '0' : '') + elapsed % 60;
				const minutes = Math.floor(elapsed / 60);
				elapsedEl.innerHTML = `${minutes}:${secs}`;
			}
			// console.log(`${lambda} : ${x}`);
			ctx.putImageData(canvasData, 0, 0);
			j++;
			lambda += lambdaInc;
			if (lambda >= maxLambda || isStop) {
				if (!isStop) {
					progressEl.innerHTML = '100%';
				}
				clearInterval(intervalId);
				isGoing = false;
				isStop = false;
				goButton.innerHTML = 'GO';
			}
		}, 0);
	}
}

function canvasClick(e) {
	isStop = true;
	const x = e.offsetX / canvas.width;
	const center = minLambda + (x * (maxLambda - minLambda));
	setLambdaRange(Math.max(0, center - 0.2 * (maxLambda - minLambda)), Math.min(4, center + 0.2 * (maxLambda - minLambda)));
	setTimeout(() => {
		isStop = false;
		go();
	}, 20);
}

function reset() {
	setLambdaRange(0, 2);
	isStop = true;
	progressEl.innerHTML = '0.00%';
	elapsedEl.innerHTML = '0:00';
	expressionInput.value = 'x * (x - 1)';
}

function message(text) {
	messageEl.innerHTML = text;
	messageEl.className = text ? null : 'hidden';
}

function setLambdaRange(min, max) {
	minLambda = min;
	maxLambda = max;
	lambdaInc = 0.2 * (max - min) / canvas.width;
	document.getElementById('lambda-min').innerHTML = min.toFixed(2);
	document.getElementById('lambda-max').innerHTML = max.toFixed(2);
}

function drawPixel(x, y, r, g, b, a) {
	const index = (x + y * canvas.width) * 4;
	canvasData.data[index + 0] = r;
	canvasData.data[index + 1] = g;
	canvasData.data[index + 2] = b;
	canvasData.data[index + 3] = a;
}

/* accepts parameters
 * h  Object = {h:x, s:y, v:z}
 * OR
 * h, s, v
*/
function hsvToRgb(h, s, v) {
	var r, g, b, i, f, p, q, t;
	if (arguments.length === 1) {
		s = h.s, v = h.v, h = h.h;
	}
	i = Math.floor(h * 6);
	f = h * 6 - i;
	p = v * (1 - s);
	q = v * (1 - f * s);
	t = v * (1 - (1 - f) * s);
	switch (i % 6) {
		case 0: r = v, g = t, b = p; break;
		case 1: r = q, g = v, b = p; break;
		case 2: r = p, g = v, b = t; break;
		case 3: r = p, g = q, b = v; break;
		case 4: r = t, g = p, b = v; break;
		case 5: r = v, g = p, b = q; break;
	}
	return {
		r: Math.round(r * 255),
		g: Math.round(g * 255),
		b: Math.round(b * 255)
	};
}
