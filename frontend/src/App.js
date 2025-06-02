// frontend/src/App.js
import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Home from './components/home';
import Login from './components/Login';
import Register from './components/Register';
import Festival from './components/festival';
import Theme from './components/Theme';
import RegionsListPage from './components/RegionsListPage';
import RegionPage from './components/RegionPage';
import FindAccount from './components/FindAccount';
import SearchOverlay from './components/SearchOverlay';
import NavBar from './components/NavBar'; // NavBar를 여기서 import
import BannerThemeFestivalsPage from './components/BannerThemeFestivalsPage';
import Map from './components/map';

// 로딩 중 표시할 간단한 UI
const LoadingFallback = () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Loading translations...
    </div>
);

function AppContent() {
    const [isSearchOverlayOpen, setIsSearchOverlayOpen] = useState(false);
    const location = useLocation();

    const toggleSearchOverlay = () => {
        setIsSearchOverlayOpen(prev => !prev);
    };

    useEffect(() => {
        // 페이지 이동 시 검색 오버레이 닫기 (선택적)
        if (isSearchOverlayOpen) {
            setIsSearchOverlayOpen(false);
        }
    }, [location]);

    useEffect(() => {
        if (isSearchOverlayOpen) {
            document.body.classList.add('search-overlay-active');
        } else {
            document.body.classList.remove('search-overlay-active');
        }
        return () => {
            document.body.classList.remove('search-overlay-active');
        };
    }, [isSearchOverlayOpen]);

    return (
        <>
            {/* NavBar를 Routes 바깥에 한 번만 렌더링하고 필요한 props 전달 */}
            <NavBar toggleSearchOverlay={toggleSearchOverlay} />
            {/* NavBar 높이(70px) + .main-header의 상하 패딩 (1.5rem * 2 = 약 48px) = 약 118px */}
            {/* 정확한 값은 폰트 크기에 따라 달라질 수 있으므로, 개발자 도구에서 .main-header의 실제 높이를 확인하고 적용하는 것이 가장 좋습니다. */}
            <div className="main-content-area" style={{ paddingTop: '118px' }}> {/* <<< paddingTop 값 조정 */}
                <Routes>
                    {/* 이제 각 페이지 컴포넌트에는 toggleSearchOverlay를 전달할 필요가 없습니다.
                        NavBar가 AppContent 레벨에서 직접 toggleSearchOverlay를 받기 때문입니다.
                    */}
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Register />} />
                    <Route path="/festivals" element={<Festival />} />
                    <Route path="/themes" element={<Theme />} />
                    <Route path="/themes/:themeName" element={<Theme />} />
                    <Route path="/regions" element={<RegionsListPage />} />
                    <Route path="/region/:regionName" element={<RegionPage />} />
                    <Route path="/find-account" element={<FindAccount />} />
                    <Route path="/banner-theme/:themeKey" element={<BannerThemeFestivalsPage />} />
                    <Route path="/map" element={<Map />} /> 
                </Routes>
            </div>
            <SearchOverlay isOpen={isSearchOverlayOpen} onClose={toggleSearchOverlay} />
        </>
    );
}

function App() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <Router>
                <AppContent />
            </Router>
        </Suspense>
    );
}

export default App;