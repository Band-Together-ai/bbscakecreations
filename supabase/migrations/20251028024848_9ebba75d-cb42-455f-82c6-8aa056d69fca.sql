-- Add story_text column to profile_settings
ALTER TABLE public.profile_settings
ADD COLUMN story_text TEXT DEFAULT 'Hi, I''m Brandia—a baker who believes cakes should tell stories, not just fill bellies. I started baking when I realized store-bought just didn''t capture the magic of real ingredients and real intention.

Growing up near the ocean in Wilmington, I learned that the best things in life are crafted with patience, like waves shaping the shore. That''s how I approach every cake—layer by layer, from scratch, with love baked into every crumb.

I never use box mixes or fondant. Why? Because shortcuts rob cakes of their soul. Instead, I craft recipes that can be adapted to be gluten-free without compromising texture—almond flour that creates the dreamiest sponge, xanthan gum for that perfect crumb.

My signature? Live flowers and herbs. Lavender, rosemary, edible pansies—nature''s beauty adorns every creation. Each cake celebrates not just an occasion, but the people and stories behind it.';