-- Remove CHECK constraint on message_type that blocks insertions
ALTER TABLE chat_messages DROP CONSTRAINT IF EXISTS chat_messages_message_type_check;