import React, { useState } from 'react';
import { FileText, Download, Loader2, Sparkles, Zap, Edit3, Save } from 'lucide-react';

export default function EventReportGenerator() {
  const [formData, setFormData] = useState({
    eventName: '',
    eventDate: '',
    eventType: 'Technical',
    description: '',
    apiKey: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [generatedReport, setGeneratedReport] = useState('');
  const [editableReport, setEditableReport] = useState('');
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const generateWithAI = async () => {
    if (!formData.apiKey) {
      setError('Please enter your OpenAI API key');
      return;
    }

    if (!formData.eventName) {
      setError('Please enter event name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const prompt = `Generate a complete, detailed, and professional college event report IN ENGLISH ONLY based on the following information:

Event Name: ${formData.eventName}
Date: ${formData.eventDate || 'Recent event'}
Event Type: ${formData.eventType}
${formData.description ? `\nEvent Description/Details (provided by user - may be in Hindi/other language, translate to English):\n${formData.description}` : ''}

IMPORTANT: 
- The entire report must be written in perfect formal English
- If description is provided in Hindi or any other language, translate and incorporate those details naturally into the English report
- Use the provided details to create a realistic, comprehensive report
- If no description is provided, generate creative realistic details yourself

Create a comprehensive report (1500-2000 words) with these sections:

1. EXECUTIVE SUMMARY (150 words)
2. EVENT OVERVIEW (200 words)
   - Background and context
   - Purpose and significance
3. OBJECTIVES AND GOALS (150 words)
   - Primary objectives
   - Expected outcomes
4. EVENT DETAILS
   - Date and time
   - Venue (suggest appropriate college venue)
   - Duration
   - Organizing committee/department
5. EVENT DESCRIPTION (300 words)
   - Detailed activities
   - Schedule/timeline
   - Guest speakers/performers (create realistic names)
   - Technical arrangements
6. PARTICIPANT ENGAGEMENT (200 words)
   - Number of participants (estimate realistically)
   - Audience demographics
   - Interaction and feedback
7. KEY HIGHLIGHTS AND ACTIVITIES (250 words)
   - Main sessions/competitions
   - Notable moments
   - Awards and recognition
8. OUTCOMES AND ACHIEVEMENTS (200 words)
   - Learning outcomes
   - Skills developed
   - Certificates distributed
9. CHALLENGES AND SOLUTIONS (150 words)
10. FEEDBACK AND RESPONSES (100 words)
11. RECOMMENDATIONS FOR FUTURE EVENTS (100 words)
12. CONCLUSION (100 words)

Make it extremely professional, formal, and realistic. Use proper academic language. Include realistic statistics, names, and details appropriate for a ${formData.eventType} college event.`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${formData.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are an expert college event documentation writer. Write detailed, professional, formal reports suitable for official college records in PERFECT ENGLISH ONLY. If user provides details in Hindi or other languages, translate them naturally and incorporate into a formal English report. Be creative with realistic details while maintaining professionalism. The entire report must be in English.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.8,
          max_tokens: 3000
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to generate report');
      }

      const data = await response.json();
      const report = data.choices[0].message.content;
      setGeneratedReport(report);
      setEditableReport(report);
      setIsEditing(false);
    } catch (err) {
      setError(err.message || 'Failed to generate report. Please check your API key.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    setGeneratedReport(editableReport);
    setIsEditing(false);
  };

  const downloadPDF = () => {
    const reportContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${formData.eventName} - Event Report</title>
  <style>
    @page {
      margin: 2cm;
    }
    body {
      font-family: 'Times New Roman', serif;
      line-height: 1.8;
      margin: 0;
      padding: 20px;
      color: #000;
      font-size: 12pt;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      border-bottom: 3px double #000;
      padding-bottom: 20px;
    }
    .college-name {
      font-size: 20pt;
      font-weight: bold;
      margin-bottom: 5px;
    }
    .report-title {
      font-size: 18pt;
      font-weight: bold;
      margin-top: 20px;
      text-decoration: underline;
    }
    .metadata {
      background: #f5f5f5;
      padding: 20px;
      border: 2px solid #333;
      margin: 30px 0;
      border-radius: 5px;
    }
    .metadata p {
      margin: 8px 0;
      font-size: 11pt;
    }
    h1 {
      font-size: 16pt;
      color: #000;
      margin-top: 30px;
      margin-bottom: 15px;
      border-bottom: 2px solid #000;
      padding-bottom: 5px;
      page-break-after: avoid;
    }
    h2 {
      font-size: 14pt;
      color: #000;
      margin-top: 25px;
      margin-bottom: 12px;
      page-break-after: avoid;
    }
    h3 {
      font-size: 12pt;
      color: #000;
      margin-top: 20px;
      margin-bottom: 10px;
      font-style: italic;
    }
    p {
      text-align: justify;
      margin-bottom: 15px;
      orphans: 3;
      widows: 3;
    }
    ul, ol {
      margin-bottom: 15px;
      padding-left: 40px;
    }
    li {
      margin-bottom: 8px;
    }
    .signature-section {
      margin-top: 60px;
      page-break-inside: avoid;
    }
    .signature-box {
      display: inline-block;
      width: 45%;
      margin-top: 40px;
    }
    .signature-line {
      border-top: 1px solid #000;
      margin-top: 50px;
      padding-top: 5px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="college-name">[YOUR COLLEGE NAME]</div>
    <div style="font-size: 11pt; margin-top: 5px;">[Department Name]</div>
    <div class="report-title">EVENT REPORT</div>
  </div>
  
  <div class="metadata">
    <p><strong>Event Name:</strong> ${formData.eventName}</p>
    <p><strong>Event Type:</strong> ${formData.eventType}</p>
    <p><strong>Date:</strong> ${formData.eventDate || 'As per schedule'}</p>
    <p><strong>Report Generated:</strong> ${new Date().toLocaleDateString('en-IN')}</p>
  </div>

  ${generatedReport.split('\n').map(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('# ')) {
      return `<h1>${trimmed.substring(2)}</h1>`;
    } else if (trimmed.startsWith('## ')) {
      return `<h2>${trimmed.substring(3)}</h2>`;
    } else if (trimmed.startsWith('### ')) {
      return `<h3>${trimmed.substring(4)}</h3>`;
    } else if (trimmed.startsWith('- ')) {
      return `<li>${trimmed.substring(2)}</li>`;
    } else if (trimmed.startsWith('* ')) {
      return `<li>${trimmed.substring(2)}</li>`;
    } else if (/^\d+\./.test(trimmed)) {
      return `<li>${trimmed.replace(/^\d+\.\s*/, '')}</li>`;
    } else if (trimmed === '') {
      return '<br>';
    } else {
      return `<p>${trimmed}</p>`;
    }
  }).join('\n')}

  <div class="signature-section">
    <div class="signature-box">
      <div class="signature-line">
        <strong>Event Coordinator</strong><br>
        Name & Signature
      </div>
    </div>
    <div class="signature-box" style="float: right;">
      <div class="signature-line">
        <strong>HOD/Faculty In-charge</strong><br>
        Name & Signature
      </div>
    </div>
  </div>
</body>
</html>`;

    // Create a new window with the HTML content
    const printWindow = window.open('', '_blank');
    printWindow.document.write(reportContent);
    printWindow.document.close();
    
    // Wait for content to load, then trigger print dialog
    printWindow.onload = function() {
      setTimeout(() => {
        printWindow.print();
      }, 250);
    };
  };

  return (
    <div className="p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 text-white">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-12 h-12" />
              <h1 className="text-4xl font-bold">Quick Event Report Generator</h1>
            </div>
            <p className="text-purple-100 text-lg">Fill in details, AI generates complete professional report in English! ⚡</p>
          </div>

          <div className="p-8">
            {/* API Key */}
            <div className="mb-6 p-5 bg-yellow-50 border-2 border-yellow-300 rounded-xl">
              <label className="block text-sm font-bold text-yellow-900 mb-2">
                🔑 OpenAI API Key (enter once)
              </label>
              <input
                type="password"
                name="apiKey"
                value={formData.apiKey}
                onChange={handleChange}
                placeholder="sk-proj-..."
                className="w-full px-4 py-3 border-2 border-yellow-400 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-lg"
              />
              <p className="text-xs text-yellow-800 mt-2">
                ⚠️ Get API key from platform.openai.com (free trial available)
              </p>
            </div>

            {/* Minimal Form */}
            <div className="space-y-5 mb-6">
              <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-2 border-purple-200">
                <h3 className="text-lg font-bold text-purple-900 mb-4">📝 Tell us about your event:</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      1️⃣ Event Name? (Hindi/English both work)
                    </label>
                    <input
                      type="text"
                      name="eventName"
                      value={formData.eventName}
                      onChange={handleChange}
                      placeholder="e.g., Tech Fest 2025, Cultural Night, Hackathon"
                      className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      2️⃣ When was it held? (optional)
                    </label>
                    <input
                      type="date"
                      name="eventDate"
                      value={formData.eventDate}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      3️⃣ Event Type?
                    </label>
                    <select
                      name="eventType"
                      value={formData.eventType}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-lg"
                    >
                      <option value="Technical">Technical (Hackathon, Workshop, Seminar)</option>
                      <option value="Cultural">Cultural (Fest, Music, Dance)</option>
                      <option value="Sports">Sports (Tournament, Competition)</option>
                      <option value="Academic">Academic (Conference, Symposium)</option>
                      <option value="Social">Social (Awareness, Campaign)</option>
                      <option value="Entrepreneurship">Entrepreneurship (Startup, Business)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      4️⃣ Event Details/Description (optional - You can write in Hindi too!) ✨
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Example: What happened at the event, how many students attended, who were the guests, what activities took place, venue location, etc. The more details you provide, the better the report will be!"
                      rows="6"
                      className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-lg"
                    />
                    <p className="text-xs text-purple-700 mt-2 font-semibold">
                      💡 Tip: Mention venue, participant count, activities, chief guest names, outcomes - whatever you remember. AI will convert it into a professional English report!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-300 rounded-xl text-red-700 font-semibold">
                ❌ {error}
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={generateWithAI}
              disabled={loading || !formData.eventName || !formData.apiKey}
              className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-5 rounded-2xl font-bold text-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 mb-6"
            >
              {loading ? (
                <>
                  <Loader2 className="w-7 h-7 animate-spin" />
                  AI is Generating Report...
                </>
              ) : (
                <>
                  <Sparkles className="w-7 h-7" />
                  🚀 Generate Complete Report
                </>
              )}
            </button>

            <p className="text-center text-sm text-gray-600 mb-6">
              💡 <span className="text-purple-600 font-semibold">Write full details in Hindi in the description box - AI will automatically generate a professional English report!</span><br/>
              Works without description too - AI will generate realistic details on its own
            </p>

            {/* Generated Report */}
            {generatedReport && (
              <div className="mt-8 space-y-5">
                <div className="flex items-center justify-between bg-green-50 p-4 rounded-xl border-2 border-green-300">
                  <div>
                    <h2 className="text-2xl font-bold text-green-800">✅ Report Ready!</h2>
                    <p className="text-green-700 text-sm">Professional report has been generated</p>
                  </div>
                  <div className="flex gap-3">
                    {!isEditing && (
                      <button
                        onClick={handleEdit}
                        className="bg-blue-600 text-white px-6 py-4 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg text-lg"
                      >
                        <Edit3 className="w-6 h-6" />
                        Edit
                      </button>
                    )}
                    <button
                      onClick={downloadPDF}
                      className="bg-green-600 text-white px-6 py-4 rounded-xl font-bold hover:bg-green-700 transition-all flex items-center gap-2 shadow-lg text-lg"
                    >
                      <Download className="w-6 h-6" />
                      Download PDF
                    </button>
                  </div>
                </div>
                
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-300">
                      <p className="text-blue-800 font-semibold">✏️ Edit mode: Make your changes below and click Save</p>
                    </div>
                    <textarea
                      value={editableReport}
                      onChange={(e) => setEditableReport(e.target.value)}
                      className="w-full h-96 p-6 border-2 border-blue-400 rounded-xl font-serif text-gray-800 text-sm leading-relaxed focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleSaveEdit}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                    >
                      <Save className="w-6 h-6" />
                      Save Changes
                    </button>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-6 rounded-xl border-2 border-gray-300 max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap font-serif text-gray-800 text-sm leading-relaxed">
                      {generatedReport}
                    </pre>
                  </div>
                )}

                <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-5">
                  <p className="font-bold text-blue-900 mb-2">📄 How to Get PDF:</p>
                  <ol className="text-blue-800 text-sm space-y-1 list-decimal list-inside">
                    <li>Click "Download PDF" button</li>
                    <li>A print dialog will open automatically</li>
                    <li>Select "Save as PDF" as the destination</li>
                    <li>Choose location and save</li>
                    <li>Done! Your professional PDF is ready ✅</li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}