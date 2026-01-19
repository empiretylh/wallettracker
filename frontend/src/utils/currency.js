export const formatMMK = (value) => {
  const numeric = Number(value) || 0;
  return `MMK ${numeric.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};
