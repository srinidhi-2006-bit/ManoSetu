require('dotenv').config();

async function runTests() {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const data = await response.json();
        require('fs').writeFileSync('gemini_models.json', JSON.stringify(data, null, 2));
        console.log("Dumped models to gemini_models.json");
    } catch (e) {
        console.log("Error:", e.message);
    }
}

runTests();
