function setItem(key, value) {
    if (value == null) value = "";
	localStorage[key] = value;
	// localStorage.setItem(key, value);
	return {"Key": key, "Value": value};
}

function getItem(key) {
	// return localStorage.getItem(key);
	var value = localStorage[key];
	if (value == "") value = null;
	return value;
}

function removeItem(key) {
	localStorage.removeItem(key);
}
