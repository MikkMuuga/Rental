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
    (pickupMonth >= BUSY_SEASON_START && pickupMonth <= BUSY_SEASON_END)
    || (dropoffMonth >= BUSY_SEASON_START && dropoffMonth <= BUSY_SEASON_END)
    || (pickupMonth < BUSY_SEASON_START && dropoffMonth > BUSY_SEASON_END)
  ) {
    return "High";
  }

  return "Low";
}

function getWeekendDays(pickupDate, dropoffDate) {
  const start = new Date(pickupDate);
  const end = new Date(dropoffDate);
  let weekendDays = 0;

  const currentDate = new Date(start);
  while (currentDate <= end) {
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      weekendDays += 1;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return weekendDays;
}

function validateLicense(licenseHeldYears) {
  if (licenseHeldYears < MIN_LICENSE_YEARS) {
    return "License held for less than 1 year are ineligible to rent";
  }
  return null;
}

function validateVehicleType(type) {
  if (!VALID_TYPES.includes(type)) {
    return "Unknown vehicle type";
  }
  return null;
}

function validateDriverAge(age, type) {
  if (age < MIN_DRIVER_AGE) {
    return "Driver too young - cannot quote the price";
  }

  if (age <= YOUNG_DRIVER_MAX_AGE && type !== "Compact") {
    return "Drivers 21 y/o or less can only rent Compact vehicles";
  }
  return null;
}

function calculateBasePrice(age, days, weekendDays) {
  let rentalprice = age * days;

  if (weekendDays > 0) {
    rentalprice += weekendDays * age * 0.05;
  }

  return rentalprice;
}

function applyLicenseSurcharge(basePrice, licenseHeldYears) {
  if (licenseHeldYears < LICENSE_YEARS_30_PERCENT) {
    return basePrice * LICENSE_SURCHARGE_MULTIPLIER;
  }
  return basePrice;
}

function applySeasonalAndTypeMultipliers(basePrice, type, age, season, days, licenseHeldYears) {
  let rentalprice = basePrice;

  if (type === "Racer" && age <= RACER_AGE_LIMIT && season === "High") {
    rentalprice *= RACER_SEASON_MULTIPLIER;
  }

  if (season === "High") {
    rentalprice *= HIGH_SEASON_MULTIPLIER;
  }

  if (licenseHeldYears < LICENSE_YEARS_15_EUR && season === "High") {
    rentalprice += DAILY_HIGH_SEASON_SURCHARGE * days;
  }

  if (days > LONG_RENTAL_DAYS && season === "Low") {
    rentalprice *= LONG_RENTAL_DISCOUNT;
  }

  return rentalprice;
}

function price(pickup, dropoff, pickupDate, dropoffDate, type, age, licenseHeldYears) {
  const licenseError = validateLicense(licenseHeldYears);
  if (licenseError) {
    return licenseError;
  }

  const typeError = validateVehicleType(type);
  if (typeError) {
    return typeError;
  }

  const days = getDays(pickupDate, dropoffDate);
  const season = getSeason(pickupDate, dropoffDate);
  const weekendDays = getWeekendDays(pickupDate, dropoffDate);

  const ageError = validateDriverAge(age, type);
  if (ageError) {
    return ageError;
  }

  let rentalprice = calculateBasePrice(age, days, weekendDays);
  rentalprice = applyLicenseSurcharge(rentalprice, licenseHeldYears);
  rentalprice = applySeasonalAndTypeMultipliers(rentalprice, type, age, season, days, licenseHeldYears);

  return `$${rentalprice.toFixed(2)}`;
}

exports.price = price;
exports.getWeekendDays = getWeekendDays;
exports.getDays = getDays;
exports.getSeason = getSeason;
exports.validateLicense = validateLicense;
exports.validateVehicleType = validateVehicleType;
exports.validateDriverAge = validateDriverAge;
exports.calculateBasePrice = calculateBasePrice;
exports.applyLicenseSurcharge = applyLicenseSurcharge;
exports.applySeasonalAndTypeMultipliers = applySeasonalAndTypeMultipliers;
