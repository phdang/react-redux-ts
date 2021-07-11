export const addZero = (num: Number) => {
    return num < 10 && num >= 0 ? `0${num}` : `${num}`;
  };