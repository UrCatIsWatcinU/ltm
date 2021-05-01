function setClassName(elem, classList){
    elem.classList.add(...classList.split(/[(\s+)(,\s+)]/));
    return elem
}