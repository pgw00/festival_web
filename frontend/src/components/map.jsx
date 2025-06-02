// src/components/map.jsx

import React, { useEffect, useRef, useState } from 'react';
import '../map.css';

const BACKEND_URL = 'http://localhost:5000';

const Map = ({ level = 4 }) => {
  const mapRef       = useRef(null);
  const [festivals, setFestivals]   = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  // 헬퍼: 주소 → LatLng Promise
  const getCoordFromAddress = address => {
    return new Promise(resolve => {
      if (!address) return resolve(null);
      const geocoder = new window.kakao.maps.services.Geocoder();
      geocoder.addressSearch(address, (res, status) => {
        if (status === window.kakao.maps.services.Status.OK && res[0]) {
          return resolve(new window.kakao.maps.LatLng(res[0].y, res[0].x));
        }
        const places = new window.kakao.maps.services.Places();
        places.keywordSearch(address, (res2, stat2) => {
          if (stat2 === window.kakao.maps.services.Status.OK && res2[0]) {
            return resolve(new window.kakao.maps.LatLng(res2[0].y, res2[0].x));
          }
          resolve(null);
        });
      });
    });
  };

  // 1) JSON 데이터 fetch & 파싱
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/festivals`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        // 🔥 여기서 data.festivals 사용!
        const items = Array.isArray(data.festivals) ? data.festivals : [];
        const parsed = items
          .map(item => ({
            id:        item.name,            // JSON에 축제ID 필드가 없으면 name 등을 ID로 사용
            name:      item.name,
            roadAddr:  (item.address || '').trim(),
            jibunAddr: '',                    // 지번주소 필드가 없으므로 비워두거나 address로 복사
            lat:       null,
            lng:       null,
          }))
          // 주소가 있어야 유효
          .filter(f => f.roadAddr);

        console.log('[DEBUG] parsed.length =', parsed.length);
        console.log('[DEBUG] sample items =', parsed.slice(0,3));
        setFestivals(parsed);
      })
      .catch(err => {
        console.error('[ERROR] 데이터 로드 실패:', err);
        setError(`데이터 로드 실패: ${err.message}`);
      })
      .finally(() => setDataLoaded(true));
  }, []);

  // 2) Kakao SDK 로드 & 지도 초기화
  useEffect(() => {
    if (!dataLoaded) return;
    if (!window.kakao?.maps?.load) {
      setError('Kakao SDK 로드 실패');
      setLoading(false);
      return;
    }

    window.kakao.maps.load(() => {
      const { kakao } = window;
      const container = mapRef.current;
      if (!container) {
        setError('지도 컨테이너를 찾을 수 없습니다.');
        setLoading(false);
        return;
      }

      const map = new kakao.maps.Map(container, {
        center: new kakao.maps.LatLng(37.5665, 126.9780),
        level,
      });

      // 3) 주소 → coord Promise
      const coordPromises = festivals.map(f =>
        getCoordFromAddress(f.roadAddr)
      );

      // 4) 마커 찍기
      Promise.all(coordPromises).then(coords => {
        const valid = coords
          .map((coord, i) => coord ? { ...festivals[i], coord } : null)
          .filter(x => x);

        if (valid.length === 0) {
          setError('유효한 축제 위치를 찾을 수 없습니다.');
          setLoading(false);
          return;
        }

        const bounds = new kakao.maps.LatLngBounds();
        valid.forEach(f => {
          bounds.extend(f.coord);
          const marker = new kakao.maps.Marker({ map, position: f.coord });
          const info = new kakao.maps.InfoWindow({
            content: `<div style="padding:5px;font-size:14px;">
                        <strong>${f.name}</strong><br/>
                        ${f.roadAddr}
                      </div>`
          });
          kakao.maps.event.addListener(marker, 'mouseover', () => info.open(map, marker));
          kakao.maps.event.addListener(marker, 'mouseout',  () => info.close());
        });

        valid.length > 1 ? map.setBounds(bounds) : map.setCenter(valid[0].coord);
        kakao.maps.event.addListener(map, 'tilesloaded', () => setLoading(false));
      });
    });
  }, [dataLoaded, festivals, level]);

  return (
    <div className="map-wrapper">
      {loading && <div className="map-loading" />}
      <div ref={mapRef} className="map-container" />
      {error && <div className="map-error">{error}</div>}
    </div>
  );
};

export default Map;
