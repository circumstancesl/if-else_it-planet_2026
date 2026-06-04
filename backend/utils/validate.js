function isValidInn(inn) {
  if (!/^\d+$/.test(inn)) return false;

  const calculateChecksum = (digits, factors) => {
    const digitsArray = Array.isArray(digits) ? digits : digits.split('');

    const sum = digitsArray.reduce((acc, digit, index) => acc + parseInt(digit, 10) * factors[index], 0);
    const remainder = sum % 11;
    return remainder > 9 ? remainder % 10 : remainder;
  };

  if (inn.length === 10) {
    const factors = [2, 4, 10, 3, 5, 9, 4, 6, 8];
    const checksum = calculateChecksum(inn.slice(0, 9), factors);
    return checksum === parseInt(inn[9], 10);
  }

  if (inn.length === 12) {
    const factors11 = [7, 2, 4, 10, 3, 5, 9, 4, 6, 8];
    const factors12 = [3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8];

    const checksum11 = calculateChecksum(inn.slice(0, 10), factors11);
    const checksum12 = calculateChecksum(inn.slice(0, 11), factors12);

    return checksum11 === parseInt(inn[10], 10) && checksum12 === parseInt(inn[11], 10);
  }

  return false;
}

module.exports = isValidInn;