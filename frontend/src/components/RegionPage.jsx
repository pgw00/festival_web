// frontend/src/components/RegionPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
//import NavBar from './NavBar';
import '../RegionPage.css';
import '../festival.css';

const RegionPage = () => {
    const { regionName: encodedRegionName } = useParams();
    const regionName = decodeURIComponent(encodedRegionName || "");

    const [festivals, setFestivals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [dateInputError, setDateInputError] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchFestivalsByRegionAPI = useCallback(async () => {
        if (!regionName) {
            setFestivals([]);
            setError("표시할 지역 정보가 없습니다.");
            return;
        }

        setLoading(true);
        setError(null);
        setDateInputError('');

        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            if (start > end) {
                setDateInputError('시작 날짜는 종료 날짜보다 이전이거나 같아야 합니다.');
                setFestivals([]);
                setLoading(false);
                return;
            }
        }

        try {
            const params = new URLSearchParams();
            params.append('region', regionName);
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);
            if (searchTerm.trim()) params.append('keyword', searchTerm.trim());

            const response = await axios.get(`http://localhost:5000/api/festivals?${params.toString()}`);
            setFestivals(response.data.festivals || []);
        } catch (err) {
            let errMsg = `'${regionName}' 지역의 축제를 불러오는 중 오류가 발생했습니다.`;
            if (err.response?.data) {
                errMsg = err.response.data.error || err.response.data.message || errMsg;
            } else if (err.request) {
                errMsg = "서버 응답이 없습니다. 네트워크를 확인해주세요.";
            }
            setError(errMsg);
            setFestivals([]);
        } finally {
            setLoading(false);
        }
    }, [regionName, startDate, endDate, searchTerm]);

    useEffect(() => {
        fetchFestivalsByRegionAPI();
    }, [fetchFestivalsByRegionAPI]);

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        fetchFestivalsByRegionAPI();
    };

    useEffect(() => {
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            if (start > end) {
                setDateInputError('경고: 시작 날짜가 종료 날짜보다 뒤에 있습니다.');
            } else {
                setDateInputError('');
            }
        } else if (dateInputError && (!startDate || !endDate)) {
            setDateInputError('');
        }
    }, [startDate, endDate, dateInputError]);

    return (
        <div className="region-page-container">
            <header className="region-header">
                <h1>{regionName ? `${regionName} 축제 정보` : "지역 축제 정보"}</h1>
            </header>

            <form onSubmit={handleFilterSubmit} className="region-filters">
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                <span>~</span>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                <input
                    type="text"
                    placeholder="축제 이름, 내용 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ minWidth: '200px' }}
                />
                <button type="submit">검색</button>
            </form>

            {dateInputError && <p style={{ color: 'orange', textAlign: 'center' }}>{dateInputError}</p>}
            {error && !dateInputError && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

            <main className="region-festivals-list" style={{ padding: '20px' }}>
                {loading && <p style={{ textAlign: 'center' }}>축제 목록 로딩 중...</p>}
                {!loading && !error && !dateInputError && festivals.length === 0 && (
                    <p style={{ textAlign: 'center' }}>
                        {regionName ? `'${regionName}' 지역에 조건에 맞는 축제가 없습니다.` : "표시할 축제가 없습니다."}
                    </p>
                )}
                {!loading && !error && !dateInputError && festivals.length > 0 && (
                    <div className="festival-list">
                        {festivals.map((f, i) => (
                            <div className="festival-card" key={`${f.name}-${i}-region`}>
                                <img
                                    src={f.images?.[0] || `https://via.placeholder.com/220x150?text=${encodeURIComponent(f.name || '축제')}`}
                                    alt={f.name || '축제 이미지'}
                                    style={{ width: '100%', height: '180px', objectFit: 'cover', borderBottom: '1px solid #eee' }}
                                />
                                <div className="festival-info">
                                    <h3>{f.name}</h3>
                                    {f.description && (
                                        <p className="description">{f.description.slice(0, 80)}{f.description.length > 80 ? '...' : ''}</p>
                                    )}
                                    <ul>
                                        <li>📅 기간: {f.startDate} ~ {f.endDate}</li>
                                        <li>📍 장소: {f.address || '정보 없음'}</li>
                                        {f.themes?.length > 0 && <li>🏷️ 테마: {f.themes.join(', ')}</li>}
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

export default RegionPage;
