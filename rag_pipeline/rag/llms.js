// To run this code you need to install the following dependencies:
// npm install @google/genai mime
// npm install -D @types/node

import {
  GoogleGenAI,
  Type,
} from '@google/genai';

async function main() {
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
  const tools = [
    {
      functionDeclarations: [
        {
          name: 'getWeather',
          description: 'gets the weather for a requested city',
          parameters: {
            type: Type.OBJECT,
            properties: {
              city: {
                type: Type.STRING,
              },
            },
          },
        },
      ],
    }
  ];
  const config = {
    tools,
    responseMimeType: 'text/plain',
    systemInstruction: [
        {
          text: `instructionsystem`,
        }
    ],
  };
  const model = 'gemini-2.5-pro-preview-05-06';
  const contents = [
    {
      role: 'user',
      parts: [
        {
          text: `INSERT_INPUT_HERE`,
        },
      ],
    },
  ];

  const response = await ai.models.generateContentStream({
    model,
    config,
    contents,
  });
  let fileIndex = 0;
  for await (const chunk of response) {
    console.log(chunk.functionCalls ? chunk.functionCalls[0] : chunk.text);
  }
}

main();
