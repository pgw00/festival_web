// frontend/src/components/BannerThemeFestivalsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import '../festival.css'; // 축제 카드 스타일 재활용

// 각 테마 키에 따른 배경 이미지 URL 매핑 (예시)
const themeBackgrounds = {
    default: '/images/regions/default-region.jpg', // 기본 배경
    winter_snow: '/images/slide1.jpg', // '겨울 눈꽃' 테마 배경 예시
    summer_music: '/images/slide2.jpg', // '여름 음악' 테마 배경 예시
    traditional_culture: '/images/slide3.jpg', // (예시) 전통 문화 테마 배경
    food_festival: '/images/slide4.jpg' // (예시) 음식 축제 테마 배경
    // home.jsx의 슬라이드 이미지와 일치시키거나, 각 테마에 맞는 별도 이미지 지정
};

const BannerThemeFestivalsPage = () => {
    const { t } = useTranslation();
    const { themeKey } = useParams();

    const [festivals, setFestivals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [themeName, setThemeName] = useState(''); // 초기값을 빈 문자열 또는 로딩 상태로 설정 가능

    // 현재 테마에 맞는 배경 이미지 가져오기
    const currentBackground = themeBackgrounds[themeKey] || themeBackgrounds.default;

    // 테마 이름을 번역하거나 보기 좋게 표시하기 위한 로직 수정
    useEffect(() => {
        if (themeKey) { // themeKey가 존재할 때만 실행
            const titleKey = `banner_theme_${themeKey}_title`;
            // t 함수는 해당 키에 대한 번역이 없으면 defaultValue를 사용합니다.
            const translatedThemeName = t(titleKey, { defaultValue: t('banner_theme_default_title', { themeKey: themeKey }) });

            // 디버깅을 위해 콘솔 로그 추가
            console.log(`[BannerThemePage] Initial themeKey: ${themeKey}`);
            console.log(`[BannerThemePage] Constructed titleKey: ${titleKey}`);
            console.log(`[BannerThemePage] Translated themeName: ${translatedThemeName}`);

            setThemeName(translatedThemeName);
        }
    }, [themeKey, t]);

    const fetchFestivalsByTheme = useCallback(async () => {
        if (!themeKey) {
            setError(t('banner_theme_page_no_theme_key'));
            setFestivals([]);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`http://localhost:5000/api/festivals?theme=${encodeURIComponent(themeKey)}`);
            setFestivals(response.data.festivals || []);
        } catch (err) {
            console.error("BannerThemeFestivalsPage: Error fetching festivals by theme", err);
            // themeName이 아직 설정되기 전일 수 있으므로, 에러 메시지에는 themeKey를 직접 사용할 수 있습니다.
            let errMsg = t('banner_theme_page_error_loading', { theme: themeName || themeKey });
            if (err.response && err.response.data && (err.response.data.error || err.response.data.message)) {
                errMsg = err.response.data.error || err.response.data.message;
            }
            setError(errMsg);
            setFestivals([]);
        } finally {
            setLoading(false);
        }
    }, [themeKey, t, themeName]); // themeName이 변경되면 fetch 함수도 새로 생성되도록 포함

    useEffect(() => {
        fetchFestivalsByTheme();
    }, [fetchFestivalsByTheme]); // fetchFestivalsByTheme 함수 자체가 변경될 때 호출

    return (
        <div className="banner-theme-festivals-page">
            <header
                className="themed-hero-section"
                style={{
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${process.env.PUBLIC_URL}${currentBackground})`, // PUBLIC_URL 사용
                    height: '350px',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    color: 'white',
                    marginBottom: '30px',
                }}
            >
                {/* themeName이 설정될 때까지 themeKey를 기본으로 보여주거나 로딩 상태 표시 가능 */}
                <h1>{themeName || t('loading_results', '로딩 중...')}</h1>
            </header>

            <main style={{ padding: '0 20px', maxWidth: '1200px', margin: '0 auto' }}>
                {loading && <p style={{ textAlign: 'center', fontSize: '1.2em' }}>{t('festivals_loading')}</p>}
                {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
                {!loading && !error && festivals.length === 0 && (
                    <p style={{ textAlign: 'center', fontSize: '1.1em', marginTop: '20px' }}>
                        {t('banner_theme_page_no_festivals', { theme: themeName || themeKey })}
                    </p>
                )}

                {!loading && !error && festivals.length > 0 && (
                    <div className="festival-list"> {/* festival.css의 스타일 재활용 */}
                        {festivals.map((f, i) => (
                            <div className="festival-card" key={f['축제일련번호'] || `${f['축제명']}-${i}-banner-theme`}>
                                <img
                                    src={f['대표이미지'] || `${process.env.PUBLIC_URL}/images/placeholder.png`} // 예시 플레이스홀더
                                    alt={f['축제명'] || t('festival_image_alt', '축제 이미지')}
                                    className="festival-card-image"
                                    onError={(e) => { e.target.onerror = null; e.target.src = `${process.env.PUBLIC_URL}/images/placeholder.png`; }} // 이미지 로드 실패 시 대체 이미지
                                />
                                <div className="festival-info">
                                    <h3>{f['축제명']}</h3>
                                    {f['축제내용'] && <p className="description">{f['축제내용'].slice(0, 100)}{f['축제내용'].length > 100 ? '...' : ''}</p>}
                                    <ul>
                                        <li>{t('festivals_card_duration', { startDate: f['축제시작일자'], endDate: f['축제종료일자'] })}</li>
                                        <li>{t('festivals_card_location', { location: f['개최장소'] || t('no_location_info') })}</li>
                                        {f['홈페이지주소'] && <li><a href={f['홈페이지주소']} target="_blank" rel="noopener noreferrer">🔗 {t('festivals_card_homepage')}</a></li>}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default BannerThemeFestivalsPage;