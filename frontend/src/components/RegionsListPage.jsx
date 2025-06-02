// frontend/src/components/RegionsListPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
//import NavBar from './NavBar';
// import './RegionsListPage.css'; // CSS 파일 사용 시 주석 해제

const RegionsListPage = () => {
    const [regions, setRegions] = useState([
        // 초기 하드코딩 목록은 유지 (fallback 용도)
        { name: "서울", displayName: "서울특별시", pathValue: "서울특별시" },
        { name: "부산", displayName: "부산광역시", pathValue: "부산광역시" },
        { name: "대구", displayName: "대구광역시", pathValue: "대구광역시" },
        { name: "인천", displayName: "인천광역시", pathValue: "인천광역시" },
        { name: "광주", displayName: "광주광역시", pathValue: "광주광역시" },
        { name: "대전", displayName: "대전광역시", pathValue: "대전광역시" },
        { name: "울산", displayName: "울산광역시", pathValue: "울산광역시" },
        { name: "세종", displayName: "세종특별자치시", pathValue: "세종특별자치시" },
        { name: "경기", displayName: "경기도", pathValue: "경기도" },
        { name: "강원", displayName: "강원특별자치도", pathValue: "강원특별자치도" },
        { name: "충북", displayName: "충청북도", pathValue: "충청북도" },
        { name: "충남", displayName: "충청남도", pathValue: "충청남도" },
        { name: "전북", displayName: "전북특별자치도", pathValue: "전북특별자치도" },
        { name: "전남", displayName: "전라남도", pathValue: "전라남도" },
        { name: "경북", displayName: "경상북도", pathValue: "경상북도" },
        { name: "경남", displayName: "경상남도", pathValue: "경상남도" },
        { name: "제주", displayName: "제주특별자치도", pathValue: "제주특별자치도" },
    ]);
    const [loadingError, setLoadingError] = useState(null);

    useEffect(() => {
        fetch('/regions.json')
            .then(response => {
                if (!response.ok) {
                    console.warn(`RegionsListPage: regions.json 로드 실패 (상태: ${response.status}). 기본 지역 목록을 사용합니다.`);
                    return null;
                }
                return response.json();
            })
            .then(data => {
                if (data && data.provinces && Array.isArray(data.provinces)) {
                    const fetchedRegions = data.provinces.map(provinceName => ({
                        // pathValue는 URL에 사용되므로, displayName과 동일하게 유지하거나 서버에서 제공하는 고유 식별자 사용
                        name: provinceName.replace(/특별자치도|광역시|특별자치시|도$/, ''),
                        displayName: provinceName,
                        pathValue: provinceName
                    }));
                    // 받아온 데이터에 "전국"이 없다면 추가하지 않음. 이 페이지는 지역 '선택'이므로 "전국"은 불필요할 수 있음.
                    // 만약 "전국"으로 필터링된 Festival 페이지로 가는 링크가 필요하다면 별도 처리.
                    setRegions(fetchedRegions);
                } else if (data) {
                    console.warn('RegionsListPage: regions.json 파일 형식이 예상과 다릅니다. 기본 지역 목록을 사용합니다.');
                }
            })
            .catch(error => {
                console.error("RegionsListPage: Error fetching or processing regions.json:", error);
                setLoadingError("지역 목록을 가져오는 중 오류가 발생했습니다. 기본 목록으로 표시됩니다.");
            });
    }, []);

    return (
        <div className="regions-list-page-container">
            <header style={{ padding: '20px', textAlign: 'center', backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6' }}> {/* 원본 인라인 스타일 유지 */}
                <h1>지역별 축제 찾아보기</h1>
                <p>관심 있는 지역을 선택하시면 해당 지역의 다양한 축제 정보를 확인할 수 있습니다.</p>
            </header>
            {loadingError && <p style={{ color: 'red', textAlign: 'center', padding: '10px' }}>{loadingError}</p>}
            <div className="regions-grid" style={{ /* 원본 인라인 스타일 유지 */
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: '20px',
                padding: '30px',
                maxWidth: '1200px',
                margin: '0 auto'
            }}>
                {regions.map(region => (
                    <Link
                        to={`/region/${encodeURIComponent(region.pathValue)}`}
                        key={region.pathValue} // pathValue가 고유하다고 가정
                        className="region-card-link" // CSS 클래스가 있다면 유지
                        style={{ /* 원본 인라인 스타일 유지 */
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            minHeight: '100px',
                            padding: '20px',
                            border: '1px solid #e0e0e0',
                            borderRadius: '8px',
                            textAlign: 'center',
                            textDecoration: 'none',
                            color: '#333',
                            backgroundColor: '#ffffff',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                            transition: 'transform 0.2s ease-in-out, boxShadow 0.2s ease-in-out'
                        }}
                        onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.1)'; }} // 원본 인라인 스타일 유지
                        onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)'; }} // 원본 인라인 스타일 유지
                    >
                        <span style={{ fontSize: '1.1em', fontWeight: '500' }}>{region.displayName}</span> {/* 원본 인라인 스타일 유지 */}
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default RegionsListPage;