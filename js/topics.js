// Topics data for Financial Literacy App
console.log('Topics.js loaded successfully');

window.topicsData = [
    { 
        id: 1, 
        title: "Basic Banking", 
        icon: "🏦",
        subLevels: [
            { 
                id: 1.1, 
                title: "Account Types", 
                xpRequired: 0,
                overview: "Understanding different bank accounts is crucial for managing your money effectively. Learn about checking, savings, and other account types to make informed decisions about where to keep your money.",
                xpReward: 10
            },
            { 
                id: 1.2, 
                title: "Banking Services", 
                xpRequired: 35,
                overview: "Discover essential banking services like loans, credit cards, and wire transfers. These services can help you manage your finances and achieve your financial goals.",
                xpReward: 10
            },
            { 
                id: 1.3, 
                title: "Online Banking", 
                xpRequired: 85,
                overview: "Master the convenience and security of online banking. Learn how to safely manage your accounts, pay bills, and transfer money in the digital age.",
                xpReward: 10
            },
            { 
                id: 1.4, 
                title: "Final Exam", 
                xpRequired: 135, 
                isExam: true,
                overview: "Test your knowledge of basic banking concepts. This exam will help ensure you're ready to move on to more advanced financial topics.",
                xpReward: 40
            }
        ]
    },
    { 
        id: 2, 
        title: "Saving Basics", 
        icon: "💰",
        subLevels: [
            { 
                id: 2.1, 
                title: "Savings Goals", 
                xpRequired: 185,
                overview: "Learn how to set and achieve meaningful savings goals. Understanding goal-setting is the first step towards building a secure financial future.",
                xpReward: 10
            },
            { 
                id: 2.2, 
                title: "Interest Rates", 
                xpRequired: 235,
                overview: "Understanding interest rates is crucial for making your money work harder. Learn how interest affects your savings and how to find the best rates.",
                xpReward: 10
            },
            { 
                id: 2.3, 
                title: "Emergency Funds", 
                xpRequired: 285,
                overview: "Build a safety net for life's unexpected events. Learn why emergency funds are essential and how to build one that works for you.",
                xpReward: 10
            },
            { 
                id: 2.4, 
                title: "Final Exam", 
                xpRequired: 335, 
                isExam: true,
                overview: "Demonstrate your understanding of saving fundamentals. This exam will help ensure you're ready to tackle more complex financial concepts.",
                xpReward: 40
            }
        ]
    },
    { 
        id: 3, 
        title: "Budgeting 101", 
        icon: "📊",
        subLevels: [
            { 
                id: 3.1, 
                title: "Income & Expenses", 
                xpRequired: 385,
                overview: "Master the basics of tracking your money. Learn how to identify and categorize your income and expenses for better financial control.",
                xpReward: 10
            },
            { 
                id: 3.2, 
                title: "Budget Planning", 
                xpRequired: 435,
                overview: "Create a budget that works for your lifestyle. Learn proven strategies for planning and sticking to a budget that helps you achieve your goals.",
                xpReward: 10
            },
            { 
                id: 3.3, 
                title: "Tracking Methods", 
                xpRequired: 485,
                overview: "Discover effective ways to track your spending. From apps to spreadsheets, learn the tools and techniques that make budgeting easier.",
                xpReward: 10
            },
            { 
                id: 3.4, 
                title: "Final Exam", 
                xpRequired: 535, 
                isExam: true,
                overview: "Test your budgeting knowledge. This exam will help ensure you have the skills needed to manage your money effectively.",
                xpReward: 40
            }
        ]
    },
    { 
        id: 4, 
        title: "Investment Basics", 
        icon: "📈",
        subLevels: [
            { 
                id: 4.1, 
                title: "Investment Types", 
                xpRequired: 585,
                overview: "Explore different investment options. Learn about stocks, bonds, and other investment vehicles to build a diversified portfolio.",
                xpReward: 10
            },
            { 
                id: 4.2, 
                title: "Risk Management", 
                xpRequired: 635,
                overview: "Learn how to manage investment risks. Understanding risk is crucial for making informed investment decisions and protecting your money.",
                xpReward: 10
            },
            { 
                id: 4.3, 
                title: "Portfolio Basics", 
                xpRequired: 685,
                overview: "Build a strong foundation for your investment portfolio. Learn the principles of portfolio construction and management.",
                xpReward: 10
            },
            { 
                id: 4.4, 
                title: "Final Exam", 
                xpRequired: 735, 
                isExam: true,
                overview: "Test your investment knowledge. This exam will help ensure you're ready to start investing with confidence.",
                xpReward: 40
            }
        ]
    },
    { 
        id: 5, 
        title: "Advanced Investing", 
        icon: "🎯",
        subLevels: [
            { 
                id: 5.1, 
                title: "Market Analysis", 
                xpRequired: 785,
                overview: "Learn how to analyze financial markets. Understanding market trends and indicators can help you make better investment decisions.",
                xpReward: 10
            },
            { 
                id: 5.2, 
                title: "Advanced Strategies", 
                xpRequired: 835,
                overview: "Master advanced investment strategies. Learn sophisticated techniques for maximizing returns while managing risks.",
                xpReward: 10
            },
            { 
                id: 5.3, 
                title: "Portfolio Management", 
                xpRequired: 885,
                overview: "Develop professional portfolio management skills. Learn how to optimize and rebalance your portfolio for long-term success.",
                xpReward: 10
            },
            { 
                id: 5.4, 
                title: "Final Exam", 
                xpRequired: 985, 
                isExam: true,
                overview: "Demonstrate your advanced investment knowledge. This exam will help ensure you're ready to tackle complex investment scenarios.",
                xpReward: 40
            }
        ]
    }
];

// Export the topics data
if (typeof module !== 'undefined' && module.exports) {
    module.exports = topicsData;
} 