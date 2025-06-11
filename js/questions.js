// Questions array for Financial Literacy App
console.log('DEBUG: questions.js is being executed');
console.log('DEBUG: Setting window.questions array');

window.questions = [
    // Basic Banking - Account Types
    {
        id: 1,
        topicId: 1,
        subLevelId: 1.1,
        question: "💰 What is a checking account?",
        options: [
            "An account for long-term savings",
            "An account for daily transactions and bill payments",
            "An investment account for stocks",
            "A retirement account"
        ],
        correctIndex: 1,
        explanation: "A checking account is designed for daily transactions and bill payments, offering easy access to your money."
    },
    {
        id: 2,
        topicId: 1,
        subLevelId: 1.1,
        question: "🏦 What is the main difference between a savings and checking account?",
        options: [
            "Savings accounts can't be accessed online",
            "Savings accounts typically offer higher interest rates",
            "Checking accounts can't be used for ATM withdrawals",
            "Savings accounts don't require a minimum balance"
        ],
        correctIndex: 1,
        explanation: "Savings accounts typically offer higher interest rates than checking accounts because they're designed for long-term savings."
    },
    // Basic Banking - Banking Services
    {
        id: 3,
        topicId: 1,
        subLevelId: 1.2,
        question: "💳 What is an overdraft fee?",
        options: [
            "A fee for using an ATM",
            "A fee charged when you spend more than your account balance",
            "A monthly maintenance fee",
            "A fee for closing your account"
        ],
        correctIndex: 1,
        explanation: "An overdraft fee is charged when you spend more money than you have in your account."
    },
    // Saving Basics - Savings Goals
    {
        id: 4,
        topicId: 2,
        subLevelId: 2.1,
        question: "🎯 What is a SMART savings goal?",
        options: [
            "A goal that uses artificial intelligence",
            "A goal that is Specific, Measurable, Achievable, Relevant, and Time-bound",
            "A goal that requires a smart phone",
            "A goal that only rich people can achieve"
        ],
        correctIndex: 1,
        explanation: "SMART goals are Specific, Measurable, Achievable, Relevant, and Time-bound, making them more likely to be achieved."
    },
    // Budgeting 101 - Income & Expenses
    {
        id: 5,
        topicId: 3,
        subLevelId: 3.1,
        question: "📊 What is the difference between fixed and variable expenses?",
        options: [
            "Fixed expenses are always higher",
            "Fixed expenses stay the same, variable expenses change",
            "Variable expenses are always lower",
            "Fixed expenses can't be budgeted"
        ],
        correctIndex: 1,
        explanation: "Fixed expenses remain the same each month, while variable expenses can change based on usage or needs."
    },
    // Investment Basics - Investment Types
    {
        id: 6,
        topicId: 4,
        subLevelId: 4.1,
        question: "📈 What is a mutual fund?",
        options: [
            "A type of bank account",
            "A pool of money from many investors used to buy various investments",
            "A type of insurance policy",
            "A government savings bond"
        ],
        correctIndex: 1,
        explanation: "A mutual fund is a pool of money from many investors that is managed by professionals to invest in various securities."
    },
    {
        id: 7,
        topicId: 2,
        subLevelId: 2.2,
        question: "💰 What is compound interest?",
        options: [
            "Interest calculated only on the initial principal",
            "Interest calculated on both the initial principal and accumulated interest",
            "A fixed interest rate that never changes",
            "Interest paid only at the end of a loan term"
        ],
        correctIndex: 1,
        explanation: "Compound interest is calculated on both the initial principal and the accumulated interest, allowing your money to grow faster over time."
    },
    {
        id: 8,
        topicId: 2,
        subLevelId: 2.3,
        question: "🏦 Which of the following is NOT typically considered an emergency fund expense?",
        options: [
            "Car repairs",
            "Medical emergencies",
            "Vacation costs",
            "Temporary job loss"
        ],
        correctIndex: 2,
        explanation: "Vacation costs are planned expenses and should be budgeted for separately from your emergency fund."
    },
    {
        id: 9,
        topicId: 3,
        subLevelId: 3.2,
        question: "📊 What is the 50/30/20 budgeting rule?",
        options: [
            "Save 50%, spend 30% on needs, 20% on wants",
            "Spend 50% on needs, 30% on wants, save 20%",
            "Spend 50% on wants, 30% on needs, save 20%",
            "Save 50%, spend 30% on taxes, 20% on living expenses"
        ],
        correctIndex: 1,
        explanation: "The 50/30/20 rule suggests spending 50% of your income on needs, 30% on wants, and saving 20%."
    },
    {
        id: 10,
        topicId: 4,
        subLevelId: 4.1,
        question: "📈 What is diversification in investing?",
        options: [
            "Putting all your money in a single stock that performs well",
            "Spreading investments across various assets to reduce risk",
            "Investing only in government bonds",
            "Changing your investment strategy every month"
        ],
        correctIndex: 1,
        explanation: "Diversification means spreading your investments across different asset classes to reduce risk."
    },
    {
        id: 11,
        topicId: 3,
        subLevelId: 3.1,
        question: "💳 What is a credit score primarily used for?",
        options: [
            "To determine your net worth",
            "To evaluate your job performance",
            "To assess your creditworthiness for loans and credit",
            "To calculate your tax bracket"
        ],
        correctIndex: 2,
        explanation: "A credit score is used by lenders to evaluate your creditworthiness when applying for loans or credit cards."
    },
    {
        id: 12,
        topicId: 4,
        subLevelId: 4.2,
        question: "👵 Which retirement account typically offers tax-free withdrawals in retirement?",
        options: [
            "Traditional IRA",
            "Roth IRA",
            "Standard savings account",
            "Certificate of Deposit (CD)"
        ],
        correctIndex: 1,
        explanation: "Roth IRAs are funded with after-tax dollars, so qualified withdrawals in retirement are tax-free."
    },
    {
        id: 13,
        topicId: 2,
        subLevelId: 2.1,
        question: "💸 What does 'paying yourself first' mean?",
        options: [
            "Taking your entire paycheck as cash",
            "Prioritizing saving before spending on other expenses",
            "Paying all your bills immediately when you get paid",
            "Giving yourself a shopping spree each payday"
        ],
        correctIndex: 1,
        explanation: "Paying yourself first means automatically setting aside money for savings goals before spending on other expenses."
    },
    {
        id: 14,
        topicId: 1,
        subLevelId: 1.2,
        question: "🏠 What is the difference between a fixed-rate and variable-rate loan?",
        options: [
            "Fixed-rate never requires a down payment",
            "Variable-rate is always cheaper in the long run",
            "Fixed-rate has the same interest rate for the entire loan term",
            "Variable-rate loans are only available for mortgages"
        ],
        correctIndex: 2,
        explanation: "A fixed-rate loan maintains the same interest rate throughout the entire loan term, while a variable-rate can change over time."
    },
    {
        id: 15,
        topicId: 3,
        subLevelId: 3.2,
        question: "📝 What is the primary purpose of a budget?",
        options: [
            "To restrict all fun spending",
            "To track and plan how money is spent",
            "To impress financial advisors",
            "To qualify for larger loans"
        ],
        correctIndex: 1,
        explanation: "A budget helps you track income and expenses, allowing you to plan how your money is spent and achieve financial goals."
    },
    {
        id: 16,
        topicId: 1,
        subLevelId: 1.3,
        question: "🚗 Which of these is considered a depreciating asset?",
        options: [
            "Real estate in a growing market",
            "A rare collectible coin",
            "A new car",
            "A corporate bond"
        ],
        correctIndex: 2,
        explanation: "A new car typically loses value (depreciates) as soon as you drive it off the lot and continues to lose value over time."
    },
    {
        id: 17,
        topicId: 3,
        subLevelId: 3.3,
        question: "📅 What is dollar-cost averaging?",
        options: [
            "A way to calculate your average daily expenses",
            "A strategy of investing a fixed amount at regular intervals",
            "A method for determining your monthly tax withholding",
            "A budgeting technique for variable income"
        ],
        correctIndex: 1,
        explanation: "Dollar-cost averaging is an investment strategy where you invest a fixed amount at regular intervals, regardless of market conditions."
    },
    {
        id: 18,
        topicId: 1,
        subLevelId: 1.4,
        question: "💰 What's the difference between a bull market and a bear market?",
        options: [
            "Bull markets are in Asia, bear markets are in Europe",
            "Bull markets are rising, bear markets are falling",
            "Bull markets are for commodities, bear markets are for stocks",
            "Bull markets are short-term, bear markets are long-term"
        ],
        correctIndex: 1,
        explanation: "A bull market refers to a rising market with optimistic investor sentiment, while a bear market refers to a falling market with pessimistic sentiment."
    },
    {
        id: 19,
        topicId: 1,
        subLevelId: 1.5,
        question: "🏢 What is a REIT?",
        options: [
            "A type of real estate investment that trades like a stock",
            "A college savings plan",
            "A retirement planning document",
            "A tax filing status"
        ],
        correctIndex: 0,
        explanation: "A Real Estate Investment Trust (REIT) is a company that owns, operates, or finances income-producing real estate and typically trades on major exchanges like a stock."
    },
    {
        id: 20,
        topicId: 1,
        subLevelId: 1.6,
        question: "📊 What is the Rule of 72?",
        options: [
            "A law requiring 72 months of tax records to be kept",
            "A formula to estimate how long it takes to double your money",
            "A rule stating you should save 72% of income after age 50",
            "A requirement to retire by age 72"
        ],
        correctIndex: 1,
        explanation: "The Rule of 72 is a simple way to determine how long it will take an investment to double given a fixed annual rate of return. Divide 72 by the interest rate to get the approximate years."
    },
    {
        id: 21,
        topicId: 1,
        subLevelId: 1.7,
        question: "💵 What does it mean to be 'underwater' on a loan?",
        options: [
            "Having a loan with a bank that's near the ocean",
            "Having the loan interest rate below the prime rate",
            "Owing more on the loan than the asset is worth",
            "Being unable to make the minimum payments"
        ],
        correctIndex: 2,
        explanation: "Being 'underwater' means owing more on a loan than the underlying asset (like a house or car) is worth."
    },
    {
        id: 22,
        topicId: 1,
        subLevelId: 1.8,
        question: "💳 What is a secured credit card?",
        options: [
            "A credit card with advanced security features",
            "A card that requires a security deposit as collateral",
            "A card that can only be used for secure online transactions",
            "A credit card issued by a government-backed bank"
        ],
        correctIndex: 1,
        explanation: "A secured credit card requires a cash deposit as collateral, which typically becomes your credit limit. It's often used to build or rebuild credit."
    },
    {
        id: 23,
        topicId: 1,
        subLevelId: 1.9,
        question: "🏛️ What is the Federal Funds Rate?",
        options: [
            "The interest rate banks charge each other for overnight loans",
            "The rate the government pays on savings bonds",
            "The percentage of federal taxes on investment income",
            "The fee for transferring money between federal banks"
        ],
        correctIndex: 0,
        explanation: "The Federal Funds Rate is the interest rate at which banks lend reserve balances to other banks overnight. Changes to this rate affect other interest rates throughout the economy."
    },
    {
        id: 24,
        topicId: 1,
        subLevelId: 1.10,
        question: "📈 What is a stock dividend?",
        options: [
            "The total value of stocks in your portfolio",
            "A payment made by a corporation to its shareholders",
            "The growth rate of a stock over time",
            "A tax on stock transactions"
        ],
        correctIndex: 1,
        explanation: "A stock dividend is a payment made by a corporation to its shareholders, usually as a distribution of profits."
    },
    {
        id: 25,
        topicId: 1,
        subLevelId: 1.11,
        question: "🏦 What is a high-yield savings account?",
        options: [
            "Any savings account at a major bank",
            "A savings account that offers a higher interest rate than traditional accounts",
            "A savings account only available to high-net-worth individuals",
            "A savings account with high withdrawal fees"
        ],
        correctIndex: 1,
        explanation: "A high-yield savings account offers a higher interest rate than traditional savings accounts, allowing your money to grow faster."
    },
    {
        id: 26,
        topicId: 1,
        subLevelId: 1.12,
        question: "📝 What is an amortization schedule?",
        options: [
            "A payment plan for eliminating debt in equal installments",
            "A tax filing timeline",
            "A schedule for replacing depreciating assets",
            "An investment disbursement timeline"
        ],
        correctIndex: 0,
        explanation: "An amortization schedule is a table showing each payment on a loan and how much of each payment goes toward principal and interest."
    },
    {
        id: 27,
        topicId: 1,
        subLevelId: 1.13,
        question: "🏠 What is private mortgage insurance (PMI)?",
        options: [
            "Insurance that pays your mortgage if you become disabled",
            "Insurance that protects the lender if you default on your mortgage",
            "Insurance on privately owned property",
            "A type of homeowners insurance"
        ],
        correctIndex: 1,
        explanation: "PMI is insurance that protects the mortgage lender if you default on your loan. It's typically required for conventional loans with less than 20% down payment."
    },
    {
        id: 28,
        topicId: 1,
        subLevelId: 1.14,
        question: "💰 What is the purpose of an emergency fund?",
        options: [
            "To save for retirement",
            "To cover unexpected expenses and financial emergencies",
            "To earn high investment returns",
            "To save for planned large purchases"
        ],
        correctIndex: 1,
        explanation: "An emergency fund is meant to cover unexpected expenses and provide financial stability during emergencies like job loss or medical issues."
    },
    {
        id: 29,
        topicId: 1,
        subLevelId: 1.15,
        question: "📑 What is a W-4 form used for?",
        options: [
            "Filing your annual tax return",
            "Applying for a loan",
            "Telling your employer how much tax to withhold from your paycheck",
            "Opening a bank account"
        ],
        correctIndex: 2,
        explanation: "A W-4 form is completed by employees to tell their employer how much federal income tax to withhold from their paycheck."
    },
    {
        id: 30,
        topicId: 1,
        subLevelId: 1.16,
        question: "💹 What typically happens to bond prices when interest rates rise?",
        options: [
            "Bond prices rise",
            "Bond prices fall",
            "Bond prices stay the same",
            "Bond prices become unpredictable"
        ],
        correctIndex: 1,
        explanation: "Bond prices typically fall when interest rates rise because existing bonds with lower interest rates become less attractive compared to new bonds issued at higher rates."
    },
    {
        id: 31,
        topicId: 1,
        subLevelId: 1.17,
        question: "💰 What is a mutual fund?",
        options: [
            "A loan from multiple banks",
            "A pool of money invested in stocks, bonds, or other assets",
            "A type of savings account",
            "A government bond"
        ],
        correctIndex: 1
    },
    {
        id: 32,
        topicId: 1,
        subLevelId: 1.18,
        question: "💳 What is a credit utilization ratio?",
        options: [
            "The total amount of credit you have available",
            "The percentage of your credit limit that you're using",
            "The number of credit cards you own",
            "The interest rate on your credit cards"
        ],
        correctIndex: 1,
        explanation: "Your credit utilization ratio is the percentage of your available credit that you're currently using. A lower ratio is better for your credit score."
    },
    {
        id: 33,
        topicId: 1,
        subLevelId: 1.19,
        question: "🏦 What is the difference between a checking and savings account?",
        options: [
            "Checking accounts earn more interest",
            "Savings accounts are for daily transactions",
            "Checking accounts are for daily transactions, savings for long-term storage",
            "There is no difference"
        ],
        correctIndex: 2,
        explanation: "Checking accounts are designed for frequent transactions like paying bills, while savings accounts are meant for storing money long-term and typically earn higher interest."
    },
    {
        id: 34,
        topicId: 1,
        subLevelId: 1.20,
        question: "📊 What is a stock market index?",
        options: [
            "A list of all stocks available for purchase",
            "A measure of the overall performance of a group of stocks",
            "The total number of stocks traded in a day",
            "The average price of all stocks"
        ],
        correctIndex: 1,
        explanation: "A stock market index is a measurement of the value of a section of the stock market, used to track the performance of a group of stocks."
    },
    {
        id: 35,
        topicId: 1,
        subLevelId: 1.21,
        question: "💰 What is inflation?",
        options: [
            "When prices decrease over time",
            "When prices increase over time",
            "When the stock market crashes",
            "When interest rates increase"
        ],
        correctIndex: 1,
        explanation: "Inflation is the general increase in prices and fall in the purchasing value of money over time."
    },
    {
        id: 36,
        topicId: 1,
        subLevelId: 1.22,
        question: "🏠 What is a mortgage?",
        options: [
            "A type of insurance",
            "A loan specifically for buying a home",
            "A type of investment",
            "A government program"
        ],
        correctIndex: 1,
        explanation: "A mortgage is a loan specifically used to purchase a home, where the home itself serves as collateral for the loan."
    },
    {
        id: 37,
        topicId: 1,
        subLevelId: 1.23,
        question: "📅 What is dollar-cost averaging?",
        options: [
            "A way to calculate your average daily expenses",
            "Investing a fixed amount at regular intervals",
            "A method for determining your monthly tax withholding",
            "A budgeting technique for variable income"
        ],
        correctIndex: 1,
        explanation: "Dollar-cost averaging is an investment strategy where you invest a fixed amount at regular intervals, regardless of market conditions."
    },
    {
        id: 38,
        topicId: 1,
        subLevelId: 1.24,
        question: "💼 What is a 401(k) plan?",
        options: [
            "A type of savings account",
            "A retirement savings plan sponsored by an employer",
            "A government program for seniors",
            "A type of insurance policy"
        ],
        correctIndex: 1,
        explanation: "A 401(k) is a retirement savings plan sponsored by an employer that lets workers save and invest a portion of their paycheck before taxes are taken out."
    },
    {
        id: 39,
        topicId: 1,
        subLevelId: 1.25,
        question: "📱 What is mobile banking?",
        options: [
            "A type of investment",
            "Banking services accessed through a mobile device",
            "A type of loan",
            "A savings account"
        ],
        correctIndex: 1,
        explanation: "Mobile banking refers to banking services that can be accessed through a mobile device, allowing users to perform transactions and check balances on the go."
    },
    {
        id: 40,
        topicId: 1,
        subLevelId: 1.26,
        question: "🎓 What is a student loan?",
        options: [
            "A type of investment",
            "A loan specifically for education expenses",
            "A type of savings account",
            "A government grant"
        ],
        correctIndex: 1,
        explanation: "A student loan is money borrowed to pay for education expenses, which must be paid back with interest."
    },
    {
        id: 41,
        topicId: 1,
        subLevelId: 1.27,
        question: "📊 What is diversification in investing?",
        options: [
            "Putting all your money in one stock",
            "Spreading investments across different assets",
            "Investing only in bonds",
            "Changing investments daily"
        ],
        correctIndex: 1,
        explanation: "Diversification is an investment strategy that spreads your investments across different assets to reduce risk."
    },
    {
        id: 42,
        topicId: 1,
        subLevelId: 1.28,
        question: "💸 What is a budget?",
        options: [
            "A type of investment",
            "A plan for spending and saving money",
            "A type of loan",
            "A savings account"
        ],
        correctIndex: 1,
        explanation: "A budget is a plan that helps you track your income and expenses, ensuring you spend less than you earn."
    },
    {
        id: 43,
        topicId: 1,
        subLevelId: 1.29,
        question: "🏥 What is health insurance?",
        options: [
            "A type of investment",
            "Coverage that pays for medical expenses",
            "A savings account",
            "A type of loan"
        ],
        correctIndex: 1,
        explanation: "Health insurance is coverage that helps pay for medical expenses, including doctor visits, hospital stays, and prescription medications."
    },
    {
        id: 44,
        topicId: 1,
        subLevelId: 1.30,
        question: "📈 What is a bull market?",
        options: [
            "A market where prices are falling",
            "A market where prices are rising",
            "A market where prices stay the same",
            "A market that's closed"
        ],
        correctIndex: 1,
        explanation: "A bull market is a period when stock prices are rising and investor confidence is high."
    },
    {
        id: 45,
        topicId: 1,
        subLevelId: 1.31,
        question: "💳 What is a debit card?",
        options: [
            "A type of loan",
            "A card that draws money directly from your checking account",
            "A type of investment",
            "A savings account"
        ],
        correctIndex: 1,
        explanation: "A debit card is a payment card that draws money directly from your checking account when you make a purchase."
    },
    {
        id: 46,
        topicId: 1,
        subLevelId: 1.32,
        question: "🏦 What is an ATM?",
        options: [
            "A type of investment",
            "An automated teller machine for banking transactions",
            "A type of loan",
            "A savings account"
        ],
        correctIndex: 1,
        explanation: "An ATM (Automated Teller Machine) is a machine that allows you to perform banking transactions like withdrawing cash, depositing checks, and checking your balance."
    },
    {
        id: 47,
        topicId: 1,
        subLevelId: 1.33,
        question: "📊 What is a stock market crash?",
        options: [
            "A temporary market closure",
            "A sudden and significant drop in stock prices",
            "A new type of investment",
            "A banking holiday"
        ],
        correctIndex: 1,
        explanation: "A stock market crash is a sudden and significant drop in stock prices across a major section of the stock market."
    },
    {
        id: 48,
        topicId: 1,
        subLevelId: 1.34,
        question: "💼 What is a business plan?",
        options: [
            "A type of investment",
            "A written document describing a business's goals and strategies",
            "A tax document",
            "A loan application"
        ],
        correctIndex: 1,
        explanation: "A business plan is a written document that outlines a business's goals, strategies, and financial projections."
    },
    {
        id: 49,
        topicId: 1,
        subLevelId: 1.35,
        question: "🏦 What is a credit union?",
        options: [
            "A type of investment fund",
            "A member-owned financial cooperative",
            "A government bank",
            "A type of insurance"
        ],
        correctIndex: 1,
        explanation: "A credit union is a member-owned financial cooperative that provides banking services to its members."
    },
    {
        id: 50,
        topicId: 1,
        subLevelId: 1.36,
        question: "📈 What is market volatility?",
        options: [
            "A type of investment",
            "The degree of variation in trading prices",
            "A banking fee",
            "A tax rate"
        ],
        correctIndex: 1,
        explanation: "Market volatility refers to the degree of variation in trading prices over time."
    },
    {
        id: 51,
        topicId: 1,
        subLevelId: 1.37,
        question: "💳 What is a balance transfer?",
        options: [
            "A type of investment",
            "Moving debt from one credit card to another",
            "A banking fee",
            "A tax deduction"
        ],
        correctIndex: 1,
        explanation: "A balance transfer is moving debt from one credit card to another, often to take advantage of lower interest rates."
    },
    {
        id: 52,
        topicId: 1,
        subLevelId: 1.38,
        question: "🏠 What is a home equity loan?",
        options: [
            "A type of investment",
            "A loan using your home's value as collateral",
            "A government grant",
            "A type of insurance"
        ],
        correctIndex: 1,
        explanation: "A home equity loan is a loan that uses your home's value as collateral, allowing you to borrow against your home's equity."
    },
    {
        id: 53,
        topicId: 1,
        subLevelId: 1.39,
        question: "📊 What is a market index fund?",
        options: [
            "A type of loan",
            "A mutual fund that tracks a market index",
            "A savings account",
            "A type of insurance"
        ],
        correctIndex: 1,
        explanation: "A market index fund is a type of mutual fund that tracks a specific market index, offering broad market exposure."
    },
    {
        id: 54,
        topicId: 1,
        subLevelId: 1.40,
        question: "💼 What is a prospectus?",
        options: [
            "A type of investment",
            "A legal document describing investment details",
            "A tax form",
            "A loan agreement"
        ],
        correctIndex: 1,
        explanation: "A prospectus is a legal document that provides details about an investment offering."
    },
    {
        id: 55,
        topicId: 1,
        subLevelId: 1.41,
        question: "🏦 What is a certificate of deposit (CD)?",
        options: [
            "A type of loan",
            "A time deposit with a fixed term",
            "A type of insurance",
            "A tax document"
        ],
        correctIndex: 1,
        explanation: "A CD is a time deposit with a fixed term and interest rate, typically offering higher returns than regular savings accounts."
    },
    {
        id: 56,
        topicId: 1,
        subLevelId: 1.42,
        question: "📈 What is a stock split?",
        options: [
            "A type of investment",
            "Dividing existing shares into multiple shares",
            "A banking fee",
            "A tax rate"
        ],
        correctIndex: 1,
        explanation: "A stock split is when a company divides its existing shares into multiple shares, making them more affordable."
    },
    {
        id: 57,
        topicId: 1,
        subLevelId: 1.43,
        question: "💳 What is a credit report?",
        options: [
            "A type of investment",
            "A detailed record of your credit history",
            "A tax document",
            "A loan application"
        ],
        correctIndex: 1,
        explanation: "A credit report is a detailed record of your credit history, including loans, credit cards, and payment history."
    },
    {
        id: 58,
        topicId: 1,
        subLevelId: 1.44,
        question: "🏠 What is property tax?",
        options: [
            "A type of investment",
            "Tax levied on real estate",
            "A banking fee",
            "A type of insurance"
        ],
        correctIndex: 1,
        explanation: "Property tax is a tax levied on real estate by local governments, based on the property's value."
    },
    {
        id: 59,
        topicId: 1,
        subLevelId: 1.45,
        question: "📊 What is a market order?",
        options: [
            "A type of investment",
            "An order to buy or sell immediately at current price",
            "A banking fee",
            "A tax rate"
        ],
        correctIndex: 1,
        explanation: "A market order is an order to buy or sell a security immediately at the current market price."
    },
    {
        id: 60,
        topicId: 1,
        subLevelId: 1.46,
        question: "💼 What is a fiduciary?",
        options: [
            "A type of investment",
            "Someone legally obligated to act in your best interest",
            "A tax form",
            "A loan agreement"
        ],
        correctIndex: 1,
        explanation: "A fiduciary is someone who is legally obligated to act in your best interest when managing your money."
    },
    {
        id: 61,
        topicId: 1,
        subLevelId: 1.47,
        question: "🏦 What is a wire transfer?",
        options: [
            "A type of investment",
            "Electronic transfer of money between banks",
            "A type of insurance",
            "A tax document"
        ],
        correctIndex: 1,
        explanation: "A wire transfer is an electronic transfer of money between banks or financial institutions."
    },
    {
        id: 62,
        topicId: 1,
        subLevelId: 1.48,
        question: "📈 What is a stop order?",
        options: [
            "A type of investment",
            "An order to buy or sell at a specific price",
            "A banking fee",
            "A tax rate"
        ],
        correctIndex: 1,
        explanation: "A stop order is an order to buy or sell a security when it reaches a specific price."
    },
    {
        id: 63,
        topicId: 1,
        subLevelId: 1.49,
        question: "💳 What is a grace period?",
        options: [
            "A type of investment",
            "Time allowed to make a payment without penalty",
            "A tax document",
            "A loan application"
        ],
        correctIndex: 1,
        explanation: "A grace period is the time allowed to make a payment without incurring penalties or interest."
    },
    {
        id: 64,
        topicId: 1,
        subLevelId: 1.50,
        question: "🏠 What is a foreclosure?",
        options: [
            "A type of investment",
            "Legal process of taking possession of property",
            "A banking fee",
            "A type of insurance"
        ],
        correctIndex: 1,
        explanation: "A foreclosure is the legal process by which a lender takes possession of property when the borrower fails to make payments."
    },
    {
        id: 65,
        topicId: 1,
        subLevelId: 1.51,
        question: "📊 What is a market maker?",
        options: [
            "A type of investment",
            "A firm that buys and sells securities",
            "A banking fee",
            "A tax rate"
        ],
        correctIndex: 1,
        explanation: "A market maker is a firm that buys and sells securities to maintain market liquidity."
    },
    {
        id: 66,
        topicId: 1,
        subLevelId: 1.52,
        question: "💼 What is a prospectus?",
        options: [
            "A type of investment",
            "A legal document describing investment details",
            "A tax form",
            "A loan agreement"
        ],
        correctIndex: 1,
        explanation: "A prospectus is a legal document that provides details about an investment offering."
    },
    {
        id: 67,
        topicId: 1,
        subLevelId: 1.53,
        question: "🏦 What is a routing number?",
        options: [
            "A type of investment",
            "A bank's unique identification number",
            "A type of insurance",
            "A tax document"
        ],
        correctIndex: 1,
        explanation: "A routing number is a unique identification number assigned to a bank for processing transactions."
    },
    {
        id: 68,
        topicId: 1,
        subLevelId: 1.54,
        question: "📈 What is a limit order?",
        options: [
            "A type of investment",
            "An order to buy or sell at a specific price",
            "A banking fee",
            "A tax rate"
        ],
        correctIndex: 1,
        explanation: "A limit order is an order to buy or sell a security at a specific price or better."
    },
    {
        id: 69,
        topicId: 1,
        subLevelId: 1.55,
        question: "💳 What is a credit limit?",
        options: [
            "A type of investment",
            "Maximum amount you can borrow",
            "A tax document",
            "A loan application"
        ],
        correctIndex: 1,
        explanation: "A credit limit is the maximum amount of money you can borrow on a credit card or line of credit."
    },
    {
        id: 70,
        topicId: 1,
        subLevelId: 1.56,
        question: "🏠 What is a deed?",
        options: [
            "A type of investment",
            "Legal document proving property ownership",
            "A banking fee",
            "A type of insurance"
        ],
        correctIndex: 1,
        explanation: "A deed is a legal document that proves ownership of real estate property."
    },
    {
        id: 71,
        topicId: 1,
        subLevelId: 1.57,
        question: "📊 What is a market cap?",
        options: [
            "A type of investment",
            "Total value of a company's shares",
            "A banking fee",
            "A tax rate"
        ],
        correctIndex: 1,
        explanation: "Market cap (market capitalization) is the total value of a company's shares of stock."
    },
    {
        id: 72,
        topicId: 1,
        subLevelId: 1.58,
        question: "💼 What is a power of attorney?",
        options: [
            "A type of investment",
            "Legal authority to act on someone's behalf",
            "A tax form",
            "A loan agreement"
        ],
        correctIndex: 1,
        explanation: "A power of attorney is a legal document giving someone authority to act on your behalf."
    },
    {
        id: 73,
        topicId: 1,
        subLevelId: 1.59,
        question: "🏦 What is a savings bond?",
        options: [
            "A type of loan",
            "A government-issued debt security",
            "A type of insurance",
            "A tax document"
        ],
        correctIndex: 1,
        explanation: "A savings bond is a government-issued debt security that pays interest over time."
    },
    {
        id: 74,
        topicId: 1,
        subLevelId: 1.60,
        question: "📈 What is a short sale?",
        options: [
            "A type of investment",
            "Selling borrowed securities",
            "A banking fee",
            "A tax rate"
        ],
        correctIndex: 1,
        explanation: "A short sale is selling borrowed securities in hopes of buying them back at a lower price."
    },
    {
        id: 75,
        topicId: 1,
        subLevelId: 1.61,
        question: "💳 What is a credit freeze?",
        options: [
            "A type of investment",
            "Restricting access to credit reports",
            "A tax document",
            "A loan application"
        ],
        correctIndex: 1,
        explanation: "A credit freeze restricts access to your credit reports to prevent identity theft."
    },
    {
        id: 76,
        topicId: 1,
        subLevelId: 1.62,
        question: "🏠 What is a property lien?",
        options: [
            "A type of investment",
            "Legal claim on property for debt",
            "A banking fee",
            "A type of insurance"
        ],
        correctIndex: 1,
        explanation: "A property lien is a legal claim on property to secure payment of a debt."
    },
    {
        id: 77,
        topicId: 1,
        subLevelId: 1.63,
        question: "📊 What is a market correction?",
        options: [
            "A type of investment",
            "A decline in market prices",
            "A banking fee",
            "A tax rate"
        ],
        correctIndex: 1,
        explanation: "A market correction is a decline in market prices of at least 10% from recent highs."
    },
    {
        id: 78,
        topicId: 1,
        subLevelId: 1.64,
        question: "🏠 What is a trust?",
        options: [
            "A type of investment",
            "Legal arrangement for asset management",
            "A tax form",
            "A loan agreement"
        ],
        correctIndex: 1,
        explanation: "A trust is a legal arrangement where one party holds property for the benefit of another."
    },
    {
        id: 79,
        topicId: 1,
        subLevelId: 1.65,
        question: "🏦 What is a money market account?",
        options: [
            "A type of loan",
            "A type of interest-bearing account",
            "A type of insurance",
            "A tax document"
        ],
        correctIndex: 1,
        explanation: "A money market account is an interest-bearing account at a bank or credit union."
    },
    {
        id: 80,
        topicId: 1,
        subLevelId: 1.66,
        question: "📈 What is a stock option?",
        options: [
            "A type of investment",
            "Right to buy or sell stock at a price",
            "A banking fee",
            "A tax rate"
        ],
        correctIndex: 1,
        explanation: "A stock option is the right to buy or sell stock at a specific price within a set time period."
    },
    {
        id: 81,
        topicId: 1,
        subLevelId: 1.67,
        question: "💳 What is a credit score?",
        options: [
            "A type of investment",
            "Numerical rating of creditworthiness",
            "A tax document",
            "A loan application"
        ],
        correctIndex: 1,
        explanation: "A credit score is a numerical rating that represents your creditworthiness."
    },
    {
        id: 82,
        topicId: 1,
        subLevelId: 1.68,
        question: "🏠 What is a property appraisal?",
        options: [
            "A type of investment",
            "Professional property value assessment",
            "A banking fee",
            "A type of insurance"
        ],
        correctIndex: 1,
        explanation: "A property appraisal is a professional assessment of a property's value."
    },
    {
        id: 83,
        topicId: 1,
        subLevelId: 1.69,
        question: "📊 What is a market rally?",
        options: [
            "A type of investment",
            "A sustained increase in market prices",
            "A banking fee",
            "A tax rate"
        ],
        correctIndex: 1,
        explanation: "A market rally is a sustained increase in market prices."
    },
    {
        id: 84,
        topicId: 1,
        subLevelId: 1.70,
        question: "💼 What is a will?",
        options: [
            "A type of investment",
            "Legal document for asset distribution",
            "A tax form",
            "A loan agreement"
        ],
        correctIndex: 1,
        explanation: "A will is a legal document that specifies how your assets should be distributed after death."
    },
    {
        id: 85,
        topicId: 1,
        subLevelId: 1.71,
        question: "🏦 What is a checking account?",
        options: [
            "A type of loan",
            "A bank account for daily transactions",
            "A type of insurance",
            "A tax document"
        ],
        correctIndex: 1,
        explanation: "A checking account is a bank account designed for daily transactions."
    },
    {
        id: 86,
        topicId: 1,
        subLevelId: 1.72,
        question: "📈 What is a dividend yield?",
        options: [
            "A type of investment",
            "Annual dividend as percentage of stock price",
            "A banking fee",
            "A tax rate"
        ],
        correctIndex: 1,
        explanation: "Dividend yield is the annual dividend payment as a percentage of the stock's price."
    }
];

// Log to confirm questions are loaded
console.log('Questions loaded:', window.questions.length);

// Function to shuffle the questions array
window.shuffleQuestions = function() {
    // Create a copy of the questions array to shuffle
    const shuffled = [...window.questions];
    
    // Fisher-Yates shuffle algorithm
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled;
};

// Export the questions data
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.questions;
} 