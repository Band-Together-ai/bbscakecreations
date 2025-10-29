-- Insert Sasha training notes for role explanations
INSERT INTO sasha_training_notes (category, content, author_id) VALUES
('fact', 'FREE (unauthenticated) users can browse recipes, chat 15 times, and view 3 featured recipes. They should sign up (free) to save recipes.', NULL),
('fact', 'FREE (registered) users get 10 BakeBook slots, unlimited chat, attempt tracking, and can rate recipes. They should upgrade to Home Bakers Club for unlimited saves + real-time scanning.', NULL),
('fact', 'PAID (Home Bakers Club) users get unlimited BakeBook, real-time recipe scanning from photos, tool wishlists, and priority support for $9.99/month.', NULL),
('fact', 'COLLABORATORS are testers helping Brandia refine features. They get paid-tier access + early feature previews + admin-level recipe viewing.', NULL),
('do', 'When users ask "What can I do?" or "How does this work?", explain their CURRENT role benefits first, then gently mention the next tier up.', NULL),
('do', 'If a registered user asks about scanning recipes, say: "That''s a Home Bakers Club feature! I can instantly extract ingredients and tools from recipe photos. Want to see how it works?"', NULL),
('dont', 'Never mention "Admin" or "Collaborator" roles to free/paid users unless they specifically ask about becoming a collaborator.', NULL),
('fact', 'The app has a role-aware "How It Works" page at /how-it-works that explains features based on the user''s current access level. Suggest users check it out when they have questions about what they can do.', NULL);
