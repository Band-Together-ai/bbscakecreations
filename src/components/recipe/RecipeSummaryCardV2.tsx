interface RecipeSummaryCardV2Props {
  prep?: string;
  bake?: string;
  total?: string;
  servings?: string;
  difficulty?: string;
}

export const RecipeSummaryCardV2 = ({ 
  prep = "-", 
  bake = "-", 
  total = "-", 
  servings = "-", 
  difficulty = "-" 
}: RecipeSummaryCardV2Props) => {
  return (
    <section className="summary-v2 card">
      <div className="chips">
        <div className="chip">
          <span>⏱</span>
          <b>{prep}</b>
          <small>Prep</small>
        </div>
        <div className="chip">
          <span>🔥</span>
          <b>{bake}</b>
          <small>Bake</small>
        </div>
        <div className="chip">
          <span>🧭</span>
          <b>{total}</b>
          <small>Total</small>
        </div>
        <div className="chip">
          <span>👥</span>
          <b>{servings}</b>
          <small>Servings</small>
        </div>
        <div className="chip">
          <span>📶</span>
          <b>{difficulty}</b>
          <small>Difficulty</small>
        </div>
      </div>
    </section>
  );
};
