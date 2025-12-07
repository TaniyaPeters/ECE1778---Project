[![Watch the video](https://raw.githubusercontent.com/yourusername/yourrepository/main/assets/thumbnail.jpg)](https://raw.githubusercontent.com/taniyapeters/ECE1778---Project/main/'ECE1778 - Video Demo'.mp4)



# Bespoke
### Team Information
Nilofer Hyder — 1007273807 — nilofer.hyder@mail.utoronto.ca
Jesse Na — 1005890788 — jesse.na@mail.utoronto.ca
Taniya Peterratnaraj — 1003004438 — taniya.peterratnaraj@mail.utoronto.ca
Nagham Sabbour — 1012636079 — n.sabbour@mail.utoronto.ca

## Motivation
Media, be it books, movies, TV shows, etc., are one of the cornerstones of today's world. There is probably not a single person who does not consume at least one type of media, and the majority of us consume multiple forms. Regardless of why or how we consume media, we have the tendency to want to review, save, and share our favourite media with the world, our friends, and our families. By sharing our thoughts on the latest book we read or movie we watched, we are expressing who we are, our interests and values, our likes or dislikes, in hopes of finding points of connection with others.

Currently, there are many review sites for specific media, like Goodreads for books, Rotten Tomatoes for movies, MyAnimeList for anime, etc., but there are no general review hubs for all these different media in one place. As a result, media consumers who want to share their reviews and watchlists with friends have to resort to creating accounts on many separate services making the process tedious. More importantly, people who enjoy keeping track of things they've watched have to come up with their own methods of centralizing their favourite media which often have no way for them to easily share.

We envision an alternative world where consumers can download one app to streamline reviewing, sharing, and tracking the media they consume. This project will enable those of us who enjoy many forms of media to review and share the media we love without barriers, so that we can focus on the media we love and expressing ourselves.

## Objectives
Our goal is to create a centralized application that allows users to share, rate, review, search for, and create collections of a variety of media, such as movies, books or music albums. However, due to time constraints we only implemented movies and books.

## Technical Stack
- React Native for the app
- Typescript for type-safety
- Expo for development and Expo EAS for builds and deployment
- Expo Router for navigation
- Context API for user authentication state storage
- Redux Toolkit for user preferences storage
- Supabase for backend
- TMDB API for movie data
- Open Library API for book data

## Features
### User Accounts
Users have accounts they use to save their media reviews, collections, and friends. Accounts can be made and logged into using email/password or an OAuth provider (Github and Discord). Login sessions are also persistent so a user doesn't have to sign in each time. Without this feature, there is no way for us to save user reviews and media collections. 

The main purpose of this feature is to satisfy one of the two required advanced features. We do so by leveraging Supabase Authentication which ensures that passwords are _never_ stored in app; instead being stored encrypted in the backend. We also use their React Native supabase client to properly handle authentication state and ensure that session tokens are stored securely using Expo Secure Store. 

Another purpose of this feature is to contribute to a variety of core requirements such as React Native development, backend integration, and state management and persistence.
- We made custom components featuring standard React Native components like Pressable, SafeAreaView, View, TextInput, Text, Image, and more. We also used hooks like useState and useEffect. We also used useFocusEffect to check and ensure the user is logged in from any page in the app.
- From the Supabase backend, we fetch user friend lists, account information like username, name, and profile photos; display error messages (e.g. for invalid passwords, duplicate usernames, etc.) handling errors gracefully; and use local search params as part of our query to the profiles API.
- We created a context and provider for the Auth state so that any component in the app can detect whether a user is logged in and access that user's session information and profile.

### Navigation Between Screens
The user can navigate between the four main app screens using the bottom tab navigation: Home, Library, Search and Accounts. 

This feature contributes to meeting the following core requirements:
- **Navigation:** The different screens are made navigable with the use of Expo Navigator file-based routing. The root layout is setup with multiple nested route groups. The highest level route group holds the providers required for the app to run, the Authentication Provider and the Redux Toolkit Provider. The second route group, tabs, initializes the main four screens using Expo Router NativeTabs. The Home Screen, Library Screen and Search Screen are all distinct route groups, these route groups also have a shared route that returns an Expo Router Stack to access the movie details, book details and collection details screens. The account screen is treated as a distinct route and also returns an Expo Router Stack.
![image](https://hackmd.io/_uploads/SJiRS-A-bg.png)
- **React Native and Expo Development:** This requirement is satisfied through the use of the Redux Toolkit's Provider as well as the Expo Router's routing, Native Tabs, and Stacks.

### Home Screen
The user can navigate between three main tabs on the home screen page: Media Recap, Movies and Books. The data for all three tabs can be refreshed on swipe down.

**Media Recap Tab**
- On the Media Recap Tab the user can view their monthly recap for specific types of media. The user can see a separated recap for both their Books and Movies history. The monthly recap components are generated when the page is loaded and the data is fetched from Supabase. The monthly recap component uses typesafe notations to differentiate between Books or Movies. The carousel component generates a horizontal ScrollView that is filled with a FlatList of media to display in the monthly recap component.

**Movies Tab and Books Tab**
- On these tabs, the user can view a scrollable flatlist of media cards dependent on the tab you are on. Each media card contains information like the media name, poster/cover, release date, star rating, number of viewers/readers. These media cards are also pressable and navigate to the details screen for that media, which is described in details below.

This feature contributes to meeting the following core requirements:

- **Navigation:** The top tab navigation used on this screen is implemented through the use of React Navigation's Material Top Tabs which was configured to work with the app's main navigation routing tool: Expo Router.
- **Backend Integration:** On screen load the media recap tab sends a request to supabase for a list of user reviews and media for a media type in a specific date range (previous month), this is used to generate the monthly recap. 
- **React Native and Expo Development:** This feature uses useEffects, Expo Router, React Native Navigation's Material Top Tabs, ScrollView, FlatLists and Views.

### Search Screen
Another app feature is the search screen, which fulfills the objective of allowing users to search for either movies or books by title, to filter by genre, and to sort from newest to oldest or vice versa. The result of the search is shown as a list of media cards which navigate to their respective media details screen when pressed. 

This feature contributes to meeting the following core requirements:
- **React Native development:** Several React Native components are used, such as TextInput for the search bar, Pressable for the search button, TouchableOpacity for the media cards, and FlatList for the list of media cards. We use useState for handling fields such as the search string and selected filter, and useEffect for updating the media list as soon as a filter or sort option is selected. We also use Typescript to enforce the type of the media data retrieved from the database, for example, storing the list of movies retrieved in an array of Movie type elements, which is defined in the database.types.ts file. 
- **Navigation:** We use Expo Router, specifically dynamic [id] routing, to navigate to the  details screen of a particular media item when its card is pressed. 
- **Backend Integration:**  When a search is made or filters are applied, we fetch a list of media and their details (eg. titles, images, ratings, etc.) from the Supabase backend that match the search fields. These details are used to display the media cards. Errors in fetching are handled gracefully and an appropriate message is displayed to the user.

### Details Screen
Each media item has a details screen, the purpose of which is to allow users to view all related information about the media item. For example, for a movie details screen, the user would see the following information: movie title, release year, average rating, number of ratings, poster image, description, genres, cast, and reviews. At the top of the screen, the user is also able to add the media item to any collections. 

This feature contributes to meeting the following core requirements:
- **React Native Development**: Several React Native components are used, such as Image, Text, Pressable, and View. Typescript is used to define a generic media type for books or movies. useState is used to manage the media state as well as other fields, and useEffect is configured to fetch media details from the backend every time the media id has changed.
- **Navigation**: LocalSearchParams is used to access the data passed from the previous screen through dynamic routing, specifically the id of the media item. 
- **Backend Integration**: Upon load or refresh of this screen, all details for this media item are fetched from the backend Supabase database using the media item's id. 

### Ratings and Reviews
At the bottom of the media details page, users can view a list of reviews and ratings left by other users, as well as their own review and rating (if they have created one already). Users may create or edit their review, in which they must enter a rating out of 5 stars and optionally enter a text review comment. This feature fulfills the objective of allowing users to rate and review media. 

This feature contributes to meeting the following core requirements: 
- **React Native Development**: Several React Native components are used in the implementation of this feature, such as a FlatList for displaying all reviews and a custom RatingReviewPopup component that utilizes View, Modal, TextInput, Alert, TouchableOpacity, and Pressable. UseState is used to handle the boolean value of whether the popup should be visible or not. Also, TypeScript is used for the Review type, which is stored in types.ts.
- **Backend Integration**: The Supabase backend is used for fetching the list of reviews existing on the media item, and for inserting or updating the user's review in the reviews table of the database.

### Collections

The user can navigate between two main tabs on the library screen: Movies and Books. These tabs contains a ScrollView of the collections FlatList for that user: a default Watched collection and any additional collections created by the user.

- **Navigation:** The top tab navigation used on this screen is implemented through the use of React Navigation's Material Top Tabs which was configured to work with the app's main navigation routing tool: Expo Router.
- **Collection Card:** Each collection card is a pressable component that redirects the user to the collection details page.
- **Collection Details Page:** This page contains a flatlist of the media cards which are pressable and redirect the user to the respective media item.

This feature contributes to meeting the following core requirement:
**React Native and Expo Development**: Several React Native components are used in the implementation of this feature, such as a FlatList for displaying all the collections and the movies inside each collection. Additionaly the create collection modal and the delete collection warning modal both utilize View, Modal, TextInput, and Pressable. UseState is used to handle many things including the boolean value of whether the popup should be visible or not.

### Notifications
On the first launch of the app the user will be prompted to allow notification permissions for the app. To start receiving notifications the user needs to toggle the "Enable Notifications" React Native Switch in their user account settings and click "Save Changes". Users can receive two different notifications, a timed monthly notification and a push notification if a user they are friends with rates a piece of media 5/5 stars. Clicking on either notification will redirect the user to the relevant page; for monthly notifications  the user is redirected to the media recap page, and for the push notifications the user is redirected to the reviewed media details page. 

This feature contributes to meeting the following  requirements:
- **Notification** and **Advanced Features - Push Notification:** Both these features are satisfied as the user gets sent both a notification and a push notification with Expo Notifications through this feature's implementation.
- **Navigation:** A useEffect hook is located at the RootLayout, it redirects the user if a notification has been clicked. The user is redirected using Expo Router's routing to the media recap page or the relevant reviewed media's page using the media's unique [id] as a param.
- **Backend Integration:** The push notifications are implemented through integration with Supabase, where the app creating the notification sends a message containing a typesafe notification type to the Supabase backend, which responds by sending a push notification with the typesafe notification to all of the user's friends who have notifications enabled. 
- **React Native and Expo Development:** This feature uses the React Native Switch, Expo Router, Expo Notifications, and Typescript typesafe notation to ensure this core requirement is satisfied.

### Media Data Collection from External APIs
To collect media metadata to use within our app (eg. titles, descriptions, images, etc.), we utilized external APIs. This also fulfills our third external feature, Integration with External Services. To collect movies metadata, we used TMDB API and to collect books metadata, we used Open Library API. We wrote scripts for each (located in the scripts folder) that retrieve the data from the external APIs, parse the fields we need, and populate our movies and books tables in our Supabase database. 

### Persistent User Preferences
User app theme and notification preferences are persitent across the app using Redux Toolkit. The notification preferences are created with a React Native Switch. 
- **State Management and Persistence:** The user's notification preference state and the theme of the app is saved and loaded as needed using the Redux Toolkit's useSelector and useDispatch hook in conjunction with the toolkit's Slices. The app's root layout is encased in a redux Provider with the store param, and the preferences are saved in the React Native Async storage.
- **React Native and Expo Development:** This feature uses the React Native Switch, Slices, React Native Async Storage, Redux Toolkit's Providers, Redux Toolkit's hooks (useSelector, useDispatch), and Typescript typesafe notation to ensure this core requirement is satisfied.

## User Guide
Upon launching the app the user will need to create an account or login to view the rest of the pages.

### Feature: User Accounts
To create an account or login, the user can go to the Account tab (the right most tab on the bottom). 

![Screenshot_20251128_152643_Bespoke](https://hackmd.io/_uploads/r1gZIFDWZg.jpg)

If they have an email/password account, they can enter their credentials and press Login. To create an email/password account, they can press Sign Up which will redirect them to the account creation screen. There, they enter their name, username, email, and password, then click Create Account. An alert will pop up asking them to verify their email. Once they click the confirmation link, it will redirect them back to the app (if they opened the email from their phone). They can now login using their credentials.
![Screenshot_20251128_162918_Bespoke](https://hackmd.io/_uploads/rJmCNqDWbx.jpg)

If they have an OAuth provider account, they can click the appropriate button. Their phone browser will open to the provider's authorization page. If they already agreed before, they will be redirected back to the app and automatically signed in. If they are creating an account, they will be asked to provide authorization, and then will be redirected back. Notice their profile photo and username will be the same as the one on their provider. Below is an example of the Discord authorization page:

![Screenshot_20251128_164046_Samsung Internet](https://hackmd.io/_uploads/Hk37wcvWZl.jpg)

Once logged-in, the account page transforms giving a few new options. The user can log out on the top right, edit their account information via the Edit Profile button, and edit their friends by clicking on Friends: (number). 

On the edit profile screen, the user can change their name, username, and toggle notifications. If the user is an email/password account, they can additionally change their email and password (another verification email will be sent). The user must click Save Changes to update their account. 

On the edit friends screen, the user can see a list of their friends usernames and profile photos. They can remove friends by clicking on the minus box to the right of their friend. They can add friends by clicking on the top right icon which will pop up a modal for them to enter their friend's username. After entering a username, they can press the plus button, and if the user exists, they will be added.

![Screenshot_20251128_164916_Bespoke](https://hackmd.io/_uploads/SkkSKqwWbl.jpg)

### Feature: Home Screen
The user can go to the home screen by clicking on the house icon on the bottom navigator. There, they will see tabs at the top for Media Recap, Movies Tab, and the Books Tab.

On the Media Recap tab, the user can scroll and see their monthly recap for movies and books they've watched/read. If the user watched many movies, they can scroll horizontally to cycle through the movies in carousel style. The user can click on a media thumbnail to bring up its media details screen.

On the Movies Tab and Books Tab, the user can see a list of featured movies and books accordingly. The user can vertically scroll through this list, and if the user clicks on a media card, then its media details screen appears.

### Feature: Search
To search for a media, the user goes to the Search screen via the bottom navigator (magnifying glass symbol). Once inside, they user may decide to search for either movies or books using the toggle at the top of the screen. Below it, there is a search bar where they can type in the title of the media they are looking for. Press the Search button to start the search and display the results. To reset the search results, press the x button that now appears in the search field and press the Search button again.

The user can optionally use the Genre dropdown to filter for a specific genre and the Sort dropdown to sort by oldest to newest and vice versa.

The results will be a list of media cards that are pressable. Once they press on one, its media details screen appears.

If the search query does not match any media items in the database, an appropriate message is displayed, for example, "No movies found in the database". 

### Feature: Collections
To create, modify, and view media collections, the user can go to the Library screen via the bottom navigator (the book icon). 

A "Watched" collection is automatically created for every user under the Movies tab and cannot be deleted. Similarly, a "Read" collection is automatically created under the Books tab and connot be deleted. Rating or reviewing any media will automatically add it to the Watched or Read collections depending on the media type. The user can also manually add any media item that they have not rated or reviewed to these collections.

![Screenshot 2025-12-03 at 1.36.22 PM](https://hackmd.io/_uploads/HkpNX-0Zbe.png)
<!-- ![Screenshot_20251201_101129_Bespoke](https://hackmd.io/_uploads/SkZrlViZWx.jpg) -->

To create a new collection, the user can press the New Collection button which pops up a modal. The user must enter a name and then press the Save button. If a collection with that name already exists for the same type of media, an error is displayed to pick a new name. The user can however have 2 separate collections named Action for example as long as they are for different media types.

To view a collection's details, the user can scroll through their list of collections and click on a collection card. A new screen will appear that shows all the media inside that collection. Clicking on a media card will bring up its media details screen.

To delete a collection, the user needs to go back to the Library screen and press the red trash icon. A modal will appear asking the user to confirm their decision.

To remove a media from a collection, the user can click on the red trash icon on the media card next to its name inside the collection details screen.

Another way to add/remove a media to/from a collection is by clicking the + icon from the media card on the home screen. Alternatively the + icon is also available on the media details screen, which the user can get to by clicking on a media card from the Home or Search screens. For example, here is the movie details screen for Marco:

![Screenshot_20251130_175746_Bespoke](https://hackmd.io/_uploads/HJwQ3B9-Wg.jpg)

Beside the year of the media, there is a plus icon which the user can click. A modal will appear allowing the user to see their collections. The user can click on a collection to add/remove the current media. The user can do this for multiple collections. If the background colour appears grey then the media is not in the collection and if it appears light blue, it is in the collection. The user must press the Update button to save their changes.

![Screenshot 2025-12-06 at 9.43.49 AM](https://hackmd.io/_uploads/r1P4Wa-fZl.png)

### Feature: Ratings and Reviews
Again, once a user is on a media details screen by clicking on a media card, they can add a review.

The user can scroll down where they will see a reviews section, which is where they can click on the Add Review button. The user must enter at least click on a number of stars and optionally leave a comment. Once finished, they can click submit and the review will be saved for other users to see.

![Screenshot_20251130_180101_Bespoke](https://hackmd.io/_uploads/Byd0hSq--g.jpg)

### Feature: Notifications
To see app notifications, the user must first allow notification privileges from the app. The first time the app launches the user will be prompted to allow notifications. The user can then navigate to Account > Edit Account and toggle the "Enable Notifications" switch and click "Save Changes" to enable notifications in app:
![image](https://hackmd.io/_uploads/HJarCRTZ-x.png)

If the user declines the permission the first time they are prompted, then trying to toggle the "Enable Notifications" switch will prompt the user for permissions again. Upon declining permissions once more, the user will then see an Alert to enable app permissions in the app settings.
| Permissions Prompt | Permissions Alert |
| -------- | -------- |
| ![image](https://hackmd.io/_uploads/Sk11kyCW-l.png)| ![image](https://hackmd.io/_uploads/By50ACpb-x.png)|

Once permission is granted the user will receive two different notifications.

- **Push Notification:** The push notification is sent to the user whenever a friend has rated a piece of media 5/5 stars. This notification will include the username of the friend and the movie they reviewed. Clicking on the notification will redirect the user to the piece of media that was rated.
- **Monthly Recap Notification:** This notification is sent to the user at the start of each month to let them know that their monthly statistics are ready to be reviewed. Clicking on this notification will redirect the user to the Media Recap Tab located on the Home Screen. 

| Monthly Notification | Push Notification |
| -------- | -------- |
|![image](https://hackmd.io/_uploads/SkaPSBAWZe.png)|![fivestart](https://hackmd.io/_uploads/Sy9QrSA-bx.jpg)|

### Feature: Themes
To toggle between Light and Dark Theme the user can click on the sun or moon icon displayed at the top right corner of the app. The theme change will be automatically updated and saved.

| Light Theme | Dark Theme |
| -------- | -------- |
| ![image](https://hackmd.io/_uploads/S1-3NxRb-g.png)|![image](https://hackmd.io/_uploads/BkIjEgC-Wx.png)|

## Development Guide
### Prerequisites
- Have node.js version at least 22.19.00
### Setup
To setup the local environment, download the repository and cd into the `ece1778-app` folder.
1. First, run `npm install` to install all packages and dependencies
2. Next, create a `.env` file in the main `ece1778-app` folder. Credentials sent to TA.
3. Also, download and place the `ece1778-project-47b62-firebase-adminsdk-fbsvc-771ff60c2b` file in the main `ece1778-app` folder. File is sent to TA.
4. Then run `npx expo start`
    - If you want to pass the `--tunnel` flag, simply install ngrok with the following: `npx expo install @expo/ngrok^4.1.0`
5. Switch to the Expo Go build if you are not already on it.
6. Open up the Expo Go App on your mobile device and connect via the QR code or Link. Alternatively, follow Expo's displayed instructions to use an Android/iOS simulator.

**Note:** Push Notifications will not work in this mode, to allow the use of push notifications use the development build.

**Note:** Running without the `--tunnel` flag will cause OAuth provider authentication to fail, to login create a user manually or enable tunnelling to use OAuth authentication.

## Deployment Information
This app is deployed with Expo Application Services (eas) through an apk file located here: https://expo.dev/accounts/tpeterra/projects/ece1778-app/builds/5913705b-9c4a-4b49-8d6b-cb9032b7d1a5. 

Click on the link to download the apk and install the file onto a physical device. Downloading and installing the APK from the provides link will allow the user access to all app features.

**Note:** The app is not being deployed on Apple due to licensing fees associated with getting ios development credentials. Android development credentials are provided through Google's Fire Cloud Messaging (FCM) services. 

## Individual Contributions
- Jesse was responsible for configuring and integrating Supabase into the app and implementing anything mentioned in the User Accounts feature section.
- Nilofer was responsible for implementing the media details screen including creating and updating reviews/ratings, performing data collection for movies and books from external APIs, and implementing the search screen.
- Taniya was responsible for implementing notifications and push notifications through expo and supabase, setting up the development build, creating the redux toolkit and storing user preferences, and implementing navigation between screens using top and bottom tabs.
- Nagham was responsible for implementing the Library screen, the collection details screen, the reusable media card component, the collections' features (like adding/deleting media from the collections on different pages), and the dark theme.

## Lessons Learned and Concluding Remarks
This project was a rewarding experience that allowed us to practice our collaboration skills and showed us the utility of the concepts and tools we learned in class.

In terms of collaboration, we learned the importance of clear and regular communication within the team. Having regular weekly meetings to check in on progress, assign responsibilities, and discuss issues allowed for a smooth project experience with minimal confusions and delays. For some of us, this approach contrasted heavily to teams in other courses making the lesson all the more significant.

We also learned the importance of incremental development and testing. We implemented and tested different features in different branches and after merging each branch into main, we again tested the app to check that no new issues were introduced before merging another branch in. This approach ensured we were able to identify and fix issues as they came up rather than integrating everything and dealing with several issues at once.

In terms of concepts and tools, Expo Router and Supabase were standouts. Before this class, we didn't have experience with either. Without learning about Expo Router in class, we would've defaulted to React Navigation and missed out on how easy and sensical Expo Router makes navigation. Similarly, without learning about Supabase, we would've defaulted to Firebase. Supabase was so easy to set up, configure the table schemas, and more, and had wonderful features like the database schema visualizer. Its React Native client was great to work with and made connecting to the backend super easy. Some of its documentation, while looking pretty, could use work but for the most part it was great.

Overall, this project and course was a great experience, and we will look back on it as an exemplar for our future work.
