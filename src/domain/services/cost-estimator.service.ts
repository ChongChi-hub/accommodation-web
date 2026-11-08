import { RoomFeeDto } from '@/application/dto/listing.dto';

export interface UsageInput {
  electricityKwh?: number;
  waterM3?: number;
  occupants?: number;
}

export interface FeeBreakdownItem {
  label: string;
  unit: string;
  unitPrice: number;
  billingMode: string;
  quantity: number;
  totalCost: number;
}

export interface MonthlyCostEstimate {
  rentPrice: number;
  utilityTotal: number;
  grandTotal: number;
  breakdown: FeeBreakdownItem[];
}

/**
 * Pure domain calculation for monthly accommodation cost estimation.
 * Supports all billing modes: METERED, PER_PERSON, FIXED, INCLUDED.
 * Rounds all totals to integer VND.
 */
export function calculateMonthlyCost(
  rentPrice: number,
  fees: RoomFeeDto[] = [],
  usage: UsageInput = {}
): MonthlyCostEstimate {
  const electricityKwh = Math.max(0, usage.electricityKwh ?? 100);
  const waterM3 = Math.max(0, usage.waterM3 ?? 4);
  const occupants = Math.max(1, usage.occupants ?? 1);
  const baseRent = Math.max(0, Math.round(rentPrice));

  let utilityTotal = 0;
  const breakdown: FeeBreakdownItem[] = [];

  for (const fee of fees) {
    const mode = (fee.billingMode || (fee.metered ? 'METERED' : 'FIXED')).toUpperCase();
    const price = Math.max(0, Number(fee.price) || 0);
    let quantity = 1;
    let itemTotal = 0;

    switch (mode) {
      case 'METERED': {
        const isWater = fee.meterType === 'water' || fee.unit.toLowerCase().includes('m') || fee.label.toLowerCase().includes('nước');
        quantity = isWater ? waterM3 : electricityKwh;
        itemTotal = Math.round(price * quantity);
        break;
      }
      case 'PER_PERSON': {
        quantity = occupants;
        itemTotal = Math.round(price * quantity);
        break;
      }
      case 'FIXED': {
        quantity = 1;
        itemTotal = Math.round(price);
        break;
      }
      case 'INCLUDED': {
        quantity = 1;
        itemTotal = 0;
        break;
      }
      default: {
        itemTotal = Math.round(price);
        break;
      }
    }

    utilityTotal += itemTotal;
    breakdown.push({
      label: fee.label,
      unit: fee.unit,
      unitPrice: price,
      billingMode: mode,
      quantity,
      totalCost: itemTotal,
    });
  }

  return {
    rentPrice: baseRent,
    utilityTotal,
    grandTotal: baseRent + utilityTotal,
    breakdown,
  };
}

