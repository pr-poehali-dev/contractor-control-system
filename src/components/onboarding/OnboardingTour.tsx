import { useState, useEffect } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { useNavigate } from 'react-router-dom';

interface OnboardingTourProps {
  onComplete: () => void;
  onSkip: () => void;
}

const OnboardingTour = ({ onComplete, onSkip }: OnboardingTourProps) => {
  const navigate = useNavigate();
  const [run, setRun] = useState(true);
  const [stepIndex, setStepIndex] = useState(0);

  const steps: Step[] = [
    {
      target: 'body',
      content: (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-slate-900">Добро пожаловать в систему управления строительством! 👋</h3>
          <p className="text-sm text-slate-600">
            Давайте за минуту покажем, как создать ваш первый объект и начать контролировать работы.
          </p>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '[data-tour="dashboard-tab"]',
      content: (
        <div className="space-y-2">
          <h4 className="font-semibold text-slate-900">Лента событий</h4>
          <p className="text-sm text-slate-600">
            Здесь отображаются все события: отчёты подрядчиков, проверки качества и важные уведомления по вашим объектам.
          </p>
        </div>
      ),
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '[data-tour="objects-tab"]',
      content: (
        <div className="space-y-2">
          <h4 className="font-semibold text-slate-900">Реестр объектов</h4>
          <p className="text-sm text-slate-600">
            Здесь вы управляете всеми вашими строительными объектами. Нажмите на эту вкладку, чтобы перейти к объектам!
          </p>
        </div>
      ),
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '[data-tour="work-templates-tab"]',
      content: (
        <div className="space-y-2">
          <h4 className="font-semibold text-slate-900">Справочник работ</h4>
          <p className="text-sm text-slate-600">
            В справочнике настройте виды работ и контрольные точки для проверки качества.
          </p>
        </div>
      ),
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '[data-tour="contractors-tab"]',
      content: (
        <div className="space-y-2">
          <h4 className="font-semibold text-slate-900">Управление подрядчиками</h4>
          <p className="text-sm text-slate-600">
            Добавляйте подрядчиков, назначайте их на работы и контролируйте выполнение в режиме реального времени.
          </p>
        </div>
      ),
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: 'body',
      content: (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-slate-900">Отлично! 🎉</h3>
          <p className="text-sm text-slate-600">
            Теперь вы знаете основы. Создавайте объекты, добавляйте работы и приглашайте подрядчиков для контроля качества!
          </p>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
    },
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, index, action } = data;

    if (status === STATUS.FINISHED) {
      setRun(false);
      onComplete();
    } else if (status === STATUS.SKIPPED) {
      setRun(false);
      onSkip();
    } else if (action === 'next') {
      setStepIndex(index + 1);
    } else if (action === 'prev') {
      setStepIndex(index - 1);
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      stepIndex={stepIndex}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: '#3b82f6',
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: 12,
          padding: 20,
        },
        buttonNext: {
          backgroundColor: '#3b82f6',
          borderRadius: 8,
          padding: '8px 16px',
          fontSize: 14,
          fontWeight: 500,
        },
        buttonBack: {
          color: '#64748b',
          marginRight: 8,
        },
        buttonSkip: {
          color: '#64748b',
          fontSize: 13,
        },
      }}
      locale={{
        back: 'Назад',
        close: 'Закрыть',
        last: 'Завершить',
        next: 'Далее',
        skip: 'Пропустить тур',
      }}
    />
  );
};

export default OnboardingTour;