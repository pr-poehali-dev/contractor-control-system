import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import ProUpgradeModal from '@/components/onboarding/ProUpgradeModal';

export default function TestProModal() {
  const [showModal, setShowModal] = useState(false);
  
  const testDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setShowModal(true)}
          className="bg-purple-600 hover:bg-purple-700 shadow-lg"
          size="sm"
        >
          <Icon name="TestTube" size={16} className="mr-2" />
          Тест PRO модалки
        </Button>
      </div>

      <ProUpgradeModal
        open={showModal}
        onOpenChange={setShowModal}
        registrationDate={testDate}
      />
    </>
  );
}
