const express = require('express')
const bodyParser = require('body-parser')
 
const mysql = require('mysql')
 
const app = express()
const port = process.env.PORT || 5000;
 
app.use(bodyParser.json())
 

const pool = mysql.createPool({
    connectionLimit : 10,
    connectionTimeout : 20,
    host : 'localhost', 
    user : 'root',
    password : '',
    database : 'lotto' 
})

//view
app.set('view engine','ejs')

var obj = {}

app.get('/addnumber',(req, res) => {   
    res.render('addnumber')
})

app.get('',(req, res) => {
 
    pool.getConnection((err, connection) => {  
        if(err) throw err
        console.log("connected id : ?" ,connection.threadId)
         
        connection.query('SELECT * FROM lottery', (err, rows) => { 
            connection.release();
            if(!err){ 
                //console.log(rows)
                //res.json(rows)
                
                obj = { lottery : rows, Error : err}
            
                res.render('index', obj)
            } else {
                console.log(err)
            }
         }) 
    })
})
 
app.get('/:id',(req, res) => {
 
    pool.getConnection((err, connection) => { 
        if(err) throw err
        console.log("connected id : ?" ,connection.threadId)
        //console.log(`connected id : ${connection.threadId}`)
 
        connection.query('SELECT * FROM lottery WHERE `id` = ?', req.params.id, (err, rows) => { 
            connection.release();
            if(!err){ //ถ้าไม่ error จะใส่ในตัวแปร rows
                //res.send(rows)
                obj = {lottery : rows, Error, err}               
                res.render('showbyid', obj)


            } else {
                console.log(err)
            }
         }) 
    })
})

//(1)POST --> req รับข้อมูลมาจากหน้าเว็บ, res จะส่งข้อมูลกลับไปยังหน้าเว็บ
//ใช้คำสั่ง bodyParser.urlencoded เพื่อทำให้สามารถรับข้อมูล x-www-form-urlencoded ทดสอบด้วย Postman ลงฐานข้อมูลได้
app.use(bodyParser.urlencoded({extended: false})) 
//สร้าง Path ของเว็บไซต์ additem
app.post('/addnumber',(req, res) => {
    pool.getConnection((err, connection) => { //pool.getConnection สำหรับใช้เชื่อมต่อกับ Database 
        if(err) throw err
            const params = req.body

            
                //Check 
                pool.getConnection((err, connection2) => {
                    connection2.query(`SELECT COUNT(id) AS count FROM lottery WHERE id = ${params.id}`, (err, rows) => {
                        if(!rows[0].count){
                            connection.query('INSERT INTO lottery SET ?', params, (err, rows) => {
                                connection.release()
                                if(!err){
                                    //res.send(`${params.number} is complete adding number. `)
                                    obj = {Error:err, mesg : `Success adding data ${params.number}`}                                   
                                    res.render('addnumber', obj)
                                }else {
                                    console.log(err)
                                    }
                                })           
                        } else {
                            //res.send(`${params.number} do not insert data`)
                            obj = {Error:err, mesg : `Can not adding data ${params.number}`}                           
                            res.render('addnumber', obj)
                            }
                        })
                    })
                })
            })

//(2)DELETE
app.delete('/delete/:id',(req, res) => {
    pool.getConnection((err, connection) =>{
        if(err) throw err
        console.log("connected id : ?", connection.threadId)
        //ลบข้อมูลโดยใช้ id
        connection.query('DELETE FROM `lottery` WHERE `lottery`.`id` = ?', [req.params.id], (err, rows) => {
            connection.release();
            if(!err){ 
                res.send(`${[req.params.id]} is complete delete item. `) 
            } else {
                console.log(err)
            }
        })
    })
})

//(3)PUT ทำการ UPDATE ข้อมูลใน Database ใช้วิธีการทดสอบทำเช่นเดียวกับของ POST
app.put('/update',(req, res) => {
    pool.getConnection((err, connection) =>{
        if(err) throw err
        console.log("connected id : ?", connection.threadId)
 
        //สร้างตัวแปรแบบกลุ่ม
        const {id, date, type, number, reward} = req.body       
 
        //Update ข้อมูลต่าง ๆ ตามลำดับ โดยใช้เงื่อนไข id
        connection.query('UPDATE lottery SET date = ?, type = ?, number = ?, reward = ? WHERE id = ?', [date, type, number, reward, id], (err, rows) => {
            connection.release();
            if(!err){ 
                res.send(`${number} is complete update number. `) 
            } else {
                console.log(err)
            }
        })
    })
})

app.listen(port, () => 
    console.log("listen on port : ?", port)
    )