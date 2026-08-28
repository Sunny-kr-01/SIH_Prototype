const LABOR_RATES = {
    basic: 40,
    intermediate: 60,
    skilled: 85,
    highly_skilled: 120
};

const COMPLEXITY_MULTIPLIER = {
    low: 1.0,
    medium: 1.05,
    high: 1.15,
    very_high: 1.25
};

export function calculateB2BPrice(data) {

    // -----------------------------
    // MATERIAL COST
    // -----------------------------

    let materialCost = 0;

    for (const material of data.materials || []) {

        if (Number.isFinite(material.totalCost)) {
            materialCost += material.totalCost;
        }

    }


    // -----------------------------
    // LABOR
    // -----------------------------

    const labor = data.labor || {};

    let laborHours = 0;

    if (
        Number.isFinite(labor.days) &&
        Number.isFinite(labor.hoursPerDay)
    ) {
        laborHours = labor.days * labor.hoursPerDay;

    } else if (Number.isFinite(labor.estimatedHours)) {

        laborHours = labor.estimatedHours;
    }

    const skillLevel = LABOR_RATES[labor.skillLevel]
        ? labor.skillLevel
        : "intermediate";

    const complexity = COMPLEXITY_MULTIPLIER[labor.complexity]
        ? labor.complexity
        : "medium";

    const baseLaborRate = LABOR_RATES[skillLevel];

    const complexityMultiplier =
        COMPLEXITY_MULTIPLIER[complexity];

    const effectiveLaborRate =
        baseLaborRate * complexityMultiplier;

    const laborCost =
        laborHours * effectiveLaborRate;


    // -----------------------------
    // OTHER COSTS
    // -----------------------------

    const otherCosts =
        Number(data.otherCosts) || 0;


    // -----------------------------
    // TOTAL PRODUCTION COST
    // -----------------------------

    const baseCost =
        materialCost +
        laborCost +
        otherCosts;


    if (baseCost <= 0) {

        return {
            success: false,
            message: "Not enough pricing information"
        };
    }


    // -----------------------------
    // B2B MARGIN
    // -----------------------------

    const minimumPrice =
        Math.round(baseCost * 1.03);

    const suggestedPrice =
        Math.round(baseCost * 1.08);

    const maximumPrice =
        Math.round(baseCost * 1.12);


    // -----------------------------
    // BULK PRICING
    // -----------------------------

    return {

        success: true,

        breakdown: {
            materialCost: Math.round(materialCost),

            labor: {
                hours: Math.round(laborHours * 10) / 10,
                skillLevel,
                complexity,
                baseRatePerHour: baseLaborRate,
                effectiveRatePerHour:
                    Math.round(effectiveLaborRate),
                laborCost: Math.round(laborCost)
            },

            otherCosts:
                Math.round(otherCosts),

            baseCost:
                Math.round(baseCost)
        },

        suggestedPrice,

        minimumPrice,

        maximumPrice,

        bulkPricing: {

            "10-24":
                Math.round(suggestedPrice * 0.94),

            "25-49":
                Math.round(suggestedPrice * 0.88),

            "50+":
                Math.round(suggestedPrice * 0.82)
        },

        minimumOrderQuantity: 10
    };
}