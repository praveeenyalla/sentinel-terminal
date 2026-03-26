const categoryKeywords = {
  kinetic: ["conflict", "missile", "airbase", "insurgent", "terror", "drone", "military", "strike"],
  maritime: ["ais", "naval", "port", "piracy", "subsea", "chokepoint", "cable", "ship"],
  cyber: ["cyber", "internet", "gnss", "satcom", "outage", "malware", "botnet", "routing"],
  disaster: ["fire", "earthquake", "weather", "biosecurity", "water", "storm", "seismic"],
  economics: ["supply", "sanctions", "currency", "minerals", "customs", "pipeline", "energy"]
};

function evaluateItem(item) {
  const text = `${item.headline} ${item.summary}`.toLowerCase();
  let bestCategory = "watch";
  let score = 18;

  Object.keys(categoryKeywords).forEach((category) => {
    let localScore = 0;
    categoryKeywords[category].forEach((keyword) => {
      if (text.indexOf(keyword) !== -1) {
        localScore += 14;
      }
    });
    if (localScore > score) {
      bestCategory = category;
      score = localScore;
    }
  });

  score += Number(item.severity || 0) * 11;
  score += Math.round(Number(item.confidence || 0) * 18);
  if (text.indexOf("critical") !== -1 || text.indexOf("escalation") !== -1) {
    score += 18;
  }

  score = Math.max(8, Math.min(score, 97));

  let risk = "LOW";
  if (score >= 78) {
    risk = "HIGH";
  } else if (score >= 52) {
    risk = "MED";
  }

  return {
    id: item.id,
    title: item.headline,
    category: bestCategory.toUpperCase(),
    risk,
    score,
    narrative: `${bestCategory.toUpperCase()} exposure driven by ${item.source} in ${item.region}. Local worker classified this without sending text to the server.`
  };
}

self.onmessage = (event) => {
  const message = event.data || {};
  if (message.type !== "analyze" || !Array.isArray(message.items)) {
    return;
  }

  const analysis = message.items.slice(0, 12).map(evaluateItem);
  self.postMessage({
    type: "analysis",
    items: analysis
  });
};
