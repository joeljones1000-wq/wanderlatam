(function () {
"use strict";
function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
function price(usd) { return '<span data-usd="' + usd + '">$' + usd + "</span>"; }
function gbpPrice(gbp) { return '<span data-gbp="' + gbp + '">£' + gbp + "</span>"; }
function refreshPrices() { if (window.NWD && window.NWD.refresh) window.NWD.refresh(); }
var chooser = document.getElementById("chooser");
if (chooser) {
var BANDS = { "7": 169, "14": 209, "15": 259 };
var LEN_TEXT = { "7": "a week or less", "14": "8 to 14 nights", "15": "15 nights or more", "unsure": "a length you're still deciding" };
var Q = {
stage: {
title: "Where are you up to with your trip?",
options: [
["dream", "Dreaming about it. Nothing booked yet"],
["flights", "Flights booked. Need to plan the rest"],
["check", "I've made a plan. Will it work?"],
["birding", "It's a birding trip"]
]
},
len: {
title: "How long have you got?",
options: [["7", "A week or less"], ["14", "8 to 14 nights"], ["15", "15 nights or more"], ["unsure", "Not sure yet"]]
},
pain: {
title: "What would spoil it for you?",
options: [
["drives", "Losing days to long drives"],
["places", "Picking the wrong places"],
["rain", "Rain ruining the plans"],
["prices", "Getting stung on prices"],
["kids", "Bored or worn-out kids"]
]
},
birdpain: {
title: "What would spoil it for you?",
options: [
["targets", "Missing the birds I came for"],
["drives", "Long drives eating the mornings"],
["lodges", "Picking the wrong lodges"],
["rain", "Rain on the mornings that matter"]
]
}
};
var PAIN_ECHO = {
drives: "losing days in the car", places: "picking the wrong places", rain: "rain ruining the plans",
prices: "getting stung on prices", kids: "bored or worn-out kids", targets: "missing the birds you came for",
lodges: "picking the wrong lodges"
};
var LEN_TIP = {
"7": "With a week or less, two bases is the sweet spot. La Fortuna plus one coast gives you a volcano, rainforest and a beach without a day of it going on the road.",
"14": "With 8 to 14 nights, three bases is usually plenty. Every hotel change costs you roughly half a day of packing, driving and checking in.",
"15": "With 15 nights or more you've got room for what most people skip: the Caribbean side, the Osa Peninsula or the highlands. Just don't spend the extra time moving every two nights.",
"unsure": "If you're still deciding, around 10 nights is where Costa Rica stops feeling rushed for most first trips."
};
var PAIN_TIP = {
drives: "Arenal and Monteverde look close on a map, but by road they're about 3 to 4 hours apart. A jeep, boat and jeep transfer across Lake Arenal cuts the driving.",
places: "Pick your coast by your month. The Pacific side's dry season runs roughly December to April. In September and October the Caribbean side is usually the drier one.",
rain: "In the green season, roughly May to November, mornings are usually the clearest and the rain tends to come in the afternoon. Put the hikes and wildlife first thing and save the hot springs for later.",
prices: "Third-party liability insurance is required by law on Costa Rica car hire and often isn't in the price you see online. Compare totals with it included, not the headline price.",
kids: "Keep single drives to about 3 hours and stay at least 3 nights in each place. Kids cope with one big travel day far better than three medium ones.",
targets: "Costa Rica's birds sort themselves by elevation. Quetzals need cloud forest or highlands, Scarlet Macaws the Pacific lowlands. A route that climbs and drops on purpose sees far more.",
lodges: "Some lodges famous for their feeders are a long drive from the trails you want. Judge a lodge by what's outside the door at 5:30am, not by its photos."
};
var BIRD_DRIVES = "Birds are busiest from first light until about nine. Move lodges in the afternoon, never at dawn, and you keep every one of your best hours.";
var answers = {};
var box = chooser.querySelector("[data-chooser-body]");
function stepHtml(key, num, total) {
var q = Q[key];
var opts = q.options.map(function (o) {
return '<button type="button" class="opt" data-q="' + key + '" data-v="' + o[0] + '">' + esc(o[1]) + "</button>";
}).join("");
var back = num > 1 ? '<button type="button" class="chooser-back" data-back>Back</button>' : "";
return '<p class="chooser-count">' + num + " of " + total + "</p>" +
'<p class="chooser-q">' + esc(q.title) + "</p><div class=\"opts\">" + opts + "</div>" + back;
}
var trail = [];
function show(html) {
box.innerHTML = html;
}
function next() {
var stage = answers.stage;
if (!stage) return show(stepHtml("stage", 1, 3));
if (stage === "check") { show(resultHtml()); refreshPrices(); return; }
if (!answers.len) return show(stepHtml("len", 2, 3));
if (!answers.pain) return show(stepHtml(stage === "birding" ? "birdpain" : "pain", 3, 3));
show(resultHtml());
refreshPrices();
try { window.localStorage.setItem("nwd-chooser", JSON.stringify(answers)); } catch (e) { }
}
function planLink(kind) {
var notes = [];
if (answers.pain) notes.push("The thing I'd hate most: " + PAIN_ECHO[answers.pain] + ".");
if (answers.stage === "flights") notes.push("Flights are booked: ");
var q = "plan.html?plan=" + kind + "&len=" + (answers.len || "unsure");
if (notes.length) q += "&note=" + encodeURIComponent(notes.join(" "));
return q + "#form";
}
function resultHtml() {
var s = answers.stage, len = answers.len, pain = answers.pain;
if (s === "check") {
return '<p class="chooser-q">Let\'s find out.</p>' +
"<p>Put your stops into my route checker. It shows your real drive times, how much daylight you'll spend on the road, and anything that'll catch you out, like a park that's shut the day you're there.</p>" +
'<div class="btn-row"><a class="btn" href="check.html">Check my route</a></div>' +
'<p class="chooser-alt">Rather I looked at it? An itinerary check is ' + price(59) + '. <a href="plan.html?plan=check#form">Send me your plan</a></p>' +
'<button type="button" class="chooser-back" data-restart>Start again</button>';
}
var bird = s === "birding";
var base = BANDS[len];
var amount = base ? price(base + (bird ? 60 : 0)) : "from " + price(bird ? 229 : 169);
var echo = "So: " + LEN_TEXT[len] + (s === "flights" ? ", flights booked" : "") + (bird ? ", birding" : "") +
", and the thing you'd hate is " + PAIN_ECHO[pain] + ".";
var tip = bird && pain === "drives" ? BIRD_DRIVES : PAIN_TIP[pain];
var tips = '<div class="chooser-tips"><p class="tag">Two things I\'d tell you straight away</p><ol>' +
"<li>" + esc(LEN_TIP[len]) + "</li><li>" + esc(tip) + "</li></ol></div>";
var primary, alt;
if (bird) {
primary = '<p>A birding plan does the rest for you: the route through the elevations, lodges, guides and target birds. For your trip it\'s ' + amount + '. A deposit of ' + price(49) + ' gets it started.</p>' +
'<div class="btn-row"><a class="btn" href="' + planLink("birding") + '">Plan my birding trip</a></div>';
alt = 'Rather plan it yourself? <a href="birding-guide.html">The Birding Trip Plan guide</a> is ' + gbpPrice(16.99) + ".";
} else if (s === "dream") {
primary = "<p>Start with my free 10-day route. It's the one I'd give a friend, with the drive times and the reasons behind it. When you've got dates, I can build the real thing around you for " + amount + ".</p>" +
'<div class="btn-row"><a class="btn" href="route.html">See the free route</a><a class="quiet-link" href="' + planLink("trip") + '">Or plan it with me</a></div>';
alt = 'Already sketched something? <a href="check.html">Check it in two minutes</a>.';
} else {
primary = "<p>With your flights fixed, the rest needs to fit around them. That's what a trip plan does: route, hotels, drive times and every booking link, built around your arrival and departure. For your trip it's " + amount + ". A deposit of " + price(49) + " gets it started.</p>" +
'<div class="btn-row"><a class="btn" href="' + planLink("trip") + '">Plan the rest of my trip</a></div>';
alt = 'Rather do it yourself? <a href="check.html">Check your route</a> or <a href="route.html">use my free route</a>.';
}
return '<p class="chooser-q">Here\'s where I\'d start.</p><p class="chooser-echo">' + esc(echo) + "</p>" + tips + primary +
'<p class="chooser-alt">' + alt + "</p>" + '<button type="button" class="chooser-back" data-restart>Start again</button>';
}
chooser.addEventListener("click", function (ev) {
var t = ev.target.closest("button");
if (!t) return;
if (t.hasAttribute("data-q")) {
var key = t.getAttribute("data-q");
answers[key === "birdpain" ? "pain" : key] = t.getAttribute("data-v");
trail.push(key === "birdpain" ? "pain" : key);
next();
if (chooser.getBoundingClientRect().top < 0) chooser.scrollIntoView({ behavior: "smooth", block: "start" });
} else if (t.hasAttribute("data-back")) {
var last = trail.pop();
if (last) delete answers[last];
next();
} else if (t.hasAttribute("data-restart")) {
answers = {}; trail = [];
next();
}
});
next();
}
var checker = document.getElementById("checker");
if (checker) {
var P = {
SJO: "San José airport", LIR: "Liberia airport", FOR: "La Fortuna (Arenal)", MON: "Monteverde",
MA: "Manuel Antonio", JAC: "Jacó", UVI: "Uvita and Dominical", SGD: "San Gerardo de Dota",
TAM: "Tamarindo", NOS: "Nosara", STT: "Santa Teresa", RIN: "Rincón de la Vieja",
SAR: "Sarapiquí", PV: "Puerto Viejo", TOR: "Tortuguero", BIJ: "Río Celeste (Bijagua)",
SAM: "Sámara", COC: "Playas del Coco", DRA: "Drake Bay"
};
var SHORT = { SJO: "SJO", LIR: "LIR", FOR: "Arenal", MON: "Monteverde", MA: "Manuel Antonio", JAC: "Jacó", UVI: "Uvita", SGD: "San Gerardo", TAM: "Tamarindo", NOS: "Nosara", STT: "Santa Teresa", RIN: "Rincón", SAR: "Sarapiquí", PV: "Puerto Viejo", TOR: "Tortuguero", BIJ: "Río Celeste", SAM: "Sámara", COC: "Coco", DRA: "Drake Bay" };
var GROUPS = [
["Arenal and the north", ["FOR", "BIJ", "RIN", "SAR"]],
["Cloud forest and mountains", ["MON", "SGD"]],
["Central and south Pacific", ["MA", "JAC", "UVI", "DRA"]],
["Guanacaste and Nicoya beaches", ["TAM", "COC", "SAM", "NOS", "STT"]],
["Caribbean", ["PV", "TOR"]]
];
var ORDER = ["SJO", "LIR", "FOR", "MON", "MA", "JAC", "UVI", "SGD", "TAM", "NOS", "STT", "RIN", "SAR", "PV", "TOR", "BIJ", "SAM", "COC", "DRA"];
var ROWS = {
SJO: [0, 4, 3, 3.5, 3, 1.5, 3.5, 2.5, 4.5, 5, 5, 4, 2, 4.5, 5, 3.5, 4.5, 4.5, 6],
LIR: [4, 0, 3, 3, 5, 3.5, 5.5, 5, 1.25, 2.5, 4, 1, 3.5, 7, 6, 1.25, 2, 0.5, 8],
FOR: [3, 3, 0, 3.5, 4.5, 4, 5.5, 4.5, 3.5, 4, 5, 3, 1.5, 5, 4, 2, 4, 3, 8],
MON: [3.5, 3, 3.5, 0, 3.5, 2.5, 5, 4.5, 3, 3.5, 4, 3, 4, 6.5, 6, 2.5, 3.5, 3, 7],
MA: [3, 5, 4.5, 3.5, 0, 1.25, 1, 3, 5, 5, 5, 5, 4, 7, 6.5, 4.5, 4.5, 5, 3.5],
JAC: [1.5, 3.5, 4, 2.5, 1.25, 0, 2, 3.5, 3.5, 4, 3.5, 3.5, 3, 5.5, 6, 3.5, 3.5, 3.5, 4],
UVI: [3.5, 5.5, 5.5, 5, 1, 2, 0, 2, 6, 6, 5.5, 6, 5, 7.5, 7, 5.5, 5.5, 6, 2.5],
SGD: [2.5, 5, 4.5, 4.5, 3, 3.5, 2, 0, 6, 6, 6.5, 5.5, 3.5, 5.5, 6, 5.5, 6, 5.5, 4],
TAM: [4.5, 1.25, 3.5, 3, 5, 3.5, 6, 6, 0, 2, 3.5, 2, 4.5, 7.5, 6.5, 2, 1.5, 1.25, 8.5],
NOS: [5, 2.5, 4, 3.5, 5, 4, 6, 6, 2, 0, 3, 3, 4.5, 8, 7.5, 3, 1, 2.5, 8.5],
STT: [5, 4, 5, 4, 5, 3.5, 5.5, 6.5, 3.5, 3, 0, 4.5, 5.5, 8, 7.5, 4.5, 2.5, 4, 8],
RIN: [4, 1, 3, 3, 5, 3.5, 6, 5.5, 2, 3, 4.5, 0, 4, 7, 6.5, 1.5, 2.5, 1.25, 8],
SAR: [2, 3.5, 1.5, 4, 4, 3, 5, 3.5, 4.5, 4.5, 5.5, 4, 0, 3.5, 3, 3, 4.5, 4, 7.5],
PV: [4.5, 7, 5, 6.5, 7, 5.5, 7.5, 5.5, 7.5, 8, 8, 7, 3.5, 0, 4.5, 6.5, 7.5, 7.5, 9],
TOR: [5, 6, 4, 6, 6.5, 6, 7, 6, 6.5, 7.5, 7.5, 6.5, 3, 4.5, 0, 5.5, 7, 6.5, 9],
BIJ: [3.5, 1.25, 2, 2.5, 4.5, 3.5, 5.5, 5.5, 2, 3, 4.5, 1.5, 3, 6.5, 5.5, 0, 3, 1.5, 8],
SAM: [4.5, 2, 4, 3.5, 4.5, 3.5, 5.5, 6, 1.5, 1, 2.5, 2.5, 4.5, 7.5, 7, 3, 0, 2, 8],
COC: [4.5, 0.5, 3, 3, 5, 3.5, 6, 5.5, 1.25, 2.5, 4, 1.25, 4, 7.5, 6.5, 1.5, 2, 0, 8.5],
DRA: [6, 8, 8, 7, 3.5, 4, 2.5, 4, 8.5, 8.5, 8, 8, 7.5, 9, 9, 8, 8, 8.5, 0]
};
var REGION = { SJO: "valley", LIR: "pacn", FOR: "north", MON: "cloud", MA: "pacc", JAC: "pacc", UVI: "pacs", SGD: "high", TAM: "pacn", NOS: "pacn", STT: "pacc", RIN: "pacn", SAR: "north", PV: "carib", TOR: "carib", BIJ: "north", SAM: "pacn", COC: "pacn", DRA: "pacs" };
var WET = {
valley: [0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 1, 0],
pacn: [0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 1, 0],
pacc: [0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 1, 0],
pacs: [0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 1],
north: [1, 0, 0, 0, 1, 1, 2, 1, 1, 1, 2, 1],
cloud: [1, 0, 0, 0, 1, 1, 1, 1, 2, 2, 1, 1],
high: [0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 1, 0],
carib: [1, 0, 0, 1, 1, 1, 2, 1, 0, 0, 2, 2]
};
var WET_TEXT = ["Usually dry", "Some rain, mostly in the afternoon", "One of the wettest months here"];
var SUNSET = [17.67, 17.92, 17.97, 18, 18.08, 18.17, 18.25, 18.08, 17.75, 17.47, 17.25, 17.33];
var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var MAPD = "M392,63L396,67L403,83L403,89L400,86L396,75L399,88L398,94L394,98L396,98L402,93L401,94L402,98L404,90L422,136L434,156L466,198L485,219L490,217L496,219L499,228L520,257L527,264L532,263L535,275L538,277L549,281L560,282L564,283L568,290L571,291L573,298L566,296L563,307L558,306L554,305L548,297L545,297L538,291L529,287L526,287L520,293L523,303L526,304L526,306L523,307L514,308L511,309L509,312L510,379L517,377L520,382L524,383L532,389L542,393L547,402L544,406L539,409L520,418L518,420L521,421L521,424L513,430L512,433L515,437L520,443L525,452L527,468L525,479L521,484L508,490L500,497L493,501L491,505L497,509L500,513L505,513L509,516L510,521L519,541L517,552L515,550L517,542L517,540L505,521L475,496L484,485L484,480L477,471L477,468L483,465L473,464L469,456L470,454L472,454L473,460L475,460L479,458L479,457L475,454L472,450L469,452L460,452L457,448L454,447L452,448L447,445L445,442L446,439L444,439L445,436L442,434L436,433L435,435L431,434L430,437L422,437L419,438L419,441L421,440L433,458L446,463L450,468L452,466L452,472L451,474L453,478L454,484L454,490L452,494L448,494L436,490L434,487L439,488L433,485L433,487L423,483L406,484L404,483L398,475L382,460L377,458L377,452L383,443L387,441L389,442L390,441L395,434L393,431L395,428L404,425L404,424L398,423L395,426L394,427L393,426L396,420L402,417L403,415L402,413L398,410L397,407L404,410L398,404L395,404L397,402L395,400L395,398L400,394L394,381L391,379L390,380L379,365L372,363L373,359L369,355L360,352L347,339L332,331L316,325L313,326L311,324L309,325L307,322L304,322L305,319L299,310L295,309L295,310L299,312L295,311L288,307L279,306L257,300L244,301L241,295L238,295L239,297L230,291L229,286L224,283L223,279L220,279L220,272L227,261L227,256L217,242L212,239L212,237L215,233L211,229L210,228L211,225L206,224L191,225L191,224L202,223L202,222L192,221L184,217L173,209L174,208L171,207L164,200L158,196L156,197L154,196L155,193L152,191L149,192L137,192L131,189L127,185L128,181L118,172L119,176L124,179L125,183L127,195L129,199L127,200L127,203L134,207L138,213L141,213L141,214L136,213L136,214L142,220L154,225L155,224L167,230L173,229L181,235L181,236L178,237L178,239L182,244L178,247L180,249L189,249L189,250L181,254L179,258L175,261L173,266L166,263L164,265L167,270L156,276L152,289L148,295L147,295L142,285L127,263L121,261L121,257L116,252L111,249L93,243L88,245L86,245L79,241L77,242L64,238L60,236L56,237L55,235L56,231L54,227L37,206L26,181L23,171L27,167L21,160L28,150L31,151L34,147L37,144L32,136L34,135L34,134L32,134L32,133L35,131L36,128L40,130L46,127L50,127L50,125L53,120L56,120L61,115L61,113L58,111L51,118L51,116L50,116L52,113L55,112L53,111L52,112L52,111L55,110L53,107L56,105L56,88L53,85L47,83L42,82L38,84L33,78L35,78L34,76L28,76L15,70L9,69L9,68L20,64L23,63L20,60L31,60L31,64L34,67L36,66L34,62L36,61L43,61L46,63L48,63L49,61L47,58L51,56L50,54L42,47L47,44L50,46L53,46L55,44L53,39L50,37L56,24L61,18L67,15L82,25L178,60L182,61L186,60L215,40L220,39L230,45L236,45L252,51L257,57L260,59L263,58L274,52L276,54L276,58L281,64L289,67L299,74L299,78L295,81L301,88L303,86L310,86L316,90L319,89L320,91L325,88L328,89L329,87L332,86L334,88L334,90L347,99L352,97L356,98L361,93L383,86L389,83L390,79L388,73L388,64L392,63ZM145,203L151,205L151,206L143,207L137,206L133,200L138,199L148,201L148,202L142,202L145,203Z";
var XY = {SJO: [299, 220], LIR: [76, 120], FOR: [226, 140], MON: [196, 167], MA: [311, 323], JAC: [228, 285], UVI: [377, 362], SGD: [366, 295], TAM: [27, 169], NOS: [58, 223], STT: [139, 280], RIN: [108, 93], SAR: [330, 143], PV: [541, 278], TOR: [416, 128], BIJ: [157, 96], SAM: [79, 240], COC: [51, 127], DRA: [388, 441]};
var TEMPLATES = {
classic: { a: "SJO", d: "SJO", s: [["FOR", 3], ["MON", 2], ["MA", 4]] },
week: { a: "LIR", d: "LIR", s: [["FOR", 3], ["TAM", 4]] },
south: { a: "SJO", d: "SJO", s: [["FOR", 3], ["MON", 2], ["MA", 3], ["UVI", 3], ["SGD", 2]] },
birding: { a: "SJO", d: "SJO", s: [["SAR", 3], ["FOR", 2], ["MON", 3], ["JAC", 2], ["SGD", 3]] }
};
function hrs(a, b) { return ROWS[a][ORDER.indexOf(b)]; }
function fmtH(h) {
var whole = Math.floor(h), mins = Math.round((h - whole) * 60);
if (!whole) return mins + " min";
return whole + (mins ? "h " + mins + "m" : (whole === 1 ? " hour" : " hours"));
}
function clock(t) {
var q = Math.floor(t * 4) / 4;
var h = Math.floor(q), m = Math.round((q - h) * 60);
var ap = h >= 12 ? "pm" : "am";
var hh = h % 12 === 0 ? 12 : h % 12;
return hh + (m ? ":" + (m < 10 ? "0" : "") + m : "") + ap;
}
var listEl = checker.querySelector("[data-stops]");
var arrive = checker.querySelector("[data-arrive]");
var depart = checker.querySelector("[data-depart]");
var monthEl = checker.querySelector("[data-month]");
var out = document.getElementById("checker-result");
function placeOptions(code) {
return '<option value="">Choose a place</option>' + GROUPS.map(function (g) {
return '<optgroup label="' + g[0] + '">' + g[1].map(function (c) {
return '<option value="' + c + '"' + (c === code ? " selected" : "") + ">" + P[c] + "</option>";
}).join("") + "</optgroup>";
}).join("");
}
function stopRow(code, nights) {
var li = document.createElement("li");
li.className = "stop";
li.innerHTML = '<select aria-label="Place">' + placeOptions(code) + "</select>" +
'<div class="nights-pick"><button type="button" data-minus aria-label="One night fewer">−</button>' +
"<span></span>" +
'<button type="button" data-plus aria-label="One night more">+</button></div>' +
'<div class="stop-tools"><button type="button" class="stop-move" data-up aria-label="Move up">↑</button><button type="button" class="stop-move" data-down aria-label="Move down">↓</button>' +
'<button type="button" class="stop-x" data-remove aria-label="Remove this stop">Remove</button></div>';
listEl.appendChild(li);
setN(li, nights || 2);
}
function setN(li, n) {
n = Math.max(1, Math.min(14, n));
li.setAttribute("data-n", n);
li.querySelector(".nights-pick span").innerHTML = "<b>" + n + "</b> " + (n === 1 ? "night" : "nights");
}
function readStops() {
var rows = listEl.querySelectorAll(".stop"), res = [];
for (var i = 0; i < rows.length; i++) {
var c = rows[i].querySelector("select").value;
var n = parseInt(rows[i].getAttribute("data-n"), 10);
if (!c) continue;
if (res.length && res[res.length - 1].code === c) res[res.length - 1].n += n;
else res.push({ code: c, n: n });
}
return res;
}
function load(stops, a, d) {
listEl.innerHTML = "";
stops.forEach(function (s) { stopRow(s[0], s[1]); });
arrive.value = a; depart.value = d;
}
function encodeRoute() {
var s = readStops();
var r = [arrive.value].concat(s.map(function (x) { return x.code + x.n; })).concat([depart.value]).join("-");
var m = monthEl.value;
return "r=" + r + (m ? "&m=" + m : "");
}
function decodeRoute(q) {
var p = new URLSearchParams(q);
var r = (p.get("r") || "").split("-");
if (r.length < 3) return false;
var a = r[0], d = r[r.length - 1];
if (["SJO", "LIR"].indexOf(a) < 0 || ["SJO", "LIR"].indexOf(d) < 0) return false;
var stops = [];
for (var i = 1; i < r.length - 1; i++) {
var mm = /^([A-Z]+)(\d{1,2})$/.exec(r[i]);
if (!mm || !P[mm[1]] || ["SJO", "LIR"].indexOf(mm[1]) > -1) return false;
stops.push([mm[1], parseInt(mm[2], 10)]);
}
load(stops, a, d);
var m = parseInt(p.get("m"), 10);
if (m >= 1 && m <= 12) monthEl.value = String(m);
return true;
}
checker.addEventListener("click", function (ev) {
var t = ev.target.closest("button");
if (!t) return;
var li = t.closest(".stop");
if (t.hasAttribute("data-plus")) setN(li, parseInt(li.getAttribute("data-n"), 10) + 1);
if (t.hasAttribute("data-minus")) setN(li, parseInt(li.getAttribute("data-n"), 10) - 1);
if (t.hasAttribute("data-up") && li.previousElementSibling) listEl.insertBefore(li, li.previousElementSibling);
if (t.hasAttribute("data-down") && li.nextElementSibling) listEl.insertBefore(li.nextElementSibling, li);
if (t.hasAttribute("data-remove")) { li.parentNode.removeChild(li); if (!listEl.children.length) stopRow("", 2); }
if (t.hasAttribute("data-add")) { stopRow("", 2); listEl.lastChild.querySelector("select").focus(); }
if (t.hasAttribute("data-template")) { var tp = TEMPLATES[t.getAttribute("data-template")]; load(tp.s, tp.a, tp.d); run(); }
if (t.hasAttribute("data-run")) run();
});
function bestOrder(stops, a, d) {
var n = stops.length;
if (n < 3 || n > 7) return null;
var idx = stops.map(function (s, i) { return i; });
var best = null, bestH = Infinity;
function total(order) {
var h = 0, prev = a;
for (var i = 0; i < order.length; i++) { h += hrs(prev, stops[order[i]].code); prev = stops[order[i]].code; }
return h + hrs(prev, d);
}
function perm(arr, k) {
if (k === arr.length) { var h = total(arr); if (h < bestH - 0.01) { bestH = h; best = arr.slice(); } return; }
for (var i = k; i < arr.length; i++) {
var t = arr[k]; arr[k] = arr[i]; arr[i] = t;
perm(arr, k + 1);
t = arr[k]; arr[k] = arr[i]; arr[i] = t;
}
}
perm(idx, 0);
return { order: best, h: bestH };
}
function mapSvg(a, stops, d) {
var pts = [a].concat(stops.map(function (s) { return s.code; })).concat([d]);
var line = pts.map(function (c, i) { return (i ? "L" : "M") + XY[c][0] + "," + XY[c][1]; }).join("");
var marks = stops.map(function (s, i) {
var p = XY[s.code];
return '<g><circle cx="' + p[0] + '" cy="' + p[1] + '" r="15" class="m-stop"/><text x="' + p[0] + '" y="' + (p[1] + 5) + '" class="m-num">' + (i + 1) + "</text>" +
'<text x="' + (p[0] + 20) + '" y="' + (p[1] + 5) + '" class="m-label">' + SHORT[s.code] + "</text></g>";
}).join("");
var ends = [a, d].filter(function (c, i, arr) { return arr.indexOf(c) === i; }).map(function (c) {
var p = XY[c];
return '<rect x="' + (p[0] - 9) + '" y="' + (p[1] - 9) + '" width="18" height="18" rx="4" class="m-air"/><text x="' + (p[0] + 14) + '" y="' + (p[1] - 12) + '" class="m-label m-airlabel">' + c + "</text>";
}).join("");
return '<svg class="route-map" viewBox="0 15 600 555" role="img" aria-label="Map of your route"><path d="' + MAPD + '" class="m-land"/>' +
'<text x="120" y="420" class="m-sea">Pacific</text><text x="470" y="90" class="m-sea">Caribbean</text>' +
'<path d="' + line + '" class="m-line"/>' + ends + marks + "</svg>";
}
function run(skipScroll) {
var stops = readStops();
if (!stops.length) {
out.hidden = false;
out.innerHTML = '<p class="form-error">Add at least one place to stay, then check again.</p>';
return;
}
var a = arrive.value, d = depart.value;
var month = parseInt(monthEl.value, 10) || 0;
var sunset = month ? SUNSET[month - 1] : 17.75;
var nights = stops.reduce(function (s, x) { return s + x.n; }, 0);
var days = nights + 1;
var legs = [], prev = a;
stops.forEach(function (s) { legs.push({ from: prev, to: s.code, h: hrs(prev, s.code) }); prev = s.code; });
legs.push({ from: prev, to: d, h: hrs(prev, d) });
var total = legs.reduce(function (s, l) { return s + l.h; }, 0);
var share = total / (days * 12);
var flags = [], good = [];
var codes = stops.map(function (s) { return s.code; });
function has(c) { return codes.indexOf(c) > -1; }
function hasAny(list) { return list.some(has); }
var land = sunset - legs[0].h - 1.5;
if (legs[0].h >= 2.5) flags.push([legs[0].h >= 4.5 ? "warn" : "tip", "Your first drive is about " + fmtH(legs[0].h) + ". If your flight lands after about " + clock(land) + ", you'll finish it in the dark after a long travel day. Plenty of people stay the first night near the airport and go in the morning."]);
var lastLeg = legs[legs.length - 1];
if (lastLeg.h >= 3) flags.push([lastLeg.h >= 4.5 ? "warn" : "tip", "Your last drive to the airport is about " + fmtH(lastLeg.h) + ". Add check-in time and that's a very early start, or a last night near the airport."]);
legs.forEach(function (l, i) {
if (i === 0 || i === legs.length - 1) return;
if (l.h >= 4.5) flags.push(["bad", P[l.from] + " to " + P[l.to] + " is about " + fmtH(l.h) + ". To arrive before dark you'd leave by " + clock(sunset - l.h - 1) + ", and most of that day goes on the road."]);
});
stops.forEach(function (s) {
if (s.n === 1) flags.push(["warn", "One night in " + P[s.code] + " gets you an evening and a morning there, not a day. Worth it only if it breaks up a long drive."]);
});
var changes = stops.length - 1;
if (stops.length >= 3 && nights / stops.length < 2.5) flags.push(["bad", "You're moving roughly every " + (nights / stops.length).toFixed(1).replace(".0", "") + " nights. Each hotel change costs about half a day, so this trip will feel busier than it looks."]);
for (var i = 1; i < codes.length; i++) {
var pair = codes[i - 1] + codes[i];
if (pair === "FORMON" || pair === "MONFOR") good.push("Between La Fortuna and Monteverde, look at the jeep, boat and jeep transfer across Lake Arenal. Less driving, and a better view.");
}
if (has("MA")) good.push("Manuel Antonio National Park is closed on Tuesdays, and tickets are online only with a daily cap. Book your day before you go.");
if (has("TOR")) good.push("There are no roads into Tortuguero. You leave the car or shuttle at the dock and go in by boat, so plan two nights at least.");
if (has("STT")) good.push("From the Central Pacific, the quickest way to Santa Teresa is usually the Puntarenas car ferry. It can sell out at busy times, so book it.");
if (has("SGD")) good.push("San Gerardo de Dota sits around 2,000 metres up. Nights are properly cold, so pack layers.");
if (has("DRA")) good.push("Most people reach Drake Bay by driving to Sierpe and taking a boat, so the journey in takes most of a day. Corcovado needs a certified guide.");
if (has("BIJ")) good.push("Río Celeste's famous blue water can turn cloudy after heavy rain. Give yourself a flexible morning there if you can.");
if (has("PV") && hasAny(["MA", "TAM", "STT", "NOS", "UVI", "SAM", "COC", "JAC", "DRA"]) && nights <= 12)
flags.push(["warn", "You've got the Caribbean and the Pacific in " + nights + " nights. Both are worth it, but crossing between them is a long day. Most trips this length do better picking one."]);
["SJO", "LIR"].forEach(function (end, k) {
var leg = k === 0 ? legs[0] : lastLeg;
var other = (k === 0 ? a : d) === "SJO" ? "LIR" : "SJO";
var otherH = k === 0 ? hrs(other, stops[0].code) : hrs(stops[stops.length - 1].code, other);
if (leg.h - otherH >= 1.5) flags.push(["tip", (k === 0 ? "Flying into " : "Flying home from ") + P[other] + " instead would save about " + fmtH(leg.h - otherH) + " on " + (k === 0 ? "your first day." : "your last day.")]);
});
var seasonal = [];
if (month) {
var mi = month - 1;
var seen = {};
stops.forEach(function (s) {
var w = WET[REGION[s.code]][mi];
if (seen[s.code]) return;
seen[s.code] = true;
seasonal.push("<li><span>" + P[s.code] + '</span><b class="w' + w + '">' + WET_TEXT[w] + "</b></li>");
});
if (has("TOR") && month >= 7 && month <= 10) good.push("It's green turtle nesting season in Tortuguero. Night tours with a licensed guide sell out, so book ahead.");
if (has("UVI") && (month >= 7 && month <= 10 || month === 12 || month <= 3)) good.push("Humpback whales are often off Uvita and Marino Ballena around now. A morning boat trip is worth it.");
if ((has("SGD") || has("MON")) && month >= 2 && month <= 5) good.push("Quetzals nest roughly February to May, which is the best time to see one. Go early with a local guide.");
if (has("DRA") && (month === 9 || month === 10)) flags.push(["warn", "Some Drake Bay lodges close in the wettest weeks, often around October. Check yours is open before you plan around it."]);
if (month === 12 || month <= 4) good.push(MONTHS[mi] + " is high season. The best places and park tickets go early, so book stays and tours as soon as your route's settled.");
var wetStops = stops.filter(function (s) { return WET[REGION[s.code]][mi] === 2; }).map(function (s) { return P[s.code]; });
if (wetStops.length) flags.push(["tip", MONTHS[mi] + " is one of the wettest months in " + wetStops.join(" and ") + ". Plan the big outdoor things for the mornings."]);
var dryCarib = WET.carib[mi] === 0 && WET.pacc[mi] === 2;
if (dryCarib && !hasAny(["PV", "TOR"])) flags.push(["tip", "In " + MONTHS[mi] + " the Caribbean side is usually drier than the Pacific. Puerto Viejo could be worth a look."]);
}
var opt = bestOrder(stops, a, d);
var better = opt && total - opt.h >= 1 ? opt : null;
var bad = flags.filter(function (f) { return f[0] === "bad"; }).length;
var warn = flags.filter(function (f) { return f[0] === "warn"; }).length;
var score = 10 - Math.max(0, share - 0.08) * 30 - bad * 1.5 - warn * 0.75;
score = Math.max(1, Math.min(10, Math.round(score * 10) / 10));
var level, title, sub;
if (score < 5.5) {
level = "bad"; title = "You'll feel this one.";
sub = "There's a good trip in here, but right now too much of it happens on the road.";
} else if (score < 8) {
level = "warn"; title = "Doable, but tight.";
sub = "It works, with a couple of things worth fixing before you book.";
} else {
level = "good"; title = "This is in good shape.";
sub = "Sensible drives and enough time in each place. Nice work.";
}
var pct = Math.round(share * 100);
var tiles = [], full = 0, lost = 0;
function travelTile(l, dayNo) {
var cls = l.h >= 4.5 ? "t-lost" : l.h >= 2.5 ? "t-half" : "t-short";
if (l.h >= 4.5) lost++;
tiles.push('<li class="' + cls + '" title="Day ' + dayNo + ": " + SHORT[l.from] + " to " + SHORT[l.to] + ", about " + fmtH(l.h) + '"><span>' + dayNo + "</span></li>");
}
var dayNo = 1;
stops.forEach(function (s, i) {
travelTile(legs[i], dayNo++);
for (var k = 1; k < s.n; k++) { tiles.push('<li class="t-full" title="Day ' + dayNo + ": " + SHORT[s.code] + '"><span>' + dayNo + "</span></li>"); full++; dayNo++; }
});
travelTile(lastLeg, dayNo);
var routeText = P[a] + " > " + stops.map(function (s) { return P[s.code] + " (" + s.n + (s.n === 1 ? " night" : " nights") + ")"; }).join(" > ") + " > " + P[d];
var legsHtml = legs.map(function (l, i) {
var when = i === 0 ? "" : '<small>Leave by ' + clock(sunset - l.h - 1) + " to arrive in daylight</small>";
if (i > 0 && sunset - l.h - 1 < 7) when = "<small>Too long to do comfortably in daylight</small>";
return "<li><span>" + P[l.from] + " to " + P[l.to] + when + "</span><b>" + fmtH(l.h) + "</b></li>";
}).join("");
function fl(list) { return list.map(function (f) { return '<li class="f-' + f[0] + '">' + esc(f[1]) + "</li>"; }).join(""); }
var flagsHtml = fl(flags.filter(function (f) { return f[0] !== "tip"; }));
var tipsHtml = fl(flags.filter(function (f) { return f[0] === "tip"; }));
var goodHtml = good.filter(function (g, i) { return good.indexOf(g) === i; }).map(function (g) { return "<li>" + esc(g) + "</li>"; }).join("");
var betterHtml = "";
if (better) {
var names = better.order.map(function (i) { return SHORT[stops[i].code]; }).join(" → ");
betterHtml = '<div class="better"><p class="tag">Same stops, less driving</p><p>Try this order: <b>' + names + "</b>. It saves about " + fmtH(total - better.h) + ' on the road.</p><button type="button" class="btn secondary" data-apply="' + better.order.join(",") + '">Use this order</button></div>';
}
var note = "My route: " + routeText + (month ? ", travelling in " + MONTHS[month - 1] : "") + ". The checker gave it " + score + "/10.";
var lenCode = nights <= 7 ? "7" : nights <= 14 ? "14" : "15";
var cta;
if (level === "good") {
cta = "<h3>Want it turned into the real thing?</h3><p>A trip plan takes your route and adds where to stay each night, what to do each day, rain backups and every booking link, in the order to book them.</p>" +
'<div class="btn-row"><a class="btn" href="plan.html?plan=trip&len=' + lenCode + "&note=" + encodeURIComponent(note) + '#form">Build my plan from this</a></div>';
} else {
cta = "<h3>Want me to fix it?</h3><p>Send me this route and I'll check it properly: the order, the drives, where to stay, and what to book first. An itinerary check is " + price(59) + ", and your route goes over with it, so there's nothing to type again.</p>" +
'<div class="btn-row"><a class="btn" href="plan.html?plan=check&note=' + encodeURIComponent(note) + '#form">Get my route checked</a></div>' +
'<p class="chooser-alt">Or <a href="plan.html?plan=trip&len=' + lenCode + "&note=" + encodeURIComponent(note) + '#form">have me plan the whole trip</a> instead.</p>';
}
out.hidden = false;
out.innerHTML =
'<div class="verdict v-' + level + '"><div class="score"><b>' + score + "</b><span>/10</span></div><div><p class=\"verdict-title\">" + title + "</p><p>" + sub + "</p></div></div>" +
'<dl class="stats"><div><dt>Nights</dt><dd>' + nights + "</dd></div><div><dt>Hotel changes</dt><dd>" + changes + "</dd></div>" +
"<div><dt>On the road</dt><dd>" + fmtH(total) + "</dd></div><div><dt>Of your daylight hours</dt><dd>" + pct + "%</dd></div></dl>" +
mapSvg(a, stops, d) +
'<h3>Your trip, day by day</h3><p class="days-sum"><b>' + full + " full days</b> and " + (days - full) + " travel days" + (lost ? ", " + lost + " of them mostly lost to the road" : ", none of them lost to the road") + ".</p>" +
'<ul class="trip-days">' + tiles.join("") + "</ul>" +
'<ul class="trip-key"><li class="t-full">Full day</li><li class="t-short">Short move</li><li class="t-half">Half a day on the road</li><li class="t-lost">Day mostly on the road</li></ul>' +
betterHtml +
"<h3>Your drives</h3><ul class=\"legs\">" + legsHtml + "</ul>" +
(seasonal.length ? "<h3>Weather in " + MONTHS[month - 1] + "</h3><ul class=\"legs wx\">" + seasonal.join("") + "</ul>" : "") +
(flagsHtml ? "<h3>Worth fixing</h3><ul class=\"flags\">" + flagsHtml + "</ul>" : "") +
(tipsHtml ? "<h3>Worth a thought</h3><ul class=\"flags\">" + tipsHtml + "</ul>" : "") +
(goodHtml ? "<h3>Good to know for your stops</h3><ul class=\"ticks\">" + goodHtml + "</ul>" : "") +
'<div class="share-row"><button type="button" class="btn secondary" data-share>Share my route</button><span class="share-msg" aria-live="polite"></span></div>' +
'<div class="callout">' + cta + "</div>";
out.setAttribute("data-score", score);
refreshPrices();
try { history.replaceState(null, "", "?" + encodeRoute()); } catch (e) { }
if (!skipScroll) out.scrollIntoView({ behavior: "smooth", block: "start" });
}
out.addEventListener("click", function (ev) {
var t = ev.target.closest("button");
if (!t) return;
if (t.hasAttribute("data-apply")) {
var stops = readStops();
var order = t.getAttribute("data-apply").split(",").map(Number);
load(order.map(function (i) { return [stops[i].code, stops[i].n]; }), arrive.value, depart.value);
run();
}
if (t.hasAttribute("data-share")) {
var url = location.origin + location.pathname + "?" + encodeRoute();
var text = "My Costa Rica route scored " + out.getAttribute("data-score") + "/10 on the Wander Latam route checker. What would you change?";
var msg = out.querySelector(".share-msg");
if (navigator.share) {
navigator.share({ title: "My Costa Rica route", text: text, url: url }).catch(function () { });
} else if (navigator.clipboard) {
navigator.clipboard.writeText(text + " " + url).then(function () { msg.textContent = "Link copied. Paste it anywhere."; }, function () { msg.textContent = url; });
} else {
msg.textContent = url;
}
}
});
if (!decodeRoute(location.search)) stopRow("", 3);
else run(true);
}
})();
