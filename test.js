const fs = require('fs');
const path = require('path');

const jsonFilePath = path.join(__dirname, '전국문화축제표준데이터.json');

fs.readFile(jsonFilePath, 'utf8', (err, data) => {
  if (err) {
    console.error('파일 읽기 에러:', err.message);
    return;
  }

  try {
    const jsonData = JSON.parse(data);
    const festivals = jsonData.records;
    if (!festivals || !Array.isArray(festivals)) {
      console.error('records 배열이 없습니다.');
      return;
    }

    const filterStartDate = new Date('2023-05-01');
    const filterEndDate = new Date('2023-05-31');

    const filteredFestivals = festivals.filter(f => {
      const startDate = new Date(f['축제시작일자']);
      const endDate = new Date(f['축제종료일자']);
      return startDate <= filterEndDate && endDate >= filterStartDate;
    });

    if (filteredFestivals.length === 0) {
      console.log('해당 기간에 열리는 축제가 없습니다.');
      return;
    }

    console.log(`📅 해당 기간 축제 목록 (${filterStartDate.toISOString().slice(0, 10)} ~ ${filterEndDate.toISOString().slice(0, 10)}):\n`);

    filteredFestivals.forEach((f, i) => {
      console.log(`🎉 [${i + 1}] ${f['축제명']}`);
      console.log(`   📍 장소      : ${f['개최장소'] || '정보 없음'}`);
      console.log(`   🗓️  일정      : ${f['축제시작일자']} ~ ${f['축제종료일자']}`);
      if (f['축제내용']) console.log(`   📖 소개      : ${f['축제내용']}`);
      if (f['홈페이지주소']) console.log(`   🔗 홈페이지 : ${f['홈페이지주소']}`);
      console.log(''); // 빈 줄로 구분
    });

  } catch (parseErr) {
    console.error('JSON 파싱 에러:', parseErr.message);
  }
});
