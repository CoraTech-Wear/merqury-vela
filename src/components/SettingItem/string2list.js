const string2list = (str) => {
    const arr = str.match(/"([^"]*)"/g).map(item => item.slice(1, -1));
    return arr;
}

export default string2list;