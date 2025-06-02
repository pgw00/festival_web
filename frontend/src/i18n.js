import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 번역 파일 import
import translationKO from './locales/ko/translation.json';
import translationEN from './locales/en/translation.json';
import translationJA from './locales/ja/translation.json';
import translationZH from './locales/zh/translation.json';

const resources = {
    ko: {
        translation: translationKO
    },
    en: {
        translation: translationEN
    },
    ja: {
        translation: translationJA
    },
    zh: {
        translation: translationZH
    }
};

i18n
    .use(LanguageDetector) // 브라우저 언어 감지
    .use(initReactI18next) // i18n 인스턴스를 react-i18next에 전달
    .init({
        resources,
        fallbackLng: 'ko', // 사용할 수 없는 언어일 경우 한국어로 대체
        debug: process.env.NODE_ENV === 'development', // 개발 모드에서 디버그 메시지 활성화
        interpolation: {
            escapeValue: false // React는 이미 XSS로부터 안전하게 처리함
        },
        detection: {
            order: ['localStorage', 'cookie', 'navigator', 'htmlTag'], // 언어 감지 순서
            caches: ['localStorage', 'cookie'] // 감지된 언어를 localStorage와 cookie에 저장
        }
    });

export default i18n;