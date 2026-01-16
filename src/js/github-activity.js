/**
 * GitHub Activity Contribution Graph System
 * Handles data generation, rendering, and scaling of the contribution grid.
 */

function initializeContributionGraphs(windowElement) {
    const graphsContainer = windowElement.querySelector('#contribution-graphs');
    if (!graphsContainer) return;

    // Clear existing content
    graphsContainer.innerHTML = '';

    // Create scaler element
    const scaler = document.createElement('div');
    scaler.className = 'contribution-scaler';

    // Add Months Header Row
    const monthsRow = document.createElement('div');
    monthsRow.className = 'contribution-months-row';
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    monthNames.forEach(month => {
        const monthLabel = document.createElement('div');
        monthLabel.className = 'contribution-month';
        monthLabel.textContent = month;
        monthsRow.appendChild(monthLabel);
    });
    scaler.appendChild(monthsRow);

    // Generate and render each year
    const years = [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019];
    years.forEach(year => {
        const yearData = generateYearContributionData(year);
        renderYearRow(scaler, year, yearData);
    });

    graphsContainer.appendChild(scaler);

    // Scaling logic
    const updateScale = () => {
        const containerWidth = graphsContainer.clientWidth;
        const targetWidth = 800; 
        
        if (containerWidth < targetWidth) {
            const scaleFactor = containerWidth / targetWidth;
            scaler.style.transform = `scale(${scaleFactor})`;
            // Compensate for height since scale() doesn't affect document flow layout
            graphsContainer.style.height = (scaler.offsetHeight * scaleFactor) + 'px';
        } else {
            scaler.style.transform = 'none';
            graphsContainer.style.height = 'auto';
        }
    };

    // Initial scale and add observer
    updateScale();
    const resizeObserver = new ResizeObserver(updateScale);
    resizeObserver.observe(graphsContainer);
}

function renderYearRow(container, year, contributions) {
    const yearRow = document.createElement('div');
    yearRow.className = 'contribution-year-row';

    // Year Label
    const yearLabel = document.createElement('div');
    yearLabel.className = 'contribution-year-label';
    yearLabel.textContent = year;
    yearRow.appendChild(yearLabel);

    // Day Labels (Mon, Wed, Fri)
    const daysLabels = document.createElement('div');
    daysLabels.className = 'contribution-days-labels';
    ['', 'Mon', '', 'Wed', '', 'Fri', ''].forEach(day => {
        const dayLabel = document.createElement('div');
        dayLabel.className = 'contribution-day-label';
        dayLabel.textContent = day;
        daysLabels.appendChild(dayLabel);
    });
    yearRow.appendChild(daysLabels);

    // Grid
    const grid = document.createElement('div');
    grid.className = 'contribution-grid';

    const jan1 = new Date(year, 0, 1);
    const startDayOfWeek = jan1.getDay();

    for (let week = 0; week < 53; week++) {
        for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
            const dayIndex = week * 7 + dayOfWeek - startDayOfWeek;
            const contributionCount = (dayIndex >= 0 && dayIndex < contributions.length) ? contributions[dayIndex] : 0;
            const level = getContributionLevel(contributionCount);

            const dayElement = document.createElement('div');
            dayElement.className = `contribution-day level-${level}`;
            dayElement.title = `${contributionCount} contributions on ${new Date(year, 0, dayIndex + 1).toDateString()}`;
            grid.appendChild(dayElement);
        }
    }
    yearRow.appendChild(grid);
    container.appendChild(yearRow);
}

function generateYearContributionData(year) {
    const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    const daysInYear = isLeapYear ? 366 : 365;
    const contributions = [];

    for (let i = 0; i < daysInYear; i++) {
        const baseProbability = year >= 2023 ? 0.4 : year >= 2020 ? 0.25 : 0.15;
        const hasContribution = Math.random() < baseProbability;
        const count = hasContribution ? Math.floor(Math.random() * 20) + 1 : 0;
        contributions.push(count);
    }

    return contributions;
}

function getContributionLevel(count) {
    if (count === 0) return 0;
    if (count <= 3) return 1;
    if (count <= 6) return 2;
    if (count <= 12) return 3;
    return 4;
}
