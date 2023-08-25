const xhrStateVerifier = (xhr) => {
    if(xhr.readyState === 4 && xhr.status === 200) { return true; }
    else { return false; }
}

module.exports = { xhrStateVerifier }