var canvas;
var context;

const categories = ["grave", "circunflexo", "cedilha", "til", "agudo", "hífen"];

var cb_images = {};
var button_image = new Array(3);

var button_position;
var button_hit = -1;

var checkboxes = [];
var cb_positions = [];
var cb_width;
var cb_hit = -1;

var current_screen = 0;

function onload() {
	canvas = document.getElementById('canvas');
	context = canvas.getContext('2d');
	preload_cb_images();
	preload_button_image();
	new_checkboxes();
	canvas.addEventListener('mousedown', onmousedownScreen0);
	canvas.addEventListener('mouseup', onmouseupScreen0);
	window.onresize = draw;
}

function draw() {
	canvas.width = window.innerWidth * 0.8;
	canvas.height = window.innerHeight * 0.8;
	if(current_screen == 0)
		drawScreen0();
	else
		drawScreen1();
}

var imgs_to_load = 16;

function img_loaded() {
	if(--imgs_to_load == 0)
		draw();
}

function preload_cb_images() {
	for(category of categories) {
		cb_images[category] = new Array(2);
		var a = new Image();
		var b = new Image();
		a.src = "img/cb_unchecked_" + category + ".png";
		b.src = "img/cb_checked_" + category + ".png";
		a.onload = img_loaded;
		b.onload = img_loaded;
		cb_images[category][0] = a;
		cb_images[category][1] = b;
	}
	cb_images.mousedown = new Image();
	cb_images.mousedown.src = "img/cb_mousedown.png";
	cb_images.mousedown.onload = img_loaded;
}

function preload_button_image() {
	var n = Math.floor(Math.random() * 6);
	var img = new Image();
	img.src = "img/start" + n + ".png";
	img.onload = img_loaded;
	button_image[0] = img;
	img = new Image();
	img.src = "img/start" + n + "_down.png";
	img.onload = img_loaded;
	button_image[1] = img;
	img = new Image();
	img.src = "img/start_mousedown.png";
	img.onload = img_loaded;
	button_image[2] = img;
}

// FIXME preciso de redesenhar mais do layout do screen0
// o botão desaparece da janela quando canvas.height é pequeno
// pre: calc_checkbox_positions()
function calc_button_position() {
	var percent = cb_width / 100;
	var w = Math.round(button_image[0].width * percent);
	var h = Math.round(button_image[0].height * percent);
	var x = Math.round(canvas.width / 2 - w / 2);
	var y = Math.round(cb_positions[0].y + percent * 200);
	button_position = {w: w, h: h, x: x, y: y};
}

function draw_button() {
	var img;
	if(button_hit == -1)
		img = button_image[0]
	else if(button_hit == 0)
		img = button_image[2];
	else if(button_hit == 1)
		img = button_image[1];
	context.drawImage(img, button_position.x, button_position.y, button_position.w, button_position.h);
}

class Checkbox {
	constructor(type) {
		this.type = type;
		this.value = false;
	}
	
	set value(val) {
		this._value = val;
		this.mouseup();
	}
	
	get value() {
		return this._value;
	}
	
	mousedown() {
		this.img = cb_images.mousedown;
	}
	
	mouseup() {
		this.img = cb_images[this.type][Number(this._value)];
	}
}

function draw_checkbox(n) {
	context.drawImage(checkboxes[n].img, cb_positions[n].x, cb_positions[n].y, cb_width, cb_width);
}

// Populates globals cb_width and cb_positions
function calc_checkbox_positions() {
	const COLUMN_MAX_WIDTH = 100;
	const COLUMN_MIN_WIDTH = 20;
	const TOP_FACTOR = 0.5;
	
	var columns = 2 * categories.length + 1;
	var w = canvas.width / columns;
	cb_width = Math.max(Math.min(COLUMN_MAX_WIDTH, w), COLUMN_MIN_WIDTH);

	var top = canvas.height * TOP_FACTOR - cb_width / 2.0;
	
	cb_positions = [];
	for(var col = 1; col < columns; col += 2)
		cb_positions.push({x: col*cb_width, y: top});
}

function new_checkboxes() {
	for(var i = 0; i < categories.length; ++i)
		checkboxes.push(new Checkbox(categories[i]));
}

function drawScreen0() {
	calc_checkbox_positions();
	draw_checkboxes();
	calc_button_position();
	draw_button();
}

function draw_checkboxes() {
	for(var i = 0; i < checkboxes.length; ++i)
		draw_checkbox(i);
}

// returns index of checkbox hit, or -1 if no hit
function checkbox_hit(x, y) {
	for(var i = 0; i < cb_positions.length; ++i) {
		var x0 = cb_positions[i].x;
		var x1 = x0 + cb_width;
		var y0 = cb_positions[i].y;
		var y1 = y0 + cb_width;
		if(x >= x0 && x <= x1 && y >= y0 && y <= y1)
			return i;
	}
	return -1;
}

function start_button_hit(x, y) {
	var x0 = button_position.x;
	var x1 = x0 + button_position.w;
	var y0 = button_position.y;
	var y1 = y0 + button_position.h;
	return x >= x0 && x <= x1 && y >= y0 && y <= y1;
}

// from https://stackoverflow.com/a/33063222
function getMousePos(evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: (evt.clientX - rect.left) / (rect.right - rect.left) * canvas.width,
        y: (evt.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height
    };
}

function onmousedownScreen0(evt) {
	var e = getMousePos(evt);
	cb_hit = checkbox_hit(e.x, e.y);
	if(cb_hit != -1) {
		checkboxes[cb_hit].mousedown();
		draw_checkbox(cb_hit);
	} else if(button_hit == -1 && start_button_hit(e.x, e.y)) {
		button_hit = 0;
		draw_button();
	}
}

function onmouseupScreen0(evt) {
	var e = getMousePos(evt);
	if(cb_hit != -1 && button_hit == -1) {
		if(checkbox_hit(e.x, e.y) == cb_hit)
			checkboxes[cb_hit].value = ! checkboxes[cb_hit].value; 
		
		checkboxes[cb_hit].mouseup();
		draw_checkbox(cb_hit);
		cb_hit = -1;
	} else if(button_hit == 0) {
		if(start_button_hit(e.x, e.y)) {
			button_hit = 1;
			draw_button();
			fade_to_screen1();
		} else {
			button_hit = -1;
			draw_button();
		}
	}
}

function fade_to_screen1() {
	canvas.removeEventListener('mousedown', onmousedownScreen0);
	canvas.removeEventListener('mouseup', onmouseupScreen0);
	const start = performance.now();
	const fade_length = 1000;
	function next_frame(now) {
		var p = (now-start)/fade_length;
		if(p <= 1) {
			context.globalAlpha = 1 - p;
			context.clearRect(0, 0, canvas.width, canvas.height);
			drawScreen0();
			window.requestAnimationFrame(next_frame);
		} else {
			goto_screen1();
		}
	}
	window.requestAnimationFrame(next_frame);
}

const split_char_map = {
	'á':['agudo','a'],
	'à':['grave','a'],
	'ã':['til','a'],
	'â':['circunflexo','a'],
	'é':['agudo','e'],
	'è':['grave','e'],
	'ẽ':['til','e'],
	'ê':['circunflexo','e'],
	'í':['agudo','icut'],
	'ì':['grave','icut'],
	'ĩ':['til','icut'],
	'î':['circunflexo','icut'],
	'ó':['agudo','o'],
	'ò':['grave','o'],
	'õ':['til','o'],
	'ô':['circunflexo','o'],
	'ú':['agudo','u'],
	'ù':['grave','u'],
	'ũ':['til','u'],
	'û':['circunflexo','u'],
	'-':['hífen'],
	'ç':['cedilha']
};

// Word to keystroke sequence
// (where keystrokes are represented as strings)
function word_to_sseq(word) {
	res = [];
	for(char of word) {
		split = split_char_map[char];
		if(split)
			res = res.concat(split);
		else
			res.push(char);
	}
	return res;
}

function keycode_to_charname(keycode, shiftDown) {
	if(keycode >= 65 && keycode <= 90 && !shiftDown) {
		return String.fromCharCode(32 + keycode);
	} else if (keycode == 189 && !shiftDown) {
		return 'hífen';
	} else if(keycode == 186 && !shiftDown) {
		return 'cedilha';
	} else if(keycode == 220) {
		if(shiftDown)
			return 'circunflexo';
		else
			return 'til';
	} else if(keycode == 221) {
		if(shiftDown)
			return 'grave';
		else
			return 'agudo';
	}
}

// Devolve closure que calcula novas dimensões
function resizer(size, max_size) {
	var factor = Math.min(1, size / max_size);
	return x => Math.floor(factor * x);
}

// possible values of "CharImage variant"
const CHARIMAGE_FULL = '';
const CHARIMAGE_OUT = 'out';

function new_char_img(charname, rank, outline) {
	var img = new Image();
	variant = outline ? 'out' : '';
	img.src = "img/letters/" + Math.abs(rank) + "/" + charname + variant + '.png';
	return img;
}

const char_image_dimensions =  {width: 44, height: 84};

const N_WORDS = 3;

// classe responsável por manter o valor da altura das palavras
class WordView {

	constructor() {
		this.words = new Array(N_WORDS); // array de objectos Word
		this.tops = new Array(N_WORDS); // word.top; atualizar só qd há resize
		this.height_between_words = 15;
		this.rectangle_y_pad = 5;
		this.max_height = this.max_height(); // constante
	}

	// pre: this.rectangle_y_pad && this.height_between_words
	max_height() {
		return this.rectangle_y_pad + N_WORDS * char_image_dimensions.height + (N_WORDS - 1) * this.height_between_words;
	}

	calc_tops_and_heights(top, height) {
		var f = resizer(height, this.max_height);
		this.charheight = f(char_image_dimensions.height);
		this.tops[0] = top + f(this.rectangle_y_pad);
		for(var i = 1; i < N_WORDS; ++i)
			this.tops[i] = this.tops[i - 1] + this.charheight + f(this.height_between_words);
	}

	set_words(sseqs) {
		const word_ranks = [0, 1, 1];
		this.sseqs = sseqs;
		for(var i = 0; i < this.words.length; ++i)
			this.words[i] = new Word(sseqs[i], word_ranks[i], this, i);
	}


	draw_word_rectangle() {
		context.strokeRect(1, this.tops[0] - this.rectangle_y_pad, canvas.width - 2, this.charheight + this.rectangle_y_pad * 2);
	}

	draw(top, height) {
		this.top = top;
		this.height = height;
		this.calc_tops_and_heights(top, height);
		this.draw_word_rectangle();
		for(var i = 0; i < this.words.length; ++i)
			if(this.words[i])
				this.words[i].draw_word(this.tops[i], this.charheight);
	}

	reset_outlines(cursor) {
		for(var i = 0; i < cursor; ++i) {
			this.words[0].toggle_outline_of_stroke(i);
			this.words[0].draw_stroke(i, true, this.tops[0], this.charheight);
		}
	}

	add_outline(cursor) {
		this.words[0].toggle_outline_of_stroke(cursor);
		this.words[0].draw_stroke(cursor, true, this.tops[0], this.charheight);
	}

	current_sseq() {
		return this.words[0].sseq;
	}

	new_sseq(sseq) {
		context.clearRect(0, this.tops[0] - 5, canvas.width, canvas.height - this.tops[0] - 5);
		this.set_words(this.sseqs.splice(1, this.sseqs.length).concat([sseq]));
		this.draw(this.top, this.height);
	}

	new_word_animation() {
		const animation_time = 500; // ms
		// TODO
	}
}

function is_accent_stroke(s) {
	return s == 'agudo' || s == 'grave' || s == 'circunflexo' || s == 'til';
}

// classe responsável por manter o valor da largura das imagens
// e com possibilidade de manter o valor do outline de uma imagem individual
// não tem noção de cursor da palavra
class Word {
	constructor(sseq, rank) {
		// assert(!outline || rank == 0)
		this.sseq = sseq;
		this.rank = rank;
		this.outlines = new Array(sseq.length);
		for(var i = 0; i < this.outlines.length; ++i)
			this.outlines[i] = rank == 0 ? true : false;
		this.lefts = new Array(sseq.length); // atualizar com resize
		this.non_accent_chars = this.calc_non_accent_chars(); // constante
		this.max_width = this.calc_max_width(this.non_accent_chars); // constante
	}

	// pre: this.sseq
	calc_non_accent_chars() {
		var sum = 0;
		for(var s of this.sseq)
			sum += is_accent_stroke(s) ? 0 : 1;
		return sum;
	}

	calc_max_width(number_of_non_accent_chars) {
		return char_image_dimensions.width * number_of_non_accent_chars;
	}

	calc_lefts() {
		var f = resizer(canvas.width, this.max_width);
		this.charwidth = f(char_image_dimensions.width);
		this.lefts[0] = Math.floor((canvas.width - this.charwidth * this.non_accent_chars) / 2);
		for(var i = 1; i < this.lefts.length; ++i) {
			var parcel = !is_accent_stroke(this.sseq[i - 1]) ? this.charwidth : 0;
			this.lefts[i] = this.lefts[i - 1] + parcel;
		}
	}

	toggle_outline_of_stroke(i) {
		this.outlines[i] = ! this.outlines[i];
	}

	draw_stroke(i, redraw, top, height) {
		var img = new_char_img(this.sseq[i], this.rank, this.outlines[i]);
		img.onload = () => {
			if(redraw) {
				context.clearRect(this.lefts[i], top, this.charwidth, height);
				if(is_accent_stroke(this.sseq[i]))
					this.draw_stroke(i + 1, false, top, height);
				if(i != 0 && is_accent_stroke(this.sseq[i - 1]))
					this.draw_stroke(i - 1, false, top, height);
			}
			context.drawImage(img, this.lefts[i], top, this.charwidth, height);
		};
	}

	draw_word(top, height) {
		this.calc_lefts();
		for(var i = 0; i < this.sseq.length; ++i)
			this.draw_stroke(i, false, top, height);
	}

	clear_word(top, height) {
		context.clearRect(this.lefts[0], top, this.charwidth * this.non_accent_chars, height);
	}
}

function request_words(callback) {
	const WORDS_PER_REQUEST = 300; // posso arranjar uma estimativa (por cima) do máximo de palavras num jogo

	const xmlReq = new XMLHttpRequest();
	xmlReq.open("POST", "http://127.0.0.1:5000/words");
	xmlReq.setRequestHeader("Content-type", "application/json");
	xmlReq.responseType = "json";
	xmlReq.addEventListener("load", function() {
			callback(this.response);
	});
	data = {n: WORDS_PER_REQUEST};
	for(cb of checkboxes) {
		if(!cb.value) {
			data[cb.type] = false;
		}
	}
	xmlReq.send(JSON.stringify(data));
}

var controller;

// pre: fade_to_screen1()
function goto_screen1() {
	current_screen = 1;
	controller = new Screen1Controller();
}

function drawScreen1() {
	controller.draw();
}


// STUB
class MetricsView {

	constructor(csmaGetter) {
		this.max_height = 200;
		this.csmaview = new CSMAView(csmaGetter);
	}

	draw(top, height) {
		this.top = top;
		this.height = height;
		this.animate();
	}

	animate() {
		if(this.animating)
			return;
		this.animating = true;

		var draw = () => {
			context.clearRect(5, this.top, canvas.width - 2 * 5, this.height);
			//context.strokeRect(5, this.top, canvas.width - 2 * 5, this.height);
			var f = resizer(this.height, this.max_height);
			var c = Math.floor(canvas.width / 2);
			var radius = f(100);
			this.csmaview.draw(c - radius, this.top + Math.floor(this.height / 2) - radius, radius * 2);
			window.requestAnimationFrame(draw);
		};
		window.requestAnimationFrame(draw);
	}

	setCSME(csme) {
		this.csmaview.setCSME(csme);
	}

}

class TimerView {

}

class LevelView {

}

class CSMAView {

	constructor(csmaGetter) {
		this.getValue = csmaGetter;
	}

	setCSME(value) {
		this.csme = value;
	}

	draw(left, top, diameter) {
		var radius = diameter / 2;
		var center = {x: left + radius, y: top + radius};
		this.value = this.getValue();
		context.beginPath();
		context.arc(center.x, center.y, radius, 0, Math.PI, true);
		context.moveTo(left, top + radius);
		context.lineTo(left + diameter, top + radius);
		context.stroke();
		var angle;
		if(this.value <= this.csme) {
			angle = this.value * Math.PI / this.csme - Math.PI/2;
		} else {
			angle = (Math.PI) * ((this.value - this.csme) / (2000 - this.csme)) + Math.PI/2;
		}
		context.beginPath();
		context.moveTo(center.x, center.y);
		context.lineTo(center.x + Math.floor(Math.sin(angle) * radius), center.y - Math.floor(Math.cos(angle) * radius));
		context.stroke();
	}

}

const A = 5000; // ms

class Screen1Controller {

	constructor() {
		this.wordview = new WordView();
		this.metricsview = new MetricsView(() => this.csma());
		this.cursor = 0;
		this.requesting_words = false;
		this.timestamps_in_a = [];
		this.level = 1;
		this.metricsview.setCSME(this.level_csme());
		this.request_words();
	}

	request_words() {
		var f = (words) => {
			if(!this.words) {
				var sseqs = [];
				for(var word of words.slice(0, N_WORDS))
					sseqs.push(word_to_sseq(word));
				this.words = words.slice(N_WORDS, words.length);
				this.wordview.set_words(sseqs);
				draw();
				window.addEventListener('keydown', (e) => {this.keydown(e)});
			} else {
				this.words = this.words.concat(words);
			}
			this.requesting_words = false;
		}
		if(!this.requesting_words) {
			this.requesting_words = true;
			request_words(f);
		}
	}

	draw() {
		this.metricsview.draw(0, 200);
		this.wordview.draw(200, 400);
	}

	keydown(e) {
		if(e.keyCode == 16) // shift
			return;
		var charname = keycode_to_charname(e.keyCode, e.shiftKey);
		var sseq = this.wordview.current_sseq();
		if(this.cursor < sseq.length) {
			if(sseq[this.cursor] == charname)
				this.inc_cursor();
			else if(sseq[this.cursor] == 'icut' && charname == 'i')
				this.inc_cursor();
			else
				this.error();
		} else {
			if(e.keyCode == 32 || e.keyCode == 13) // espaço ou enter
				this.next_word();
			else
				this.error();
		}
	}

	error() {
		this.reset_timestamps();
		this.wordview.reset_outlines(this.cursor);
		this.cursor = 0;
	}

	inc_cursor() {
		this.add_timestamp();
		this.wordview.add_outline(this.cursor);
		this.cursor++;
	}

	next_word() {
		this.add_timestamp();
		this.cursor = 0;
		this.wordview.new_sseq(word_to_sseq(this.words.pop()));
		if(this.words.length < 100)
			this.request_words();
		if(this.csma() >= this.level_csme())
			this.next_level();
	}

	next_level() {
		++this.level;
		this.metricsview.setCSME(this.level_csme());
		this.reset_timestamps();
		console.log("level: " + this.level);
		// something to do with LevelView
	}

	reset_timestamps() {
		this.timestamps_in_a = [];
	}

	add_timestamp() {
		this.timestamps_in_a.push(performance.now());
	}

	csma() {
		var n = performance.now();
		var i;
		for(i = 0; i < this.timestamps_in_a.length; ++i) {
			if(n - this.timestamps_in_a[i] < A)
				break;
		}
		this.timestamps_in_a = this.timestamps_in_a.slice(i, this.timestamps_in_a.length);
		return this.timestamps_in_a.length * 60000 / A;
	}

	// pre: this.level
	level_csme() {
		return this.level * 25;
	}

}
