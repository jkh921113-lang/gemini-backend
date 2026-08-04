export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST 요청만 허용됩니다.' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY 환경변수가 설정되지 않았습니다.' });
    }

    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'prompt가 없습니다.' });
    }

    // SDK를 거치지 않고 구글 제미나이 REST API 엔드포인트를 직접 호출
    const apiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        }),
      }
    );

    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      return res.status(500).json({ 
        error: 'Gemini API 호출 실패', 
        details: data.error?.message || JSON.stringify(data) 
      });
    }

    // 응답 텍스트 추출
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return res.status(500).json({ error: '응답 데이터에서 텍스트를 추출할 수 없습니다.', details: data });
    }

    return res.status(200).json({ result: text });
  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).json({ 
      error: '서버 내부 오류 발생', 
      details: error.message || error.toString() 
    });
  }
}
