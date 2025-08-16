export function calcFee(amount, percent = 1) {
  const fee = Math.floor((amount * percent) / 100);
  return { fee, netToFarmer: amount - fee };
}

export function isPerishableCategory(category) {
  const c = String(category || '').toLowerCase();
  return ['vegetable','vegetables','fruit','fruits'].includes(c);
}
