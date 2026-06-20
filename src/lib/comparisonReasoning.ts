import { IProduct } from "./models/Product";
import { getProductReviewSummary } from "./reviewService";

export interface ContrastiveReasoning {
  winnerId: string;
  loserId: string;
  priceDiff: number; // positive if loser is more expensive
  ratingDiff: number; // positive if winner is better rated
  sentimentDiff: number; // positive if winner is better sentiment
  specDifferences: {
    feature: string;
    winnerVal: string;
    loserVal: string;
    description: string;
  }[];
  verdict: string;
}

/**
 * Compares two products side-by-side to generate contrastive explanation details.
 * Answer query types like: "Why should I buy Asus instead of Lenovo?" or "Why not Product B?"
 */
export async function compareContrastively(
  productA: IProduct,
  productB: IProduct
): Promise<ContrastiveReasoning> {
  // Let's check which product is the "default winner" based on rating or price
  // A higher rating is preferred. If ratings are equal, the lower price is preferred.
  let winner = productA;
  let loser = productB;

  if (productB.rating > productA.rating) {
    winner = productB;
    loser = productA;
  } else if (productB.rating === productA.rating && productB.price < productA.price) {
    winner = productB;
    loser = productA;
  }

  const priceDiff = loser.price - winner.price;
  const ratingDiff = winner.rating - loser.rating;

  // Sentiment diffs
  let winnerSentiment = winner.rating;
  let loserSentiment = loser.rating;

  try {
    const winSum = await getProductReviewSummary(winner._id.toString());
    const losSum = await getProductReviewSummary(loser._id.toString());
    if (winSum && winSum.sentiment > 0) winnerSentiment = winSum.sentiment;
    if (losSum && losSum.sentiment > 0) loserSentiment = losSum.sentiment;
  } catch (e) {
    // Ignore fallback issues
  }

  const sentimentDiff = parseFloat((winnerSentiment - loserSentiment).toFixed(2));

  // Specs differences
  const specDifferences: ContrastiveReasoning["specDifferences"] = [];
  const winSpecs = (winner.specifications || {}) as any;
  const losSpecs = (loser.specifications || {}) as any;

  const getSpec = (specs: any, keys: string[]): string => {
    if (!specs) return "";
    for (const k of keys) {
      const val = specs.get ? specs.get(k) : specs[k];
      if (val) return String(val);
    }
    return "";
  };

  const keySpecsToCompare = [
    { name: "Processor / CPU", keys: ["Processor", "CPU", "Processor Brand"] },
    { name: "RAM / Memory", keys: ["RAM", "Memory", "System Memory"] },
    { name: "Storage", keys: ["Storage", "Hard Drive", "SSD Capacity"] },
    { name: "Display / Screen", keys: ["Display", "Screen Size", "Screen"] },
    { name: "Battery Life", keys: ["Battery Life", "Battery", "Play Time", "Run Time"] },
    { name: "Graphics / GPU", keys: ["GPU", "Graphics", "Graphics Controller Model"] }
  ];

  keySpecsToCompare.forEach(item => {
    const winVal = getSpec(winSpecs, item.keys);
    const losVal = getSpec(losSpecs, item.keys);

    if (winVal && losVal && winVal.toLowerCase() !== losVal.toLowerCase()) {
      specDifferences.push({
        feature: item.name,
        winnerVal: winVal,
        loserVal: losVal,
        description: `**${winner.title}** has *${winVal}* vs **${loser.title}** has *${losVal}*`
      });
    }
  });

  // Construct a conversational verdict
  let verdict = "";
  if (priceDiff > 0) {
    verdict += `The **${winner.title}** is more affordable, saving you ₹${priceDiff.toLocaleString()}. `;
  } else if (priceDiff < 0) {
    verdict += `While the **${loser.title}** is cheaper by ₹${Math.abs(priceDiff).toLocaleString()}, `;
    verdict += `the **${winner.title}** justifies its premium with `;
    if (ratingDiff > 0) verdict += `higher customer ratings (+${ratingDiff.toFixed(1)} stars) `;
    if (specDifferences.length > 0) verdict += `and better specifications like *${specDifferences[0].winnerVal}*.`;
    else verdict += `and better features.`;
  } else {
    verdict += `Both products are priced identically at ₹${winner.price.toLocaleString()}. However, `;
    if (ratingDiff > 0) verdict += `the **${winner.title}** has higher customer reviews (${winner.rating}/5 vs ${loser.rating}/5).`;
    else verdict += `the **${winner.title}** stands out with superior features.`;
  }

  return {
    winnerId: winner._id.toString(),
    loserId: loser._id.toString(),
    priceDiff,
    ratingDiff,
    sentimentDiff,
    specDifferences,
    verdict
  };
}
