// frontend/src/components/Festival.jsx
import React, { useState, useEffect, useCallback } from 'react';
import '../festival.css';



const Festival = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [allProvinces, setAllProvinces] = useState(['전국']);
  const [selectedProvince, setSelectedProvince] = useState('전국');
  const [keyword, setKeyword] = useState('');
  const [theme] = useState(''); // 필요시 테마 필터용
  const [festivals, setFestivals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [dateInputError, setDateInputError] = useState('');

  useEffect(() => {
  fetch('/regions.json')
    .then((res) => {
      if (!res.ok) throw new Error('지역 데이터 로드 실패');
      return res.json();
    })
    .then((data) => {
      if (data?.provinces && Array.isArray(data.provinces)) {
        // 중복 제거
        const uniqueProvinces = ['전국', ...data.provinces.filter(p => p !== '전국')];
        setAllProvinces(uniqueProvinces);
      }
    })
    .catch(() => {
      setAllProvinces([
        '전국',
        '서울특별시',
        '부산광역시',
        '대구광역시',
        '인천광역시',
        '광주광역시',
        '대전광역시',
        '울산광역시',
        '세종특별자치시',
        '경기도',
        '강원특별자치도',
        '충청북도',
        '충청남도',
        '전북특별자치도',
        '전라남도',
        '경상북도',
        '경상남도',
        '제주특별자치도',
      ]);
    });
}, []);

  // 날짜 포맷 변환 (YYYY-MM-DD)
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    if (/^\d{8}$/.test(dateStr)) {
      // YYYYMMDD 형태일 경우
      return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
    }
    return dateStr; // 이미 YYYY-MM-DD 형식인 경우 그대로 리턴
  };

  // API 호출 함수
 const fetchFestivalsAPI = useCallback(async () => {
  setApiError(null);
  setDateInputError('');

  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    setDateInputError('시작 날짜는 종료 날짜보다 이전이거나 같아야 합니다.');
    setFestivals([]);
    return;
  }

  setLoading(true);

  try {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate.replace(/-/g, ''));
    if (endDate) params.append('endDate', endDate.replace(/-/g, ''));
    if (selectedProvince && selectedProvince !== '전국') params.append('region', selectedProvince);
    if (keyword.trim()) params.append('keyword', keyword.trim());
    if (theme) params.append('theme', theme);

    const url = `http://localhost:5000/api/festivals?${params.toString()}`;
    console.log('Fetching URL:', url);

    const response = await fetch(url);
    console.log('Response status:', response.status);

    if (!response.ok) {
      const errData = await response.json().catch(() => null);
      throw new Error(errData?.error || `API 에러: ${response.status}`);
    }

    const data = await response.json();
    console.log('API 데이터:', data);

    const formatted = (data.festivals || []).map((f) => ({
      ...f,
      image: f.images?.length > 0 ? f.images[0] : null,
    }));

    setFestivals(formatted);
  } catch (error) {
    console.error('Fetch 에러:', error);
    setApiError(error.message || '데이터를 불러오는 중 오류가 발생했습니다.');
    setFestivals([]);
  } finally {
    setLoading(false);
  }
}, [startDate, endDate, selectedProvince, keyword, theme]);

  const handleSearchClick = (e) => {
    e.preventDefault();
    setHasSearched(true);
    fetchFestivalsAPI();
  };

  return (
    <div className="festival-page">

      <div className="festival-status-banner">
        <img src="/images/festival-map.jpg" alt="전국축제현황" className="banner-image" />
        <div className="banner-text">전국지역별 축제 현황</div>
      </div>

      <form className="search-bar" onSubmit={handleSearchClick}>
        <label htmlFor="startDateInput">기간:</label>
        <input
          id="startDateInput"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          aria-label="검색 시작 날짜"
        />
        <span>~</span>
        <input
          id="endDateInput"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          aria-label="검색 종료 날짜"
        />

        <select
          value={selectedProvince}
          onChange={(e) => setSelectedProvince(e.target.value)}
          aria-label="지역 선택"
        >
          {allProvinces.map((province) => (
            <option key={province} value={province}>
              {province}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="키워드 입력 (선택)"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          aria-label="키워드 검색"
        />

        {/* 테마 필터 UI 필요 시 추가 가능 */}
        {/* <select value={theme} onChange={e => setTheme(e.target.value)}>
          <option value="">전체 테마</option>
          <option value="문화">문화</option>
          <option value="음식">음식</option>
          ...
        </select> */}

        <button type="submit">검색</button>
      </form>

      {dateInputError && <p style={{ color: 'orange', textAlign: 'center' }}>{dateInputError}</p>}
      {apiError && !dateInputError && <p style={{ color: 'red', textAlign: 'center' }}>{apiError}</p>}

      <div className="festival-list">
        {!hasSearched && !loading && !dateInputError && !apiError && (
          <p style={{ textAlign: 'center' }}>검색 버튼을 눌러 축제 정보를 확인하세요.</p>
        )}

        {loading && <p style={{ textAlign: 'center' }}>로딩 중...</p>}

        {!loading && !dateInputError && festivals.length === 0 && hasSearched && !apiError && (
          <p style={{ textAlign: 'center' }}>조건에 맞는 축제가 없습니다.</p>
        )}

        {!loading &&
          !dateInputError &&
          !apiError &&
          festivals.map((f, i) => (
            <div className="festival-card" key={f.resource || `${f.name}-${i}`}>
              <img
                src={
                  f.image ||
                  `https://via.placeholder.com/220x150?text=${encodeURIComponent(f.name || '축제')}`
                }
                alt={f.name || '축제 이미지'}
                className="festival-card-image"
              />
              <div className="festival-info">
                <h3>{f.name}</h3>
                <p className="description">{f.description || '상세 정보가 없습니다.'}</p>
                {f.address && <p className="location">주소: {f.address}</p>}
                {(f.startDate || f.endDate) && (
                  <p className="dates">
                    기간: {formatDate(f.startDate)} ~ {formatDate(f.endDate)}
                  </p>
                )}
                {f.themes && f.themes.length > 0 && (
                  <p className="themes">테마: {f.themes.join(', ')}</p>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Festival;
