interface RecipeSummaryCardV2Props {
  prep?: string;
  bake?: string;
  total?: string;
  servings?: string;
  difficulty?: string;
}

export const RecipeSummaryCardV2 = ({ 
  prep, 
  bake, 
  total, 
  servings, 
  difficulty 
}: RecipeSummaryCardV2Props) => {
  // Only show chips with actual data
  const chips = [
    { icon: "⏱", value: prep, label: "Prep", show: prep && prep !== "-" },
    { icon: "🔥", value: bake, label: "Bake", show: bake && bake !== "-" },
    { icon: "🧭", value: total, label: "Total", show: total && total !== "-" },
    { icon: "👥", value: servings, label: "Servings", show: servings && servings !== "-" },
    { icon: "📶", value: difficulty, label: "Difficulty", show: difficulty && difficulty !== "-" },
  ].filter(chip => chip.show);

  if (chips.length === 0) return null;

  return (
    <section className="summary-v2 card">
      <div className="chips">
        {chips.map((chip, index) => (
          <div key={index} className="chip">
            <span>{chip.icon}</span>
            <b>{chip.value}</b>
            <small>{chip.label}</small>
          </div>
        ))}
      </div>
    </section>
  );
};
