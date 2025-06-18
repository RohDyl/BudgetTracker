document.addEventListener('DOMContentLoaded', () => {
// --- DOM Elements ---
const dateInput = document.getElementById('dateInput');
const incomeInput = document.getElementById('incomeInput');
const expenseCategoryInput = document.getElementById('expenseCategoryInput');
const expenseAmountInput = document.getElementById('expenseAmountInput');
const descriptionInput = document.getElementById('descriptionInput');
const addEntryBtn = document.getElementById('addEntryBtn');
const budgetEntriesList = document.getElementById('budgetEntriesList');
const clearAllDataBtn = document.getElementById('clearAllDataBtn');

const selectedDateDisplay = document.getElementById('selectedDateDisplay');
const dailyIncomeDisplay = document.getElementById('dailyIncomeDisplay');
const dailyExpenseDisplay = document.getElementById('dailyExpenseDisplay');
const dailyBalanceDisplay = document.getElementById('dailyBalanceDisplay');

const overallIncomeDisplay = document.getElementById('overallIncomeDisplay');
const overallExpenseDisplay = document.getElementById('overallExpenseDisplay');
const overallBalanceDisplay = document.getElementById('overallBalanceDisplay');

const filterDateInput = document.getElementById('filterDate');
const clearFilterBtn = document.getElementById('clearFilterBtn');

const budgetLimitsContainer = document.getElementById('budgetLimitsContainer');
const saveBudgetLimitsBtn = document.getElementById('saveBudgetLimitsBtn');
const monthlyBudgetUsageContainer = document.getElementById('monthlyBudgetUsageContainer');
const showBudgetCategorySelect = document.getElementById('showBudgetCategory'); // New: Dropdown to show specific budget limits

// --- Data Storage ---
let budgetEntries = JSON.parse(localStorage.getItem('budgetEntries')) || [];
let monthlyBudgets = JSON.parse(localStorage.getItem('monthlyBudgets')) || {};

// --- Comprehensive Default Categories ---
const defaultCategories = {
    'Monthly Fixed Expenses': [
        'Rent/Mortgage', 'Rates & Taxes', 'Security', 'Electricity', 'Water',
        'Internet', 'Cell Phone', 'Insurance (Home/Car)', 'Loan Repayments',
        'Childcare/School Fees', 'HOA/Body Corporate Fees', 'Waste Management'
    ],
    'Monthly Variable Expenses': [
        'Groceries', 'Fuel/Petrol', 'Public Transport', 'Vehicle Maintenance',
        'Dining Out/Takeaways', 'Personal Care', 'Clothing', 'Entertainment',
        'Health/Medical', 'Pet Care', 'Gifts/Donations', 'Subscriptions (Other)',
        'Home Maintenance Fund', 'Miscellaneous', 'Coffee/Snacks', 'Parking/Tolls'
    ],
    'Savings & Investments': [
        'Emergency Fund', 'Retirement Savings', 'Investments', 'Holiday Fund',
        'New Car Fund', 'Education Fund', 'Large Purchase Fund'
    ],
    'Debt Repayments (Non-Mortgage)': [
        'Credit Card Payments', 'Personal Loans', 'Student Loans'
    ]
};

// --- Initial Setup ---
const today = new Date();
const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, '0');
const day = String(today.getDate()).padStart(2, '0');
const todayFormatted = `${year}-${month}-${day}`;
dateInput.value = todayFormatted;
filterDateInput.value = todayFormatted;

// --- Helper Functions ---

// Get current month in YYYY-MM format
function getCurrentMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// Generate a clean ID from a category name
function getCategoryId(categoryName) {
    return `budget-${categoryName.replace(/[^a-zA-Z0-9]/g, '')}`;
}

// --- Data Persistence Functions ---

function saveBudgetEntries() {
    localStorage.setItem('budgetEntries', JSON.stringify(budgetEntries));
}

function saveMonthlyBudgets() {
    localStorage.setItem('monthlyBudgets', JSON.stringify(monthlyBudgets));
}

// --- UI Population Functions ---

function populateExpenseCategories() {
    expenseCategoryInput.innerHTML = ''; // Clear existing options

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select Category';
    defaultOption.disabled = true;
    defaultOption.selected = true;
    expenseCategoryInput.appendChild(defaultOption);

    for (const group in defaultCategories) {
        const optgroup = document.createElement('optgroup');
        optgroup.label = group;
        defaultCategories[group].forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            optgroup.appendChild(option);
        });
        expenseCategoryInput.appendChild(optgroup);
    }
}

// New: Populate the dropdown for showing/adding budget limits
function populateShowBudgetCategoryDropdown() {
    showBudgetCategorySelect.innerHTML = '';

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select a category to show/add budget';
    defaultOption.selected = true;
    showBudgetCategorySelect.appendChild(defaultOption);

    const showAllOption = document.createElement('option');
    showAllOption.value = 'show-all';
    showAllOption.textContent = 'Show All Categories';
    showBudgetCategorySelect.appendChild(showAllOption);

    for (const group in defaultCategories) {
        const optgroup = document.createElement('optgroup');
        optgroup.label = group;
        defaultCategories[group].forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            optgroup.appendChild(option);
        });
        showBudgetCategorySelect.appendChild(optgroup);
    }
}

// Render budget limit input fields (all of them, but hide by default)
function renderBudgetLimits() {
    budgetLimitsContainer.innerHTML = ''; // Clear existing inputs

    const allCategories = [];
    for (const group in defaultCategories) {
        allCategories.push(...defaultCategories[group]);
    }
    allCategories.sort(); // Sort alphabetically for consistent display

    allCategories.forEach(category => {
        const div = document.createElement('div');
        const inputId = getCategoryId(category);
        div.id = `container-${inputId}`; // Container for the input field
        div.classList.add('budget-limit-item'); // Add a class for styling/selection

        const label = document.createElement('label');
        label.textContent = category + ':';
        label.setAttribute('for', inputId);

        const input = document.createElement('input');
        input.type = 'number';
        input.id = inputId;
        input.placeholder = 'R0.00';
        input.value = monthlyBudgets[category] || ''; // Pre-fill if a limit exists

        div.appendChild(label);
        div.appendChild(input);
        budgetLimitsContainer.appendChild(div);

        // Initially hide if no budget is set for it
        if (!monthlyBudgets[category] && monthlyBudgets[category] !== 0) {
            div.classList.remove('visible');
        } else {
            div.classList.add('visible');
        }
    });
}

// New: Function to show a specific budget limit input
function showBudgetLimitInput(category) {
    const inputId = getCategoryId(category);
    const container = document.getElementById(`container-${inputId}`);
    if (container) {
        container.classList.add('visible');
        container.scrollIntoView({ behavior: 'smooth', block: 'center' }); // Scroll to it
        const input = document.getElementById(inputId);
        if (input) input.focus(); // Focus the input
    }
}

// New: Function to show all budget limit inputs
function showAllBudgetLimitInputs() {
    const allItems = budgetLimitsContainer.querySelectorAll('.budget-limit-item');
    allItems.forEach(item => item.classList.add('visible'));
}

// --- Summary and Display Functions ---

function updateMonthlyBudgetUsage() {
    monthlyBudgetUsageContainer.innerHTML = ''; // Clear existing display

    const currentMonth = getCurrentMonth();

    const monthlySpent = {};
    budgetEntries.forEach(entry => {
        // Ensure it's an expense, from the current month, and has a category
        if (entry.type === 'expense' && entry.date.startsWith(currentMonth) && entry.category) {
            monthlySpent[entry.category] = (monthlySpent[entry.category] || 0) + entry.amount;
        }
    });

    const allCategories = [];
    for (const group in defaultCategories) {
        allCategories.push(...defaultCategories[group]);
    }
    allCategories.sort();

    let hasBudgetsToDisplay = false;
    allCategories.forEach(category => {
        const limit = monthlyBudgets[category];
        if (limit !== undefined && limit >= 0) { // Show categories with a set limit (even if 0)
            hasBudgetsToDisplay = true;
            const spent = monthlySpent[category] || 0;
            const percentage = limit > 0 ? (spent / limit * 100).toFixed(2) : (spent > 0 ? '∞' : '0.00'); // Handle division by zero

            const div = document.createElement('div');
            div.classList.add('monthly-budget-usage-item');

            const categoryNameSpan = document.createElement('span');
            categoryNameSpan.classList.add('category-name');
            categoryNameSpan.textContent = category;

            const usageAmountsSpan = document.createElement('span');
            usageAmountsSpan.classList.add('usage-amounts');
            // Format: Limit/Usage (Percentage%)
            usageAmountsSpan.innerHTML = `R${limit.toFixed(2)} / R${spent.toFixed(2)}`;

            const percentageSpan = document.createElement('span');
            percentageSpan.classList.add('percentage');
            if (parseFloat(percentage) > 100 || percentage === '∞') {
                percentageSpan.classList.add('over-budget');
            } else {
                percentageSpan.classList.remove('over-budget'); // Ensure class is removed if no longer over
                if (parseFloat(percentage) > 0) { // Only add under-budget if some spending occurred
                    percentageSpan.classList.add('under-budget');
                } else {
                    percentageSpan.classList.remove('under-budget');
                }
            }
            percentageSpan.textContent = ` (${percentage}%)`;

            usageAmountsSpan.appendChild(percentageSpan);
            div.appendChild(categoryNameSpan);
            div.appendChild(usageAmountsSpan);
            monthlyBudgetUsageContainer.appendChild(div);
        }
    });

    if (!hasBudgetsToDisplay) {
        monthlyBudgetUsageContainer.innerHTML = '<p style="text-align: center; font-style: italic; color: #777;">No monthly budget limits set. Set them in the section above!</p>';
    }
}

function renderEntries(filterDate = null) {
    budgetEntriesList.innerHTML = ''; // Clear existing entries

    let filteredEntries = budgetEntries;
    if (filterDate) {
        filteredEntries = budgetEntries.filter(entry => entry.date === filterDate);
    }

    if (filteredEntries.length === 0) {
        const li = document.createElement('li');
        li.textContent = filterDate ? "No entries for this date." : "No entries yet. Add one!";
        li.style.textAlign = 'center';
        li.style.fontStyle = 'italic';
        li.style.color = '#777';
        budgetEntriesList.appendChild(li);
        return;
    }

    // Sort entries by date (newest first)
    filteredEntries.sort((a, b) => new Date(b.date) - new Date(a.date));

    filteredEntries.forEach((entry) => {
        const li = document.createElement('li');

        const entryDetails = document.createElement('div');
        entryDetails.classList.add('entry-details');

        const entryDateSpan = document.createElement('span');
        entryDateSpan.classList.add('entry-date');
        entryDateSpan.textContent = entry.date;

        const entryDescriptionSpan = document.createElement('span');
        entryDescriptionSpan.classList.add('entry-description');
        entryDescriptionSpan.textContent = entry.description ? ` (${entry.description})` : '';

        const entryCategorySpan = document.createElement('span');
        entryCategorySpan.classList.add('entry-category');
        entryCategorySpan.textContent = entry.type === 'expense' && entry.category ? `Category: ${entry.category}` : '';

        const entryAmountSpan = document.createElement('span');
        entryAmountSpan.classList.add('entry-amount');
        entryAmountSpan.textContent = `R${entry.amount.toFixed(2)}`;
        entryAmountSpan.classList.add(entry.type); // 'income' or 'expense'

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => deleteEntry(entry.id));

        entryDetails.appendChild(entryDateSpan);
        entryDetails.appendChild(entryDescriptionSpan);
        if (entry.type === 'expense' && entry.category) {
            entryDetails.appendChild(entryCategorySpan);
        }

        li.appendChild(entryDetails);
        li.appendChild(entryAmountSpan);
        li.appendChild(deleteBtn);

        budgetEntriesList.appendChild(li);
    });
}

function updateDailySummary(date) {
    selectedDateDisplay.textContent = date || 'N/A';
    let dailyIncome = 0;
    let dailyExpense = 0;

    budgetEntries.forEach(entry => {
        if (entry.date === date) {
            if (entry.type === 'income') {
                dailyIncome += entry.amount;
            } else if (entry.type === 'expense') {
                dailyExpense += entry.amount;
            }
        }
    });

    const dailyBalance = dailyIncome - dailyExpense;

    dailyIncomeDisplay.textContent = dailyIncome.toFixed(2);
    dailyExpenseDisplay.textContent = dailyExpense.toFixed(2);
    dailyBalanceDisplay.textContent = dailyBalance.toFixed(2);

    if (dailyBalance < 0) {
        dailyBalanceDisplay.classList.add('negative');
    } else {
        dailyBalanceDisplay.classList.remove('negative');
    }
}

function updateOverallSummary() {
    let overallIncome = 0;
    let overallExpense = 0;

    budgetEntries.forEach(entry => {
        if (entry.type === 'income') {
            overallIncome += entry.amount;
        } else if (entry.type === 'expense') {
            overallExpense += entry.amount;
        }
    });

    const overallBalance = overallIncome - overallExpense;

    overallIncomeDisplay.textContent = overallIncome.toFixed(2);
    overallExpenseDisplay.textContent = overallExpense.toFixed(2);
    overallBalanceDisplay.textContent = overallBalance.toFixed(2);

    if (overallBalance < 0) {
        overallBalanceDisplay.classList.add('negative');
    } else {
        overallBalanceDisplay.classList.remove('negative');
    }
}

// --- Core Logic Functions ---

function addEntry() {
    const date = dateInput.value;
    const income = parseFloat(incomeInput.value);
    const expenseAmount = parseFloat(expenseAmountInput.value);
    const expenseCategory = expenseCategoryInput.value;
    const description = descriptionInput.value.trim();

    if (!date) {
        alert('Please select a date.');
        return;
    }

    if (isNaN(income) && isNaN(expenseAmount)) {
        alert('Please enter either an income or an expense amount.');
        return;
    }

    if (!isNaN(income) && income > 0) {
        budgetEntries.push({
            id: Date.now(),
            date: date,
            type: 'income',
            amount: income,
            description: description
        });
    }

    if (!isNaN(expenseAmount) && expenseAmount > 0) {
        if (!expenseCategory) {
            alert('Please select a category for the expense.');
            return;
        }
        budgetEntries.push({
            id: Date.now() + 1,
            date: date,
            type: 'expense',
            amount: expenseAmount,
            category: expenseCategory,
            description: description
        });

        // New: Automatically show budget limit input for this category if not visible
        showBudgetLimitInput(expenseCategory);
    }

    saveBudgetEntries();
    renderEntries(filterDateInput.value);
    updateDailySummary(filterDateInput.value);
    updateOverallSummary();
    updateMonthlyBudgetUsage();

    // Clear input fields
    incomeInput.value = '';
    expenseAmountInput.value = '';
    expenseCategoryInput.value = '';
    descriptionInput.value = '';
    dateInput.value = todayFormatted;
}

function deleteEntry(idToDelete) {
    if (confirm('Are you sure you want to delete this entry?')) {
        budgetEntries = budgetEntries.filter(entry => entry.id !== idToDelete);
        saveBudgetEntries();
        renderEntries(filterDateInput.value);
        updateDailySummary(filterDateInput.value);
        updateOverallSummary();
        updateMonthlyBudgetUsage();
    }
}

function clearAllData() {
    if (confirm('Are you sure you want to clear ALL saved budget data (entries AND budget limits)? This cannot be undone.')) {
        localStorage.removeItem('budgetEntries');
        localStorage.removeItem('monthlyBudgets');
        budgetEntries = [];
        monthlyBudgets = {};
        renderEntries(filterDateInput.value);
        updateDailySummary(filterDateInput.value);
        updateOverallSummary();
        renderBudgetLimits(); // Re-render to hide all
        updateMonthlyBudgetUsage();
        alert('All data cleared!');
    }
}

function saveBudgetLimits() {
    const allCategories = [];
    for (const group in defaultCategories) {
        allCategories.push(...defaultCategories[group]);
    }

    allCategories.forEach(category => {
        const inputId = getCategoryId(category);
        const input = document.getElementById(inputId);
        if (input) {
            const limit = parseFloat(input.value);
            if (!isNaN(limit) && limit >= 0) {
                monthlyBudgets[category] = limit;
                // Ensure it's visible if a limit is set
                document.getElementById(`container-${inputId}`).classList.add('visible');
            } else {
                delete monthlyBudgets[category]; // Remove if invalid or empty
                // Hide if limit is removed
                document.getElementById(`container-${inputId}`).classList.remove('visible');
            }
        }
    });
    saveMonthlyBudgets();
    updateMonthlyBudgetUsage();
    alert('Monthly budget limits saved!');
}

// --- Event Listeners ---
addEntryBtn.addEventListener('click', addEntry);
clearAllDataBtn.addEventListener('click', clearAllData);
saveBudgetLimitsBtn.addEventListener('click', saveBudgetLimits);

filterDateInput.addEventListener('change', () => {
    const selectedFilterDate = filterDateInput.value;
    renderEntries(selectedFilterDate);
    updateDailySummary(selectedFilterDate);
});

clearFilterBtn.addEventListener('click', () => {
    filterDateInput.value = '';
    renderEntries();
    updateDailySummary('');
});

// New: Event listener for the showBudgetCategory dropdown
showBudgetCategorySelect.addEventListener('change', (event) => {
    const selectedCategory = event.target.value;
    if (selectedCategory === 'show-all') {
        showAllBudgetLimitInputs();
    } else if (selectedCategory) { // If a specific category is selected
        showBudgetLimitInput(selectedCategory);
    }
    // Reset the dropdown to its default state after selection
    event.target.value = '';
});

// --- Initial Load ---
populateExpenseCategories();
populateShowBudgetCategoryDropdown(); // New: Populate this dropdown on load
renderBudgetLimits();
updateMonthlyBudgetUsage(); // Call before other summaries as it affects the initial state
renderEntries(filterDateInput.value);
updateDailySummary(filterDateInput.value);
updateOverallSummary();
});