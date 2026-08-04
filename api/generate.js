const { GoogleGenerativeAI } = require('@google/generative-ai');

export default async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // 브라우저 사전 확인 요청(OPTIONS) 처리
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // POST 요청 처리
  if (req.method === 'POST') {
    try {
      const apiKey = process.env.GEMINI_API_KEY;

      // API 키 존재 여부 검증
      if (!apiKey) {
        return res.status(500).json({ 
          error: 'Vercel 환경변수에 GEMINI_API_KEY가 설정되지 않았습니다.' 
        });
      }

      // SDK 인스턴스 생성 및 모델 지정
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const { prompt } = req.body;
      const result = await model.generateContent(prompt || 'Hello');
      const responseText = await result.response.text();

      return res.status(200).json({ result: responseText });
    } catch (error) {
      console.error('Gemini API Error Detail:', error);
      return res.status(500).json({
        error: 'Gemini API 호출 중 오류가 발생했습니다.',
        details: error.message
      });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
