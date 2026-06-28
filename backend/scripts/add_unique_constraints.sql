DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'uq_match_participants_user_post'
    ) THEN
        ALTER TABLE match_participants
        ADD CONSTRAINT uq_match_participants_user_post UNIQUE (user_id, post_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'uq_field_reviews_user_field'
    ) THEN
        ALTER TABLE field_reviews
        ADD CONSTRAINT uq_field_reviews_user_field UNIQUE (user_id, field_id);
    END IF;
END
$$;
