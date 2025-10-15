-- Set default value for message_type column
ALTER TABLE chat_messages ALTER COLUMN message_type SET DEFAULT 'text';

-- Add comment to clarify table usage  
COMMENT ON TABLE chat_messages IS 'Chat messages: use message_type=text for simple messages, other types for structured reports';
COMMENT ON COLUMN chat_messages.message_type IS 'Message type: text (simple chat), report (work log with materials/photos)';