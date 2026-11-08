import { describe, it, expect } from 'vitest';
import { calculateMonthlyCost } from './cost-estimator.service';
import { RoomFeeDto } from '@/application/dto/listing.dto';

describe('calculateMonthlyCost Pure Domain Service', () => {
  const rent = 4500000;

  it('calculates METERED electricity and water correctly', () => {
    const fees: RoomFeeDto[] = [
      { label: 'Tiền điện', price: 3800, unit: 'kWh', billingMode: 'METERED', meterType: 'electric' },
      { label: 'Tiền nước', price: 28000, unit: 'm³', billingMode: 'METERED', meterType: 'water' },
    ];

    const result = calculateMonthlyCost(rent, fees, { electricityKwh: 150, waterM3: 5, occupants: 1 });
    expect(result.rentPrice).toBe(4500000);
    expect(result.utilityTotal).toBe(710000);
    expect(result.grandTotal).toBe(5210000);
    expect(result.breakdown[0].totalCost).toBe(570000);
    expect(result.breakdown[1].totalCost).toBe(140000);
  });

  it('calculates PER_PERSON fees based on occupants count', () => {
    const fees: RoomFeeDto[] = [
      { label: 'Phí dịch vụ chung', price: 80000, unit: 'người/tháng', billingMode: 'PER_PERSON' },
    ];

    const result = calculateMonthlyCost(rent, fees, { occupants: 3 });
    expect(result.utilityTotal).toBe(240000);
    expect(result.grandTotal).toBe(4500000 + 240000);
  });

  it('calculates FIXED fees regardless of usage', () => {
    const fees: RoomFeeDto[] = [
      { label: 'Internet WiFi', price: 100000, unit: 'tháng', billingMode: 'FIXED' },
    ];

    const result = calculateMonthlyCost(rent, fees, { electricityKwh: 200, occupants: 4 });
    expect(result.utilityTotal).toBe(100000);
    expect(result.grandTotal).toBe(4600000);
  });

  it('calculates INCLUDED fees as 0 VND', () => {
    const fees: RoomFeeDto[] = [
      { label: 'Nước sinh hoạt miễn phí', price: 0, unit: 'tháng', billingMode: 'INCLUDED' },
    ];

    const result = calculateMonthlyCost(rent, fees, { waterM3: 10 });
    expect(result.utilityTotal).toBe(0);
    expect(result.grandTotal).toBe(rent);
  });

  it('handles combination of all 4 billing modes with integer VND rounding', () => {
    const fees: RoomFeeDto[] = [
      { label: 'Điện', price: 3850.5, unit: 'kWh', billingMode: 'METERED', meterType: 'electric' },
      { label: 'Nước', price: 27500, unit: 'm³', billingMode: 'METERED', meterType: 'water' },
      { label: 'Dịch vụ', price: 50000, unit: 'người/tháng', billingMode: 'PER_PERSON' },
      { label: 'Wifi', price: 100000, unit: 'tháng', billingMode: 'FIXED' },
      { label: 'Gửi xe', price: 0, unit: 'xe/tháng', billingMode: 'INCLUDED' },
    ];

    const result = calculateMonthlyCost(5000000, fees, { electricityKwh: 80, waterM3: 4, occupants: 2 });
    expect(result.utilityTotal).toBe(618040);
    expect(result.grandTotal).toBe(5618040);
  });

  it('safely clamps negative usage or occupants to valid bounds', () => {
    const fees: RoomFeeDto[] = [
      { label: 'Điện', price: 3500, unit: 'kWh', billingMode: 'METERED', meterType: 'electric' },
      { label: 'Dịch vụ', price: 50000, unit: 'người/tháng', billingMode: 'PER_PERSON' },
    ];

    const result = calculateMonthlyCost(-100, fees, { electricityKwh: -50, occupants: -2 });
    expect(result.rentPrice).toBe(0);
    expect(result.utilityTotal).toBe(50000);
    expect(result.grandTotal).toBe(50000);
  });
});
