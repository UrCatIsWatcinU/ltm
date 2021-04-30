function setClassName(elem, classList){
    console.log(...classList.split(/[(\s+)(,\s+)]/));
    elem.classList.add(...classList.split(/[(\s+)(,\s+)]/));
    return elem
}