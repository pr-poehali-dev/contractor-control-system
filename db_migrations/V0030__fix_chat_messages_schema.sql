-- Rename text_content to message for consistency with backend code
ALTER TABLE chat_messages RENAME COLUMN text_content TO message;

-- Add comment to clarify table purposes
COMMENT ON TABLE chat_messages IS 'Chat messages between users - simple text messages only';
COMMENT ON TABLE work_logs IS 'Work reports from contractors with volume, materials, photos, and progress';