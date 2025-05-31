export const sendToAIChat = async (message) => {
  const res = await fetch('https://edvantage-gdg-25.onrender.com/api/chat', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ message }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("AI API Error:", errorText);
    throw new Error('AI API failed');
  }

  const data = await res.json();
  return data.reply || "I couldn't think of a good answer right now 😅";
};