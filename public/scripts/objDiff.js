"use strict";

const isArray = (() => {
  if(Array && Array.isArray)  {
    return Array.isArray;
  }
  return (o) => {
    return Object.prototype.toString.call(o) === "[object Array]";
  };
})();

const getEquivalentEmpty = (objOrArr) => {
  return isArray(objOrArr) ? [] : {};
};

const getFirstExtraKeys = (first, second) => {
  let curExtra;
  let childExtra;
  for (let i in first) {
    if (first.hasOwnProperty(i)) {
      if (first[i] !== null && typeof first[i] === "object") {
        childExtra = getFirstExtraKeys(first[i], (second || {})[i]);
        if (childExtra !== undefined) {
          curExtra = curExtra || getEquivalentEmpty(first);
          curExtra[i] = childExtra;
        }
      } else {
        if(second === undefined || second === null || second[i] !== first[i]){
          curExtra = curExtra || getEquivalentEmpty(first);
          curExtra[i] = first[i];
        }
      }
    }
  }
  return curExtra;
};

export let diff = (first, second) => {
  const res = getFirstExtraKeys({itm: first}, {itm: second});
  return (res || {}).itm;
};
