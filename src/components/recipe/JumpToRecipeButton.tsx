export const JumpToRecipeButton = () => {
  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <button className="jump-btn" onClick={() => scrollTo("ingredients-section")}>
      ⤵ Jump to Recipe
    </button>
  );
};
