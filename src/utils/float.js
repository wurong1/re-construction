function floatMulti(base = 0.00, multiplier) {
  let m = 0, s1 = base.toString(), s2 = multiplier.toString();
  try {
    m += s1.split('.')[1].length;
  } catch(e) {}

  try {
    m += s2.split('.')[1].length;
  } catch(e) {}

  return Number(s1.replace('.', '')) * Number(s2.replace('.', '')) / Math.pow(10, m);
}

function floatDivision(base = 0.00, divider) {
  let m = 0, s1 = base.toString(), s2 = divider.toString();
  try {
    m += s1.split('.')[1].length;
  } catch(e) {}

  try {
    m += s2.split('.')[1].length;
  } catch(e) {}

  return Number(s1.replace('.', '')) / (Number(s2.replace('.', '')) * Math.pow(10, m));
}

export {
  floatMulti,
  floatDivision
};
