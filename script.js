// Process the uploaded CSV file
function processCSV() {
    const fileInput = document.getElementById('csvFile');
    const file = fileInput.files[0];
  
    if (!file) {
      alert('Please upload a CSV file.');
      return;
    }
  
    // Use Papa Parse to parse the CSV file
    Papa.parse(file, {
      header: true,
      complete: function (results) {
        console.log("Parsed data:", results.data); // Log parsed data for debugging
        analyzeData(results.data);
      },
      error: function () {
        alert('Error processing the CSV file.');
      },
    });
    
  }
  
  // Analyze the data
  function analyzeData(data) {
    const dailyTotals = {};
    const monthlyTotals = {};
    const yearlyTotals = {};
  
    data.forEach((entry) => {
      const rawDate = entry.Date; // Read date as string
      const date = new Date(rawDate); // Attempt to parse it
  
      if (isNaN(date.getTime())) {
        console.warn(`Invalid date value: "${rawDate}" - Skipping row`);
        return; // Skip invalid dates
      }
  
      const income = parseFloat(entry.Income || 0);
      const expense = parseFloat(entry.Expense || 0);
      const netAmount = income - expense;
  
      if (!isNaN(netAmount)) {
        // Daily
        const day = date.toISOString().split('T')[0];
        dailyTotals[day] = (dailyTotals[day] || 0) + netAmount;
  
        // Monthly
        const month = `${date.getFullYear()}-${date.getMonth() + 1}`;
        monthlyTotals[month] = (monthlyTotals[month] || 0) + netAmount;
  
        // Yearly
        const year = date.getFullYear();
        yearlyTotals[year] = (yearlyTotals[year] || 0) + netAmount;
      }
    });
  
    renderCharts(dailyTotals, monthlyTotals, yearlyTotals);
    generateSuggestions(monthlyTotals);
  }
  
  
  // Render the charts using Chart.js
  function renderCharts(daily, monthly, yearly) {
    const dailyCtx = document.getElementById('dailyChart').getContext('2d');
    const monthlyCtx = document.getElementById('monthlyChart').getContext('2d');
    const yearlyCtx = document.getElementById('yearlyChart').getContext('2d');
  
    new Chart(dailyCtx, {
      type: 'line',
      data: {
        labels: Object.keys(daily),
        datasets: [
          {
            label: 'Daily Net Income',
            data: Object.values(daily),
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
          },
        ],
      },
    });
  
    new Chart(monthlyCtx, {
      type: 'bar',
      data: {
        labels: Object.keys(monthly),
        datasets: [
          {
            label: 'Monthly Net Income',
            data: Object.values(monthly),
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
          },
        ],
      },
    });
  
    new Chart(yearlyCtx, {
      type: 'pie',
      data: {
        labels: Object.keys(yearly),
        datasets: [
          {
            label: 'Yearly Net Income',
            data: Object.values(yearly),
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(255, 159, 64, 0.2)',
              'rgba(255, 205, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
            ],
          },
        ],
      },
    });
  }
  
  // Generate suggestions for reducing expenses
  function generateSuggestions(monthlyTotals) {
    const suggestions = [];
    const avgIncome =
      Object.values(monthlyTotals).reduce((a, b) => a + b, 0) /
      Object.keys(monthlyTotals).length;
  
    Object.entries(monthlyTotals).forEach(([month, net]) => {
      if (net < avgIncome * 0.8) {
        suggestions.push(`In ${month}, your net income is lower than usual. Reduce expenses.`);
      }
    });
  
    const suggestionList = document.getElementById('suggestionList');
    suggestionList.innerHTML = '';
    suggestions.forEach((suggestion) => {
      const li = document.createElement('li');
      li.textContent = suggestion;
      suggestionList.appendChild(li);
    });
  }
  