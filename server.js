const express = require("express");
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const PORT = process.env.PORT || 3000;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

const genAI = GEMINI_API_KEY
    ? new GoogleGenerativeAI(GEMINI_API_KEY)
    : null;


// ===============================
// DCM KNOWLEDGE
// ===============================

const DCM_KNOWLEDGE = `
คุณคือ DCM Assistant
ผู้ช่วยตอบคำถามเกี่ยวกับหลักสูตร
สารสนเทศศาสตรบัณฑิต สาขาดิจิทัลคอนเทนต์และสื่อ
มหาวิทยาลัยวลัยลักษณ์

ข้อมูลหลักสูตร:

ชื่อหลักสูตร:
สารสนเทศศาสตรบัณฑิต สาขาดิจิทัลคอนเทนต์และสื่อ

ภาษาอังกฤษ:
Bachelor of Information Science
(Digital Content and Media)

จำนวนหน่วยกิต:
123 หน่วยกิต

ค่าเล่าเรียน:
25,000 บาทต่อภาคการศึกษา

ค่าใช้จ่ายรวม:
ประมาณ 200,000 บาทตลอดหลักสูตร

ประสบการณ์ปฏิบัติงาน:
อย่างน้อย 8 เดือน

อาชีพ:
1. Digital Content Creator / Content Specialist
2. Web Content Manager
3. Digital Collection Developer
4. Web Designer

กลุ่มวิชา:
1. การพัฒนาการเรียนแบบออนไลน์
2. คอนเทนต์เพื่อการตลาดดิจิทัล
3. ดิจิทัลคอลเล็กชัน
4. เทคโนโลยีเพื่อการจัดการคอนเทนต์

การศึกษาต่อ:
สามารถศึกษาต่อระดับปริญญาโทและปริญญาเอก
ใน Computer Science, Information Technology
หรือสาขาที่เกี่ยวข้องได้

คุณสมบัติผู้สมัคร:
- มัธยมศึกษาปีที่ 6 หรือเทียบเท่า
- ประกาศนียบัตรวิชาชีพ (ปวช.)

สถานที่:
มหาวิทยาลัยวลัยลักษณ์
222 ตำบลไทยบุรี
อำเภอท่าศาลา
จังหวัดนครศรีธรรมราช 80160

โทรศัพท์หลักสูตร:
075-672204

โทรศัพท์สำนักวิชาสารสนเทศศาสตร์:
075-672207

หลักสูตรเน้น:
- การออกแบบดิจิทัลคอนเทนต์
- การผลิตสื่อ
- การจัดการคอนเทนต์
- เทคโนโลยีดิจิทัล
- Digital Marketing
- Digital GLAM
- การทำงานจริง
- การสื่อสาร
- จริยธรรมทางวิชาการ
- การทำงานร่วมกับผู้อื่น

Digital GLAM หมายถึง:
Gallery
Library
Archive
Museum

ห้ามแต่งข้อมูลหลักสูตรที่ไม่มีในข้อมูลนี้
หากไม่มีข้อมูล ให้บอกผู้ใช้ว่าข้อมูลส่วนนั้นยังไม่มีในฐานข้อมูล
ตอบภาษาไทยเป็นหลัก
ตอบให้ตรงคำถามและเข้าใจง่าย
`;


// ===============================
// MIDDLEWARE
// ===============================

app.use(express.json());

app.use(express.static(__dirname));


// ===============================
// HEALTH CHECK
// ===============================

app.get("/api/health", (req, res) => {

    res.json({
        ok: true,
        service: "DCM Assistant",
        provider: "Google Gemini",
        geminiEnabled: Boolean(GEMINI_API_KEY)
    });

});


// ===============================
// GEMINI CHAT API
// ===============================

app.post("/api/chat", async (req, res) => {

    try {

        const message =
            String(req.body?.message || "").trim();


        if (!message) {

            return res.status(400).json({
                error: "กรุณาพิมพ์ข้อความก่อนครับ"
            });

        }


        if (!genAI) {

            return res.status(503).json({
                error: "ยังไม่ได้ตั้งค่า GEMINI_API_KEY"
            });

        }


        // ใช้โมเดล Gemini แบบธรรมดา

        const model = genAI.getGenerativeModel({

            model: "gemini-2.5-flash",

            systemInstruction: DCM_KNOWLEDGE

        });


        const result =
            await model.generateContent(message);


        const response =
            result.response;


        const reply =
            response.text();


        return res.json({

            success: true,

            reply: reply

        });

    } catch (error) {

        console.error(
            "Gemini Error:",
            error
        );


        return res.status(500).json({

            success: false,

            error:
                "เกิดข้อผิดพลาดในการเชื่อมต่อ Gemini"

        });

    }

});


// ===============================
// FRONTEND
// ===============================

app.get("*", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "index.html"
        )
    );

});


// ===============================
// START
// ===============================

app.listen(PORT, () => {

    console.log(
        `DCM Assistant running on port ${PORT}`
    );

    console.log(
        `Gemini enabled: ${Boolean(GEMINI_API_KEY)}`
    );

});
