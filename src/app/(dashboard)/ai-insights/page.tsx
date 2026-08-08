import {
  AIHeader,
  PredictionCard,
  ReorderSuggestions,
  SlowMovingItems,
  CustomerInsights,
  ProfitTips,
  DemandForecast,
} from "@/features/ai/components";
import {
  getAIProductData,
  getAICustomerData,
  getAIMonthlySales,
} from "@/features/ai/actions/ai-actions";
import {
  predictNextWeekSales,
  forecastDemand,
  getReorderSuggestions,
  getSlowMovingItems,
  getProfitTips,
  getCustomerInsights,
} from "@/features/ai/utils/ai-algorithms";

export default async function AIInsightsPage() {
  const [products, customers, monthlySales] = await Promise.all([
    getAIProductData(),
    getAICustomerData(),
    getAIMonthlySales(),
  ]);

  const prediction = predictNextWeekSales(monthlySales);
  const demand = forecastDemand(products);
  const reorderSuggestions = getReorderSuggestions(products);
  const slowMoving = getSlowMovingItems(products);
  const profitTips = getProfitTips(products);
  const customerInsights = getCustomerInsights(customers);

  return (
    <div className="space-y-6">
      <AIHeader />

      <div className="grid gap-6 xl:grid-cols-3">
        <PredictionCard
          predictedRevenue={prediction.predictedRevenue}
          predictedOrders={prediction.predictedOrders}
          confidence={prediction.confidence}
        />

        <div className="xl:col-span-2">
          <DemandForecast
            highDemand={demand.highDemand.map((p) => ({
              name: p.name,
              category: p.category,
              totalSold: p.totalSold,
            }))}
            mediumDemand={demand.mediumDemand.map((p) => ({
              name: p.name,
              category: p.category,
              totalSold: p.totalSold,
            }))}
            lowDemand={demand.lowDemand.map((p) => ({
              name: p.name,
              category: p.category,
              totalSold: p.totalSold,
            }))}
          />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ReorderSuggestions
          suggestions={reorderSuggestions.map((s) => ({
            productName: s.product.name,
            currentStock: s.product.quantity,
            suggestedQty: s.suggestedQty,
            urgency: s.urgency,
            reason: s.reason,
          }))}
        />

        <SlowMovingItems
          items={slowMoving.map((p) => ({
            name: p.name,
            sku: p.sku,
            quantity: p.quantity,
            lastSoldDays: p.lastSoldDays,
            value: p.quantity * p.purchasePrice,
          }))}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ProfitTips tips={profitTips} />

        <CustomerInsights
          total={customerInsights.total}
          active={customerInsights.active}
          atRisk={customerInsights.atRisk}
          lost={customerInsights.lost}
          avgSpend={customerInsights.avgSpend}
          retentionRate={customerInsights.retentionRate}
          topSpenders={customerInsights.topSpenders.map((c) => ({
            name: c.name,
            totalSpent: c.totalSpent,
          }))}
        />
      </div>
    </div>
  );
}