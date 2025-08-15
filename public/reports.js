// reports.js - Handles CBT report functionality

document.addEventListener('DOMContentLoaded', loadReport);

// Get user email from localStorage (assuming it's stored during login)
function getUserEmail() {
  // Try multiple possible keys where email might be stored
  const user = JSON.parse(localStorage.getItem('currentUser') || localStorage.getItem('user') || '{}');
  return user.email || localStorage.getItem('userEmail') || localStorage.getItem('email');
}

async function fetchReportFromServer() {
  const email = getUserEmail();
  
  if (!email) {
    console.error('No user email found');
    showError('Please log in to view your report.');
    return null;
  }

  try {
    console.log('Fetching report for email:', email);
    const response = await fetch(`http://localhost:3000/api/report/${encodeURIComponent(email)}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch report');
    }
    
    const data = await response.json();
    console.log('Fetched report data:', data);
    return data.report;
  } catch (error) {
    console.error('Error fetching report:', error);
    showError(`Failed to load report: ${error.message}`);
    return null;
  }
}

function showError(message) {
  document.getElementById('report-container').innerHTML = `
    <h1>Mental Health Report</h1>
    <div class="error-message">${message}</div>
    <button class="dashboard-button" onclick="goToDashboard()">Go to Dashboard</button>
  `;
}

function showNoDataMessage() {
  document.getElementById('report-container').innerHTML = `
    <h1>Mental Health Report</h1>
    <p class="no-data-message">No report data available. Please complete the quiz first.</p>
    <button class="dashboard-button" onclick="goToDashboard()">Go to Dashboard</button>
  `;
}

// Detailed explanations for each recommendation
const recommendationExplanations = {
  'Continue your current healthy lifestyle practices': 'Keep doing what\'s working well for you. Consistency in positive habits builds resilience.',
  'Maintain regular exercise routine (20-30 minutes daily)': 'Physical activity releases endorphins and improves mood naturally. Even light walking counts.',
  'Keep nurturing your social relationships': 'Strong social connections are protective against depression and provide emotional support.',
  'Practice gratitude daily': 'Writing down 3 things you\'re grateful for each day can shift your focus toward positive experiences.',
  'Prioritize quality sleep (7-9 hours)': 'Good sleep hygiene supports emotional regulation and mental clarity.',
  'Engage in hobbies and activities you enjoy': 'Pleasant activities boost mood and provide a sense of accomplishment.',
  'Consider mindfulness or meditation': 'These practices help manage stress and increase self-awareness.',
  
  'Start each day with one small positive action': 'Small wins early in the day can build momentum and improve your overall mood.',
  'Create a simple daily routine': 'Structure provides stability and reduces decision fatigue when you\'re struggling.',
  'Practice the "5-4-3-2-1" grounding technique': 'Notice 5 things you see, 4 you touch, 3 you hear, 2 you smell, 1 you taste. This helps with anxiety.',
  'Try journaling for 5-10 minutes daily': 'Writing about thoughts and feelings can provide clarity and emotional release.',
  'Engage in regular physical activity': 'Even 10-15 minutes of movement can improve mood and energy levels.',
  'Connect with supportive friends or family': 'Reach out to people who care about you, even when you don\'t feel like it.',
  'Consider self-help resources': 'Books, apps, or online resources can provide valuable coping strategies.',
  'Limit alcohol and caffeine': 'Both can worsen anxiety and interfere with sleep quality.',
  'Practice deep breathing exercises': 'Slow, deep breaths activate your body\'s relaxation response.',
  'Set small, achievable goals each day': 'Success with small tasks builds confidence and motivation.',
  
  'Reach out to a mental health professional': 'A therapist can provide personalized strategies and support for your specific situation.',
  'Consider joining a depression support group': 'Connecting with others who understand can reduce isolation and provide practical advice.',
  'Establish a structured daily routine': 'Consistent routines provide stability and help manage symptoms more effectively.',
  'Practice "behavioral activation"': 'Gradually increase pleasant and meaningful activities, even when you don\'t feel motivated.',
  'Use the "HALT" check-in technique': 'Ask yourself: Am I Hungry, Angry, Lonely, or Tired? Address these basic needs first.',
  'Try cognitive restructuring': 'Challenge negative thought patterns and replace them with more balanced perspectives.',
  'Maintain social connections': 'Stay connected with others, even if it feels difficult. Social support is crucial for recovery.',
  'Create a "mood toolkit"': 'Develop a collection of activities, resources, and strategies that help improve your mood.',
  'Practice relaxation techniques': 'Progressive muscle relaxation, guided imagery, or meditation can reduce stress.',
  'Keep a mood diary': 'Track your moods, triggers, and helpful activities to identify patterns.',
  
  'Schedule an appointment with a psychiatrist': 'A psychiatrist can evaluate whether medication might be helpful for your symptoms.',
  'Consider intensive outpatient programs': 'Structured programs provide comprehensive support while allowing you to maintain daily activities.',
  'Discuss medication options with a healthcare provider': 'Antidepressants can be effective for moderate to severe depression.',
  'Engage in evidence-based therapy': 'Therapies like CBT, DBT, or IPT have proven effectiveness for depression.',
  'Create a safety plan with your therapist': 'Have a clear plan for managing crisis situations and accessing help.',
  'Involve trusted family members or friends': 'Let your support system know how they can help during difficult times.',
  'Maintain basic self-care routines': 'Focus on essential activities like eating, bathing, and taking medications.',
  'Use crisis resources when needed': 'Don\'t hesitate to call crisis hotlines or emergency services if you\'re in immediate danger.',
  'Try to maintain some social contact': 'Even brief interactions can help prevent complete isolation.',
  'Focus on very small, manageable goals': 'Break tasks into tiny steps and celebrate small accomplishments.',
  
  'Seek immediate professional help': 'Severe depression requires professional intervention. Don\'t try to manage this alone.',
  'Contact crisis hotline if needed': 'Crisis hotlines are available 24/7: National Suicide Prevention Lifeline: 988',
  'Reach out to trusted support system': 'Let people close to you know you\'re struggling and need extra support.',
  'Consider psychiatric hospitalization if necessary': 'Inpatient care can provide safety and intensive treatment when needed.',
  'Work with a psychiatrist for medication': 'Medication management is often essential for severe depression.',
  'Engage in intensive therapy': 'Frequent therapy sessions can provide crucial support during severe episodes.',
  'Accept help with basic needs': 'Allow others to help with daily tasks like cooking, cleaning, or errands.',
  'Remove potentially harmful items': 'Create a safe environment by removing items that could be used for self-harm.',
  'Create a detailed safety plan': 'Work with professionals to develop a comprehensive plan for crisis situations.',
  'Focus on surviving each day': 'Take things one day, one hour, or one moment at a time.'
};

function loadReportContent(report) {
  if (!report) {
    showNoDataMessage();
    return;
  }

  console.log('Loading report content:', report);

  const recommendationsHtml = report.recommendations && Array.isArray(report.recommendations) 
    ? report.recommendations.map(rec => `
        <li style="margin-bottom: 1rem; padding: 0.5rem; background-color: #f8f9fa; border-radius: 8px; border-left: 3px solid var(--blue-grotto);">
          <strong>${rec}</strong>
          ${recommendationExplanations[rec] ? `<br><small style="color: #666; font-style: italic;">${recommendationExplanations[rec]}</small>` : ''}
        </li>
      `).join('')
    : '<li>No specific recommendations available. Please consult with a mental health professional.</li>';

  const reportHtml = `
    <h1>Mental Health Report</h1>
    <p><strong>Date:</strong> <span>${new Date(report.timestamp).toLocaleString()}</span></p>
    <p><strong>Depression Level:</strong> <span>${report.level}</span></p>
    <p><strong>Total Score:</strong> <span>${report.quizScore}/60</span></p>
    <p><strong>Risk Level:</strong> <span>${report.riskLevel || 'Not assessed'}</span></p>
    <p><strong>Summary:</strong> <span>${report.summary}</span></p>
    <hr />
    <h2>Your Personalized Recommendations</h2>
    <div class="highlight-box">
      <p><strong>Based on your ${report.level} depression level, here are your specific recommendations:</strong></p>
      <ul style="margin-top: 1rem; padding-left: 0; list-style: none;">
        ${recommendationsHtml}
      </ul>
    </div>
    
    <h2>Complete Mental Health Guide</h2>
    <p style="margin-bottom: 1.5rem; font-style: italic;">Below is a comprehensive guide for all depression levels. This information can help you understand different stages and support others in your life.</p>
    
    <div class="highlight-box" style="border-left-color: #28a745;">
      <h3 style="color: #28a745; margin-top: 0;">🌟 Minimal Depression (0-10 points)</h3>
      <p style="margin-bottom: 1rem;"><strong>Summary:</strong> Your responses indicate minimal symptoms of depression. Continue maintaining your healthy lifestyle and self-care practices.</p>
      <ul style="padding-left: 0; list-style: none;">
        <li style="margin-bottom: 0.8rem; padding: 0.4rem; background-color: #f8f9fa; border-radius: 6px;">
          <strong>Continue your current healthy lifestyle practices</strong><br>
          <small style="color: #666; font-style: italic;">Keep doing what's working well for you. Consistency in positive habits builds resilience.</small>
        </li>
        <li style="margin-bottom: 0.8rem; padding: 0.4rem; background-color: #f8f9fa; border-radius: 6px;">
          <strong>Maintain regular exercise routine (20-30 minutes daily)</strong><br>
          <small style="color: #666; font-style: italic;">Physical activity releases endorphins and improves mood naturally. Even light walking counts.</small>
        </li>
        <li style="margin-bottom: 0.8rem; padding: 0.4rem; background-color: #f8f9fa; border-radius: 6px;">
          <strong>Keep nurturing your social relationships</strong><br>
          <small style="color: #666; font-style: italic;">Strong social connections are protective against depression and provide emotional support.</small>
        </li>
        <li style="margin-bottom: 0.8rem; padding: 0.4rem; background-color: #f8f9fa; border-radius: 6px;">
          <strong>Practice gratitude daily</strong><br>
          <small style="color: #666; font-style: italic;">Writing down 3 things you're grateful for each day can shift your focus toward positive experiences.</small>
        </li>
        <li style="margin-bottom: 0.8rem; padding: 0.4rem; background-color: #f8f9fa; border-radius: 6px;">
          <strong>Prioritize quality sleep (7-9 hours)</strong><br>
          <small style="color: #666; font-style: italic;">Good sleep hygiene supports emotional regulation and mental clarity.</small>
        </li>
        <li style="margin-bottom: 0.8rem; padding: 0.4rem; background-color: #f8f9fa; border-radius: 6px;">
          <strong>Engage in hobbies and activities you enjoy</strong><br>
          <small style="color: #666; font-style: italic;">Pleasant activities boost mood and provide a sense of accomplishment.</small>
        </li>
        <li style="margin-bottom: 0.8rem; padding: 0.4rem; background-color: #f8f9fa; border-radius: 6px;">
          <strong>Consider mindfulness or meditation</strong><br>
          <small style="color: #666; font-style: italic;">These practices help manage stress and increase self-awareness.</small>
        </li>
      </ul>
    </div>

    <div class="highlight-box" style="border-left-color: #ffc107;">
      <h3 style="color: #e67e22; margin-top: 0;">⚠️ Mild Depression (11-20 points)</h3>
      <p style="margin-bottom: 1rem;"><strong>Summary:</strong> Your responses suggest mild symptoms of depression. Consider implementing some self-care strategies and reaching out to your support network.</p>
      <ul style="padding-left: 0; list-style: none;">
        <li style="margin-bottom: 0.8rem; padding: 0.4rem; background-color: #fef9e7; border-radius: 6px;">
          <strong>Start each day with one small positive action</strong><br>
          <small style="color: #666; font-style: italic;">Small wins early in the day can build momentum and improve your overall mood.</small>
        </li>
        <li style="margin-bottom: 0.8rem; padding: 0.4rem; background-color: #fef9e7; border-radius: 6px;">
          <strong>Create a simple daily routine</strong><br>
          <small style="color: #666; font-style: italic;">Structure provides stability and reduces decision fatigue when you're struggling.</small>
        </li>
        <li style="margin-bottom: 0.8rem; padding: 0.4rem; background-color: #fef9e7; border-radius: 6px;">
          <strong>Practice the "5-4-3-2-1" grounding technique</strong><br>
          <small style="color: #666; font-style: italic;">Notice 5 things you see, 4 you touch, 3 you hear, 2 you smell, 1 you taste. This helps with anxiety.</small>
        </li>
        <li style="margin-bottom: 0.8rem; padding: 0.4rem; background-color: #fef9e7; border-radius: 6px;">
          <strong>Try journaling for 5-10 minutes daily</strong><br>
          <small style="color: #666; font-style: italic;">Writing about thoughts and feelings can provide clarity and emotional release.</small>
        </li>
        <li style="margin-bottom: 0.8rem; padding: 0.4rem; background-color: #fef9e7; border-radius: 6px;">
          <strong>Engage in regular physical activity</strong><br>
          <small style="color: #666; font-style: italic;">Even 10-15 minutes of movement can improve mood and energy levels.</small>
        </li>
        <li style="margin-bottom: 0.8rem; padding: 0.4rem; background-color: #fef9e7; border-radius: 6px;">
          <strong>Connect with supportive friends or family</strong><br>
          <small style="color: #666; font-style: italic;">Reach out to people who care about you, even when you don't feel like it.</small>
        </li>
        <li style="margin-bottom: 0.8rem; padding: 0.4rem; background-color: #fef9e7; border-radius: 6px;">
          <strong>Consider self-help resources</strong><br>
          <small style="color: #666; font-style: italic;">Books, apps, or online resources can provide valuable coping strategies.</small>
        </li>
        <li style="margin-bottom: 0.8rem; padding: 0.4rem; background-color: #fef9e7; border-radius: 6px;">
          <strong>Limit alcohol and caffeine</strong><br>
          <small style="color: #666; font-style: italic;">Both can worsen anxiety and interfere with sleep quality.</small>
        </li>
        <li style="margin-bottom: 0.8rem; padding: 0.4rem; background-color: #fef9e7; border-radius: 6px;">
          <strong>Practice deep breathing exercises</strong><br>
          <small style="color: #666; font-style: italic;">Slow, deep breaths activate your body's relaxation response.</small>
        </li>
        <li style="margin-bottom: 0.8rem; padding: 0.4rem; background-color: #fef9e7; border-radius: 6px;">
          <strong>Set small, achievable goals each day</strong><br>
          <small style="color: #666; font-style: italic;">Success with small tasks builds confidence and motivation.</small>
        </li>
      </ul>
    </div>

    <div class="highlight-box" style="border-left-color: #fd7e14;">
      <h3 style="color: #fd7e14; margin-top: 0;">🔶 Moderate Depression (21-30 points)</h3>
      <p style="margin-bottom: 1rem;"><strong>Summary:</strong> Your responses indicate moderate symptoms of depression. Professional support would be beneficial. Consider speaking with a mental health professional.</p>
      <ul style="padding-left: 0; list-style: none;">
        <li style="margin-bottom: 0.8rem; padding: 0.4rem; background-color: #fef5e7; border-radius: 6px;">
          <strong>Reach out to a mental health professional</strong><br>
          <small style="color: #666; font-style: italic;">A therapist can provide personalized strategies and support for your specific situation.</small>
        </li>
        <li style="margin-bottom: 0.8rem; padding: 0.4rem; background-color: #fef5e7; border-radius: 6px;">
          <strong>Consider joining a depression support group</strong><br>
          <small style="color: #666; font-style: italic;">Connecting with others who understand can reduce isolation and provide practical advice.</small>
        </li>
        <li style="margin-bottom: 0.8rem; padding: 0.4rem; background-color: #fef5e7; border-radius: 6px;">
          <strong>Establish a structured daily routine</strong><br>
          <small style="color: #666; font-style: italic;">Consistent routines provide stability and help manage symptoms more effectively.</small>
        </li>
        <li style="margin-bottom: 0.8rem; padding: 0.4rem; background-color: #fef5e7; border-radius: 6px;">
          <strong>Practice "behavioral activation"</strong><br>
          <small style="color: #666; font-style: italic;">Gradually increase pleasant and meaningful activities, even when you don't feel motivated.</small>
        </li>
        <li style="margin-bottom: 0.8rem; padding: 0.4rem; background-color: #fef5e7; border-radius: 6px;">
          <strong>Use the "HALT" check-in technique</strong><br>
          <small style="color: #666; font-style: italic;">Ask yourself: Am I Hungry, Angry, Lonely, or Tired? Address these basic needs first.</small>
        </li>
        <li style="margin-bottom: 0.8rem; padding: 0.4rem; background-color: #fef5e7; border-radius: 6px;">
          <strong>Try cognitive restructuring</strong><br>
          <small style="color: #666; font-style: italic;">Challenge negative thought patterns and replace them with more balanced perspectives.</small>
        </li>
        <li style="margin-bottom: 0.8rem; padding: 0.4rem; background-color: #fef5e7; border-radius: 6px;">
          <strong>Maintain social connections</strong><br>
          <small style="color: #666; font-style: italic;">Stay connected with others, even if it feels difficult. Social support is crucial for recovery.</small>
        </li>
        <li style="margin-bottom: 0.8rem; padding: 0.4rem; background-color: #fef5e7; border-radius: 6px;">
          <strong>Create a "mood toolkit"</strong><br>
          <small style="color: #666; font-style: italic;">Develop a collection of activities, resources, and strategies that help improve your mood.</small>
        </li>
        <li style="margin-bottom: 0.8rem; padding: 0.4rem; background-color: #fef5e7; border-radius: 6px;">
          <strong>Practice relaxation techniques</strong><br>
          <small style="color: #666; font-style: italic;">Progressive muscle relaxation, guided imagery, or meditation can reduce stress.</small>
        </li>
        <li style="margin-bottom: 0.8rem; padding: 0.4rem; background-color: #fef5e7; border-radius: 6px;">
          <strong>Keep a mood diary</strong><br>
          <small style="color: #666; font-style: italic;">Track your moods, triggers, and helpful activities to identify patterns.</small>
        </li>
      </ul>
    </div>

    <div class="highlight-box" style="border-left-color: #dc3545;">
      <h3 style="color: #dc3545; margin-top: 0;">🔴 Moderately Severe Depression (31-40 points)</h3>
      <p style="margin-bottom: 1rem;"><strong>Summary:</strong> Your responses suggest moderately severe symptoms of depression. Professional help is strongly recommended. Please reach out to a mental health professional.</p>
      <ul style="padding-left: 0; list-style: none;">
        <li style="margin-bottom: 0.8rem; padding: 0.4rem; background-color: #fdf2f2; border-radius: 6px;">
          <strong>Schedule an appointment with a psychiatrist</strong><br>
          <small style="color: #666; font-style: italic;">A psychiatrist can evaluate whether medication might be helpful for your symptoms.</small>
        </li>
        <li style="margin-bottom: 0.8rem; padding: 0.4rem; background-color: #fdf2f2; border-radius: 6px;">
          <strong>Consider intensive outpatient programs</strong><br>
          <small style="color: #666; font-style: italic;">Structured programs provide comprehensive support while allowing you to maintain daily activities.</small>
        </li>
        <li style="margin-bottom: 0.8rem; padding: 0.4rem; background-color: #fdf2f2; border-radius: 6px;">
          <strong>Discuss medication options with a healthcare provider</strong><br>
          <small style="color: #666; font-style: italic;">Antidepressants can be effective for moderate to severe depression.</small>
        </li>
        <li style="margin-bottom: 0.8rem; padding: 0.4rem; background-color: #fdf2f2; border-radius: 6px;">
          <strong>Engage in evidence-based therapy</strong><br>
          <small style="color: #666; font-style: italic;">Therapies like CBT, DBT, or IPT have proven effectiveness for depression.</small>
        </li>
        <li style="margin-bottom: 0.8rem; padding: 0.4rem; background-color: #fdf2f2; border-radius: 6px;">
          <strong>Create a safety plan with your therapist</strong><br>
          <small style="color: #666; font-style: italic;">Have a clear plan for managing crisis situations and accessing help.</small>
        </li>
        <li style="margin-bottom: 0.8rem; padding: 0.4rem; background-color: #fdf2f2; border-radius: 6px;">
          <strong>Involve trusted family members or friends</strong><br>
          <small style="color: #666; font-style: italic;">Let your support system know how they can help during difficult times.</small>
        </li>
        <li style="margin-bottom: 0.8rem; padding: 0.4rem; background-color: #fdf2f2; border-radius: 6px;">
          <strong>Maintain basic self-care routines</strong><br>
          <small style="color: #666; font-style: italic;">Focus on essential activities like eating, bathing, and taking medications.</small>
        </li>
        <li style="margin-bottom: 0.8rem; padding: 0.4rem; background-color: #fdf2f2; border-radius: 6px;">
          <strong>Use crisis resources when needed</strong><br>
          <small style="color: #666; font-style: italic;">Don't hesitate to call crisis hotlines or emergency services if you're in immediate danger.</small>
        </li>
        <li style="margin-bottom: 0.8rem; padding: 0.4rem; background-color: #fdf2f2; border-radius: 6px;">
          <strong>Try to maintain some social contact</strong><br>
          <small style="color: #666; font-style: italic;">Even brief interactions can help prevent complete isolation.</small>
        </li>
        <li style="margin-bottom: 0.8rem; padding: 0.4rem; background-color: #fdf2f2; border-radius: 6px;">
          <strong>Focus on very small, manageable goals</strong><br>
          <small style="color: #666; font-style: italic;">Break tasks into tiny steps and celebrate small accomplishments.</small>
        </li>
      </ul>
    </div>

    <div class="highlight-box" style="border-left-color: #721c24;">
      <h3 style="color: #721c24; margin-top: 0;">🆘 Severe Depression (41+ points)</h3>
      <p style="margin-bottom: 1rem;"><strong>Summary:</strong> Your responses indicate severe symptoms of depression. Immediate professional help is crucial. Please contact a mental health professional or crisis hotline right away.</p>
      <ul style="padding-left: 0; list-style: none;">
        <li style="margin-bottom: 0.8rem; padding: 0.4rem; background-color: #f8d7da; border-radius: 6px;">
          <strong>Seek immediate professional help</strong><br>
          <small style="color: #666; font-style: italic;">Severe depression requires professional intervention. Don't try to manage this alone.</small>
        </li>
        <li style="margin-bottom: 0.8rem; padding: 0.4rem; background-color: #f8d7da; border-radius: 6px;">
          <strong>Contact crisis hotline if needed</strong><br>
          <small style="color: #666; font-style: italic;">Crisis hotlines are available 24/7: National Suicide Prevention Lifeline: 988</small>
        </li>
        <li style="margin-bottom: 0.8rem; padding: 0.4rem; background-color: #f8d7da; border-radius: 6px;">
          <strong>Reach out to trusted support system</strong><br>
          <small style="color: #666; font-style: italic;">Let people close to you know you're struggling and need extra support.</small>
        </li>
        <li style="margin-bottom: 0.8rem; padding: 0.4rem; background-color: #f8d7da; border-radius: 6px;">
          <strong>Consider psychiatric hospitalization if necessary</strong><br>
          <small style="color: #666; font-style: italic;">Inpatient care can provide safety and intensive treatment when needed.</small>
        </li>
        <li style="margin-bottom: 0.8rem; padding: 0.4rem; background-color: #f8d7da; border-radius: 6px;">
          <strong>Work with a psychiatrist for medication</strong><br>
          <small style="color: #666; font-style: italic;">Medication management is often essential for severe depression.</small>
        </li>
        <li style="margin-bottom: 0.8rem; padding: 0.4rem; background-color: #f8d7da; border-radius: 6px;">
          <strong>Engage in intensive therapy</strong><br>
          <small style="color: #666; font-style: italic;">Frequent therapy sessions can provide crucial support during severe episodes.</small>
        </li>
        <li style="margin-bottom: 0.8rem; padding: 0.4rem; background-color: #f8d7da; border-radius: 6px;">
          <strong>Accept help with basic needs</strong><br>
          <small style="color: #666; font-style: italic;">Allow others to help with daily tasks like cooking, cleaning, or errands.</small>
        </li>
        <li style="margin-bottom: 0.8rem; padding: 0.4rem; background-color: #f8d7da; border-radius: 6px;">
          <strong>Remove potentially harmful items</strong><br>
          <small style="color: #666; font-style: italic;">Create a safe environment by removing items that could be used for self-harm.</small>
        </li>
        <li style="margin-bottom: 0.8rem; padding: 0.4rem; background-color: #f8d7da; border-radius: 6px;">
          <strong>Create a detailed safety plan</strong><br>
          <small style="color: #666; font-style: italic;">Work with professionals to develop a comprehensive plan for crisis situations.</small>
        </li>
        <li style="margin-bottom: 0.8rem; padding: 0.4rem; background-color: #f8d7da; border-radius: 6px;">
          <strong>Focus on surviving each day</strong><br>
          <small style="color: #666; font-style: italic;">Take things one day, one hour, or one moment at a time.</small>
        </li>
      </ul>
    </div>

    <div class="highlight-box" style="border-left-color: #e74c3c; background-color: #fdf2f2;">
      <h3 style="color: #e74c3c; margin-top: 0;">🚨 Emergency Crisis Resources</h3>
      <p><strong>National Suicide Prevention Lifeline:</strong> 988</p>
      <p><strong>Crisis Text Line:</strong> Text HOME to 741741</p>
      <p><strong>Emergency Services:</strong> Call 911 if in immediate danger</p>
      <p><strong>SAMHSA National Helpline:</strong> 1-800-662-4357 (24/7 treatment referral service)</p>
      <p style="font-style: italic; margin-top: 1rem;">Remember: You are not alone, and help is available. Please reach out if you're struggling.</p>
    </div>
    
    <button class="dashboard-button" onclick="goToDashboard()">Go to Dashboard</button>
  `;

  document.getElementById('report-container').innerHTML = reportHtml;
}

async function loadReport() {
  console.log('Starting to load report...');
  
  // Try to get report from server first
  const report = await fetchReportFromServer();
  
  if (report) {
    loadReportContent(report);
  } else {
    // Fallback: try localStorage (for backwards compatibility)
    console.log('Trying localStorage fallback...');
    try {
      const storedReport = localStorage.getItem('latestReport');
      if (storedReport) {
        const parsedReport = JSON.parse(storedReport);
        console.log('Found report in localStorage:', parsedReport);
        loadReportContent(parsedReport);
      } else {
        showNoDataMessage();
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      showNoDataMessage();
    }
  }
}

function goToDashboard() {
  window.location.href = 'dashboard.html';
}