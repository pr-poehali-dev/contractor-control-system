import { useEffect, useRef } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { fetchTemplates } from '@/store/slices/documentTemplatesSlice';
import FUNC_URLS from '../../backend/func2url.json';

export const useInitTemplates = (userId: number | null) => {
  const dispatch = useAppDispatch();
  const initRef = useRef(false);

  useEffect(() => {
    const initializeTemplates = async () => {
      if (!userId || initRef.current) return;
      
      initRef.current = true;
      
      const hasInitialized = localStorage.getItem(`templates_initialized_${userId}`);
      
      if (!hasInitialized) {
        try {
          const response = await fetch(FUNC_URLS['init-templates'], {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user_id: userId }),
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success) {
              localStorage.setItem(`templates_initialized_${userId}`, 'true');
              dispatch(fetchTemplates());
            }
          }
        } catch (error) {
          console.error('Failed to initialize templates:', error);
        }
      } else {
        dispatch(fetchTemplates());
      }
    };

    initializeTemplates();
  }, [userId, dispatch]);
};
