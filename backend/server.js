/// backend/server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 5000;
const db = require('./lib/db'); // db.js 파일이 ./lib/ 폴더에 있다고 가정
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const endpoint = 'https://data.visitkorea.or.kr/sparql';
const axios = require('axios');
const qs = require('qs');
const pythonScriptPath = path.join(__dirname, 'python_recommender', 'recommender.py');
const JWT_SECRET = process.env.JWT_SECRET || 'your-very-strong-secret-key-in-production'; // 💥 환경 변수 사용 권장

// --- 테마 관련 정의 ---
const THEME_KEYWORDS = {
    '야간관광': ['야간관광', '야간', '밤', '야경', '나이트', '별빛', '달빛', '조명', '야시장', '밤마실', '나이트마켓'],
    '문화관광해설사 통합예약': ['해설사', '문화관광', '투어', '가이드', '역사탐방', '문화유산', '해설', '예약', '통합예약'],
    '한국관광의별': ['한국관광의별', '우수관광', '추천여행', '대표관광지', '별', '선정'],
    '스마트관광도시': ['스마트관광', 'AI여행', 'AR', 'VR', '첨단기술', '미래관광', '디지털', '스마트도시', '인공지능'],
    '두루누비': ['두루누비', '걷기여행', '둘레길', '트레킹', '생태탐방', '자전거길', '도보여행', '길'],
    '디지털 관광주민증': ['관광주민증', '디지털주민증', '지역혜택', '할인', '주민증', '방문혜택'],
    '스포츠/레저여행': ['스포츠', '레저', '운동', '게임', '대회', '축구', '야구', '헬스', '이스포츠'],
    '자연/생태여행': ['자연', '경관', '생태', '꽃', '산', '바다', '강', '숲', '공원', '여행', '관광', '투어', '나들이', '탐방', '둘레길'],
    '영화/콘텐츠여행': ['영화', '영상', '미디어아트', '애니메이션', '필름', '시네마', '애니', '캐릭터', '웹툰']
};


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors()); // 모든 출처 허용 (개발용). 프로덕션에서는 특정 출처만 허용하도록 설정 권장

const AVAILABLE_THEMES = Object.keys(THEME_KEYWORDS);
let festivalsWithThemes = [];




function assignThemesToFestivals(festivalRecords) {
  if (!Array.isArray(festivalRecords)) return [];

  return festivalRecords.map(festival => {
    const assignedThemes = new Set();

    const searchTextSource = `${festival.name || ''} ${festival.description || ''} ${festival.address || ''}`.toLowerCase();

    for (const themeName in THEME_KEYWORDS) {
      if (THEME_KEYWORDS[themeName].some(keyword => searchTextSource.includes(keyword.toLowerCase()))) {
        assignedThemes.add(themeName);
      }
    }

    return { ...festival, themes: Array.from(assignedThemes) };
  });
}

app.get('/api/festivals', async (req, res) => {
  const { region, startDate, endDate, keyword, theme } = req.query;

  let filterStartDate = null;
  let filterEndDate = null;

  const regionFilter = ''; 
    //? `FILTER(CONTAINS(LCASE(?address), LCASE("${region}")))`
    //: '';

  const sparqlQuery = `
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX dc: <http://purl.org/dc/elements/1.1/>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX vi: <http://www.saltlux.com/transformer/views#>
PREFIX kto: <http://data.visitkorea.or.kr/ontology/>
PREFIX ktop: <http://data.visitkorea.or.kr/property/>
PREFIX ids: <http://data.visitkorea.or.kr/resource/>
PREFIX wgs: <http://www.w3.org/2003/01/geo/wgs84_pos#>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX geo: <http://www.saltlux.com/geo/property#>
PREFIX pf: <http://www.saltlux.com/DARQ/property#>
PREFIX schema: <http://schema.org/>

SELECT ?resource ?name ?image ?description ?address ?startDate ?endDate
WHERE {
  ?resource a ?type ;
            rdfs:label ?name .
  FILTER (?type IN (kto:SpecialFestival, kto:RegularFestival))

  OPTIONAL { ?resource schema:image ?image . }
  OPTIONAL { ?resource foaf:depiction ?image . }
  OPTIONAL { ?resource dc:description ?description . }
  OPTIONAL { ?resource ktop:address ?address . }
  OPTIONAL { ?resource ktop:startDate ?startDate . }
  OPTIONAL { ?resource ktop:endDate ?endDate . }

  ${regionFilter}
}
LIMIT 1500
`;

  try {
    const response = await axios.post(
      'http://data.visitkorea.or.kr/sparql',
      qs.stringify({
        query: sparqlQuery,
        format: 'application/sparql-results+json',
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/sparql-results+json',
        },
      }
    );

    const rawFestivals = response.data.results.bindings.map((item) => ({
      resource: item.resource?.value || null,
      name: item.name?.value || '',
      image: item.image?.value || null,
      description: item.description?.value || '',
      address: item.address?.value || '',
      startDate: item.startDate?.value || null,
      endDate: item.endDate?.value || null,
    })).filter(f => f.resource && f.name);

    const festivalMap = new Map();

    rawFestivals.forEach((f) => {
      if (!festivalMap.has(f.resource)) {
        festivalMap.set(f.resource, {
          name: f.name,
          description: f.description,
          images: f.image ? [f.image] : [],
          address: f.address,
          startDate: f.startDate,
          endDate: f.endDate,
        });
      } else {
        if (f.image && !festivalMap.get(f.resource).images.includes(f.image)) {
          festivalMap.get(f.resource).images.push(f.image);
        }
      }
    });

    let festivals = Array.from(festivalMap.values());

    // 🎯 1. 테마 자동 분류
    festivals = assignThemesToFestivals(festivals);

    // 🎯 2. 날짜 필터링 준비
    const parseDate = (str) => {
      if (!/^\d{8}$/.test(str)) return null;
      const y = +str.slice(0, 4);
      const m = +str.slice(4, 6) - 1;
      const d = +str.slice(6, 8);
      return new Date(y, m, d);
    };

    if (startDate) {
      filterStartDate = /^\d{8}$/.test(startDate) ? parseDate(startDate) : new Date(startDate);
      if (!filterStartDate || isNaN(filterStartDate)) {
        return res.status(400).json({ error: '잘못된 startDate 형식입니다.' });
      }
      filterStartDate.setHours(0, 0, 0, 0);
    }

    if (endDate) {
      filterEndDate = /^\d{8}$/.test(endDate) ? parseDate(endDate) : new Date(endDate);
      if (!filterEndDate || isNaN(filterEndDate)) {
        return res.status(400).json({ error: '잘못된 endDate 형식입니다.' });
      }
      filterEndDate.setHours(23, 59, 59, 999);
    }

    // 🎯 날짜 필터 적용
    if ((filterStartDate || filterEndDate)) {
      festivals = festivals.filter(f => {
        if (!f.startDate || !f.endDate) return false;

        const s = parseDate(f.startDate);
        const e = parseDate(f.endDate);
        if (!s || !e || isNaN(s) || isNaN(e)) return false;

        const start = new Date(s.getFullYear(), s.getMonth(), s.getDate());
        const end = new Date(e.getFullYear(), e.getMonth(), e.getDate(), 23, 59, 59, 999);

        if (start > end) return false;

        if (filterStartDate && filterEndDate) return start <= filterEndDate && end >= filterStartDate;
        if (filterStartDate) return end >= filterStartDate;
        if (filterEndDate) return start <= filterEndDate;
        return true;
      });
    }

    // 🎯 4. 지역 필터
        
    if (region && region !== '전국') {
      const regionLower = region.toLowerCase();
      festivals = festivals.filter(f => (`${f.name || ''} ${f.description || ''} ${f.address || ''}`).toLowerCase().includes(regionLower));
    }


    // 🎯 5. 테마 필터
    if (theme && AVAILABLE_THEMES.includes(theme)) {
      festivals = festivals.filter(f => Array.isArray(f.themes) && f.themes.includes(theme));
    }

    // 🎯 6. 키워드 필터
    if (keyword) {
      const keywordLower = keyword.toLowerCase();
      festivals = festivals.filter(f =>
        (`${f.name || ''} ${f.description || ''} ${f.address || ''}`).toLowerCase().includes(keywordLower)
      );
    }
    console.log('keyword:', keyword);
    console.log('region:', region);

    return res.json({ festivals });
  } catch (error) {
    console.error('SPARQL 요청 실패:', error.message);
    return res.status(500).json({ error: 'SPARQL 요청 실패', detail: error.message });
  }
});








// JWT 인증 미들웨어 (수정 없음)
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: '인증 토큰이 없습니다.' }); // 메시지 명확화
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.warn('JWT 인증 실패:', err.message); // 서버 로그에 간단한 에러 기록
            return res.status(403).json({ error: '인증 토큰이 유효하지 않습니다.' });
        }
        req.user = user;
        next();
    });
}

app.get('/', (req, res) => {
    res.send({ message: 'Festival Town API Server' }); // 메시지 변경
});

app.post('/reg_ok', (req, res) => {
    const { name, phoneNumber, username, password, interests: rawInterests } = req.body;

    // 입력값 유효성 검사 강화
    if (!name || !String(name).trim()) return res.status(400).json({ error: '이름은 필수 항목입니다.' });
    if (!/^[가-힣]{2,}$/.test(name.trim())) return res.status(400).json({ error: '이름은 2자 이상의 한글로 입력해주세요.' });
    if (!phoneNumber || !String(phoneNumber).trim()) return res.status(400).json({ error: '전화번호는 필수 항목입니다.' });
    if (!/^\d{3}-\d{3,4}-\d{4}$/.test(phoneNumber.trim())) return res.status(400).json({ error: '전화번호 형식이 올바르지 않습니다. (예: 010-1234-5678)' });
    if (!username || !String(username).trim()) return res.status(400).json({ error: '아이디는 필수 항목입니다.' });
    // 아이디 형식 검사 (예: 영문/숫자 조합, 길이 제한 등) 추가 권장
    if (!password) return res.status(400).json({ error: '비밀번호는 필수 항목입니다.' });
    // 비밀번호 강도 검사 (예: 최소 길이, 특수문자 포함 등) 추가 권장

    const interestsString = JSON.stringify(rawInterests && Array.isArray(rawInterests) ? rawInterests : []); // 배열 형태 보장
    const sql = 'INSERT INTO member (name, phoneNumber, username, password, interests) VALUES (?, ?, ?, ?, ?)';
    const params = [name.trim(), phoneNumber.trim(), username.trim(), password, interestsString]; // 비밀번호는 해싱하여 저장 권장

    db.query(sql, params, (err, result) => { // rows, fields 대신 result 사용 (일반적)
        if (err) {
            console.error('DB 오류 (/reg_ok):', err.message); // 전체 에러 객체 대신 메시지만 로깅
            if (err.code === 'ER_DUP_ENTRY') {
                let field = '정보';
                if (err.message.toLowerCase().includes('username')) field = '아이디';
                else if (err.message.toLowerCase().includes('phonenumber')) field = '전화번호';
                return res.status(409).json({ error: `이미 사용 중인 ${field}입니다.` });
            }
            return res.status(500).json({ error: '데이터베이스 처리 중 오류가 발생했습니다.' });
        }
        res.status(201).json({ result: 'success', message: '회원가입이 성공적으로 완료되었습니다.' }); // 상태 코드 201 Created 명시
    });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: '아이디와 비밀번호를 모두 입력해주세요.' });

    const sql = 'SELECT * FROM member WHERE username = ? AND password = ?'; // 비밀번호는 DB에 해시된 값과 비교해야 함
    db.query(sql, [username, password], (err, results) => {
        if (err) {
            console.error('DB 오류 (/login):', err.message);
            return res.status(500).json({ error: '데이터베이스 처리 중 오류가 발생했습니다.' });
        }
        if (results.length > 0) {
            const user = results[0];
            let interestsArray = [];
            try {
                interestsArray = user.interests && typeof user.interests === 'string' ? JSON.parse(user.interests) : (Array.isArray(user.interests) ? user.interests : []);
            } catch (parseErr) { console.warn('로그인 시 interests 파싱 오류:', parseErr.message); } // console.warn으로 변경

            const token = jwt.sign(
                { id: user.id, username: user.username, name: user.name, phoneNumber: user.phoneNumber }, // 페이로드에 필요한 정보만 포함
                JWT_SECRET,
                { expiresIn: '1h' } // 토큰 만료 시간 설정
            );
            res.json({ result: 'success', message: '로그인 성공!', token, userName: user.username, name: user.name, interests: interestsArray });
        } else {
            res.status(401).json({ result: 'fail', message: '아이디 또는 비밀번호가 일치하지 않습니다.' }); // 상태 코드 401 Unauthorized
        }
    });
});

app.post('/api/find-id', (req, res) => {
    const { name, phoneNumber } = req.body;
    if (!name || !String(name).trim()) return res.status(400).json({ error: '이름을 입력해주세요.' });
    if (!/^[가-힣]{2,}$/.test(name.trim())) return res.status(400).json({ error: '이름은 2자 이상의 한글이어야 합니다.' });
    if (!phoneNumber || !String(phoneNumber).trim()) return res.status(400).json({ error: '전화번호를 입력해주세요.' });
    if (!/^\d{3}-\d{3,4}-\d{4}$/.test(phoneNumber.trim())) return res.status(400).json({ error: '올바른 전화번호 형식이 아닙니다.' });

    const sql = 'SELECT username FROM member WHERE name = ? AND phoneNumber = ?';
    db.query(sql, [name.trim(), phoneNumber.trim()], (err, results) => {
        if (err) { console.error('DB 오류 (/api/find-id):', err.message); return res.status(500).json({ error: '데이터베이스 조회 중 오류.' }); }
        if (results.length > 0) {
            res.json({ username: results[0].username }); // message 필드 제거 (클라이언트에서 조합)
        } else { res.status(404).json({ message: '일치하는 사용자 정보를 찾을 수 없습니다.' }); }
    });
});



app.post('/recommend', (req, res) => {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId가 필요합니다.', recommendations: [] });

    const sql = 'SELECT interests FROM member WHERE username = ?';
    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('[API 오류 /recommend]: DB 관심사 조회 실패 -', err.message);
            return res.status(500).json({ error: '추천을 위한 사용자 정보 조회에 실패했습니다.', recommendations: [] });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: '추천 대상 사용자를 찾을 수 없습니다.', recommendations: [] });
        }

        let interests = [];
        try {
            interests = results[0].interests && typeof results[0].interests === 'string'
                ? JSON.parse(results[0].interests)
                : (Array.isArray(results[0].interests) ? results[0].interests : []);
        } catch (parseErr) {
            console.warn('[API 경고 /recommend]: interests 파싱 오류 -', parseErr.message);
            return res.json({ recommendations: [], message: '사용자 관심사 정보를 처리할 수 없습니다.' });
        }

        if (interests.length === 0) return res.json({ recommendations: [], message: '등록된 관심사가 없어 추천할 항목이 없습니다.' });

        console.log('[Debug] 사용자 관심사:', interests);

        const recommendPythonProcess = spawn('python', [pythonScriptPath], {
            stdio: ['pipe', 'pipe', 'pipe'],
            env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
        });

        let pythonOutput = '';
        let pythonError = '';

        recommendPythonProcess.stdout.on('data', (data) => {
            pythonOutput += data.toString('utf8');
        });

        recommendPythonProcess.stderr.on('data', (data) => {
            pythonError += data.toString('utf8');
        });

        recommendPythonProcess.on('error', (spawnError) => {
            console.error('[API 오류 /recommend]: 파이썬 프로세스 실행 실패 -', spawnError.message);
            if (!res.headersSent) res.status(500).json({ error: '추천 시스템 실행에 실패했습니다.', recommendations: [] });
        });

        recommendPythonProcess.on('close', (code) => {
            console.log('[Debug] Python 종료 코드:', code);
            console.log('[Debug] Python stdout:', pythonOutput.trim());
            console.log('[Debug] Python stderr:', pythonError.trim());

            if (res.headersSent) return;
            if (code !== 0) {
                return res.status(500).json({ error: '추천 시스템 내부 오류가 발생했습니다.', recommendations: [] });
            }
            if (!pythonOutput.trim()) {
                return res.json({ recommendations: [], message: '추천 시스템에서 추천 항목을 생성하지 않았습니다.' });
            }

            try {
                const result = JSON.parse(pythonOutput.trim());
                console.log('[Debug] 최종 추천 결과:', result);
                res.json(result);
            } catch (e) {
                console.error('[API 오류 /recommend]: 파이썬 출력 JSON 파싱 실패 -', e.message);
                res.status(500).json({ error: '추천 결과를 처리하는 중 오류가 발생했습니다.', recommendations: [] });
            }
        });

        try {
            recommendPythonProcess.stdin.write(JSON.stringify({ interests }));
            recommendPythonProcess.stdin.end();
        } catch (stdinError) {
            console.error('[API 오류 /recommend]: 파이썬 stdin 쓰기 오류 -', stdinError.message);
            if (!res.headersSent && !recommendPythonProcess.killed) {
                recommendPythonProcess.kill();
                res.status(500).json({ error: '추천 시스템과의 통신에 실패했습니다.', recommendations: [] });
            }
        }
    });
});

app.listen(port, () => console.log(`[서버 시작] Express 서버가 http://localhost:${port} 에서 실행 중입니다.`));