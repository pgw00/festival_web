var mysql = require("mysql2");

var db = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : '1234',
    database :'test',
    charset: 'utf8'

});
db.connect((err) => {
  if (err) {
    console.error('❌ DB 연결 실패:', err.code);
    console.error('메시지:', err.message);
    throw err; // 이 줄 때문에 앱이 종료되니 위에서 확인만 해도 됨
  } else {
    console.log('✅ DB 연결 성공');
  }
});
//db.connect();

module.exports = db;