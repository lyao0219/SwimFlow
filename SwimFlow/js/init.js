const participantId = randomInt(1000000000000000);

const participantFrame = randomRange(15, 78); // unit: video current time, in second
function randomInt(max) {
	return Math.floor(Math.random() * max);
}

function randomRange(min, max) {
	return Math.round(Math.random() * (max-min)) + min;
}