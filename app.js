const express = require("express");
const cors = require("cors");
const mysql = require("mysql");
const app = express();
const port = 3000;
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "1111",
  database: "mydb",
});

app.use(cors());
app.use(express.json()); // json body 받기설정

/**
 * 조회
 * @param
 * @return
 */
app.get("/select-list", (req, res) => {
  let SEARCH_TEXT = req.query.SEARCH_TEXT;
  let sql = `SELECT SEQ, TITLE, CONTENT 
               FROM MYTABLE 
              WHERE TITLE LIKE CONCAT('%','${SEARCH_TEXT}','%') 
                 OR CONTENT LIKE CONCAT('%','${SEARCH_TEXT}','%') ORDER BY SEQ DESC`;
  connection.query(sql, (error, rows) => {
    if (error) throw error;
    res.send(rows);
  });
});

/**
 * 입력/수정/삭제(N건)
 * @param
 * @return
 */
app.post("/save-list", function (req, res) {
  console.log("param:", req.body.modifiedRows);
  /*  modifiedRows: {
        createdRows: [ ...  ],
        updatedRows: [ ...  ],
        deletedRows: [ ...  ]
      }
  */
  let sqlErrMsg = [];

  // 삭제
  req.body.modifiedRows.deletedRows.forEach(function (row) {
    let SEQ = row.SEQ;
    let sql = `DELETE FROM MYTABLE WHERE SEQ = ${SEQ}`;
    connection.query(sql, function (err, result) {
      if (err) {
        sqlErrMsg.push({ sqlMessage: err.sqlMessage, sql: err.sql });
      }
    });
  });

  // 입력
  req.body.modifiedRows.createdRows.forEach(function (row) {
    let TITLE = row.TITLE;
    let CONTENT = row.CONTENT;
    let sql = `INSERT INTO MYTABLE(TITLE, CONTENT) VALUES('${TITLE}', '${CONTENT}')`;
    connection.query(sql, function (err, result) {
      if (err) {
        sqlErrMsg.push({ sqlMessage: err.sqlMessage, sql: err.sql });
      }
    });
  });

  // 수정
  req.body.modifiedRows.updatedRows.forEach(function (row) {
    let SEQ = row.SEQ;
    let TITLE = row.TITLE;
    let CONTENT = row.CONTENT;
    let sql = `UPDATE MYTABLE SET TITLE = '${TITLE}', CONTENT = '${CONTENT}' WHERE SEQ = ${SEQ}`;
    connection.query(sql, function (err, result) {
      if (err) {
        sqlErrMsg.push({ sqlMessage: err.sqlMessage, sql: err.sql });
      }
    });
  });

  // 모든 DML 처리후, 결과리턴을 위한 dummy select ... 더 좋은 방법은 ?
  connection.query(`SELECT 1 FROM DUAL`, (error, rows) => {
    res.json(JSON.stringify({ resMsg: sqlErrMsg.length === 0 ? "저장성공" : "에러발생", sqlErrMsg }));
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
