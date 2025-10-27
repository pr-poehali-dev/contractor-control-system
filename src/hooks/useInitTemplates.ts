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
      
      console.log('🔧 Initializing templates for user:', userId, 'hasInitialized:', hasInitialized);
      
      if (!hasInitialized) {
        try {
          console.log('📡 Calling init-templates API...');
          const response = await fetch(FUNC_URLS['init-templates'], {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user_id: userId }),
          });

          const result = await response.json();
          console.log('📥 Init templates response:', result);

          if (response.ok && result.success) {
            localStorage.setItem(`templates_initialized_${userId}`, 'true');
            console.log('✅ Templates initialized successfully');
            dispatch(fetchTemplates());
          } else {
            console.error('❌ Failed to initialize templates:', result);
          }
        } catch (error) {
          console.error('❌ Failed to initialize templates:', error);
        }
      } else {
        console.log('⏭️ Templates already initialized, just fetching...');
        dispatch(fetchTemplates());
      }
    };

    initializeTemplates();
  }, [userId, dispatch]);
};