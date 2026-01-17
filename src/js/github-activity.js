/**
 * GitHub Activity Contribution Graph System
 * Handles data generation, rendering, and scaling of the contribution grid.
 */

// Time periods configuration - easily add new periods here
const TIME_PERIODS = [
    {
        label: 'Amazon Robotics',
        start: new Date(2024, 0, 6), // Jan 6, 2024
        end: new Date(2024, 6, 12),   // July 14, 2024
        color: '#FF9900'
    },
    {
        label: 'Loandock',
        start: new Date(2024, 6, 18), // Jan 6, 2024
        end: new Date(2025, 11, 31),   // July 14, 2024
        color: '#2759CB'
    },
    {
        // Aug 2022 - Dec 2023
        label: 'TBD Aerospace',
        start: new Date(2022, 7, 1), // Aug 2022
        end: new Date(2023, 11, 31),   // Dec 2023
        color: '#C7363C'
    }
];

// contributionData is loaded globally from contributions.js

function findConnectedRegions(year, contributions) {
    const regions = [];
    const visited = new Set();
    const jan1 = new Date(year, 0, 1);
    const startDayOfWeek = jan1.getDay();

    function getGridPosition(dayIndex) {
        const week = Math.floor((dayIndex + startDayOfWeek) / 7);
        const dayOfWeek = (dayIndex + startDayOfWeek) % 7;
        return { week, dayOfWeek };
    }

    function isValidDay(dayIndex) {
        return dayIndex >= 0 && dayIndex < contributions.length;
    }

    function getTimePeriodForDate(date) {
        return TIME_PERIODS.find(period =>
            date >= period.start && date <= period.end
        );
    }

    function getNeighbors(dayIndex) {
        const pos = getGridPosition(dayIndex);
        const neighbors = [];

        // Check all 4 directions (up, down, left, right)
        const directions = [
            [-1, 0], [1, 0], [0, -1], [0, 1] // up, down, left, right
        ];

        for (const [dw, dd] of directions) {
            const newWeek = pos.week + dw;
            const newDayOfWeek = pos.dayOfWeek + dd;
            if (newWeek >= 0 && newWeek < 53 && newDayOfWeek >= 0 && newDayOfWeek < 7) {
                const newDayIndex = newWeek * 7 + newDayOfWeek - startDayOfWeek;
                if (isValidDay(newDayIndex)) {
                    neighbors.push(newDayIndex);
                }
            }
        }

        return neighbors;
    }

    // Use contributions.length instead of hardcoding to handle leap years properly
    for (let dayIndex = 0; dayIndex < contributions.length; dayIndex++) {
        if (visited.has(dayIndex)) continue;

        const date = new Date(year, 0, dayIndex + 1);
        const currentPeriod = getTimePeriodForDate(date);
        if (!currentPeriod) continue;

        // Found a new region - do flood fill (only within the same time period)
        const region = [];
        const queue = [dayIndex];
        visited.add(dayIndex);

        while (queue.length > 0) {
            const current = queue.shift();
            region.push(current);

            for (const neighbor of getNeighbors(current)) {
                if (!visited.has(neighbor)) {
                    const neighborDate = new Date(year, 0, neighbor + 1);
                    const neighborPeriod = getTimePeriodForDate(neighborDate);
                    // Only connect if neighbor is in the SAME time period
                    if (neighborPeriod && neighborPeriod.label === currentPeriod.label) {
                        visited.add(neighbor);
                        queue.push(neighbor);
                    }
                }
            }
        }

        if (region.length > 0) {
            regions.push(region);
        }
    }

    return regions;
}

function createRegionBorder(year, region, backgroundLayer) {
    if (region.length === 0) return;

    const jan1 = new Date(year, 0, 1);
    const startDayOfWeek = jan1.getDay();
    const regionSet = new Set(region);

    // Get color from time period
    const date = new Date(year, 0, region[0] + 1);
    const period = TIME_PERIODS.find(p => date >= p.start && date <= p.end);
    if (!period) return;

    const borderColor = period.color;

    // For each square in the region, check each edge
    for (const dayIndex of region) {
        const week = Math.floor((dayIndex + startDayOfWeek) / 7);
        const dayOfWeek = (dayIndex + startDayOfWeek) % 7;

        // Check each of the 4 directions
        const directions = [
            { name: 'top', dx: 0, dy: -1 },
            { name: 'right', dx: 1, dy: 0 },
            { name: 'bottom', dx: 0, dy: 1 },
            { name: 'left', dx: -1, dy: 0 }
        ];

        for (const dir of directions) {
            const neighborWeek = week + dir.dx;
            const neighborDayOfWeek = dayOfWeek + dir.dy;

            // Check if neighbor exists and is in the region
            let hasNeighbor = false;
            if (neighborWeek >= 0 && neighborWeek < 53 && neighborDayOfWeek >= 0 && neighborDayOfWeek < 7) {
                const neighborDayIndex = neighborWeek * 7 + neighborDayOfWeek - startDayOfWeek;
                // Check if this neighbor position actually exists in the year's data
                const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
                const daysInYear = isLeapYear ? 366 : 365;
                if (neighborDayIndex >= 0 && neighborDayIndex < daysInYear && regionSet.has(neighborDayIndex)) {
                    hasNeighbor = true;
                }
            }

            // If no neighbor, create a border segment on this edge
            if (!hasNeighbor) {
                createBorderSegment(backgroundLayer, week, dayOfWeek, dir.name, borderColor);
            }
        }
    }
}

function createBorderSegment(container, week, dayOfWeek, edge, color) {
    const borderSegment = document.createElement('div');
    borderSegment.className = `contribution-border-segment contribution-border-${edge}`;
    borderSegment.style.backgroundColor = color;

    // Position and size the border segment
    const squareSize = 10;
    const gapSize = 3;
    const cellSize = squareSize + gapSize;

    const baseLeft = week * cellSize;
    const baseTop = dayOfWeek * cellSize;

    switch (edge) {
        case 'top':
            borderSegment.style.left = baseLeft + 'px';
            borderSegment.style.top = baseTop - 2 + 'px';
            borderSegment.style.width = squareSize + 'px';
            borderSegment.style.height = '2px';
            break;
        case 'right':
            borderSegment.style.left = baseLeft + squareSize + 'px';
            borderSegment.style.top = baseTop + 'px';
            borderSegment.style.width = '2px';
            borderSegment.style.height = squareSize + 'px';
            break;
        case 'bottom':
            borderSegment.style.left = baseLeft + 'px';
            borderSegment.style.top = baseTop + squareSize + 'px';
            borderSegment.style.width = squareSize + 'px';
            borderSegment.style.height = '2px';
            break;
        case 'left':
            borderSegment.style.left = baseLeft - 2 + 'px';
            borderSegment.style.top = baseTop + 'px';
            borderSegment.style.width = '2px';
            borderSegment.style.height = squareSize + 'px';
            break;
    }

    container.appendChild(borderSegment);
}

function initializeContributionGraphs(windowElement) {
    const graphsContainer = windowElement.querySelector('#contribution-graphs');
    if (!graphsContainer) return;

    // Clear existing content
    graphsContainer.innerHTML = '';

    // Add legend row if there are time periods
    if (TIME_PERIODS.length > 0) {
        const legendContainer = document.createElement('div');
        legendContainer.className = 'contribution-legend-container';

        TIME_PERIODS.forEach(period => {
            const legendItem = document.createElement('div');
            legendItem.className = 'contribution-legend-item';

            const colorSquare = document.createElement('div');
            colorSquare.className = 'contribution-legend-color';
            colorSquare.style.backgroundColor = period.color;

            const label = document.createElement('span');
            label.className = 'contribution-legend-label';
            label.textContent = period.label;

            legendItem.appendChild(colorSquare);
            legendItem.appendChild(label);
            legendContainer.appendChild(legendItem);
        });

        graphsContainer.appendChild(legendContainer);
    }

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
    const years = [2026, 2025, 2024, 2023, 2022, 2021, 2020];
    years.forEach(year => {
        const yearData = getYearContributionData(year, window.contributionData);
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

    // Day Labels (Sun, Mon, Tue, Wed, Thu, Fri, Sat)
    const daysLabels = document.createElement('div');
    daysLabels.className = 'contribution-days-labels';
    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(day => {
        const dayLabel = document.createElement('div');
        dayLabel.className = 'contribution-day-label';
        dayLabel.textContent = day;
        daysLabels.appendChild(dayLabel);
    });
    yearRow.appendChild(daysLabels);

    // Grid container to hold both background and contribution layers
    const gridContainer = document.createElement('div');
    gridContainer.className = 'contribution-grid-container';

    // Background layer for time periods
    const backgroundLayer = document.createElement('div');
    backgroundLayer.className = 'contribution-background-layer';

    // Grid
    const grid = document.createElement('div');
    grid.className = 'contribution-grid';

    gridContainer.appendChild(backgroundLayer);
    gridContainer.appendChild(grid);

    const jan1 = new Date(year, 0, 1);
    const startDayOfWeek = jan1.getDay();

    // Find connected regions for time periods and create borders
    const regions = findConnectedRegions(year, contributions);
    for (const region of regions) {
        createRegionBorder(year, region, backgroundLayer);
    }

    // GitHub layout: days of week as rows, weeks as columns
    for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
        for (let week = 0; week < 53; week++) {
            const dayIndex = week * 7 + dayOfWeek - startDayOfWeek;
            const contributionCount = (dayIndex >= 0 && dayIndex < contributions.length) ? contributions[dayIndex] : 0;
            const level = getContributionLevel(contributionCount);

            const dayElement = document.createElement('div');
            dayElement.className = `contribution-day level-${level}`;

            if (dayIndex >= 0 && dayIndex < contributions.length) {
                const date = new Date(year, 0, dayIndex + 1);
                dayElement.title = `${contributionCount} contributions on ${date.toDateString()}`;
            } else {
                dayElement.title = 'No data';
            }
            grid.appendChild(dayElement);
        }
    }
    yearRow.appendChild(gridContainer);
    container.appendChild(yearRow);
}

function getYearContributionData(year, data) {
    // Get data from contributions.js, or return empty array if no data available
    if (data && data[year]) {
        return data[year];
    }

    // Return empty array for years with no data
    console.log(`No contribution data available for ${year}`);
    const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    const daysInYear = isLeapYear ? 366 : 365;
    return new Array(daysInYear).fill(0);
}

function getContributionLevel(count) {
    if (count === 0) return 0;
    if (count <= 3) return 1;
    if (count <= 6) return 2;
    if (count <= 12) return 3;
    return 4;
}


// Make function available globally for non-module scripts
window.initializeContributionGraphs = initializeContributionGraphs;
