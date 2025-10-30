import { useState } from "react";

interface RecipeStoryIntroProps {
  author?: string;
  story?: string;
}

export const RecipeStoryIntro = ({ author, story }: RecipeStoryIntroProps) => {
  const [showFull, setShowFull] = useState(false);

  if (!story) return null;

  const short = story.length > 220 ? story.slice(0, 220) + "…" : story;
  const needsExpansion = story.length > 220;

  return (
    <section className="story-intro-v2 card">
      <div className="byline">{author ? `By ${author}` : "From our kitchen"}</div>
      <p>{showFull ? story : short}</p>
      {needsExpansion && (
        <button className="link" onClick={() => setShowFull(!showFull)}>
          {showFull ? "Show less" : "Read more"}
        </button>
      )}
    </section>
  );
};
