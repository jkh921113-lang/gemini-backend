const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  // 1. CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // 2. 브라우저 사전 확인 요청(OPTIONS) 처리
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 3. POST 요청 처리
  if (req.method === 'POST') {
    try {
      const { prompt } = req.body;

      // 가장 안정적인 gemini-1.5-flash 모델 호출
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const result = await model.generateContent(prompt);
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
