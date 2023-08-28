const xhrStateVerifier = (xhr) => {
    if(xhr.readyState === 4 && xhr.status > 0) { return true; }
    else { return false; }
}

const xhrStatusVerifier = (xhr) => {
    if(xhr.status < 300) { return true; }
    else { return false; }
}

module.exports = { xhrStateVerifier, xhrStatusVerifier }