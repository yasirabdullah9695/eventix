const Event = require('../models/eventModel');
const Registration = require('../models/registrationModel');
const Nomination = require('../models/nominationModel');
const axios = require('axios');
const PDFDocument = require('pdfkit');

const generateReport = async (req, res) => {
    const { eventId, prompt } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!eventId || !prompt) {
        return res.status(400).json({ message: 'Event ID and prompt are required.' });
    }

    if (!apiKey) {
        return res.status(500).json({ message: 'API key is not configured on the server.' });
    }

    try {
        // 1. Fetch data
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found.' });
        }

        const registrations = await Registration.find({ event: eventId }).populate('user', 'name');
        const nominations = await Nomination.find({ event: eventId }).populate('user', 'name');

        // 2. Construct AI Prompt
        let reportPrompt = `Generate a detailed report for the event: "${event.name}".\n\n`;
        reportPrompt += `Event Details:\n- Date: ${event.date}\n- Location: ${event.location}\n- Description: ${event.description}\n\n`;
        reportPrompt += `Registrations (${registrations.length}):\n${registrations.map(r => `- ${r.user.name}`).join('\n')}\n\n`;
        reportPrompt += `Nominations (${nominations.length}):\n${nominations.map(n => `- ${n.user.name} for ${n.position}`).join('\n')}\n\n`;
        reportPrompt += `User's specific instructions: "${prompt}"`;

        // 3. Call AI Service (using Google Gemini)
        const model = 'gemini-pro'; // You can make this configurable
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const aiResponse = await axios.post(url, {
            contents: [{
                parts: [{
                    text: reportPrompt
                }]
            }]
        });

        const reportContent = aiResponse.data.candidates[0].content.parts[0].text;

        // 4. Generate PDF
        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${event.name}_report.pdf`);

        doc.pipe(res);

        doc.fontSize(25).text(`Report for ${event.name}`, { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(reportContent);

        doc.end();

    } catch (error) {
        console.error('Error generating report:', error);
        // Check for AI service specific errors
        if (error.response) {
            console.error('AI Service Response:', error.response.data);
            return res.status(500).json({ message: 'Failed to generate report due to an AI service error.', error: error.response.data });
        }
        res.status(500).json({ message: 'Failed to generate report.', error: error.message });
    }
};

module.exports = { generateReport };