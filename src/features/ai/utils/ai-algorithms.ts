interface ProductData {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  minimumStock: number;
  sellingPrice: number;
  purchasePrice: number;
  totalSold: number;
  totalRevenue: number;
  lastSoldDays: number;
  category: string;
}

interface CustomerData {
  id: string;
  name: string;
  totalOrders: number;
  totalSpent: number;
  loyaltyPoints: number;
  membershipLevel: string;
  lastOrderDays: number;
}

// ── Sales Prediction ─────────────────────────────────
export function predictNextWeekSales(
  monthlySales: { revenue: number; orders: number }[]
): { predictedRevenue: number; predictedOrders: number; confidence: number } {
  if (monthlySales.length < 2) {
    return { predictedRevenue: 0, predictedOrders: 0, confidence: 0 };
  }

  const revenues = monthlySales.map((m) => m.revenue);
  const orders = monthlySales.map((m) => m.orders);

  const avgRevenue = revenues.reduce((a, b) => a + b, 0) / revenues.length;
  const avgOrders = orders.reduce((a, b) => a + b, 0) / orders.length;

  const trend =
    revenues.length >= 2
      ? (revenues[revenues.length - 1] - revenues[revenues.length - 2]) /
        (revenues[revenues.length - 2] || 1)
      : 0;

  const weeklyRevenue = (avgRevenue * (1 + trend * 0.3)) / 4;
  const weeklyOrders = Math.round((avgOrders * (1 + trend * 0.3)) / 4);

  const confidence = Math.min(
    85,
    50 + monthlySales.length * 5 + (Math.abs(trend) < 0.3 ? 10 : 0)
  );

  return {
    predictedRevenue: Math.round(weeklyRevenue),
    predictedOrders: weeklyOrders,
    confidence,
  };
}

// ── Demand Forecast ──────────────────────────────────
export function forecastDemand(products: ProductData[]): {
  highDemand: ProductData[];
  mediumDemand: ProductData[];
  lowDemand: ProductData[];
} {
  const scored = products.map((p) => ({
    ...p,
    demandScore: calculateDemandScore(p),
  }));

  scored.sort((a, b) => b.demandScore - a.demandScore);

  return {
    highDemand: scored.filter((p) => p.demandScore >= 70),
    mediumDemand: scored.filter(
      (p) => p.demandScore >= 40 && p.demandScore < 70
    ),
    lowDemand: scored.filter((p) => p.demandScore < 40),
  };
}

function calculateDemandScore(product: ProductData): number {
  let score = 0;

  // Sales velocity
  if (product.totalSold > 100) score += 30;
  else if (product.totalSold > 50) score += 20;
  else if (product.totalSold > 10) score += 10;

  // Recent activity
  if (product.lastSoldDays <= 7) score += 25;
  else if (product.lastSoldDays <= 14) score += 15;
  else if (product.lastSoldDays <= 30) score += 5;

  // Profit margin
  const margin =
    ((product.sellingPrice - product.purchasePrice) / product.sellingPrice) *
    100;
  if (margin > 30) score += 20;
  else if (margin > 15) score += 10;

  // Stock pressure
  if (product.quantity <= product.minimumStock) score += 15;
  if (product.quantity === 0) score += 10;

  return Math.min(100, score);
}

// ── Reorder Suggestions ──────────────────────────────
export function getReorderSuggestions(
  products: ProductData[]
): {
  product: ProductData;
  suggestedQty: number;
  urgency: "critical" | "high" | "medium";
  reason: string;
}[] {
  const suggestions: {
    product: ProductData;
    suggestedQty: number;
    urgency: "critical" | "high" | "medium";
    reason: string;
  }[] = [];

  for (const product of products) {
    if (product.quantity > product.minimumStock) continue;

    const avgDailySales = product.totalSold > 0 ? product.totalSold / 30 : 1;
    const daysUntilEmpty =
      product.quantity > 0 ? product.quantity / avgDailySales : 0;
    const suggestedQty = Math.max(
      product.minimumStock * 2,
      Math.ceil(avgDailySales * 30)
    );

    let urgency: "critical" | "high" | "medium" = "medium";
    let reason = "";

    if (product.quantity === 0) {
      urgency = "critical";
      reason = "Out of stock! Losing sales.";
    } else if (daysUntilEmpty <= 3) {
      urgency = "critical";
      reason = `Only ${daysUntilEmpty.toFixed(0)} days of stock left.`;
    } else if (daysUntilEmpty <= 7) {
      urgency = "high";
      reason = `About ${daysUntilEmpty.toFixed(0)} days of stock remaining.`;
    } else {
      urgency = "medium";
      reason = `Stock below minimum level (${product.minimumStock}).`;
    }

    suggestions.push({ product, suggestedQty, urgency, reason });
  }

  suggestions.sort((a, b) => {
    const urgencyOrder = { critical: 0, high: 1, medium: 2 };
    return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
  });

  return suggestions;
}

// ── Slow Moving Items ────────────────────────────────
export function getSlowMovingItems(
  products: ProductData[]
): ProductData[] {
  return products
    .filter((p) => p.quantity > 0 && p.lastSoldDays > 14 && p.totalSold < 10)
    .sort((a, b) => b.lastSoldDays - a.lastSoldDays);
}

// ── Profit Tips ──────────────────────────────────────
export function getProfitTips(
  products: ProductData[]
): { tip: string; type: "increase" | "reduce" | "action"; impact: "high" | "medium" | "low" }[] {
  const tips: {
    tip: string;
    type: "increase" | "reduce" | "action";
    impact: "high" | "medium" | "low";
  }[] = [];

  // Low margin products
  const lowMargin = products.filter((p) => {
    const margin =
      ((p.sellingPrice - p.purchasePrice) / p.sellingPrice) * 100;
    return margin < 15 && p.totalSold > 10;
  });

  if (lowMargin.length > 0) {
    tips.push({
      tip: `${lowMargin.length} products have margins below 15%. Consider price adjustments.`,
      type: "increase",
      impact: "high",
    });
  }

  // Dead stock
  const deadStock = products.filter(
    (p) => p.quantity > 20 && p.lastSoldDays > 30
  );
  if (deadStock.length > 0) {
    tips.push({
      tip: `${deadStock.length} products haven't sold in 30+ days. Run promotions to clear stock.`,
      type: "action",
      impact: "medium",
    });
  }

  // Overstock
  const overstock = products.filter(
    (p) => p.quantity > p.minimumStock * 3
  );
  if (overstock.length > 0) {
    tips.push({
      tip: `${overstock.length} products are overstocked. Reduce future orders.`,
      type: "reduce",
      impact: "medium",
    });
  }

  // Best sellers with low stock
  const bestSellersLow = products.filter(
    (p) => p.totalSold > 50 && p.quantity <= p.minimumStock
  );
  if (bestSellersLow.length > 0) {
    tips.push({
      tip: `${bestSellersLow.length} best-sellers are running low. Restock immediately to avoid lost sales.`,
      type: "action",
      impact: "high",
    });
  }

  // High margin products
  const highMargin = products.filter((p) => {
    const margin =
      ((p.sellingPrice - p.purchasePrice) / p.sellingPrice) * 100;
    return margin > 40 && p.totalSold < 5;
  });
  if (highMargin.length > 0) {
    tips.push({
      tip: `${highMargin.length} high-margin products have low sales. Promote them more.`,
      type: "increase",
      impact: "high",
    });
  }

  if (tips.length === 0) {
    tips.push({
      tip: "Your store is performing well! Keep monitoring trends.",
      type: "action",
      impact: "low",
    });
  }

  return tips;
}

// ── Customer Insights ────────────────────────────────
export function getCustomerInsights(customers: CustomerData[]) {
  const total = customers.length;
  const active = customers.filter((c) => c.lastOrderDays <= 30).length;
  const atRisk = customers.filter(
    (c) => c.lastOrderDays > 30 && c.lastOrderDays <= 90
  ).length;
  const lost = customers.filter((c) => c.lastOrderDays > 90).length;

  const avgSpend =
    total > 0
      ? customers.reduce((sum, c) => sum + c.totalSpent, 0) / total
      : 0;

  const topSpenders = [...customers]
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 5);

  return {
    total,
    active,
    atRisk,
    lost,
    avgSpend,
    topSpenders,
    retentionRate: total > 0 ? ((active / total) * 100).toFixed(1) : "0",
  };
}

export type {
  ProductData,
  CustomerData,
};