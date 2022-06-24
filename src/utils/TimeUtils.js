export const getWaitTime = (hour) => {
  const A_DAY = 86400000;

  let now = new Date();
  let millisTillHour =
    new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, 0, 0, 0) -
    now;
  if (millisTillHour < 0) {
    millisTillHour += A_DAY;
  }
  return millisTillHour;
};

export const waitInterval = (hours) => {
  return 1000 * 60 * 60 * hours;
};
