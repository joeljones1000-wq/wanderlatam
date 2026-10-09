(function () {
"use strict";
var page = (window.location.pathname.split("/").pop() || "index.html");
var footEl = document.getElementById("site-foot");
var ctaHref = (footEl && footEl.getAttribute("data-cta")) || "plan.html#form";
var ctaLabel = (footEl && footEl.getAttribute("data-cta-label")) || "Start my trip plan";
var links = [
["plan.html", "Holiday trips"],
["route.html", "Free 10-day route"],
["check.html", "Route checker"],
["birding.html", "Birding trips"],
["guides.html", "Guides"],
["about.html", "About"],
["faq.html", "FAQ"]
];
var navItems = links.map(function (l) {
var cur = l[0] === page ? ' aria-current="page"' : "";
return '<li><a href="' + l[0] + '"' + cur + ">" + l[1] + "</a></li>";
}).join("") + '<li><a class="nav-cta" href="' + ctaHref + '">' + ctaLabel + "</a></li>";
var headSlot = document.getElementById("site-head");
if (headSlot) {
headSlot.outerHTML =
'<a class="visually-hidden" href="#main">Skip to content</a>' +
'<header class="site-head"><div class="wrap head-row">' +
'<a class="brand" href="index.html"><svg class="brand-mark" viewBox="0 0 32 32" aria-hidden="true">' +
'<circle cx="21" cy="11" r="6" fill="#f5b800"/><path d="M2 28 L13 9 L19 19 L22 15 L30 28 Z" fill="#123d2e"/></svg>' +
"<span>Wander Latam<small>Costa Rica trip planning</small></span></a>" +
'<button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav">Menu</button>' +
'<nav class="site-nav" id="site-nav" aria-label="Main"><ul>' + navItems + "</ul></nav>" +
"</div></header>";
}
var footSlot = document.getElementById("site-foot");
if (footSlot) {
var noSticky = footSlot.hasAttribute("data-no-sticky");
footSlot.outerHTML =
'<footer class="site-foot"><div class="wrap"><div class="foot-grid">' +
"<div><h2>Wander Latam</h2><p>Trip plans and guides for people who only get one shot at this trip. " +
'Questions? Send them through the <a href="plan.html#form">trip form</a> and I\'ll reply within 48 hours.</p></div>' +
'<div><h2>Plan</h2><ul><li><a href="plan.html">Holiday trips</a></li><li><a href="birding.html">Birding trips</a></li>' +
'<li><a href="route.html">Free 10-day route</a></li><li><a href="check.html">Route checker</a></li><li><a href="guides.html">Guides</a></li></ul></div>' +
'<div><h2>The small print</h2><ul><li><a href="refunds.html">Refund policy</a></li><li><a href="terms.html">Terms</a></li>' +
'<li><a href="privacy.html">Privacy</a></li></ul></div></div>' +
'<p class="small">I plan and recommend. You book everything yourself, direct with the hotels and tour companies. ' +
"Prices and opening times change, so always check before you book.</p></div></footer>" +
(noSticky ? "" : '<a class="btn sticky-cta" href="' + ctaHref + '">' + ctaLabel + "</a>");
}
var toggle = document.querySelector(".nav-toggle");
var nav = document.querySelector(".site-nav");
if (toggle && nav) {
toggle.addEventListener("click", function () {
var open = nav.classList.toggle("open");
toggle.setAttribute("aria-expanded", open ? "true" : "false");
toggle.textContent = open ? "Close" : "Menu";
});
}
var sticky = document.querySelector(".sticky-cta");
if (sticky) {
var onScroll = function () { sticky.classList.toggle("show", window.scrollY > 520); };
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();
}
var FALLBACK_RATES = { GBP: 1, USD: 1.33, CAD: 1.84, EUR: 1.16, AUD: 2.03 };
var SUPPORTED = ["USD", "CAD", "GBP", "EUR", "AUD"];
var rates = FALLBACK_RATES;
function readPref() {
try { return window.localStorage.getItem("nwd-currency"); } catch (e) { return null; }
}
function savePref(c) {
try { window.localStorage.setItem("nwd-currency", c); } catch (e) { /* private mode */ }
}
function guessCurrency() {
var saved = readPref();
if (saved && SUPPORTED.indexOf(saved) > -1) return saved;
var tz = "";
try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch (e) { tz = ""; }
var lang = (navigator.language || "").toUpperCase();
var region = lang.split("-")[1] || "";
if (region === "CA" || /Toronto|Vancouver|Edmonton|Winnipeg|Halifax|Regina|St_Johns|Montreal/.test(tz)) return "CAD";
if (region === "AU" || tz.indexOf("Australia/") === 0) return "AUD";
if (region === "GB" || tz === "Europe/London") return "GBP";
if (tz.indexOf("Europe/") === 0) return "EUR";
return "USD";
}
var current = guessCurrency();
function format(amount, base) {
base = base || "USD";
var same = current === base;
var value = same ? amount : amount / (rates[base] || 1) * (rates[current] || 1);
var exact = same && amount % 1 !== 0;
var opts = { style: "currency", currency: current, maximumFractionDigits: exact ? 2 : 0, minimumFractionDigits: exact ? 2 : 0 };
var text;
try { text = new Intl.NumberFormat("en", opts).format(exact ? value : Math.round(value)); }
catch (e) { text = current + " " + Math.round(value); }
if (current === "CAD") text = text.replace(/^CA\$/, "C$");
if (current === "AUD") text = text.replace(/^A\$/, "A$");
if (current === "USD") text = text.replace(/^US\$/, "$");
return same ? text : "about " + text;
}
var afterPrices = [];
function renderPrices() {
var els = document.querySelectorAll("[data-gbp]");
for (var i = 0; i < els.length; i++) {
els[i].textContent = format(parseFloat(els[i].getAttribute("data-gbp")), "GBP");
}
var usd = document.querySelectorAll("[data-usd]");
for (var u = 0; u < usd.length; u++) {
usd[u].textContent = format(parseFloat(usd[u].getAttribute("data-usd")), "USD");
}
var notes = document.querySelectorAll("[data-currency-note]");
for (var j = 0; j < notes.length; j++) {
notes[j].hidden = current === (notes[j].getAttribute("data-currency-note") || "GBP");
}
var picks = document.querySelectorAll("select[data-currency]");
for (var k = 0; k < picks.length; k++) picks[k].value = current;
for (var h = 0; h < afterPrices.length; h++) afterPrices[h]();
}
window.NWD = { format: function (a, b) { return format(a, b); }, refresh: function () { renderPrices(); } };
var pickers = document.querySelectorAll("select[data-currency]");
for (var p = 0; p < pickers.length; p++) {
pickers[p].addEventListener("change", function (ev) {
current = ev.target.value;
savePref(current);
renderPrices();
});
}
if (document.querySelector("[data-gbp], [data-usd], #chooser, #checker")) {
renderPrices();
if (window.fetch) {
fetch("https://open.er-api.com/v6/latest/GBP")
.then(function (r) { return r.ok ? r.json() : null; })
.then(function (d) {
if (d && d.rates && d.rates.USD) {
rates = { GBP: 1 };
SUPPORTED.forEach(function (c) { if (d.rates[c]) rates[c] = d.rates[c]; });
renderPrices();
}
})
.catch(function () { /* keep fallback rates */ });
}
}
var form = document.getElementById("trip-form");
if (!form) return;
var CLIENT_ID = "e5f2f25a-19f1-4bb8-9c32-933839f622ee";
var FORM_ID = "02221390-7fd2-4bb5-8b16-dd3e8300cdb8";
var steps = form.querySelectorAll(".form-step");
var bars = form.querySelectorAll(".progress span");
var errorBox = form.querySelector(".form-error");
var stepIndex = 0;
var params = new URLSearchParams(window.location.search);
var preset = params.get("plan");
if (preset) {
var map = {
trip: "A full trip plan, built around us",
check: "A check of the plan I already have",
birding: "A birding trip plan, built around the birds I want"
};
var want = map[preset];
if (want) {
var radios = form.querySelectorAll('input[name="plan_type_c1a7"]');
for (var r = 0; r < radios.length; r++) if (radios[r].value === want) radios[r].checked = true;
}
}
var lenMap = { "7": "Up to 7 nights", "14": "8 to 14 nights", "15": "15 nights or more", "unsure": "Not sure yet" };
var lenWant = lenMap[params.get("len")];
if (lenWant) form.querySelector('[name="trip_length_9b3f"]').value = lenWant;
var noteWant = params.get("note");
if (noteWant) form.querySelector('[name="perfect_trip_b2d4"]').value = noteWant.slice(0, 900) + "\n\n";
function showStep(i) {
for (var s = 0; s < steps.length; s++) steps[s].hidden = s !== i;
for (var b = 0; b < bars.length; b++) bars[b].className = b <= i ? "done" : "";
errorBox.textContent = "";
stepIndex = i;
}
function stepValid(i) {
var fields = steps[i].querySelectorAll("[required]");
var seen = {};
for (var f = 0; f < fields.length; f++) {
var el = fields[f];
if (el.type === "radio") {
if (seen[el.name]) continue;
seen[el.name] = true;
if (!form.querySelector('input[name="' + el.name + '"]:checked')) {
errorBox.textContent = "Please choose an option for: " + el.getAttribute("data-label");
return false;
}
} else if (!el.value.trim()) {
errorBox.textContent = "Please fill in: " + el.getAttribute("data-label");
el.focus();
return false;
} else if (el.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim())) {
errorBox.textContent = "That email address doesn't look right. Please check it.";
el.focus();
return false;
}
}
return true;
}
form.addEventListener("click", function (ev) {
var t = ev.target;
if (t.matches("[data-next]")) {
ev.preventDefault();
if (stepValid(stepIndex)) {
showStep(stepIndex + 1);
form.scrollIntoView({ behavior: "smooth", block: "start" });
}
}
if (t.matches("[data-back]")) {
ev.preventDefault();
showStep(stepIndex - 1);
}
});
function value(name) {
var el = form.querySelector('[name="' + name + '"]');
if (!el) return "";
if (el.type === "radio") {
var c = form.querySelector('[name="' + name + '"]:checked');
return c ? c.value : "";
}
if (el.type === "checkbox") return el.checked;
return el.value.trim();
}
var DEPOSIT = 49;
var DEPOSIT_URL = "";
var BANDS = { "Up to 7 nights": 169, "8 to 14 nights": 209, "15 nights or more": 259 };
function both(usd) {
var local = current === "USD" ? "" : " (" + format(usd, "USD") + ")";
return "$" + usd + local;
}
function getQuote() {
var type = value("plan_type_c1a7");
var len = value("trip_length_9b3f");
if (!type) return null;
if (type.indexOf("check") > -1) return { label: "Itinerary check", total: 59, check: true };
var bird = type.indexOf("birding") > -1;
var base = BANDS[len];
var label = bird ? "Birding plan" : "Trip plan";
if (!base) return { label: label, total: null, from: 169 + (bird ? 60 : 0) };
return { label: label + ", " + len.toLowerCase(), total: base + (bird ? 60 : 0) };
}
function quoteHtml(q) {
if (!q) return "";
if (q.total === null) {
return '<p class="q-small">' + q.label + "</p>" +
'<p class="q-price">From ' + both(q.from) + "</p>" +
'<p class="q-small">The exact price depends on how many nights. I\'ll confirm it when I reply.</p>';
}
if (q.check) {
return '<p class="q-small">Your price</p><p class="q-price">' + both(q.total) + "</p>" +
'<p class="q-small">Itinerary check, paid upfront once I\'ve confirmed I can help.</p>';
}
var full = Math.round(q.total * 0.9);
return '<p class="q-small">Your price: ' + q.label + "</p>" +
'<p class="q-price">' + both(q.total) + "</p>" +
'<p class="q-small">A ' + both(DEPOSIT) + " deposit locks it in, and the rest is due when you're happy with the draft. " +
"Or pay in full and it's " + both(full) + ".</p>";
}
function renderQuote() {
var html = quoteHtml(getQuote());
var boxes = form.querySelectorAll("[data-quote]");
for (var qb = 0; qb < boxes.length; qb++) {
boxes[qb].innerHTML = html;
boxes[qb].hidden = !html;
}
}
form.addEventListener("change", renderQuote);
afterPrices.push(renderQuote);
form.addEventListener("submit", function (ev) {
ev.preventDefault();
if (!stepValid(stepIndex)) return;
var button = form.querySelector('button[type="submit"]');
button.disabled = true;
button.textContent = "Sending...";
var answers = {
plan_type_c1a7: value("plan_type_c1a7"),
travel_dates_d4e2: value("travel_dates_d4e2"),
trip_length_9b3f: value("trip_length_9b3f"),
travellers_5a81: value("travellers_5a81"),
pace_7e90: value("pace_7e90"),
perfect_trip_b2d4: value("perfect_trip_b2d4"),
first_name_4f1c: value("first_name_4f1c"),
email_8d27: value("email_8d27"),
subscribe_e63a: value("subscribe_e63a") === true
};
var budget = value("budget_pp_2c6d");
if (budget) answers.budget_pp_2c6d = budget;
fetch("https://www.wixapis.com/oauth2/token", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ clientId: CLIENT_ID, grantType: "anonymous" })
})
.then(function (r) { if (!r.ok) throw new Error("token"); return r.json(); })
.then(function (tok) {
return fetch("https://www.wixapis.com/form-submission-service/v4/submissions", {
method: "POST",
headers: { "Content-Type": "application/json", "Authorization": tok.access_token },
body: JSON.stringify({ submission: { formId: FORM_ID, submissions: answers } })
});
})
.then(function (r) { if (!r.ok) throw new Error("submit"); return r.json(); })
.then(function () {
var name = answers.first_name_4f1c ? ", " + answers.first_name_4f1c : "";
var q = getQuote();
var next = q && q.check ?
"<p>I'll read through your plan properly and email you within 48 hours to confirm I can help, with a secure link to pay.</p>" :
"<p>I'll read through your trip properly and email you within 48 hours with my first thoughts and a secure link to pay your deposit. That locks in your plan and I start on your draft.</p>";
var pay = DEPOSIT_URL && q && !q.check ?
'<div class="btn-row"><a class="btn" href="' + DEPOSIT_URL + '">Lock in my plan now</a></div>' : "";
form.innerHTML =
'<div class="form-done" role="status">' +
"<h3>Got it" + name.replace(/[<>&"]/g, "") + ". Thank you.</h3>" +
next +
(q ? '<div class="quote">' + quoteHtml(q) + "</div>" : "") +
pay +
"<p style=\"margin-top:1rem\">Keep an eye on your inbox, and your spam folder just in case.</p>" +
"</div>";
})
.catch(function () {
button.disabled = false;
button.textContent = "Send my trip details";
errorBox.textContent = "Your details didn't send. Check your connection and press Send again. Nothing you typed has been lost.";
});
});
showStep(0);
renderQuote();
})();
