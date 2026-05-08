const MIN_LICENSE_YEARS = 1;
const LICENSE_YEARS_30_PERCENT = 2;
const LICENSE_YEARS_15_EUR = 3;
const LICENSE_SURCHARGE_MULTIPLIER = 1.3;
const DAILY_HIGH_SEASON_SURCHARGE = 15;
const RACER_AGE_LIMIT = 25;
const RACER_SEASON_MULTIPLIER = 1.5;
const HIGH_SEASON_MULTIPLIER = 1.15;
const MIN_DRIVER_AGE = 18;
const YOUNG_DRIVER_MAX_AGE = 21;
const LONG_RENTAL_DAYS = 10;
const LONG_RENTAL_DISCOUNT = 0.9;
const BUSY_SEASON_START = 3;
const BUSY_SEASON_END = 9;
const VALID_TYPES = ["Compact", "Electric", "Cabrio", "Racer"];

function price(pickup, dropoff, pickupDate, dropoffDate, type, age, licenseHeldYears) {
  if (licenseHeldYears < MIN_LICENSE_YEARS) {
    return "License held for less than 1 year are ineligible to rent";
  }

  if (!VALID_TYPES.includes(type)) {
    return "Unknown vehicle type";
  }

  const days = getDays(pickupDate, dropoffDate);
  const season = getSeason(pickupDate, dropoffDate);
  const weekendDays = getWeekendDays(pickupDate, dropoffDate);

  if (age < MIN_DRIVER_AGE) {
    return "Driver too young - cannot quote the price";
  }

  if (age <= YOUNG_DRIVER_MAX_AGE && type !== "Compact") {
    return "Drivers 21 y/o or less can only rent Compact vehicles";
  }

  let rentalprice = age * days;

  if (weekendDays > 0) {
    rentalprice += weekendDays * age * 0.05;
  }

  if (licenseHeldYears < LICENSE_YEARS_15_EUR && season === "High") {
    rentalprice += DAILY_HIGH_SEASON_SURCHARGE * days;
  }

  if (licenseHeldYears < LICENSE_YEARS_30_PERCENT) {
    rentalprice *= LICENSE_SURCHARGE_MULTIPLIER;
  }

  if (type === "Racer" && age <= RACER_AGE_LIMIT && season === "High") {
    rentalprice *= RACER_SEASON_MULTIPLIER;
  }

  if (season === "High") {
    rentalprice *= HIGH_SEASON_MULTIPLIER;
  }

  if (days > LONG_RENTAL_DAYS && season === "Low") {
    rentalprice *= LONG_RENTAL_DISCOUNT;
  }

  return '$' + rentalprice.toFixed(2);
}

function getWeekendDays(pickupDate, dropoffDate) {
  const start = new Date(pickupDate);
  const end = new Date(dropoffDate);
  let weekendDays = 0;

  const currentDate = new Date(start);
  while (currentDate <= end) {
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      weekendDays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return weekendDays;
}

function getDays(pickupDate, dropoffDate) {
  const oneDay = 24 * 60 * 60 * 1000;
  const firstDate = new Date(pickupDate);
  const secondDate = new Date(dropoffDate);

  return Math.round(Math.abs((firstDate - secondDate) / oneDay)) + 1;
}

function getSeason(pickupDate, dropoffDate) {
  const pickup = new Date(pickupDate);
  const dropoff = new Date(dropoffDate);
  const pickupMonth = pickup.getMonth();
  const dropoffMonth = dropoff.getMonth();

  if (
    (pickupMonth >= BUSY_SEASON_START && pickupMonth <= BUSY_SEASON_END) ||
    (dropoffMonth >= BUSY_SEASON_START && dropoffMonth <= BUSY_SEASON_END) ||
    (pickupMonth < BUSY_SEASON_START && dropoffMonth > BUSY_SEASON_END)
  ) {
    return "High";
  }

  return "Low";
}

exports.price = price;
exports.getWeekendDays = getWeekendDays;
exports.getDays = getDays;
exports.getSeason = getSeason;