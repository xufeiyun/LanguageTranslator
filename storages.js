function setItem(key, value) {
	localStorage[key] = value;
	// localStorage.setItem(key, value);
	return {"Key": key, "Value": value};
}

function getItem(key) {
	// return localStorage.getItem(key);
	return localStorage[key];
}

function removeItem(key) {
	localStorage.removeItem(key);
}