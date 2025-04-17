# TheMoneyOlympics

A financial literacy learning app that helps users learn financial concepts through interactive gameplay, similar to Duolingo but for finance.

## Features

- **Black and White Gradient Background**: Eye-appealing, neutral visual effect with dynamic gradient animations.
- **Money-Related Color Scheme**: Aesthetic utilizing black, green, gold, and silver to create a financial theme.
- **Interactive Animations**: Engaging animations when answering questions correctly or incorrectly.
- **Streak Tracking**: System to track consecutive correct answers to encourage daily practice.
- **Confetti Effects & Animated Feedback**: Celebration effects to reward correct answers and keep users motivated.
- **Blur Effects**: Applied to inactive elements to direct user focus.
- **Progress Bar**: Updates after every four correct answers to show advancement through a lesson.
- **Smart Question Retry Mechanism**: Questions answered incorrectly are automatically scheduled to appear again later for better retention.
- **Expanded Financial Questions Bank**: Extensive set of financial literacy questions with emojis for enhanced engagement.
- **Centered Feedback**: Feedback appears in the center of the screen for immediate visibility.
- **Emoji Integration**: Fun emojis throughout the app to boost user engagement and create a more personable experience.

## Technical Implementation

The app is built using:
- HTML5 for structure
- CSS3 for styling with animations and effects
- JavaScript for interactivity and game logic
- LocalStorage for persistent streak tracking

External libraries:
- FontAwesome for icons
- Canvas Confetti for celebration effects

## How to Run

Simply open the `index.html` file in your web browser to start using the app. No server is required as it's a client-side application.

## Usage

1. Answer financial literacy questions by selecting one of the provided options.
2. Receive instant feedback in a centered modal with animations and explanations.
3. Build a streak by answering questions correctly and visiting daily.
4. Complete lessons by answering four questions correctly.
5. Learn from mistakes as incorrectly answered questions will reappear for reinforcement.

## Customization

You can easily customize the app by:
- Adding more questions to the `questions.js` file
- Modifying the styling in `styles.css` 
- Adjusting animations in `animations.js`
- Changing game parameters in `app.js`

## Future Enhancements

Potential improvements for future versions:
- Add user accounts and cloud synchronization
- Implement difficulty levels
- Add more interactive elements and mini-games
- Create a mobile app version
- Expand question database with categories
- Add social sharing capabilities for achievements 