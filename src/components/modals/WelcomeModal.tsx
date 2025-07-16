import React, { ChangeEvent, ImgHTMLAttributes, useState } from 'react';

// Icon components using HTML img elements
const LocationIcon = (props: ImgHTMLAttributes<HTMLImageElement>) => (
  <img src="/assets/travel_buddy_location.svg" alt="Location" {...props} />
);

interface WelcomeModalImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  screen_name: ScreenType;
}

const WelcomeModalImage = ({
  screen_name,
  ...props
}: WelcomeModalImageProps) => (
  <img
    src={`/assets/welcome_modal_${screen_name}.png`}
    alt="Pin"
    {...props}
    className={`${screen_name === 'welcome' ? 'w-[20%]' : 'w-[80%]'} h-auto ${props.className || ''}`}
  />
);

interface WelcomeModalProps {
  isOpen: boolean;
  onContinue: () => void;
}

type ScreenType = 'get_info' | 'welcome' | 'got_questions' | 'story_to_tell';

interface FormData {
  email: string;
  language: string;
}

const languageOptions = [
  { value: 'en', label: 'English', flag: '🇬🇧' },
  { value: 'ko', label: '한국어', flag: '🇰🇷' },
  { value: 'ja', label: '日本語', flag: '🇯🇵' },
  { value: 'fr', label: 'Français', flag: '🇫🇷' },
  { value: 'zh', label: '中文', flag: '🇨🇳' },
  { value: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
] as const;

type LanguageCode = (typeof languageOptions)[number]['value'];

const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onContinue }) => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('get_info');
  const [formData, setFormData] = useState<FormData>({
    email: '',
    language: 'en',
  });
  const [emailError, setEmailError] = useState<string>('');
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>('en');

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'email') {
      setEmailError(''); // Clear error when user types
    } else if (name === 'language') {
      setCurrentLanguage(value as LanguageCode);
    }
  };

  const handleContinue = () => {
    if (currentScreen === 'get_info') {
      if (!formData.email.trim()) {
        setEmailError('Email is required');
        return;
      }
      if (!validateEmail(formData.email)) {
        setEmailError('Invalid email address. Please try another!');
        return;
      }
      setCurrentScreen('welcome');
    } else if (currentScreen === 'welcome') {
      setCurrentScreen('got_questions');
    } else if (currentScreen === 'got_questions') {
      setCurrentScreen('story_to_tell');
    } else {
      onContinue();
    }
  };

  const screens = {
    get_info: {
      title: {
        en: 'Welcome to Travel Buddy!',
        ko: '트래블 버디에 오신 것을 환영합니다!',
        ja: 'トラベルバディへようこそ！',
        fr: 'Bienvenue dans Travel Buddy !',
        zh: '欢迎来到旅行伙伴！',
        vi: 'Chào mừng bạn đến với Travel Buddy!',
      },
      instruction: {
        en: '',
        ko: '',
        ja: '',
        fr: '',
        zh: '',
        vi: '',
      },
    },
    welcome: {
      title: {
        en: "Hi there, I'm your Travel Buddy!",
        ko: '안녕하세요, 저는 당신의 트래블 버디입니다!',
        ja: 'こんにちは、私はあなたのトラベルバディです！',
        fr: 'Bonjour, je suis votre Travel Buddy !',
        zh: '你好，我是你的旅行伙伴！',
        vi: 'Xin chào, tôi là Travel Buddy của bạn!',
      },
      instruction: {
        en: "Tap the sound icon and I'll guide you through each spot you're exploring.",
        ko: '사운드 아이콘을 탭하면 탐험하는 각 장소를 안내해 드립니다.',
        ja: 'サウンドアイコンをタップすると、探索している各スポットを案内します。',
        fr: "Appuyez sur l'icône sonore et je vous guiderai à travers chaque endroit que vous explorez.",
        zh: '点击声音图标，我会引导您探索每个景点。',
        vi: 'Nhấn vào biểu tượng âm thanh và tôi sẽ hướng dẫn bạn qua từng điểm bạn đang khám phá.',
      },
    },
    got_questions: {
      title: {
        en: 'Got questions?',
        ko: '질문이 있으신가요?',
        ja: '質問がありますか？',
        fr: 'Des questions ?',
        zh: '有问题吗？',
        vi: 'Có câu hỏi nào không?',
      },
      instruction: {
        en: "Ask me anything about the place, what to do, or where to eat. Any language, anytime, I'm here to help!",
        ko: '이 장소, 할 일, 먹을 곳에 대해 무엇이든 물어보세요. 어떤 언어로든, 언제든지, 제가 도와드리겠습니다!',
        ja: '場所、やること、食べる場所について何でも聞いてください。どの言語でも、いつでも、お手伝いします！',
        fr: "Demandez-moi n'importe quoi sur l'endroit, quoi faire ou où manger. Dans n'importe quelle langue, à tout moment, je suis là pour aider !",
        zh: '问我任何关于这个地方的问题，该做什么，或者在哪里吃饭。任何语言，随时，我在这里帮助你！',
        vi: 'Hỏi tôi bất cứ điều gì về địa điểm, việc cần làm hoặc nơi ăn uống. Bất kỳ ngôn ngữ nào, bất cứ lúc nào, tôi ở đây để giúp đỡ!',
      },
    },
    story_to_tell: {
      title: {
        en: 'Story to tell?',
        ko: '이야기를 나눌까요?',
        ja: '話がありますか？',
        fr: 'Une histoire à raconter ?',
        zh: '有故事要讲吗？',
        vi: 'Có câu chuyện muốn kể?',
      },
      instruction: {
        en: "Once you've captured the moment and wrapped up your experience, I can help turn it into a story. Go to the Story tab and let's create something memorable together.",
        ko: '순간을 포착하고 경험을 마무리했다면, 제가 그것을 이야기로 바꾸는 것을 도와드릴 수 있습니다. 스토리 탭으로 가서 함께 기억에 남을 무언가를 만들어봅시다.',
        ja: '瞬間を捉えて体験をまとめたら、それを物語にするお手伝いをします。ストーリータブに移動して、一緒に思い出に残るものを作りましょう。',
        fr: "Une fois que vous avez capturé le moment et terminé votre expérience, je peux vous aider à en faire une histoire. Allez dans l'onglet Histoire et créons ensemble quelque chose de mémorable.",
        zh: '一旦您捕捉到了这一刻并总结了您的经验，我可以帮助将其变成一个故事。转到故事选项卡，让我们一起创造一些难忘的东西。',
        vi: 'Một khi bạn đã ghi lại khoảnh khắc và kết thúc trải nghiệm, tôi có thể giúp biến nó thành một câu chuyện. Đến tab Câu chuyện và hãy cùng nhau tạo ra thứ gì đó đáng nhớ.',
      },
    },
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8 pt-15 pb-10">
        {/* Location Icon */}
        <div className="flex justify-center mb-4">
          <LocationIcon className="text-orange-500 w-12 h-12" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-black mb-4">
          {screens[currentScreen].title[currentLanguage]}
        </h2>

        {currentScreen === 'get_info' ? (
          <div className="space-y-4 mb-6">
            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Your Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border ${
                  emailError ? 'border-red-500' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500`}
                placeholder="Enter your email"
                required
              />
              {emailError && (
                <p className="mt-1 text-sm text-red-600">{emailError}</p>
              )}
            </div>

            {/* Language Select */}
            <div>
              <label
                htmlFor="language"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Your Language
              </label>
              <div className="relative w-full">
                <select
                  id="language"
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 pr-8 appearance-none"
                >
                  {languageOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.flag} &nbsp; {option.label}
                    </option>
                  ))}
                </select>
                {/* Arrow at the end */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Main Image of Modal */}
            <div className="flex justify-center mb-4 cursor-pointer hover:opacity-80">
              <WelcomeModalImage
                screen_name={currentScreen}
                className="text-black"
              />
            </div>

            {/* Instructional Text */}
            <p className="text-gray-600 text-sm text-center mb-6">
              {screens[currentScreen].instruction[currentLanguage]}
            </p>
          </>
        )}

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          disabled={
            currentScreen === 'get_info' &&
            (!formData.email.trim() || !!emailError)
          }
          className={`w-full ${
            currentScreen === 'get_info' &&
            (!formData.email.trim() || !!emailError)
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-orange-500 hover:bg-orange-600'
          } text-white font-bold py-3 px-4 rounded-lg transition-colors`}
        >
          {currentScreen === 'get_info'
            ? 'Get Started'
            : currentScreen === 'welcome' || currentScreen === 'got_questions'
              ? 'Continue'
              : "Let's Discover!"}
        </button>
      </div>
    </div>
  );
};

export default WelcomeModal;
