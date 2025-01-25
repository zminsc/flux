const OpenAI = require('openai');
const { JSDOM } = require('jsdom');

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

function cleanHtml(html) {
  const dom = new JSDOM(html);
  const document = dom.window.document;

  // Remove scripts and styles
  document.querySelectorAll('script, style').forEach(el => el.remove());

  // Get text content
  return document.body.textContent.trim();
}

async function analyzeEmailForUnsubscribe(emailText) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{
        role: "user",
        content: `The following email text may contain unsubscribe or opt-out instructions. If there are any instructions, please extract them. If not, suggest possible methods to not receive these emails.' Here is the email text: ${emailText}`
      }],
      temperature: 0.3,
      max_tokens: 150
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('OpenAI API Error:', {
      message: error.message,
      type: error.type,
      code: error.code
    });

    if (error.code === 'insufficient_quota') {
      return 'Service temporarily unavailable. Please try again later.';
    }

    return 'Error analyzing email content';
  }
}

module.exports = { cleanHtml, analyzeEmailForUnsubscribe }; 