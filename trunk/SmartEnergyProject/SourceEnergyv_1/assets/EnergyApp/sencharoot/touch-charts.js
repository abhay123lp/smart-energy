Ext.ns("Ext.fx.target");
Ext.fx.Queue = {
	constructor : function() {
		this.targets = new Ext.util.HashMap();
		this.fxQueue = {}
	},
	getFxDefaults : function(a) {
		var b = this.targets.get(a);
		if (b) {
			return b.fxDefaults
		}
		return {}
	},
	setFxDefaults : function(a, c) {
		var b = this.targets.get(a);
		if (b) {
			b.fxDefaults = Ext.apply(b.fxDefaults || {}, c)
		}
	},
	stopAnimation : function(b) {
		var d = this, a = d.getFxQueue(b), c = a.length;
		while (c) {
			a[c - 1].end();
			c--
		}
	},
	getActiveAnimation : function(b) {
		var a = this.getFxQueue(b);
		return (a && !!a.length) ? a[0] : false
	},
	hasFxBlock : function(b) {
		var a = this.getFxQueue(b);
		return a && a[0] && a[0].block
	},
	getFxQueue : function(b) {
		if (!b) {
			return false
		}
		var c = this, a = c.fxQueue[b], d = c.targets.get(b);
		if (!d) {
			return false
		}
		if (!a) {
			c.fxQueue[b] = [];
			if (d.type != "element") {
				d.target.on("destroy", function() {
					c.fxQueue[b] = []
				})
			}
		}
		return c.fxQueue[b]
	},
	queueFx : function(d) {
		var c = this, e = d.target, a, b;
		if (!e) {
			return
		}
		a = c.getFxQueue(e.getId());
		b = a.length;
		if (b) {
			if (d.concurrent) {
				d.paused = false
			} else {
				a[b - 1].on("afteranimate", function() {
					d.paused = false
				})
			}
		} else {
			d.paused = false
		}
		d.on("afteranimate", function() {
			a.remove(d);
			if (d.remove) {
				if (e.type == "element") {
					var f = Ext.get(e.id);
					if (f) {
						f.remove()
					}
				}
			}
		}, this);
		a.push(d)
	}
};
Ext.fx.Manager = {
	constructor : function() {
		var a = this;
		a.items = new Ext.util.MixedCollection();
		a.addEvents("framebegin", "frameend");
		Ext.util.Observable.constructor.call(a);
		Ext.fx.Queue.constructor.call(a)
	},
	interval : 32,
	createTarget : function(c) {
		var b = this, a;
		if (Ext.isObject(c)) {
			if (c.isSprite) {
				a = new Ext.fx.target.Sprite(c)
			} else {
				if (c.isCompositeSprite) {
					a = new Ext.fx.target.CompositeSprite(c)
				} else {
					if (c.isAnimTarget) {
						return c
					} else {
						return null
					}
				}
			}
			b.targets.add(a);
			return a
		} else {
			return null
		}
	},
	addAnim : function(d) {
		var c = this, b = c.items, a = c.task;
		b.add(d);
		if (!a && b.length) {
			c.task = setInterval(c.runner, c.interval)
		}
	},
	removeAnim : function(d) {
		var c = this, b = c.items, a = c.task;
		b.remove(d);
		if (a && !b.length) {
			clearInterval(a);
			delete c.task
		}
	},
	startingFilter : function(a) {
		return a.paused === false && a.running === false && a.iterations > 0
	},
	runningFilter : function(a) {
		return a.paused === false && a.running === true
				&& a.isAnimator !== true
	},
	runner : function() {
		var b = Ext.fx.Manager, a = b.items;
		if (!b.running) {
			b.fireEvent("framebegin");
			b.running = true;
			b.targetData = {};
			b.targetArr = {};
			b.timestamp = new Date();
			a.filterBy(b.startingFilter).each(b.startAnim, b);
			a.filterBy(b.runningFilter).each(b.runAnim, b);
			b.applyPendingAttrs();
			b.fireEvent("frameend");
			b.running = false
		}
	},
	startAnim : function(a) {
		a.start(this.timestamp)
	},
	runAnim : function(d) {
		if (!d) {
			return
		}
		var c = this, b = d.target.getId(), a = c.timestamp - d.startTime;
		this.collectTargetData(d, a);
		if (a >= d.duration) {
			c.applyPendingAttrs(true);
			delete c.targetData[b];
			delete c.targetArr[b];
			d.lastFrame()
		}
	},
	collectTargetData : function(e, a) {
		var c = this, b = e.target.getId(), f = c.targetData[b], d;
		if (!f) {
			f = c.targetData[b] = [];
			c.targetArr[b] = e.target
		}
		d = {
			duration : e.duration,
			easing : e.easing,
			attrs : {}
		};
		Ext.apply(d.attrs, e.runAnim(a));
		f.push(d)
	},
	applyPendingAttrs : function(d) {
		var c = this.targetData, b = this.targetArr, a;
		for (a in c) {
			if (c.hasOwnProperty(a)) {
				b[a].setAttr(c[a], false, d)
			}
		}
	}
};
Ext.applyIf(Ext.fx.Manager, Ext.fx.Queue);
Ext.applyIf(Ext.fx.Manager, Ext.util.Observable.prototype);
Ext.fx.Manager.constructor();
Ext.fx.CubicBezier = {
	cubicBezierAtTime : function(n, d, b, m, l, h) {
		var i = 3 * d, k = 3 * (m - d) - i, a = 1 - i - k, g = 3 * b, j = 3
				* (l - b) - g, o = 1 - g - j;
		function f(p) {
			return ((a * p + k) * p + i) * p
		}
		function c(p, r) {
			var q = e(p, r);
			return ((o * q + j) * q + g) * q
		}
		function e(p, w) {
			var v, u, s, q, t, r;
			for (s = p, r = 0; r < 8; r++) {
				q = f(s) - p;
				if (Math.abs(q) < w) {
					return s
				}
				t = (3 * a * s + 2 * k) * s + i;
				if (Math.abs(t) < 0.000001) {
					break
				}
				s = s - q / t
			}
			v = 0;
			u = 1;
			s = p;
			if (s < v) {
				return v
			}
			if (s > u) {
				return u
			}
			while (v < u) {
				q = f(s);
				if (Math.abs(q - p) < w) {
					return s
				}
				if (p > q) {
					v = s
				} else {
					u = s
				}
				s = (u - v) / 2 + v
			}
			return s
		}
		return c(n, 1 / (200 * h))
	},
	cubicBezier : function(b, e, a, c) {
		var d = function(f) {
			return Ext.fx.CubicBezier.cubicBezierAtTime(f, b, e, a, c, 1)
		};
		d.toCSS3 = function() {
			return "cubic-bezier(" + [ b, e, a, c ].join(",") + ")"
		};
		d.reverse = function() {
			return Ext.fx.CubicBezier.cubicBezier(1 - a, 1 - c, 1 - b, 1 - e)
		};
		return d
	}
};
(Ext.fx.Easing = function() {
	var e = Math, g = e.PI, d = e.pow, b = e.sin, f = e.sqrt, a = e.abs, c = 1.70158;
	Ext.apply(Ext.fx.Easing, {
		linear : function(h) {
			return h
		},
		ease : function(p) {
			var k = 0.07813 - p / 2, j = f(0.0066 + k * k), h = j - k, o = d(
					a(h), 1 / 3)
					* (h < 0 ? -1 : 1), m = -j - k, l = d(a(m), 1 / 3)
					* (m < 0 ? -1 : 1), i = o + l + 0.25;
			return d(1 - i, 2) * 3 * i * 0.1 + (1 - i) * 3 * i * i + i * i * i
		},
		easeIn : function(h) {
			return d(h, 1.7)
		},
		easeOut : function(h) {
			return d(h, 0.48)
		},
		easeInOut : function(p) {
			var k = 0.48 - p / 1.04, j = f(0.1734 + k * k), h = j - k, o = d(
					a(h), 1 / 3)
					* (h < 0 ? -1 : 1), m = -j - k, l = d(a(m), 1 / 3)
					* (m < 0 ? -1 : 1), i = o + l + 0.5;
			return (1 - i) * 3 * i * i + i * i * i
		},
		backIn : function(h) {
			return h * h * ((c + 1) * h - c)
		},
		backOut : function(h) {
			h = h - 1;
			return h * h * ((c + 1) * h + c) + 1
		},
		elasticIn : function(j) {
			if (j === 0 || j === 1) {
				return j
			}
			var i = 0.3, h = i / 4;
			return d(2, -10 * j) * b((j - h) * (2 * g) / i) + 1
		},
		elasticOut : function(h) {
			return 1 - Ext.fx.Easing.elasticIn(1 - h)
		},
		bounceIn : function(h) {
			return 1 - Ext.fx.Easing.bounceOut(1 - h)
		},
		bounceOut : function(k) {
			var i = 7.5625, j = 2.75, h;
			if (k < (1 / j)) {
				h = i * k * k
			} else {
				if (k < (2 / j)) {
					k -= (1.5 / j);
					h = i * k * k + 0.75
				} else {
					if (k < (2.5 / j)) {
						k -= (2.25 / j);
						h = i * k * k + 0.9375
					} else {
						k -= (2.625 / j);
						h = i * k * k + 0.984375
					}
				}
			}
			return h
		}
	});
	Ext.apply(Ext.fx.Easing, {
		"back-in" : Ext.fx.Easing.backIn.prototype,
		"back-out" : Ext.fx.Easing.backOut.prototype,
		"ease-in" : Ext.fx.Easing.easeIn.prototype,
		"ease-out" : Ext.fx.Easing.easeOut.prototype,
		"elastic-in" : Ext.fx.Easing.elasticIn.prototype,
		"elastic-out" : Ext.fx.Easing.elasticIn.prototype,
		"bounce-in" : Ext.fx.Easing.bounceIn.prototype,
		"bounce-out" : Ext.fx.Easing.bounceOut.prototype,
		"ease-in-out" : Ext.fx.Easing.easeInOut.prototype
	})
})();
Ext.fx.PropertyHandler = {
	defaultHandler : {
		pixelDefaults : [ "width", "height", "top", "left" ],
		unitRE : /^(-?\d*\.?\d*){1}(em|ex|px|in|cm|mm|pt|pc|%)*$/,
		computeDelta : function(h, b, f, e, a) {
			f = (typeof f == "number") ? f : 1;
			var d = this.unitRE.exec(h), g, c;
			if (d) {
				h = d[1];
				c = d[2];
				if (!c && this.pixelDefaults.indexOf(a) !== -1) {
					c = "px"
				}
			}
			h = +h || 0;
			d = this.unitRE.exec(b);
			if (d) {
				b = d[1];
				c = d[2] || c
			}
			b = +b || 0;
			g = (e != null) ? e : h;
			return {
				from : h,
				delta : (b - g) * f,
				units : c
			}
		},
		get : function(n, b, a, m, h) {
			var l = n.length, d = [], e, g, k, c, f;
			for (e = 0; e < l; e++) {
				if (m) {
					g = m[e][1].from
				}
				if (Ext.isArray(n[e][1]) && Ext.isArray(b)) {
					k = [];
					c = 0;
					f = n[e][1].length;
					for (; c < f; c++) {
						k.push(this.computeDelta(n[e][1][c], b[c], a, g, h))
					}
					d.push([ n[e][0], k ])
				} else {
					d.push([ n[e][0], this.computeDelta(n[e][1], b, a, g, h) ])
				}
			}
			return d
		},
		set : function(k, f) {
			var g = k.length, c = [], d, a, h, e, b;
			for (d = 0; d < g; d++) {
				a = k[d][1];
				if (Ext.isArray(a)) {
					h = [];
					b = 0;
					e = a.length;
					for (; b < e; b++) {
						h
								.push(a[b].from + (a[b].delta * f)
										+ (a[b].units || 0))
					}
					c.push([ k[d][0], h ])
				} else {
					c
							.push([ k[d][0],
									a.from + (a.delta * f) + (a.units || 0) ])
				}
			}
			return c
		}
	},
	color : {
		rgbRE : /^rgb\(([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\)$/i,
		hexRE : /^#?([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})$/i,
		hex3RE : /^#?([0-9A-F]{1})([0-9A-F]{1})([0-9A-F]{1})$/i,
		parseColor : function(a, d) {
			d = (typeof d == "number") ? d : 1;
			var e, c = false, b;
			Ext.each([ this.hexRE, this.rgbRE, this.hex3RE ], function(g, f) {
				e = (f % 2 == 0) ? 16 : 10;
				b = g.exec(a);
				if (b && b.length == 4) {
					if (f == 2) {
						b[1] += b[1];
						b[2] += b[2];
						b[3] += b[3]
					}
					c = {
						red : parseInt(b[1], e),
						green : parseInt(b[2], e),
						blue : parseInt(b[3], e)
					};
					return false
				}
			});
			return c || a
		},
		computeDelta : function(g, a, e, c) {
			g = this.parseColor(g);
			a = this.parseColor(a, e);
			var f = c ? c : g, b = typeof f, d = typeof a;
			if (b == "string" || b == "undefined" || d == "string"
					|| d == "undefined") {
				return a || f
			}
			return {
				from : g,
				delta : {
					red : Math.round((a.red - f.red) * e),
					green : Math.round((a.green - f.green) * e),
					blue : Math.round((a.blue - f.blue) * e)
				}
			}
		},
		get : function(h, a, f, d) {
			var g = h.length, c = [], e, b;
			for (e = 0; e < g; e++) {
				if (d) {
					b = d[e][1].from
				}
				c.push([ h[e][0], this.computeDelta(h[e][1], a, f, b) ])
			}
			return c
		},
		set : function(j, e) {
			var f = j.length, c = [], d, b, a, g, h;
			for (d = 0; d < f; d++) {
				b = j[d][1];
				if (b) {
					g = b.from;
					h = b.delta;
					b = (typeof b == "object" && "red" in b) ? "rgb(" + b.red
							+ ", " + b.green + ", " + b.blue + ")" : b;
					b = (typeof b == "object" && b.length) ? b[0] : b;
					if (typeof b == "undefined") {
						return []
					}
					a = typeof b == "string" ? b : "rgb("
							+ [ (g.red + Math.round(h.red * e)) % 256,
									(g.green + Math.round(h.green * e)) % 256,
									(g.blue + Math.round(h.blue * e)) % 256 ]
									.join(",") + ")";
					c.push([ j[d][0], a ])
				}
			}
			return c
		}
	},
	object : {
		interpolate : function(d, b) {
			b = (typeof b == "number") ? b : 1;
			var a = {}, c;
			for (c in d) {
				a[c] = parseFloat(d[c], 10) * b
			}
			return a
		},
		computeDelta : function(g, a, c, b) {
			g = this.interpolate(g);
			a = this.interpolate(a, c);
			var f = b ? b : g, e = {}, d;
			for (d in a) {
				e[d] = a[d] - f[d]
			}
			return {
				from : g,
				delta : e
			}
		},
		get : function(h, a, f, d) {
			var g = h.length, c = [], e, b;
			for (e = 0; e < g; e++) {
				if (d) {
					b = d[e][1].from
				}
				c.push([ h[e][0], this.computeDelta(h[e][1], a, f, b) ])
			}
			return c
		},
		set : function(k, f) {
			var g = k.length, c = [], e = {}, d, h, j, b, a;
			for (d = 0; d < g; d++) {
				b = k[d][1];
				h = b.from;
				j = b.delta;
				for (a in h) {
					e[a] = Math.round(h[a] + j[a] * f)
				}
				c.push([ k[d][0], e ])
			}
			return c
		}
	},
	path : {
		computeDelta : function(e, a, c, b) {
			c = (typeof c == "number") ? c : 1;
			var d;
			e = +e || 0;
			a = +a || 0;
			d = (b != null) ? b : e;
			return {
				from : e,
				delta : (a - d) * c
			}
		},
		forcePath : function(a) {
			if (!Ext.isArray(a) && !Ext.isArray(a[0])) {
				a = Ext.draw.Draw.parsePathString(a)
			}
			return a
		},
		get : function(b, h, a, p) {
			var c = this.forcePath(h), m = [], r = b.length, d, g, n, f, o, l, e, s, q;
			for (n = 0; n < r; n++) {
				q = this.forcePath(b[n][1]);
				f = Ext.draw.Draw.interpolatePaths(q, c);
				q = f[0];
				c = f[1];
				d = q.length;
				s = [];
				for (l = 0; l < d; l++) {
					f = [ q[l][0] ];
					g = q[l].length;
					for (e = 1; e < g; e++) {
						o = p && p[0][1][l][e].from;
						f.push(this.computeDelta(q[l][e], c[l][e], a, o))
					}
					s.push(f)
				}
				m.push([ b[n][0], s ])
			}
			return m
		},
		set : function(o, m) {
			var n = o.length, e = [], g, f, d, h, l, c, a, b;
			for (g = 0; g < n; g++) {
				c = o[g][1];
				h = [];
				a = c.length;
				for (f = 0; f < a; f++) {
					l = [ c[f][0] ];
					b = c[f].length;
					for (d = 1; d < b; d++) {
						l.push(c[f][d].from + c[f][d].delta * m)
					}
					h.push(l.join(","))
				}
				e.push([ o[g][0], h.join(",") ])
			}
			return e
		}
	}
};
Ext.each([ "outlineColor", "backgroundColor", "borderColor", "borderTopColor",
		"borderRightColor", "borderBottomColor", "borderLeftColor", "fill",
		"stroke" ], function(a) {
	Ext.fx.PropertyHandler[a] = Ext.fx.PropertyHandler.color
}, Ext.fx.PropertyHandler);
Ext.fx.Animator = Ext.extend(Ext.util.Observable, {
	isAnimator : true,
	duration : 250,
	delay : 0,
	delayStart : 0,
	dynamic : false,
	easing : "ease",
	running : false,
	paused : false,
	damper : 1,
	iterations : 1,
	currentIteration : 0,
	keyframeStep : 0,
	animKeyFramesRE : /^(from|to|\d+%?)$/,
	constructor : function(a) {
		var b = this;
		a = Ext.apply(b, a || {});
		b.config = a;
		b.id = Ext.id(null, "ext-animator-");
		b.addEvents("beforeanimate", "keyframe", "afteranimate");
		Ext.fx.Animator.superclass.constructor.call(b, a);
		b.timeline = [];
		b.createTimeline(b.keyframes);
		if (b.target) {
			b.applyAnimator(b.target);
			Ext.fx.Manager.addAnim(b)
		}
	},
	sorter : function(d, c) {
		return d.pct - c.pct
	},
	createTimeline : function(d) {
		var g = this, k = [], h = g.to || {}, b = g.duration, l, a, c, f, j, e;
		for (j in d) {
			if (d.hasOwnProperty(j) && g.animKeyFramesRE.test(j)) {
				e = {
					attrs : Ext.apply(d[j], h)
				};
				if (j == "from") {
					j = 0
				} else {
					if (j == "to") {
						j = 100
					}
				}
				e.pct = parseInt(j, 10);
				k.push(e)
			}
		}
		k.sort(g.sorter);
		f = k.length;
		for (c = 0; c < f; c++) {
			l = (k[c - 1]) ? b * (k[c - 1].pct / 100) : 0;
			a = b * (k[c].pct / 100);
			g.timeline.push({
				duration : a - l,
				attrs : k[c].attrs
			})
		}
	},
	applyAnimator : function(d) {
		var g = this, h = [], k = g.timeline, f = k.length, b, e, a, j, c;
		if (g.fireEvent("beforeanimate", g) !== false) {
			for (c = 0; c < f; c++) {
				b = k[c];
				j = b.attrs;
				e = j.easing || g.easing;
				a = j.damper || g.damper;
				delete j.easing;
				delete j.damper;
				b = new Ext.fx.Anim({
					target : d,
					easing : e,
					damper : a,
					duration : b.duration,
					paused : true,
					to : j
				});
				h.push(b)
			}
			g.animations = h;
			g.target = b.target;
			for (c = 0; c < f - 1; c++) {
				b = h[c];
				b.nextAnim = h[c + 1];
				b.on("afteranimate", function() {
					this.nextAnim.paused = false
				});
				b.on("afteranimate", function() {
					this.fireEvent("keyframe", this, ++this.keyframeStep)
				}, g)
			}
			h[f - 1].on("afteranimate", function() {
				this.lastFrame()
			}, g)
		}
	},
	start : function(d) {
		var e = this, c = e.delay, b = e.delayStart, a;
		if (c) {
			if (!b) {
				e.delayStart = d;
				return
			} else {
				a = d - b;
				if (a < c) {
					return
				} else {
					d = new Date(b.getTime() + c)
				}
			}
		}
		if (e.fireEvent("beforeanimate", e) !== false) {
			e.startTime = d;
			e.running = true;
			e.animations[e.keyframeStep].paused = false
		}
	},
	lastFrame : function() {
		var c = this, a = c.iterations, b = c.currentIteration;
		b++;
		if (b < a) {
			c.startTime = new Date();
			c.currentIteration = b;
			c.keyframeStep = 0;
			c.applyAnimator(c.target);
			c.animations[c.keyframeStep].paused = false
		} else {
			c.currentIteration = 0;
			c.end()
		}
	},
	end : function() {
		var a = this;
		a.fireEvent("afteranimate", a, a.startTime, new Date() - a.startTime)
	}
});
Ext.fx.Anim = Ext
		.extend(
				Ext.util.Observable,
				{
					isAnimation : true,
					duration : 250,
					delay : 0,
					delayStart : 0,
					dynamic : false,
					easing : "ease",
					damper : 1,
					bezierRE : /^(?:cubic-)?bezier\(([^,]+),([^,]+),([^,]+),([^\)]+)\)/,
					reverse : false,
					running : false,
					paused : false,
					iterations : 1,
					alternate : false,
					currentIteration : 0,
					startTime : 0,
					constructor : function(a) {
						var b = this;
						a = a || {};
						if (a.keyframes) {
							return new Ext.fx.Animator(a)
						}
						a = Ext.apply(b, a);
						if (b.from === undefined) {
							b.from = {}
						}
						b.propHandlers = {};
						b.config = a;
						b.target = Ext.fx.Manager.createTarget(b.target);
						b.easingFn = Ext.fx.Easing[b.easing];
						b.target.dynamic = b.dynamic;
						if (!b.easingFn) {
							b.easingFn = String(b.easing).match(b.bezierRE);
							if (b.easingFn && b.easingFn.length == 5) {
								var c = b.easingFn;
								b.easingFn = Ext.fx.cubicBezier(+c[1], +c[2],
										+c[3], +c[4])
							}
						}
						b.id = Ext.id(null, "ext-anim-");
						Ext.fx.Manager.addAnim(b);
						b.addEvents("beforeanimate", "afteranimate",
								"lastframe");
						Ext.fx.Anim.superclass.constructor.call(b, a);
						if (a.callback) {
							b.on("afteranimate", a.callback, a.scope)
						}
						return b
					},
					setAttr : function(a, b) {
						return Ext.fx.Manager.items.get(this.id).setAttr(
								this.target, a, b)
					},
					initAttrs : function() {
						var e = this, g = e.from, h = e.to, f = e.initialFrom
								|| {}, c = {}, a, b, i, d;
						for (d in h) {
							if (h.hasOwnProperty(d)) {
								a = e.target.getAttr(d, g[d]);
								b = h[d];
								if (!Ext.fx.PropertyHandler[d]) {
									if (Ext.isObject(b)) {
										i = e.propHandlers[d] = Ext.fx.PropertyHandler.object
									} else {
										i = e.propHandlers[d] = Ext.fx.PropertyHandler.defaultHandler
									}
								} else {
									i = e.propHandlers[d] = Ext.fx.PropertyHandler[d]
								}
								c[d] = i.get(a, b, e.damper, f[d], d)
							}
						}
						e.currentAttrs = c
					},
					start : function(d) {
						var e = this, c = e.delay, b = e.delayStart, a;
						if (c) {
							if (!b) {
								e.delayStart = d;
								return
							} else {
								a = d - b;
								if (a < c) {
									return
								} else {
									d = new Date(b.getTime() + c)
								}
							}
						}
						if (e.fireEvent("beforeanimate", e) !== false) {
							e.startTime = d;
							if (!e.paused && !e.currentAttrs) {
								e.initAttrs()
							}
							e.running = true
						}
					},
					runAnim : function(k) {
						var h = this, j = h.currentAttrs, d = h.duration, c = h.easingFn, b = h.propHandlers, f = {}, g, i, e, a;
						if (k >= d) {
							k = d;
							a = true
						}
						if (h.reverse) {
							k = d - k
						}
						for (e in j) {
							if (j.hasOwnProperty(e)) {
								i = j[e];
								g = a ? 1 : c(k / d);
								f[e] = b[e].set(i, g)
							}
						}
						return f
					},
					lastFrame : function() {
						var c = this, a = c.iterations, b = c.currentIteration;
						b++;
						if (b < a) {
							if (c.alternate) {
								c.reverse = !c.reverse
							}
							c.startTime = new Date();
							c.currentIteration = b;
							c.paused = false
						} else {
							c.currentIteration = 0;
							c.end();
							c.fireEvent("lastframe", c, c.startTime)
						}
					},
					end : function() {
						var a = this;
						a.startTime = 0;
						a.paused = false;
						a.running = false;
						Ext.fx.Manager.removeAnim(a);
						a.fireEvent("afteranimate", a, a.startTime)
					}
				});
Ext.enableFx = true;
Ext.fx.target.Target = Ext.extend(Object, {
	isAnimTarget : true,
	constructor : function(a) {
		this.target = a;
		this.id = this.getId()
	},
	getId : function() {
		return this.target.id
	}
});
Ext.fx.target.Sprite = Ext.extend(Ext.fx.target.Target, {
	type : "draw",
	getFromPrim : function(b, a) {
		var c;
		if (a == "translate") {
			c = {
				x : b.attr.translation.x || 0,
				y : b.attr.translation.y || 0
			}
		} else {
			if (a == "rotate") {
				c = {
					degrees : b.attr.rotation.degrees || 0,
					x : b.attr.rotation.x,
					y : b.attr.rotation.y
				}
			} else {
				c = b.attr[a]
			}
		}
		return c
	},
	getAttr : function(a, b) {
		return [ [ this.target,
				b != undefined ? b : this.getFromPrim(this.target, a) ] ]
	},
	setAttr : function(m) {
		var g = m.length, k = [], q, f, p, e, b, o, n, d, c, l, h, a;
		for (d = 0; d < g; d++) {
			q = m[d].attrs;
			for (f in q) {
				p = q[f];
				a = p.length;
				for (c = 0; c < a; c++) {
					b = p[c][0];
					e = p[c][1];
					if (f === "translate") {
						n = {
							x : e.x,
							y : e.y
						}
					} else {
						if (f === "rotate") {
							l = e.x;
							if (isNaN(l)) {
								l = null
							}
							h = e.y;
							if (isNaN(h)) {
								h = null
							}
							n = {
								degrees : e.degrees,
								x : l,
								y : h
							}
						} else {
							if (f === "width" || f === "height" || f === "x"
									|| f === "y") {
								n = parseFloat(e)
							} else {
								n = e
							}
						}
					}
					o = k.indexOf(b);
					if (o == -1) {
						k.push([ b, {} ]);
						o = k.length - 1
					}
					k[o][1][f] = n
				}
			}
		}
		g = k.length;
		for (d = 0; d < g; d++) {
			b = k[d];
			b[0].setAttributes(b[1])
		}
		this.target.tween()
	}
});
Ext.fx.target.CompositeSprite = Ext.extend(Ext.fx.target.Sprite, {
	getAttr : function(a, d) {
		var b = [], c = this.target;
		c.each(function(e) {
			b.push([ e, d != undefined ? d : this.getFromPrim(e, a) ])
		}, this);
		return b
	}
});
Ext.util.Animate = {
	animate : function(a) {
		var b = this;
		if (Ext.fx.Manager.hasFxBlock(b.id)) {
			return b
		}
		Ext.fx.Manager.queueFx(new Ext.fx.Anim(b.anim(a)));
		return this
	},
	anim : function(a) {
		if (!Ext.isObject(a)) {
			return (a) ? {} : false
		}
		var b = this;
		if (a.stopAnimation) {
			b.stopAnimation()
		}
		Ext.applyIf(a, Ext.fx.Manager.getFxDefaults(b.id));
		return Ext.apply({
			target : b,
			paused : true
		}, a)
	},
	stopAnimation : function() {
		Ext.fx.Manager.stopAnimation(this.id);
		return this
	},
	syncFx : function() {
		Ext.fx.Manager.setFxDefaults(this.id, {
			concurrent : true
		});
		return this
	},
	sequenceFx : function() {
		Ext.fx.Manager.setFxDefaults(this.id, {
			concurrent : false
		});
		return this
	},
	getActiveAnimation : function() {
		return Ext.fx.Manager.getActiveAnimation(this.id)
	}
};
Ext.layout.DrawLayout = Ext.extend(Ext.layout.AutoComponentLayout, {
	type : "draw",
	onLayout : function(b, a) {
		this.owner.surface.setSize(b, a);
		Ext.layout.DrawLayout.superclass.onLayout.apply(this, arguments)
	}
});
Ext.regLayout("draw", Ext.layout.DrawLayout);
Ext.ns("Ext.draw.engine");
Ext.draw.Color = Ext
		.extend(
				Object,
				{
					colorToHexRe : /(.*?)rgb\((\d+),\s*(\d+),\s*(\d+)\)/,
					rgbRe : /\s*rgba?\s*\(\s*([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\s*(,\s*[0-9\.]+\s*)?\)\s*/,
					hexRe : /\s*#([0-9a-fA-F][0-9a-fA-F]?)([0-9a-fA-F][0-9a-fA-F]?)([0-9a-fA-F][0-9a-fA-F]?)\s*/,
					lightnessFactor : 0.2,
					constructor : function(d, c, a) {
						var b = this, e = Ext.util.Numbers.constrain;
						b.r = e(d, 0, 255);
						b.g = e(c, 0, 255);
						b.b = e(a, 0, 255)
					},
					getRed : function() {
						return this.r
					},
					getGreen : function() {
						return this.g
					},
					getBlue : function() {
						return this.b
					},
					getRGB : function() {
						var a = this;
						return [ a.r, a.g, a.b ]
					},
					getHSL : function() {
						var i = this, a = i.r / 255, f = i.g / 255, j = i.b / 255, k = Math
								.max(a, f, j), d = Math.min(a, f, j), m = k - d, e, n = 0, c = 0.5 * (k + d);
						if (d != k) {
							n = (c < 0.5) ? m / (k + d) : m / (2 - k - d);
							if (a == k) {
								e = 60 * (f - j) / m
							} else {
								if (f == k) {
									e = 120 + 60 * (j - a) / m
								} else {
									e = 240 + 60 * (a - f) / m
								}
							}
							if (e < 0) {
								e += 360
							}
							if (e >= 360) {
								e -= 360
							}
						}
						return [ e, n, c ]
					},
					getLighter : function(b) {
						var a = this.getHSL();
						b = b || this.lightnessFactor;
						a[2] = Ext.util.Numbers.constrain(a[2] + b, 0, 1);
						return this.fromHSL(a[0], a[1], a[2])
					},
					getDarker : function(a) {
						a = a || this.lightnessFactor;
						return this.getLighter(-a)
					},
					toString : function() {
						var f = this, c = Math.round, e = c(f.r).toString(16), d = c(
								f.g).toString(16), a = c(f.b).toString(16);
						e = (e.length == 1) ? "0" + e : e;
						d = (d.length == 1) ? "0" + d : d;
						a = (a.length == 1) ? "0" + a : a;
						return [ "#", e, d, a ].join("")
					},
					toHex : function(b) {
						if (Ext.isArray(b)) {
							b = b[0]
						}
						if (!Ext.isString(b)) {
							return ""
						}
						if (b.substr(0, 1) === "#") {
							return b
						}
						var e = this.colorToHexRe.exec(b);
						if (Ext.isArray(e)) {
							var f = parseInt(e[2], 10), d = parseInt(e[3], 10), a = parseInt(
									e[4], 10), c = a | (d << 8) | (f << 16);
							return e[1] + "#"
									+ ("000000" + c.toString(16)).slice(-6)
						} else {
							return ""
						}
					},
					fromString : function(h) {
						var c, e, d, a, f = parseInt;
						if ((h.length == 4 || h.length == 7)
								&& h.substr(0, 1) === "#") {
							c = h.match(this.hexRe);
							if (c) {
								e = f(c[1], 16) >> 0;
								d = f(c[2], 16) >> 0;
								a = f(c[3], 16) >> 0;
								if (h.length == 4) {
									e += (e * 16);
									d += (d * 16);
									a += (a * 16)
								}
							}
						} else {
							c = h.match(this.rgbRe);
							if (c) {
								e = c[1];
								d = c[2];
								a = c[3]
							}
						}
						return (typeof e == "undefined") ? undefined
								: new Ext.draw.Color(e, d, a)
					},
					getGrayscale : function() {
						return this.r * 0.3 + this.g * 0.59 + this.b * 0.11
					},
					fromHSL : function(e, i, d) {
						var a, b, c, g = [], j = Math.abs, f = Math.floor;
						if (i == 0 || e == null) {
							g = [ d, d, d ]
						} else {
							e /= 60;
							a = i * (1 - j(2 * d - 1));
							b = a * (1 - j(e - 2 * f(e / 2) - 1));
							c = d - a / 2;
							switch (f(e)) {
							case 0:
								g = [ a, b, 0 ];
								break;
							case 1:
								g = [ b, a, 0 ];
								break;
							case 2:
								g = [ 0, a, b ];
								break;
							case 3:
								g = [ 0, b, a ];
								break;
							case 4:
								g = [ b, 0, a ];
								break;
							case 5:
								g = [ a, 0, b ];
								break
							}
							g = [ g[0] + c, g[1] + c, g[2] + c ]
						}
						return new Ext.draw.Color(g[0] * 255, g[1] * 255,
								g[2] * 255)
					}
				});
(function() {
	var a = Ext.draw.Color.prototype;
	Ext.draw.Color.fromHSL = function() {
		return a.fromHSL.apply(a, arguments)
	};
	Ext.draw.Color.fromString = function() {
		return a.fromString.apply(a, arguments)
	};
	Ext.draw.Color.toHex = function() {
		return a.toHex.apply(a, arguments)
	}
})();
Ext.draw.Draw = {
	pathToStringRE : /,?([achlmqrstvxz]),?/gi,
	pathCommandRE : /([achlmqstvz])[\s,]*((-?\d*\.?\d*(?:e[-+]?\d+)?\s*,?\s*)+)/ig,
	pathValuesRE : /(-?\d*\.?\d*(?:e[-+]?\d+)?)\s*,?\s*/ig,
	stopsRE : /^(\d+%?)$/,
	radian : Math.PI / 180,
	pi2 : Math.PI * 2,
	snapEndsIntervalWeights : [ [ 0, 15 ], [ 20, 4 ], [ 30, 2 ], [ 40, 4 ],
			[ 50, 9 ], [ 60, 4 ], [ 70, 2 ], [ 80, 4 ], [ 100, 15 ] ],
	is : function(b, a) {
		a = String(a).toLowerCase();
		return (a == "object" && b === Object(b))
				|| (a == "undefined" && typeof b == a)
				|| (a == "null" && b === null)
				|| (a == "array" && Array.isArray && Array.isArray(b))
				|| (Object.prototype.toString.call(b).toLowerCase()
						.slice(8, -1)) == a
	},
	ellipsePath : function(b) {
		var a = b.attr;
		return Ext.String.format(
				"M{0},{1}A{2},{3},0,1,1,{0},{4}A{2},{3},0,1,1,{0},{1}z", a.x,
				a.y - a.ry, a.rx, a.ry, a.y + a.ry)
	},
	rectPath : function(b) {
		var a = b.attr;
		if (a.radius) {
			return Ext.String
					.format(
							"M{0},{1}l{2},0a{3},{3},0,0,1,{3},{3}l0,{5}a{3},{3},0,0,1,{4},{3}l{6},0a{3},{3},0,0,1,{4},{4}l0,{7}a{3},{3},0,0,1,{3},{4}z",
							a.x + a.radius, a.y, a.width - a.radius * 2,
							a.radius, -a.radius, a.height - a.radius * 2,
							a.radius * 2 - a.width, a.radius * 2 - a.height)
		} else {
			return Ext.String.format("M{0},{1}l{2},0,0,{3},{4},0z", a.x, a.y,
					a.width, a.height, -a.width)
		}
	},
	pathToString : function(a) {
		if (Ext.isArray(a)) {
			a = a.join(",")
		}
		return a.replace(Ext.draw.Draw.pathToStringRE, "$1")
	},
	parsePathString : function(a) {
		if (!a) {
			return null
		}
		var d = {
			a : 7,
			c : 6,
			h : 1,
			l : 2,
			m : 2,
			q : 4,
			s : 4,
			t : 2,
			v : 1,
			z : 0
		}, c = [], b = this;
		if (b.is(a, "array") && b.is(a[0], "array")) {
			c = b.pathClone(a)
		}
		if (!c.length) {
			Ext.draw.Draw.pathToString(a).replace(b.pathCommandRE,
					function(f, e, i) {
						var h = [], g = e.toLowerCase();
						i.replace(b.pathValuesRE, function(k, j) {
							j && h.push(+j)
						});
						if (g == "m" && h.length > 2) {
							c.push([ e ].concat(h.splice(0, 2)));
							g = "l";
							e = (e == "m") ? "l" : "L"
						}
						while (h.length >= d[g]) {
							c.push([ e ].concat(h.splice(0, d[g])));
							if (!d[g]) {
								break
							}
						}
					})
		}
		return c
	},
	mapPath : function(k, f) {
		if (!f) {
			return k
		}
		var g, e, c, h, a, d, b;
		k = this.path2curve(k);
		for (c = 0, h = k.length; c < h; c++) {
			b = k[c];
			for (a = 1, d = b.length; a < d - 1; a += 2) {
				g = f.x(b[a], b[a + 1]);
				e = f.y(b[a], b[a + 1]);
				b[a] = g;
				b[a + 1] = e
			}
		}
		return k
	},
	pathClone : function(f) {
		var c = [], a, e, b, d;
		if (!this.is(f, "array") || !this.is(f && f[0], "array")) {
			f = this.parsePathString(f)
		}
		for (b = 0, d = f.length; b < d; b++) {
			c[b] = [];
			for (a = 0, e = f[b].length; a < e; a++) {
				c[b][a] = f[b][a]
			}
		}
		return c
	},
	pathToAbsolute : function(c) {
		if (!this.is(c, "array") || !this.is(c && c[0], "array")) {
			c = this.parsePathString(c)
		}
		var h = [], l = 0, k = 0, n = 0, m = 0, f = 0, g = c.length, b, d, e, a;
		if (c[0][0] == "M") {
			l = +c[0][1];
			k = +c[0][2];
			n = l;
			m = k;
			f++;
			h[0] = [ "M", l, k ]
		}
		for (; f < g; f++) {
			b = h[f] = [];
			d = c[f];
			if (d[0] != d[0].toUpperCase()) {
				b[0] = d[0].toUpperCase();
				switch (b[0]) {
				case "A":
					b[1] = d[1];
					b[2] = d[2];
					b[3] = d[3];
					b[4] = d[4];
					b[5] = d[5];
					b[6] = +(d[6] + l);
					b[7] = +(d[7] + k);
					break;
				case "V":
					b[1] = +d[1] + k;
					break;
				case "H":
					b[1] = +d[1] + l;
					break;
				case "M":
					n = +d[1] + l;
					m = +d[2] + k;
				default:
					e = 1;
					a = d.length;
					for (; e < a; e++) {
						b[e] = +d[e] + ((e % 2) ? l : k)
					}
				}
			} else {
				e = 0;
				a = d.length;
				for (; e < a; e++) {
					h[f][e] = d[e]
				}
			}
			switch (b[0]) {
			case "Z":
				l = n;
				k = m;
				break;
			case "H":
				l = b[1];
				break;
			case "V":
				k = b[1];
				break;
			case "M":
				d = h[f];
				a = d.length;
				n = d[a - 2];
				m = d[a - 1];
			default:
				d = h[f];
				a = d.length;
				l = d[a - 2];
				k = d[a - 1]
			}
		}
		return h
	},
	path2curve : function(j) {
		var d = this, g = d.pathToAbsolute(j), c = g.length, h = {
			x : 0,
			y : 0,
			bx : 0,
			by : 0,
			X : 0,
			Y : 0,
			qx : null,
			qy : null
		}, b, a, f, e;
		for (b = 0; b < c; b++) {
			g[b] = d.command2curve(g[b], h);
			if (g[b].length > 7) {
				g[b].shift();
				e = g[b];
				while (e.length) {
					g.splice(b++, 0, [ "C" ].concat(e.splice(0, 6)))
				}
				g.splice(b, 1);
				c = g.length
			}
			a = g[b];
			f = a.length;
			h.x = a[f - 2];
			h.y = a[f - 1];
			h.bx = parseFloat(a[f - 4]) || h.x;
			h.by = parseFloat(a[f - 3]) || h.y
		}
		return g
	},
	interpolatePaths : function(q, k) {
		var h = this, d = h.pathToAbsolute(q), l = h.pathToAbsolute(k), m = {
			x : 0,
			y : 0,
			bx : 0,
			by : 0,
			X : 0,
			Y : 0,
			qx : null,
			qy : null
		}, a = {
			x : 0,
			y : 0,
			bx : 0,
			by : 0,
			X : 0,
			Y : 0,
			qx : null,
			qy : null
		}, b = function(p, r) {
			if (p[r].length > 7) {
				p[r].shift();
				var s = p[r];
				while (s.length) {
					p.splice(r++, 0, [ "C" ].concat(s.splice(0, 6)))
				}
				p.splice(r, 1);
				n = Math.max(d.length, l.length || 0)
			}
		}, c = function(u, t, r, p, s) {
			if (u && t && u[s][0] == "M" && t[s][0] != "M") {
				t.splice(s, 0, [ "M", p.x, p.y ]);
				r.bx = 0;
				r.by = 0;
				r.x = u[s][1];
				r.y = u[s][2];
				n = Math.max(d.length, l.length || 0)
			}
		};
		for ( var g = 0, n = Math.max(d.length, l.length || 0); g < n; g++) {
			d[g] = h.command2curve(d[g], m);
			b(d, g);
			(l[g] = h.command2curve(l[g], a));
			b(l, g);
			c(d, l, m, a, g);
			c(l, d, a, m, g);
			var f = d[g], o = l[g], e = f.length, j = o.length;
			m.x = f[e - 2];
			m.y = f[e - 1];
			m.bx = parseFloat(f[e - 4]) || m.x;
			m.by = parseFloat(f[e - 3]) || m.y;
			a.bx = (parseFloat(o[j - 4]) || a.x);
			a.by = (parseFloat(o[j - 3]) || a.y);
			a.x = o[j - 2];
			a.y = o[j - 1]
		}
		return [ d, l ]
	},
	command2curve : function(c, b) {
		var a = this;
		if (!c) {
			return [ "C", b.x, b.y, b.x, b.y, b.x, b.y ]
		}
		if (c[0] != "T" && c[0] != "Q") {
			b.qx = b.qy = null
		}
		switch (c[0]) {
		case "M":
			b.X = c[1];
			b.Y = c[2];
			break;
		case "A":
			c = [ "C" ].concat(a.arc2curve.apply(a, [ b.x, b.y ].concat(c
					.slice(1))));
			break;
		case "S":
			c = [ "C", b.x + (b.x - (b.bx || b.x)), b.y + (b.y - (b.by || b.y)) ]
					.concat(c.slice(1));
			break;
		case "T":
			b.qx = b.x + (b.x - (b.qx || b.x));
			b.qy = b.y + (b.y - (b.qy || b.y));
			c = [ "C" ].concat(a.quadratic2curve(b.x, b.y, b.qx, b.qy, c[1],
					c[2]));
			break;
		case "Q":
			b.qx = c[1];
			b.qy = c[2];
			c = [ "C" ].concat(a.quadratic2curve(b.x, b.y, c[1], c[2], c[3],
					c[4]));
			break;
		case "L":
			c = [ "C" ].concat(b.x, b.y, c[1], c[2], c[1], c[2]);
			break;
		case "H":
			c = [ "C" ].concat(b.x, b.y, c[1], b.y, c[1], b.y);
			break;
		case "V":
			c = [ "C" ].concat(b.x, b.y, b.x, c[1], b.x, c[1]);
			break;
		case "Z":
			c = [ "C" ].concat(b.x, b.y, b.X, b.Y, b.X, b.Y);
			break
		}
		return c
	},
	quadratic2curve : function(b, d, g, e, a, c) {
		var f = 1 / 3, h = 2 / 3;
		return [ f * b + h * g, f * d + h * e, f * a + h * g, f * c + h * e, a,
				c ]
	},
	rotate : function(b, g, a) {
		var d = Math.cos(a), c = Math.sin(a), f = b * d - g * c, e = b * c + g
				* d;
		return {
			x : f,
			y : e
		}
	},
	arc2curve : function(u, ag, I, G, A, n, g, s, af, B) {
		var w = this, e = Math.PI, z = w.radian, F = e * 120 / 180, b = z
				* (+A || 0), N = [], K = Math, U = K.cos, a = K.sin, W = K.sqrt, v = K.abs, o = K.asin, J, c, q, P, O, ab, d, S, V, D, C, m, l, r, j, ae, f, ad, Q, T, R, ac, aa, Z, X, M, Y, L, E, H, p;
		if (!B) {
			J = w.rotate(u, ag, -b);
			u = J.x;
			ag = J.y;
			J = w.rotate(s, af, -b);
			s = J.x;
			af = J.y;
			c = U(z * A);
			q = a(z * A);
			P = (u - s) / 2;
			O = (ag - af) / 2;
			ab = (P * P) / (I * I) + (O * O) / (G * G);
			if (ab > 1) {
				ab = W(ab);
				I = ab * I;
				G = ab * G
			}
			d = I * I;
			S = G * G;
			V = (n == g ? -1 : 1)
					* W(v((d * S - d * O * O - S * P * P)
							/ (d * O * O + S * P * P)));
			D = V * I * O / G + (u + s) / 2;
			C = V * -G * P / I + (ag + af) / 2;
			m = o(((ag - C) / G).toFixed(7));
			l = o(((af - C) / G).toFixed(7));
			m = u < D ? e - m : m;
			l = s < D ? e - l : l;
			if (m < 0) {
				m = e * 2 + m
			}
			if (l < 0) {
				l = e * 2 + l
			}
			if (g && m > l) {
				m = m - e * 2
			}
			if (!g && l > m) {
				l = l - e * 2
			}
		} else {
			m = B[0];
			l = B[1];
			D = B[2];
			C = B[3]
		}
		r = l - m;
		if (v(r) > F) {
			E = l;
			H = s;
			p = af;
			l = m + F * (g && l > m ? 1 : -1);
			s = D + I * U(l);
			af = C + G * a(l);
			N = w.arc2curve(s, af, I, G, A, 0, g, H, p, [ l, E, D, C ])
		}
		r = l - m;
		j = U(m);
		ae = a(m);
		f = U(l);
		ad = a(l);
		Q = K.tan(r / 4);
		T = 4 / 3 * I * Q;
		R = 4 / 3 * G * Q;
		ac = [ u, ag ];
		aa = [ u + T * ae, ag - R * j ];
		Z = [ s + T * ad, af - R * f ];
		X = [ s, af ];
		aa[0] = 2 * ac[0] - aa[0];
		aa[1] = 2 * ac[1] - aa[1];
		if (B) {
			return [ aa, Z, X ].concat(N)
		} else {
			N = [ aa, Z, X ].concat(N).join().split(",");
			M = [];
			L = N.length;
			for (Y = 0; Y < L; Y++) {
				M[Y] = Y % 2 ? w.rotate(N[Y - 1], N[Y], b).y : w.rotate(N[Y],
						N[Y + 1], b).x
			}
			return M
		}
	},
	pathDimensions : function(l) {
		if (!l || !l.length) {
			return {
				x : 0,
				y : 0,
				width : 0,
				height : 0
			}
		}
		l = this.path2curve(l);
		var j = 0, h = 0, d = [], b = [], e = 0, g = l.length, c, a, k, f;
		for (; e < g; e++) {
			c = l[e];
			if (c[0] == "M") {
				j = c[1];
				h = c[2];
				d.push(j);
				b.push(h)
			} else {
				f = this.curveDim(j, h, c[1], c[2], c[3], c[4], c[5], c[6]);
				d = d.concat(f.min.x, f.max.x);
				b = b.concat(f.min.y, f.max.y);
				j = c[5];
				h = c[6]
			}
		}
		a = Math.min.apply(0, d);
		k = Math.min.apply(0, b);
		return {
			x : a,
			y : k,
			path : l,
			width : Math.max.apply(0, d) - a,
			height : Math.max.apply(0, b) - k
		}
	},
	intersectInside : function(b, c, a) {
		return (a[0] - c[0]) * (b[1] - c[1]) > (a[1] - c[1]) * (b[0] - c[0])
	},
	intersectIntersection : function(m, l, f, d) {
		var c = [], b = f[0] - d[0], a = f[1] - d[1], j = m[0] - l[0], h = m[1]
				- l[1], k = f[0] * d[1] - f[1] * d[0], i = m[0] * l[1] - m[1]
				* l[0], g = 1 / (b * h - a * j);
		c[0] = (k * j - i * b) * g;
		c[1] = (k * h - i * a) * g;
		return c
	},
	intersect : function(n, c) {
		var m = this, h = 0, l = c.length, g = c[l - 1], o = n, f, p, k, a, b, d;
		for (; h < l; ++h) {
			f = c[h];
			b = o;
			o = [];
			p = b[b.length - 1];
			d = 0;
			a = b.length;
			for (; d < a; d++) {
				k = b[d];
				if (m.intersectInside(k, g, f)) {
					if (!m.intersectInside(p, g, f)) {
						o.push(m.intersectIntersection(p, k, g, f))
					}
					o.push(k)
				} else {
					if (m.intersectInside(p, g, f)) {
						o.push(m.intersectIntersection(p, k, g, f))
					}
				}
				p = k
			}
			g = f
		}
		return o
	},
	curveDim : function(f, d, h, g, s, r, o, l) {
		var q = (s - 2 * h + f) - (o - 2 * s + h), n = 2 * (h - f) - 2
				* (s - h), k = f - h, j = (-n + Math.sqrt(n * n - 4 * q * k))
				/ 2 / q, i = (-n - Math.sqrt(n * n - 4 * q * k)) / 2 / q, m = [
				d, l ], p = [ f, o ], e;
		if (Math.abs(j) > 1000000000000) {
			j = 0.5
		}
		if (Math.abs(i) > 1000000000000) {
			i = 0.5
		}
		if (j > 0 && j < 1) {
			e = this.findDotAtSegment(f, d, h, g, s, r, o, l, j);
			p.push(e.x);
			m.push(e.y)
		}
		if (i > 0 && i < 1) {
			e = this.findDotAtSegment(f, d, h, g, s, r, o, l, i);
			p.push(e.x);
			m.push(e.y)
		}
		q = (r - 2 * g + d) - (l - 2 * r + g);
		n = 2 * (g - d) - 2 * (r - g);
		k = d - g;
		j = (-n + Math.sqrt(n * n - 4 * q * k)) / 2 / q;
		i = (-n - Math.sqrt(n * n - 4 * q * k)) / 2 / q;
		if (Math.abs(j) > 1000000000000) {
			j = 0.5
		}
		if (Math.abs(i) > 1000000000000) {
			i = 0.5
		}
		if (j > 0 && j < 1) {
			e = this.findDotAtSegment(f, d, h, g, s, r, o, l, j);
			p.push(e.x);
			m.push(e.y)
		}
		if (i > 0 && i < 1) {
			e = this.findDotAtSegment(f, d, h, g, s, r, o, l, i);
			p.push(e.x);
			m.push(e.y)
		}
		return {
			min : {
				x : Math.min.apply(0, p),
				y : Math.min.apply(0, m)
			},
			max : {
				x : Math.max.apply(0, p),
				y : Math.max.apply(0, m)
			}
		}
	},
	getAnchors : function(f, e, j, i, u, t, p) {
		p = p || 4;
		var c = Math, o = c.PI, q = o / 2, l = c.abs, a = c.sin, b = c.cos, g = c.atan, s, r, h, k, n, m, w, v, d;
		s = (j - f) / p;
		r = (u - j) / p;
		if ((i >= e && i >= t) || (i <= e && i <= t)) {
			h = k = q
		} else {
			h = g((j - f) / l(i - e));
			if (e < i) {
				h = o - h
			}
			k = g((u - j) / l(i - t));
			if (t < i) {
				k = o - k
			}
		}
		d = q - ((h + k) % (o * 2)) / 2;
		if (d > q) {
			d -= o
		}
		h += d;
		k += d;
		n = j - s * a(h);
		m = i + s * b(h);
		w = j + r * a(k);
		v = i + r * b(k);
		if ((i > e && m < e) || (i < e && m > e)) {
			n += l(e - m) * (n - j) / (m - i);
			m = e
		}
		if ((i > t && v < t) || (i < t && v > t)) {
			w -= l(t - v) * (w - j) / (v - i);
			v = t
		}
		return {
			x1 : n,
			y1 : m,
			x2 : w,
			y2 : v
		}
	},
	smooth : function(a, q) {
		var p = this.path2curve(a), e = [ p[0] ], h = p[0][1], g = p[0][2], r, t, u = 1, k = p.length, f = 1, m = h, l = g, c = 0, b = 0;
		for (; u < k; u++) {
			var z = p[u], w = z.length, v = p[u - 1], n = v.length, s = p[u + 1], o = s
					&& s.length;
			if (z[0] == "M") {
				m = z[1];
				l = z[2];
				r = u + 1;
				while (p[r][0] != "C") {
					r++
				}
				c = p[r][5];
				b = p[r][6];
				e.push([ "M", m, l ]);
				f = e.length;
				h = m;
				g = l;
				continue
			}
			if (z[w - 2] == m && z[w - 1] == l && (!s || s[0] == "M")) {
				var d = e[f].length;
				t = this.getAnchors(v[n - 2], v[n - 1], m, l, e[f][d - 2],
						e[f][d - 1], q);
				e[f][1] = t.x2;
				e[f][2] = t.y2
			} else {
				if (!s || s[0] == "M") {
					t = {
						x1 : z[w - 2],
						y1 : z[w - 1]
					}
				} else {
					t = this.getAnchors(v[n - 2], v[n - 1], z[w - 2], z[w - 1],
							s[o - 2], s[o - 1], q)
				}
			}
			e.push([ "C", h, g, t.x1, t.y1, z[w - 2], z[w - 1] ]);
			h = t.x2;
			g = t.y2
		}
		return e
	},
	findDotAtSegment : function(b, a, d, c, i, h, g, f, j) {
		var e = 1 - j;
		return {
			x : Math.pow(e, 3) * b + Math.pow(e, 2) * 3 * j * d + e * 3 * j * j
					* i + Math.pow(j, 3) * g,
			y : Math.pow(e, 3) * a + Math.pow(e, 2) * 3 * j * c + e * 3 * j * j
					* h + Math.pow(j, 3) * f
		}
	},
	snapEnds : function(p, b, m, n) {
		var d = Math, e = d.pow, r = d.floor, f = (b - p) / m, j = r(d.log(f)
				/ d.LN10) + 1, g = e(10, j), s = d
				.round((f % g) * e(10, 2 - j)), t = Ext.draw.Draw.snapEndsIntervalWeights, h = t.length, a = 0, u = 1000000000, c, o, l, q, k;
		if (!n) {
			p = r(p / g) * g
		}
		c = p;
		for (q = 0; q < h; q++) {
			o = t[q][0];
			l = (o - s) < 0 ? 1000000 : (o - s) / t[q][1];
			if (l < u) {
				k = o;
				u = l
			}
		}
		f = r(f * e(10, -j)) * e(10, j) + k * e(10, j - 2);
		while (c < b) {
			c += f;
			a++
		}
		if (!n) {
			b = +c.toFixed(10)
		}
		return {
			from : p,
			to : b,
			power : j,
			step : f,
			steps : a
		}
	},
	sorter : function(d, c) {
		return d.offset - c.offset
	},
	rad : function(a) {
		return a % 360 * Math.PI / 180
	},
	degrees : function(a) {
		return a * 180 / Math.PI % 360
	},
	withinBox : function(a, c, b) {
		b = b || {};
		return (a >= b.x && a <= (b.x + b.width) && c >= b.y && c <= (b.y + b.height))
	},
	parseGradient : function(j) {
		var e = this, f = j.type || "linear", c = j.angle || 0, h = e.radian, k = j.stops, a = [], i, b, g, d;
		if (f == "linear") {
			b = [ 0, 0, Math.cos(c * h), Math.sin(c * h) ];
			g = 1 / (Math.max(Math.abs(b[2]), Math.abs(b[3])) || 1);
			b[2] *= g;
			b[3] *= g;
			if (b[2] < 0) {
				b[0] = -b[2];
				b[2] = 0
			}
			if (b[3] < 0) {
				b[1] = -b[3];
				b[3] = 0
			}
		}
		for (i in k) {
			if (k.hasOwnProperty(i) && e.stopsRE.test(i)) {
				d = {
					offset : parseInt(i, 10),
					color : Ext.draw.Color.toHex(k[i].color) || "#ffffff",
					opacity : k[i].opacity || 1
				};
				a.push(d)
			}
		}
		a.sort(e.sorter);
		if (f == "linear") {
			return {
				id : j.id,
				type : f,
				vector : b,
				stops : a
			}
		} else {
			return {
				id : j.id,
				type : f,
				centerX : j.centerX,
				centerY : j.centerY,
				focalX : j.focalX,
				focalY : j.focalY,
				radius : j.radius,
				vector : b,
				stops : a
			}
		}
	}
};
Ext.draw.CompositeSprite = Ext
		.extend(
				Ext.util.MixedCollection,
				{
					isCompositeSprite : true,
					constructor : function(a) {
						var b = this;
						a = a || {};
						Ext.apply(b, a);
						b.addEvents("mousedown", "mouseup", "mouseover",
								"mouseout", "click");
						b.id = Ext.id(null, "ext-sprite-group-");
						Ext.draw.CompositeSprite.superclass.constructor.apply(
								this, arguments)
					},
					onClick : function(a) {
						this.fireEvent("click", a)
					},
					onMouseUp : function(a) {
						this.fireEvent("mouseup", a)
					},
					onMouseDown : function(a) {
						this.fireEvent("mousedown", a)
					},
					onMouseOver : function(a) {
						this.fireEvent("mouseover", a)
					},
					onMouseOut : function(a) {
						this.fireEvent("mouseout", a)
					},
					attachEvents : function(b) {
						var a = this;
						b.on({
							scope : a,
							mousedown : a.onMouseDown,
							mouseup : a.onMouseUp,
							mouseover : a.onMouseOver,
							mouseout : a.onMouseOut,
							click : a.onClick
						})
					},
					add : function(b, c) {
						var a = Ext.draw.CompositeSprite.superclass.add.apply(
								this, arguments);
						this.attachEvents(a);
						return a
					},
					insert : function(a, b, c) {
						return Ext.draw.CompositeSprite.superclass.insert
								.apply(this, arguments)
					},
					remove : function(b) {
						var a = this;
						b.un({
							scope : a,
							mousedown : a.onMouseDown,
							mouseup : a.onMouseUp,
							mouseover : a.onMouseOver,
							mouseout : a.onMouseOut,
							click : a.onClick
						});
						Ext.draw.CompositeSprite.superclass.remove.apply(this,
								arguments)
					},
					getBBox : function() {
						var c = 0, k, f, g = this.items, d = this.length, e = Infinity, b = e, j = -e, a = e, h = -e;
						for (; c < d; c++) {
							k = g[c];
							f = k.getBBox();
							b = Math.min(b, f.x);
							a = Math.min(a, f.y);
							j = Math.max(j, f.height + f.y);
							h = Math.max(h, f.width + f.x)
						}
						return {
							x : b,
							y : a,
							height : j - a,
							width : h - b
						}
					},
					setAttributes : function(c, e) {
						var d = 0, b = this.items, a = this.length;
						for (; d < a; d++) {
							b[d].setAttributes(c, e)
						}
						return this
					},
					hide : function(d) {
						var c = 0, b = this.items, a = this.length;
						for (; c < a; c++) {
							b[c].hide(d)
						}
						return this
					},
					show : function(d) {
						var c = 0, b = this.items, a = this.length;
						for (; c < a; c++) {
							b[c].show(d)
						}
						return this
					},
					redraw : function() {
						var e = this, d = 0, c = e.items, b = e.getSurface(), a = e.length;
						if (b) {
							for (; d < a; d++) {
								b.renderItem(c[d])
							}
						}
						return e
					},
					setStyle : function(f) {
						var c = 0, b = this.items, a = this.length, e, d;
						for (; c < a; c++) {
							e = b[c];
							d = e.el;
							if (d) {
								d.setStyle(f)
							}
						}
					},
					addCls : function(e) {
						var d = 0, c = this.items, b = this.getSurface(), a = this.length;
						if (b) {
							for (; d < a; d++) {
								b.addCls(c[d], e)
							}
						}
					},
					removeCls : function(e) {
						var d = 0, c = this.items, b = this.getSurface(), a = this.length;
						if (b) {
							for (; d < a; d++) {
								b.removeCls(c[d], e)
							}
						}
					},
					getSurface : function() {
						var a = this.first();
						if (a) {
							return a.surface
						}
						return null
					},
					destroy : function() {
						var c = this, a = c.getSurface(), b;
						if (a) {
							while (c.getCount() > 0) {
								b = c.first();
								c.remove(b);
								a.remove(b)
							}
						}
						c.clearListeners()
					}
				});
Ext.applyIf(Ext.draw.CompositeSprite.prototype, Ext.util.Animate.prototype);
Ext.draw.Sprite = Ext
		.extend(
				Ext.util.Observable,
				{
					dirty : false,
					dirtyHidden : false,
					dirtyTransform : false,
					dirtyPath : true,
					dirtyFont : true,
					zIndexDirty : true,
					isSprite : true,
					zIndex : 0,
					fontProperties : [ "font", "font-size", "font-weight",
							"font-style", "font-family", "text-anchor", "text" ],
					pathProperties : [ "x", "y", "d", "path", "height",
							"width", "radius", "r", "rx", "ry", "cx", "cy" ],
					minDefaults : {
						circle : {
							cx : 0,
							cy : 0,
							r : 0,
							fill : "none"
						},
						ellipse : {
							cx : 0,
							cy : 0,
							rx : 0,
							ry : 0,
							fill : "none"
						},
						rect : {
							x : 0,
							y : 0,
							width : 0,
							height : 0,
							rx : 0,
							ry : 0,
							fill : "none"
						},
						text : {
							x : 0,
							y : 0,
							"text-anchor" : "start",
							fill : "#000"
						},
						path : {
							d : "M0,0",
							fill : "none"
						},
						image : {
							x : 0,
							y : 0,
							width : 0,
							height : 0,
							preserveAspectRatio : "none"
						}
					},
					constructor : function(a) {
						var b = this;
						a = a || {};
						b.id = Ext.id(null, "ext-sprite-");
						b.transformations = [];
						b.surface = a.surface;
						b.group = a.group;
						b.type = a.type;
						b.bbox = {};
						b.attr = {
							zIndex : 0,
							translation : {
								x : null,
								y : null
							},
							rotation : {
								degrees : null,
								x : null,
								y : null
							},
							scaling : {
								x : null,
								y : null,
								cx : null,
								cy : null
							}
						};
						delete a.surface;
						delete a.group;
						delete a.type;
						Ext.applyIf(a, b.minDefaults[b.type]);
						b.setAttributes(a);
						b.addEvents("beforedestroy", "destroy", "render",
								"mousedown", "mouseup", "mouseover",
								"mouseout", "mousemove", "click", "rightclick",
								"mouseenter", "mouseleave", "touchstart",
								"touchmove", "touchend");
						Ext.draw.Sprite.superclass.constructor.apply(this,
								arguments)
					},
					setAttributes : function(j, m) {
						var r = this, h = r.fontProperties, p = h.length, f = r.pathProperties, e = f.length, q = !!r.surface, a = q
								&& r.surface.customAttributes || {}, b = r.attr, k, n, g, c, o, l, s, d;
						j = Ext.apply({}, j);
						for (k in a) {
							if (j.hasOwnProperty(k)
									&& typeof a[k] == "function") {
								Ext.apply(j, a[k].apply(r, [].concat(j[k])))
							}
						}
						if (!!j.hidden !== !!b.hidden) {
							r.dirtyHidden = true
						}
						for (n = 0; n < e; n++) {
							k = f[n];
							if (k in j && j[k] !== b[k]) {
								r.dirtyPath = true;
								break
							}
						}
						if ("zIndex" in j) {
							r.zIndexDirty = true
						}
						for (n = 0; n < p; n++) {
							k = h[n];
							if (k in j && j[k] !== b[k]) {
								r.dirtyFont = true;
								break
							}
						}
						g = j.translate;
						c = b.translation;
						if (g) {
							if ((g.x && g.x !== c.x) || (g.y && g.y !== c.y)) {
								Ext.apply(c, g);
								r.dirtyTransform = true
							}
							delete j.translate
						}
						o = j.rotate;
						l = b.rotation;
						if (o) {
							if ((!o.x || o.x !== l.x) || (!o.y || o.y !== l.y)
									|| (o.degrees && o.degrees !== l.degrees)) {
								Ext.apply(l, o);
								r.dirtyTransform = true
							}
							delete j.rotate
						}
						s = j.scale;
						d = b.scaling;
						if (s) {
							if ((s.x && s.x !== d.x) || (s.y && s.y !== d.y)
									|| (s.cx && s.cx !== d.cx)
									|| (s.cy && s.cy !== d.cy)) {
								Ext.apply(d, s);
								r.dirtyTransform = true
							}
							delete j.scale
						}
						Ext.apply(b, j);
						r.dirty = true;
						if (m === true && q) {
							r.redraw()
						}
						return this
					},
					getBBox : function(a) {
						return this.surface.getBBox(this, a)
					},
					setText : function(a) {
						return this.surface.setText(this, a)
					},
					hide : function(a) {
						this.setAttributes({
							hidden : true
						}, a);
						return this
					},
					show : function(a) {
						this.setAttributes({
							hidden : false
						}, a);
						return this
					},
					remove : function() {
						if (this.surface) {
							this.surface.remove(this);
							return true
						}
						return false
					},
					onRemove : function() {
						this.surface.onRemove(this)
					},
					destroy : function() {
						var a = this;
						if (a.fireEvent("beforedestroy", a) !== false) {
							a.remove();
							a.surface.onDestroy(a);
							a.clearListeners();
							a.fireEvent("destroy")
						}
					},
					redraw : function() {
						this.surface.renderItem(this);
						return this
					},
					tween : function() {
						this.surface.tween(this);
						return this
					},
					setStyle : function() {
						this.el.setStyle.apply(this.el, arguments);
						return this
					},
					addCls : function(a) {
						this.surface.addCls(this, a);
						return this
					},
					removeCls : function(a) {
						this.surface.removeCls(this, a);
						return this
					}
				});
Ext.applyIf(Ext.draw.Sprite.prototype, Ext.util.Animate);
Ext.draw.Matrix = Ext
		.extend(
				Object,
				{
					constructor : function(h, g, l, k, j, i) {
						if (h != null) {
							this.matrix = [ [ h, l, j ], [ g, k, i ],
									[ 0, 0, 1 ] ]
						} else {
							this.matrix = [ [ 1, 0, 0 ], [ 0, 1, 0 ],
									[ 0, 0, 1 ] ]
						}
					},
					add : function(s, p, m, k, i, h) {
						var n = this, g = [ [], [], [] ], r = [ [ s, m, i ],
								[ p, k, h ], [ 0, 0, 1 ] ], q, o, l, j;
						for (q = 0; q < 3; q++) {
							for (o = 0; o < 3; o++) {
								j = 0;
								for (l = 0; l < 3; l++) {
									j += n.matrix[q][l] * r[l][o]
								}
								g[q][o] = j
							}
						}
						n.matrix = g;
						return n
					},
					prepend : function(s, p, m, k, i, h) {
						var n = this, g = [ [], [], [] ], r = [ [ s, m, i ],
								[ p, k, h ], [ 0, 0, 1 ] ], q, o, l, j;
						for (q = 0; q < 3; q++) {
							for (o = 0; o < 3; o++) {
								j = 0;
								for (l = 0; l < 3; l++) {
									j += r[q][l] * n.matrix[l][o]
								}
								g[q][o] = j
							}
						}
						n.matrix = g;
						return n
					},
					invert : function() {
						var j = this.matrix, i = j[0][0], h = j[1][0], n = j[0][1], m = j[1][1], l = j[0][2], k = j[1][2], g = i
								* m - h * n;
						return new Ext.draw.Matrix(m / g, -h / g, -n / g,
								i / g, (n * k - m * l) / g, (h * l - i * k) / g)
					},
					clone : function() {
						var a = this.matrix;
						return new Ext.draw.Matrix(a[0][0], a[1][0], a[0][1],
								a[1][1], a[0][2], a[1][2])
					},
					translate : function(a, b) {
						this.prepend(1, 0, 0, 1, a, b);
						return this
					},
					scale : function(b, e, a, d) {
						var c = this;
						if (e == null) {
							e = b
						}
						c.add(1, 0, 0, 1, a, d);
						c.add(b, 0, 0, e, 0, 0);
						c.add(1, 0, 0, 1, -a, -d);
						return c
					},
					rotate : function(c, b, g) {
						c = Ext.draw.Draw.rad(c);
						var e = this, f = +Math.cos(c).toFixed(9), d = +Math
								.sin(c).toFixed(9);
						e.add(f, d, -d, f, b, g);
						e.add(1, 0, 0, 1, -b, -g);
						return e
					},
					x : function(a, c) {
						var b = this.matrix;
						return a * b[0][0] + c * b[0][1] + b[0][2]
					},
					y : function(a, c) {
						var b = this.matrix;
						return a * b[1][0] + c * b[1][1] + b[1][2]
					},
					get : function(b, a) {
						return +this.matrix[b][a].toFixed(4)
					},
					isIdentity : function() {
						return this.equals(new Ext.draw.Matrix())
					},
					equals : function(b) {
						var a = this.matrix, c = b.matrix;
						return a[0][0] === c[0][0] && a[0][1] === c[0][1]
								&& a[0][2] === c[0][2] && a[1][0] === c[1][0]
								&& a[1][1] === c[1][1] && a[1][2] === c[1][2]
					},
					toString : function() {
						var a = this;
						return [ a.get(0, 0), a.get(0, 1), a.get(1, 0),
								a.get(1, 1), 0, 0 ].join()
					},
					toCanvas : function(a) {
						var b = this.matrix;
						a.transform(b[0][0], b[1][0], b[0][1], b[1][1],
								b[0][2], b[1][2])
					},
					toSvg : function() {
						var a = this.matrix;
						return "matrix("
								+ [ a[0][0], a[1][0], a[0][1], a[1][1],
										a[0][2], a[1][2] ].join() + ")"
					},
					toFilter : function() {
						var a = this;
						return "progid:DXImageTransform.Microsoft.Matrix(M11="
								+ a.get(0, 0) + ", M12=" + a.get(0, 1)
								+ ", M21=" + a.get(1, 0) + ", M22="
								+ a.get(1, 1) + ", Dx=" + a.get(0, 2) + ", Dy="
								+ a.get(1, 2) + ")"
					},
					offset : function() {
						var a = this.matrix;
						return [ a[0][2].toFixed(4), a[1][2].toFixed(4) ]
					},
					split : function() {
						function d(f) {
							return f[0] * f[0] + f[1] * f[1]
						}
						function b(f) {
							var g = Math.sqrt(d(f));
							f[0] /= g;
							f[1] /= g
						}
						var a = this.matrix, c = {
							translateX : a[0][2],
							translateY : a[1][2]
						}, e;
						e = [ [ a[0][0], a[0][1] ], [ a[1][1], a[1][1] ] ];
						c.scaleX = Math.sqrt(d(e[0]));
						b(e[0]);
						c.shear = e[0][0] * e[1][0] + e[0][1] * e[1][1];
						e[1] = [ e[1][0] - e[0][0] * c.shear,
								e[1][1] - e[0][1] * c.shear ];
						c.scaleY = Math.sqrt(d(e[1]));
						b(e[1]);
						c.shear /= c.scaleY;
						c.rotate = Math.asin(-e[0][1]);
						c.isSimple = !+c.shear.toFixed(9)
								&& (c.scaleX.toFixed(9) == c.scaleY.toFixed(9) || !c.rotate);
						return c
					}
				});
Ext.baseCSSPrefix = "x-";
(function() {
	function a(b) {
		return function(c) {
			this.processEvent(b, c)
		}
	}
	Ext.draw.Surface = Ext
			.extend(
					Ext.util.Observable,
					{
						zoomX : 1,
						zoomY : 1,
						panX : 0,
						panY : 0,
						availableAttrs : {
							blur : 0,
							"clip-rect" : "0 0 1e9 1e9",
							cursor : "default",
							cx : 0,
							cy : 0,
							"dominant-baseline" : "auto",
							fill : "none",
							"fill-opacity" : 1,
							font : '10px "Arial"',
							"font-family" : '"Arial"',
							"font-size" : "10",
							"font-style" : "normal",
							"font-weight" : 400,
							gradient : "",
							height : 0,
							hidden : false,
							href : "http://sencha.com/",
							opacity : 1,
							path : "M0,0",
							radius : 0,
							rx : 0,
							ry : 0,
							scale : "1 1",
							src : "",
							stroke : "#000",
							"stroke-dasharray" : "",
							"stroke-linecap" : "butt",
							"stroke-linejoin" : "butt",
							"stroke-miterlimit" : 0,
							"stroke-opacity" : 1,
							"stroke-width" : 1,
							target : "_blank",
							text : "",
							"text-anchor" : "middle",
							title : "Ext Draw",
							width : 0,
							x : 0,
							y : 0,
							zIndex : 0
						},
						container : undefined,
						height : 352,
						width : 512,
						x : 0,
						y : 0,
						constructor : function(b) {
							var c = this;
							b = b || {};
							Ext.apply(c, b);
							c.domRef = Ext.getDoc().dom;
							c.customAttributes = {};
							c.addEvents.apply(c, Ext.draw.Surface.eventNames);
							Ext.draw.Surface.superclass.constructor.apply(c,
									arguments);
							c.getId();
							c.initGradients();
							c.initItems();
							if (c.renderTo) {
								c.render(c.renderTo);
								delete c.renderTo
							}
							c.initBackground(b.background)
						},
						initializeEvents : function() {
							var b = this;
							b.mon(b.el, {
								scope : b,
								mouseover : b.onMouseOver,
								mouseout : b.onMouseOut,
								mouseenter : b.onMouseEnter,
								mouseleave : b.onMouseLeave,
								mousemove : b.onMouseMove,
								mouseup : b.onMouseUp,
								mousedown : b.onMouseDown,
								click : b.onClick,
								doubleclick : b.onDoubleClick,
								tap : b.onTap,
								tapstart : b.onTapStart,
								tapend : b.onTapEnd,
								tapcancel : b.onTapCancel,
								taphold : b.onTapHold,
								doubletap : b.onDoubleTap,
								singletap : b.onSingleTap,
								touchstart : b.onTouchStart,
								touchmove : b.onTouchMove,
								touchend : b.onTouchEnd,
								pinchstart : b.onPinchStart,
								pinch : b.onPinch,
								pinchend : b.onPinchEnd,
								swipe : b.onSwipe
							})
						},
						initializeDragEvents : function() {
							var b = this;
							if (b.dragEventsInitialized) {
								return
							}
							b.dragEventsInitialized = true;
							b.mon(b.el, {
								scope : b,
								dragstart : b.onDragStart,
								drag : b.onDrag,
								dragend : b.onDragEnd
							})
						},
						initSurface : Ext.emptyFn,
						renderItem : Ext.emptyFn,
						renderItems : Ext.emptyFn,
						renderFrame : Ext.emptyFn,
						setViewBox : Ext.emptyFn,
						tween : Ext.emptyFn,
						addCls : Ext.emptyFn,
						removeCls : Ext.emptyFn,
						setStyle : Ext.emptyFn,
						createWrapEl : function(b) {
							return Ext.fly(b).createChild({
								tag : "div",
								cls : Ext.baseCSSPrefix + "surface-wrap",
								style : "overflow:hidden"
							})
						},
						initGradients : function() {
							var b = this.gradients;
							if (b) {
								Ext.each(b, this.addGradient, this)
							}
						},
						initItems : function() {
							var c = this, b = c.items;
							c.items = new Ext.draw.CompositeSprite();
							c.groups = new Ext.draw.CompositeSprite();
							if (b) {
								c.add(b)
							}
						},
						initBackground : function(c) {
							var e = this, f, g, d = e.width, b = e.height;
							if (c) {
								if (c.gradient) {
									g = c.gradient;
									f = g.id;
									e.addGradient(g);
									e.background = e.add({
										type : "rect",
										x : 0,
										y : 0,
										width : d,
										height : b,
										fill : "url(#" + f + ")",
										zIndex : -100
									})
								} else {
									if (c.fill) {
										e.background = e.add({
											type : "rect",
											x : 0,
											y : 0,
											width : d,
											height : b,
											fill : c.fill,
											zIndex : -100
										})
									} else {
										if (c.image) {
											e.background = e.add({
												type : "image",
												x : 0,
												y : 0,
												width : d,
												height : b,
												src : c.image,
												zIndex : -100
											})
										}
									}
								}
							}
						},
						setSize : function(b, c) {
							if (this.background) {
								this.background.setAttributes({
									width : b,
									height : c,
									hidden : false
								}, true)
							}
							this.width = b;
							this.height = c;
							this.updateSurfaceElBox()
						},
						scrubAttrs : function(e) {
							var f = this, c = {}, b = {}, g = e.attr, d;
							for (d in g) {
								if (f.translateAttrs.hasOwnProperty(d)) {
									c[f.translateAttrs[d]] = g[d];
									b[f.translateAttrs[d]] = true
								} else {
									if (f.availableAttrs.hasOwnProperty(d)
											&& !b[d]) {
										c[d] = g[d]
									}
								}
							}
							return c
						},
						onMouseMove : a("mousemove"),
						onMouseOver : a("mouseover"),
						onMouseOut : a("mouseout"),
						onMouseEnter : a("mouseenter"),
						onMouseLeave : a("mouseleave"),
						onMouseUp : a("mouseup"),
						onMouseDown : a("mousedown"),
						onClick : a("click"),
						onDoubleClick : a("doubleclick"),
						onTap : a("tap"),
						onTapStart : a("tapstart"),
						onTapEnd : a("tapend"),
						onTapCancel : a("tapcancel"),
						onTapHold : a("taphold"),
						onDoubleTap : a("doubletap"),
						onSingleTap : a("singletap"),
						onTouchStart : a("touchstart"),
						onTouchMove : a("touchmove"),
						onTouchEnd : a("touchend"),
						onDragStart : a("dragstart"),
						onDrag : a("drag"),
						onDragEnd : a("dragend"),
						onPinchStart : a("pinchstart"),
						onPinch : a("pinch"),
						onPinchEnd : a("pinchend"),
						onSwipe : a("swipe"),
						processEvent : function(b, f) {
							var d = this, c = d.getSpriteForEvent(f);
							if (c) {
								c.fireEvent(b, c, f)
							}
							d.fireEvent(b, f)
						},
						getSpriteForEvent : function(b) {
							return null
						},
						addGradient : Ext.emptyFn,
						add : function() {
							var h = this, f = Array.prototype.slice
									.call(arguments), b = f.length > 1, j, g, d, e, k, c;
							if (b || Ext.isArray(f[0])) {
								g = b ? f : f[0];
								c = [];
								for (d = 0, e = g.length; d < e; d++) {
									k = g[d];
									k = h.add(k);
									c.push(k)
								}
								return c
							}
							j = h.prepareItems(f[0], true)[0];
							h.normalizeSpriteCollection(j);
							h.onAdd(j);
							return j
						},
						normalizeSpriteCollection : function(d) {
							var c = this.items, e = d.attr.zIndex, b = c
									.indexOf(d);
							if (b < 0
									|| (b > 0 && c.getAt(b - 1).attr.zIndex > e)
									|| (b < c.length - 1 && c.getAt(b + 1).attr.zIndex < e)) {
								c.removeAt(b);
								b = c.findIndexBy(function(f) {
									return f.attr.zIndex > e
								});
								if (b < 0) {
									b = c.length
								}
								c.insert(b, d)
							}
							return b
						},
						onAdd : function(e) {
							var g = e.group, c = e.draggable, b, f, d;
							if (g) {
								b = [].concat(g);
								f = b.length;
								for (d = 0; d < f; d++) {
									g = b[d];
									this.getGroup(g).add(e)
								}
								delete e.group
							}
							if (c) {
								e.initDraggable()
							}
						},
						remove : function(b, c) {
							if (b) {
								this.items.remove(b);
								this.groups.each(function(d) {
									d.remove(b)
								});
								b.onRemove();
								if (c === true) {
									b.destroy()
								}
							}
						},
						removeAll : function(e) {
							var b = this.items.items, d = b.length, c;
							for (c = d - 1; c > -1; c--) {
								this.remove(b[c], e)
							}
						},
						onRemove : Ext.emptyFn,
						onDestroy : Ext.emptyFn,
						applyTransformations : function(c) {
							c.bbox.transform = 0;
							c.dirtyTransform = false;
							var e = this, d = false, b = c.attr;
							if (b.translation.x != null
									|| b.translation.y != null) {
								e.translate(c);
								d = true
							}
							if (b.scaling.x != null || b.scaling.y != null) {
								e.scale(c);
								d = true
							}
							if (b.rotation.degrees != null) {
								e.rotate(c);
								d = true
							}
							if (d) {
								c.bbox.transform = 0;
								e.transform(c);
								c.transformations = []
							}
						},
						rotate : function(e) {
							var i, f = e.attr.rotation.degrees, h = e.attr.rotation.x, g = e.attr.rotation.y, d = e.attr.translation, c = d
									&& d.x || 0, b = d && d.y || 0;
							if (!Ext.isNumber(h) || !Ext.isNumber(g)) {
								i = this.getBBox(e, true);
								h = !Ext.isNumber(h) ? (i.x + c) + i.width / 2
										: h;
								g = !Ext.isNumber(g) ? (i.y + b) + i.height / 2
										: g
							}
							e.transformations.push({
								type : "rotate",
								degrees : f,
								x : h,
								y : g
							})
						},
						translate : function(c) {
							var b = c.attr.translation.x || 0, d = c.attr.translation.y || 0;
							c.transformations.push({
								type : "translate",
								x : b,
								y : d
							})
						},
						scale : function(c) {
							var f, b = c.attr.scaling.x || 1, g = c.attr.scaling.y || 1, e = c.attr.scaling.centerX, d = c.attr.scaling.centerY;
							if (!Ext.isNumber(e) || !Ext.isNumber(d)) {
								f = this.getBBox(c);
								e = !Ext.isNumber(e) ? f.x + f.width / 2 : e;
								d = !Ext.isNumber(d) ? f.y + f.height / 2 : d
							}
							c.transformations.push({
								type : "scale",
								x : b,
								y : g,
								centerX : e,
								centerY : d
							})
						},
						rectPath : function(b, f, c, d, e) {
							if (e) {
								return [ [ "M", b + e, f ],
										[ "l", c - e * 2, 0 ],
										[ "a", e, e, 0, 0, 1, e, e ],
										[ "l", 0, d - e * 2 ],
										[ "a", e, e, 0, 0, 1, -e, e ],
										[ "l", e * 2 - c, 0 ],
										[ "a", e, e, 0, 0, 1, -e, -e ],
										[ "l", 0, e * 2 - d ],
										[ "a", e, e, 0, 0, 1, e, -e ], [ "z" ] ]
							}
							return [ [ "M", b, f ], [ "l", c, 0 ],
									[ "l", 0, d ], [ "l", -c, 0 ], [ "z" ] ]
						},
						ellipsePath : function(b, e, d, c) {
							if (c == null) {
								c = d
							}
							return [ [ "M", b, e ], [ "m", 0, -c ],
									[ "a", d, c, 0, 1, 1, 0, 2 * c ],
									[ "a", d, c, 0, 1, 1, 0, -2 * c ], [ "z" ] ]
						},
						getPathpath : function(b) {
							return b.attr.path
						},
						getPathcircle : function(c) {
							var b = c.attr;
							return this.ellipsePath(b.x, b.y, b.radius,
									b.radius)
						},
						getPathellipse : function(c) {
							var b = c.attr;
							return this.ellipsePath(b.x, b.y, b.radiusX,
									b.radiusY)
						},
						getPathrect : function(c) {
							var b = c.attr;
							return this.rectPath(b.x, b.y, b.width, b.height,
									b.r)
						},
						getPathimage : function(c) {
							var b = c.attr;
							return this.rectPath(b.x || 0, b.y || 0, b.width,
									b.height)
						},
						getPathtext : function(b) {
							var c = this.getBBoxText(b);
							return this.rectPath(c.x, c.y, c.width, c.height)
						},
						createGroup : function(c) {
							var b = this.groups.get(c);
							if (!b) {
								b = new Ext.draw.CompositeSprite({
									surface : this
								});
								b.id = c || Ext.id(null, "ext-surface-group-");
								this.groups.add(b)
							}
							return b
						},
						getGroup : function(c) {
							if (typeof c == "string") {
								var b = this.groups.get(c);
								if (!b) {
									b = this.createGroup(c)
								}
							} else {
								b = c
							}
							return b
						},
						prepareItems : function(b, d) {
							b = [].concat(b);
							var f, c, e;
							for (c = 0, e = b.length; c < e; c++) {
								f = b[c];
								if (!(f instanceof Ext.draw.Sprite)) {
									f.surface = this;
									b[c] = this.createItem(f)
								} else {
									f.surface = this
								}
							}
							return b
						},
						setText : Ext.emptyFn,
						createItem : Ext.emptyFn,
						getId : function() {
							return this.id
									|| (this.id = Ext.id(null, "ext-surface-"))
						},
						destroy : function() {
							delete this.domRef;
							this.removeAll()
						},
						clear : Ext.emtpyFn,
						updateSurfaceElBox : function() {
							var s = this, o = Math.floor, l = o(s.width
									* s.zoomX), h = o(s.height * s.zoomY), r = s.panX, q = s.panY, p = 2000, k = 1500, b = s.surfaceEl, e = b.dom, j = s.width, d = s.height, m = s.surfaceEl.dom
									.getContext("2d"), c = false, f, n, i, g;
							if (l * h > p * k) {
								c = true;
								n = h * p / l;
								if (n > h) {
									n = k
								}
								f = l * n / h;
								r = (j - f) / 2;
								q = (d - n) / 2;
								i = s.panX - r;
								g = s.panY - q;
								l = f;
								h = n
							}
							if (e.width != l || e.height != h) {
								b.setSize(l, h);
								e.width = l;
								e.height = h;
								if (c) {
									m.translate(i, g)
								}
							}
							b.setTopLeft(q, r)
						},
						setSurfaceTransform : function(c, b, f, e) {
							var d = this;
							d.panX = c;
							d.panY = b;
							d.zoomX = f;
							d.zoomY = e;
							d.setSurfaceFastTransform(null);
							d.updateSurfaceElBox()
						},
						setSurfaceFastTransform : function(b) {
							this.transformMatrix = b;
							this.surfaceEl.setStyle({
								webkitTransformOrigin : "0 0",
								webkitTransform : b ? b.toSvg() : ""
							})
						}
					})
})();
Ext.draw.Surface.create = function(b, d) {
	return new Ext.draw.engine.Canvas(b);
	d = d || [ "Canvas", "Svg" ];
	var c = 0, a = d.length;
	for (; c < a; c++) {
	}
	return false
};
Ext.draw.Surface.eventNames = [ "mouseup", "mousedown", "mouseover",
		"mouseout", "mousemove", "mouseenter", "mouseleave", "click",
		"dblclick", "tap", "tapstart", "tapend", "tapcancel", "taphold",
		"doubletap", "singletap", "touchstart", "touchmove", "touchend",
		"drag", "dragstart", "dragend", "pinch", "pinchstart", "pinchend",
		"swipe" ];
Ext.draw.engine.Canvas = Ext
		.extend(
				Ext.draw.Surface,
				{
					attributeMap : {
						rotate : "rotation",
						stroke : "strokeStyle",
						fill : "fillStyle",
						lineWidth : "lineWidth",
						"text-anchor" : "textAlign",
						"stroke-width" : "lineWidth",
						"stroke-linecap" : "lineCap",
						"stroke-linejoin" : "lineJoin",
						"stroke-miterlimit" : "miterLimit",
						opacity : "globalAlpha",
						font : "font",
						shadowColor : "shadowColor",
						shadowOffsetX : "shadowOffsetX",
						shadowOffsetY : "shadowOffsetY",
						shadowBlur : "shadowBlur"
					},
					attributeDefaults : {
						strokeStyle : "rgba(0, 0, 0, 0)",
						fillStyle : "rgba(0, 0, 0, 0)",
						lineWidth : 1,
						lineCap : "square",
						lineJoin : "miter",
						miterLimit : 1,
						shadowColor : "none",
						shadowOffsetX : 0,
						shadowOffsetY : 0,
						shadowBlur : 0,
						font : "10px Helvetica, sans-serif",
						textAlign : "start",
						globalAlpha : 1
					},
					gradientRe : /\s*url\s*\(#([^\)]+)\)\s*/,
					attributeParsers : {
						fillStyle : function(c, a, b) {
							if (!c) {
								return c
							}
							if (Ext.isObject(c)) {
								b.addGradient(c);
								c = "url(#" + c.id + ")"
							}
							var d = c.match(b.gradientRe);
							if (d) {
								return b.createGradient(b._gradients[d[1]], a)
							} else {
								return c == "none" ? "rgba(0, 0, 0, 0)" : c
							}
						},
						strokeStyle : function(c, a, b) {
							if (!c) {
								return c
							}
							if (Ext.isObject(c)) {
								b.addGradient(c);
								c = "url(#" + c.id + ")"
							}
							var d = c.match(b.gradientRe);
							if (d) {
								return b.createGradient(b._gradients[d[1]], a)
							} else {
								return c == "none" ? "rgba(0, 0, 0, 0)" : c
							}
						},
						textAlign : function(b, a) {
							if (b === "middle") {
								return "center"
							}
							return b
						}
					},
					constructor : function(a) {
						var b = this;
						b.initEvents = "initEvents" in a ? a.initEvents : true;
						b._gradients = {};
						Ext.draw.engine.Canvas.superclass.constructor.apply(
								this, arguments);
						b.initCanvas(a.renderTo);
						Ext.fx.Manager.addListener("frameend", function() {
							if (b.animatedFrame) {
								b.animatedFrame = false;
								b.renderFrame()
							}
						});
						this.canvas.oncontextmenu = function() {
							return false
						}
					},
					initCanvas : function(c) {
						if (this.ctx) {
							return
						}
						var g = this, d = Ext.get(c), f = d.getWidth(), a = d
								.getHeight(), h = g.createWrapEl(c), e = document
								.createElement("canvas"), b = e
								.getContext("2d");
						h.setSize(f, a);
						h.dom.id = g.id + "-wrap";
						e.id = g.id + "-canvas";
						e.width = f;
						e.height = a;
						h.appendChild(e);
						g.el = h;
						g.surfaceEl = Ext.get(e);
						g.canvas = e;
						g.ctx = b;
						if (g.initEvents) {
							g.initializeEvents()
						}
					},
					getSpriteForEvent : function() {
						return null
					},
					addGradient : function(b) {
						var a = this;
						b = Ext.draw.Draw.parseGradient(b);
						a._gradients[b.id] = b
					},
					transform : function(d) {
						var a = new Ext.draw.Matrix, f = d.transformations, g = f.length, c = 0, b, e;
						for (; c < g; c++) {
							b = f[c];
							e = b.type;
							if (e == "translate") {
								a.translate(b.x, b.y)
							} else {
								if (e == "rotate") {
									a.rotate(b.degrees, b.x, b.y)
								} else {
									if (e == "scale") {
										a.scale(b.x, b.y, b.centerX, b.centerY)
									}
								}
							}
						}
						d.matrix = a
					},
					setSize : function(b, e) {
						var d, a, f = this, c = f.canvas;
						if (typeof b == "object") {
							d = b.width;
							a = b.height
						} else {
							d = b;
							a = e
						}
						if (d !== c.width || a !== c.height) {
							f.el.setSize(d, a);
							f.surfaceEl.setSize(d, a);
							c.width = d;
							c.height = a;
							f.width = d;
							f.height = a
						}
						Ext.draw.engine.Canvas.superclass.setSize.call(this, b,
								e)
					},
					tween : function() {
						this.animatedFrame = true;
						Ext.draw.engine.Canvas.superclass.tween.apply(this)
					},
					renderFrame : function() {
						this.render()
					},
					render : function(a) {
						var b = this;
						if (!b.canvas) {
							b.initCanvas(a)
						}
						b.renderAll()
					},
					createItem : function(a) {
						var b = new Ext.draw.Sprite(a);
						b.surface = this;
						b.matrix = new Ext.draw.Matrix;
						b.bbox = {
							plain : 0,
							transform : 0
						};
						return b
					},
					zIndexSort : function(e, c) {
						var h = e.attr, g = c.attr, f = h && h.zIndex || -1, d = g
								&& g.zIndex || -1, i = f - d;
						if (!i) {
							return (e.id > c.id) ? 1 : -1
						} else {
							return i
						}
					},
					renderAll : function() {
						var a = this;
						a.clear();
						a.items.items.sort(a.zIndexSort);
						a.items.each(a.renderSprite, a)
					},
					renderSprite : function(i) {
						i.dirtyHidden = i.dirtyPath = i.zIndexDirty = i.dirtyFont = i.dirty = false;
						if (i.attr.hidden) {
							return
						}
						if (!i.matrix) {
							i.matrix = new Ext.draw.Matrix()
						}
						var h = this, j = h.ctx, g = i.attr, f = h.attributeMap, d = h.attributeDefaults, a = h.attributeParsers, b, c, e;
						if (i.dirtyTransform) {
							h.applyTransformations(i)
						}
						j.save();
						i.matrix.toCanvas(j);
						for (b in f) {
							c = f[b];
							if (c in a) {
								e = a[c](g[b], i, h);
								if (e !== undefined) {
									j[c] = e
								} else {
									j[c] = d[c]
								}
							} else {
								e = g[b];
								if (e !== undefined) {
									j[c] = e
								} else {
									j[c] = d[c]
								}
							}
						}
						h[i.type + "Render"](i);
						j.restore()
					},
					circleRender : function(e) {
						var f = this, d = f.ctx, c = e.attr, b = +(c.x || 0), h = +(c.y || 0), a = c.radius, g = Ext.draw.Draw.pi2;
						d.beginPath();
						d.arc(b, h, a, 0, g, true);
						d.closePath();
						d.fill();
						d.beginPath();
						d.arc(b, h, a, 0, g, true);
						d.closePath();
						d.stroke()
					},
					ellipseRender : function(l) {
						var g = this, n = g.ctx, e = l.attr, a = e.width, m = e.height, i = +(e.x || 0), h = +(e.y || 0), k = 1, j = 1, c = 1, b = 1, d = 0, f = Ext.draw.Draw.pi2;
						if (a > m) {
							d = a / 2;
							j = m / a;
							b = a / m
						} else {
							d = m / 2;
							k = a / m;
							c = m / a
						}
						n.scale(k, j);
						n.beginPath();
						n.arc(i * c, h * b, d, 0, f, true);
						n.closePath();
						n.fill();
						n.beginPath();
						n.arc(i * c, h * b, d, 0, f, true);
						n.closePath();
						n.stroke()
					},
					imageRender : function(h) {
						var e = this, j = e.ctx, d = h.attr, b = d.width, i = d.height, g = +(d.x || 0), f = +(d.y || 0), a = d.src, c;
						if (h._img) {
							c = h._img
						} else {
							h._img = c = new Image();
							c.height = i;
							c.width = b;
							c._loading = true;
							c.onload = function() {
								c._loading = false;
								e.renderFrame()
							};
							c.src = a.slice(1, a.length - 1)
						}
						if (!c._loading) {
							j.drawImage(c, g - b / 2, f - i / 2, b, i)
						}
					},
					rectRender : function(e) {
						var g = this, d = g.ctx, c = e.attr, f = c.width, b = c.height, a = +(c.x || 0), h = +(c.y || 0);
						if (isFinite(a) && isFinite(h) && isFinite(f)
								&& isFinite(b)) {
							d.fillRect(a, h, f, b);
							d.strokeRect(a, h, f, b)
						}
					},
					textRender : function(d) {
						var e = this, c = e.ctx, b = d.attr, a = +(b.x || 0), g = +(b.y || 0), f = b.text;
						if (isFinite(a) && isFinite(g)) {
							c.textBaseline = "middle";
							c.fillText(f, a, g)
						}
					},
					pathRender : function(g) {
						if (!g.attr.path) {
							return
						}
						var d = this, h = d.ctx, b = g.attr, j = Ext.draw.Draw
								.path2curve(b.path), c = j.length, f, e, a;
						h.beginPath();
						for (a = 0; a < c; a++) {
							switch (j[a][0]) {
							case "M":
								h.moveTo(j[a][1], j[a][2]);
								if (f == null) {
									f = j[a][1]
								}
								if (e == null) {
									e = j[a][2]
								}
								break;
							case "C":
								h.bezierCurveTo(j[a][1], j[a][2], j[a][3],
										j[a][4], j[a][5], j[a][6]);
								break;
							case "Z":
								h.lineTo(f, e);
								break
							}
						}
						if (b.stroke && b.stroke != "none"
								&& b.stroke != "rgba(0, 0, 0, 0)") {
							h.stroke()
						}
						if (b.fill && b.fill != "none"
								&& b.fill != "rgba(0, 0, 0, 0)") {
							h.fill()
						}
						h.closePath()
					},
					contains : function(a, f) {
						var e = this, c = e.items.items, b = c.length, d;
						while (b--) {
							d = c[b];
							if (e.bboxContains(a, f, d)) {
								if (e[d.type + "Contains"](a, f, d)) {
									return {
										target : d
									}
								}
							}
						}
						return false
					},
					bboxContains : function(a, d, b) {
						var c = b.getBBox();
						return (a >= c.x && a <= (c.x + c.width) && (d >= c.y && d <= (c.y + c.height)))
					},
					circleContains : function(f, e, g) {
						var d = g.attr, i = d.translation, b = (d.x || 0)
								+ (i && i.x || 0), a = (d.y || 0)
								+ (i && i.y || 0), j = f - b, h = e - a, c = d.radius;
						return (j * j + h * h) <= (c * c)
					},
					ellipseContains : function(h, g, k) {
						var f = k.attr, n = f.translation, d = (f.x || 0)
								+ (n && n.x || 0), c = (f.y || 0)
								+ (n && n.y || 0), b = f.radiusX
								|| (f.width / 2) || 0, a = f.radiusY
								|| (f.height / 2) || 0, e = 0, j = 1, i = 1, m, l;
						if (b > a) {
							e = b;
							i = a / b
						} else {
							e = a;
							i = b / a
						}
						m = (h - d) / j;
						l = (g - c) / i;
						return (m * m + l * l) <= (e * e)
					},
					imageContains : function(a, c, b) {
						return true
					},
					rectContains : function(a, c, b) {
						return true
					},
					textContains : function(a, c, b) {
						return true
					},
					pathContains : function(a, c, b) {
						return false
					},
					createGradient : function(i, k) {
						var o = this.ctx, m = k.getBBox(), d = m.x, j = m.y, c = m.width, n = m.height, b = d
								+ c, f = j + n, h = Math.round(Math
								.abs(i.degrees || i.angle || 0) % 360), l = i.stops, e, g;
						if (h <= 0) {
							g = o.createLinearGradient(d, j, d, f)
						} else {
							if (h <= 45) {
								g = o.createLinearGradient(d, j, b, f)
							} else {
								if (h <= 90) {
									g = o.createLinearGradient(d, j, b, j)
								} else {
									if (h <= 135) {
										g = o.createLinearGradient(b, j, d, f)
									} else {
										if (h <= 180) {
											g = o.createLinearGradient(d, f, d,
													j)
										} else {
											if (h <= 225) {
												g = o.createLinearGradient(b,
														f, d, j)
											} else {
												if (h <= 270) {
													g = o.createLinearGradient(
															b, j, d, j)
												} else {
													if (h <= 315) {
														g = o
																.createLinearGradient(
																		d, f,
																		b, j)
													} else {
														g = o
																.createLinearGradient(
																		d, j,
																		b, f)
													}
												}
											}
										}
									}
								}
							}
						}
						for (e in l) {
							if (l.hasOwnProperty(e)) {
								g.addColorStop(e, l[e].color || "#000")
							}
						}
						return g
					},
					getBBox : function(a, b) {
						if (a.type == "text") {
							return this.getBBoxText(a, b)
						}
						var c = this["getPath" + a.type](a);
						if (b) {
							a.bbox.plain = a.bbox.plain
									|| Ext.draw.Draw.pathDimensions(c);
							return a.bbox.plain
						}
						a.bbox.transform = Ext.draw.Draw
								.pathDimensions(Ext.draw.Draw.mapPath(c,
										a.matrix));
						return a.bbox.transform
					},
					getBBoxText : function(t, b) {
						var E = this, w = E.ctx, v = t.attr, z, k = v.x || 0, j = v.y || 0, B, A, d, a, r, D, i, s, e, n, C, g, u, q, h = t.attr.translation, m = h
								&& h.x || 0, l = h && h.y || 0, p = v.font, c = +(p && p
								.match(/[0-9]+/)[0]) || 10, o = v.text, f;
						w.save();
						if (p) {
							w.font = p
						}
						f = w.measureText(o);
						w.restore();
						if (t.dirtyTransform) {
							E.applyTransformations(t)
						}
						z = t.matrix;
						B = k + m;
						d = j + l;
						A = B + (f.width || c);
						a = d + (f.height || c);
						if (b) {
							return {
								x : k,
								y : j,
								width : (f.width || c),
								height : (f.height || c)
							}
						}
						r = z.x(B, d);
						e = z.y(B, d);
						D = z.x(B, a);
						n = z.y(B, a);
						i = z.x(A, d);
						C = z.y(A, d);
						s = z.x(A, a);
						g = z.y(A, a);
						k = Math.min(r, D, i, s);
						j = Math.min(e, n, C, g);
						u = Math.abs(k - Math.max(r, D, i, s));
						q = Math.abs(j - Math.max(e, n, C, g));
						return {
							x : k,
							y : j,
							width : u,
							height : q
						}
					},
					getRegion : function() {
						var a = this.canvas, b = Ext.get(a).getXY();
						return {
							left : b[0],
							top : b[1],
							right : b[0] + a.width,
							bottom : b[1] + a.height
						}
					},
					getShadowAttributesArray : function(a) {
						if (a) {
							return [ {
								"stroke-width" : 6,
								"stroke-opacity" : 1,
								stroke : "rgba(200, 200, 200, 0.5)",
								translate : {
									x : 1.2,
									y : 2
								}
							}, {
								"stroke-width" : 4,
								"stroke-opacity" : 1,
								stroke : "rgba(150, 150, 150, 0.5)",
								translate : {
									x : 0.9,
									y : 1.5
								}
							}, {
								"stroke-width" : 2,
								"stroke-opacity" : 1,
								stroke : "rgba(100, 100, 100, 0.5)",
								translate : {
									x : 0.6,
									y : 1
								}
							} ]
						} else {
							return []
						}
					},
					getShadowOptions : function(a) {
						return {
							shadowOffsetX : 2,
							shadowOffsetY : Ext.is.Android ? -2 : 2,
							shadowBlur : 3,
							shadowColor : "#444"
						}
					},
					clear : function() {
						var e = this, c = e.canvas, b = e.ctx, d = c.width, a = c.height;
						b.clearRect(0, 0, d, a)
					}
				});
Ext.draw.Component = Ext
		.extend(
				Ext.Component,
				{
					enginePriority : [ "Canvas" ],
					baseCls : "ext-surface",
					componentLayout : "draw",
					viewBox : true,
					autoSize : false,
					cls : "x-draw-component",
					initComponent : function() {
						var a = this;
						Ext.draw.Component.superclass.initComponent.call(a);
						a.addEvents.apply(a, Ext.draw.Surface.eventNames)
					},
					onRender : function() {
						var d = this, i = d.viewBox, b = d.autoSize, g, c, a, h, f, e;
						Ext.draw.Component.superclass.onRender.apply(this,
								arguments);
						d.surface = d.createSurface();
						c = d.surface.items;
						if (i || b) {
							g = c.getBBox();
							a = g.width;
							h = g.height;
							f = g.x;
							e = g.y;
							if (d.viewBox) {
								d.surface.setViewBox(f, e, a, h)
							} else {
								d.autoSizeSurface()
							}
						}
					},
					getEventsSurface : function() {
						return this.surface
					},
					initEvents : function() {
						var a = this;
						Ext.draw.Component.superclass.initEvents.call(a);
						a.relayEvents(a.getEventsSurface(),
								Ext.draw.Surface.eventNames)
					},
					autoSizeSurface : function() {
						var d = this, b = d.surface.items, e = b.getBBox(), c = e.width, a = e.height;
						b.setAttributes({
							translate : {
								x : -e.x,
								y : -e.y + (+Ext.isOpera)
							}
						}, true);
						if (d.rendered) {
							d.setSize(c, a)
						} else {
							d.surface.setSize(c, a)
						}
						d.el.setSize(c, a)
					},
					createSurface : function(b) {
						var c = this, a = Ext.apply;
						return Ext.draw.Surface.create(a({}, a({
							width : c.width,
							height : c.height,
							renderTo : c.el,
							id : Ext.id()
						}, b), c.initialConfig))
					},
					onDestroy : function() {
						var a = this.surface;
						if (a) {
							a.destroy()
						}
						Ext.draw.Component.superclass.onDestroy.call(this)
					}
				});
Ext.reg("draw", Ext.draw.Component);
Ext.ns("Ext.chart");
Ext.chart.Shape = {
	image : function(a, b) {
		b.height = b.height || 16;
		b.width = b.width || 16;
		return a.add(Ext.applyIf({
			type : "image",
			x : b.x,
			y : b.y,
			height : b.height,
			width : b.width,
			src : b.src
		}, b))
	},
	circle : function(a, b) {
		return a.add(Ext.apply({
			type : "circle",
			x : b.x,
			y : b.y,
			stroke : null,
			radius : b.radius
		}, b))
	},
	line : function(a, b) {
		return a.add(Ext.apply({
			type : "rect",
			x : b.x - b.radius,
			y : b.y - b.radius,
			height : 2 * b.radius,
			width : 2 * b.radius / 5
		}, b))
	},
	square : function(a, b) {
		return a.add(Ext.applyIf({
			type : "rect",
			x : b.x - b.radius,
			y : b.y - b.radius,
			height : 2 * b.radius,
			width : 2 * b.radius,
			radius : null
		}, b))
	},
	triangle : function(a, b) {
		b.radius *= 1.75;
		return a.add(Ext.apply({
			type : "path",
			stroke : null,
			path : "M".concat(b.x, ",", b.y, "m0-", b.radius * 0.58, "l",
					b.radius * 0.5, ",", b.radius * 0.87, "-", b.radius, ",0z")
		}, b))
	},
	diamond : function(a, c) {
		var b = c.radius;
		b *= 1.5;
		return a.add(Ext.apply({
			type : "path",
			stroke : null,
			path : [ "M", c.x, c.y - b, "l", b, b, -b, b, -b, -b, b, -b, "z" ]
		}, c))
	},
	cross : function(a, c) {
		var b = c.radius;
		b = b / 1.7;
		return a.add(Ext.apply({
			type : "path",
			stroke : null,
			path : "M".concat(c.x - b, ",", c.y, "l", [ -b, -b, b, -b, b, b, b,
					-b, b, b, -b, b, b, b, -b, b, -b, -b, -b, b, -b, -b, "z" ])
		}, c))
	},
	plus : function(a, c) {
		var b = c.radius / 1.3;
		return a.add(Ext.apply({
			type : "path",
			stroke : null,
			path : "M".concat(c.x - b / 2, ",", c.y - b / 2, "l", [ 0, -b, b,
					0, 0, b, b, 0, 0, b, -b, 0, 0, b, -b, 0, 0, -b, -b, 0, 0,
					-b, "z" ])
		}, c))
	},
	arrow : function(a, c) {
		var b = c.radius;
		return a.add(Ext.apply({
			type : "path",
			path : "M".concat(c.x - b * 0.7, ",", c.y - b * 0.4, "l", [
					b * 0.6, 0, 0, -b * 0.4, b, b * 0.8, -b, b * 0.8, 0,
					-b * 0.4, -b * 0.6, 0 ], "z")
		}, c))
	},
	drop : function(b, a, f, e, c, d) {
		c = c || 30;
		d = d || 0;
		b.add({
			type : "path",
			path : [ "M", a, f, "l", c, 0, "A", c * 0.4, c * 0.4, 0, 1, 0,
					a + c * 0.7, f - c * 0.7, "z" ],
			fill : "#000",
			stroke : "none",
			rotate : {
				degrees : 22.5 - d,
				x : a,
				y : f
			}
		});
		d = (d + 90) * Math.PI / 180;
		b.add({
			type : "text",
			x : a + c * Math.sin(d) - 10,
			y : f + c * Math.cos(d) + 5,
			text : e,
			"font-size" : c * 12 / 40,
			stroke : "none",
			fill : "#fff"
		})
	}
};
Ext.chart.Toolbar = Ext.extend(Ext.Container, {
	isChartToolbar : true,
	defaultType : "button",
	baseCls : Ext.baseCSSPrefix + "chart-toolbar",
	isOrientationSpecific : function() {
		var a = this.position;
		return (a && Ext.isObject(a) && "portrait" in a)
	},
	getPosition : function() {
		var c = this, a = c.position, b = c.chart.legend;
		if (!a && b) {
			a = b.getPosition()
		} else {
			if (c.isOrientationSpecific()) {
				a = a[Ext.getOrientation()]
			}
		}
		if (!a || !Ext.isString(a)) {
			a = "bottom"
		}
		return a
	},
	orient : function() {
		var b = this, a = Ext.getOrientation();
		if (!b.rendered) {
			b.render(b.chart.el)
		}
		if (a !== b.lastOrientation) {
			b.el.dom.setAttribute("data-side", b.getPosition());
			b.lastOrientation = a
		}
	}
});
Ext.chart.Legend = Ext
		.extend(
				Ext.util.Observable,
				{
					visible : true,
					position : "bottom",
					dock : Ext.is.Phone,
					doubleTapThreshold : 250,
					constructor : function(a) {
						var f = this, d = a.chart, i = d.el, c, e, g, h, b;
						f.addEvents("combine", "split");
						Ext.chart.Legend.superclass.constructor.call(f, a);
						g = f.getView();
						if (f.dock) {
							c = f.button = d.getToolbar().add(
									{
										showAnimation : "fade",
										cls : Ext.baseCSSPrefix
												+ "legend-button",
										iconCls : Ext.baseCSSPrefix
												+ "legend-button-icon",
										iconMask : true,
										handler : function() {
											f.sheet.show()
										}
									});
							c.show();
							h = {
								bottom : "up",
								top : "down",
								right : "left",
								left : "right"
							};
							b = {
								type : "slide",
								duration : 150,
								direction : h[f.getPosition()]
							};
							e = f.sheet = new Ext.Sheet(
									{
										enter : f.getPosition(),
										stretchY : true,
										stretchX : true,
										ui : "legend",
										hideOnMaskTap : true,
										enterAnimation : b,
										exitAnimation : b,
										width : 200,
										height : 260,
										renderTo : i,
										layout : "fit",
										items : g,
										listeners : {
											swipe : {
												element : "el",
												fn : function(j) {
													if (j.direction == f
															.getPosition()) {
														f.sheet.hide()
													}
												}
											}
										}
									})
						} else {
							g.render(i)
						}
						if (f.isDisplayed()) {
							f.show()
						}
					},
					getView : function() {
						var a = this;
						return a.view || (a.view = new Ext.chart.Legend.View({
							legend : a,
							floating : !a.dock
						}))
					},
					isDisplayed : function() {
						return this.visible
								&& this.chart.series.findIndex("showInLegend",
										true) !== -1
					},
					isOrientationSpecific : function() {
						var a = this.position;
						return (Ext.isObject(a) && "portrait" in a)
					},
					getPosition : function() {
						var b = this, a = b.position;
						if (b.isOrientationSpecific()) {
							a = a[Ext.getOrientation()]
						}
						if (b.dock && !Ext.isString(a)) {
							a = "bottom"
						}
						return a
					},
					isVertical : function() {
						var a = this.getPosition();
						return this.dock
								|| (Ext.isObject(a) ? a.vertical
										: "left|right|float".indexOf("" + a) !== -1)
					},
					orient : function() {
						var d = this, c = d.sheet, a = d.getPosition(), b = Ext
								.getOrientation(), e = "auto";
						d.getView().orient();
						if (d.lastOrientation !== b) {
							if (c) {
								c.hide();
								c.enter = c.exit = a;
								c.setSize(null, null);
								c.orient()
							}
							d.lastOrientation = b
						}
					},
					updatePosition : function() {
						if (!this.dock) {
							var C = this, r = C.chart, o = r.chartBBox, u = r.insetPadding, n = Ext
									.isObject(u), z = (n ? u.left : u) || 0, e = (n ? u.right
									: u) || 0, t = (n ? u.bottom : u) || 0, A = (n ? u.top
									: u) || 0, v = r.curWidth, g = r.curHeight, b = o.width
									- (z + e), h = o.height - (A + t), j = o.x
									+ z, i = o.y + A, k = C.isVertical(), p = C
									.getView(), d = Math, c = d.floor, B = d.min, E = d.max, m, l, q, f, w, s, D, a;
							if (C.sheet) {
								return
							}
							if (C.isDisplayed()) {
								p.show();
								p.setCalculatedSize(k ? a : null, k ? null : a);
								q = p.getWidth();
								f = p.getHeight();
								D = C.getPosition();
								if (Ext.isObject(D)) {
									m = D.x;
									l = D.y
								} else {
									switch (D) {
									case "left":
										m = z;
										l = c(i + h / 2 - f / 2);
										break;
									case "right":
										m = c(v - q) - e;
										l = c(i + h / 2 - f / 2);
										break;
									case "top":
										m = c(j + b / 2 - q / 2);
										l = A;
										break;
									default:
										m = c(j + b / 2 - q / 2);
										l = c(g - f) - t
									}
									m = E(m, z);
									l = E(l, A)
								}
								w = v - m - e;
								s = g - l - t;
								p.setPosition(m, l);
								if (q > w || f > s) {
									p.setCalculatedSize(B(q, w), B(f, s))
								}
							} else {
								p.hide()
							}
						}
					},
					getInsetSize : function() {
						var d = this, f = d.getPosition(), b = d.chart.insets, c = b.left, a = b.bottom, g = b.top, h = b.right, i = 0, e;
						if (!d.dock && d.isDisplayed()) {
							e = d.getView();
							e.show();
							if (f === "left" || f === "right") {
								i = e.getWidth() + c
							} else {
								if (f === "top" || f === "bottom") {
									i = e.getHeight() + g
								}
							}
						}
						return i
					},
					show : function() {
						(this.sheet || this.getView()).show()
					},
					hide : function() {
						(this.sheet || this.getView()).hide()
					},
					onCombine : function(a, d, c) {
						var b = this;
						a.combine(d, c);
						b.getView().updateStore();
						b.fireEvent("combine", b, a, d, c)
					},
					onSplit : function(b, a) {
						var c = this;
						b.split(a);
						c.getView().updateStore();
						c.fireEvent("split", c, b, a)
					},
					reset : function() {
						this.getView().reset()
					}
				});
Ext.chart.Legend.View = Ext
		.extend(
				Ext.DataView,
				{
					tpl : [
							'<ul class="' + Ext.baseCSSPrefix
									+ 'legend-items">',
							'<tpl for=".">',
							'<li class="' + Ext.baseCSSPrefix
									+ 'legend-item <tpl if="disabled">'
									+ Ext.baseCSSPrefix
									+ 'legend-inactive</tpl>">',
							'<span class="'
									+ Ext.baseCSSPrefix
									+ 'legend-item-marker" style="background-color:{markerColor};"></span>{label}',
							"</li>", "</tpl>", "</ul>" ],
					disableSelection : true,
					componentCls : Ext.baseCSSPrefix + "legend",
					horizontalCls : Ext.baseCSSPrefix + "legend-horizontal",
					inactiveItemCls : Ext.baseCSSPrefix + "legend-inactive",
					itemSelector : "." + Ext.baseCSSPrefix + "legend-item",
					hideOnMaskTap : false,
					triggerEvent : "tap",
					initComponent : function() {
						var a = this;
						a.createStore();
						Ext.chart.Legend.View.superclass.initComponent.call(a);
						a.on("refresh", a.updateDroppables, a)
					},
					initEvents : function() {
						var a = this;
						Ext.chart.Legend.View.superclass.initEvents.call(a);
						a.el.on("taphold", a.onTapHold, a, {
							delegate : a.itemSelector
						})
					},
					onTapHold : function(g, f) {
						var c = this, a, b, h, d;
						if (!Ext.fly(f).hasCls(c.inactiveItemCls)) {
							b = c.getRecord(f);
							h = b.get("seriesId");
							d = c.store.findBy(function(e) {
								return e !== b && e.get("seriesId") === h
							});
							if (d > -1) {
								a = new Ext.util.Draggable(
										f,
										{
											threshold : 0,
											revert : true,
											direction : c.legend.isVertical() ? "vertical"
													: "horizontal",
											group : h
										});
								a.on("dragend", c.onDragEnd, c);
								if (!a.dragging) {
									a.onStart(g)
								}
							}
						}
					},
					updateDroppables : function() {
						var b = this, a = b.droppables, c;
						Ext.destroy(a);
						a = b.droppables = [];
						b.store.each(function(d) {
							c = new Ext.chart.Legend.Droppable(b.getNode(d), {
								group : d.get("seriesId"),
								disabled : d.get("disabled")
							});
							c.on("drop", b.onDrop, b);
							a.push(c)
						})
					},
					onDrop : function(e, a) {
						var d = this, c = d.getRecord(a.el.dom), b = d
								.getRecord(e.el.dom);
						d.legend.onCombine(c.get("series"), c.get("index"), b
								.get("index"))
					},
					onDragEnd : function(a, b) {
						a.destroy()
					},
					createStore : function() {
						var a = this;
						a.store = new Ext.data.Store({
							fields : [ "markerColor", "label", "series",
									"seriesId", "index", "disabled" ],
							data : a.getStoreData()
						});
						a.legend.chart.series.each(function(b) {
							b.on("titlechange", a.updateStore, a)
						})
					},
					getStoreData : function() {
						var a = [];
						this.legend.chart.series.each(function(b) {
							if (b.showInLegend) {
								Ext.each(b.getLegendLabels(), function(c, d) {
									a.push({
										label : c,
										markerColor : b.getLegendColor(d),
										series : b,
										seriesId : Ext.id(b, "legend-series-"),
										index : d,
										disabled : !b.visibleInLegend(d)
									})
								})
							}
						});
						return a
					},
					updateStore : function() {
						var a = this.store;
						a.suspendEvents(true);
						a.removeAll();
						a.add(this.getStoreData());
						a.resumeEvents()
					},
					orient : function() {
						var d = this, c = d.legend, a = d.horizontalCls, e = c
								.isVertical(), b = Ext.getOrientation();
						if (e) {
							d.removeCls(a)
						} else {
							d.addCls(a)
						}
						if (d.lastOrientation !== b) {
							d.setCalculatedSize(null, null);
							d.scrollEl.setStyle({
								width : "",
								height : "",
								minWidth : "",
								minHeight : ""
							});
							Ext.iterate(d.scroller.scrollView.indicators,
									function(g, f) {
										clearTimeout(f.hideTimer);
										Ext.destroy(f.el);
										delete f.el
									}, this);
							d.scroller.destroy();
							d.setScrollable(e ? "vertical" : "horizontal");
							if (e) {
								d.setCalculatedSize(d.getWidth())
							}
							if (d.scroller) {
								d.scroller.scrollTo({
									x : 0,
									y : 0
								})
							}
							d.lastOrientation = b
						}
					},
					afterComponentLayout : function() {
						var d = this, a = d.scroller, c, b;
						Ext.chart.Legend.View.superclass.afterComponentLayout
								.apply(d, arguments);
						if (a) {
							c = a.size;
							b = a.containerBox;
							if (c.width > b.width || c.height > b.height) {
								a.enable()
							} else {
								a.disable()
							}
						}
					},
					refresh : function() {
						Ext.chart.Legend.View.superclass.refresh.apply(this,
								arguments);
						this.scrollEl.setStyle({
							minWidth : "",
							minHeight : ""
						})
					},
					onItemTap : function(l, b, j) {
						Ext.chart.Legend.View.superclass.onItemTap.apply(this,
								arguments);
						var k = this, d = k.store.getAt(b), c = d.get("series"), h = d
								.get("index"), f = k.legend.doubleTapThreshold, g = k.tapTask
								|| (k.tapTask = new Ext.util.DelayedTask()), a = +new Date();
						g.cancel();
						if (c.isCombinedItem(h)) {
							if (a - (k.lastTapTime || 0) < f) {
								k.doItemDoubleTap(l, b)
							} else {
								g.delay(f, k.doItemTap, k, [ l, b ])
							}
							k.lastTapTime = a
						} else {
							k.doItemTap(l, b)
						}
					},
					doItemTap : function(j, b) {
						var h = this, d = h.store.getAt(b), c = d.get("series"), f = d
								.get("index"), a = c.visibleInLegend(f), g = h.droppables[b], e = h.inactiveItemCls;
						c._index = f;
						if (a) {
							c.hideAll();
							Ext.fly(j).addCls(e);
							g.disable()
						} else {
							c.showAll();
							Ext.fly(j).removeCls(e);
							g.enable()
						}
						c.getSurface().renderFrame();
						c.getOverlaySurface().renderFrame();
						h.legend.chart.axes.each(function(i) {
							i.renderFrame()
						})
					},
					doItemDoubleTap : function(d, b) {
						var c = this, a = c.getRecord(d);
						if (a) {
							c.legend.onSplit(a.get("series"), a.get("index"))
						}
					},
					reset : function() {
						var a = this;
						a.store.each(function(b) {
							var c = b.get("series");
							c._index = b.get("index");
							c.showAll();
							Ext.fly(a.getNode(b)).removeCls(a.inactiveItemCls);
							c.clearCombinations()
						});
						a.updateStore()
					}
				});
Ext.chart.Legend.Droppable = Ext.extend(Ext.util.Droppable, {
	isDragOver : function(a) {
		var c = a.region, b = Math.round, d = {
			x : b((c.right - c.left) / 2 + c.left) + 0.5,
			y : b((c.bottom - c.top) / 2 + c.top) + 0.5
		};
		return a.el !== this.el && !this.region.isOutOfBound(d)
	}
});
Ext.ns("Ext.chart.theme");
Ext.ComponentQuery.pseudos["nth-child"] = function(a, c) {
	var b = +c - 1;
	if (a[b]) {
		return [ a[b] ]
	}
	return []
};
Ext.ComponentQuery.pseudos.highlight = function(f, g) {
	var e = 0, c = 0, b = f.length, h = [], k, m, a, d;
	for (; e < b; ++e) {
		k = f[e];
		if (k.isXType && k.isXType("highlight")) {
			h.push(k)
		}
		if (k.getRefItems) {
			m = k.getRefItems(true);
			for (c = 0, d = m.length; c < d; ++c) {
				a = m[c];
				if (a.isXType && a.isXType("highlight")) {
					h.push(a)
				}
			}
		}
	}
	return h
};
Ext.chart.theme.Theme = Ext
		.extend(
				Object,
				{
					theme : "Base",
					themeInitialized : false,
					applyStyles : function(m) {
						if (this.themeInitialized) {
							return
						}
						var r = this, t = {
							getRefItems : function() {
								return [ r ]
							},
							isXType : function() {
								return false
							},
							initCls : function() {
								return []
							},
							getItemId : function() {
								return ""
							}
						}, u = [ Ext.chart.theme.Base.slice() ], g = 0, c = 0, h = [], q, e, a, s, f, k, b, p, d, o;
						if (m || r.theme != "Base") {
							u.push(Ext.chart.theme[m || r.theme].slice())
						}
						for (p = u.length; c < p; ++c) {
							o = u[c];
							d = o.length;
							o
									.sort(function(l, j) {
										var i = l.specificity, n = j.specificity;
										return n[0] < i[0]
												|| (n[0] == i[0] && n[1] < i[1])
												|| (n[0] == i[0]
														&& n[1] == i[1] && n[2] < i[2])
									});
							for (g = 0; g < d; ++g) {
								s = o[g];
								e = s.selector;
								a = s.style;
								k = Ext.ComponentQuery.query(e, t);
								h.push.apply(h, k);
								for (f = 0, b = k.length; f < b; ++f) {
									k[f].themeStyle = Ext.apply(k[f].themeStyle
											|| {}, a)
								}
							}
						}
						for (f = 0, b = h.length; f < b; ++f) {
							q = h[f];
							q.style = Ext.applyIf(q.style || {}, q.themeStyle
									|| {})
						}
						r.themeInitialized = true
					}
				});
Ext.chart.theme.Base = [
		{
			selector : "chart",
			style : {
				padding : 10,
				colors : [ "#115fa6", "#94ae0a", "#a61120", "#ff8809",
						"#ffd13e", "#a61187", "#24ad9a", "#7c7474", "#a66111" ]
			},
			specificity : [ 0, 0, 1 ]
		}, {
			selector : "chart axis",
			style : {
				color : "#354f6e",
				fill : "#354f6e",
				stroke : "#cccccc",
				"stroke-width" : 1
			},
			specificity : [ 0, 0, 2 ]
		}, {
			selector : "chart axis label",
			style : {
				color : "#354f6e",
				fill : "#354f6e",
				font : "12px Helvetica, Arial, sans-serif",
				"font-weight" : "bold",
				spacing : 2,
				padding : 5
			},
			specificity : [ 0, 0, 3 ]
		}, {
			selector : "chart axis title",
			style : {
				font : "18px Helvetica, Arial, sans-serif",
				color : "#354f6e",
				fill : "#354f6e",
				padding : 5
			},
			specificity : [ 0, 0, 3 ]
		}, {
			selector : 'chart axis[position="left"] title',
			style : {
				rotate : {
					x : 0,
					y : 0,
					degrees : 270
				}
			},
			specificity : [ 0, 1, 3 ]
		}, {
			selector : 'chart axis[position="right"] title',
			style : {
				rotate : {
					x : 0,
					y : 0,
					degrees : 270
				}
			},
			specificity : [ 0, 1, 3 ]
		}, {
			selector : 'chart axis[position="radial"]',
			style : {
				fill : "none"
			},
			specificity : [ 0, 1, 2 ]
		}, {
			selector : 'chart axis[position="radial"] label',
			style : {
				font : "10px Helvetica, Arial, sans-serif",
				"text-anchor" : "middle"
			},
			specificity : [ 0, 1, 3 ]
		}, {
			selector : 'chart axis[position="gauge"]',
			style : {
				fill : "none"
			},
			specificity : [ 0, 1, 2 ]
		}, {
			selector : 'chart axis[position="gauge"] label',
			style : {
				font : "10px Helvetica, Arial, sans-serif",
				"text-anchor" : "middle"
			},
			specificity : [ 0, 1, 3 ]
		}, {
			selector : "chart series",
			style : {
				"stroke-width" : 1
			},
			specificity : [ 0, 0, 2 ]
		}, {
			selector : "chart series label",
			style : {
				font : "12px Helvetica, Arial, sans-serif",
				fill : "#333333",
				display : "none",
				field : "name",
				minMargin : "50",
				orientation : "horizontal"
			},
			specificity : [ 0, 0, 3 ]
		}, {
			selector : "chart series:nth-child(1)",
			style : {
				fill : "#115fa6"
			},
			specificity : [ 0, 1, 2 ]
		}, {
			selector : "chart series:nth-child(2)",
			style : {
				fill : "#94ae0a"
			},
			specificity : [ 0, 1, 2 ]
		}, {
			selector : "chart series:nth-child(3)",
			style : {
				fill : "#a61120"
			},
			specificity : [ 0, 1, 2 ]
		}, {
			selector : "chart series:nth-child(4)",
			style : {
				fill : "#ff8809"
			},
			specificity : [ 0, 1, 2 ]
		}, {
			selector : "chart series:nth-child(5)",
			style : {
				fill : "#ffd13e"
			},
			specificity : [ 0, 1, 2 ]
		}, {
			selector : "chart series:nth-child(6)",
			style : {
				fill : "#a61187"
			},
			specificity : [ 0, 1, 2 ]
		}, {
			selector : "chart series:nth-child(7)",
			style : {
				fill : "#24ad9a"
			},
			specificity : [ 0, 1, 2 ]
		}, {
			selector : "chart series:nth-child(8)",
			style : {
				fill : "#7c7474"
			},
			specificity : [ 0, 1, 2 ]
		}, {
			selector : "chart series:nth-child(9)",
			style : {
				fill : "#a66111"
			},
			specificity : [ 0, 1, 2 ]
		}, {
			selector : "chart series:highlight",
			style : {
				radius : 20,
				"stroke-width" : 5,
				stroke : "#ff5555"
			},
			specificity : [ 0, 1, 2 ]
		}, {
			selector : 'chart series[type="line"]:highlight',
			style : {
				"stroke-width" : 3
			},
			specificity : [ 0, 2, 2 ]
		}, {
			selector : 'chart series[type="bar"]:highlight',
			style : {
				"stroke-width" : 3,
				stroke : "#5555cc",
				opacity : 0.8
			},
			specificity : [ 0, 2, 2 ]
		}, {
			selector : 'chart series[type="area"]:highlight',
			style : {
				"stroke-width" : 3,
				stroke : "#111111"
			},
			specificity : [ 0, 2, 2 ]
		}, {
			selector : 'chart series[type="pie"]:highlight',
			style : {
				stroke : "none",
				"stroke-width" : 0
			},
			specificity : [ 0, 2, 2 ]
		}, {
			selector : 'chart series[type="scatter"]:highlight',
			style : {
				stroke : "none",
				"stroke-width" : 0
			},
			specificity : [ 0, 2, 2 ]
		}, {
			selector : "chart marker",
			style : {
				stroke : "#ffffff",
				"stroke-width" : 1,
				type : "circle",
				fill : "#000000",
				radius : 5,
				size : 5
			},
			specificity : [ 0, 0, 2 ]
		}, {
			selector : "chart marker:nth-child(1)",
			style : {
				fill : "#115fa6",
				type : "circle"
			},
			specificity : [ 0, 1, 2 ]
		}, {
			selector : "chart marker:nth-child(2)",
			style : {
				fill : "#94ae0a"
			},
			specificity : [ 0, 1, 2 ]
		}, {
			selector : "chart marker:nth-child(3)",
			style : {
				fill : "#a61120"
			},
			specificity : [ 0, 1, 2 ]
		}, {
			selector : "chart marker:nth-child(3)",
			style : {
				fill : "#a61120"
			},
			specificity : [ 0, 1, 2 ]
		}, {
			selector : "chart marker:nth-child(4)",
			style : {
				fill : "#ff8809"
			},
			specificity : [ 0, 1, 2 ]
		}, {
			selector : "chart marker:nth-child(5)",
			style : {
				fill : "#ffd13e"
			},
			specificity : [ 0, 1, 2 ]
		}, {
			selector : "chart marker:nth-child(6)",
			style : {
				fill : "#a61187"
			},
			specificity : [ 0, 1, 2 ]
		}, {
			selector : "chart marker:nth-child(7)",
			style : {
				fill : "#24ad9a"
			},
			specificity : [ 0, 1, 2 ]
		}, {
			selector : "chart marker:nth-child(8)",
			style : {
				fill : "#7c7474"
			},
			specificity : [ 0, 1, 2 ]
		}, {
			selector : "chart marker:nth-child(9)",
			style : {
				fill : "#a66111"
			},
			specificity : [ 0, 1, 2 ]
		}, {
			selector : 'chart interaction[type="itemcompare"] circle',
			style : {
				fill : "rgba(0, 0, 0, 0)",
				stroke : "#0d75f2",
				radius : 5
			},
			specificity : [ 0, 1, 3 ]
		}, {
			selector : 'chart interaction[type="itemcompare"] line',
			style : {
				stroke : "#0d75f2",
				"stroke-width" : 3
			},
			specificity : [ 0, 1, 3 ]
		}, {
			selector : 'chart interaction[type="itemcompare"] arrow',
			style : {
				fill : "#0d75f2",
				radius : 8
			},
			specificity : [ 0, 1, 3 ]
		}, {
			selector : 'chart interaction[type="piegrouping"] slice',
			style : {
				stroke : "#0d75f2",
				"stroke-width" : 2,
				fill : "#0d75f2",
				opacity : 0.5
			},
			specificity : [ 0, 1, 3 ]
		}, {
			selector : 'chart interaction[type="piegrouping"] handle',
			style : {
				stroke : "#0d75f2",
				"stroke-width" : 2,
				fill : "#0d75f2"
			},
			specificity : [ 0, 1, 3 ]
		} ];
Ext.chart.theme.Demo = [ {
	selector : 'chart[cls="area1"] axis[position="left"] grid even',
	style : {
		opacity : 1,
		fill : "#dddddd",
		stroke : "#bbbbbb",
		"stroke-width" : 1
	},
	specificity : [ 0, 2, 4 ]
}, {
	selector : 'chart[cls="area1"] axis[position="bottom"] label',
	style : {
		rotate : {
			degrees : 45
		}
	},
	specificity : [ 0, 2, 3 ]
}, {
	selector : 'chart[cls="area1"] series',
	style : {
		opaciy : "0.93"
	},
	specificity : [ 0, 1, 2 ]
}, {
	selector : 'chart[cls="bar1"] axis[position="bottom"] grid',
	style : {
		stroke : "#cccccc"
	},
	specificity : [ 0, 2, 3 ]
}, {
	selector : 'chart[cls="column1"]',
	style : {
		background : "#111111"
	},
	specificity : [ 0, 1, 1 ]
}, {
	selector : 'chart[cls="column1"] axis',
	style : {
		stroke : "#eeeeee",
		fill : "#eeeeee"
	},
	specificity : [ 0, 1, 2 ]
}, {
	selector : 'chart[cls="column1"] axis label',
	style : {
		fill : "#ffffff"
	},
	specificity : [ 0, 1, 3 ]
}, {
	selector : 'chart[cls="column1"] axis title',
	style : {
		fill : "#ffffff"
	},
	specificity : [ 0, 1, 3 ]
}, {
	selector : 'chart[cls="column1"] axis[position="left"] grid odd',
	style : {
		stroke : "#555555"
	},
	specificity : [ 0, 2, 4 ]
}, {
	selector : 'chart[cls="column1"] axis[position="left"] grid even',
	style : {
		stroke : "#555555"
	},
	specificity : [ 0, 2, 4 ]
}, {
	selector : 'chart[cls="column1"] series label',
	style : {
		fill : "#ffffff",
		font : "17px Arial",
		display : "insideEnd",
		"text-anchor" : "middle",
		orientation : "horizontal"
	},
	specificity : [ 0, 1, 3 ]
}, {
	selector : 'chart[cls="barcombo1"] axis[position="bottom"] grid',
	style : {
		stroke : "#cccccc"
	},
	specificity : [ 0, 2, 3 ]
}, {
	selector : 'chart[cls="piecombo1"]',
	style : {
		padding : 20
	},
	specificity : [ 0, 1, 1 ]
}, {
	selector : 'chart[cls="piecombo1"] series label',
	style : {
		display : "rotate",
		contrast : true,
		font : "14px Arial"
	},
	specificity : [ 0, 1, 3 ]
}, {
	selector : 'chart[cls="gaugecombo1"]',
	style : {
		padding : 30
	},
	specificity : [ 0, 1, 1 ]
}, {
	selector : 'chart[cls="gaugecombo1"] axis',
	style : {
		stroke : "#cccccc"
	},
	specificity : [ 0, 1, 2 ]
}, {
	selector : 'chart[cls="gaugecombo1"] axis label',
	style : {
		font : "15px Arial"
	},
	specificity : [ 0, 1, 3 ]
}, {
	selector : 'chart[cls="radarcombo1"]',
	style : {
		padding : 20
	},
	specificity : [ 0, 1, 1 ]
}, {
	selector : 'chart[cls="radarcombo1"] axis',
	style : {
		stroke : "#cccccc",
		fill : "none"
	},
	specificity : [ 0, 1, 2 ]
}, {
	selector : 'chart[cls="radarcombo1"] axis label',
	style : {
		font : "11px Arial",
		"text-anchor" : "middle"
	},
	specificity : [ 0, 1, 3 ]
}, {
	selector : 'chart[cls="radarcombo1"] series',
	style : {
		opacity : 0.4
	},
	specificity : [ 0, 1, 2 ]
}, {
	selector : 'chart[cls="line1"] axis[position="left"] grid odd',
	style : {
		opacity : 1,
		fill : "#dddddd",
		stroke : "#bbbbbb",
		"stroke-width" : 0.5
	},
	specificity : [ 0, 2, 4 ]
}, {
	selector : 'chart[cls="line1"] marker',
	style : {
		size : 4,
		radius : 4,
		"stroke-width" : 0
	},
	specificity : [ 0, 1, 2 ]
}, {
	selector : 'chart[cls="line1"] series:nth-child(1) marker',
	style : {
		type : "image",
		height : "46",
		width : "46",
		src : '"../resources/shared/img/iphone.png"'
	},
	specificity : [ 0, 2, 3 ]
}, {
	selector : 'chart[cls="line1"] series:nth-child(2) marker',
	style : {
		type : "image",
		height : "46",
		width : "46",
		src : '"../resources/shared/img/android.png"'
	},
	specificity : [ 0, 2, 3 ]
}, {
	selector : 'chart[cls="line1"] series:nth-child(3) marker',
	style : {
		type : "image",
		height : "46",
		width : "46",
		src : '"../resources/shared/img/ipad.png"'
	},
	specificity : [ 0, 2, 3 ]
}, {
	selector : 'chart[cls="pie1"]',
	style : {
		padding : 10
	},
	specificity : [ 0, 1, 1 ]
}, {
	selector : 'chart[cls="pie1"] series label',
	style : {
		display : "rotate",
		contrast : true,
		font : "18px Helvetica, Arial, sans-serif"
	},
	specificity : [ 0, 1, 3 ]
}, {
	selector : 'chart[cls="radar1"]',
	style : {
		padding : 20
	},
	specificity : [ 0, 1, 1 ]
}, {
	selector : 'chart[cls="radar1"] axis',
	style : {
		stroke : "#cccccc",
		fill : "none"
	},
	specificity : [ 0, 1, 2 ]
}, {
	selector : 'chart[cls="radar1"] axis label',
	style : {
		font : "11px Arial",
		"text-anchor" : "middle"
	},
	specificity : [ 0, 1, 3 ]
}, {
	selector : 'chart[cls="radar1"] series',
	style : {
		opacity : 0.4
	},
	specificity : [ 0, 1, 2 ]
}, {
	selector : 'chart[cls="scatter1"]',
	style : {
		padding : 40
	},
	specificity : [ 0, 1, 1 ]
}, {
	selector : 'chart[cls="scatter1"] axis[position="left"] grid odd',
	style : {
		opacity : 1,
		fill : "#dddddd",
		stroke : "#bbbbbb",
		"stroke-width" : 0.5
	},
	specificity : [ 0, 2, 4 ]
}, {
	selector : 'chart[cls="scatter1"] marker',
	style : {
		size : 8,
		radius : 8
	},
	specificity : [ 0, 1, 2 ]
}, {
	selector : 'chart[cls="stock1"] axis label',
	style : {
		font : "12px Arial"
	},
	specificity : [ 0, 1, 3 ]
}, {
	selector : 'chart[cls="stock1"] axis[position="left"] grid',
	style : {
		stroke : "#cccccc"
	},
	specificity : [ 0, 2, 3 ]
} ];
Ext.chart.theme.Energy = [
		{
			selector : "chart",
			style : {
				colors : [ "rgba(17, 95, 166, 0.85)",
						"rgba(148, 174, 10, 0.85)", "rgba(166, 17, 32, 0.85)",
						"rgba(255, 136, 9, 0.85)", "rgba(255, 209, 62, 0.85)",
						"rgba(166, 17, 135, 0.85)", "rgba(36, 173, 154, 0.85)",
						"rgba(124, 116, 116, 0.85)", "rgba(166, 97, 17, 0.85)" ]
			},
			specificity : [ 0, 0, 1 ]
		}, {
			selector : "chart series",
			style : {
				"stroke-width" : 2
			},
			specificity : [ 0, 0, 2 ]
		}, {
			selector : "chart series grid odd",
			style : {
				stroke : "#333333"
			},
			specificity : [ 0, 0, 4 ]
		}, {
			selector : "chart series grid even",
			style : {
				stroke : "#222222"
			},
			specificity : [ 0, 0, 4 ]
		}, {
			selector : "chart axis",
			style : {
				stroke : "#555555",
				fill : "#555555"
			},
			specificity : [ 0, 0, 2 ]
		}, {
			selector : "chart axis label",
			style : {
				fill : "#666666"
			},
			specificity : [ 0, 0, 3 ]
		}, {
			selector : "chart axis title",
			style : {
				fill : "#cccccc"
			},
			specificity : [ 0, 0, 3 ]
		}, {
			selector : 'chart axis[position="radial"]',
			style : {
				fill : "none"
			},
			specificity : [ 0, 1, 2 ]
		}, {
			selector : 'chart axis[position="radial"] label',
			style : {
				fill : "#ffffff",
				"text-anchor" : "center",
				translate : {
					x : 0,
					y : -10
				}
			},
			specificity : [ 0, 1, 3 ]
		}, {
			selector : 'chart[cls="radar"]',
			style : {
				padding : 40
			},
			specificity : [ 0, 1, 1 ]
		} ];
Ext.chart.theme.WorldData = [ {
	selector : "chart",
	style : {
		colors : [ "#49080e", "#49080e", "#d7a400" ],
		background : "#dbddd8"
	},
	specificity : [ 0, 0, 1 ]
}, {
	selector : "chart series:highlight",
	style : {
		radius : 5,
		"stroke-width" : 3,
		stroke : "#ffffff"
	},
	specificity : [ 0, 1, 2 ]
}, {
	selector : "chart axis",
	style : {
		stroke : "#c2c4be",
		fill : "#c2c4be"
	},
	specificity : [ 0, 0, 2 ]
}, {
	selector : "chart axis label",
	style : {
		fill : "#909488"
	},
	specificity : [ 0, 0, 3 ]
}, {
	selector : "chart axis title",
	style : {
		fill : "#43453e"
	},
	specificity : [ 0, 0, 3 ]
} ];
Ext.ns("Ext.chart.theme");
Ext.chart.theme.Style = Ext.extend(Object, {
	constructor : function(a) {
		this.style = {};
		this.themeStyle = {};
		Ext.apply(this.style, a)
	},
	ownerCt : null,
	getItemId : function() {
		return this.el && this.el.id || this.id || null
	},
	initCls : function() {
		return (this.cls || "").split(" ")
	},
	isXType : function(a) {
		return a === ""
	},
	getRefItems : function(a) {
		return []
	}
});
Ext.ns("Ext.chart.theme");
Ext.chart.theme.LabelStyle = Ext.extend(Ext.chart.theme.Style, {
	constructor : function(a) {
		Ext.chart.theme.LabelStyle.superclass.constructor.call(this, a)
	},
	isXType : function(a) {
		return a === "label"
	}
});
Ext.ns("Ext.chart.theme");
Ext.chart.theme.HighlightStyle = Ext.extend(Ext.chart.theme.Style, {
	constructor : function(a) {
		Ext.chart.theme.HighlightStyle.superclass.constructor.call(this, a);
		this.style = false
	},
	isXType : function(a) {
		return a === "highlight"
	},
	getRefItems : function(a) {
		return []
	}
});
Ext.ns("Ext.chart.theme");
Ext.chart.theme.MarkerStyle = Ext.extend(Ext.chart.theme.Style, {
	constructor : function(a) {
		Ext.chart.theme.MarkerStyle.superclass.constructor.call(this, a)
	},
	isXType : function(a) {
		return a === "marker"
	}
});
Ext.ns("Ext.chart.theme");
Ext.chart.theme.TitleStyle = Ext.extend(Ext.chart.theme.Style, {
	constructor : function(a) {
		Ext.chart.theme.TitleStyle.superclass.constructor.call(this, a)
	},
	isXType : function(a) {
		return a === "title"
	}
});
Ext.ns("Ext.chart.theme");
Ext.chart.theme.CalloutStyle = Ext.extend(Ext.chart.theme.Style, {
	constructor : function(a) {
		Ext.chart.theme.CalloutStyle.superclass.constructor.call(this, a);
		this.style = false;
		this.oddStyle = new Ext.chart.theme.OddStyle();
		this.evenStyle = new Ext.chart.theme.EvenStyle()
	},
	isXType : function(a) {
		return a === "callout"
	},
	getRefItems : function(a) {
		return []
	}
});
Ext.ns("Ext.chart.theme");
Ext.chart.theme.GridStyle = Ext.extend(Ext.chart.theme.Style, {
	constructor : function(a) {
		Ext.chart.theme.GridStyle.superclass.constructor.call(this, a);
		this.style = false;
		this.oddStyle = new Ext.chart.theme.OddStyle();
		this.evenStyle = new Ext.chart.theme.EvenStyle()
	},
	isXType : function(a) {
		return a === "grid"
	},
	getRefItems : function(a) {
		return [ this.oddStyle, this.evenStyle ]
	}
});
Ext.ns("Ext.chart.theme");
Ext.chart.theme.EvenStyle = Ext.extend(Ext.chart.theme.Style, {
	constructor : function(a) {
		Ext.chart.theme.EvenStyle.superclass.constructor.call(this, a);
		this.style = false
	},
	isXType : function(a) {
		return a === "even"
	}
});
Ext.ns("Ext.chart.theme");
Ext.chart.theme.OddStyle = Ext.extend(Ext.chart.theme.Style, {
	constructor : function(a) {
		Ext.chart.theme.OddStyle.superclass.constructor.call(this, a);
		this.style = false
	},
	isXType : function(a) {
		return a === "odd"
	}
});
Ext.chart.Chart = Ext
		.extend(
				Ext.draw.Component,
				{
					version : "1.0.0",
					viewBox : false,
					animate : false,
					legend : false,
					background : false,
					surfaceZIndexes : {
						main : 0,
						axis : 10,
						series : 20,
						overlay : 30,
						events : 40
					},
					constructor : function(b) {
						var c = this, a;
						b = Ext.apply({}, b);
						if (c.gradients) {
							Ext.apply(b, {
								gradients : c.gradients
							})
						}
						if (c.background) {
							Ext.apply(b, {
								background : c.background
							})
						}
						if (b.animate) {
							a = {
								easing : "ease",
								duration : 500
							};
							if (Ext.isObject(b.animate)) {
								b.animate = Ext.applyIf(b.animate, a)
							} else {
								b.animate = a
							}
						}
						Ext.chart.Chart.superclass.constructor.apply(this,
								[ b ])
					},
					initComponent : function() {
						var b = this, c, a, d;
						delete b.legend;
						Ext.chart.Chart.superclass.initComponent.call(this);
						b.addEvents("beforerefresh", "refresh", "redraw");
						b.addEvents.apply(b,
								Ext.chart.series.ItemEvents.itemEventNames);
						Ext.applyIf(b, {
							zoom : {
								width : 1,
								height : 1,
								x : 0,
								y : 0
							}
						});
						b.maxGutter = [ 0, 0 ];
						c = b.axes;
						b.on("activate", b.onActivate, b);
						b.axes = new Ext.util.MixedCollection(false,
								function(e) {
									return e.position
								});
						if (c) {
							b.axes.addAll(c)
						}
						a = b.series;
						b.series = new Ext.util.MixedCollection(false,
								function(e) {
									return e.seriesId
											|| (e.seriesId = Ext.id(null,
													"ext-chart-series-"))
								});
						if (a) {
							b.series.addAll(a)
						}
						d = b.interactions;
						b.interactions = new Ext.util.MixedCollection(false,
								function(e) {
									return e.type
								});
						if (d) {
							Ext.each(d, b.addInteraction, b)
						}
					},
					onActivate : function() {
						if (this.dirtyStore) {
							this.redraw()
						}
					},
					getEventsSurface : function() {
						return this.getSurface("events")
					},
					initEvents : function() {
						Ext.chart.Chart.superclass.initEvents.call(this);
						this.interactions.each(function(a) {
							a.initEvents()
						})
					},
					getSurface : function(c) {
						var e = this, b = e.surfaces || (e.surfaces = {
							main : e.surface
						}), a = b[c], f = e.surfaceZIndexes, d;
						if (!a) {
							a = b[c] = e.createSurface({
								background : null,
								initEvents : (c == "events")
							});
							d = a.el;
							d.setStyle("position", "absolute");
							d.setStyle("zIndex", 10);
							if (c in f) {
								d.setStyle("zIndex", f[c])
							}
						}
						return a
					},
					getToolbar : function() {
						var b = this, a = b.toolbar;
						if (!a || !a.isChartToolbar) {
							a = b.toolbar = new Ext.chart.Toolbar(Ext.applyIf({
								chart : b
							}, a))
						}
						return a
					},
					doComponentLayout : function(b, a) {
						var c = this, d;
						if (Ext.isNumber(b)
								&& Ext.isNumber(a)
								&& (c.dirtyStore || (b !== c.curWidth || a !== c.curHeight))) {
							c.curWidth = b;
							c.curHeight = a;
							c.getSurface("main").setSize(b, a);
							d = c.getEventsSurface();
							d.setSize(b, a);
							d.el.setTopLeft(0, 0);
							if (c.store) {
								c.redraw(true)
							}
						}
						Ext.chart.Chart.superclass.doComponentLayout.apply(
								this, arguments)
					},
					redraw : function(c) {
						var g = this, b, j, h, f, d, a, e, k, m;
						g.dirtyStore = false;
						g.chartBBox = {
							x : 0,
							y : 0,
							height : g.curHeight,
							width : g.curWidth
						};
						g.colorArrayStyle = g.colorArrayStyle || [];
						g.series.each(g.initializeSeries, g);
						g.axes.each(g.initializeAxis, g);
						if (!g.themeInitialized) {
							g.applyStyles();
							if (g.style && g.style.colors) {
								a = g.style.colors;
								k = g.colorArrayStyle;
								for (f = 0, d = a.length; f < d; ++f) {
									e = a[f];
									if (Ext.isObject(e)) {
										for (b in g.surfaces) {
											g.surfaces[b].addGradient(e)
										}
										k.push("url(#" + e.id + ")")
									} else {
										k.push(e)
									}
								}
							} else {
								g.series.each(function(l, i) {
									g.colorArrayStyle[i] = (l.style.fill
											|| l.style.stroke || "#000")
								})
							}
							g.series.each(function(i) {
								i.colorArrayStyle = g.colorArrayStyle
							});
							if (g.style && g.style.background) {
								a = g.style.background;
								if (Ext.isObject(a)) {
									g.background = {
										gradient : a
									};
									g.surfaces.main.addGradient(a)
								} else {
									if (a.indexOf("url") > -1) {
										g.background = {
											image : a
										}
									} else {
										g.background = {
											fill : a
										}
									}
								}
								g.surfaces.main.initBackground(g.background)
							}
						}
						g.initializeLegend();
						j = g.legend;
						if (j) {
							j.orient()
						}
						h = g.toolbar;
						if (h && h.isChartToolbar) {
							h.orient()
						}
						g.axes.each(function(i) {
							i.processView()
						});
						g.axes.each(function(i) {
							i.drawAxis(true)
						});
						g.alignAxes();
						if (j) {
							j.updatePosition()
						}
						g.getMaxGutter();
						g.resizing = !!c;
						g.axes.each(g.drawAxis, g);
						g.series.each(g.drawCharts, g);
						Ext.iterate(g.surfaces, function(l, i) {
							i.renderFrame()
						});
						g.resizing = false;
						if (Ext.is.iPad) {
							Ext.repaint()
						}
						if (!g.interactionsInitialized) {
							g.interactionsInitialized = true;
							if (g.animate) {
								g.interactions.each(function(i) {
									i.initializeDefaults({
										type : "beforerender"
									})
								});
								m = function() {
									g.interactions.each(function(i) {
										i.initializeDefaults({
											type : "afterrender"
										})
									});
									g.series.get(0).removeListener(
											"afterrender", m)
								};
								g.series.get(0).addListener("afterrender", m)
							} else {
								g.interactions.each(function(i) {
									i.initializeDefaults()
								})
							}
						}
						g.fireEvent("redraw", g)
					},
					afterRender : function() {
						var b, a = this;
						Ext.chart.Chart.superclass.afterRender.call(this);
						if (a.categoryNames) {
							a.setCategoryNames(a.categoryNames)
						}
						if (a.tipRenderer) {
							b = a.getFunctionRef(a.tipRenderer);
							a.setTipRenderer(b.fn, b.scope)
						}
						a.bindStore(a.store);
						a.refresh()
					},
					getEventXY : function(f) {
						f = (f.changedTouches && f.changedTouches[0])
								|| f.event || f.browserEvent || f;
						var c = this, d = c.el.getXY(), b = c.chartBBox, a = f.pageX
								- d[0] - b.x, g = f.pageY - d[1] - b.y;
						return [ a, g ]
					},
					getItemForPoint : function(a, h) {
						var g = this, e = 0, c = g.series.items, b = c.length, d, f;
						for (; e < b; e++) {
							d = c[e];
							f = d.getItemForPoint(a, h);
							if (f) {
								return f
							}
						}
						return false
					},
					getItemsForPoint : function(a, d) {
						var c = this, b = [];
						c.series.each(function(e) {
							var f = e.getItemForPoint(a, d);
							if (f) {
								b.push(f)
							}
						});
						return b
					},
					capitalize : function(a) {
						return a.charAt(0).toUpperCase() + a.substr(1)
					},
					delayRefresh : function() {
						var a = this;
						if (!a.refreshTask) {
							a.refreshTask = new Ext.util.DelayedTask(a.refresh,
									a)
						}
						a.refreshTask.delay(10)
					},
					refresh : function() {
						var b = this, a;
						b.dirtyStore = true;
						if (b.rendered && b.curWidth != a && b.curHeight != a
								&& b.fireEvent("beforerefresh", b) !== false) {
							b.redraw();
							b.fireEvent("refresh", b)
						}
					},
					bindStore : function(b) {
						var d = this, a = d.store, c = !d.storeIsBound;
						b = Ext.StoreMgr.lookup(b);
						if (!c && a && b !== a) {
							if (a.autoDestroy) {
								a.destroy()
							} else {
								a.un({
									scope : d,
									datachanged : d.refresh,
									add : d.delayRefresh,
									remove : d.delayRefresh,
									update : d.delayRefresh
								})
							}
						}
						if (b && (c || b !== a)) {
							b.on({
								scope : d,
								datachanged : d.refresh,
								add : d.delayRefresh,
								remove : d.delayRefresh,
								update : d.delayRefresh
							})
						}
						d.store = b;
						d.storeIsBound = true;
						if (b && !c) {
							d.refresh()
						}
					},
					addInteraction : function(a) {
						if (Ext.isString(a)) {
							a = {
								type : a
							}
						}
						if (!a.chart) {
							a.chart = this;
							a = Ext.chart.interactions.Manager.create(a)
						}
						this.interactions.add(a)
					},
					initializeLegend : function() {
						var c = this, b = c.legend, a = c.initialConfig.legend;
						if (!b && a) {
							b = c.legend = new Ext.chart.Legend(Ext.apply({
								chart : c
							}, a));
							b.on("combine", c.redraw, c);
							b.on("split", c.redraw, c)
						}
					},
					initializeAxis : function(f) {
						var g = this, e = g.chartBBox, b = e.width, d = e.height, a = e.x, i = e.y, c = {
							chart : g,
							ownerCt : g,
							x : 0,
							y : 0
						};
						switch (f.position) {
						case "top":
							Ext.apply(c, {
								length : b,
								width : d,
								startX : a,
								startY : i
							});
							break;
						case "bottom":
							Ext.apply(c, {
								length : b,
								width : d,
								startX : a,
								startY : d
							});
							break;
						case "left":
							Ext.apply(c, {
								length : d,
								width : b,
								startX : a,
								startY : d
							});
							break;
						case "right":
							Ext.apply(c, {
								length : d,
								width : b,
								startX : b,
								startY : d
							});
							break
						}
						if (!f.chart) {
							Ext.apply(c, f);
							f = g.axes.replace(new Ext.chart.axis[this
									.capitalize(f.type)](c))
						} else {
							Ext.apply(f, c)
						}
					},
					alignAxes : function() {
						var f = this, g = f.axes, e = f.legend, b = [ "top",
								"right", "bottom", "left" ], d, c = f.insetPadding
								|| +f.style.padding || 10, a;
						if (Ext.isObject(c)) {
							f.insetPadding = Ext.apply({}, c);
							a = {
								top : c.top || 0,
								right : c.right || 0,
								bottom : c.bottom || 0,
								left : c.left || 0
							}
						} else {
							f.insetPadding = c;
							a = {
								top : c,
								right : c,
								bottom : c,
								left : c
							}
						}
						f.insets = a;
						function h(k) {
							var j = g.findIndex("position", k);
							return (j < 0) ? null : g.getAt(j)
						}
						Ext
								.each(
										b,
										function(j) {
											var l = (j === "left" || j === "right"), i = h(j), k;
											if (e !== false) {
												if (e.getPosition() === j) {
													a[j] += e.getInsetSize()
												}
											}
											if (i && i.bbox) {
												k = i.bbox;
												a[j] += (l ? k.width : k.height)
											}
										});
						d = {
							x : a.left,
							y : a.top,
							width : f.curWidth - a.left - a.right,
							height : f.curHeight - a.top - a.bottom
						};
						f.chartBBox = d;
						g.each(function(j) {
							var l = j.position, i = j.bbox || {
								width : 0,
								height : 0
							}, k = (l === "left" || l === "right");
							j.x = (l === "left" ? d.x - i.width : d.x);
							j.y = (l === "top" ? d.y - i.height : d.y);
							j.width = (k ? i.width + d.width : i.height
									+ d.height);
							j.length = (k ? d.height : d.width);
							j.startX = (k ? (l === "left" ? i.width : d.width)
									: 0);
							j.startY = (l === "top" ? i.height : d.height)
						})
					},
					initializeSeries : function(c, a) {
						var d = this, b = {
							chart : d,
							ownerCt : d,
							seriesId : c.seriesId,
							index : a
						};
						if (c instanceof Ext.chart.series.Series) {
							Ext.apply(c, b)
						} else {
							Ext.applyIf(b, c);
							c = d.series.replace(new Ext.chart.series[d
									.capitalize(c.type)](b))
						}
						if (c.initialize) {
							c.initialize()
						}
					},
					getMaxGutter : function() {
						var b = this, a = [ 0, 0 ];
						b.series.each(function(c) {
							var d = c.getGutters && c.getGutters() || [ 0, 0 ];
							a[0] = Math.max(a[0], d[0]);
							a[1] = Math.max(a[1], d[1])
						});
						b.maxGutter = a
					},
					drawAxis : function(a) {
						a.drawAxis()
					},
					drawCharts : function(a) {
						a.drawSeries();
						if (!this.animate) {
							a.fireEvent("afterrender")
						}
					},
					reset : function(c) {
						var b = this, a = b.legend;
						b.axes.each(function(d) {
							if (d.reset) {
								d.reset()
							}
						});
						b.series.each(function(d) {
							if (d.reset) {
								d.reset()
							}
						});
						if (a && a.reset) {
							a.reset()
						}
						if (!c) {
							b.redraw()
						}
					},
					destroy : function() {
						Ext.iterate(this.surfaces, function(b, a) {
							a.destroy()
						});
						this.bindStore(null);
						Ext.chart.Chart.superclass.destroy.apply(this,
								arguments)
					},
					ownerCt : null,
					getItemId : function() {
						return this.el && this.el.id || this.id || null
					},
					initCls : function() {
						return (this.cls || "").split(" ")
					},
					isXType : function(a) {
						return a === "chart"
					},
					getRefItems : function(a) {
						var c = this, b = [];
						c.series.each(function(d) {
							b.push(d);
							if (a) {
								if (d.markerStyle) {
									b.push(d.markerStyle)
								}
								if (d.labelStyle) {
									b.push(d.labelStyle)
								}
								if (d.calloutStyle) {
									b.push(d.calloutStyle)
								}
							}
						});
						c.axes.each(function(d) {
							b.push(d);
							if (a && d.labelStyle) {
								b.push(d.labelStyle)
							}
							if (a && d.gridStyle) {
								b.push(d.gridStyle);
								b.push(d.gridStyle.oddStyle);
								b.push(d.gridStyle.evenStyle)
							}
						});
						c.interactions.each(function(d) {
							b.push(d);
							if (a) {
								b = b.concat(d.getRefItems(a))
							}
						});
						return b
					}
				});
Ext.applyIf(Ext.chart.Chart.prototype, Ext.chart.theme.Theme.prototype);
Ext.reg("chart", Ext.chart.Chart);
Ext.chart.Panel = Ext.extend(Ext.Panel, {
	defaultType : "chart",
	layout : "fit",
	constructor : function(a) {
		a.dockedItems = {
			xtype : "panel",
			height : "2.6em",
			dock : "top",
			layout : {
				type : "card",
				align : "stretch"
			},
			activeItem : 0,
			dockedItems : {
				dock : "right",
				xtype : "toolbar",
				ui : "light",
				items : a.dockedItems
			},
			items : [ {
				dock : "top",
				xtype : "toolbar",
				ui : "light",
				title : a.title || ""
			}, {
				dock : "top",
				xtype : "toolbar",
				ui : "light",
				title : ""
			} ]
		};
		Ext.chart.Panel.superclass.constructor.call(this, a)
	},
	onRender : function() {
		var a = this, b;
		Ext.chart.Panel.superclass.onRender.apply(a, arguments);
		b = a.headerPanel = a.dockedItems.get(0);
		a.descriptionPanel = b.items.get(1)
	}
});
Ext.chart.Callout = Ext
		.extend(
				Object,
				{
					constructor : function(a) {
						var b = this;
						if (a.callouts) {
							a.callouts.styles = Ext.apply({}, a.callouts.styles
									|| {});
							b.callouts = Ext
									.apply(b.callouts || {}, a.callouts);
							b.calloutsArray = []
						}
						b.calloutStyle = new Ext.chart.theme.CalloutStyle()
					},
					renderCallouts : function() {
						if (!this.callouts) {
							return
						}
						var u = this, l = u.items, a = u.chart.animate, t = u.callouts, g = t.styles, e = u.calloutsArray, b = u.chart.store, r = b
								.getCount(), d = l.length / r, k = [], q, c, o, m;
						for (q = 0, c = 0; q < r; q++) {
							for (o = 0; o < d; o++) {
								var s = l[c], f = e[c], h = b.getAt(q), n;
								n = ((s && s.useCallout) || t.filter(h, s, q,
										n, o, c))
										&& (Math.abs(s.endAngle - s.startAngle) > 0.8);
								if (!n && !f) {
									c++;
									continue
								}
								if (!f) {
									e[c] = f = u.onCreateCallout(h, s, q, n, o,
											c)
								}
								for (m in f) {
									if (f[m] && f[m].setAttributes) {
										f[m].setAttributes(g, true)
									}
								}
								if (!n) {
									for (m in f) {
										if (f[m]) {
											if (f[m].setAttributes) {
												f[m].setAttributes({
													hidden : true
												}, true)
											} else {
												if (f[m].setVisible) {
													f[m].setVisible(false)
												}
											}
										}
									}
								}
								t.renderer(f, h);
								if (n) {
									u.onPlaceCallout(f, h, s, q, n, a, o, c, k)
								}
								k.push(f);
								c++
							}
						}
						this.hideCallouts(c)
					},
					onCreateCallout : function(f, k, e, g) {
						var h = this, d = h.callouts, l = d.styles, c = l.width || 100, j = l.height || 100, b = h
								.getSurface(), a = {
							label : false,
							box : false,
							lines : false
						};
						a.lines = b.add(Ext.apply({}, {
							type : "path",
							path : "M0,0",
							stroke : h.getLegendColor(e) || "#555"
						}, d.lines || {}));
						a.box = b.add(Ext.apply({
							type : "rect",
							width : c,
							height : j
						}, d.box || {}));
						a.label = b.add(Ext.apply({
							type : "text",
							text : "some text"
						}, d.label || {}));
						return a
					},
					hideCallouts : function(b) {
						var d = this.calloutsArray, a = d.length, e, c;
						while (a-- > b) {
							e = d[a];
							for (c in e) {
								if (e[c]) {
									e[c].hide(true)
								}
							}
						}
					},
					ownerCt : null,
					getItemId : function() {
						return this.el && this.el.id || this.id || null
					},
					initCls : function() {
						return (this.cls || "").split(" ")
					},
					isXType : function(a) {
						return a === "callout"
					},
					getRefItems : function(a) {
						return []
					}
				});
Ext.chart.Highlight = Ext
		.extend(
				Object,
				{
					highlight : true,
					highlightDuration : 150,
					highlightCfg : null,
					constructor : function(a) {
						if (a.highlight !== false) {
							if (a.highlight !== true) {
								this.highlightCfg = Ext.apply({}, a.highlight)
							} else {
								this.highlightCfg = {}
							}
							this.addEvents("highlight", "unhighlight");
							this.highlightStyle = new Ext.chart.theme.HighlightStyle()
						}
					},
					highlightItem : function(j) {
						if (!j) {
							return
						}
						var f = this, i = j.sprite, a = f.highlightCfg, d = f.chart.surface, c = f.chart.animate, b, h, g, e;
						if (f.highlight === false || !i || i._highlighted) {
							return
						}
						Ext.applyIf(f.highlightCfg, f.highlightStyle.style
								|| {});
						if (i._anim) {
							i._anim.paused = true
						}
						i._highlighted = true;
						if (!i._defaults) {
							i._defaults = Ext.apply({}, i.attr);
							h = {};
							g = {};
							for (b in a) {
								if (!(b in i._defaults)) {
									i._defaults[b] = d.attributeDefaults[d.attributeMap[b]]
								}
								h[b] = i._defaults[b];
								g[b] = a[b];
								if (Ext.isObject(a[b])) {
									h[b] = {};
									g[b] = {};
									Ext.apply(i._defaults[b], i.attr[b]);
									Ext.apply(h[b], i._defaults[b]);
									for (e in i._defaults[b]) {
										if (!(e in a[b])) {
											g[b][e] = h[b][e]
										} else {
											g[b][e] = a[b][e]
										}
									}
									for (e in a[b]) {
										if (!(e in g[b])) {
											g[b][e] = a[b][e]
										}
									}
								}
							}
							i._from = h;
							i._to = g;
							i._endStyle = g
						}
						if (c) {
							i._anim = new Ext.fx.Anim({
								target : i,
								from : i._from,
								to : i._to,
								duration : f.highlightDuration || 150
							})
						} else {
							i.setAttributes(i._to, true)
						}
						f.fireEvent("highlight", j)
					},
					unHighlightItem : function() {
						if (this.highlight === false || !this.items) {
							return
						}
						var h = this, g = h.items, f = g.length, a = h.highlightCfg, c = h.chart.animate, e = 0, d, b, j;
						for (; e < f; e++) {
							if (!g[e]) {
								continue
							}
							j = g[e].sprite;
							if (j && j._highlighted) {
								if (j._anim) {
									j._anim.paused = true
								}
								d = {};
								for (b in a) {
									if (Ext.isObject(j._defaults[b])) {
										d[b] = {};
										Ext.apply(d[b], j._defaults[b])
									} else {
										d[b] = j._defaults[b]
									}
								}
								if (c) {
									j._endStyle = d;
									j._anim = new Ext.fx.Anim({
										target : j,
										to : d,
										duration : h.highlightDuration || 150
									})
								} else {
									j.setAttributes(d, true)
								}
								delete j._highlighted
							}
						}
						h.fireEvent("unhighlight")
					},
					cleanHighlights : function() {
						if (this.highlight === false) {
							return
						}
						var d = this.group, c = this.markerGroup, b = 0, a;
						for (a = d.getCount(); b < a; b++) {
							delete d.getAt(b)._defaults
						}
						if (c) {
							for (a = c.getCount(); b < a; b++) {
								delete c.getAt(b)._defaults
							}
						}
					}
				});
Ext.chart.Label = Ext
		.extend(
				Object,
				{
					colorStringRe : /url\s*\(\s*#([^\/)]+)\s*\)/,
					constructor : function(a) {
						var b = this;
						b.label = Ext.applyIf(a.label || {}, {
							renderer : function(c) {
								return c
							}
						});
						if (b.label.display !== "none") {
							b.labelsGroup = b.chart.surface.getGroup(b.seriesId
									+ "-labels")
						}
					},
					renderLabels : function() {
						var C = this, p = C.chart, s = p.gradients, q = C.items, d = p.animate, A = Ext
								.apply(C.labelStyle.style || {}, C.label || {}), v = A.display, a = []
								.concat(A.field), l = C.labelsGroup, w = C
								.getRecordCount(), e = (q || 0) && q.length, h = e
								/ w, c = (s || 0) && s.length, E = Ext.draw.Color, b, f = 0, g, u, t, o, y, n, z, i, r, m, x, B, D;
						if (v == "none") {
							return
						}
						C
								.eachRecord(function(k, j) {
									g = 0;
									for (u = 0; u < h; u++) {
										z = q[f];
										i = l.getAt(f);
										while (this.__excludes
												&& this.__excludes[g]) {
											g++
										}
										if (!z && i) {
											i.hide(true)
										}
										if (z && a[u]) {
											if (!i) {
												i = C.onCreateLabel(k, z, j, v,
														u, g)
											}
											i.show(true);
											C.onPlaceLabel(i, k, z, j, v, d, u,
													g);
											if (A.contrast && z.sprite) {
												r = z.sprite;
												if (r._endStyle) {
													D = r._endStyle.fill
												} else {
													if (r._to) {
														D = r._to.fill
													} else {
														D = r.attr.fill
													}
												}
												D = D || r.attr.fill;
												m = E.fromString(D);
												if (D && !m) {
													D = D
															.match(C.colorStringRe)[1];
													for (t = 0; t < c; t++) {
														b = s[t];
														if (b.id == D) {
															n = 0;
															o = 0;
															for (y in b.stops) {
																n++;
																o += E
																		.fromString(
																				b.stops[y].color)
																		.getGrayscale()
															}
															x = (o / n) / 255;
															break
														}
													}
												} else {
													x = m.getGrayscale() / 255
												}
												if (i.isOutside) {
													x = 1
												}
												B = E.fromString(
														i.attr.color
																|| i.attr.fill)
														.getHSL();
												B[2] = x > 0.5 ? 0.2 : 0.8;
												i.setAttributes({
													fill : String(E.fromHSL
															.apply({}, B))
												}, true)
											}
										}
										f++;
										g++
									}
								});
						C.hideLabels(f)
					},
					hideLabels : function(c) {
						var b = this.labelsGroup, a;
						if (b) {
							a = b.getCount();
							while (a-- > c) {
								b.getAt(a).hide(true)
							}
						}
					}
				});
Ext.chart.Transformable = Ext.extend(Object, {
	zoomX : 1,
	zoomY : 1,
	panX : 0,
	panY : 0,
	constructor : function() {
		this.addEvents("transform")
	},
	setTransform : function(b, a, e, d) {
		var c = this;
		c.panX = b;
		c.panY = a;
		c.zoomX = e;
		c.zoomY = d;
		c.clearFastTransform();
		Ext.each(c.getTransformableSurfaces(), function(f) {
			f.setSurfaceTransform(b, a, e, d)
		});
		c.fireEvent("transform", c, false)
	},
	transformBy : function(b, a, e, d) {
		var c = this;
		c.setTransform(c.panX + b, c.panY + a, c.zoomX * e, c.zoomY * d)
	},
	setTransformFast : function(b, a, e, d) {
		var c = this;
		b -= c.panX;
		a -= c.panY;
		e /= c.zoomX;
		d /= c.zoomY;
		c.clearFastTransform();
		c.transformByFast(b, a, e, d)
	},
	transformByFast : function(b, a, d, c) {
		this.setFastTransformMatrix(this.getFastTransformMatrix().translate(b,
				a).scale(d, c, 0, 0))
	},
	getTransformMatrix : function() {
		var a = this;
		return a.getFastTransformMatrix().clone().translate(a.panX, a.panY)
				.scale(a.zoomX, a.zoomY, 0, 0)
	},
	getFastTransformMatrix : function() {
		return this.fastTransformMatrix || new Ext.draw.Matrix()
	},
	setTransformMatrixFast : function(a) {
		var b = a.split();
		this.setTransformFast(b.translateX, b.translateY, b.scaleX, b.scaleY)
	},
	setFastTransformMatrix : function(a) {
		var b = this;
		b.fastTransformMatrix = a;
		Ext.each(b.getTransformableSurfaces(), function(c) {
			c.setSurfaceFastTransform(a)
		});
		if (a) {
			b.fireEvent("transform", b, true)
		}
	},
	clearFastTransform : function() {
		this.setFastTransformMatrix(null)
	},
	hasFastTransform : function() {
		var a = this.fastTransformMatrix;
		return a && !a.isIdentity()
	},
	clearTransform : function() {
		this.setTransform(0, 0, 1, 1)
	},
	syncToFastTransform : function() {
		var b = this, a = b.getFastTransformMatrix(), c = a.split();
		delete b.fastTransformMatrix;
		b.transformBy(c.translateX, c.translateY, c.scaleX, c.scaleY)
	},
	getTransformableSurfaces : function() {
		return []
	}
});
Ext.ns("Ext.chart.axis");
Ext.chart.axis.Abstract = Ext.extend(Ext.util.Observable, {
	constructor : function(a) {
		a = a || {};
		var b = this, c = a.position || "left";
		c = c.charAt(0).toUpperCase() + c.substring(1);
		Ext.apply(b, a);
		b.fields = [].concat(b.fields);
		b.labels = [];
		b.getId();
		b.labelGroup = b.getSurface().getGroup(b.axisId + "-labels");
		b.titleStyle = new Ext.chart.theme.TitleStyle();
		Ext.apply(b.titleStyle.style, a.labelTitle || {});
		b.labelStyle = new Ext.chart.theme.LabelStyle();
		Ext.apply(b.labelStyle.style, a.label || {});
		b.gridStyle = new Ext.chart.theme.GridStyle();
		Ext.apply(b.gridStyle.style, a.grid || {});
		if (a.grid && a.grid.odd) {
			b.gridStyle.oddStyle.style = Ext.apply(b.gridStyle.oddStyle.style
					|| {}, a.grid.odd)
		}
		if (a.grid && a.grid.even) {
			b.gridStyle.evenStyle.style = Ext.apply(b.gridStyle.evenStyle.style
					|| {}, a.grid.even)
		}
		Ext.chart.Transformable.prototype.constructor.call(b)
	},
	grid : false,
	steps : 10,
	x : 0,
	y : 0,
	minValue : 0,
	maxValue : 0,
	getId : function() {
		return this.axisId || (this.axisId = Ext.id(null, "ext-axis-"))
	},
	processView : Ext.emptyFn,
	drawAxis : Ext.emptyFn,
	getSurface : function() {
		var c = this, a = c.surface, b = c.chart;
		if (!a) {
			a = c.surface = b.getSurface(c.position + "Axis");
			a.el.setStyle("zIndex", b.surfaceZIndexes.axis)
		}
		return a
	},
	hideLabels : function() {
		this.labelGroup.hide()
	},
	updateSurfaceBox : function() {
		var c = this, a = c.getSurface(), b = c.chart;
		a.el.setTopLeft(0, 0);
		a.setSize(b.curWidth, b.curHeight)
	},
	getTransformableSurfaces : function() {
		return [ this.getSurface() ]
	},
	reset : function() {
		this.clearTransform()
	},
	renderFrame : function() {
		this.getSurface().renderFrame()
	},
	ownerCt : null,
	getItemId : function() {
		return this.el && this.el.id || this.id || null
	},
	initCls : function() {
		return (this.cls || "").split(" ")
	},
	isXType : function(a) {
		return a === "axis"
	},
	getRefItems : function(a) {
		var c = this, b = [];
		if (c.labelStyle) {
			b.push(c.labelStyle)
		}
		if (c.titleStyle) {
			b.push(c.titleStyle)
		}
		if (c.gridStyle) {
			b.push(c.gridStyle);
			b.push(c.gridStyle.oddStyle);
			b.push(c.gridStyle.evenStyle)
		}
		return b
	}
});
Ext.applyIf(Ext.chart.axis.Abstract.prototype,
		Ext.chart.Transformable.prototype);
Ext.chart.axis.Axis = Ext
		.extend(
				Ext.chart.axis.Abstract,
				{
					dashSize : 3,
					position : "bottom",
					length : 0,
					width : 0,
					majorTickSteps : false,
					applyData : Ext.emptyFn,
					calcLabels : false,
					overflowBuffer : 1.25,
					renderFrame : function() {
						var b = this, a = b.getSurface(), c = b
								.getLabelSurface();
						a.renderFrame();
						if (c !== a) {
							c.renderFrame()
						}
					},
					isSide : function() {
						var a = this.position;
						return a === "left" || a === "right"
					},
					updateSurfaceBox : function() {
						var e = this, c = e.isSide(), d = e.length, f = d + 1, b = e.width, a = e
								.getSurface();
						a.el.setTopLeft(e.y, e.x);
						a.setSize(c ? b : f, c ? f : b)
					},
					calcEnds : function() {
						var c = this, e = c.getBoundSeries(), b = isNaN(c.minimum) ? Infinity
								: c.minimum, d = isNaN(c.maximum) ? -Infinity
								: c.maximum, h = c["zoom"
								+ (c.isSide() ? "Y" : "X")], i = c.chart.endsLocked, g, f, a;
						if (i) {
							b = c.prevFrom;
							d = c.prevTo
						} else {
							e.each(function(k) {
								var j = c.isBoundToField(k.xField) ? k
										.getMinMaxXValues() : k
										.getMinMaxYValues();
								if (j[0] < b) {
									b = j[0]
								}
								if (j[1] > d) {
									d = j[1]
								}
							});
							if (!isFinite(d)) {
								d = c.prevMax || 0
							}
							if (!isFinite(b)) {
								b = c.prevMin || 0
							}
							if (b != d && (d != (Math.floor(d)))) {
								d = Math.ceil(d)
							}
						}
						if (c.type == "Numeric" && b === d) {
							if (d !== 0) {
								b = d / 2
							} else {
								b = -1
							}
						}
						a = Ext.draw.Draw
								.snapEnds(
										b,
										d,
										(c.majorTickSteps !== false ? (c.majorTickSteps + 1)
												: c.steps)
												* h, i);
						g = a.from;
						f = a.to;
						if (!i) {
							if (!isNaN(c.maximum)) {
								a.to = c.maximum
							}
							if (!isNaN(c.minimum)) {
								a.from = c.minimum
							}
						}
						a.step = (a.to - a.from) / (f - g) * a.step;
						if (c.adjustMaximumByMajorUnit) {
							a.to += a.step
						}
						if (c.adjustMinimumByMajorUnit) {
							a.from -= a.step
						}
						c.prevTo = a.to;
						c.prevFrom = a.from;
						c.prevMin = b == d ? 0 : b;
						c.prevMax = d;
						return a
					},
					drawAxis : function(I) {
						var g = this, G = g.zoomX, F = g.zoomY, C = g.startX
								* G, B = g.startY * F, z = g.chart.maxGutter[0]
								* G, v = g.chart.maxGutter[1] * F, O = g.dashSize, u = g.minorTickSteps || 0, t = g.minorTickSteps || 0, L = g
								.isSide(), d = g.length, n = d
								* g.overflowBuffer, H = d * (L ? F : G), D = g.position, f = [], e = g.calcLabels, p = g
								.applyData(), s = p.step, c = p.from, N = p.to, o = Math, k = o.floor, b = o.max, w = o.min, a = o.round, K, r, q, m, l, E, j, h, A, M, J;
						g.updateSurfaceBox();
						if (g.hidden || g.chart.store.getCount() < 1
								|| p.steps <= 0) {
							g.getSurface().items.hide(true);
							if (g.displaySprite) {
								g.displaySprite.hide(true)
							}
							return
						}
						g.from = p.from;
						g.to = p.to;
						if (L) {
							r = k(C) + 0.5;
							E = [ "M", r, B, "l", 0, -H ];
							K = H - (v * 2)
						} else {
							q = k(B) + 0.5;
							E = [ "M", C, q, "l", H, 0 ];
							K = H - (z * 2)
						}
						A = K * s / (N - c);
						M = g.skipTicks = k(b(0, (L ? H + g.panY - d - n
								: -g.panX - n))
								/ A);
						j = b(u + 1, 0);
						h = b(t + 1, 0);
						if (e) {
							g.labels = [ p.from + M * s ]
						}
						if (L) {
							q = l = B - v - A * M;
							r = C - ((D == "left") * O * 2);
							while (q >= l - w(K, d + n * 2)) {
								E.push("M", r, k(q) + 0.5, "l", O * 2 + 1, 0);
								if (q != l) {
									for (J = 1; J < h; J++) {
										E.push("M", r + O,
												k(q + A * J / h) + 0.5, "l",
												O + 1, 0)
									}
								}
								f.push([ k(C), k(q) ]);
								q -= A;
								if (e) {
									g.labels
											.push(+(g.labels[g.labels.length - 1] + s)
													.toFixed(10))
								}
								if (A === 0) {
									break
								}
							}
							if (a(q + A - (B - v - K))) {
								E.push("M", r, k(B - H + v) + 0.5, "l",
										O * 2 + 1, 0);
								for (J = 1; J < h; J++) {
									E.push("M", r + O,
											k(B - H + v + A * J / h) + 0.5,
											"l", O + 1, 0)
								}
								f.push([ k(C), k(q) ]);
								if (e) {
									g.labels
											.push(+(g.labels[g.labels.length - 1] + s)
													.toFixed(10))
								}
							}
						} else {
							r = m = C + z + A * M;
							q = B - ((D == "top") * O * 2);
							while (r <= m + w(K, d + n * 2)) {
								E.push("M", k(r) + 0.5, q, "l", 0, O * 2 + 1);
								if (r != m) {
									for (J = 1; J < j; J++) {
										E.push("M", k(r - A * J / j) + 0.5, q,
												"l", 0, O + 1)
									}
								}
								f.push([ k(r), k(B) ]);
								r += A;
								if (e) {
									g.labels
											.push(+(g.labels[g.labels.length - 1] + s)
													.toFixed(10))
								}
								if (A === 0) {
									break
								}
							}
							if (a(r - A - (C + z + K))) {
								E.push("M", k(C + H - z) + 0.5, q, "l", 0,
										O * 2 + 1);
								for (J = 1; J < j; J++) {
									E.push("M", k(C + H - z - A * J / j) + 0.5,
											q, "l", 0, O + 1)
								}
								f.push([ k(r), k(B) ]);
								if (e) {
									g.labels
											.push(+(g.labels[g.labels.length - 1] + s)
													.toFixed(10))
								}
							}
						}
						if (!g.axis) {
							g.axis = g.getSurface().add(Ext.apply({
								type : "path",
								path : E
							}, g.style))
						}
						g.axis.setAttributes({
							path : E,
							hidden : false
						}, true);
						g.inflections = f;
						if (!I) {
							if (g.grid || g.gridStyle.style
									|| g.gridStyle.oddStyle.style
									|| g.gridStyle.evenStyle.style) {
								g.drawGrid()
							}
						}
						g.axisBBox = g.axis.getBBox();
						g.drawLabel()
					},
					drawGrid : function() {
						var t = this, o = t.getSurface(), b = t.gridStyle.style
								|| t.grid, e = t.gridStyle.oddStyle.style
								|| b.odd, f = t.gridStyle.evenStyle.style
								|| b.even, h = t.inflections, k = h.length
								- ((e || f) ? 0 : 1), u = t.position, d = t.chart.maxGutter, n = t.width - 2, p, q, r = 1, c = t
								.isSide(), m = [], g, a, j, l = [], s = [];
						if ((d[1] !== 0 && c) || (d[0] !== 0 && !c)) {
							r = 0;
							k++
						}
						for (; r < k; r++) {
							p = h[r];
							q = h[r - 1];
							if (e || f) {
								m = (r % 2) ? l : s;
								g = ((r % 2) ? e : f) || {};
								a = (g.lineWidth || g["stroke-width"] || 0) / 2;
								j = 2 * a;
								if (u == "left") {
									m.push("M", q[0] + 1 + a, q[1] + 0.5 - a,
											"L", q[0] + 1 + n - a, q[1] + 0.5
													- a, "L", p[0] + 1 + n - a,
											p[1] + 0.5 + a, "L", p[0] + 1 + a,
											p[1] + 0.5 + a, "Z")
								} else {
									if (u == "right") {
										m.push("M", q[0] - a, q[1] + 0.5 - a,
												"L", q[0] - n + a, q[1] + 0.5
														- a, "L", p[0] - n + a,
												p[1] + 0.5 + a, "L", p[0] - a,
												p[1] + 0.5 + a, "Z")
									} else {
										if (u == "top") {
											m.push("M", q[0] + 0.5 + a, q[1]
													+ 1 + a, "L", q[0] + 0.5
													+ a, q[1] + 1 + n - a, "L",
													p[0] + 0.5 - a, p[1] + 1
															+ n - a, "L", p[0]
															+ 0.5 - a, p[1] + 1
															+ a, "Z")
										} else {
											m.push("M", q[0] + 0.5 + a, q[1]
													- a, "L", q[0] + 0.5 + a,
													q[1] - n + a, "L", p[0]
															+ 0.5 - a, p[1] - n
															+ a, "L", p[0]
															+ 0.5 - a,
													p[1] - a, "Z")
										}
									}
								}
							} else {
								if (u == "left") {
									m = m.concat([ "M", p[0] + 0.5, p[1] + 0.5,
											"l", n, 0 ])
								} else {
									if (u == "right") {
										m = m.concat([ "M", p[0] - 0.5,
												p[1] + 0.5, "l", -n, 0 ])
									} else {
										if (u == "top") {
											m = m.concat([ "M", p[0] + 0.5,
													p[1] + 0.5, "l", 0, n ])
										} else {
											m = m.concat([ "M", p[0] + 0.5,
													p[1] - 0.5, "l", 0, -n ])
										}
									}
								}
							}
						}
						if (e || f) {
							if (l.length) {
								if (!t.gridOdd && l.length) {
									t.gridOdd = o.add({
										type : "path",
										path : l
									})
								}
								t.gridOdd.setAttributes(Ext.apply({
									path : l,
									hidden : false
								}, e || {}), true)
							}
							if (s.length) {
								if (!t.gridEven) {
									t.gridEven = o.add({
										type : "path",
										path : s
									})
								}
								t.gridEven.setAttributes(Ext.apply({
									path : s,
									hidden : false
								}, f || {}), true)
							}
						} else {
							if (m.length) {
								if (!t.gridLines) {
									t.gridLines = t.getSurface().add({
										type : "path",
										path : m,
										"stroke-width" : t.lineWidth || 1,
										stroke : t.gridColor || "#ccc"
									})
								}
								t.gridLines.setAttributes({
									hidden : false,
									path : m
								}, true)
							} else {
								if (t.gridLines) {
									t.gridLines.hide(true)
								}
							}
						}
					},
					isPannable : function() {
						var g = this, f = g.length, c = g.isSide(), e = Math, b = e.ceil, d = e.floor, a = g
								.getTransformMatrix();
						return a
								&& ((c ? b(a.y(0, 0)) < 0 : d(a.x(f, 0)) > f) || (c ? d(a
										.y(0, f)) > f
										: b(a.x(0, 0)) < 0))
					},
					getOrCreateLabel : function(d, g) {
						var e = this, c = e.labelGroup, f = c.getAt(d), b, a = e.labelStyle.style;
						if (f) {
							if (g != f.attr.text) {
								f.setAttributes(Ext.apply({
									text : g
								}, a), true);
								f._bbox = f.getBBox()
							}
						} else {
							b = e.getLabelSurface();
							f = b.add(Ext.apply({
								group : c,
								type : "text",
								x : 0,
								y : 0,
								text : g
							}, a));
							b.renderItem(f);
							f._bbox = f.getBBox()
						}
						if (a.rotation) {
							f.setAttributes({
								rotation : {
									degrees : 0
								}
							}, true);
							f._ubbox = f.getBBox();
							f.setAttributes(a, true)
						} else {
							f._ubbox = f._bbox
						}
						return f
					},
					rect2pointArray : function(k) {
						var b = this.getSurface(), f = b.getBBox(k, true), l = [
								f.x, f.y ], d = l.slice(), j = [ f.x + f.width,
								f.y ], a = j.slice(), i = [ f.x + f.width,
								f.y + f.height ], e = i.slice(), h = [ f.x,
								f.y + f.height ], c = h.slice(), g = k.matrix;
						l[0] = g.x.apply(g, d);
						l[1] = g.y.apply(g, d);
						j[0] = g.x.apply(g, a);
						j[1] = g.y.apply(g, a);
						i[0] = g.x.apply(g, e);
						i[1] = g.y.apply(g, e);
						h[0] = g.x.apply(g, c);
						h[1] = g.y.apply(g, c);
						return [ l, j, i, h ]
					},
					intersect : function(c, a) {
						var d = this.rect2pointArray(c), b = this
								.rect2pointArray(a);
						return !!Ext.draw.Draw.intersect(d, b).length
					},
					drawHorizontalLabels : function() {
						var z = this, d = z.labelStyle.style, p = d.renderer
								|| function(i) {
									return i
								}, c = Math, u = c.floor, s = c.max, t = z.chart.axes, A = z.position, f = z.inflections, j = f.length, w = z.labels, m = z.skipTicks, o = 0, e, a, q, k, v, n, h, l, g, r, b;
						if (!z.calcLabels && m) {
							w = w.slice(m);
							j -= m
						}
						h = j - 1;
						q = f[0];
						b = z.getOrCreateLabel(0, p(w[0]));
						e = c.abs(c.sin(d.rotate
								&& (d.rotate.degrees * c.PI / 180) || 0)) >> 0;
						for (r = 0; r < j; r++) {
							q = f[r];
							n = p(w[r]);
							v = z.getOrCreateLabel(r, n);
							a = v._bbox;
							o = s(o, a.height + z.dashSize + (d.padding || 0));
							l = u(q[0] - (e ? a.height : a.width) / 2);
							if (z.chart.maxGutter[0] == 0) {
								if (r == 0
										&& t.findIndex("position", "left") == -1) {
									l = q[0]
								} else {
									if (r == h
											&& t.findIndex("position", "right") == -1) {
										l = q[0] - a.width
									}
								}
							}
							if (A == "top") {
								g = q[1] - (z.dashSize * 2) - d.padding
										- (a.height / 2)
							} else {
								g = q[1] + (z.dashSize * 2) + d.padding
										+ (a.height / 2)
							}
							if (!z.isPannable()) {
								l += z.x;
								g += z.y
							}
							v.setAttributes({
								hidden : false,
								x : l,
								y : g
							}, true);
							if (d.rotate) {
								v.setAttributes(d, true)
							}
							if (r != 0
									&& (z.intersect(v, k) || z.intersect(v, b))) {
								v.hide(true);
								continue
							}
							k = v
						}
						return o
					},
					drawVerticalLabels : function() {
						var z = this, d = z.labelStyle.style, n = d.renderer
								|| function(i) {
									return i
								}, e = z.inflections, A = z.position, j = e.length, w = z.labels, l = z.skipTicks, t = 0, c = Math, q = c.max, s = c.floor, b = c.ceil, r = z.chart.axes, u = z.chart.maxGutter[1], a, o, h, v, m, g, k, f, p;
						if (!z.calcLabels && l) {
							w = w.slice(l);
							j -= l
						}
						g = j;
						for (p = 0; p < g; p++) {
							o = e[p];
							m = n(w[p]);
							v = z.getOrCreateLabel(p, m);
							a = v._bbox;
							t = q(t, a.width + z.dashSize + (d.padding || 0));
							f = o[1];
							if (u < a.height / 2) {
								if (p == g - 1
										&& r.findIndex("position", "top") == -1) {
									f += b(a.height / 2)
								} else {
									if (p == 0
											&& r
													.findIndex("position",
															"bottom") == -1) {
										f -= s(a.height / 2)
									}
								}
							}
							if (A == "left") {
								k = o[0] - a.width - z.dashSize
										- (d.padding || 0) - 2
							} else {
								k = o[0] + z.dashSize + (d.padding || 0) + 2
							}
							if (!z.isPannable()) {
								k += z.x;
								f += z.y + z.panY
							}
							v.setAttributes(Ext.apply({
								hidden : false,
								x : k,
								y : f
							}, d), true);
							if (p != 0 && z.intersect(v, h)) {
								v.hide(true);
								continue
							}
							h = v
						}
						return t
					},
					drawLabel : function() {
						if (!this.inflections) {
							return 0
						}
						var g = this, b = g.labelGroup, h = g.inflections, a = g
								.getLabelSurface(), f = 0, e = 0, d, c;
						if (g.lastLabelSurface !== a) {
							b.each(function(i) {
								i.destroy()
							});
							b.clear();
							g.lastLabelSurface = a
						}
						if (g.isSide()) {
							f = g.drawVerticalLabels()
						} else {
							e = g.drawHorizontalLabels()
						}
						d = b.getCount();
						c = h.length;
						for (; c < d; c++) {
							b.getAt(c).hide(true)
						}
						g.bbox = {};
						Ext.apply(g.bbox, g.axisBBox);
						g.bbox.height = e;
						g.bbox.width = f;
						if (Ext.isString(g.title)) {
							g.drawTitle(f, e)
						}
					},
					getLabelSurface : function() {
						var a = this;
						return a.isPannable() ? a.getSurface() : a.chart
								.getSurface("main")
					},
					setTitle : function(a) {
						this.title = a;
						this.drawLabel()
					},
					drawTitle : function(k, l) {
						var g = this, f = g.position, b = g.chart
								.getSurface("main"), c = g.displaySprite, j = g.title, e = g
								.isSide(), i = g.startX + g.x, h = g.startY
								+ g.y, a, m, d;
						if (c) {
							c.setAttributes({
								text : j
							}, true)
						} else {
							a = {
								type : "text",
								x : 0,
								y : 0,
								text : j
							};
							c = g.displaySprite = b.add(Ext.apply(a,
									g.titleStyle.style, g.labelTitle));
							b.renderItem(c)
						}
						m = c.getBBox();
						d = g.dashSize + (g.titleStyle.style.padding || 0);
						if (e) {
							h -= ((g.length / 2) - (m.height / 2));
							if (f == "left") {
								i -= (k + d + (m.width / 2))
							} else {
								i += (k + d + m.width - (m.width / 2))
							}
							g.bbox.width += m.width + 10
						} else {
							i += (g.length / 2) - (m.width * 0.5);
							if (f == "top") {
								h -= (l + d + (m.height * 0.3))
							} else {
								h += (l + d + (m.height * 0.8))
							}
							g.bbox.height += m.height + 10
						}
						c.setAttributes({
							hidden : false,
							translate : {
								x : i,
								y : h
							}
						}, true)
					},
					getBoundSeries : function() {
						var b = this, a = b.chart.series;
						return a
								.filterBy(function(d) {
									var e = [].concat(d.xField, d.yField), c = e.length;
									while (c--) {
										if (b.isBoundToField(e[c])) {
											return true
										}
									}
									return false
								})
					},
					isBoundToField : function(c) {
						var a = this.fields, b = a.length;
						while (b--) {
							if (a[b] === c) {
								return true
							}
						}
						return false
					}
				});
Ext.chart.axis.Category = Ext.extend(Ext.chart.axis.Axis, {
	categoryNames : null,
	calculateCategoryCount : false,
	setLabels : function() {
		var b = this.chart.store, a = this.fields, d = a.length, c;
		this.labels = [];
		b.each(function(e) {
			for (c = 0; c < d; c++) {
				this.labels.push(e.get(a[c]))
			}
		}, this)
	},
	applyData : function() {
		Ext.chart.axis.Category.superclass.applyData.call(this);
		this.setLabels();
		var a = this.chart.store.getCount();
		return {
			from : 0,
			to : a - 1,
			power : 1,
			step : 1,
			steps : a - 1
		}
	}
});
Ext.chart.axis.Gauge = Ext
		.extend(
				Ext.chart.axis.Abstract,
				{
					position : "gauge",
					drawAxis : function(q) {
						var k = this, h = k.chart, a = k.getSurface(), p = h.chartBBox, d = p.x
								+ (p.width / 2), b = p.y + p.height, c = k.margin || 10, m = Math
								.min(p.width, 2 * p.height)
								/ 2 + c, g = [], n, l = k.steps, e, f = Math.PI, o = Math.cos, j = Math.sin;
						if (k.sprites && !h.resizing) {
							k.drawLabel();
							return
						}
						k.updateSurfaceBox();
						if (k.margin >= 0) {
							if (!k.sprites) {
								for (e = 0; e <= l; e++) {
									n = a
											.add({
												type : "path",
												path : [
														"M",
														d
																+ (m - c)
																* o(e / l * f
																		- f),
														b
																+ (m - c)
																* j(e / l * f
																		- f),
														"L",
														d
																+ m
																* o(e / l * f
																		- f),
														b
																+ m
																* j(e / l * f
																		- f),
														"Z" ],
												stroke : "#ccc"
											});
									n.setAttributes(Ext.apply(k.style || {}, {
										hidden : false
									}), true);
									g.push(n)
								}
							} else {
								g = k.sprites;
								for (e = 0; e <= l; e++) {
									g[e].setAttributes({
										path : [ "M",
												d + (m - c) * o(e / l * f - f),
												b + (m - c) * j(e / l * f - f),
												"L", d + m * o(e / l * f - f),
												b + m * j(e / l * f - f), "Z" ]
									}, true)
								}
							}
						}
						k.sprites = g;
						k.drawLabel();
						if (k.title) {
							k.drawTitle()
						}
					},
					drawTitle : function() {
						var e = this, d = e.chart, a = e.getSurface(), f = d.chartBBox, c = e.titleSprite, b;
						if (!c) {
							e.titleSprite = c = a.add({
								type : "text",
								zIndex : 2
							})
						}
						c.setAttributes(Ext.apply({
							text : e.title
						}, Ext.apply(e.titleStyle.style || {}, e.label || {})),
								true);
						b = c.getBBox();
						c.setAttributes({
							x : f.x + (f.width / 2) - (b.width / 2),
							y : f.y + f.height - (b.height / 2) - 4
						}, true)
					},
					setTitle : function(a) {
						this.title = a;
						this.drawTitle()
					},
					drawLabel : function() {
						var t = this, j = t.chart, n = t.getSurface(), b = j.chartBBox, h = b.x
								+ (b.width / 2), g = b.y + b.height, k = t.margin || 10, d = Math
								.min(b.width, 2 * b.height)
								/ 2 + 2 * k, s = Math.round, l = [], f, q = t.maximum || 0, p = t.steps, o = 0, u, r = Math.PI, c = Math.cos, a = Math.sin, e = t.labelStyle.style, m = e.renderer
								|| function(i) {
									return i
								};
						if (!t.labelArray) {
							for (o = 0; o <= p; o++) {
								u = (o === 0 || o === p) ? 7 : 0;
								f = n.add({
									type : "text",
									text : m(s(o / p * q)),
									x : h + d * c(o / p * r - r),
									y : g + d * a(o / p * r - r) - u,
									"text-anchor" : "middle",
									"stroke-width" : 0.2,
									zIndex : 10,
									stroke : "#333"
								});
								f.setAttributes(Ext.apply(t.labelStyle.style
										|| {}, {
									hidden : false
								}), true);
								l.push(f)
							}
						} else {
							l = t.labelArray;
							for (o = 0; o <= p; o++) {
								u = (o === 0 || o === p) ? 7 : 0;
								l[o].setAttributes({
									text : m(s(o / p * q)),
									x : h + d * c(o / p * r - r),
									y : g + d * a(o / p * r - r) - u
								}, true)
							}
						}
						t.labelArray = l
					}
				});
Ext.chart.axis.Numeric = Ext.extend(Ext.chart.axis.Axis, {
	type : "numeric",
	calcLabels : true,
	constructor : function(b) {
		var c = this, a, d;
		Ext.chart.axis.Numeric.superclass.constructor.apply(c, [ b ]);
		a = c.label || {};
		if (c.roundToDecimal === false) {
			return
		}
		if (a.renderer) {
			d = a.renderer;
			a.renderer = function(e) {
				return c.roundToDecimal(d(e), c.decimals)
			}
		} else {
			a.renderer = function(e) {
				return c.roundToDecimal(e, c.decimals)
			}
		}
	},
	roundToDecimal : function(a, c) {
		var b = Math.pow(10, c || 0);
		return ((a * b) >> 0) / b
	},
	minimum : NaN,
	maximum : NaN,
	decimals : 2,
	scale : "linear",
	position : "left",
	adjustMaximumByMajorUnit : false,
	adjustMinimumByMajorUnit : false,
	applyData : function() {
		Ext.chart.axis.Numeric.superclass.applyData.apply(this, arguments);
		return this.calcEnds()
	}
});
Ext.chart.axis.Radial = Ext
		.extend(
				Ext.chart.axis.Abstract,
				{
					position : "radial",
					rotation : 0,
					drawAxis : function(r) {
						var u = this, k = u.chart, n = u.getSurface(), b = k.chartBBox, f = k.store, p = f
								.getCount(), j = b.x + (b.width / 2), h = b.y
								+ (b.height / 2), e = Math, w = e.max, d = e
								.min(b.width, b.height) / 2, g = [], m, s = u.steps, o = -u.rotation, v = Ext.draw.Draw.rad, c = e.cos, a = e.sin, q, t;
						if (!p) {
							n.items.hide(true);
							return
						}
						u.updateSurfaceBox();
						u.centerX = j;
						u.centerY = h;
						if (!u.sprites) {
							for (q = 1; q <= s; q++) {
								m = n.add(Ext.apply(u.style || {}, {
									type : "circle",
									x : j,
									y : h,
									"stroke-width" : 1.5,
									radius : w(d * q / s, 0),
									stroke : "#ccc"
								}));
								m.setAttributes({
									hidden : false
								}, true);
								g.push(m)
							}
							f.each(function(x, l) {
								t = v(o + l / p * 360);
								m = n.add(Ext.apply(u.style || {}, {
									type : "path",
									path : [ "M", j, h, "L", j + d * c(t),
											h + d * a(t), "Z" ]
								}));
								m.setAttributes({
									hidden : false
								}, true);
								g.push(m)
							})
						} else {
							g = u.sprites;
							for (q = 0; q < s; q++) {
								g[q].setAttributes({
									hidden : false,
									x : j,
									y : h,
									radius : w(d * (q + 1) / s, 0)
								}, true)
							}
							f.each(function(l, i) {
								t = v(o + i / p * 360);
								g[q + i].setAttributes(Ext.apply(u.style || {},
										{
											hidden : false,
											path : [ "M", j, h, "L",
													j + d * c(t), h + d * a(t),
													"Z" ]
										}), true)
							})
						}
						u.sprites = g;
						u.drawLabel()
					},
					drawLabel : function() {
						var J = this, s = J.chart, y = J.getSurface(), c = s.chartBBox, h = s.store, m = J.centerX, l = J.centerY, f = Math
								.min(c.width, c.height) / 2, D = Math.max, H = Math.round, t = [], k, w = [], d, x = [], g, u = !J.maximum, G = J.maximum || 0, E = J.steps, C = 0, B, p, o, z = -J.rotation, I = Ext.draw.Draw.rad, e = Math.cos, b = Math.sin, A = J.label.display, n = A !== "none", v = J.labelGroup, a = J.labelStyle.style, q = Ext
								.apply({}, a), r = 10, F;
						if (!n) {
							return
						}
						s.series.each(function(i) {
							w.push(i.yField);
							g = i.xField
						});
						h.each(function(j, K) {
							if (u) {
								for (K = 0, d = w.length; K < d; K++) {
									G = D(+j.get(w[K]), G)
								}
							}
							x.push(j.get(g))
						});
						if (!J.labelArray) {
							if (A != "categories") {
								for (C = 1; C <= E; C++) {
									k = y.add({
										group : v,
										type : "text",
										text : H(C / E * G),
										x : m,
										y : l - f * C / E
									});
									if (a) {
										k.setAttributes(a, true)
									}
									t.push(k)
								}
							}
							if (A != "scale") {
								delete q.translate;
								for (B = 0, E = x.length; B < E; B++) {
									F = I(z + B / E * 360);
									p = e(F) * (f + r);
									o = b(F) * (f + r);
									k = y
											.add({
												group : v,
												type : "text",
												text : x[B],
												x : m + p,
												y : l + o,
												"text-anchor" : p * p <= 0.001 ? "middle"
														: (p < 0 ? "end"
																: "start")
											});
									if (a) {
										k.setAttributes(q, true)
									}
									t.push(k)
								}
							}
						} else {
							t = J.labelArray;
							if (A != "categories") {
								for (C = 0; C < E; C++) {
									t[C].setAttributes({
										text : H((C + 1) / E * G),
										x : m,
										y : l - f * (C + 1) / E,
										hidden : false
									}, true)
								}
							}
							if (A != "scale") {
								for (B = 0, E = x.length; B < E; B++) {
									F = I(z + B / E * 360);
									p = e(F) * (f + r);
									o = b(F) * (f + r);
									if (t[C + B]) {
										t[C + B]
												.setAttributes(
														{
															type : "text",
															text : x[B],
															x : m + p,
															y : l + o,
															"text-anchor" : p
																	* p <= 0.001 ? "middle"
																	: (p < 0 ? "end"
																			: "start"),
															hidden : false
														}, true)
									}
								}
							}
						}
						J.labelArray = t
					},
					getSurface : function() {
						return this.chart.getSurface("main")
					},
					reset : function() {
						this.rotation = 0;
						Ext.chart.axis.Radial.superclass.reset.call(this)
					}
				});
Ext.chart.axis.Time = Ext
		.extend(
				Ext.chart.axis.Category,
				{
					calculateByLabelSize : true,
					dateFormat : false,
					groupBy : "year,month,day",
					aggregateOp : "sum",
					fromDate : false,
					toDate : false,
					step : [ Date.DAY, 1 ],
					constrain : false,
					dateMethods : {
						year : function(a) {
							return a.getFullYear()
						},
						month : function(a) {
							return a.getMonth() + 1
						},
						day : function(a) {
							return a.getDate()
						},
						hour : function(a) {
							return a.getHours()
						},
						minute : function(a) {
							return a.getMinutes()
						},
						second : function(a) {
							return a.getSeconds()
						},
						millisecond : function(a) {
							return a.getMilliseconds()
						}
					},
					aggregateFn : (function() {
						var a = (function() {
							var b = /^\[object\s(.*)\]$/, c = Object.prototype.toString;
							return function(d) {
								return c.call(d).match(b)[1]
							}
						})();
						return {
							sum : function(d) {
								var c = 0, b = d.length, e = 0;
								if (!d.length || a(d[0]) != "Number") {
									return d[0]
								}
								for (; c < b; c++) {
									e += d[c]
								}
								return e
							},
							max : function(b) {
								if (!b.length || a(b[0]) != "Number") {
									return b[0]
								}
								return Math.max.apply(Math, b)
							},
							min : function(b) {
								if (!b.length || a(b[0]) != "Number") {
									return b[0]
								}
								return Math.min.apply(Math, b)
							},
							avg : function(d) {
								var c = 0, b = d.length, e = 0;
								if (!d.length || a(d[0]) != "Number") {
									return d[0]
								}
								for (; c < b; c++) {
									e += d[c]
								}
								return e / b
							}
						}
					})(),
					constrainDates : function() {
						var f = Ext.Date.clone(this.fromDate), d = Ext.Date
								.clone(this.toDate), b = this.step, e = this.fields, g = e.length ? e[0]
								: e, i = this.chart.store, a = new Ext.data.Store(
								{
									model : i.model
								}), c, h;
						var j = (function() {
							var m = 0, k = i.getCount();
							return function(n) {
								var o, l;
								for (; m < k; m++) {
									o = i.getAt(m);
									l = o.get(g);
									if (+l > +n) {
										return false
									} else {
										if (+l == +n) {
											return o
										}
									}
								}
								return false
							}
						})();
						if (!this.constrain) {
							this.chart.filteredStore = this.chart.store;
							return
						}
						while (+f <= +d) {
							c = j(f);
							h = {};
							if (c) {
								a.add(c.data)
							} else {
								a.model.prototype.fields.each(function(k) {
									h[k.name] = false
								});
								h.date = f;
								a.add(h)
							}
							f = Ext.Date.add(f, b[0], b[1])
						}
						this.chart.filteredStore = a
					},
					aggregate : function() {
						var r = {}, n = [], t, m, h = this.aggregateOp, a = this.fields, p, k = this.groupBy
								.split(","), c, s = [], d = 0, j, e = [], q = [], o = k.length, b = this.dateMethods, g = this.aggregateFn, f = this.chart.filteredStore
								|| this.chart.store;
						a = a.length ? a[0] : a;
						f.each(function(i) {
							if (!s.length) {
								i.fields.each(function(l) {
									s.push(l.name)
								});
								d = s.length
							}
							m = i.get(a);
							for (p = 0; p < o; p++) {
								if (p == 0) {
									t = String(b[k[p]](m))
								} else {
									t += "||" + b[k[p]](m)
								}
							}
							if (t in r) {
								j = r[t]
							} else {
								j = r[t] = {};
								n.push(t);
								e.push(m)
							}
							for (p = 0; p < d; p++) {
								c = s[p];
								if (!j[c]) {
									j[c] = []
								}
								if (i.get(c) !== undefined) {
									j[c].push(i.get(c))
								}
							}
						});
						for (t in r) {
							j = r[t];
							for (p = 0; p < d; p++) {
								c = s[p];
								j[c] = g[h](j[c])
							}
							q.push(j)
						}
						this.chart.substore = new Ext.data.JsonStore({
							fields : s,
							data : q
						});
						this.dates = e
					},
					setLabels : function() {
						var c = this, b = c.chart.substore, a = c.fields, e = c.dateFormat, d = c.dates, f;
						c.labels = f = [];
						b.each(function(g, h) {
							if (!e) {
								f.push(g.get(a))
							} else {
								f.push(d[h].format(e))
							}
						}, c)
					},
					processView : function() {
						if (this.constrain) {
							this.constrainDates();
							this.aggregate();
							this.chart.substore = this.chart.filteredStore
						} else {
							this.aggregate()
						}
					},
					applyData : function() {
						this.setLabels();
						var a = this.chart.substore.getCount();
						return {
							from : 0,
							to : Math.max(a - 1, 0),
							steps : a - 1,
							step : 1
						}
					}
				});
Ext.ns("Ext.chart.series");
(function() {
	function a(b) {
		return function(f) {
			var d = this, c = d.itemForEvent(f);
			if (c) {
				d.fireEvent(b, d, c, f)
			}
		}
	}
	Ext.chart.series.ItemEvents = Ext.extend(Object, {
		constructor : function() {
			var b = this, c = Ext.chart.series.ItemEvents.itemEventNames;
			b.addEvents.apply(b, c);
			b.enableBubble(c)
		},
		initEvents : function() {
			var b = this;
			b.chart.on({
				scope : b,
				mousemove : b.onMouseMove,
				mouseup : b.onMouseUp,
				mousedown : b.onMouseDown,
				click : b.onClick,
				doubleclick : b.onDoubleClick,
				tap : b.onTap,
				tapstart : b.onTapStart,
				tapend : b.onTapEnd,
				tapcancel : b.onTapCancel,
				taphold : b.onTapHold,
				doubletap : b.onDoubleTap,
				singletap : b.onSingleTap,
				touchstart : b.onTouchStart,
				touchmove : b.onTouchMove,
				touchend : b.onTouchEnd,
				dragstart : b.onDragStart,
				drag : b.onDrag,
				dragend : b.onDragEnd,
				pinchstart : b.onPinchStart,
				pinch : b.onPinch,
				pinchend : b.onPinchEnd,
				swipe : b.onSwipe
			})
		},
		itemForEvent : function(d) {
			var b = this, c = b.chart.getEventXY(d);
			return b.getItemForPoint(c[0], c[1])
		},
		getBubbleTarget : function() {
			return this.chart
		},
		onMouseMove : function(f) {
			var d = this, c = d.lastOverItem, b = d.itemForEvent(f);
			if (c && b !== c) {
				d.fireEvent("itemmouseout", d, c, f);
				delete d.lastOverItem
			}
			if (b) {
				d.fireEvent("itemmousemove", d, b, f)
			}
			if (b && b !== c) {
				d.fireEvent("itemmouseover", d, b, f);
				d.lastOverItem = b
			}
		},
		onMouseUp : a("itemmouseup"),
		onMouseDown : a("itemmousedown"),
		onClick : a("itemclick"),
		onDoubleClick : a("itemdoubleclick"),
		onTap : a("itemtap"),
		onTapStart : a("itemtapstart"),
		onTapEnd : a("itemtapend"),
		onTapCancel : a("itemtapcancel"),
		onTapHold : a("itemtaphold"),
		onDoubleTap : a("itemdoubletap"),
		onSingleTap : a("itemsingletap"),
		onTouchStart : a("itemtouchstart"),
		onTouchMove : a("itemtouchmove"),
		onTouchEnd : a("itemtouchend"),
		onDragStart : a("itemdragstart"),
		onDrag : a("itemdrag"),
		onDragEnd : a("itemdragend"),
		onPinchStart : a("itempinchstart"),
		onPinch : a("itempinch"),
		onPinchEnd : a("itempinchend"),
		onSwipe : a("itemswipe")
	});
	Ext.chart.series.ItemEvents.itemEventNames = [ "itemmousemove",
			"itemmouseup", "itemmousedown", "itemmouseover", "itemmouseout",
			"itemclick", "itemdoubleclick", "itemtap", "itemtapstart",
			"itemtapend", "itemtapcancel", "itemtaphold", "itemdoubletap",
			"itemsingletap", "itemtouchstart", "itemtouchmove", "itemtouchend",
			"itemdragstart", "itemdrag", "itemdragend", "itempinchstart",
			"itempinch", "itempinchend", "itemswipe" ]
})();
Ext.ns("Ext.chart.series");
Ext.chart.series.Series = Ext
		.extend(
				Ext.util.Observable,
				{
					type : null,
					title : null,
					showInLegend : true,
					renderer : function(e, a, c, d, b) {
						return c
					},
					shadowAttributes : null,
					triggerAfterDraw : false,
					constructor : function(a) {
						var b = this;
						b.style = {};
						b.themeStyle = {};
						if (a) {
							Ext.apply(b, a)
						}
						b.shadowGroups = [];
						b.markerStyle = new Ext.chart.theme.MarkerStyle();
						b.labelStyle = new Ext.chart.theme.LabelStyle();
						Ext.chart.Label.prototype.constructor.call(b, a);
						Ext.chart.Highlight.prototype.constructor.call(b, a);
						Ext.chart.Callout.prototype.constructor.call(b, a);
						Ext.chart.Transformable.prototype.constructor.call(b);
						Ext.chart.series.ItemEvents.prototype.constructor
								.call(b);
						b.addEvents({
							beforedraw : true,
							draw : true,
							afterdraw : true,
							titlechange : true
						});
						b.initEvents();
						Ext.chart.series.Series.superclass.constructor.call(b,
								a)
					},
					getSurface : function() {
						var b = this, a = b.surface;
						if (!a) {
							a = b.surface = b.chart.getSurface("series"
									+ b.index);
							a.el.setStyle("zIndex",
									b.chart.surfaceZIndexes.series)
						}
						return a
					},
					getOverlaySurface : function() {
						var b = this, a = b.overlaySurface;
						if (!a) {
							a = b.overlaySurface = b.chart
									.getSurface("seriesOverlay" + b.index);
							a.el.setStyle("zIndex",
									b.chart.surfaceZIndexes.overlay)
						}
						return a
					},
					setBBox : function(a) {
						var e = this, c = e.chart, b = c.chartBBox, f = a ? 0
								: c.maxGutter[0], d = a ? 0 : c.maxGutter[1], g, h;
						g = {
							x : 0,
							y : 0,
							width : b.width,
							height : b.height
						};
						e.clipBox = g;
						h = {
							x : ((g.x + f) - (c.zoom.x * c.zoom.width))
									* e.zoomX,
							y : ((g.y + d) - (c.zoom.y * c.zoom.height))
									* e.zoomY,
							width : (g.width - (f * 2)) * c.zoom.width
									* e.zoomX,
							height : (g.height - (d * 2)) * c.zoom.height
									* e.zoomY
						};
						e.bbox = h
					},
					onAnimate : function(b, a) {
						var c = this;
						b.stopAnimation();
						if (c.triggerAfterDraw) {
							return b.animate(Ext.applyIf(a, c.chart.animate))
						} else {
							c.triggerAfterDraw = true;
							return b.animate(Ext.apply(Ext.applyIf(a,
									c.chart.animate), {
								listeners : {
									afteranimate : function() {
										c.triggerAfterDraw = false;
										c.fireEvent("afterrender")
									}
								}
							}))
						}
					},
					getGutters : function() {
						return [ 0, 0 ]
					},
					getItemForPoint : function(a, g) {
						var e = this, b = e.items, f = e.bbox, c, d;
						if (b && b.length && !e.seriesIsHidden
								&& Ext.draw.Draw.withinBox(a, g, f)) {
							a -= e.panX;
							g -= e.panY;
							for (c = 0, d = b.length; c < d; c++) {
								if (b[c] && e.isItemInPoint(a, g, b[c], c)) {
									return b[c]
								}
							}
						}
						return null
					},
					isItemInPoint : function() {
						return false
					},
					hideAll : function() {
						var g = this, f = g.items, k, e, d, c, a, h, b;
						g.seriesIsHidden = true;
						g._prevShowMarkers = g.showMarkers;
						g.showMarkers = false;
						g.hideLabels(0);
						for (d = 0, e = f.length; d < e; d++) {
							k = f[d];
							h = k.sprite;
							if (h) {
								h.setAttributes({
									hidden : true
								}, true);
								if (h.shadows) {
									b = h.shadows;
									for (c = 0, a = b.length; c < a; ++c) {
										b[c].hide(true)
									}
								}
							}
						}
					},
					showAll : function() {
						var a = this, b = a.chart.animate;
						a.chart.animate = false;
						a.seriesIsHidden = false;
						a.showMarkers = a._prevShowMarkers;
						a.drawSeries();
						a.chart.animate = b
					},
					drawSeries : function() {
						this.updateSurfaceBox()
					},
					getLegendLabels : function() {
						var a = this.title;
						return a ? [ a ] : []
					},
					getColorFromStyle : function(a) {
						if (Ext.isObject(a)) {
							return a.stops[0].color
						}
						return a.indexOf("url") == -1 ? a : me
								.getSurface("main")._gradients[a
								.match(/url\(#([^\)]+)\)/)[1]].stops[0].color
					},
					getLegendColor : function(a) {
						var b = this, d, c;
						if (b.style) {
							d = b.style.fill;
							c = b.style.stroke;
							if (d && d != "none") {
								return b.getColorFromStyle(d)
							}
							return b.getColorFromStyle(c)
						}
						return "#000"
					},
					visibleInLegend : function(a) {
						return !this.seriesIsHidden && !this.isExcluded(a)
					},
					setTitle : function(a, d) {
						var c = this, b = c.title;
						if (Ext.isString(a)) {
							d = a;
							a = 0
						}
						if (Ext.isArray(b)) {
							b[a] = d
						} else {
							c.title = d
						}
						c.fireEvent("titlechange", d, a)
					},
					updateSurfaceBox : function() {
						var d = this, a = d.getSurface(), b = d
								.getOverlaySurface(), c = d.chart.chartBBox;
						a.el.setTopLeft(c.y, c.x);
						a.setSize(c.width, c.height);
						b.el.setTopLeft(c.y, c.x);
						b.setSize(c.width, c.height)
					},
					getTransformableSurfaces : function() {
						return [ this.getSurface(), this.getOverlaySurface() ]
					},
					eachRecord : function(c, b) {
						var a = this.chart;
						(a.substore || a.store).each(c, b)
					},
					getRecordCount : function() {
						var b = this.chart, a = b.substore || b.store;
						return a ? a.getCount() : 0
					},
					isExcluded : function(a) {
						var b = this.__excludes;
						return !!(b && b[a])
					},
					combine : function(e, c) {
						var b = this, a = b.combinations
								|| (b.combinations = []), d = b.__excludes;
						a.push([ e, c ]);
						if (d && e < d.length) {
							d.splice(e, 1)
						}
					},
					isCombinedItem : function(a) {
						return this.getCombinationIndexesForItem(a).length > 0
					},
					getCombinationIndexesForItem : function(f) {
						var h = this, j = h.combinations, a = [], c, g, b, e, d;
						if (j) {
							for (c = 0, g = j.length; c < g; c++) {
								b = j[c];
								e = b[0];
								d = b[1];
								if (!a[d]) {
									a[d] = []
								}
								if (a[e]) {
									a[d] = a[d].concat(a[e])
								}
								a[d].push(c);
								a.splice(e, 1)
							}
						}
						return a[f] || []
					},
					split : function(f) {
						var h = this, k = h.combinations, l = h.__excludes, e, d, g, a, c, b;
						if (k) {
							a = h.getCombinationIndexesForItem(f);
							if (a) {
								for (e = a.length; e--;) {
									b = k[a[e]][0];
									for (d = a[e] + 1, g = k.length; d < g; d++) {
										if (b <= k[d][0]) {
											k[d][0]++
										}
										if (b <= k[d][1]) {
											k[d][1]++
										}
									}
									k.splice(a[e], 1);
									if (l) {
										l.splice(b, 0, false)
									}
								}
							}
							h.clearCombinations();
							for (e = 0, g = k.length; e < g; e++) {
								c = k[e];
								h.combine(c[0], c[1])
							}
						}
					},
					clearCombinations : function() {
						delete this.combinations
					},
					reset : function() {
						var a = this;
						a.unHighlightItem();
						a.cleanHighlights();
						a.clearTransform()
					},
					ownerCt : null,
					getItemId : function() {
						return this.el && this.el.id || this.id || null
					},
					initCls : function() {
						return (this.cls || "").split(" ")
					},
					isXType : function(a) {
						return a === "series"
					},
					getRefItems : function(a) {
						var c = this, b = [];
						if (c.markerStyle) {
							b.push(c.markerStyle)
						}
						if (c.labelStyle) {
							b.push(c.labelStyle)
						}
						if (c.calloutStyle) {
							b.push(c.calloutStyle)
						}
						if (c.highlightStyle) {
							b.push(c.highlightStyle)
						}
						return b
					}
				});
Ext.applyIf(Ext.chart.series.Series.prototype, Ext.chart.Label.prototype);
Ext.applyIf(Ext.chart.series.Series.prototype, Ext.chart.Highlight.prototype);
Ext.applyIf(Ext.chart.series.Series.prototype, Ext.chart.Callout.prototype);
Ext.applyIf(Ext.chart.series.Series.prototype,
		Ext.chart.Transformable.prototype);
Ext.applyIf(Ext.chart.series.Series.prototype,
		Ext.chart.series.ItemEvents.prototype);
Ext.chart.series.Cartesian = Ext.extend(Ext.chart.series.Series, {
	xField : null,
	yField : null,
	axis : "left",
	getLegendLabels : function() {
		var b = this, c = [], a = b.combinations;
		Ext.each([].concat(b.yField), function(e, d) {
			var f = b.title;
			c.push((Ext.isArray(f) ? f[d] : f) || e)
		});
		if (a) {
			Ext.each(a, function(e) {
				var d = c[e[0]], f = c[e[1]];
				c[e[1]] = d + " & " + f;
				c.splice(e[0], 1)
			})
		}
		return c
	},
	eachYValue : function(a, c, b) {
		Ext.each(this.getYValueAccessors(), function(d, e) {
			c.call(b, d(a), e)
		})
	},
	getYValueCount : function() {
		return this.getYValueAccessors().length
	},
	combine : function(f, e) {
		var d = this, c = d.getYValueAccessors(), b = c[f], a = c[e];
		c[e] = function(g) {
			return b(g) + a(g)
		};
		c.splice(f, 1);
		Ext.chart.series.Cartesian.superclass.combine.call(d, f, e)
	},
	clearCombinations : function() {
		delete this.yValueAccessors;
		Ext.chart.series.Cartesian.superclass.clearCombinations.call(this)
	},
	getYValueAccessors : function() {
		var b = this, a = b.yValueAccessors;
		if (!a) {
			a = b.yValueAccessors = [];
			Ext.each([].concat(b.yField), function(c) {
				a.push(function(d) {
					return d.get(c)
				})
			})
		}
		return a
	},
	getMinMaxXValues : function() {
		var d = this, b, a, c = d.xField;
		if (d.getRecordCount() > 0) {
			b = Infinity;
			a = -b;
			d.eachRecord(function(e) {
				var f = e.get(c);
				if (f > a) {
					a = f
				}
				if (f < b) {
					b = f
				}
			})
		} else {
			b = a = 0
		}
		return [ b, a ]
	},
	getMinMaxYValues : function() {
		var h = this, f = h.stacked, e, c, d, b;
		function g(k, j) {
			if (!h.isExcluded(j)) {
				if (k < 0) {
					b += k
				} else {
					d += k
				}
			}
		}
		function a(k, j) {
			if (!h.isExcluded(j)) {
				if (k > c) {
					c = k
				}
				if (k < e) {
					e = k
				}
			}
		}
		if (h.getRecordCount() > 0) {
			e = Infinity;
			c = -e;
			h.eachRecord(function(i) {
				if (f) {
					d = 0;
					b = 0;
					h.eachYValue(i, g);
					if (d > c) {
						c = d
					}
					if (b < e) {
						e = b
					}
				} else {
					h.eachYValue(i, a)
				}
			})
		} else {
			e = c = 0
		}
		return [ e, c ]
	}
});
Ext.chart.series.Bar = Ext
		.extend(
				Ext.chart.series.Cartesian,
				{
					type : "bar",
					column : false,
					axis : "bottom",
					gutter : 38.2,
					groupGutter : 38.2,
					xPadding : 0,
					yPadding : 10,
					constructor : function(c) {
						Ext.chart.series.Bar.superclass.constructor.apply(this,
								arguments);
						var e = this, a = e.getSurface(), f = e.chart.shadow, d, b;
						Ext.apply(e, c, {
							shadowAttributes : a.getShadowAttributesArray(),
							shadowOptions : Ext.apply(a.getShadowOptions(),
									f === true ? {} : (f || {}))
						});
						e.group = a.getGroup(e.seriesId + "-bars");
						if (f) {
							for (d = 0, b = e.shadowAttributes.length; d < b; d++) {
								e.shadowGroups.push(a.getGroup(e.seriesId
										+ "-shadows" + d))
							}
						}
						e.initialStacked = e.stacked
					},
					getBarGirth : function() {
						var c = this, a = c.column, b = c.getRecordCount(), d = c.gutter / 100;
						return (c.chart.chartBBox[a ? "width" : "height"] - c[a ? "xPadding"
								: "yPadding"] * 2)
								/ (b * (d + 1) - d)
					},
					getGutters : function() {
						var b = this, a = b.column, c = Math
								.ceil((a ? b.xPadding : b.yPadding)
										+ b.getBarGirth() / 2);
						return a ? [ c, 0 ] : [ 0, c ]
					},
					getBounds : function() {
						var B = this, r = B.chart, c = B.getYValueCount(), z = c, k = B.groupGutter / 100, g = B.column, m = B.zoomX, l = B.zoomY, p = B.xPadding
								* m, b = B.yPadding * l, x = B.stacked, h = B.disjointStacked, q = B
								.getBarGirth()
								* (g ? m : l), i = Math, E = i.max, v = i.abs, A, a, y, w, e, t, C, o, D, s, u, d, f;
						B.setBBox(true);
						a = B.bbox;
						for (s = 0, D = c; s < D; s++) {
							if (B.isExcluded(s)) {
								z--
							}
						}
						if (B.axis) {
							e = r.axes.get(B.axis);
							if (e) {
								t = e.calcEnds();
								y = t.from;
								w = t.to
							}
						}
						if (B.yField && !Ext.isNumber(y)) {
							e = new Ext.chart.axis.Axis({
								chart : r,
								fields : [].concat(B.yField)
							});
							t = e.calcEnds();
							y = t.from;
							w = t.to
						}
						if (!Ext.isNumber(y)) {
							y = 0
						}
						if (!Ext.isNumber(w)) {
							w = 0
						}
						C = (g ? a.height - b * 2 : a.width - p * 2) / (w - y);
						A = q / ((x && !h ? 1 : z) * (k + 1) - k);
						o = (g) ? a.y + a.height - b : a.x + p;
						function n(F, j) {
							if (!B.isExcluded(j)) {
								D[F > 0 ? 1 : 0][f] += v(F)
							}
						}
						if (x) {
							D = [ [], [] ];
							B.eachRecord(function(j, F) {
								D[0][F] = D[0][F] || 0;
								D[1][F] = D[1][F] || 0;
								f = F;
								B.eachYValue(j, n)
							});
							D[+(w > 0)].push(v(w));
							D[+(y > 0)].push(v(y));
							d = E.apply(i, D[0]);
							u = E.apply(i, D[1]);
							C = (g ? a.height - b * 2 : a.width - p * 2)
									/ (u + d);
							o = o + d * C * (g ? -1 : 1)
						} else {
							if (y / w < 0) {
								o = o - y * C * (g ? -1 : 1)
							}
						}
						return {
							bbox : a,
							barsLen : c,
							visibleBarsLen : z,
							barWidth : q,
							groupBarWidth : A,
							scale : C,
							zero : o,
							xPadding : p,
							yPadding : b,
							signed : y / w < 0,
							minY : y,
							maxY : w
						}
					},
					getPaths : function() {
						var s = this, O = s.chart, C = s.bounds = s.getBounds(), w = s.items = [], i = s.gutter / 100, c = s.groupGutter / 100, M = O.animate, I = s.column, u = s.group, j = O.shadow, K = s.shadowGroups, n = K.length, v = C.bbox, k = s.xPadding
								* s.zoomX, o = s.yPadding * s.zoomY, L = s.stacked, y = s.disjointStacked, t = C.barsLen, J = s.colorArrayStyle, g = J
								&& J.length || 0, z = Math, l = z.max, r = z.abs, A = s
								.getRecordCount(), d, F, B, a, h, q, p, m, f, e, D, x, G, E, N, b;
						function H(Q, P) {
							if (s.isExcluded(P)) {
								return
							}
							d = Math.round(Q * C.scale);
							p = {
								fill : J[(t > 1 ? P : 0) % g]
							};
							if (I) {
								Ext.apply(p, {
									height : d,
									width : l(C.groupBarWidth, 0),
									x : (v.x + k + N * C.barWidth * (1 + i) + f
											* C.groupBarWidth * (1 + c)
											* (!L || y ? 1 : 0)),
									y : a - d
								})
							} else {
								G = (A - 1) - N;
								Ext.apply(p, {
									height : l(C.groupBarWidth, 0),
									width : d + (a == C.zero),
									x : a + (a != C.zero),
									y : (v.y + o + G * C.barWidth * (1 + i) + f
											* C.groupBarWidth * (1 + c)
											* (!L || y ? 1 : 0) + 1)
								})
							}
							if (d < 0) {
								if (I) {
									p.y = h;
									p.height = r(d)
								} else {
									p.x = h + d;
									p.width = r(d)
								}
							}
							if (L) {
								if (d < 0) {
									h += d * (I ? -1 : 1)
								} else {
									a += d * (I ? -1 : 1)
								}
								F += r(d);
								if (d < 0) {
									B += r(d)
								}
							}
							p.x = Math.floor(p.x) + 1;
							E = Math.floor(p.y);
							if (!Ext.isIE9 && p.y > E) {
								E--
							}
							p.y = E;
							p.width = Math.floor(p.width);
							p.height = Math.floor(p.height);
							w.push({
								series : s,
								storeItem : b,
								value : [ b.get(s.xField), Q ],
								attr : p,
								point : I ? [ p.x + p.width / 2,
										Q >= 0 ? p.y : p.y + p.height ] : [
										Q >= 0 ? p.x + p.width : p.x,
										p.y + p.height / 2 ]
							});
							if (M && O.resizing) {
								m = I ? {
									x : p.x,
									y : C.zero,
									width : p.width,
									height : 0
								} : {
									x : C.zero,
									y : p.y,
									width : 0,
									height : p.height
								};
								if (j && (L && !q || !L)) {
									q = true;
									for (e = 0; e < n; e++) {
										D = K[e].getAt(L ? N : (N * t + P));
										if (D) {
											D.setAttributes(m, true)
										}
									}
								}
								x = u.getAt(N * t + P);
								if (x) {
									x.setAttributes(m, true)
								}
							}
							f++
						}
						s.eachRecord(function(P, Q) {
							a = h = C.zero;
							F = 0;
							B = 0;
							q = false;
							f = 0;
							b = P;
							N = Q;
							s.eachYValue(P, H);
							if (L && w.length) {
								w[Q * f].totalDim = F;
								w[Q * f].totalNegDim = B
							}
						}, s)
					},
					renderShadows : function(t, u, x, k) {
						var y = this, o = y.chart, r = y.getSurface(), f = o.animate, w = y.stacked, a = y.shadowGroups, v = y.shadowAttributes, n = a.length, g = o.substore
								|| o.store, d = y.column, q = y.items, b = [], l = k.zero, e, p, h, z, m, s, c;
						if ((w && (t % k.visibleBarsLen === 0)) || !w) {
							s = t / k.visibleBarsLen;
							for (e = 0; e < n; e++) {
								p = Ext.apply({}, v[e]);
								h = a[e].getAt(w ? s : t);
								p.x = u.x;
								p.y = u.y;
								p.width = u.width;
								p.height = u.height;
								if (!h) {
									h = r.add(Ext.apply({
										type : "rect",
										group : a[e]
									}, Ext.apply({}, x, p)))
								}
								if (w) {
									z = q[t].totalDim;
									m = q[t].totalNegDim;
									if (d) {
										p.y = l - m;
										p.height = z
									} else {
										p.x = l - m;
										p.width = z
									}
								}
								if (f) {
									if (!w) {
										c = y.renderer(h, g.getAt(s), p, t, g);
										y.onAnimate(h, {
											to : c
										})
									} else {
										c = y.renderer(h, g.getAt(s), Ext
												.apply(p, {
													hidden : true
												}), t, g);
										h.setAttributes(c, true)
									}
								} else {
									c = y.renderer(h, g.getAt(s), Ext.apply(p,
											{
												hidden : false
											}), t, g);
									h.setAttributes(c, true)
								}
								b.push(h)
							}
						}
						return b
					},
					drawSeries : function() {
						var C = this, q = C.chart, l = q.substore || q.store, u = C
								.getSurface(), h = q.animate, z = C.stacked, d = C.column, b = q.shadow, a = C.shadowGroups, p = a.length, n = C.group, f = C.style, r, o, x, w, B, s, c, e, g, m, k, y, t, v, A;
						if (C.fireEvent("beforedraw", C) === false) {
							return
						}
						Ext.chart.series.Bar.superclass.drawSeries.call(this);
						if (!C.getRecordCount()) {
							u.items.hide(true);
							return
						}
						delete f.fill;
						C.unHighlightItem();
						C.cleanHighlights();
						C.getPaths();
						m = C.bounds;
						r = C.items;
						B = d ? {
							y : m.zero,
							height : 0
						} : {
							x : m.zero,
							width : 0
						};
						o = r.length;
						for (x = 0; x < o; x++) {
							A = r[x];
							s = n.getAt(x);
							y = A.attr;
							if (b) {
								A.shadows = C.renderShadows(x, y, B, m)
							}
							if (!s) {
								t = Ext.apply({}, B, y);
								t = Ext.apply(t, k || {});
								if (b) {
									Ext.apply(t, C.shadowOptions)
								}
								s = u.add(Ext.apply({}, {
									type : "rect",
									group : n
								}, t))
							}
							if (h) {
								c = C.renderer(s, l.getAt(x), y, x, l);
								s._to = c;
								v = C.onAnimate(s, {
									to : Ext.apply(c, k)
								});
								if (b && z && (x % m.barsLen === 0)) {
									w = x / m.barsLen;
									for (e = 0; e < p; e++) {
										v.on("afteranimate", function() {
											this.show(true)
										}, a[e].getAt(w))
									}
								}
							} else {
								c = C.renderer(s, l.getAt(x), Ext.apply(y, {
									hidden : false
								}), x, l);
								s.setAttributes(Ext.apply(c, k), true)
							}
							A.sprite = s
						}
						o = n.getCount();
						for (w = x; w < o; w++) {
							n.getAt(w).hide(true)
						}
						if (b) {
							for (e = 0; e < p; e++) {
								g = a[e];
								o = g.getCount();
								for (w = x; w < o; w++) {
									g.getAt(w).hide(true)
								}
							}
						}
						C.renderLabels();
						C.fireEvent("draw", C)
					},
					onCreateLabel : function(e, k, d, f) {
						var g = this, a = g.getSurface(), j = g.labelsGroup, b = g.label, c = Ext
								.apply({}, b, g.labelStyle.style || {}), h;
						return a.add(Ext.apply({
							type : "text",
							group : j
						}, c || {}))
					},
					onPlaceLabel : function(F, M, r, I, o, G, H, u) {
						var l = this, m = l.bounds, d = m.groupBarWidth, E = l.column, K = l.chart, t = K.chartBBox, z = K.resizing, n = r.value[0], N = r.value[1], k = r.attr, w = Ext
								.apply(l.labelStyle.style || {}, l.label || {}), J = w.orientation == "vertical", g = []
								.concat(w.field), s = w.renderer, q = s(M
								.get(g[u])), f = l.getLabelSize(q), a = f.width, c = f.height, b = m.zero, h = "outside", p = "insideStart", L = "insideEnd", D = 10, B = 6, e = m.signed, C, A, v;
						F.setAttributes({
							text : q
						});
						F.isOutside = false;
						if (E) {
							if (o == h) {
								if (c + B + k.height > (N >= 0 ? b : t.height
										- b)) {
									o = L
								}
							} else {
								if (c + B > k.height) {
									o = h;
									F.isOutside = true
								}
							}
							C = k.x + d / 2;
							A = o == p ? (b + ((c / 2 + 3) * (N >= 0 ? -1 : 1)))
									: (N >= 0 ? (k.y + ((c / 2 + 3) * (o == h ? -1
											: 1)))
											: (k.y + k.height + ((c / 2 + 3) * (o === h ? 1
													: -1))))
						} else {
							if (o == h) {
								if (a + D + k.width > (N >= 0 ? t.width - b : b)) {
									o = L
								}
							} else {
								if (a + D > k.width) {
									o = h;
									F.isOutside = true
								}
							}
							C = o == p ? (b + ((a / 2 + 5) * (N >= 0 ? 1 : -1)))
									: (N >= 0 ? (k.x + k.width + ((a / 2 + 5) * (o === h ? 1
											: -1)))
											: (k.x + ((a / 2 + 5) * (o === h ? -1
													: 1))));
							A = k.y + d / 2
						}
						v = {
							x : C,
							y : A
						};
						if (J) {
							v.rotate = {
								x : C,
								y : A,
								degrees : 270
							}
						}
						if (G && z) {
							if (E) {
								C = k.x + k.width / 2;
								A = b
							} else {
								C = b;
								A = k.y + k.height / 2
							}
							F.setAttributes({
								x : C,
								y : A
							}, true);
							if (J) {
								F.setAttributes({
									rotate : {
										x : C,
										y : A,
										degrees : 270
									}
								}, true)
							}
						}
						if (G) {
							l.onAnimate(F, {
								to : v
							})
						} else {
							F.setAttributes(Ext.apply(v, {
								hidden : false
							}), true)
						}
					},
					getLabelSize : function(f) {
						var j = this.testerLabel, a = this.label, d = Ext
								.apply({}, a, this.labelStyle.style || {}), b = a.orientation === "vertical", i, g, e, c;
						if (!j) {
							j = this.testerLabel = this.getSurface().add(
									Ext.apply({
										type : "text",
										opacity : 0
									}, d))
						}
						j.setAttributes({
							text : f
						}, true);
						i = j.getBBox();
						g = i.width;
						e = i.height;
						return {
							width : b ? e : g,
							height : b ? g : e
						}
					},
					onAnimate : function(b, a) {
						b.show();
						Ext.chart.series.Bar.superclass.onAnimate.apply(this,
								arguments)
					},
					isItemInPoint : function(a, d, b) {
						var c = b.sprite.getBBox();
						return c.x <= a && c.y <= d && (c.x + c.width) >= a
								&& (c.y + c.height) >= d
					},
					hideAll : function() {
						var a = this.chart.axes;
						if (!isNaN(this._index)) {
							if (!this.__excludes) {
								this.__excludes = []
							}
							this.__excludes[this._index] = true;
							this.drawSeries();
							a.each(function(b) {
								b.drawAxis()
							})
						}
					},
					showAll : function() {
						var a = this.chart.axes;
						if (!isNaN(this._index)) {
							if (!this.__excludes) {
								this.__excludes = []
							}
							this.__excludes[this._index] = false;
							this.drawSeries();
							a.each(function(b) {
								b.drawAxis()
							})
						}
					},
					getLegendColor : function(b) {
						var c = this, a = c.colorArrayStyle;
						return c.getColorFromStyle(a[b % a.length])
					},
					highlightItem : function(a) {
						Ext.chart.series.Bar.superclass.highlightItem.apply(
								this, arguments);
						this.renderLabels()
					},
					unHighlightItem : function() {
						Ext.chart.series.Bar.superclass.unHighlightItem.apply(
								this, arguments);
						this.renderLabels()
					},
					cleanHighlights : function() {
						Ext.chart.series.Bar.superclass.cleanHighlights.apply(
								this, arguments);
						this.renderLabels()
					},
					reset : function() {
						var a = this;
						a.stacked = a.initialStacked;
						Ext.chart.series.Bar.superclass.reset.call(a)
					}
				});
Ext.chart.series.Column = Ext.extend(Ext.chart.series.Bar, {
	type : "column",
	column : true,
	axis : "left",
	xPadding : 10,
	yPadding : 0
});
Ext.chart.series.Gauge = Ext
		.extend(
				Ext.chart.series.Series,
				{
					type : "gauge",
					rad : Math.PI / 180,
					angleField : false,
					needle : false,
					donut : false,
					showInLegend : false,
					constructor : function(c) {
						Ext.chart.series.Gauge.superclass.constructor.apply(
								this, arguments);
						var f = this, e = f.chart, a = f.getSurface(), g = e.shadow, d, b;
						Ext.apply(f, c, {
							shadowAttributes : a.getShadowAttributesArray(),
							shadowOptions : a.getShadowOptions()
						});
						f.group = a.getGroup(f.seriesId);
						if (g) {
							for (d = 0, b = f.shadowAttributes.length; d < b; d++) {
								f.shadowGroups.push(a.getGroup(f.seriesId
										+ "-shadows" + d))
							}
						}
						a.customAttributes.segment = function(h) {
							return f.getSegment(h)
						}
					},
					initialize : function() {
						var a = this;
						a.yField = [];
						if (a.label.field) {
							a.eachRecord(function(b) {
								a.yField.push(b.get(a.label.field))
							})
						}
					},
					getSegment : function(b) {
						var C = this, B = C.rad, d = Math.cos, a = Math.sin, l = Math.abs, j = C.centerX, h = C.centerY, w = 0, v = 0, u = 0, s = 0, g = 0, f = 0, e = 0, c = 0, z = 0.01, r = b.startAngle, p = b.endAngle, i = (r + p)
								/ 2 * B, k = b.margin || 0, t = l(p - r) > 180, m = l(p % 360), q = m > 90
								&& m < 270, D = Math.min(r, p) * B, A = Math
								.max(r, p)
								* B, n = false, o = false;
						j += k * d(i);
						h += k * a(i);
						w = j + b.startRho * d(D);
						g = h + b.startRho * a(D);
						v = j + b.endRho * d(D);
						f = h + b.endRho * a(D);
						u = j + b.startRho * d(A);
						e = h + b.startRho * a(A);
						s = j + b.endRho * d(A);
						c = h + b.endRho * a(A);
						if (l(w - u) <= z && l(g - e) <= z) {
							n = true
						}
						o = n && (l(v - s) <= z && l(f - c) <= z);
						if (o) {
							return {
								path : [
										[ "M", s, c - 0.0001 ],
										[ "A", b.endRho, b.endRho, 0, +t, +q,
												s, c ], [ "Z" ] ]
							}
						} else {
							if (n) {
								return {
									path : [
											[ "M", w, g ],
											[ "L", v, f ],
											[ "A", b.endRho, b.endRho, 0, +t,
													1, s, c ], [ "Z" ] ]
								}
							} else {
								return {
									path : [
											[ "M", w, g ],
											[ "L", v, f ],
											[ "A", b.endRho, b.endRho, 0, +t,
													1, s, c ],
											[ "M", s, c ],
											[ "L", u, e ],
											[ "A", b.startRho, b.startRho, 0,
													+t, 0, w, g ], [ "Z" ] ]
								}
							}
						}
					},
					calcMiddle : function(m) {
						var h = this, i = h.rad, l = m.slice, k = h.centerX, j = h.centerY, g = l.startAngle, e = l.endAngle, b = Math
								.min(g, e)
								* i, a = Math.max(g, e) * i, d = -(b + (a - b) / 2), f = k
								+ (m.endRho + m.startRho) / 2 * Math.cos(d), c = j
								- (m.endRho + m.startRho) / 2 * Math.sin(d);
						m.middle = {
							x : f,
							y : c
						}
					},
					drawSeries : function() {
						var r = this, M = r.chart, a = M.substore || M.store, t = r.group, K = r.chart.animate, x = r.chart.axes
								.get(0), y = x && x.minimum || r.minimum || 0, C = x
								&& x.maximum || r.maximum || 0, j = r.angleField
								|| r.field || r.xField, E = r.getSurface(), B = M.chartBBox, b = +r.donut, v = [], h = r.style, e = r.colorArrayStyle, s = e
								&& e.length || 0, f = Math.cos, m = Math.sin, g = !!M.shadow, n, d, c, q, l, w, G, z, A, D, L, I, J, k, u, o, H, F;
						if (r.fireEvent("beforedraw", r) === false) {
							return
						}
						Ext.chart.series.Gauge.superclass.drawSeries.call(this);
						r.setBBox();
						u = r.bbox;
						if (r.colorSet) {
							e = r.colorSet;
							s = e.length
						}
						if (!r.getRecordCount()) {
							E.items.hide(true);
							return
						}
						d = r.centerX = (B.width / 2);
						c = r.centerY = B.height;
						r.radius = Math.min(d, c);
						r.slices = l = [];
						r.items = v = [];
						if (!r.value) {
							D = a.getAt(0);
							r.value = D.get(j)
						}
						G = r.value;
						if (r.needle) {
							H = {
								series : r,
								value : G,
								startAngle : -180,
								endAngle : 0,
								rho : r.radius
							};
							o = -180 * (1 - (G - y) / (C - y));
							l.push(H)
						} else {
							o = -180 * (1 - (G - y) / (C - y));
							H = {
								series : r,
								value : G,
								startAngle : -180,
								endAngle : o,
								rho : r.radius
							};
							F = {
								series : r,
								value : r.maximum - G,
								startAngle : o,
								endAngle : 0,
								rho : r.radius
							};
							l.push(H, F)
						}
						for (L = 0, A = l.length; L < A; L++) {
							q = l[L];
							w = t.getAt(L);
							n = Ext.apply({
								segment : {
									startAngle : q.startAngle,
									endAngle : q.endAngle,
									margin : 0,
									rho : q.rho,
									startRho : q.rho * +b / 100,
									endRho : q.rho
								}
							}, Ext.apply(h, e && {
								fill : e[L % s]
							} || {}));
							z = Ext.apply({}, n.segment, {
								slice : q,
								series : r,
								storeItem : D,
								index : L
							});
							v[L] = z;
							if (!w) {
								k = Ext.apply({
									type : "path",
									group : t
								}, Ext.apply(h, e && {
									fill : e[L % s]
								} || {}));
								if (g) {
									Ext.apply(k, r.shadowOptions)
								}
								w = E.add(Ext.apply(k, n))
							}
							q.sprite = q.sprite || [];
							z.sprite = w;
							q.sprite.push(w);
							if (K) {
								n = r.renderer(w, D, n, L, a);
								w._to = n;
								r.onAnimate(w, {
									to : n
								})
							} else {
								n = r.renderer(w, D, Ext.apply(n, {
									hidden : false
								}), L, a);
								w.setAttributes(n, true)
							}
						}
						if (r.needle) {
							o = o * Math.PI / 180;
							if (!r.needleSprite) {
								r.needleSprite = r
										.getSurface()
										.add(
												{
													type : "path",
													path : [
															"M",
															d
																	+ (r.radius
																			* +b / 100)
																	* f(o),
															c
																	+ -Math
																			.abs((r.radius
																					* +b / 100)
																					* m(o)),
															"L",
															d + r.radius * f(o),
															c
																	+ -Math
																			.abs(r.radius
																					* m(o)) ],
													"stroke-width" : 4,
													stroke : "#222"
												})
							} else {
								if (K) {
									r
											.onAnimate(
													r.needleSprite,
													{
														to : {
															path : [
																	"M",
																	d
																			+ (r.radius
																					* +b / 100)
																			* f(o),
																	c
																			+ -Math
																					.abs((r.radius
																							* +b / 100)
																							* m(o)),
																	"L",
																	d
																			+ r.radius
																			* f(o),
																	c
																			+ -Math
																					.abs(r.radius
																							* m(o)) ]
														}
													})
								} else {
									r.needleSprite
											.setAttributes({
												type : "path",
												path : [
														"M",
														d
																+ (r.radius
																		* +b / 100)
																* f(o),
														c
																+ -Math
																		.abs((r.radius
																				* +b / 100)
																				* m(o)),
														"L",
														d + r.radius * f(o),
														c
																+ -Math
																		.abs(r.radius
																				* m(o)) ]
											})
								}
							}
							r.needleSprite.setAttributes({
								hidden : false
							}, true)
						}
						delete r.value;
						r.fireEvent("draw", r)
					},
					setValue : function(a) {
						this.value = a;
						this.drawSeries()
					},
					onCreateLabel : Ext.emptyFn,
					onPlaceLabel : Ext.emptyFn,
					onPlaceCallout : Ext.emptyFn,
					onAnimate : function(b, a) {
						b.show();
						Ext.chart.series.Gauge.superclass.onAnimate.apply(this,
								arguments)
					},
					isItemInPoint : function() {
						return false
					},
					showAll : function() {
						if (!isNaN(this._index)) {
							this.__excludes[this._index] = false;
							this.drawSeries()
						}
					},
					getLegendColor : function(b) {
						var c = this, a = c.colorArrayStyle;
						return c.getColorFromStyle(a[b % a.length])
					}
				});
Ext.chart.series.Line = Ext
		.extend(
				Ext.chart.series.Cartesian,
				{
					type : "line",
					selectionTolerance : 20,
					showMarkers : true,
					markerConfig : {},
					smooth : false,
					defaultSmoothness : 3,
					fill : false,
					overflowBuffer : 1,
					constructor : function(c) {
						Ext.chart.series.Line.superclass.constructor.apply(
								this, arguments);
						var e = this, a = e.getSurface(), g = e.chart.shadow, f = true, d, b;
						Ext.apply(e, c, {
							shadowAttributes : a.getShadowAttributesArray(f),
							shadowOptions : f
									&& {}
									|| Ext.apply(a.getShadowOptions(),
											g === true ? {} : (g || {}))
						});
						e.group = a.getGroup(e.seriesId);
						if (e.showMarkers) {
							e.markerGroup = a.getGroup(e.seriesId + "-markers")
						}
						if (g) {
							for (d = 0, b = this.shadowAttributes.length; d < b; d++) {
								e.shadowGroups.push(a.getGroup(e.seriesId
										+ "-shadows" + d))
							}
						}
					},
					shrink : function(b, j, k) {
						var g = b.length, h = Math.floor(g / k), f = 1, d = 0, a = 0, e = [ b[0] ], c = [ j[0] ];
						for (; f < g; ++f) {
							d += b[f] || 0;
							a += j[f] || 0;
							if (f % h == 0) {
								e.push(d / h);
								c.push(a / h);
								d = 0;
								a = 0
							}
						}
						return {
							x : e,
							y : c
						}
					},
					drawSeries : function() {
						var t = this, ak = t.chart, c = ak.substore || ak.store, an = t
								.getRecordCount(), w = ak.chartBBox.width
								* t.overflowBuffer, X = t.getSurface(), B = {}, A = t.group, p = t.showMarkers, al = t.markerGroup, h = ak.shadow, ae = t.shadowGroups, ad = t.shadowAttributes, o = t.smooth, ar = ae.length, ag = [ "M" ], ab = [ "M" ], g = ak.markerIndex, W = []
								.concat(t.axis), K, U = [], Z = [], G = false, u = t.markerStyle.style, k = t.style, f = t.colorArrayStyle, z = f
								&& f.length || 0, ao = Ext.isNumber, L = t.seriesIdx, H, Q, J, v, r, e, n, T, S, b, a, O, N, s, aj, ai, M, E, ah, am, R, I, F, aq, m, q, af, Y, D, V, C, l, at, d, aa, au, ac, ap, P;
						if (t.fireEvent("beforedraw", t) === false) {
							return
						}
						Ext.chart.series.Line.superclass.drawSeries.call(this);
						if (!an || t.seriesIsHidden) {
							X.items.hide(true);
							return
						}
						d = Ext.apply({}, u, t.markerConfig);
						au = d.type;
						delete d.type;
						aa = k;
						if (!aa["stroke-width"]) {
							aa["stroke-width"] = 0.5
						}
						if (g && al && al.getCount()) {
							for (aj = 0; aj < g; aj++) {
								am = al.getAt(aj);
								al.remove(am);
								al.add(am);
								R = al.getAt(al.getCount() - 2);
								am.setAttributes({
									x : 0,
									y : 0,
									translate : {
										x : R.attr.translation.x,
										y : R.attr.translation.y
									}
								}, true)
							}
						}
						t.unHighlightItem();
						t.cleanHighlights();
						t.setBBox();
						B = t.bbox;
						t.clipRect = [ B.x, B.y, B.width, B.height ];
						for (aj = 0, M = W.length; aj < M; aj++) {
							E = ak.axes.get(W[aj]);
							if (E) {
								ah = E.calcEnds();
								if (E.position == "top"
										|| E.position == "bottom") {
									Y = ah.from;
									D = ah.to
								} else {
									V = ah.from;
									C = ah.to
								}
							}
						}
						if (t.xField && !ao(Y)
								&& (t.axis == "bottom" || t.axis == "top")) {
							E = new Ext.chart.axis.Axis({
								chart : ak,
								fields : [].concat(t.xField)
							}).calcEnds();
							Y = E.from;
							D = E.to
						}
						if (t.yField && !ao(V)
								&& (t.axis == "right" || t.axis == "left")) {
							E = new Ext.chart.axis.Axis({
								chart : ak,
								fields : [].concat(t.yField)
							}).calcEnds();
							V = E.from;
							C = E.to
						}
						if (isNaN(Y)) {
							Y = 0;
							q = B.width / ((an - 1) || 1)
						} else {
							q = B.width / ((D - Y) || (an - 1) || 1)
						}
						if (isNaN(V)) {
							V = 0;
							af = B.height / ((an - 1) || 1)
						} else {
							af = B.height / ((C - V) || 1)
						}
						ap = Y - (w + t.panX) / q;
						P = ap + (w * 2 + ak.chartBBox.width) / q;
						t
								.eachRecord(function(j, x) {
									F = j.get(t.xField);
									if (typeof F == "string"
											|| typeof F == "object"
											|| (t.axis != "top" && t.axis != "bottom")) {
										F = x
									}
									if (F >= ap && F <= P) {
										aq = j.get(t.yField);
										if (typeof aq == "undefined"
												|| (typeof aq == "string" && !aq)) {
											return
										}
										if (typeof aq == "string"
												|| typeof aq == "object"
												|| (t.axis != "left" && t.axis != "right")) {
											aq = x
										}
										U.push(F);
										Z.push(aq)
									}
								});
						M = U.length;
						if (M > B.width) {
							m = t.shrink(U, Z, B.width);
							U = m.x;
							Z = m.y
						}
						t.items = [];
						ac = 0;
						M = U.length;
						for (aj = 0; aj < M; aj++) {
							F = U[aj];
							aq = Z[aj];
							if (aq === false) {
								if (ab.length == 1) {
									ab = []
								}
								G = true;
								t.items.push(false);
								continue
							} else {
								T = (B.x + (F - Y) * q).toFixed(2);
								S = ((B.y + B.height) - (aq - V) * af)
										.toFixed(2);
								if (G) {
									G = false;
									ab.push("M")
								}
								ab = ab.concat([ T, S ])
							}
							if ((typeof N == "undefined")
									&& (typeof S != "undefined")) {
								N = S;
								O = T
							}
							if (!t.line || ak.resizing) {
								ag = ag.concat([ T, B.y + B.height / 2 ])
							}
							if (ak.animate && ak.resizing && t.line) {
								t.line.setAttributes({
									path : ag
								}, true);
								if (t.fillPath) {
									t.fillPath.setAttributes({
										path : ag,
										opacity : 0.2
									}, true)
								}
								if (t.line.shadows) {
									H = t.line.shadows;
									for (ai = 0, ar = H.length; ai < ar; ai++) {
										Q = H[ai];
										Q.setAttributes({
											path : ag
										}, true)
									}
								}
							}
							if (p) {
								am = al.getAt(ac++);
								if (!am) {
									am = Ext.chart.Shape[au](X, Ext.apply({
										group : [ A, al ],
										x : 0,
										y : 0,
										translate : {
											x : b || T,
											y : a || (B.y + B.height / 2)
										},
										value : '"' + F + ", " + aq + '"',
										zIndex : 4000
									}, d));
									am._to = {
										translate : {
											x : T,
											y : S
										}
									}
								} else {
									am.setAttributes({
										value : '"' + F + ", " + aq + '"',
										x : 0,
										y : 0,
										hidden : false
									}, true);
									am._to = {
										translate : {
											x : T,
											y : S
										}
									}
								}
							}
							t.items.push({
								series : t,
								value : [ F, aq ],
								point : [ T, S ],
								sprite : am,
								storeItem : c.getAt(aj)
							});
							b = T;
							a = S
						}
						if (ab.length <= 1) {
							return
						}
						if (t.smooth) {
							ab = Ext.draw.Draw.smooth(ab, ao(o) ? o
									: t.defaultSmoothness)
						}
						if (ak.markerIndex && t.previousPath) {
							v = t.previousPath;
							v.splice(1, 2)
						} else {
							v = ab
						}
						if (!t.line) {
							t.line = X.add(Ext.apply({
								type : "path",
								group : A,
								path : ag,
								stroke : aa.stroke || aa.fill
							}, aa || {}));
							if (h) {
								t.line.setAttributes(Ext.apply({},
										t.shadowOptions), true)
							}
							t.line.setAttributes({
								fill : "none",
								zIndex : 3000
							});
							if (!aa.stroke && z) {
								t.line.setAttributes({
									stroke : f[L % z]
								}, true)
							}
							if (h) {
								H = t.line.shadows = [];
								for (J = 0; J < ar; J++) {
									K = ad[J];
									K = Ext.apply({}, K, {
										path : ag
									});
									Q = X.add(Ext.apply({}, {
										type : "path",
										group : ae[J]
									}, K));
									H.push(Q)
								}
							}
						}
						if (t.fill) {
							e = ab
									.concat([ [ "L", T, B.y + B.height ],
											[ "L", O, B.y + B.height ],
											[ "L", O, N ] ]);
							if (!t.fillPath) {
								t.fillPath = X.add({
									group : A,
									type : "path",
									opacity : aa.opacity || 0.3,
									fill : aa.fill || f[L % z],
									path : ag
								})
							}
						}
						s = p && al.getCount();
						if (ak.animate) {
							r = t.fill;
							l = t.line;
							n = t.renderer(l, false, {
								path : ab
							}, aj, c);
							Ext.apply(n, aa || {}, {
								stroke : aa.stroke || aa.fill
							});
							delete n.fill;
							l.show(true);
							if (ak.markerIndex && t.previousPath) {
								t.animation = at = t.onAnimate(l, {
									to : n,
									from : {
										path : v
									}
								})
							} else {
								t.animation = at = t.onAnimate(l, {
									to : n
								})
							}
							if (h) {
								H = l.shadows;
								for (ai = 0; ai < ar; ai++) {
									H[ai].show(true);
									if (ak.markerIndex && t.previousPath) {
										t.onAnimate(H[ai], {
											to : {
												path : ab
											},
											from : {
												path : v
											}
										})
									} else {
										t.onAnimate(H[ai], {
											to : {
												path : ab
											}
										})
									}
								}
							}
							if (r) {
								t.fillPath.show(true);
								t.onAnimate(t.fillPath, {
									to : Ext.apply({}, {
										path : e,
										fill : aa.fill || f[L % z],
										"stroke-width" : 0
									}, aa || {})
								})
							}
							if (p) {
								ac = 0;
								for (aj = 0; aj < M; aj++) {
									if (t.items[aj]) {
										I = al.getAt(ac++);
										if (I) {
											n = t.renderer(I, c.getAt(aj),
													I._to, aj, c);
											t.onAnimate(I, {
												to : Ext.apply(n, d || {})
											});
											I.show(true)
										}
									}
								}
								for (; ac < s; ac++) {
									I = al.getAt(ac);
									I.hide(true)
								}
							}
						} else {
							n = t.renderer(t.line, false, {
								path : ab,
								hidden : false
							}, aj, c);
							Ext.apply(n, aa || {}, {
								stroke : aa.stroke || aa.fill
							});
							delete n.fill;
							t.line.setAttributes(n, true);
							if (h) {
								H = t.line.shadows;
								for (ai = 0; ai < ar; ai++) {
									H[ai].setAttributes({
										path : ab,
										hidden : false
									}, true)
								}
							}
							if (t.fill) {
								t.fillPath.setAttributes({
									path : e,
									hidden : false
								}, true)
							}
							if (p) {
								ac = 0;
								for (aj = 0; aj < M; aj++) {
									if (t.items[aj]) {
										I = al.getAt(ac++);
										if (I) {
											n = t.renderer(I, c.getAt(aj),
													I._to, aj, c);
											I.setAttributes(Ext.apply(d || {},
													n || {}), true);
											I.show(true)
										}
									}
								}
								for (; ac < s; ac++) {
									I = al.getAt(ac);
									I.hide(true)
								}
							}
						}
						if (ak.markerIndex) {
							ab.splice(1, 0, ab[1], ab[2]);
							t.previousPath = ab
						}
						t.renderLabels();
						t.renderCallouts();
						t.fireEvent("draw", t)
					},
					onCreateLabel : function(d, j, c, e) {
						var f = this, g = f.labelsGroup, a = f.label, h = f.bbox, b = Ext
								.apply(a, f.labelStyle.style);
						return f.getSurface().add(Ext.apply({
							type : "text",
							"text-anchor" : "middle",
							group : g,
							x : j.point[0],
							y : h.y + h.height / 2,
							zIndex : 200
						}, b || {}))
					},
					onPlaceLabel : function(f, j, r, o, n, d) {
						var t = this, k = t.chart, q = k.resizing, s = t.label, p = s.renderer, b = s.field, a = t.bbox, h = r.point[0], g = r.point[1], c = r.sprite.attr.radius, e, m, l;
						f.setAttributes({
							text : p(j.get(b)),
							hidden : true
						}, true);
						if (n == "rotate") {
							f.setAttributes({
								"text-anchor" : "start",
								rotation : {
									x : h,
									y : g,
									degrees : -45
								}
							}, true);
							e = f.getBBox();
							m = e.width;
							l = e.height;
							h = h < a.x ? a.x : h;
							h = (h + m > a.x + a.width) ? (h - (h + m - a.x - a.width))
									: h;
							g = (g - l < a.y) ? a.y + l : g
						} else {
							if (n == "under" || n == "over") {
								e = r.sprite.getBBox();
								e.width = e.width || (c * 2);
								e.height = e.height || (c * 2);
								g = g + (n == "over" ? -e.height : e.height);
								e = f.getBBox();
								m = e.width / 2;
								l = e.height / 2;
								h = h - m < a.x ? a.x + m : h;
								h = (h + m > a.x + a.width) ? (h - (h + m - a.x - a.width))
										: h;
								g = g - l < a.y ? a.y + l : g;
								g = (g + l > a.y + a.height) ? (g - (g + l
										- a.y - a.height)) : g
							}
						}
						if (t.chart.animate && !t.chart.resizing) {
							f.show(true);
							t.onAnimate(f, {
								to : {
									x : h,
									y : g
								}
							})
						} else {
							f.setAttributes({
								x : h,
								y : g
							}, true);
							if (q) {
								t.animation.on("afteranimate", function() {
									f.show(true)
								})
							} else {
								f.show(true)
							}
						}
					},
					highlightItem : function(f) {
						var e = this, c = e.line, b, d, a;
						Ext.chart.series.Line.superclass.highlightItem.call(e,
								f);
						if (c && !e.highlighted) {
							if (!("__strokeWidth" in c)) {
								c.__strokeWidth = c.attr["stroke-width"] || 0
							}
							if (c.__anim) {
								c.__anim.paused = true
							}
							c.__anim = new Ext.fx.Anim({
								target : c,
								to : {
									"stroke-width" : c.__strokeWidth + 3
								}
							});
							e.highlighted = true
						}
						if (!e.showMarkers) {
							b = e.highlightMarker;
							if (!b) {
								d = Ext.apply({}, e.markerStyle.style,
										e.markerConfig);
								a = d.type;
								delete d.type;
								b = e.highlightMarker = Ext.chart.Shape[a](e
										.getSurface(), Ext.apply({
									x : 0,
									y : 0
								}, d))
							}
							b.setAttributes({
								translate : {
									x : f.point[0],
									y : f.point[1]
								},
								hidden : false
							}, true)
						}
					},
					unHighlightItem : function() {
						var c = this, b = c.line, a = c.highlightMarker;
						Ext.chart.series.Line.superclass.unHighlightItem
								.call(c);
						if (b && c.highlighted) {
							b.__anim = new Ext.fx.Anim({
								target : b,
								to : {
									"stroke-width" : b.__strokeWidth
								}
							});
							c.highlighted = false
						}
						if (a) {
							a.hide(true)
						}
					},
					onPlaceCallout : function(l, q, F, D, C, d, j) {
						if (!C) {
							return
						}
						var I = this, r = I.chart, H = I.callouts, s = I.items, u = D == 0 ? false
								: s[D - 1].point, w = (D == s.length - 1) ? false
								: s[D + 1].point, c = [ +F.point[0],
								+F.point[1] ], z, f, J, G, n, o, E = H.offsetFromViz || 30, A = H.offsetBox || 3, g, e, h, v, t, B = I.clipRect, b = {
							width : H.styles.width || 10,
							height : H.styles.height || 10
						}, m, k;
						if (!u) {
							u = c
						}
						if (!w) {
							w = c
						}
						G = (w[1] - u[1]) / (w[0] - u[0]);
						n = (c[1] - u[1]) / (c[0] - u[0]);
						o = (w[1] - c[1]) / (w[0] - c[0]);
						f = Math.sqrt(1 + G * G);
						z = [ 1 / f, G / f ];
						J = [ -z[1], z[0] ];
						if (n > 0 && o < 0 && J[1] < 0 || n < 0 && o > 0
								&& J[1] > 0) {
							J[0] *= -1;
							J[1] *= -1
						} else {
							if (Math.abs(n) < Math.abs(o) && J[0] < 0
									|| Math.abs(n) > Math.abs(o) && J[0] > 0) {
								J[0] *= -1;
								J[1] *= -1
							}
						}
						m = c[0] + J[0] * E;
						k = c[1] + J[1] * E;
						g = m + (J[0] > 0 ? 0 : -(b.width + 2 * A));
						e = k - b.height / 2 - A;
						h = b.width + 2 * A;
						v = b.height + 2 * A;
						if (g < B[0] || (g + h) > (B[0] + B[2])) {
							J[0] *= -1
						}
						if (e < B[1] || (e + v) > (B[1] + B[3])) {
							J[1] *= -1
						}
						m = c[0] + J[0] * E;
						k = c[1] + J[1] * E;
						g = m + (J[0] > 0 ? 0 : -(b.width + 2 * A));
						e = k - b.height / 2 - A;
						h = b.width + 2 * A;
						v = b.height + 2 * A;
						if (r.animate) {
							I.onAnimate(l.lines, {
								to : {
									path : [ "M", c[0], c[1], "L", m, k, "Z" ]
								}
							});
							if (l.panel) {
								l.panel.setPosition(g, e, true)
							}
						} else {
							l.lines.setAttributes({
								path : [ "M", c[0], c[1], "L", m, k, "Z" ]
							}, true);
							if (l.panel) {
								l.panel.setPosition(g, e)
							}
						}
						for (t in l) {
							l[t].show(true)
						}
					},
					isItemInPoint : function(j, g, m, a) {
						var d = this, b = d.items, e = d.selectionTolerance, k, h, f, c, l = Math.sqrt;
						k = m.point;
						h = j - k[0];
						f = g - k[1];
						c = l(h * h + f * f);
						if (c <= e) {
							if (a > 0 && b[a - 1]) {
								k = b[a - 1].point;
								h = j - k[0];
								f = g - k[1];
								if (l(h * h + f * f) < c) {
									return false
								}
							}
							if (b[a + 1]) {
								k = b[a + 1].point;
								h = j - k[0];
								f = g - k[1];
								if (l(h * h + f * f) < c) {
									return false
								}
							}
							return true
						}
						return false
					},
					toggleAll : function(a) {
						var e = this, b, d, f, c;
						if (!a) {
							Ext.chart.series.Line.superclass.hideAll.call(e)
						} else {
							Ext.chart.series.Line.superclass.showAll.call(e)
						}
						if (e.line) {
							e.line.setAttributes({
								hidden : !a
							}, true);
							if (e.line.shadows) {
								for (b = 0, c = e.line.shadows, d = c.length; b < d; b++) {
									f = c[b];
									f.setAttributes({
										hidden : !a
									}, true)
								}
							}
						}
						if (e.fillPath) {
							e.fillPath.setAttributes({
								hidden : !a
							}, true)
						}
					},
					hideAll : function() {
						this.toggleAll(false)
					},
					showAll : function() {
						this.toggleAll(true)
					}
				});
Ext.chart.series.Pie = Ext
		.extend(
				Ext.chart.series.Series,
				{
					type : "pie",
					rad : Math.PI / 180,
					rotation : 0,
					angleField : false,
					lengthField : false,
					donut : false,
					showInLegend : false,
					labelOverflowPadding : 20,
					constructor : function(c) {
						Ext.applyIf(c, {
							highlightCfg : {
								segment : {
									margin : 20
								}
							}
						});
						Ext.chart.series.Pie.superclass.constructor.apply(this,
								arguments);
						var f = this, e = f.chart, a = f.getSurface(), g = e.shadow, d, b;
						Ext.apply(f, c, {
							shadowAttributes : a.getShadowAttributesArray(),
							shadowOptions : Ext.apply(a.getShadowOptions(),
									g === true ? {} : (g || {}))
						});
						f.group = a.getGroup(f.seriesId);
						if (g) {
							for (d = 0, b = f.shadowAttributes.length; d < b; d++) {
								f.shadowGroups.push(a.getGroup(f.seriesId
										+ "-shadows" + d))
							}
						}
						a.customAttributes.segment = function(h) {
							return f.getSegment(h)
						};
						f.__excludes = f.__excludes || [];
						f.addEvents("labelOverflow");
						f.addListener("labelOverflow", f.onLabelOverflow)
					},
					onLabelOverflow : function(a) {
						a.hide(true)
					},
					getSegment : function(b) {
						var A = this, z = A.rad, d = Math.cos, a = Math.sin, l = Math.abs, j = A.centerX, h = A.centerY, u = 0, t = 0, s = 0, q = 0, g = 0, f = 0, e = 0, c = 0, v = 0.01, p = b.startAngle, o = b.endAngle, i = (p + o)
								/ 2 * z, k = b.margin || 0, r = l(o - p) > 180, B = Math
								.min(p, o)
								* z, w = Math.max(p, o) * z, m = false, n = false;
						j += k * d(i);
						h += k * a(i);
						u = j + b.startRho * d(B);
						g = h + b.startRho * a(B);
						t = j + b.endRho * d(B);
						f = h + b.endRho * a(B);
						s = j + b.startRho * d(w);
						e = h + b.startRho * a(w);
						q = j + b.endRho * d(w);
						c = h + b.endRho * a(w);
						if (l(u - s) <= v && l(g - e) <= v) {
							m = true
						}
						n = m && (l(t - q) <= v && l(f - c) <= v);
						if (p === o) {
							return {
								path : ""
							}
						} else {
							if (n) {
								return {
									path : [
											[ "M", j + b.endRho, h - 0.0001 ],
											[ "A", b.endRho, b.endRho, 0, 1, 0,
													j + b.endRho, h ], [ "Z" ] ]
								}
							} else {
								if (m) {
									return {
										path : [
												[ "M", u, g ],
												[ "L", t, f ],
												[ "A", b.endRho, b.endRho, 0,
														+r, 1, q, c ], [ "Z" ] ]
									}
								} else {
									return {
										path : [
												[ "M", u, g ],
												[ "L", t, f ],
												[ "A", b.endRho, b.endRho, 0,
														+r, 1, q, c ],
												[ "L", q, c ],
												[ "L", s, e ],
												[ "A", b.startRho, b.startRho,
														0, +r, 0, u, g ],
												[ "Z" ] ]
									}
								}
							}
						}
					},
					calcMiddle : function(m) {
						var h = this, i = h.rad, l = m.slice, k = h.centerX, j = h.centerY, g = l.startAngle, e = l.endAngle, b = Math
								.min(g, e)
								* i, a = Math.max(g, e) * i, d = -(b + (a - b) / 2), f = k
								+ (m.endRho + m.startRho) / 2 * Math.cos(d), c = j
								- (m.endRho + m.startRho) / 2 * Math.sin(d);
						m.middle = {
							x : f,
							y : c
						}
					},
					drawSeries : function() {
						var r = this, a = r.chart.substore || r.chart.store, x = r.group, R = r.chart.animate, h = r.angleField
								|| r.field || r.xField, A = []
								.concat(r.lengthField), Q = 0, V = r.chart, I = r
								.getSurface(), G = V.chartBBox, f = V.shadow, P = r.shadowGroups, O = r.shadowAttributes, Y = P.length, J = A.length, B = 0, b = +r.donut, X = [], y = [], u = 0, L = 0, t = r.rotation, g = r.style, e = r.colorArrayStyle, w = e
								&& e.length || 0, n, W, C, H, E, d, c, o, k = 0, q, m, z, K, D, Z, F, T, S, U, s, M, N, l, v;
						if (r.fireEvent("beforedraw", r) === false) {
							return
						}
						Ext.chart.series.Pie.superclass.drawSeries.call(this);
						r.setBBox();
						v = r.bbox;
						if (r.colorSet) {
							e = r.colorSet;
							w = e.length
						}
						r.unHighlightItem();
						r.cleanHighlights();
						d = r.centerX = G.x + (G.width / 2);
						c = r.centerY = G.y + (G.height / 2);
						r.radius = Math.min(d - G.x, c - G.y);
						r.slices = m = [];
						r.items = y = [];
						r.eachRecord(function(j, p) {
							if (r.isExcluded(p)) {
								return
							}
							u += +j.get(h);
							if (A[0]) {
								for (S = 0, Q = 0; S < J; S++) {
									Q += +j.get(A[S])
								}
								X[p] = Q;
								L = Math.max(L, Q)
							}
						}, this);
						u = u || 1;
						r.eachRecord(function(j, p) {
							if (r.isExcluded(p)) {
								return
							}
							K = j.get(h);
							s = t - 360 * K / u / 2;
							if (isNaN(s)) {
								s = 360;
								K = 1;
								u = 1
							}
							if (!p || k === 0) {
								t = 360 - s;
								r.firstAngle = t;
								s = t - 360 * K / u / 2
							}
							U = t - 360 * K / u;
							q = {
								series : r,
								value : K,
								startAngle : t,
								endAngle : U,
								storeItem : j
							};
							if (A[0]) {
								Z = X[p];
								q.rho = r.radius * (Z / L)
							} else {
								q.rho = r.radius
							}
							m[p] = q;
							t = U;
							k++
						}, r);
						if (f) {
							for (T = 0, F = m.length; T < F; T++) {
								if (r.isExcluded(T)) {
									continue
								}
								q = m[T];
								q.shadowAttrs = [];
								for (S = 0, B = 0, C = []; S < J; S++) {
									z = x.getAt(T * J + S);
									o = A[S] ? a.getAt(T).get(A[S]) / X[T]
											* q.rho : q.rho;
									n = {
										segment : {
											startAngle : q.startAngle,
											endAngle : q.endAngle,
											margin : 0,
											rho : q.rho,
											startRho : B + (o * b / 100),
											endRho : B + o
										},
										hidden : !q.value
												&& (q.startAngle % 360) == (q.endAngle % 360)
									};
									for (E = 0, C = []; E < Y; E++) {
										W = O[E];
										H = P[E].getAt(T);
										if (!H) {
											H = r
													.getSurface()
													.add(
															Ext
																	.apply(
																			{},
																			{
																				type : "path",
																				group : P[E],
																				strokeLinejoin : "round"
																			},
																			n,
																			W))
										}
										if (R) {
											W = r.renderer(H, a.getAt(T), Ext
													.apply({}, n, W), T, a);
											r.onAnimate(H, {
												to : W
											})
										} else {
											W = r.renderer(H, a.getAt(T), Ext
													.apply(W, {
														hidden : false
													}), T, a);
											H.setAttributes(W, true)
										}
										C.push(H)
									}
									q.shadowAttrs[S] = C
								}
							}
						}
						for (T = 0, F = m.length; T < F; T++) {
							if (r.isExcluded(T)) {
								continue
							}
							q = m[T];
							for (S = 0, B = 0; S < J; S++) {
								z = x.getAt(T * J + S);
								o = A[S] ? a.getAt(T).get(A[S]) / X[T] * q.rho
										: q.rho;
								n = Ext
										.apply(
												{
													segment : {
														startAngle : q.startAngle,
														endAngle : q.endAngle,
														margin : 0,
														rho : q.rho,
														startRho : B
																+ (o * b / 100),
														endRho : B + o
													},
													hidden : !q.value
															&& (q.startAngle % 360) == (q.endAngle % 360)
												}, Ext.apply(g, e
														&& {
															fill : e[(J > 1 ? S
																	: T)
																	% w]
														} || {}));
								D = Ext.apply({}, n.segment, {
									slice : q,
									series : r,
									storeItem : q.storeItem,
									index : T
								});
								r.calcMiddle(D);
								if (f) {
									D.shadows = q.shadowAttrs[S]
								}
								y[T] = D;
								if (!z) {
									l = Ext.apply({
										type : "path",
										group : x,
										middle : D.middle
									}, Ext.apply(g, e && {
										fill : e[(J > 1 ? S : T) % w]
									} || {}));
									if (f) {
										Ext.apply(l, r.shadowOptions)
									}
									z = I.add(Ext.apply(l, n))
								}
								q.sprite = q.sprite || [];
								D.sprite = z;
								q.sprite.push(z);
								q.point = [ D.middle.x, D.middle.y ];
								n = r.renderer(z, a.getAt(T), n, T, a);
								if (R) {
									z._to = n;
									r.onAnimate(z, {
										to : n
									})
								} else {
									z.setAttributes(n, true)
								}
								B += o
							}
						}
						F = x.getCount();
						for (T = 0; T < F; T++) {
							if (!m[(T / J) >> 0] && x.getAt(T)) {
								x.getAt(T).hide(true)
							}
						}
						if (f) {
							Y = P.length;
							for (E = 0; E < F; E++) {
								if (!m[(E / J) >> 0]) {
									for (S = 0; S < Y; S++) {
										if (P[S].getAt(E)) {
											P[S].getAt(E).hide(true)
										}
									}
								}
							}
						}
						r.renderLabels();
						r.renderCallouts();
						r.fireEvent("draw", r)
					},
					onCreateLabel : function(e, d) {
						var c = this, f = c.labelsGroup, b = c.label, a = d.middle, g = Ext
								.apply(c.labelStyle.style || {}, b || {});
						return c.getSurface().add(Ext.apply({
							type : "text",
							"text-anchor" : "middle",
							group : f,
							x : a.x,
							y : a.y
						}, g))
					},
					onPlaceLabel : function(k, p, z, t, s, e, f) {
						var B = this, q = B.chart, w = q.resizing, A = B.label, u = A.renderer, c = []
								.concat(A.field), m = B.centerX, l = B.centerY, C = z.middle, b = {
							x : C.x,
							y : C.y
						}, o = C.x - m, n = C.y - l, r = {}, d = 1, j = Math
								.atan2(n, o || 1), v = j * 180 / Math.PI, h, g;
						function a(i) {
							if (i < 0) {
								i += 360
							}
							return i % 360
						}
						k.setAttributes({
							text : u(p.get(c[f]))
						}, true);
						switch (s) {
						case "outside":
							d = Math.sqrt(o * o + n * n) * 2;
							b.x = d * Math.cos(j) + m;
							b.y = d * Math.sin(j) + l;
							break;
						case "rotate":
							v = a(v);
							v = (v > 90 && v < 270) ? v + 180 : v;
							h = k.attr.rotation.degrees;
							if (h != null && Math.abs(h - v) > 180) {
								if (v > h) {
									v -= 360
								} else {
									v += 360
								}
								v = v % 360
							} else {
								v = a(v)
							}
							b.rotate = {
								degrees : v,
								x : b.x,
								y : b.y
							};
							break;
						default:
							break
						}
						b.translate = {
							x : 0,
							y : 0
						};
						if (e && !w && (s != "rotate" || h !== null)) {
							B.onAnimate(k, {
								to : b
							})
						} else {
							k.setAttributes(b, true)
						}
						k._from = r;
						g = B.sliceContainsLabel(z.slice, k);
						if (!g) {
							B.fireEvent("labelOverflow", k, z)
						}
					},
					onCreateCallout : function() {
						var b = this, a;
						a = Ext.chart.series.Pie.superclass.onCreateCallout
								.apply(this, arguments);
						a.lines.setAttributes({
							path : [ "M", b.centerX, b.centerY ]
						});
						a.box.setAttributes({
							x : b.centerX,
							y : b.centerY
						});
						a.label.setAttributes({
							x : b.centerX,
							y : b.centerY
						});
						return a
					},
					onPlaceCallout : function(k, o, v) {
						var w = this, q = w.chart, i = w.centerX, h = w.centerY, z = v.middle, c = {
							x : z.x,
							y : z.y
						}, l = z.x - i, j = z.y - h, d = 1, n, f = Math.atan2(
								j, l || 1), g = k.label, m = k.box, b = k.lines, e = b.attr, a = g
								.getBBox(), u = e.offsetFromViz || 20, t = e.offsetToSide || 10, s = m.attr.offsetBox || 10, r;
						d = v.endRho + u;
						n = (v.endRho + v.startRho) / 2
								+ (v.endRho - v.startRho) / 3;
						c.x = d * Math.cos(f) + i;
						c.y = d * Math.sin(f) + h;
						l = n * Math.cos(f);
						j = n * Math.sin(f);
						if (q.animate) {
							w.onAnimate(k.lines, {
								to : {
									path : [ "M", l + i, j + h, "L", c.x, c.y,
											"Z", "M", c.x, c.y, "l",
											l > 0 ? t : -t, 0, "z" ]
								}
							});
							w.onAnimate(k.box, {
								to : {
									x : c.x
											+ (l > 0 ? t
													: -(t + a.width + 2 * s)),
									y : c.y
											+ (j > 0 ? (-a.height - s / 2)
													: (-a.height - s / 2)),
									width : a.width + 2 * s,
									height : a.height + 2 * s
								}
							});
							w.onAnimate(k.label, {
								to : {
									x : c.x
											+ (l > 0 ? (t + s)
													: -(t + a.width + s)),
									y : c.y
											+ (j > 0 ? -a.height / 4
													: -a.height / 4)
								}
							})
						} else {
							k.lines.setAttributes({
								path : [ "M", l + i, j + h, "L", c.x, c.y, "Z",
										"M", c.x, c.y, "l", l > 0 ? t : -t, 0,
										"z" ]
							}, true);
							k.box.setAttributes({
								x : c.x + (l > 0 ? t : -(t + a.width + 2 * s)),
								y : c.y
										+ (j > 0 ? (-a.height - s / 2)
												: (-a.height - s / 2)),
								width : a.width + 2 * s,
								height : a.height + 2 * s
							}, true);
							k.label.setAttributes(
									{
										x : c.x
												+ (l > 0 ? (t + s) : -(t
														+ a.width + s)),
										y : c.y
												+ (j > 0 ? -a.height / 4
														: -a.height / 4)
									}, true)
						}
						for (r in k) {
							k[r].show(true)
						}
					},
					onAnimate : function(b, a) {
						b.show();
						return Ext.chart.series.Pie.superclass.onAnimate.apply(
								this, arguments)
					},
					isItemInPoint : function(i, g, l) {
						var f = this, j = f.chart.chartBBox, d = f.centerX
								- j.x, c = f.centerY - j.y, n = Math.abs, m = n(i
								- d), k = n(g - c), e = l.startAngle, a = l.endAngle, h = Math
								.sqrt(m * m + k * k), b = Math.atan2(g - c, i
								- d)
								/ f.rad;
						while (b < a) {
							b += 360
						}
						while (b > e) {
							b -= 360
						}
						return (b <= e && b > a && h >= l.startRho && h <= l.endRho)
					},
					getItemForAngle : function(d) {
						var c = this, a = c.items, b = a.length;
						while (b--) {
							if (a[b] && c.isAngleInItem(d, a[b])) {
								return a[b]
							}
						}
					},
					isAngleInItem : function(d, c) {
						var b = c.startAngle, a = c.endAngle;
						while (d < a) {
							d += 360
						}
						while (d > b) {
							d -= 360
						}
						return (d <= b && d > a)
					},
					sliceContainsLabel : function(h, f) {
						var e = this, k = Math.PI, c = h.startAngle, b = h.endAngle, a = Math
								.abs(b - c)
								* k / 180, j = f.getBBox(true), d = e.radius, i = j.height
								+ (e.labelOverflowPadding || 0), g;
						if (a >= k) {
							return true
						}
						g = Math.abs(Math.tan(a / 2)) * d * 2;
						return g >= i
					},
					hideAll : function() {
						var e, b, g, f, d, a, c;
						if (!isNaN(this._index)) {
							this.__excludes = this.__excludes || [];
							this.__excludes[this._index] = true;
							c = this.slices[this._index].sprite;
							for (d = 0, a = c.length; d < a; d++) {
								c[d].setAttributes({
									hidden : true
								}, true)
							}
							if (this.slices[this._index].shadowAttrs) {
								for (
										e = 0,
										f = this.slices[this._index].shadowAttrs,
										b = f.length; e < b; e++) {
									g = f[e];
									for (d = 0, a = g.length; d < a; d++) {
										g[d].setAttributes({
											hidden : true
										}, true)
									}
								}
							}
							this.drawSeries()
						}
					},
					showAll : function() {
						var b = this, c = b.__excludes, a = b._index;
						if (!isNaN(a) && c && c[a]) {
							c[a] = false;
							b.drawSeries()
						}
					},
					highlightItem : function(p) {
						var s = this, q = s.rad;
						p = p || this.items[this._index];
						if (!p || p.sprite && p.sprite._animating) {
							return
						}
						Ext.chart.series.Pie.superclass.highlightItem.apply(
								this, [ p ]);
						if (s.highlight === false) {
							return
						}
						if ("segment" in s.highlightCfg) {
							var u = s.highlightCfg.segment, d = s.chart.animate, n, o, a, e, j, b, l, c;
							if (s.labelsGroup) {
								var f = s.labelsGroup, g = f.getAt(p.index), t = (p.startAngle + p.endAngle)
										/ 2 * q, m = u.margin || 0, k = m
										* Math.cos(t), h = m * Math.sin(t);
								if (Math.abs(k) < 1e-10) {
									k = 0
								}
								if (Math.abs(h) < 1e-10) {
									h = 0
								}
								if (d) {
									g.stopAnimation();
									g.animate({
										to : {
											translate : {
												x : k,
												y : h
											}
										},
										duration : s.highlightDuration
									})
								} else {
									g.setAttributes({
										translate : {
											x : k,
											y : h
										}
									}, true)
								}
							}
							if (s.chart.shadow && p.shadows) {
								o = 0;
								a = p.shadows;
								j = a.length;
								for (; o < j; o++) {
									e = a[o];
									b = {};
									l = p.sprite._from.segment;
									for (c in l) {
										if (!(c in u)) {
											b[c] = l[c]
										}
									}
									n = {
										segment : Ext.applyIf(b,
												s.highlightCfg.segment)
									};
									if (d) {
										e.stopAnimation();
										e.animate({
											to : n,
											duration : s.highlightDuration
										})
									} else {
										e.setAttributes(n, true)
									}
								}
							}
						}
					},
					unHighlightItem : function() {
						var v = this;
						if (v.highlight === false) {
							return
						}
						if (("segment" in v.highlightCfg) && v.items) {
							var k = v.items, e = v.chart.animate, d = !!v.chart.shadow, h = v.labelsGroup, s = k.length, r = 0, q = 0, o = v.label.display, w, l, c, a, u, m, b, f, t, g, n;
							for (; r < s; r++) {
								t = k[r];
								if (!t) {
									continue
								}
								m = t.sprite;
								if (m && m._highlighted) {
									if (h) {
										g = h.getAt(t.index);
										n = Ext
												.apply(
														{
															translate : {
																x : 0,
																y : 0
															}
														},
														o == "rotate" ? {
															rotate : {
																x : g.attr.x,
																y : g.attr.y,
																degrees : g.attr.rotation.degrees
															}
														}
																: {});
										if (e) {
											g.stopAnimation();
											g.animate({
												to : n,
												duration : v.highlightDuration
											})
										} else {
											g.setAttributes(n, true)
										}
									}
									if (d) {
										b = t.shadows;
										w = b.length;
										for (; q < w; q++) {
											c = {};
											a = t.sprite._to.segment;
											u = t.sprite._from.segment;
											Ext.apply(c, u);
											for (l in a) {
												if (!(l in u)) {
													c[l] = a[l]
												}
											}
											f = b[q];
											if (e) {
												f.stopAnimation();
												f
														.animate({
															to : {
																segment : c
															},
															duration : v.highlightDuration
														})
											} else {
												f.setAttributes({
													segment : c
												}, true)
											}
										}
									}
								}
							}
						}
						Ext.chart.series.Pie.superclass.unHighlightItem.apply(
								v, arguments)
					},
					getLegendLabels : function() {
						var b = this, a = b.label.field, c = [];
						if (a) {
							b.eachRecord(function(d) {
								c.push(d.get(a))
							})
						}
						return c
					},
					getLegendColor : function(b) {
						var d = this, c = d.colorSet, a = d.colorArrayStyle;
						return d.getColorFromStyle((c && c[b % c.length])
								|| a[b % a.length])
					},
					eachRecord : function(g, i) {
						var e = this, h = e.chart.substore || e.chart.store, f = e.combinations, d = e.label.field, a = e.angleField
								|| e.field || e.xField, b = []
								.concat(e.lengthField), c;
						if (f) {
							c = h.data.clone();
							Ext.each(f,
									function(m) {
										var k = c.getAt(m[0]), j = c
												.getAt(m[1]), l = {};
										l[d] = k.get(d) + " & " + j.get(d);
										l[a] = +k.get(a) + j.get(a);
										if (b[0]) {
											Ext.each(b, function(n) {
												l[n] = +k.get(n) + j.get(n)
											})
										}
										c.insert(m[1], Ext.ModelMgr.create(l,
												h.model));
										c.remove(k);
										c.remove(j)
									});
							c.each(g, i)
						} else {
							h.each(g, i)
						}
					},
					getRecordCount : function() {
						var b = this, a = b.combinations;
						return Ext.chart.series.Pie.superclass.getRecordCount
								.call(b)
								- (a ? a.length : 0)
					},
					updateSurfaceBox : function() {
						var f = this, b = f.getSurface(), c = f
								.getOverlaySurface(), e = f.chart, d = e.curWidth, a = e.curHeight;
						b.el.setTopLeft(0, 0);
						b.setSize(d, a);
						c.el.setTopLeft(0, 0);
						c.setSize(d, a)
					},
					reset : function() {
						this.rotation = 0;
						Ext.chart.series.Pie.superclass.reset.call(this)
					}
				});
Ext.chart.series.Radar = Ext
		.extend(
				Ext.chart.series.Series,
				{
					type : "radar",
					rad : Math.PI / 180,
					rotation : 0,
					showInLegend : false,
					constructor : function(b) {
						Ext.chart.series.Radar.superclass.constructor.apply(
								this, arguments);
						var c = this, a = c.getSurface();
						c.group = a.getGroup(c.seriesId);
						if (c.showMarkers) {
							c.markerGroup = a.getGroup(c.seriesId + "-markers")
						}
					},
					drawSeries : function() {
						var D = this, i = D.group, q = D.chart, c = D.field
								|| D.yField, u = D.getSurface(), o = q.chartBBox, k, j, r, g, B = 0, t = [], z = Math.max, e = Math.cos, a = Math.sin, w = -D.rotation, E = Ext.draw.Draw.rad, A, v = D
								.getRecordCount(), C, s, n, m, d, b, h = D.style, f = q.axes
								&& q.axes.get(0), p = !(f && f.maximum);
						if (D.fireEvent("beforedraw", D) === false) {
							return
						}
						Ext.chart.series.Radar.superclass.drawSeries.call(this);
						D.setBBox();
						B = p ? 0 : (f.maximum || 0);
						if (!v || D.seriesIsHidden) {
							u.items.hide(true);
							return
						}
						D.unHighlightItem();
						D.cleanHighlights();
						k = D.centerX = (o.width / 2);
						j = D.centerY = (o.height / 2);
						D.radius = g = Math.min(o.width, o.height) / 2;
						D.items = r = [];
						if (p) {
							q.series.each(function(l) {
								t.push(l.yField)
							});
							D.eachRecord(function(l, x) {
								for (x = 0, b = t.length; x < b; x++) {
									B = z(+l.get(t[x]), B)
								}
							})
						}
						B = B || 1;
						C = [];
						s = [];
						D.eachRecord(function(l, x) {
							d = g * l.get(c) / B;
							A = E(w + x / v * 360);
							n = d * e(A);
							m = d * a(A);
							if (x == 0) {
								s.push("M", n + k, m + j);
								C.push("M", 0.01 * n + k, 0.01 * m + j)
							} else {
								s.push("L", n + k, m + j);
								C.push("L", 0.01 * n + k, 0.01 * m + j)
							}
							r.push({
								sprite : false,
								point : [ k + n, j + m ],
								series : D
							})
						});
						s.push("Z");
						if (!D.radar) {
							D.radar = u.add(Ext.apply({
								type : "path",
								group : i,
								path : C
							}, h || {}))
						}
						if (q.resizing) {
							D.radar.setAttributes({
								path : C
							}, true)
						}
						D.radar.show(true);
						if (q.animate) {
							D.onAnimate(D.radar, {
								to : Ext.apply({
									path : s
								}, h || {})
							})
						} else {
							D.radar.setAttributes(Ext.apply({
								path : s
							}, h || {}), true)
						}
						if (D.showMarkers) {
							D.drawMarkers()
						}
						D.renderLabels();
						D.renderCallouts();
						D.fireEvent("draw", D)
					},
					drawMarkers : function() {
						var m = this, j = m.chart, a = m.getSurface(), b = Ext
								.apply({}, m.markerStyle.style || {}), h = Ext
								.apply(b, m.markerConfig), k = m.items, n = h.type, p = m.markerGroup, e = m.centerX, d = m.centerY, o, g, c, f;
						delete h.type;
						for (g = 0, c = k.length; g < c; g++) {
							o = k[g];
							f = p.getAt(g);
							if (!f) {
								f = Ext.chart.Shape[n](a, Ext.apply({
									group : p,
									x : 0,
									y : 0,
									translate : {
										x : e,
										y : d
									}
								}, h))
							} else {
								f.show()
							}
							if (j.resizing) {
								f.setAttributes({
									x : 0,
									y : 0,
									translate : {
										x : e,
										y : d
									}
								}, true)
							}
							f._to = {
								translate : {
									x : o.point[0],
									y : o.point[1]
								}
							};
							if (j.animate) {
								m.onAnimate(f, {
									to : f._to
								})
							} else {
								f
										.setAttributes(Ext
												.apply(f._to, h || {}), true)
							}
						}
					},
					isItemInPoint : function(c, f, e) {
						var b, d = 10, a = Math.abs;
						b = e.point;
						return (a(b[0] - c) <= d && a(b[1] - f) <= d)
					},
					onCreateLabel : function(d, c) {
						var b = this, g = b.labelsGroup, a = b.label, f = b.centerX, e = b.centerY;
						return b.getSurface().add(Ext.apply({
							type : "text",
							"text-anchor" : "middle",
							group : g,
							x : f,
							y : e
						}, a || {}))
					},
					onPlaceLabel : function(n, g, p, f, j, b) {
						var l = this, k = l.chart, h = k.resizing, c = l.label, o = c.renderer, m = c.field, e = l.centerX, d = l.centerY, a = {
							x : p.point[0],
							y : p.point[1]
						};
						n.setAttributes({
							text : o(g.get(m)),
							hidden : true
						}, true);
						if (h) {
							n.setAttributes({
								x : e,
								y : d
							}, true)
						}
						if (b) {
							n.show(true);
							l.onAnimate(n, {
								to : a
							})
						} else {
							n.setAttributes(a, true);
							n.show(true)
						}
					},
					toggleAll : function(a) {
						var e = this, b, d, f, c;
						if (!a) {
							Ext.chart.series.Radar.superclass.hideAll.call(e)
						} else {
							Ext.chart.series.Radar.superclass.showAll.call(e)
						}
						if (e.radar) {
							e.radar.setAttributes({
								hidden : !a
							}, true);
							if (e.radar.shadows) {
								for (b = 0, c = e.radar.shadows, d = c.length; b < d; b++) {
									f = c[b];
									f.setAttributes({
										hidden : !a
									}, true)
								}
							}
						}
					},
					hideAll : function() {
						this.toggleAll(false);
						this.hideMarkers(0)
					},
					showAll : function() {
						this.toggleAll(true)
					},
					hideMarkers : function(a) {
						var d = this, c = d.markerGroup
								&& d.markerGroup.getCount() || 0, b = a || 0;
						for (; b < c; b++) {
							d.markerGroup.getAt(b).hide(true)
						}
					},
					getLegendLabels : function() {
						var a = this.title || this.yField;
						return a ? [ a ] : []
					},
					reset : function() {
						this.rotation = 0;
						Ext.chart.series.Radar.superclass.reset.call(this)
					}
				});
Ext.chart.series.Scatter = Ext
		.extend(
				Ext.chart.series.Cartesian,
				{
					type : "scatter",
					constructor : function(c) {
						Ext.chart.series.Scatter.superclass.constructor.apply(
								this, arguments);
						var e = this, f = e.chart.shadow, a = e.getSurface(), d, b;
						Ext.apply(e, c, {
							style : {},
							markerConfig : {},
							shadowAttributes : a.getShadowAttributesArray(),
							shadowOptions : Ext.apply(a.getShadowOptions(),
									f === true ? {} : (f || {}))
						});
						e.group = a.getGroup(e.seriesId);
						if (f) {
							for (d = 0, b = e.shadowAttributes.length; d < b; d++) {
								e.shadowGroups.push(a.getGroup(e.seriesId
										+ "-shadows" + d))
							}
						}
					},
					getBounds : function() {
						var m = this, l = m.chart, h = m.getRecordCount(), j = []
								.concat(m.axis), p, o, c, k, f, e, b, a, g, d, n;
						m.setBBox();
						p = m.bbox;
						for (g = 0, k = j.length; g < k; g++) {
							d = l.axes.get(j[g]);
							if (d) {
								n = d.calcEnds();
								if (d.position == "top"
										|| d.position == "bottom") {
									f = n.from;
									b = n.to
								} else {
									e = n.from;
									a = n.to
								}
							}
						}
						if (m.xField && !Ext.isNumber(f)) {
							d = new Ext.chart.axis.Axis({
								chart : l,
								fields : [].concat(m.xField)
							}).calcEnds();
							f = d.from;
							b = d.to
						}
						if (m.yField && !Ext.isNumber(e)) {
							d = new Ext.chart.axis.Axis({
								chart : l,
								fields : [].concat(m.yField)
							}).calcEnds();
							e = d.from;
							a = d.to
						}
						if (isNaN(f)) {
							f = 0;
							b = h - 1;
							o = p.width / (h - 1)
						} else {
							o = p.width / (b - f)
						}
						if (isNaN(e)) {
							e = 0;
							a = h - 1;
							c = p.height / (h - 1)
						} else {
							c = p.height / (a - e)
						}
						return {
							bbox : p,
							minX : f,
							minY : e,
							xScale : o,
							yScale : c
						}
					},
					getPaths : function() {
						var q = this, i = q.chart, b = i.shadow, f = q.group, d = q.bounds = q
								.getBounds(), a = q.bbox, s = d.xScale, c = d.yScale, o = d.minX, n = d.minY, r = a.x, p = a.y, e = a.height, k = [], h, g, l, m, j;
						q.items = q.items || [];
						q.eachRecord(function(t, u) {
							l = t.get(q.xField);
							m = t.get(q.yField);
							if (typeof m == "undefined"
									|| (typeof m == "string" && !m)) {
								return
							}
							if (typeof l == "string" || typeof l == "object") {
								l = u
							}
							if (typeof m == "string" || typeof m == "object") {
								m = u
							}
							h = r + (l - o) * s;
							g = p + e - (m - n) * c;
							k.push({
								x : h,
								y : g
							});
							q.items.push({
								series : q,
								value : [ l, m ],
								point : [ h, g ],
								storeItem : t
							});
							if (i.animate && i.resizing) {
								j = f.getAt(u);
								if (j) {
									q.resetPoint(j);
									if (b) {
										q.resetShadow(j)
									}
								}
							}
						});
						return k
					},
					resetPoint : function(a) {
						var b = this.bbox;
						a.setAttributes({
							translate : {
								x : (b.x + b.width) / 2,
								y : (b.y + b.height) / 2
							}
						}, true)
					},
					resetShadow : function(c) {
						var f = this, e = c.shadows, h = f.shadowAttributes, d = f.shadowGroups.length, g = f.bbox, b, a;
						for (b = 0; b < d; b++) {
							a = Ext.apply({}, h[b]);
							if (a.translate) {
								a.translate.x += (g.x + g.width) / 2;
								a.translate.y += (g.y + g.height) / 2
							} else {
								a.translate = {
									x : (g.x + g.width) / 2,
									y : (g.y + g.height) / 2
								}
							}
							e[b].setAttributes(a, true)
						}
					},
					createPoint : function(a, b) {
						var c = this, d = c.group, e = c.bbox;
						return Ext.chart.Shape[b](c.getSurface(), Ext.apply({},
								{
									x : 0,
									y : 0,
									group : d,
									translate : {
										x : (e.x + e.width) / 2,
										y : (e.y + e.height) / 2
									}
								}, a))
					},
					createShadow : function(l, f, h) {
						var g = this, j = g.shadowGroups, d = g.shadowAttributes, a = j.length, m = g.bbox, c, k, b, e;
						l.shadows = b = [];
						for (c = 0; c < a; c++) {
							e = Ext.apply({}, d[c]);
							if (e.translate) {
								e.translate.x += (m.x + m.width) / 2;
								e.translate.y += (m.y + m.height) / 2
							} else {
								Ext.apply(e, {
									translate : {
										x : (m.x + m.width) / 2,
										y : (m.y + m.height) / 2
									}
								})
							}
							Ext.apply(e, f);
							k = Ext.chart.Shape[h](g.getSurface(), Ext.apply(
									{}, {
										x : 0,
										y : 0,
										group : j[c]
									}, e));
							b.push(k)
						}
					},
					drawSeries : function() {
						var t = this, k = t.chart, g = k.substore || k.store, h = t.group, c = k.shadow, a = t.shadowGroups, p = t.shadowAttributes, q = a.length, l, m, n, j, o, s, e, f, b, d, r;
						if (t.fireEvent("beforedraw", t) === false) {
							return
						}
						Ext.chart.series.Scatter.superclass.drawSeries
								.call(this);
						s = Ext
								.apply(t.markerStyle.style || {},
										t.markerConfig);
						f = s.type;
						delete s.type;
						if (!t.getRecordCount() || t.seriesIsHidden) {
							t.getSurface().items.hide(true);
							return
						}
						t.unHighlightItem();
						t.cleanHighlights();
						m = t.getPaths();
						j = m.length;
						for (o = 0; o < j; o++) {
							n = m[o];
							l = h.getAt(o);
							Ext.apply(n, s);
							if (!l) {
								l = t.createPoint(n, f);
								if (c) {
									t.createShadow(l, s, f);
									l.setAttributes(t.shadowOptions, true)
								}
							}
							b = l.shadows;
							if (k.animate) {
								d = t.renderer(l, g.getAt(o), {
									translate : n
								}, o, g);
								l._to = d;
								t.onAnimate(l, {
									to : d
								});
								for (e = 0; e < q; e++) {
									r = Ext.apply({}, p[e]);
									d = t
											.renderer(
													b[e],
													g.getAt(o),
													Ext
															.apply(
																	{},
																	{
																		translate : {
																			x : n.x
																					+ (r.translate ? r.translate.x
																							: 0),
																			y : n.y
																					+ (r.translate ? r.translate.y
																							: 0)
																		}
																	}, r), o, g);
									t.onAnimate(b[e], {
										to : d
									})
								}
							} else {
								d = t.renderer(l, g.getAt(o), {
									translate : n
								}, o, g);
								l._to = d;
								l.setAttributes(d, true);
								for (e = 0; e < q; e++) {
									r = Ext.apply({}, p[e]);
									d = t
											.renderer(
													b[e],
													g.getAt(o),
													Ext
															.apply(
																	{},
																	{
																		translate : {
																			x : n.x
																					+ (r.translate ? r.translate.x
																							: 0),
																			y : n.y
																					+ (r.translate ? r.translate.y
																							: 0)
																		}
																	}, r), o, g);
									b[e].setAttributes(d, true)
								}
							}
							t.items[o].sprite = l
						}
						j = h.getCount();
						for (o = m.length; o < j; o++) {
							h.getAt(o).hide(true)
						}
						t.renderLabels();
						t.renderCallouts();
						t.fireEvent("draw", t)
					},
					onCreateLabel : function(d, j, c, e) {
						var f = this, g = f.labelsGroup, a = f.label, b = Ext
								.apply({}, a, f.labelStyle.style || {}), h = f.bbox;
						return f.getSurface().add(Ext.apply({
							type : "text",
							group : g,
							x : j.point[0],
							y : h.y + h.height / 2
						}, b))
					},
					onPlaceLabel : function(f, j, s, p, o, d) {
						var u = this, k = u.chart, r = k.resizing, t = u.label, q = t.renderer, b = t.field, a = u.bbox, h = s.point[0], g = s.point[1], c = s.sprite.attr.radius, e, m, l, n;
						f.setAttributes({
							text : q(j.get(b)),
							hidden : true
						}, true);
						if (o == "rotate") {
							f.setAttributes({
								"text-anchor" : "start",
								rotation : {
									x : h,
									y : g,
									degrees : -45
								}
							}, true);
							e = f.getBBox();
							m = e.width;
							l = e.height;
							h = h < a.x ? a.x : h;
							h = (h + m > a.x + a.width) ? (h - (h + m - a.x - a.width))
									: h;
							g = (g - l < a.y) ? a.y + l : g
						} else {
							if (o == "under" || o == "over") {
								e = s.sprite.getBBox();
								e.width = e.width || (c * 2);
								e.height = e.height || (c * 2);
								g = g + (o == "over" ? -e.height : e.height);
								e = f.getBBox();
								m = e.width / 2;
								l = e.height / 2;
								h = h - m < a.x ? a.x + m : h;
								h = (h + m > a.x + a.width) ? (h - (h + m - a.x - a.width))
										: h;
								g = g - l < a.y ? a.y + l : g;
								g = (g + l > a.y + a.height) ? (g - (g + l
										- a.y - a.height)) : g
							}
						}
						if (!k.animate) {
							f.setAttributes({
								x : h,
								y : g
							}, true);
							f.show(true)
						} else {
							if (r) {
								n = s.sprite.getActiveAnimation();
								if (n) {
									n.on("afteranimate", function() {
										f.setAttributes({
											x : h,
											y : g
										}, true);
										f.show(true)
									})
								} else {
									f.show(true)
								}
							} else {
								u.onAnimate(f, {
									to : {
										x : h,
										y : g
									}
								})
							}
						}
					},
					onPlaceCallout : function(j, l, u, t, s, c, g) {
						var w = this, m = w.chart, b = u.point, z, a = j.label
								.getBBox(), v = 30, q = 3, e, d, f, o, n, r = w.bbox, k, h;
						z = [ Math.cos(Math.PI / 4), -Math.sin(Math.PI / 4) ];
						k = b[0] + z[0] * v;
						h = b[1] + z[1] * v;
						e = k + (z[0] > 0 ? 0 : -(a.width + 2 * q));
						d = h - a.height / 2 - q;
						f = a.width + 2 * q;
						o = a.height + 2 * q;
						if (e < r[0] || (e + f) > (r[0] + r[2])) {
							z[0] *= -1
						}
						if (d < r[1] || (d + o) > (r[1] + r[3])) {
							z[1] *= -1
						}
						k = b[0] + z[0] * v;
						h = b[1] + z[1] * v;
						e = k + (z[0] > 0 ? 0 : -(a.width + 2 * q));
						d = h - a.height / 2 - q;
						f = a.width + 2 * q;
						o = a.height + 2 * q;
						if (m.animate) {
							w.onAnimate(j.lines, {
								to : {
									path : [ "M", b[0], b[1], "L", k, h, "Z" ]
								}
							}, true);
							w.onAnimate(j.box, {
								to : {
									x : e,
									y : d,
									width : f,
									height : o
								}
							}, true);
							w.onAnimate(j.label, {
								to : {
									x : k + (z[0] > 0 ? q : -(a.width + q)),
									y : h
								}
							}, true)
						} else {
							j.lines.setAttributes({
								path : [ "M", b[0], b[1], "L", k, h, "Z" ]
							}, true);
							j.box.setAttributes({
								x : e,
								y : d,
								width : f,
								height : o
							}, true);
							j.label.setAttributes({
								x : k + (z[0] > 0 ? q : -(a.width + q)),
								y : h
							}, true)
						}
						for (n in j) {
							j[n].show(true)
						}
					},
					onAnimate : function(b, a) {
						b.show();
						Ext.chart.series.Scatter.superclass.onAnimate.apply(
								this, arguments)
					},
					isItemInPoint : function(b, e, d) {
						var a, c = 10;
						a = d.point;
						return (a[0] - c <= b && a[0] + c >= b && a[1] - c <= e && a[1]
								+ c >= e)
					}
				});
Ext.chart.series.Area = Ext
		.extend(
				Ext.chart.series.Cartesian,
				{
					type : "area",
					stacked : true,
					constructor : function(c) {
						Ext.chart.series.Area.superclass.constructor.apply(
								this, arguments);
						var e = this, a = e.getSurface(), d, b;
						Ext.apply(e, c, {
							__excludes : [],
							highlightCfg : {
								lineWidth : 3,
								stroke : "#55c",
								opacity : 0.8,
								color : "#f00"
							}
						});
						if (e.highlight !== false) {
							e.highlightSprite = a.add({
								type : "path",
								path : [ "M", 0, 0 ],
								zIndex : 1000,
								opacity : 0.3,
								lineWidth : 5,
								hidden : true,
								stroke : "#444"
							})
						}
						e.group = a.getGroup(e.seriesId)
					},
					shrink : function(b, m, n) {
						var h = b.length, l = Math.floor(h / n), g, f, d = 0, k = this.areas.length, a = [], e = [], c = [];
						for (f = 0; f < k; ++f) {
							a[f] = 0
						}
						for (g = 0; g < h; ++g) {
							d += b[g];
							for (f = 0; f < k; ++f) {
								a[f] += m[g][f]
							}
							if (g % l == 0) {
								e.push(d / l);
								for (f = 0; f < k; ++f) {
									a[f] /= l
								}
								c.push(a);
								d = 0;
								for (f = 0, a = []; f < k; ++f) {
									a[f] = 0
								}
							}
						}
						return {
							x : e,
							y : c
						}
					},
					getBounds : function() {
						var r = this, h = r.chart, k = [], m = [], s = Infinity, p = s, o = -s, n, l, d = Math, q = d.min, u = d.max, a, t, c, f, e, b, j, i;
						r.setBBox();
						a = r.bbox;
						if (r.axis) {
							b = h.axes.get(r.axis);
							if (b) {
								j = b.calcEnds();
								n = j.from;
								l = j.to
							}
						}
						if (r.yField && !Ext.isNumber(n)) {
							b = new Ext.chart.axis.Axis({
								chart : h,
								fields : [].concat(r.yField)
							});
							j = b.calcEnds();
							n = j.from;
							l = j.to
						}
						if (!Ext.isNumber(n)) {
							n = 0
						}
						if (!Ext.isNumber(l)) {
							l = 0
						}
						function g(v) {
							if (typeof v == "number") {
								i.push(v)
							}
						}
						r.eachRecord(function(v, w) {
							var x = v.get(r.xField);
							if (typeof x != "number") {
								x = w
							}
							k.push(x);
							i = [];
							r.eachYValue(v, g);
							p = d.min(p, x);
							o = d.max(o, x);
							m.push(i)
						});
						t = a.width / ((o - p) || 1);
						c = a.height / ((l - n) || 1);
						f = k.length;
						if ((f > a.width) && r.areas) {
							e = r.shrink(k, m, a.width);
							k = e.x;
							m = e.y
						}
						return {
							bbox : a,
							minX : p,
							minY : n,
							xValues : k,
							yValues : m,
							xScale : t,
							yScale : c,
							areasLen : r.getYValueCount()
						}
					},
					getPaths : function() {
						var s = this, c = true, d = s.getBounds(), a = d.bbox, j = s.items = [], r = [], b, l = [], o, f, g, e, m, p, h, t, n, q, k;
						f = d.xValues.length;
						for (o = 0; o < f; o++) {
							m = d.xValues[o];
							p = d.yValues[o];
							g = a.x + (m - d.minX) * d.xScale;
							h = 0;
							for (t = 0; t < d.areasLen; t++) {
								if (s.isExcluded(t)) {
									continue
								}
								if (!r[t]) {
									r[t] = []
								}
								q = p[t];
								h += q;
								e = a.y + a.height - (h - d.minY) * d.yScale;
								if (!l[t]) {
									l[t] = [ "M", g, e ];
									r[t].push([ "L", g, e ])
								} else {
									l[t].push("L", g, e);
									r[t].push([ "L", g, e ])
								}
								if (!j[t]) {
									j[t] = {
										pointsUp : [],
										pointsDown : [],
										series : s
									}
								}
								j[t].pointsUp.push([ g, e ])
							}
						}
						for (t = 0; t < d.areasLen; t++) {
							if (s.isExcluded(t)) {
								continue
							}
							k = l[t];
							if (t == 0 || c) {
								c = false;
								k.push("L", g, a.y + a.height, "L", a.x, a.y
										+ a.height, "Z")
							} else {
								b = r[n];
								b.reverse();
								k.push("L", g, b[0][2]);
								for (o = 0; o < f; o++) {
									k.push(b[o][0], b[o][1], b[o][2]);
									j[t].pointsDown[f - o - 1] = [ b[o][1],
											b[o][2] ]
								}
								k.push("L", a.x, k[2], "Z")
							}
							n = t
						}
						return {
							paths : l,
							areasLen : d.areasLen
						}
					},
					drawSeries : function() {
						var h = this, g = h.chart, i = g.substore || g.store, d = h
								.getSurface(), c = g.animate, l = h.group, a = h.areas, b = h.style, k = h.colorArrayStyle, o = k
								&& k.length || 0, e, f, n, m, j;
						if (h.fireEvent("beforedraw", h) === false) {
							return
						}
						Ext.chart.series.Area.superclass.drawSeries.call(this);
						h.unHighlightItem();
						h.cleanHighlights();
						if (!h.getRecordCount()) {
							d.items.hide(true);
							return
						}
						n = h.getPaths();
						if (!a) {
							a = h.areas = []
						}
						for (e = 0; e < n.areasLen; e++) {
							if (h.isExcluded(e)) {
								continue
							}
							if (!a[e]) {
								h.items[e].sprite = a[e] = d.add(Ext.apply({},
										{
											type : "path",
											group : l,
											path : n.paths[e],
											stroke : b.stroke || k[e % o],
											fill : k[e % o]
										}, b || {}))
							}
							f = a[e];
							m = n.paths[e];
							if (c) {
								j = h.renderer(f, false, {
									path : m,
									fill : k[e % o],
									stroke : b.stroke || k[e % o]
								}, e, i);
								h.animation = h.onAnimate(f, {
									to : j
								})
							} else {
								j = h.renderer(f, false, {
									path : m,
									hidden : false,
									fill : k[e % o],
									stroke : b.stroke || k[e % o]
								}, e, i);
								a[e].setAttributes(j, true)
							}
						}
						for (; e < a.length; e++) {
							a[e].hide()
						}
						h.renderLabels();
						h.renderCallouts();
						h.fireEvent("draw", h)
					},
					onAnimate : function(b, a) {
						b.show();
						Ext.chart.series.Area.superclass.onAnimate.apply(this,
								arguments)
					},
					onCreateLabel : function(d, j, c, e) {
						var f = this, g = f.labelsGroup, a = f.label, h = f.bbox, b = Ext
								.apply({}, a, f.labelStyle.style);
						return f.getSurface().add(Ext.apply({
							type : "text",
							"text-anchor" : "middle",
							group : g,
							x : j.point[0],
							y : h.y + h.height / 2
						}, b || {}))
					},
					onPlaceLabel : function(f, j, r, o, n, c, e) {
						var t = this, k = t.chart, q = k.resizing, s = t.label, p = s.renderer, b = s.field, a = t.bbox, h = r.point[0], g = r.point[1], d, m, l;
						f.setAttributes({
							text : p(j.get(b[e])),
							hidden : true
						}, true);
						d = f.getBBox();
						m = d.width / 2;
						l = d.height / 2;
						h = h - m < a.x ? a.x + m : h;
						h = (h + m > a.x + a.width) ? (h - (h + m - a.x - a.width))
								: h;
						g = g - l < a.y ? a.y + l : g;
						g = (g + l > a.y + a.height) ? (g - (g + l - a.y - a.height))
								: g;
						if (t.chart.animate && !t.chart.resizing) {
							f.show(true);
							t.onAnimate(f, {
								to : {
									x : h,
									y : g
								}
							})
						} else {
							f.setAttributes({
								x : h,
								y : g
							}, true);
							if (q) {
								t.animation.on("afteranimate", function() {
									f.show(true)
								})
							} else {
								f.show(true)
							}
						}
					},
					onPlaceCallout : function(l, q, I, F, E, d, j) {
						var L = this, r = L.chart, C = L.getSurface(), G = r.resizing, K = L.callouts, s = L.items, u = (F == 0) ? false
								: s[F - 1].point, w = (F == s.length - 1) ? false
								: s[F + 1].point, c = I.point, z, f, M, J, n, o, b = l.label
								.getBBox(), H = 30, B = 10, A = 3, g, e, h, v, t, D = L.clipRect, m, k;
						if (!u) {
							u = c
						}
						if (!w) {
							w = c
						}
						J = (w[1] - u[1]) / (w[0] - u[0]);
						n = (c[1] - u[1]) / (c[0] - u[0]);
						o = (w[1] - c[1]) / (w[0] - c[0]);
						f = Math.sqrt(1 + J * J);
						z = [ 1 / f, J / f ];
						M = [ -z[1], z[0] ];
						if (n > 0 && o < 0 && M[1] < 0 || n < 0 && o > 0
								&& M[1] > 0) {
							M[0] *= -1;
							M[1] *= -1
						} else {
							if (Math.abs(n) < Math.abs(o) && M[0] < 0
									|| Math.abs(n) > Math.abs(o) && M[0] > 0) {
								M[0] *= -1;
								M[1] *= -1
							}
						}
						m = c[0] + M[0] * H;
						k = c[1] + M[1] * H;
						g = m + (M[0] > 0 ? 0 : -(b.width + 2 * A));
						e = k - b.height / 2 - A;
						h = b.width + 2 * A;
						v = b.height + 2 * A;
						if (g < D[0] || (g + h) > (D[0] + D[2])) {
							M[0] *= -1
						}
						if (e < D[1] || (e + v) > (D[1] + D[3])) {
							M[1] *= -1
						}
						m = c[0] + M[0] * H;
						k = c[1] + M[1] * H;
						g = m + (M[0] > 0 ? 0 : -(b.width + 2 * A));
						e = k - b.height / 2 - A;
						h = b.width + 2 * A;
						v = b.height + 2 * A;
						l.lines.setAttributes({
							path : [ "M", c[0], c[1], "L", m, k, "Z" ]
						}, true);
						l.box.setAttributes({
							x : g,
							y : e,
							width : h,
							height : v
						}, true);
						l.label.setAttributes({
							x : m + (M[0] > 0 ? A : -(b.width + A)),
							y : k
						}, true);
						for (t in l) {
							l[t].show(true)
						}
					},
					isItemInPoint : function(h, g, k, c) {
						var f = this, b = k.pointsUp, d = k.pointsDown, m = Math.abs, e = Infinity, a, l, j;
						for (a = 0, l = b.length; a < l; a++) {
							j = [ b[a][0], b[a][1] ];
							if (e > m(h - j[0])) {
								e = m(h - j[0])
							} else {
								j = b[a - 1];
								if (g >= j[1]
										&& (!d.length || g <= (d[a - 1][1]))) {
									k.storeIndex = a - 1;
									k.storeField = f.yField[c];
									k.storeItem = f.chart.store.getAt(a - 1);
									k._points = d.length ? [ j, d[a - 1] ]
											: [ j ];
									return true
								} else {
									break
								}
							}
						}
						return false
					},
					highlightSeries : function() {
						var a, c, b;
						if (this._index !== undefined) {
							a = this.areas[this._index];
							if (a.__highlightAnim) {
								a.__highlightAnim.paused = true
							}
							a.__highlighted = true;
							a.__prevOpacity = a.__prevOpacity || a.attr.opacity
									|| 1;
							a.__prevFill = a.__prevFill || a.attr.fill;
							a.__prevLineWidth = a.__prevLineWidth
									|| a.attr.lineWidth;
							b = Ext.draw.Color.fromString(a.__prevFill);
							c = {
								lineWidth : (a.__prevLineWidth || 0) + 2
							};
							if (b) {
								c.fill = b.getLighter(0.2).toString()
							} else {
								c.opacity = Math.max(a.__prevOpacity - 0.3, 0)
							}
							if (this.chart.animate) {
								a.__highlightAnim = new Ext.fx.Anim(Ext.apply({
									target : a,
									to : c
								}, this.chart.animate))
							} else {
								a.setAttributes(c, true)
							}
						}
					},
					unHighlightSeries : function() {
						var a;
						if (this._index !== undefined) {
							a = this.areas[this._index];
							if (a.__highlightAnim) {
								a.__highlightAnim.paused = true
							}
							if (a.__highlighted) {
								a.__highlighted = false;
								a.__highlightAnim = new Ext.fx.Anim({
									target : a,
									to : {
										fill : a.__prevFill,
										opacity : a.__prevOpacity,
										lineWidth : a.__prevLineWidth
									}
								})
							}
						}
					},
					highlightItem : function(d) {
						var c = this, a = c.highlightSprite, b, e;
						if (!d) {
							this.highlightSeries();
							return
						}
						b = d._points;
						e = b.length == 2 ? [ "M", b[0][0], b[0][1], "L",
								b[1][0], b[1][1] ] : [ "M", b[0][0], b[0][1],
								"L", b[0][0], c.bbox.y + c.bbox.height ];
						if (a) {
							Ext.applyIf(this.highlightCfg,
									this.highlightStyle.style || {});
							a.setAttributes(Ext.apply({
								path : e,
								hidden : false
							}, this.highlightCfg), true)
						}
						c.getSurface().renderFrame()
					},
					unHighlightItem : function(a) {
						if (!a) {
							this.unHighlightSeries()
						}
						if (this.highlightSprite) {
							this.highlightSprite.hide(true)
						}
					},
					hideAll : function() {
						var b = this, a = b._index;
						if (!isNaN(a)) {
							b.__excludes[a] = true;
							b.areas[a].hide(true);
							b.chart.axes.each(function(c) {
								c.drawAxis()
							});
							b.drawSeries()
						}
					},
					showAll : function() {
						var b = this, a = b._index;
						if (!isNaN(a)) {
							b.__excludes[a] = false;
							b.areas[a].show(true);
							b.chart.axes.each(function(c) {
								c.drawAxis()
							});
							b.drawSeries()
						}
					},
					getLegendColor : function(b) {
						var c = this, a = c.colorArrayStyle;
						return c.getColorFromStyle(a[b % a.length])
					}
				});
Ext.ns("Ext.chart.interactions");
Ext.chart.interactions.Manager = new Ext.AbstractManager();
Ext.chart.interactions.Abstract = Ext
		.extend(
				Ext.util.Observable,
				{
					gesture : "tap",
					constructor : function(a) {
						var b = this;
						Ext.chart.interactions.Abstract.superclass.constructor
								.call(b, a);
						b.ownerCt = b.chart
					},
					initEvents : function() {
						var a = this;
						if (a.gesture && a.gesture == "drag" || a.panGesture
								&& a.panGesture == "drag") {
							a.chart.getSurface("events").initializeDragEvents()
						}
						a.addChartListener(a.gesture, a.onGesture, a)
					},
					onGesture : Ext.emptyFn,
					getItemForEvent : function(d) {
						var b = this, a = b.chart, c = a.getEventXY(d);
						return a.getItemForPoint(c[0], c[1])
					},
					getItemsForEvent : function(d) {
						var b = this, a = b.chart, c = a.getEventXY(d);
						return a.getItemsForPoint(c[0], c[1])
					},
					addChartListener : function(a, c, b, f) {
						var e = this, d = e.getLocks();
						e.chart.on(a, function() {
							if (!(a in d) || d[a] === e) {
								c.apply(this, arguments)
							}
						}, b, f)
					},
					lockEvents : function() {
						var d = this, c = d.getLocks(), a = arguments, b = a.length;
						while (b--) {
							c[a[b]] = d
						}
					},
					unlockEvents : function() {
						var c = this.getLocks(), a = arguments, b = a.length;
						while (b--) {
							delete c[a[b]]
						}
					},
					getLocks : function() {
						var a = this.chart;
						return a.lockedEvents || (a.lockedEvents = {})
					},
					isMultiTouch : function() {
						return !(Ext.is.MultiTouch === false
								|| (Ext.is.Android && !Ext.is
										.hasOwnProperty("MultiTouch")) || Ext.is.Desktop)
					},
					initializeDefaults : Ext.emptyFn,
					ownerCt : null,
					getItemId : function() {
						return this.id || (this.id = Ext.id())
					},
					initCls : function() {
						return (this.cls || "").split(" ")
					},
					isXType : function(a) {
						return a === "interaction"
					},
					getRefItems : function(a) {
						return []
					}
				});
Ext.chart.interactions.DelayedSync = Ext.extend(Object, {
	syncDelay : 500,
	syncWaitText : "Rendering...",
	constructor : function() {
		var a = this, b = Ext.util.DelayedTask;
		a.startSyncTask = new b(a.startSync, a);
		a.doSyncTask = new b(a.doSync, a);
		a.unlockInteractionTask = new b(a.unlockInteraction, a)
	},
	sync : Ext.emptyFn,
	needsSync : function() {
		return true
	},
	startSync : function() {
		var a = this;
		if (a.needsSync()) {
			a.lockInteraction();
			a.doSyncTask.delay(1)
		}
	},
	doSync : function() {
		var a = this;
		if (a.needsSync()) {
			a.sync()
		}
		a.unlockInteractionTask.delay(1)
	},
	cancelSync : function() {
		var a = this;
		a.startSyncTask.cancel();
		a.doSyncTask.cancel();
		a.unlockInteractionTask.cancel()
	},
	delaySync : function() {
		var a = this;
		a.cancelSync();
		a.startSyncTask.delay(a.syncDelay)
	},
	lockInteraction : function() {
		var d = this, c = d.chart, b = c.el, a = d.stopEvent;
		d.unlockInteraction();
		b.on({
			touchstart : a,
			touchmove : a,
			touchend : a,
			capture : true
		})
	},
	unlockInteraction : function() {
		var d = this, c = d.chart, b = c.el, a = d.stopEvent;
		b.un({
			touchstart : a,
			touchmove : a,
			touchend : a,
			capture : true
		})
	},
	stopEvent : function(a) {
		a.stopEvent()
	}
});
Ext.chart.interactions.PanZoom = Ext
		.extend(
				Ext.chart.interactions.Abstract,
				{
					axes : {
						top : {},
						right : {},
						bottom : {},
						left : {}
					},
					showOverflowArrows : true,
					gesture : "pinch",
					panGesture : "drag",
					constructor : function(b) {
						var d = this, c = Ext.chart.interactions, a = Ext.baseCSSPrefix
								+ "zooming", e;
						c.PanZoom.superclass.constructor.call(d, b);
						c.DelayedSync.prototype.constructor.call(d, b);
						if (d.showOverflowArrows) {
							d.chart.on("redraw", d.updateAllOverflowArrows, d)
						}
						e = d.axes;
						if (Ext.isArray(e)) {
							d.axes = {};
							Ext.each(e, function(f) {
								d.axes[f] = {}
							})
						} else {
							if (Ext.isObject(e)) {
								Ext.iterate(e, function(f, g) {
									if (g === true) {
										e[f] = {}
									}
								})
							} else {
								Ext.Error
										.raise("Invalid value for panzoom interaction 'axes' config: '"
												+ e + "'")
							}
						}
						if (!d.isMultiTouch()) {
							d.zoomOnPanGesture = true;
							d.modeToggleButton = d.chart
									.getToolbar()
									.add(
											{
												cls : Ext.baseCSSPrefix
														+ "panzoom-toggle " + a,
												iconCls : Ext.baseCSSPrefix
														+ "panzoom-toggle-icon",
												iconMask : true,
												handler : function() {
													var f = this, g = d.zoomOnPanGesture = !d.zoomOnPanGesture;
													if (g) {
														f.addCls(a)
													} else {
														f.removeCls(a)
													}
												}
											})
						}
					},
					initEvents : function() {
						var a = this;
						Ext.chart.interactions.PanZoom.superclass.initEvents
								.call(a, arguments);
						a.addChartListener(a.gesture + "start",
								a.onGestureStart, a);
						a
								.addChartListener(a.gesture + "end",
										a.onGestureEnd, a);
						a.addChartListener(a.panGesture + "start",
								a.onPanGestureStart, a);
						a.addChartListener(a.panGesture, a.onPanGesture, a);
						a.addChartListener(a.panGesture + "end",
								a.onPanGestureEnd, a)
					},
					initializeDefaults : function(a) {
						var b = this;
						if (!a || a.type == "beforerender") {
							b.onGestureStart();
							b.onPanGestureStart();
							b.chart.axes
									.each(function(f) {
										if (!b.axes[f.position]) {
											return
										}
										var e = b.axes[f.position], c = e.startPan || 0, d = e.startZoom || 1;
										if (c != 0 || d != 1) {
											b.transformAxisBy(f, c, c, d, d)
										}
									})
						}
						if (!a || a.type == "afterrender") {
							b.onGestureEnd();
							b.onPanGestureEnd()
						}
					},
					getInteractiveAxes : function() {
						var b = this, a = b.axes;
						return b.chart.axes.filterBy(function(c) {
							return !!a[c.position]
						})
					},
					isEventOnAxis : function(c, b) {
						var a = Ext.util;
						return !a.Region.getRegion(b.getSurface().el)
								.isOutOfBound(a.Point.fromEvent(c))
					},
					sync : function() {
						var b = this, a = b.chart, c = a.animate, d = b
								.getInteractiveAxes();
						a.animate = false;
						a.endsLocked = true;
						d.each(function(e) {
							if (e.hasFastTransform()) {
								e.syncToFastTransform();
								e.drawAxis();
								e.renderFrame()
							}
						});
						b.getSeriesForAxes(d).each(function(e) {
							if (e.hasFastTransform()) {
								e.syncToFastTransform();
								e.drawSeries();
								e.getSurface().renderFrame()
							}
						});
						a.endsLocked = false;
						a.animate = c
					},
					needsSync : function() {
						return !!this.getInteractiveAxes().findBy(function(a) {
							return a.hasFastTransform()
						})
					},
					transformAxisBy : function(e, k, g, m, j) {
						var f = this, d = f.axes[e.position], a = d.minZoom || 1, i = d.maxZoom || 4, o = Ext.isNumber, b = e.length, c = e
								.isSide(), l = c ? g : k, n = c ? j : m;
						function h(t) {
							var r = t.getTransformMatrix().clone(), s, p, q;
							if (l !== 0) {
								r.translate(c ? 0 : l, c ? l : 0)
							}
							if (n !== 1) {
								s = r.get(+c, +c);
								if (o(a)) {
									n = Math.max(n, a / s)
								}
								if (o(i)) {
									n = Math.min(n, i / s)
								}
								p = r.invert();
								r.scale(c ? 1 : n, c ? n : 1, p.x(b / 2, 0), p
										.y(0, b / 2))
							}
							q = r[c ? "y" : "x"](0, 0);
							if (q > 0) {
								r.translate(c ? 0 : -q, c ? -q : 0)
							}
							q = b - r[c ? "y" : "x"](b, b);
							if (q > 0) {
								r.translate(c ? 0 : q, c ? q : 0)
							}
							t.setTransformMatrixFast(r)
						}
						h(e);
						e.getBoundSeries().each(h);
						if (f.showOverflowArrows) {
							f.updateAxisOverflowArrows(e)
						}
					},
					getPannableAxes : function(d) {
						var c = this, b = c.axes, a;
						return c.chart.axes.filterBy(function(e) {
							a = b[e.position];
							return a && a.allowPan !== false
									&& c.isEventOnAxis(d, e)
						})
					},
					panBy : function(b, a, c) {
						b.each(function(d) {
							this.transformAxisBy(d, a, c, 1, 1)
						}, this)
					},
					onPanGestureStart : function(b) {
						if (!b || !b.touches || b.touches.length < 2) {
							var a = this;
							a.cancelSync();
							if (a.zoomOnPanGesture) {
								a.onGestureStart(b)
							}
						}
					},
					onPanGesture : function(b) {
						if (!b.touches || b.touches.length < 2) {
							var a = this;
							if (a.zoomOnPanGesture) {
								a
										.zoomBy(
												a.getZoomableAxes(b),
												(b.previousX + b.previousDeltaX)
														/ b.previousX,
												b.previousY
														/ (b.previousY + b.previousDeltaY))
							} else {
								a.panBy(a.getPannableAxes(b), b.previousDeltaX,
										b.previousDeltaY)
							}
						}
					},
					onPanGestureEnd : function(b) {
						var a = this;
						if (a.zoomOnPanGesture) {
							a.onGestureEnd(b)
						} else {
							a.delaySync()
						}
					},
					getSeriesForAxes : function(b) {
						var a = new Ext.util.MixedCollection(false,
								function(c) {
									return c.seriesId
								});
						b.each(function(c) {
							a.addAll(c.getBoundSeries().items)
						});
						return a
					},
					getZoomableAxes : function(d) {
						var c = this, b = c.axes, a;
						return c.chart.axes.filterBy(function(e) {
							a = b[e.position];
							return a && a.allowZoom !== false
									&& (!d || c.isEventOnAxis(d, e))
						})
					},
					zoomBy : function(c, b, a) {
						c.each(function(d) {
							this.transformAxisBy(d, 0, 0, b, a)
						}, this)
					},
					onGestureStart : function(b) {
						var a = this;
						a.cancelSync();
						a.getZoomableAxes(b).each(function(c) {
							c.hideLabels();
							c.getLabelSurface().renderFrame()
						})
					},
					onGesture : function(h) {
						var f = this, a = Math.abs, d = a(h.secondPageX
								- h.firstPageX), b = a(h.secondPageY
								- h.firstPageY), i = f.lastZoomDistances
								|| [ d, b ], g = d < 30 ? 1 : d / (i[0] || d), c = b < 30 ? 1
								: b / (i[1] || b);
						f.zoomBy(f.getZoomableAxes(h), g, c);
						f.lastZoomDistances = [ d, b ]
					},
					onGestureEnd : function(b) {
						var a = this;
						a.getZoomableAxes(b).each(function(c) {
							if (!c.hasFastTransform()) {
								c.drawLabel();
								c.getLabelSurface().renderFrame()
							}
						});
						a.delaySync();
						delete a.lastZoomDistances
					},
					getOverflowArrow : function(a, f, c) {
						var b = this, d = a.position, g = b.overflowIndicators
								|| (b.overflowIndicators = {}), e = g[d]
								|| (g[d] = {});
						return e[f]
								|| (e[f] = Ext.chart.Shape.arrow(b.chart
										.getEventsSurface(), c))
					},
					updateAxisOverflowArrows : function(d) {
						var j = this, c = d.isSide(), a = d.position, f = j.axes[a].allowPan !== false, b = d.length, i = j.chart, o = i.chartBBox, l = d
								.getTransformMatrix(), e = Ext.apply({
							hidden : true,
							radius : 5,
							opacity : 0.3,
							fill : d.style.stroke
						}, j.overflowArrowOptions), k = Math, n = k.ceil, h = k.floor, m = j
								.getOverflowArrow(d, "up", e), g = j
								.getOverflowArrow(d, "down", e), p;
						if (f && (c ? n(l.y(0, 0)) < 0 : h(l.x(b, 0)) > b)) {
							if (c) {
								p = [ "M", o.x, o.y, "l", o.width / 2, 0, 0, 5,
										-10, 10, 20, 0, -10, -10, 0, -5,
										o.width / 2, 0, 0, 20, -o.width, 0, "z" ]
										.join(",")
							} else {
								p = [ "M", o.x + o.width, o.y, "l", 0,
										o.height / 2, -5, 0, -10, -10, 0, 20,
										10, -10, 5, 0, 0, o.height / 2, -20, 0,
										0, -o.height, "z" ].join(",")
							}
							m.setAttributes({
								hidden : false,
								path : p
							})
						} else {
							m.hide()
						}
						if (f && (c ? h(l.y(0, b)) > b : n(l.x(0, 0)) < 0)) {
							if (c) {
								p = [ "M", o.x, o.y + o.height, "l",
										o.width / 2, 0, 0, -5, -10, -10, 20, 0,
										-10, 10, 0, 5, o.width / 2, 0, 0, -20,
										-o.width, 0, "z" ].join(",")
							} else {
								p = [ "M", o.x, o.y, "l", 0, o.height / 2, 5,
										0, 10, -10, 0, 20, -10, -10, -5, 0, 0,
										o.height / 2, 20, 0, 0, -o.height, "z" ]
										.join(",")
							}
							g.setAttributes({
								hidden : false,
								path : p
							})
						} else {
							g.hide()
						}
						if (m.dirtyTransform || m.dirtyHidden
								|| g.dirtyTransform || g.dirtyHidden) {
							j.chart.getEventsSurface().renderFrame()
						}
					},
					updateAllOverflowArrows : function() {
						var a = this;
						a.getInteractiveAxes().each(a.updateAxisOverflowArrows,
								a)
					}
				});
Ext.applyIf(Ext.chart.interactions.PanZoom.prototype,
		Ext.chart.interactions.DelayedSync.prototype);
Ext.chart.interactions.Manager.registerType("panzoom",
		Ext.chart.interactions.PanZoom);
Ext.chart.interactions.PieGrouping = Ext
		.extend(
				Ext.chart.interactions.Abstract,
				{
					type : "piegrouping",
					gesture : "tap",
					resizeGesture : "drag",
					outset : 6,
					onSelectionChange : Ext.emptyFn,
					constructor : function(a) {
						this.addEvents("selectionchange");
						Ext.chart.interactions.PieGrouping.superclass.constructor
								.call(this, a);
						this.handleStyle = new Ext.chart.interactions.PieGrouping.HandleStyle();
						this.sliceStyle = new Ext.chart.interactions.PieGrouping.SliceStyle()
					},
					initEvents : function() {
						Ext.chart.interactions.PieGrouping.superclass.initEvents
								.call(this, arguments);
						var b = this, a = b.resizeGesture;
						b.addChartListener(a + "start", b.onResizeStart, b);
						b.addChartListener(a, b.onResize, b);
						b.addChartListener(a + "end", b.onResizeEnd, b)
					},
					onGesture : function(d) {
						var h = this, c = h.outset, k = h.getItemForEvent(d), g = h.handleStyle.style, j = h.sliceStyle.style, a, f, b, i;
						if (h.active
								&& (!k || h.getSelectedItems().indexOf(k) < 0)) {
							h.cancel()
						}
						if (!h.active && k) {
							a = h.getSeries().getOverlaySurface();
							f = k.startAngle;
							b = k.endAngle;
							h.slice = {
								startAngle : f,
								endAngle : b,
								sprite : a.add(Ext.applyIf({
									type : "path"
								}, j))
							};
							i = "M" + Math.max(k.startRho - c, 0) + ",0L"
									+ (k.endRho + c) + ",0";
							h.startHandle = {
								angle : f,
								sprite : a.add(Ext.applyIf({
									type : "path",
									path : i + "l5,-8l-10,0l5,8",
									fill : g.stroke
								}, g))
							};
							h.endHandle = {
								angle : b,
								sprite : a.add(Ext.applyIf({
									type : "path",
									path : i + "l5,8l-10,0l5,-8",
									fill : g.stroke
								}, g))
							};
							h.mon(h.getSeries(), "draw", h.onSeriesDraw, h);
							h.active = true;
							h.updateSprites();
							h.fireSelectionChange()
						}
					},
					onResizeStart : function(f) {
						var g = this, j = Math.abs, h = g.normalizeAngle, d = g.startHandle, i = g.endHandle, a = g.resizeGesture, c, b;
						if (g.active) {
							b = h(g.getAngleForEvent(f));
							if (j(b - h(d.angle)) < 10) {
								c = d
							} else {
								if (j(b - h(i.angle)) < 10) {
									c = i
								}
							}
							if (c) {
								g.lockEvents(a + "start", a, a + "end")
							}
							g.activeHandle = c
						}
					},
					onResize : function(d) {
						var f = this, c = f.activeHandle, g = f.snapWhileDragging, h = f.slice, j, b, a = false, i;
						if (c) {
							j = h.startAngle;
							b = h.endAngle;
							i = f.getAngleForEvent(d);
							c.angle = i;
							if (c === f.startHandle) {
								j = g ? f.snapToItemAngles(i, 0)[0] : i;
								while (j > b) {
									j -= 360
								}
								while (j <= b) {
									j += 360
								}
								if (h.startAngle !== j || !g) {
									a = true
								}
								h.startAngle = j
							} else {
								b = g ? f.snapToItemAngles(0, i)[1] : i;
								while (j > b) {
									b += 360
								}
								while (j <= b) {
									b -= 360
								}
								if (h.endAngle !== b || !g) {
									a = true
								}
								h.endAngle = b
							}
							f.updateSprites();
							if (a && g) {
								f.fireSelectionChange()
							}
						}
					},
					onResizeEnd : function(h) {
						var i = this, d = i.activeHandle, f = i.startHandle, k = i.endHandle, j = i.slice, g = i.closestAngle, a = i.resizeGesture, b, l, c;
						if (d) {
							b = i.snapToItemAngles(f.angle, k.angle);
							l = j.startAngle;
							c = j.endAngle;
							if (d === f) {
								f.angle = g(b[0], f.angle, 1);
								l = b[0];
								while (l > c) {
									l -= 360
								}
								while (l <= c) {
									l += 360
								}
								j.startAngle = l
							} else {
								k.angle = g(b[1], k.angle, 0);
								c = b[1];
								while (l > c) {
									c += 360
								}
								while (l <= c) {
									c -= 360
								}
								j.endAngle = c
							}
							i.updateSprites(true);
							if (!i.snapWhileDragging) {
								i.fireSelectionChange()
							}
							delete i.activeHandle;
							i.unlockEvents(a + "start", a, a + "end")
						}
					},
					onSeriesDraw : function() {
						var f = this, e = f.startHandle, i = f.endHandle, g = f.slice, b = f.lastSelection, a, c, h, d;
						if (f.active && b) {
							a = b[0];
							c = b[b.length - 1];
							h = f.findItemByRecord(a.storeItem);
							d = f.findItemByRecord(c.storeItem);
							if (!h || !d) {
								f.cancel()
							} else {
								e.angle = g.startAngle = h.startAngle;
								i.angle = g.endAngle = d.endAngle;
								while (g.startAngle > g.endAngle) {
									g.startAngle -= 360
								}
								while (g.startAngle <= g.endAngle) {
									g.startAngle += 360
								}
								f.updateSprites();
								f.fireSelectionChange()
							}
						}
					},
					findItemByRecord : function(a) {
						var b = this.getSeries().items, c = b.length;
						while (c--) {
							if (b[c] && b[c].storeItem === a) {
								return b[c]
							}
						}
					},
					normalizeAngle : function(a) {
						while (a < 0) {
							a += 360
						}
						return a % 360
					},
					fireSelectionChange : function() {
						var b = this, a = b.getSelectedItems();
						b.onSelectionChange(b, a);
						b.fireEvent("selectionchange", b, a);
						b.lastSelection = a
					},
					renderFrame : function() {
						this.getSeries().getOverlaySurface().renderFrame()
					},
					updateSprites : function(a) {
						var k = this, e = k.getSeries(), j = k.startHandle, n = k.endHandle, i = j.angle, h = n.angle, c = e.centerX, b = e.centerY, l = k.slice, d = k.outset, g, f, m;
						if (k.active) {
							m = {
								rotate : {
									degrees : i,
									x : 0,
									y : 0
								},
								translate : {
									x : c,
									y : b
								}
							};
							if (a) {
								j.sprite.stopAnimation();
								j.sprite.animate({
									to : m
								})
							} else {
								j.sprite.setAttributes(m, true)
							}
							m = {
								rotate : {
									degrees : h,
									x : 0,
									y : 0
								},
								translate : {
									x : c,
									y : b
								}
							};
							if (a) {
								n.sprite.stopAnimation();
								n.sprite.animate({
									to : m
								})
							} else {
								n.sprite.setAttributes(m, true)
							}
							g = e.getItemForAngle(i - 1e-9);
							f = e.getItemForAngle(h + 1e-9);
							m = {
								segment : {
									startAngle : l.startAngle,
									endAngle : l.endAngle,
									startRho : Math.max(Math.min(g.startRho,
											f.startRho)
											- d, 0),
									endRho : Math.min(g.endRho, f.endRho) + d
								}
							};
							if (a) {
								l.sprite.stopAnimation();
								l.sprite.animate({
									to : m
								})
							} else {
								l.sprite.setAttributes(m, true)
							}
							if (!a) {
								k.renderFrame()
							}
						}
					},
					snapToItemAngles : function(e, c) {
						var f = this, d = f.getSeries(), b = d
								.getItemForAngle(e - 1e-9), a = d
								.getItemForAngle(c + 1e-9);
						return [ b.startAngle, a.endAngle ]
					},
					closestAngle : function(c, b, a) {
						if (a) {
							while (c > b) {
								c -= 360
							}
							while (c < b) {
								c += 360
							}
						} else {
							while (c < b) {
								c += 360
							}
							while (c > b) {
								c -= 360
							}
						}
						return c
					},
					cancel : function() {
						var b = this, a;
						if (b.active) {
							a = b.getSeries();
							Ext.destroy(b.startHandle.sprite,
									b.endHandle.sprite, b.slice.sprite);
							b.active = false;
							b.startHandle = b.endHandle = b.slice = null;
							b.fireSelectionChange();
							b.renderFrame();
							b.mun(a, "draw", b.onSeriesDraw, b)
						}
					},
					getSelectedItems : function() {
						var e = this, f = e.slice, g, a = e.getSeries(), c, d, b;
						if (e.active) {
							c = e.getSeries().items;
							d = c.indexOf(a
									.getItemForAngle(f.startAngle - 1e-9));
							b = c.indexOf(a.getItemForAngle(f.endAngle + 1e-9));
							if (d <= b) {
								g = c.slice(d, b + 1)
							} else {
								g = c.slice(d).concat(c.slice(0, b + 1))
							}
							g = g.filter(function(k, j, h) {
								return j in h
							})
						}
						return g || []
					},
					getAngleForEvent : function(d) {
						var c = this, a = c.getSeries(), b = a.getSurface().el
								.getXY();
						return Ext.draw.Draw
								.degrees(Math.atan2(d.pageY - a.centerY - b[1],
										d.pageX - a.centerX - b[0]))
					},
					getSeries : function() {
						var b = this, a = b._series;
						if (!a) {
							a = b._series = b.chart.series.findBy(function(c) {
								return c.type === "pie"
							});
							a.getOverlaySurface().customAttributes.segment = function(
									c) {
								return a.getSegment(c)
							}
						}
						return a
					},
					getRefItems : function(a) {
						return [ this.handleStyle, this.sliceStyle ]
					}
				});
Ext.chart.interactions.Manager.registerType("piegrouping",
		Ext.chart.interactions.PieGrouping);
Ext.chart.interactions.PieGrouping.HandleStyle = Ext.extend(
		Ext.chart.theme.Style, {
			isXType : function(a) {
				return a === "handle"
			}
		});
Ext.chart.interactions.PieGrouping.SliceStyle = Ext.extend(
		Ext.chart.theme.Style, {
			isXType : function(a) {
				return a === "slice"
			}
		});
Ext.chart.interactions.Rotate = Ext.extend(Ext.chart.interactions.Abstract, {
	gesture : "drag",
	constructor : function(a) {
		var c = this, b = Ext.chart.interactions;
		b.Rotate.superclass.constructor.call(c, a);
		b.DelayedSync.prototype.constructor.call(c, a)
	},
	initEvents : function() {
		Ext.chart.interactions.Rotate.superclass.initEvents.call(this,
				arguments);
		var b = this, a = b.gesture;
		b.addChartListener(a + "start", b.onGestureStart, b);
		b.addChartListener(a + "end", b.onGestureEnd, b)
	},
	onGestureStart : function() {
		var b = this, a = b.getAxis();
		b.cancelSync();
		b.getSeries().each(function(c) {
			c.unHighlightItem();
			c.origHighlight = c.highlight;
			c.highlight = false;
			if (c.callouts) {
				c.hideCallouts(0);
				c.getSurface().renderFrame()
			}
		});
		if (a && a.position === "radial") {
			a.hideLabels();
			a.renderFrame()
		}
	},
	onGesture : function(g) {
		var h = this, d = h.lastAngle, l, k, j, i, c, a, f, b;
		if (h.gesture === "pinch") {
			l = g.firstPageX;
			j = g.firstPageY;
			k = g.secondPageX;
			i = g.secondPageY
		} else {
			c = h.getSeries().get(0);
			a = c.getSurface().el.getXY();
			l = c.centerX + a[0];
			j = c.centerY + a[1];
			k = g.pageX;
			i = g.pageY
		}
		f = Ext.draw.Draw.degrees(Math.atan2(i - j, k - l));
		if (d === b) {
			d = f
		}
		if (d !== f) {
			h.rotateBy(f - d)
		}
		h.lastAngle = f
	},
	onGestureEnd : function() {
		var a = this;
		a.delaySync();
		a.getSeries().each(function(b) {
			b.highlight = b.origHighlight
		});
		delete a.lastAngle
	},
	rotateBy : function(e) {
		var d = this, b = d.getSeries(), c = d.getAxis(), a;
		d.rotation = (d.rotation || 0) + e;
		b.each(function(f) {
			a = f.getFastTransformMatrix();
			a.rotate(e, f.centerX, f.centerY);
			f.setFastTransformMatrix(a)
		});
		if (c) {
			a = c.getFastTransformMatrix();
			a.rotate(e, c.centerX, c.centerY);
			c.setFastTransformMatrix(a)
		}
	},
	seriesFilter : function(a) {
		return a.type === "pie" || a.type === "radar"
	},
	getSeries : function() {
		return this.chart.series.filter(this.seriesFilter)
	},
	axisFilter : function(a) {
		return a.position === "radial"
	},
	getAxis : function() {
		return this.chart.axes.findBy(this.axisFilter)
	},
	sync : function() {
		var c = this, b = c.chart, a = c.getAxis(), d = b.animate;
		b.animate = false;
		c.getSeries().each(function(e) {
			e.rotation -= c.rotation;
			e.drawSeries();
			e.getSurface().renderFrame();
			e.clearTransform()
		});
		if (a) {
			a.rotation -= c.rotation;
			a.drawAxis();
			a.renderFrame();
			a.clearTransform()
		}
		b.animate = d;
		c.rotation = 0
	},
	needsSync : function() {
		return !!this.rotation
	}
});
Ext.applyIf(Ext.chart.interactions.Rotate.prototype,
		Ext.chart.interactions.DelayedSync.prototype);
Ext.chart.interactions.Manager.registerType("rotate",
		Ext.chart.interactions.Rotate);
Ext.chart.interactions.ItemCompare = Ext
		.extend(
				Ext.chart.interactions.Abstract,
				{
					gesture : "tap",
					type : "itemcompare",
					constructor : function(a) {
						var b = this;
						b.addEvents("show", "hide");
						b.circleStyle = new (Ext.extend(Ext.chart.theme.Style,
								{
									isXType : function(c) {
										return c === "circle"
									}
								}))(a.circle);
						b.lineStyle = new (Ext.extend(Ext.chart.theme.Style, {
							isXType : function(c) {
								return c === "line"
							}
						}))(a.line);
						b.arrowStyle = new (Ext.extend(Ext.chart.theme.Style, {
							isXType : function(c) {
								return c === "arrow"
							}
						}))(a.arrow);
						delete a.line;
						delete a.circle;
						delete a.arrow;
						a.chart.on("refresh", b.reset, b);
						Ext.chart.interactions.ItemCompare.superclass.constructor
								.call(this, a)
					},
					onGesture : function(c) {
						var b = this, a = b.getItemForEvent(c);
						if (a) {
							if (b.item1 && b.item2) {
								b.reset()
							}
							if (b.item1) {
								if (b.item1.series != a.series) {
									b.reset()
								} else {
									if (a !== b.item1) {
										b.item2 = a;
										a.series.highlightItem(a);
										b.showOverlay()
									}
								}
							} else {
								b.item1 = a;
								a.series.highlightItem(a)
							}
						} else {
							b.reset()
						}
					},
					reset : function() {
						var b = this, a = b.activeSeries;
						if (a) {
							b.line.remove();
							b.circle.remove();
							b.arrow.remove();
							a.unHighlightItem();
							a.un("transform", b.onSeriesTransform, b);
							a.getOverlaySurface().renderFrame();
							delete b.activeSeries
						}
						b.item1 = b.item2 = null;
						b.fireEvent("hide", b)
					},
					onSeriesTransform : function(b, a) {
						if (!a) {
							this.renderSprites()
						}
					},
					showOverlay : function() {
						var b = this, a = b.item1.series;
						b.activeSeries = a;
						a.on("transform", b.onSeriesTransform, b);
						b.renderSprites();
						b.fireEvent("show", b)
					},
					initSprites : function() {
						var d = this, c = Ext.draw.Sprite, a = d.arrowStyle.style, b;
						if (!d.line) {
							d.line = new c(Ext.apply({
								type : "path",
								path : [ "M", 0, 0 ]
							}, d.lineStyle.style));
							d.circle = new c(Ext.apply({
								type : "circle",
								radius : 3
							}, d.circleStyle.style));
							b = a.radius || 3;
							d.arrow = new c(Ext.apply({
								type : "path",
								path : "M".concat("0,0m0-", b * 0.58, "l",
										b * 0.5, ",", b * 0.87, "-", b, ",0z")
							}, a))
						}
					},
					renderSprites : function() {
						var k = this, j = k.item1, i = k.item2, g = j.series, d, p, o, e, h, f, c, m, b, l, q, a, n;
						if (g) {
							k.initSprites();
							d = g.getOverlaySurface();
							p = j.point;
							o = i.point;
							e = k.offset || {};
							h = e.x || 0;
							f = e.y || 0;
							c = (p[0] + h);
							m = (p[1] + f);
							b = (o[0] + h);
							l = (o[1] + f);
							q = k.line;
							a = k.circle;
							n = k.arrow;
							q.setAttributes({
								path : [ "M", c, m, "L", b, l ]
							});
							a.setAttributes({
								translate : {
									x : c,
									y : m
								}
							});
							n.setAttributes({
								translate : {
									x : b,
									y : l
								},
								rotate : {
									x : 0,
									y : 0,
									degrees : (Math.atan2(o[1] - p[1], o[0]
											- p[0])
											* 180 / Math.PI - 90) + 180
								}
							});
							d.add(q, a, n);
							d.renderFrame()
						}
					},
					getRefItems : function(a) {
						var b = this;
						return [ b.arrowStyle, b.lineStyle, b.circleStyle ]
					}
				});
Ext.chart.interactions.Manager.registerType("itemcompare",
		Ext.chart.interactions.ItemCompare);
Ext.chart.interactions.ItemHighlight = Ext.extend(
		Ext.chart.interactions.Abstract, {
			gesture : "tap",
			unHighlightEvent : "touchstart",
			initEvents : function() {
				var a = this;
				Ext.chart.interactions.ItemHighlight.superclass.initEvents
						.call(a, arguments);
				a.addChartListener(a.unHighlightEvent, a.onUnHighlightEvent, a)
			},
			onGesture : function(j) {
				var h = this, b = h.getItemsForEvent(j), g, f, d, c, a;
				for (c = 0, a = b.length; c < a; c++) {
					g = b[c];
					d = g.series;
					f = d.highlightedItem;
					if (f !== g) {
						if (f) {
							f.series.unHighlightItem()
						}
						d.highlightItem(g);
						d.highlightedItem = g
					}
				}
			},
			onUnHighlightEvent : function(f) {
				var c = this, a = c.chart, d = a.getEventXY(f), b;
				a.series.each(function(e) {
					b = e.highlightedItem;
					if (b && b !== e.getItemForPoint(d[0], d[1])) {
						e.unHighlightItem();
						delete e.highlightedItem
					}
				})
			}
		});
Ext.chart.interactions.Manager.registerType("itemhighlight",
		Ext.chart.interactions.ItemHighlight);
Ext.chart.interactions.ItemInfo = Ext.extend(Ext.chart.interactions.Abstract, {
	gesture : "tap",
	constructor : function(a) {
		var b = this;
		b.addEvents("show");
		Ext.chart.interactions.ItemInfo.superclass.constructor.call(b, a)
	},
	getPanel : function() {
		var b = this, a = b.infoPanel;
		if (!a) {
			a = b.infoPanel = new Ext.Panel(Ext.apply({
				floating : true,
				modal : true,
				centered : true,
				width : 250,
				styleHtmlContent : true,
				scroll : "vertical",
				dockedItems : [ {
					dock : "top",
					xtype : "toolbar",
					title : "Item Detail"
				} ],
				stopMaskTapEvent : false,
				fullscreen : false,
				listeners : {
					hide : b.reset,
					scope : b
				}
			}, b.panel))
		}
		return a
	},
	onGesture : function(d) {
		var c = this, b = c.getItemForEvent(d), a;
		if (b) {
			c.item = b;
			b.series.highlightItem(b);
			a = c.getPanel();
			c.fireEvent("show", c, b, a);
			a.show("pop")
		}
	},
	reset : function() {
		var b = this, a = b.item;
		if (a) {
			a.series.unHighlightItem(a);
			delete b.item
		}
	}
});
Ext.chart.interactions.Manager.registerType("iteminfo",
		Ext.chart.interactions.ItemInfo);
Ext.chart.interactions.Reset = Ext.extend(Ext.chart.interactions.Abstract, {
	gesture : "doubletap",
	confirmTitle : "Reset",
	confirmText : "Reset the chart?",
	onGesture : function(c) {
		var b = this, a = b.chart;
		if (!b.getItemForEvent(c)) {
			if (b.confirm) {
				Ext.Msg.confirm(b.confirmTitle, b.confirmText, function(d) {
					if (d === "yes") {
						a.reset()
					}
				})
			} else {
				a.reset()
			}
		}
	}
});
Ext.chart.interactions.Manager.registerType("reset",
		Ext.chart.interactions.Reset);
Ext.chart.interactions.ToggleStacked = Ext.extend(
		Ext.chart.interactions.Abstract, {
			gesture : "swipe",
			onGesture : function(d) {
				var c = this, b = c.chart, a = c.getSeries();
				if (a) {
					if (b.animate && !c.animateDirect) {
						if (!c.locked) {
							c.lock();
							if (a.stacked) {
								a.disjointStacked = true;
								c.afterAnim(a, function() {
									a.stacked = a.disjointStacked = false;
									c.afterAnim(a, c.unlock);
									b.redraw()
								});
								a.drawSeries()
							} else {
								a.stacked = a.disjointStacked = true;
								c.afterAnim(a, function() {
									a.disjointStacked = false;
									c.afterAnim(a, c.unlock);
									a.drawSeries()
								});
								b.redraw()
							}
						}
					} else {
						a.stacked = !a.stacked;
						b.redraw()
					}
				}
			},
			lock : function() {
				this.locked = true
			},
			unlock : function() {
				this.locked = false
			},
			afterAnim : function(a, b) {
				a.on("afterrender", b, this, {
					single : true,
					delay : 1
				})
			},
			getSeries : function() {
				return this.chart.series.findBy(function(a) {
					return a.type === "bar" || a.type === "column"
				})
			}
		});
Ext.chart.interactions.Manager.registerType("togglestacked",
		Ext.chart.interactions.ToggleStacked);