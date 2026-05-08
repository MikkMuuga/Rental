const { price, getWeekendDays } = require('./rentalPrice');

describe('getWeekendDays helper', () => {
  test('returns 0 for Mon–Fri', () => {
    expect(getWeekendDays('2026-02-23', '2026-02-27')).toBe(0);
  });

  test('returns 2 for Mon–Sun', () => {
    expect(getWeekendDays('2026-02-23', '2026-03-01')).toBe(2);
  });

  test('returns 1 for a single Saturday', () => {
    expect(getWeekendDays('2026-02-28', '2026-02-28')).toBe(1);
  });
});

describe('getWeekendDays', () => {
  test('returns 2 for a week containing one weekend', () => {
    expect(getWeekendDays('2024-06-10', '2024-06-16')).toBe(2);
  });

  test('returns 0 for a full weekday range', () => {
    expect(getWeekendDays('2024-06-10', '2024-06-14')).toBe(0);
  });
});

describe('license eligibility', () => {
  test('returns ineligible message if license held less than 1 year', () => {
    expect(price('A', 'B', '2024-06-10', '2024-06-12', 'Compact', 25, 0)).toBe(
      'License held for less than 1 year are ineligible to rent'
    );
  });
});

describe('vehicle type validation', () => {
  test('returns error for unknown vehicle type', () => {
    expect(price('A', 'B', '2024-06-10', '2024-06-12', 'Truck', 25, 2)).toBe(
      'Unknown vehicle type'
    );
  });
});

describe('age eligibility', () => {
  test('returns error if driver is under 18', () => {
    expect(price('A', 'B', '2024-06-10', '2024-06-12', 'Compact', 17, 2)).toBe(
      'Driver too young - cannot quote the price'
    );
  });

  test('driver aged 21 or under can only rent Compact', () => {
    expect(price('A', 'B', '2024-06-10', '2024-06-12', 'Racer', 21, 2)).toBe(
      'Drivers 21 y/o or less can only rent Compact vehicles'
    );
  });

  test('driver aged 21 can rent Compact', () => {
    expect(price('A', 'B', '2024-01-10', '2024-01-12', 'Compact', 21, 2)).toMatch(/^\$/);
  });
});

describe('high season (April–October)', () => {
  test('applies 15% high season multiplier', () => {
    const low = price('A', 'B', '2024-01-08', '2024-01-10', 'Compact', 25, 5);
    const high = price('A', 'B', '2024-06-10', '2024-06-12', 'Compact', 25, 5);
    expect(parseFloat(high.slice(1))).toBeGreaterThan(parseFloat(low.slice(1)));
  });
});

describe('low season', () => {
  test('applies 10% discount for rentals over 10 days', () => {
    const short = price('A', 'B', '2024-01-01', '2024-01-05', 'Compact', 25, 5);
    const long = price('A', 'B', '2024-01-01', '2024-01-15', 'Compact', 25, 5);
    const shortVal = parseFloat(short.slice(1));
    const longVal = parseFloat(long.slice(1));
    expect(longVal / 15).toBeLessThan(shortVal / 5);
  });
});

describe('license surcharges', () => {
  test('30% surcharge if license held less than 2 years', () => {
    const normal = price('A', 'B', '2024-01-08', '2024-01-10', 'Compact', 25, 5);
    const newDriver = price('A', 'B', '2024-01-08', '2024-01-10', 'Compact', 25, 1);
    expect(parseFloat(newDriver.slice(1))).toBeCloseTo(parseFloat(normal.slice(1)) * 1.3, 1);
  });

  test('15 EUR/day surcharge in high season if license < 3 years', () => {
    const experienced = price('A', 'B', '2024-06-10', '2024-06-12', 'Compact', 25, 5);
    const newDriver = price('A', 'B', '2024-06-10', '2024-06-12', 'Compact', 25, 2);
    expect(parseFloat(newDriver.slice(1))).toBeGreaterThan(parseFloat(experienced.slice(1)));
  });
});

describe('Racer surcharge', () => {
  test('50% surcharge for Racer if driver <= 25 in high season', () => {
    const older = price('A', 'B', '2024-06-10', '2024-06-12', 'Racer', 30, 5);
    const young = price('A', 'B', '2024-06-10', '2024-06-12', 'Racer', 25, 5);
    expect(parseFloat(young.slice(1))).toBeGreaterThan(parseFloat(older.slice(1)));
  });

  test('no Racer surcharge in low season', () => {
    const lowYoung = price('A', 'B', '2024-01-08', '2024-01-10', 'Racer', 25, 5);
    const lowOld = price('A', 'B', '2024-01-08', '2024-01-10', 'Racer', 30, 5);
    expect(lowYoung).toBe('$75.00');
    expect(lowOld).toBe('$90.00');
  });
});

describe('weekend surcharge', () => {
  test('adds weekend surcharge when rental includes weekend days', () => {
    const weekday = price('A', 'B', '2024-06-10', '2024-06-14', 'Compact', 25, 5);
    const weekend = price('A', 'B', '2024-06-10', '2024-06-16', 'Compact', 25, 5);
    expect(parseFloat(weekend.slice(1))).toBeGreaterThan(parseFloat(weekday.slice(1)));
  });
});
