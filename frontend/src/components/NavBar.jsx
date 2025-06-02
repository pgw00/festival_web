// frontend/src/components/NavBar.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate, NavLink } // NavLink가 active 스타일 처리에 유용합니다.
    from "react-router-dom";
import { useTranslation } from 'react-i18next';
// import './NavBar.css'; // 이 줄은 주석 처리 또는 삭제 (home.css 사용)

const NavBar = ({ toggleSearchOverlay }) => {
    const { t, i18n } = useTranslation();
    const [isProfileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
    const navigate = useNavigate();

    const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("isLoggedIn") === "true");
    const [userName, setUserName] = useState(isLoggedIn ? localStorage.getItem("userName") || "" : "");

    useEffect(() => {
        const updateAuthState = () => {
            const currentIsLoggedIn = localStorage.getItem("isLoggedIn") === "true";
            setIsLoggedIn(currentIsLoggedIn);
            setUserName(currentIsLoggedIn ? localStorage.getItem("userName") || "" : "");
        };
        window.addEventListener('storage', updateAuthState);
        // 컴포넌트 마운트 시 초기 상태 설정
        updateAuthState();
        return () => window.removeEventListener('storage', updateAuthState);
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        setIsLoggedIn(false);
        setUserName("");
        setProfileDropdownOpen(false); // 드롭다운 닫기
        navigate("/");
        // 강제 새로고침 대신 상태 업데이트와 React Router의 네비게이션을 통해 UI가 반영되도록 합니다.
        // window.location.reload(); // 일반적으로는 권장되지 않음
    };

    const handleSearchIconClick = (e) => {
        e.preventDefault();
        if (toggleSearchOverlay) {
            toggleSearchOverlay();
        } else {
            console.warn("toggleSearchOverlay function not provided to NavBar");
        }
    };

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        setIsLangDropdownOpen(false);
    };

    const languages = [
        { code: 'ko', name: t('lang_korean', '한국어') },
        { code: 'en', name: t('lang_english', 'English') },
        { code: 'ja', name: t('lang_japanese', '日本語') },
        { code: 'zh', name: t('lang_chinese', '中文') },
    ];

    return (
        <header className="main-header"> {/* home.css 에 정의된 스타일 적용 */}
            <div className="top-bar"> {/* home.css 에 정의된 스타일 적용 */}
                <div className="logo">
                    <Link to="/" className="logo-text"> {/* home.css 에 정의된 스타일 적용 */}
                        🎪 FESTIVAL.TOWN
                    </Link>
                </div>
                <nav className="main-nav"> {/* home.css 에 정의된 스타일 적용 */}
                    <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>{t('nav_home')}</NavLink>
                    <NavLink to="/themes" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>{t('nav_themes')}</NavLink>
                    <NavLink to="/regions" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>{t('nav_regions')}</NavLink>
                    <NavLink to="/festivals" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>{t('nav_all_festivals')}</NavLink>
                </nav>
                <div className="header-icons"> {/* home.css 에 정의된 스타일 적용 */}
                    <button onClick={handleSearchIconClick} className="icon-button" aria-label={t('nav_search_alt')}>
                        <img src={`${process.env.PUBLIC_URL}/images/search.svg`} alt={t('nav_search_alt')} /> {/* 아이콘 경로 예시 */}
                    </button>
                    <Link to="/map" className="icon-button" aria-label={t('nav_map')}>
                        <img src={`${process.env.PUBLIC_URL}/images/map.svg`} alt={t('nav_map')} />
                    </Link>
                    {isLoggedIn ? (
                        <div className="profile-menu-container"> {/* home.css (position:relative) 및 index.css (드롭다운 모양) 스타일 적용 */}
                            <button onClick={() => setProfileDropdownOpen(!isProfileDropdownOpen)} className="icon-button profile-button" aria-haspopup="true" aria-expanded={isProfileDropdownOpen} aria-label={t('nav_profile_alt')}>
                                <img src={`${process.env.PUBLIC_URL}/images/account_circle.svg`} alt={t('nav_profile_alt')} />
                            </button>
                            {isProfileDropdownOpen && (
                                <div className="profile-dropdown" role="menu"> {/* index.css 스타일 */}
                                    <div className="dropdown-user-info">{t('user_greeting', { name: userName })}</div>
                                    <Link to="/mypage" className="dropdown-item-button" onClick={() => setProfileDropdownOpen(false)}>{t('nav_mypage', "마이페이지")}</Link>
                                    <button onClick={handleLogout} role="menuitem" className="dropdown-item-button logout">
                                        {t('nav_logout')}
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to="/login" className="icon-button" aria-label={t('nav_login')}>
                                <img src={`${process.env.PUBLIC_URL}/images/account_circle.svg`} alt={t('nav_login')} />
                        </Link>
                    )}
                    <div className="language-switcher-container profile-menu-container"> {/* profile-menu-container 클래스 공유 */}
                        <button onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)} className="icon-button language-button" aria-label={t('nav_language_alt')} aria-haspopup="true" aria-expanded={isLangDropdownOpen}>
                            <img src={`${process.env.PUBLIC_URL}/images/language.svg`} alt={t('nav_language_alt')} />
                        </button>
                        {isLangDropdownOpen && (
                            <div className="profile-dropdown language-options" role="menu"> {/* index.css 스타일 */}
                                {languages.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => changeLanguage(lang.code)}
                                        role="menuitem"
                                        className={`dropdown-item-button ${i18n.language.startsWith(lang.code) ? 'active' : ''}`}
                                        disabled={i18n.language.startsWith(lang.code)}
                                    >
                                        {lang.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};
export default NavBar;